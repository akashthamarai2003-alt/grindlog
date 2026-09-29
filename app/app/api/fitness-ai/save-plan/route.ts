import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { GeneratedPlanSchema } from "@/lib/fitness/ai/schemas";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";
import { validatePlanAgainstProfile } from "@/lib/fitness/validation/fitness-plan-profile";
import { enrichPlanWithFoodLibrary } from "@/lib/fitness/validation/fitness-food-library";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { applyFitnessPlanEntitlements } from "@/lib/fitness/subscription/plan-entitlements";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionPlan = await getFitnessPlan(user.id);
    if (!subscriptionPlan || subscriptionPlan.id === "free") {
      return NextResponse.json({ success: false, error: "Please complete payment before saving your Fitness plan.", errorType: "PAYMENT_REQUIRED" }, { status: 402 });
    }

    const body = await req.json();
    const isRenew = Boolean(body?.renew || body?.next_cycle);

    const { data: activePlan } = await supabase
      .from("fitness_os_workout_plans")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const planCreatedAt = activePlan?.created_at ? new Date(activePlan.created_at) : null;
    const daysOnPlan = planCreatedAt
      ? Math.max(1, Math.floor((Date.now() - planCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    const isCycleComplete = daysOnPlan >= 28;
    const allowRenewal = isCycleComplete || isRenew;

    if (activePlan && !allowRenewal) {
      return NextResponse.json(
        { success: false, error: "Your plan is already locked in. Open your dashboard to view it." },
        { status: 409 },
      );
    }

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
      enforceBudgetUtilisation: false,
      allowCoreNutrition: true,
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

    const { data: foodCatalog } = await supabase
      .from("foods")
      .select("name, serving_size, calories, protein, carbs, fat")
      .eq("is_active", true)
      .eq("plan_eligible", true)
      .limit(250);
    const validatedPlan = applyFitnessPlanEntitlements(
      enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []),
      subscriptionPlan.id,
    );

    // Archive previous active plan so only the new meso-cycle is active
    if (activePlan) {
      await supabase
        .from("fitness_os_workout_plans")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");
    }

    // Atomic Database Transaction via RPC
    const { data: planId, error: rpcError } = await supabase.rpc("create_fitness_os_plan_transaction", {
      payload: validatedPlan
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
