import { NextResponse } from "next/server";
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from "@/lib/fitness/nutrition/nutrition-engine";
import { buildHybridNutritionPrompt, mergeHybridNutrition } from "@/lib/fitness/nutrition/hybrid-merger";
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
import { enrichPlanWithFoodLibrary, filterFoodCatalogForProfile } from "@/lib/fitness/validation/fitness-food-library";
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
    let reqBody: any = null;
    try {
      reqBody = await req.json().catch(() => null);
      if (reqBody && typeof reqBody === "object" && reqBody.retry === true) {
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

    // ──────────────────────────────────────────────────────────
    // PARALLEL BATCH 1: Run all independent Supabase queries at once.
    // ──────────────────────────────────────────────────────────
    const [
      subscriptionPlan,
      { data: existingPlan },
      limitCheck,
      { data: profile, error: profileError },
      { data: scan },
    ] = await Promise.all([
      getFitnessPlan(user.id),
      supabase
        .from("fitness_os_workout_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      checkFitnessAILimit(supabase, user.id),
      supabase
        .from("fitness_os_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("fitness_os_scans")
        .select("gemini_analysis")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    // ── Early-exit checks ──────────────────────────────────────
    if (!subscriptionPlan || subscriptionPlan.id === "free") {
      return NextResponse.json(
        { success: false, error: "Please complete payment before generating your Fitness plan.", errorType: "PAYMENT_REQUIRED" },
        { status: 402 },
      );
    }
    if (existingPlan && (!reqBody || reqBody.isRecalibrate !== true)) {
      return NextResponse.json(
        { success: false, error: "An active plan already exists. Return to dashboard." },
        { status: 400 },
      );
    }

    // In-memory profile adjustment for recalibration prompt generation
    const recalibrationUpdates: Record<string, any> = {};
    if (reqBody && reqBody.isRecalibrate === true && profile) {
      if (reqBody.newWeight && Number(reqBody.newWeight) > 0) {
        recalibrationUpdates.weight = Number(reqBody.newWeight);
      }
      if (reqBody.newGoal && typeof reqBody.newGoal === "string") {
        recalibrationUpdates.goal = reqBody.newGoal;
      }
      if (reqBody.painStatus === "healed") {
        recalibrationUpdates.current_pain_severity = 0;
        recalibrationUpdates.physical_problems = [];
        recalibrationUpdates.exercise_limitations = [];
      } else if (reqBody.painStatus === "better") {
        recalibrationUpdates.current_pain_severity = Math.max(1, (Number(profile.current_pain_severity) || 4) - 2);
      }
      Object.assign(profile, recalibrationUpdates);
    }

    if (!limitCheck.allowed && !reqBody?.isRecalibrate) {
      return NextResponse.json(
        {
          success: false,
          error: "Fitness AI limit reached for today. Please try again tomorrow.",
        },
        { status: 429 },
      );
    }
    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 },
      );
    }

    // ── Food catalog (Pro only) ────────────────────────────────
    const todayStr = new Date().toISOString().split("T")[0];
    let rawFoodCatalog: any[] = [];
    if (subscriptionPlan.id === "pro") {
      const { data } = await supabase
        .from("foods")
        .select("name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
        .eq("is_active", true)
        .eq("plan_eligible", true)
        .limit(250);
      rawFoodCatalog = data || [];
    }
    // Filter strictly to user's onboarding diet & allergies, capping items to keep prompt lean & fast
    const foodCatalog = filterFoodCatalogForProfile(rawFoodCatalog, profile);

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
          const isPro = subscriptionPlan.id === "pro";

          // Step A: Generate deterministic nutrition plan (60% Math Ground Truth)
          let deterministicNutrition = null;
          if (isPro) {
            try {
              const nutritionPlan = await generateDeterministicNutritionPlan(profile);
              deterministicNutrition = convertToAIPlanFormat(nutritionPlan);
            } catch (nutritionErr) {
              console.warn("Deterministic nutrition generation failed, AI will handle nutrition:", nutritionErr);
            }
          }

          // Step B: AI generates workouts + 40% culinary & coaching nutrition layer
          const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
            systemPrompt: `${buildFitnessPlanSystemPrompt(subscriptionPlan.id)}${deterministicNutrition ? `\n\n${buildHybridNutritionPrompt(deterministicNutrition)}` : `\n\n${isPro ? FITNESS_PLAN_PRESENTATION_RULE : "CORE PRESENTATION RULE: Return calorie and protein targets only; keep carbs_grams and fat_grams null, with empty meals and grocery_list arrays."}`}`,
            userPrompt: correctionNote ? `${userPrompt}\n\n${correctionNote}` : userPrompt,
            model: FITNESS_PLAN_MODEL,
            maxTokens: deterministicNutrition ? (isPro ? 8500 : 3500) : (isPro ? 10000 : 4500),
            minimumOutputTokens: deterministicNutrition ? (isPro ? 6000 : 3500) : (isPro ? 10000 : 4500),
            reasoningEffort: deterministicNutrition ? "low" : (isPro ? "medium" : "low"),
            promptCacheKey: deterministicNutrition ? "fitness-plan-hybrid-v1" : (isPro ? "fitness-plan-pro-v3" : "fitness-plan-core-v2"),
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

          // 60% Code Math + 40% AI Hybrid Nutrition Merge
          let mergedPlan = profileCheck.plan;
          if (deterministicNutrition && mergedPlan.nutrition) {
            mergedPlan = {
              ...mergedPlan,
              nutrition: mergeHybridNutrition(candidatePlan.nutrition, deterministicNutrition),
            };
          }

          planData = applyFitnessPlanEntitlements(
            enrichPlanWithFoodLibrary(mergedPlan, foodCatalog || []),
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

    // 8. If recalibrating, archive previous active plan(s) to 'completed' and persist profile updates
    if (reqBody && reqBody.isRecalibrate === true) {
      await supabase
        .from("fitness_os_workout_plans")
        .update({ status: "completed" })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (Object.keys(recalibrationUpdates).length > 0) {
        await supabase
          .from("fitness_os_profiles")
          .update(recalibrationUpdates)
          .eq("user_id", user.id);
      }
    }

    // 9. Atomic Database Transaction via RPC
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
