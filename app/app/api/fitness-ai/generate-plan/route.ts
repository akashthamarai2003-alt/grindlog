import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { GeneratedPlanSchema, GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import { FITNESS_PLAN_SYSTEM_PROMPT, buildFitnessPlanPrompt } from "@/lib/fitness/ai/prompts";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { getGroqClient } from "@/lib/services/groq/client";

export const maxDuration = 60; // Set to 60 seconds to accommodate auto-retries

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Prevent duplicate active plans
    const { data: existingPlan } = await supabase
      .from("fitness_os_workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingPlan) {
      return NextResponse.json({ success: false, error: "An active plan already exists. Return to dashboard." }, { status: 400 });
    }

    // 3. Rate Limit
    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: "Fitness AI limit reached for today. Please try again tomorrow." }, { status: 429 });
    }

    // 4. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // 4.5 Fetch latest Gemini Body Scan (if any)
    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // 5. Call AI Server-Side
    const todayStr = new Date().toISOString().split('T')[0];
    const userPrompt = buildFitnessPlanPrompt(profile, todayStr, scan?.gemini_analysis);
    
    const groq = getGroqClient();

    let planData: GeneratedPlanData | null = null;
    let lastErrorMessage = "We couldn't build your plan right now.";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Fitness AI Generation Attempt ${attempt}...`);
        const response = await groq.chat.completions.create({
          messages: [
            { role: "system", content: FITNESS_PLAN_SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(response.choices[0].message.content || "{}");

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
          lastErrorMessage = safetyCheck.reason || "Generated plan violated safety checks.";
          continue;
        }

        planData = candidatePlan;
        break; // Success!
      } catch (err: any) {
        console.error(`Attempt ${attempt} caught error:`, err);
        lastErrorMessage = err.message || "Network or API error.";
      }
    }

    if (!planData) {
      return NextResponse.json({ success: false, error: lastErrorMessage }, { status: 400 });
    }

    // 8. Atomic Database Transaction via RPC
    const { data: planId, error: rpcError } = await supabase.rpc("create_fitness_os_plan_transaction", {
      payload: planData
    });

    if (rpcError || !planId) {
      console.error("Fitness AI Transaction failed:", rpcError);
      return NextResponse.json({ success: false, error: "Failed to save the generated plan." }, { status: 500 });
    }

    // 9. Log Usage
    await logFitnessAIUsage(user.id, "plan_generation", userPrompt, JSON.stringify(planData), "llama-3.1-8b-instant", 0);

    return NextResponse.json({ success: true, data: { planId } });
    
  } catch (error: any) {
    console.error("Fitness AI Generation Error:", error);
    return NextResponse.json({ success: false, error: "We couldn't build your plan right now. Please try again." }, { status: 500 });
  }
}
