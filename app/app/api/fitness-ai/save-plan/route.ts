import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { GeneratedPlanSchema } from "@/lib/fitness/ai/schemas";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { validatePlanAgainstProfile } from "@/lib/fitness/validation/fitness-plan-profile";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = GeneratedPlanSchema.safeParse(body.plan);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid plan format." }, { status: 400 });
    }

    const planData = parsed.data;

    // Do not trust browser-held draft data. A user may have an older cached
    // draft or modify the request before saving, so validate it again against
    // the profile that is actually stored for this account.
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Fitness profile not found." }, { status: 404 });
    }

    const safetyCheck = runFitnessAISafetyCheck(planData, profile);
    const profileCheck = validatePlanAgainstProfile(planData, profile, {
      enforceProfileRules: true,
      enforceBudgetUtilisation: true,
    });
    if (!safetyCheck.safe || !profileCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: safetyCheck.reason || profileCheck.issues[0] || "This draft no longer matches your saved profile.",
        },
        { status: 400 },
      );
    }

    // Atomic Database Transaction via RPC
    const { data: planId, error: rpcError } = await supabase.rpc("create_fitness_os_plan_transaction", {
      payload: profileCheck.plan
    });

    if (rpcError || !planId) {
      console.error("Save Plan Transaction failed:", rpcError);
      return NextResponse.json({ success: false, error: "Failed to save the generated plan." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { planId } });
  } catch (error: any) {
    console.error("Save Plan Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
