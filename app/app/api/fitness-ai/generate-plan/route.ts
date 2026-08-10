import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { GeneratedPlanSchema, GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import { FITNESS_PLAN_SYSTEM_PROMPT, buildFitnessPlanPrompt } from "@/lib/fitness/ai/prompts";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";

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

    // 5. Call AI Server-Side
    const todayStr = new Date().toISOString().split('T')[0];
    const userPrompt = buildFitnessPlanPrompt(profile, todayStr);
    
    const aiResponse = await generateAIResponseJSON<any>({
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      userPrompt,
      model: "fast", // Fast and cheap for structured JSON
      maxTokens: 4000
    });

    // 6. Validate AI JSON
    const parsed = GeneratedPlanSchema.safeParse(aiResponse);
    if (!parsed.success) {
      console.error("Fitness AI Zod validation failed:", parsed.error);
      return NextResponse.json({ success: false, error: "We couldn't build your plan right now. Please try again." }, { status: 500 });
    }

    const planData: GeneratedPlanData = parsed.data;

    // 7. Safety Validation
    const safetyCheck = runFitnessAISafetyCheck(planData, profile);
    if (!safetyCheck.safe) {
      console.warn("Fitness AI safety check failed:", safetyCheck.reason);
      return NextResponse.json({ success: false, error: safetyCheck.reason || "Generated plan violated safety checks." }, { status: 400 });
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
