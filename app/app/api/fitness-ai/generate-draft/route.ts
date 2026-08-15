import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { GeneratedPlanSchema, GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import { FITNESS_PLAN_SYSTEM_PROMPT, buildFitnessPlanPrompt } from "@/lib/fitness/ai/prompts";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { getGroqClient } from "@/lib/services/groq/client";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limit
    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: "Fitness AI limit reached for today. Please try again tomorrow." }, { status: 429 });
    }

    // 3. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // 4. Fetch latest Gemini Body Scan (if any)
    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // 5. Call AI Server-Side with Automatic Retries
    const todayStr = new Date().toISOString().split('T')[0];
    const userPrompt = buildFitnessPlanPrompt(profile, todayStr, scan?.gemini_analysis);
    const { generateAIResponseJSON } = await import("@/lib/services/groq/client");

    let planData: GeneratedPlanData | null = null;
    let lastErrorType = "SYSTEM";
    let lastErrorMessage = "We couldn't build your plan right now.";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Fitness AI Generation Attempt ${attempt}...`);
        const aiResponse = await generateAIResponseJSON({
          systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
          userPrompt,
          model: "primary",
          maxTokens: 8000,
        });

        // 6. Validate AI JSON
        const parsed = GeneratedPlanSchema.safeParse(aiResponse);
        if (!parsed.success) {
          console.warn(`Attempt ${attempt} Zod validation failed:`, parsed.error);
          lastErrorType = "SYSTEM";
          lastErrorMessage = "Failed to parse AI output.";
          continue; // Try again
        }

        const candidatePlan = parsed.data;

        // 7. Safety Validation
        const safetyCheck = runFitnessAISafetyCheck(candidatePlan, profile);
        if (!safetyCheck.safe) {
          console.warn(`Attempt ${attempt} Safety check failed:`, safetyCheck.reason);
          lastErrorType = "SAFETY";
          lastErrorMessage = safetyCheck.reason || "Generated plan violated safety checks.";
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
      return NextResponse.json({ success: false, errorType: lastErrorType, error: lastErrorMessage }, { status: 400 });
    }

    // 9. Log Usage
    await logFitnessAIUsage(user.id, "plan_generation", userPrompt, JSON.stringify(planData), "llama-3.1-8b-instant", 0);

    return NextResponse.json({ success: true, data: { ...planData, _profile: profile } });
    
  } catch (error: any) {
    console.error("Fitness AI Generation Error:", error);
    return NextResponse.json({ success: false, errorType: "SYSTEM", error: "We couldn't build your plan right now. Please try again." }, { status: 500 });
  }
}
