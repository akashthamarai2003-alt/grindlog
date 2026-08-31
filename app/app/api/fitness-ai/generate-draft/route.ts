import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import {
  FITNESS_PLAN_MODEL,
  generateOpenAIResponseJSON,
} from "@/lib/services/openai/client";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { GeneratedPlanSchema, GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  buildFitnessPlanPrompt,
} from "@/lib/fitness/ai/prompts";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
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
    const userPrompt = buildFitnessPlanPrompt(profile, todayStr, scan?.gemini_analysis);
    const draftCacheCutoff = new Date(Date.now() - 30 * 60_000).toISOString();
    const { data: cachedDraft } = await supabase
      .from("fitness_os_ai_sessions")
      .select("prompt, response")
      .eq("user_id", user.id)
      .eq("session_type", "plan_generation")
      .gte("created_at", draftCacheCutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedDraft?.prompt === userPrompt && cachedDraft.response) {
      try {
        const cachedPlan = GeneratedPlanSchema.safeParse(
          JSON.parse(cachedDraft.response),
        );
        if (
          cachedPlan.success &&
          runFitnessAISafetyCheck(cachedPlan.data, profile).safe
        ) {
          return NextResponse.json({
            success: true,
            cached: true,
            data: { ...cachedPlan.data, _profile: profile },
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
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${retryAfterSeconds} seconds before trying again.`,
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

    for (let attempt = 1; attempt <= MAX_AUTOMATIC_GENERATION_ATTEMPTS; attempt++) {
      try {
        console.log(`Fitness AI Generation Attempt ${attempt}...`);
        const aiResponse = await generateOpenAIResponseJSON<GeneratedPlanData>({
          systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
          userPrompt,
          model: FITNESS_PLAN_MODEL,
          // A complete weekly plan needs more space than the report, but this is
          // intentionally below the old implicit 8,000-token ceiling.
          maxTokens: 5600,
          minimumOutputTokens: 5600,
          reasoningEffort: "high",
          temperature: 0.2, // Extremely low temperature to strictly follow negative safety constraints
        });

        // 7. Validate AI JSON
        const parsed = GeneratedPlanSchema.safeParse(aiResponse);
        if (!parsed.success) {
          console.warn(`Attempt ${attempt} Zod validation failed:`, parsed.error);
          lastErrorType = "SYSTEM";
          lastErrorMessage = "Failed to parse AI output.";
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
          continue; // Try again
        }

        planData = candidatePlan;
        break; // Success! Break out of the loop.
      } catch (err: any) {
        console.error(`Attempt ${attempt} caught error:`, err);
        lastErrorType = "SYSTEM";
        lastErrorMessage = err.message || "Network or API error.";
      }
    }

    if (!planData) {
      return NextResponse.json(
        { success: false, errorType: lastErrorType, error: lastErrorMessage },
        { status: 400 },
      );
    }

    // 9. Persist the successful draft for the short-lived reopen cache.
    await logFitnessAIUsage(
      user.id,
      "plan_generation",
      userPrompt,
      JSON.stringify(planData),
      FITNESS_PLAN_MODEL,
      0,
    );

    return NextResponse.json({ success: true, data: { ...planData, _profile: profile } });
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
