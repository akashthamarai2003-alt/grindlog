import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import {
  FITNESS_PLAN_MODEL,
  generateOpenAIResponseJSON,
} from "@/lib/services/openai/client";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import {
  buildFitnessPlanJsonSchema,
  GeneratedPlanSchema,
  GeneratedPlanData,
} from "@/lib/fitness/ai/schemas";
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  FITNESS_PLAN_PRESENTATION_RULE,
  buildFitnessPlanPrompt,
} from "@/lib/fitness/ai/prompts";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { validatePlanAgainstProfile } from "@/lib/fitness/validation/fitness-plan-profile";
import { enrichPlanWithFoodLibrary } from "@/lib/fitness/validation/fitness-food-library";
import {
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";

export const maxDuration = 60;
const MAX_AUTOMATIC_GENERATION_ATTEMPTS = 1;

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // 2. Prevent duplicate active plans
    const { data: existingPlan } = await supabase
      .from("fitness_os_workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingPlan) {
      return NextResponse.json(
        { success: false, error: "An active plan already exists. Return to dashboard." },
        { status: 400 },
      );
    }

    // 3. Rate Limit
    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Fitness AI limit reached for today. Please try again tomorrow.",
        },
        { status: 429 },
      );
    }

    // 4. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 },
      );
    }

    // 4.5 Fetch latest Gemini Body Scan (if any)
    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // 5. Call AI Server-Side
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: foodCatalog } = await supabase
      .from("foods")
      .select("name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
      .eq("is_active", true)
      .eq("plan_eligible", true)
      .limit(250);
    const userPrompt = buildFitnessPlanPrompt(
      profile,
      todayStr,
      scan?.gemini_analysis,
      foodCatalog || [],
    );
    const painSeverity = Number(profile.current_pain_severity);
    const exactWorkoutCount =
      typeof profile.training_days_per_week === "number"
        ? painSeverity >= 7
          ? 0
          : profile.training_days_per_week
        : undefined;
    const planJsonSchema = buildFitnessPlanJsonSchema(exactWorkoutCount);

    const retryAfterSeconds = await getGenerationRetryAfterSeconds(
      supabase,
      user.id,
      "plan_generation_attempt",
    );
    if (retryAfterSeconds > 0) {
      console.log(`Plan generation already in progress for user ${user.id}. Polling for completion...`);
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const { data: latestPlan } = await supabase
          .from("fitness_os_workout_plans")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();

        if (latestPlan) {
          console.log(`Polling found newly active plan ${latestPlan.id} for user ${user.id}.`);
          return NextResponse.json({ success: true, data: { planId: latestPlan.id } });
        }
      }
      return NextResponse.json(
        {
          success: false,
          error: "A plan generation is already in progress and taking longer than expected. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    await recordGenerationAttempt(
      supabase,
      user.id,
      "plan_generation_attempt",
      FITNESS_PLAN_MODEL,
    );

    let planData: GeneratedPlanData | null = null;
    let lastErrorMessage = "We couldn't build your plan right now.";

    // One paid generation per user action. The user can retry intentionally
    // instead of the server silently consuming three requests.
    for (let attempt = 1; attempt <= MAX_AUTOMATIC_GENERATION_ATTEMPTS; attempt++) {
      try {
        console.log(`Fitness AI Generation Attempt ${attempt}...`);
        const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
          systemPrompt: `${FITNESS_PLAN_SYSTEM_PROMPT}\n\n${FITNESS_PLAN_PRESENTATION_RULE}`,
          userPrompt,
          model: FITNESS_PLAN_MODEL,
          // This route is also synchronous; Medium balances plan quality and
          // common 60-second serverless limits. Validation remains mandatory.
          maxTokens: 10000,
          minimumOutputTokens: 10000,
          reasoningEffort: "medium",
          promptCacheKey: "fitness-plan-v3",
          temperature: 0.3,
          jsonSchema: {
            name: "fitness_plan",
            schema: planJsonSchema,
            description: "A complete personalized 7-day Grindlog fitness plan.",
            strict: true,
          },
          verbosity: "low",
        });

        // 6. Validate AI JSON
        const parsed = GeneratedPlanSchema.safeParse(aiResponse);
        if (!parsed.success) {
          console.warn(`Attempt ${attempt} Zod validation failed:`, parsed.error);
          lastErrorMessage = "Failed to parse AI output.";
          continue;
        }

        const candidatePlan = parsed.data;

        // 7. Safety Validation
        const safetyCheck = runFitnessAISafetyCheck(candidatePlan, profile);
        if (!safetyCheck.safe) {
          console.warn(`Attempt ${attempt} Safety check failed:`, safetyCheck.reason);
          lastErrorMessage =
            safetyCheck.reason || "Generated plan violated safety checks.";
          continue;
        }

        const profileCheck = validatePlanAgainstProfile(candidatePlan, profile, {
          enforceProfileRules: true,
          enforceBudgetUtilisation: false,
        });
        if (!profileCheck.valid) {
          console.warn(`Attempt ${attempt} profile validation failed:`, profileCheck.issues);
          lastErrorMessage = `The generated plan did not match the saved profile: ${profileCheck.issues.join("; ")}`;
          continue;
        }

        planData = enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []);
        break; // Success!
      } catch (err: any) {
        console.error(`Attempt ${attempt} caught error:`, err);
        lastErrorMessage = err.message || "Network or API error.";
      }
    }

    if (!planData) {
      return NextResponse.json(
        { success: false, error: lastErrorMessage },
        { status: 400 },
      );
    }

    // 8. Atomic Database Transaction via RPC
    const { data: planId, error: rpcError } = await supabase.rpc(
      "create_fitness_os_plan_transaction",
      {
        payload: planData,
      },
    );

    if (rpcError || !planId) {
      console.error("Fitness AI Transaction failed:", rpcError);
      return NextResponse.json(
        { success: false, error: "Failed to save the generated plan." },
        { status: 500 },
      );
    }

    // 9. Log Usage
    await logFitnessAIUsage(
      user.id,
      "plan_generation",
      userPrompt,
      JSON.stringify(planData),
      FITNESS_PLAN_MODEL,
      0,
    );

    return NextResponse.json({ success: true, data: { planId } });
  } catch (error: any) {
    console.error("Fitness AI Generation Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't build your plan right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
