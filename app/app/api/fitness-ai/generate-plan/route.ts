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
  FITNESS_PLAN_PRESENTATION_RULE,
  buildFitnessPlanPrompt,
  buildFitnessPlanSystemPrompt,
} from "@/lib/fitness/ai/prompts";
import { autoRepairPlanSafety, runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { validatePlanAgainstProfile } from "@/lib/fitness/validation/fitness-plan-profile";
import { enrichPlanWithFoodLibrary } from "@/lib/fitness/validation/fitness-food-library";
import {
  clearGenerationAttempt,
  clearUserGenerationAttempts,
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";
import { getFitnessPlan, requireFitnessSubscription } from "@/lib/fitness/subscription/access";
import { applyFitnessPlanEntitlements } from "@/lib/fitness/subscription/plan-entitlements";

export const maxDuration = 180;
const MAX_AUTOMATIC_GENERATION_ATTEMPTS = 2;

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

    let isRetry = false;
    try {
      const body = await req.json().catch(() => null);
      if (body && typeof body === "object" && body.retry === true) {
        isRetry = true;
      }
    } catch {
      // Body may be empty
    }
    if (req.headers.get("x-retry") === "true") {
      isRetry = true;
    }

    if (isRetry) {
      console.log(`Explicit retry in generate-plan for user ${user.id}. Clearing pending locks.`);
      await clearUserGenerationAttempts(supabase, user.id, "plan_generation_attempt");
    }

    // Never spend AI tokens for an unpaid plan request, including direct API
    // calls that bypass the payment page.
    if (!(await requireFitnessSubscription(user.id))) {
      return NextResponse.json(
        { success: false, error: "Please complete payment before generating your Fitness plan.", errorType: "PAYMENT_REQUIRED" },
        { status: 402 },
      );
    }
    const subscriptionPlan = await getFitnessPlan(user.id);
    if (!subscriptionPlan) {
      return NextResponse.json(
        { success: false, error: "Please complete payment before generating your Fitness plan.", errorType: "PAYMENT_REQUIRED" },
        { status: 402 },
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
    let foodCatalog: any[] = [];
    if (subscriptionPlan.id === "pro") {
      const { data } = await supabase
        .from("foods")
        .select("name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
        .eq("is_active", true)
        .eq("plan_eligible", true)
        .limit(250);
      foodCatalog = data || [];
    }
    const userPrompt = buildFitnessPlanPrompt(
      profile,
      todayStr,
      scan?.gemini_analysis,
      foodCatalog,
    );
    const painSeverity = Number(profile.current_pain_severity);
    const exactWorkoutCount =
      typeof profile.training_days_per_week === "number"
        ? painSeverity >= 7
          ? 0
          : profile.training_days_per_week
        : undefined;
    const planJsonSchema = buildFitnessPlanJsonSchema(exactWorkoutCount, subscriptionPlan.id);

    if (!isRetry) {
      const retryAfterSeconds = await getGenerationRetryAfterSeconds(
        supabase,
        user.id,
        "plan_generation_attempt",
      );
      if (retryAfterSeconds > 0) {
        console.log(`Plan generation already in progress for user ${user.id}. Polling for completion...`);
        for (let i = 0; i < 6; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
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
        // If polling timed out after 15 seconds, clear stale attempt and generate
        console.log(`Polling timed out for user ${user.id}. Clearing stale attempt and generating fresh plan...`);
        await clearUserGenerationAttempts(supabase, user.id, "plan_generation_attempt");
      }
    }

    let attemptId: string | null = null;
    let planData: GeneratedPlanData | null = null;
    let lastErrorMessage = "We couldn't build your plan right now.";
    let correctionNote = "";

    try {
      attemptId = await recordGenerationAttempt(
        supabase,
        user.id,
        "plan_generation_attempt",
        FITNESS_PLAN_MODEL,
      );

      for (let attempt = 1; attempt <= MAX_AUTOMATIC_GENERATION_ATTEMPTS; attempt++) {
        try {
          console.log(`Fitness AI Generation Attempt ${attempt}...`);
          const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
            systemPrompt: `${buildFitnessPlanSystemPrompt(subscriptionPlan.id)}\n\n${subscriptionPlan.id === "pro" ? FITNESS_PLAN_PRESENTATION_RULE : "CORE PRESENTATION RULE: Return calorie and protein targets only; keep carbs_grams and fat_grams null, with empty meals and grocery_list arrays."}`,
            userPrompt: correctionNote ? `${userPrompt}\n\n${correctionNote}` : userPrompt,
            model: FITNESS_PLAN_MODEL,
            maxTokens: subscriptionPlan.id === "starter" ? 7000 : 10000,
            minimumOutputTokens: subscriptionPlan.id === "starter" ? 7000 : 10000,
            reasoningEffort: "medium",
            promptCacheKey: subscriptionPlan.id === "starter" ? "fitness-plan-core-v1" : "fitness-plan-pro-v3",
            temperature: 0.2,
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
            correctionNote = "The prior output did not match the required JSON shape. Return the exact requested JSON object.";
            continue;
          }

          let candidatePlan = parsed.data;

          // 7. Safety Validation
          let safetyCheck = runFitnessAISafetyCheck(candidatePlan, profile);
          if (!safetyCheck.safe) {
            console.warn(`Attempt ${attempt} Safety check failed:`, safetyCheck.reason);
            if (attempt < MAX_AUTOMATIC_GENERATION_ATTEMPTS) {
              lastErrorMessage = safetyCheck.reason || "Generated plan violated safety checks.";
              correctionNote = `CRITICAL SAFETY CORRECTION: The previous plan violated safety checks: "${safetyCheck.reason}". Fix this immediately: follow every constraint in profile.safety and profile.training.equipment strictly. Do NOT include forbidden movements.`;
              continue;
            }

            // Attempt 2 fallback: auto-repair minor exercise mismatches
            const autoRepaired = autoRepairPlanSafety(candidatePlan, profile);
            const repairedCheck = runFitnessAISafetyCheck(autoRepaired, profile);
            if (repairedCheck.safe) {
              console.log("Auto-repair succeeded in resolving safety violations.");
              candidatePlan = autoRepaired;
              safetyCheck = repairedCheck;
            } else {
              lastErrorMessage = repairedCheck.reason || safetyCheck.reason || "Generated plan violated safety checks.";
              continue;
            }
          }

          const profileCheck = validatePlanAgainstProfile(candidatePlan, profile, {
            enforceProfileRules: true,
            enforceBudgetUtilisation: false,
            allowCoreNutrition: subscriptionPlan.id === "starter",
          });
          if (!profileCheck.valid) {
            console.warn(`Attempt ${attempt} profile validation failed:`, profileCheck.issues);
            lastErrorMessage = `The generated plan did not match the saved profile: ${profileCheck.issues.join("; ")}`;
            correctionNote = `The prior output conflicted with saved onboarding data: ${profileCheck.issues.join(" ")} Fix every listed issue and return the complete plan again.`;
            continue;
          }

          planData = applyFitnessPlanEntitlements(
            enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []),
            subscriptionPlan.id,
          );
          break; // Success!
        } catch (err: any) {
          console.error(`Attempt ${attempt} caught error:`, err);
          lastErrorMessage = err.message || "Network or API error.";
        }
      }
    } finally {
      if (attemptId) {
        await clearGenerationAttempt(supabase, attemptId);
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
