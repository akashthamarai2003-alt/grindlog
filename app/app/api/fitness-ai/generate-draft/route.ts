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
import { getFitnessPlan, requireFitnessSubscription } from "@/lib/fitness/subscription/access";
import { applyFitnessPlanEntitlements } from "@/lib/fitness/subscription/plan-entitlements";

// A high-reasoning, full weekly plan can take longer than one minute. Avoid a
// platform timeout turning a valid in-progress response into an empty client
// payload. This remains below Vercel's current Hobby function limit.
export const maxDuration = 180;
// Keep one paid model call per user action. If the model returns an invalid
// plan, the user can retry explicitly instead of silently doubling spend.
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

    // Payment is a hard server-side prerequisite. Check before reading a
    // cached draft so an unpaid user cannot receive a previously generated plan.
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

    // A locked plan is the user's active source of truth. Do not start a new
    // draft if the user revisits this URL after locking it in.
    const { data: activePlan } = await supabase
      .from("fitness_os_workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (activePlan) {
      return NextResponse.json(
        { success: false, error: "Your plan is already locked in. Open your dashboard to view it.", errorType: "PLAN_ACTIVE" },
        { status: 409 },
      );
    }

    // 2. Fetch Profile
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

    // 3. Fetch latest Gemini Body Scan (if any)
    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // 4. Reuse an identical recent draft. Reopening the tab must not spend on a
    // second plan while the user is still reviewing the first one.
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
    // Keep the review draft stable until onboarding changes. A short TTL made
    // a normal refresh generate a different paid plan after 30 minutes.
    let cachedDraftQuery = supabase
      .from("fitness_os_ai_sessions")
      .select("prompt, response")
      .eq("user_id", user.id)
      .eq("session_type", "plan_generation")
      .order("created_at", { ascending: false })
      .limit(1);
    if (typeof profile.updated_at === "string" && profile.updated_at) {
      cachedDraftQuery = cachedDraftQuery.gte("created_at", profile.updated_at);
    }
    const { data: cachedDraft } = await cachedDraftQuery.maybeSingle();

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
      } catch {
        // Ignore an old malformed cache entry and safely generate a new draft.
      }
    }

    const retryAfterSeconds = await getGenerationRetryAfterSeconds(
      supabase,
      user.id,
      "plan_generation_attempt",
    );
    if (retryAfterSeconds > 0) {
      console.log(`Generation already in progress for user ${user.id}. Polling...`);
      for (let i = 0; i < 30; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
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
      return NextResponse.json(
        {
          success: false,
          error: "A plan generation is already in progress and taking longer than expected. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    // 5. Rate limit completed daily plan generations only. A provider failure
    // should not consume the user's plan allowance.
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

    // 6. Record before calling OpenAI so a failed request cannot be retried
    // repeatedly by refreshes, browser back, or multiple open tabs.
    await recordGenerationAttempt(
      supabase,
      user.id,
      "plan_generation_attempt",
      FITNESS_PLAN_MODEL,
    );

    let planData: GeneratedPlanData | null = null;
    let lastErrorType = "SYSTEM";
    let lastErrorMessage = "We couldn't build your plan right now.";
    let correctionNote = "";

    for (let attempt = 1; attempt <= MAX_AUTOMATIC_GENERATION_ATTEMPTS; attempt++) {
      try {
        console.log(`Fitness AI Generation Attempt ${attempt}...`);
        const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
          systemPrompt: `${FITNESS_PLAN_SYSTEM_PROMPT}\n\n${FITNESS_PLAN_PRESENTATION_RULE}`,
          userPrompt: correctionNote ? `${userPrompt}\n\n${correctionNote}` : userPrompt,
          model: FITNESS_PLAN_MODEL,
          // Setup is a synchronous request. Medium is the quality/latency
          // compromise; deterministic safety/profile validators remain the
          // safety barrier.
          maxTokens: 10000,
          minimumOutputTokens: 10000,
          reasoningEffort: "medium",
          promptCacheKey: "fitness-plan-v3",
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

        const candidatePlan = parsed.data;

        // 8. Safety Validation
        const safetyCheck = runFitnessAISafetyCheck(candidatePlan, profile);
        if (!safetyCheck.safe) {
          console.warn(`Attempt ${attempt} Safety check failed:`, safetyCheck.reason);
          lastErrorType = "SAFETY";
          lastErrorMessage =
            safetyCheck.reason || "Generated plan violated safety checks.";
          correctionNote = "The prior output violated a safety restriction. Follow every value in profile.safety exactly; do not include blocked workouts or movements.";
          continue; // Try again
        }

        const profileCheck = validatePlanAgainstProfile(candidatePlan, profile, {
          enforceProfileRules: true,
          enforceBudgetUtilisation: false,
        });
        if (!profileCheck.valid) {
          console.warn(`Attempt ${attempt} profile validation failed:`, profileCheck.issues);
          lastErrorType = "SYSTEM";
          lastErrorMessage = `The generated plan did not match the saved profile: ${profileCheck.issues.join("; ")}`;
          correctionNote = `The prior output conflicted with saved onboarding data: ${profileCheck.issues.join(" ")} Fix every listed issue and return the complete plan again.`;
          continue;
        }

        planData = applyFitnessPlanEntitlements(
          enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []),
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
