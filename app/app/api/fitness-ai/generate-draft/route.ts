import { NextResponse } from "next/server";
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from "@/lib/fitness/nutrition/nutrition-engine";
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
import { generateProNutritionLayer } from "@/lib/fitness/ai/nutrition-generator";
import {
  clearGenerationAttempt,
  clearUserGenerationAttempts,
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { applyFitnessPlanEntitlements } from "@/lib/fitness/subscription/plan-entitlements";

// A high-reasoning, full weekly plan can take longer than one minute. Avoid a
// platform timeout turning a valid in-progress response into an empty client
// payload. This remains below Vercel's current Hobby function limit.
export const maxDuration = 180;
// Allow up to 2 attempts with targeted self-correction before fallback
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
      // Body may not be JSON or may be empty
    }
    if (req.headers.get("x-retry") === "true") {
      isRetry = true;
    }

    if (isRetry) {
      console.log(`Explicit retry requested by user ${user.id}. Clearing any pending locks.`);
      await clearUserGenerationAttempts(supabase, user.id, "plan_generation_attempt");
    }

    // ──────────────────────────────────────────────────────────
    // PARALLEL BATCH 1: Run all independent Supabase queries at once.
    // Each query only needs user.id (available after auth). Running them
    // concurrently instead of sequentially saves ~2-4 seconds.
    // ──────────────────────────────────────────────────────────
    const [
      subscriptionPlan,
      { data: activePlan },
      { data: profile, error: profileError },
      { data: scan },
      limitCheck,
    ] = await Promise.all([
      getFitnessPlan(user.id),
      supabase
        .from("fitness_os_workout_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
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
      checkFitnessAILimit(supabase, user.id),
    ]);

    // ── Early-exit checks (same order as before) ────────────
    if (!subscriptionPlan || subscriptionPlan.id === "free") {
      return NextResponse.json(
        { success: false, error: "Please complete payment before generating your Fitness plan.", errorType: "PAYMENT_REQUIRED" },
        { status: 402 },
      );
    }
    if (activePlan) {
      return NextResponse.json(
        { success: false, error: "Your plan is already locked in. Open your dashboard to view it.", errorType: "PLAN_ACTIVE" },
        { status: 409 },
      );
    }
    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 },
      );
    }
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Fitness AI limit reached for today. Please try again tomorrow.",
        },
        { status: 429 },
      );
    }

    // ──────────────────────────────────────────────────────────
    // PARALLEL BATCH 2: Queries that depend on batch 1 results.
    // Food catalog needs subscriptionPlan.id; cached draft needs
    // profile.updated_at for the freshness filter.
    // ──────────────────────────────────────────────────────────
    const todayStr = new Date().toISOString().split("T")[0];

    let cachedDraftQuery = supabase
      .from("fitness_os_ai_sessions")
      .select("id, prompt, response")
      .eq("user_id", user.id)
      .eq("session_type", "plan_generation")
      .order("created_at", { ascending: false })
      .limit(1);
    if (typeof profile.updated_at === "string" && profile.updated_at) {
      cachedDraftQuery = cachedDraftQuery.gte("created_at", profile.updated_at);
    }

    const [foodCatalogResult, { data: cachedDraft }] = await Promise.all([
      subscriptionPlan.id === "pro"
        ? supabase
            .from("foods")
            .select("name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
            .eq("is_active", true)
            .eq("plan_eligible", true)
            .limit(250)
        : Promise.resolve({ data: [] as any[] }),
      cachedDraftQuery.maybeSingle(),
    ]);
    const rawFoodCatalog: any[] = foodCatalogResult.data || [];
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

    if (cachedDraft?.response) {
      try {
        const cachedPlan = GeneratedPlanSchema.safeParse(
          JSON.parse(cachedDraft.response),
        );
        const safetyCheck = cachedPlan.success
          ? runFitnessAISafetyCheck(cachedPlan.data, profile)
          : null;
        const profileCheck = cachedPlan.success
          ? validatePlanAgainstProfile(cachedPlan.data, profile, {
              enforceProfileRules: true,
              enforceBudgetUtilisation: false,
              allowCoreNutrition: subscriptionPlan.id === "starter",
            })
          : null;
        if (cachedPlan.success && safetyCheck?.safe && profileCheck?.valid) {
          return NextResponse.json({
            success: true,
            cached: true,
            data: {
              ...applyFitnessPlanEntitlements(enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []), subscriptionPlan.id),
              _profile: profile,
              _subscriptionPlan: subscriptionPlan.id,
            },
          });
        }

        // Core-to-Pro upgrade transition: User already generated workouts on Core,
        // but now upgraded to Pro. Keep existing workouts intact and generate
        // only the missing Pro nutrition layer (meals + grocery list).
        if (
          cachedPlan.success &&
          safetyCheck?.safe &&
          subscriptionPlan.id === "pro" &&
          cachedPlan.data.workouts.length > 0 &&
          (!cachedPlan.data.nutrition?.meals || cachedPlan.data.nutrition.meals.length === 0)
        ) {
          console.log("Core-to-Pro upgrade detected in draft: Preserving workouts and generating Pro nutrition layer...");
          try {
            const generatedNutrition = await generateProNutritionLayer({
              profile,
              existingWorkouts: cachedPlan.data.workouts,
              foodCatalog,
            });

            const mergedPlan = {
              ...cachedPlan.data,
              nutrition: generatedNutrition,
            };

            const mergedSafety = runFitnessAISafetyCheck(mergedPlan, profile);
            const mergedCheck = validatePlanAgainstProfile(mergedPlan, profile, {
              enforceProfileRules: true,
              enforceBudgetUtilisation: false,
              allowCoreNutrition: false,
            });

            if (mergedSafety.safe && mergedCheck.valid) {
              const enrichedPlan = applyFitnessPlanEntitlements(
                enrichPlanWithFoodLibrary(mergedCheck.plan, foodCatalog || []),
                "pro",
              );

              // Update the session cache with the merged Pro plan
              if (cachedDraft.id) {
                await supabase
                  .from("fitness_os_ai_sessions")
                  .update({
                    response: JSON.stringify(enrichedPlan),
                    model: FITNESS_PLAN_MODEL,
                  })
                  .eq("id", cachedDraft.id);
              }

              return NextResponse.json({
                success: true,
                cached: true,
                upgraded: true,
                data: {
                  ...enrichedPlan,
                  _profile: profile,
                  _subscriptionPlan: "pro",
                },
              });
            }
          } catch (upgradeErr) {
            console.error("Failed to generate Pro nutrition layer for existing workouts:", upgradeErr);
            // Fall through to full generation if single-layer generation fails
          }
        }
      } catch {
        // Ignore an old malformed cache entry and safely generate a new draft.
      }
    }

    if (!isRetry) {
      const retryAfterSeconds = await getGenerationRetryAfterSeconds(
        supabase,
        user.id,
        "plan_generation_attempt",
      );
      if (retryAfterSeconds > 0) {
        console.log(`Generation already in progress for user ${user.id}. Polling briefly...`);
        for (let i = 0; i < 6; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          let latestCachedDraftQuery = supabase
            .from("fitness_os_ai_sessions")
            .select("prompt, response")
            .eq("user_id", user.id)
            .eq("session_type", "plan_generation")
            .order("created_at", { ascending: false })
            .limit(1);
          if (typeof profile.updated_at === "string" && profile.updated_at) {
            latestCachedDraftQuery = latestCachedDraftQuery.gte("created_at", profile.updated_at);
          }
          const { data: latestCachedDraft } = await latestCachedDraftQuery.maybeSingle();

          if (latestCachedDraft?.response) {
            try {
              const cachedPlan = GeneratedPlanSchema.safeParse(
                JSON.parse(latestCachedDraft.response),
              );
              const safetyCheck = cachedPlan.success
                ? runFitnessAISafetyCheck(cachedPlan.data, profile)
                : null;
              const profileCheck = cachedPlan.success
                ? validatePlanAgainstProfile(cachedPlan.data, profile, {
                    enforceProfileRules: true,
                    enforceBudgetUtilisation: false,
                    allowCoreNutrition: subscriptionPlan.id === "starter",
                  })
                : null;
              if (cachedPlan.success && safetyCheck?.safe && profileCheck?.valid) {
                console.log(`Polling succeeded for user ${user.id}.`);
                return NextResponse.json({
                  success: true,
                  cached: true,
                  data: {
                    ...applyFitnessPlanEntitlements(enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []), subscriptionPlan.id),
                    _profile: profile,
                    _subscriptionPlan: subscriptionPlan.id,
                  },
                });
              }
            } catch {
              // Ignore parse errors during polling
            }
          }
        }
        // If polling timed out after 15 seconds, clear the stale attempt and proceed to generate
        console.log(`Polling timed out for user ${user.id}. Clearing stale attempt and generating fresh plan...`);
        await clearUserGenerationAttempts(supabase, user.id, "plan_generation_attempt");
      }
    }

    // 6. Record before calling OpenAI and guarantee cleanup in finally block
    let attemptId: string | null = null;
    let planData: GeneratedPlanData | null = null;
    let lastErrorType = "SYSTEM";
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

          // Step A: Generate deterministic nutrition plan (0 AI tokens)
          let deterministicNutrition = null;
          if (isPro) {
            try {
              const nutritionPlan = await generateDeterministicNutritionPlan(profile);
              deterministicNutrition = convertToAIPlanFormat(nutritionPlan);
              console.log(`Deterministic nutrition generated: ${deterministicNutrition.daily_calories}cal, ${deterministicNutrition.protein_grams}g protein, ${deterministicNutrition.meals.length} meals, ${deterministicNutrition.grocery_list.length} grocery items`);
            } catch (nutritionErr) {
              console.warn("Deterministic nutrition generation failed, AI will handle nutrition:", nutritionErr);
            }
          }

          // Step B: AI generates workouts (and nutrition ONLY if deterministic failed)
          const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
            systemPrompt: `${buildFitnessPlanSystemPrompt(subscriptionPlan.id)}${deterministicNutrition ? '\n\nIMPORTANT: Nutrition, meals, and grocery list have been pre-generated deterministically. Focus ONLY on generating the workout plan, safety_acknowledgment, plan summary, and lifestyle targets. Set nutrition fields to the provided deterministic values.' : `\n\n${isPro ? FITNESS_PLAN_PRESENTATION_RULE : "CORE PRESENTATION RULE: Return calorie and protein targets only; keep carbs_grams and fat_grams null, with empty meals and grocery_list arrays."}`}`,
            userPrompt: correctionNote ? `${userPrompt}\n\n${correctionNote}` : userPrompt,
            model: FITNESS_PLAN_MODEL,
            maxTokens: deterministicNutrition ? (isPro ? 5500 : 3500) : (isPro ? 10000 : 4500),
            minimumOutputTokens: deterministicNutrition ? (isPro ? 5500 : 3500) : (isPro ? 10000 : 4500),
            reasoningEffort: deterministicNutrition ? "low" : (isPro ? "medium" : "low"),
            promptCacheKey: deterministicNutrition ? "fitness-plan-workout-only-v1" : (isPro ? "fitness-plan-pro-v3" : "fitness-plan-core-v2"),
            temperature: 0.2, // Extremely low temperature to strictly follow negative safety constraints
            jsonSchema: {
              name: "fitness_plan",
              schema: planJsonSchema,
              description: "A complete personalized 7-day Grindlog fitness plan.",
              strict: true,
            },
            verbosity: "low",
          });

          // 7. Validate AI JSON
          const parsed = GeneratedPlanSchema.safeParse(aiResponse);
          if (!parsed.success) {
            console.warn(`Attempt ${attempt} Zod validation failed:`, parsed.error);
            lastErrorType = "SYSTEM";
            lastErrorMessage = `Failed to parse AI output: ${parsed.error.errors.map(e => e.path.join(".") + " " + e.message).join(", ")}`;
            correctionNote = "The prior output did not match the required JSON shape. Return the exact requested JSON object with every required section.";
            continue; // Try again
          }

          let candidatePlan = parsed.data;

          // 8. Safety Validation
          let safetyCheck = runFitnessAISafetyCheck(candidatePlan, profile);
          if (!safetyCheck.safe) {
            console.warn(`Attempt ${attempt} Safety check failed:`, safetyCheck.reason);
            if (attempt < MAX_AUTOMATIC_GENERATION_ATTEMPTS) {
              lastErrorType = "SAFETY";
              lastErrorMessage =
                safetyCheck.reason || "Generated plan violated safety checks.";
              correctionNote = `CRITICAL SAFETY CORRECTION: The previous plan violated safety checks: "${safetyCheck.reason}". Fix this immediately: follow every constraint in profile.safety and profile.training.equipment strictly. Do NOT include forbidden movements.`;
              continue; // Try again with correction
            }

            // Attempt 2 fallback: auto-repair minor exercise mismatches
            const autoRepaired = autoRepairPlanSafety(candidatePlan, profile);
            const repairedCheck = runFitnessAISafetyCheck(autoRepaired, profile);
            if (repairedCheck.safe) {
              console.log("Auto-repair succeeded in resolving safety violations.");
              candidatePlan = autoRepaired;
              safetyCheck = repairedCheck;
            } else {
              lastErrorType = "SAFETY";
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
            lastErrorType = "SYSTEM";
            lastErrorMessage = `The generated plan did not match the saved profile: ${profileCheck.issues.join("; ")}`;
            correctionNote = `The prior output conflicted with saved onboarding data: ${profileCheck.issues.join(" ")} Fix every listed issue and return the complete plan again.`;
            continue;
          }

          // Merge deterministic nutrition into the AI-generated plan
          let mergedPlan = profileCheck.plan;
          if (deterministicNutrition && mergedPlan.nutrition) {
            mergedPlan = {
              ...mergedPlan,
              nutrition: {
                ...mergedPlan.nutrition,
                daily_calories: deterministicNutrition.daily_calories ?? mergedPlan.nutrition.daily_calories,
                protein_grams: deterministicNutrition.protein_grams ?? mergedPlan.nutrition.protein_grams,
                carbs_grams: deterministicNutrition.carbs_grams ?? mergedPlan.nutrition.carbs_grams,
                fat_grams: deterministicNutrition.fat_grams ?? mergedPlan.nutrition.fat_grams,
                meals_per_day: deterministicNutrition.meals_per_day ?? mergedPlan.nutrition.meals_per_day,
                meals: deterministicNutrition.meals.length > 0 ? deterministicNutrition.meals : mergedPlan.nutrition.meals,
                grocery_list: deterministicNutrition.grocery_list.length > 0 ? deterministicNutrition.grocery_list : mergedPlan.nutrition.grocery_list,
                guidance: deterministicNutrition.guidance || mergedPlan.nutrition.guidance,
              },
            };
          }

          planData = applyFitnessPlanEntitlements(
            enrichPlanWithFoodLibrary(mergedPlan, foodCatalog || []),
            subscriptionPlan.id,
          );
          break; // Success! Break out of the loop.
        } catch (err: any) {
          console.error(`Attempt ${attempt} caught error:`, err);
          lastErrorType = "SYSTEM";
          lastErrorMessage = err.message || "Network or API error.";
          if (String(lastErrorMessage).toLowerCase().includes("incomplete")) {
            correctionNote =
              "The previous generation was interrupted before JSON was complete. Return the full required JSON object in one response; keep descriptions concise, but do not omit any required section.";
          }
        }
      }
    } finally {
      if (attemptId) {
        await clearGenerationAttempt(supabase, attemptId);
      }
    }

    if (!planData) {
      return NextResponse.json(
        { success: false, errorType: lastErrorType, error: lastErrorMessage },
        { status: 400 },
      );
    }

    // 9. Persist the successful draft for stable reopen/reload reuse.
    await logFitnessAIUsage(
      user.id,
      "plan_generation",
      userPrompt,
      JSON.stringify(planData),
      FITNESS_PLAN_MODEL,
      0,
    );

    return NextResponse.json({
      success: true,
      data: { ...planData, _profile: profile, _subscriptionPlan: subscriptionPlan.id },
    });
  } catch (error: any) {
    console.error("Fitness AI Generation Error:", error);
    return NextResponse.json(
      {
        success: false,
        errorType: "SYSTEM",
        error: "We couldn't build your plan right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
