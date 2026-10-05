import { SupabaseClient } from "@supabase/supabase-js";

export interface PlanProgressionContext {
  mesocycleNumber: number;
  isRenewal: boolean;
  previousPlanTitle?: string;
  previousExercises: string[];
  completedWorkoutsCount: number;
  totalWorkoutsCount: number;
  adherencePercentage: number;
  baselineWeightKg: number;
  currentWeightKg: number;
  weightDeltaKg: number;
  progressionFocus: string;
  latestMeasurements?: {
    waist_cm?: number;
    chest_cm?: number;
    arms_cm?: number;
    thighs_cm?: number;
    hips_cm?: number;
    neck_cm?: number;
    recorded_at?: string;
  };
}

/**
 * Gathers rich mesocycle and workout history context for the AI plan generator.
 * Allows the AI to generate a true progressive mesocycle (Month 2, Month 3, etc.)
 * with exercise rotation, progressive overload targets, and weight recalibration.
 */
export async function getMesocycleProgressionContext(
  supabase: SupabaseClient,
  userId: string,
  profile: any,
  isExplicitRenew: boolean = false,
): Promise<PlanProgressionContext | null> {
  try {
    // 1. Fetch all past plans (active and completed)
    const { data: plans } = await supabase
      .from("fitness_os_workout_plans")
      .select("id, name, status, plan_data, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const planList = plans || [];
    const activePlan = planList.find((p: any) => p.status === "active");
    const completedPlans = planList.filter((p: any) => p.status === "completed");

    // Calculate days on active plan if present
    const activePlanCreatedAt = activePlan?.created_at ? new Date(activePlan.created_at) : null;
    const daysOnPlan = activePlanCreatedAt
      ? Math.max(1, Math.floor((Date.now() - activePlanCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    const isCycleComplete = daysOnPlan >= 28;

    const isRenewal = isExplicitRenew || isCycleComplete;

    // If user has no active or completed plans and is not renewing, this is Month 1 (Mesocycle 1)
    if (planList.length === 0 && !isRenewal) {
      return null;
    }

    // Determine current mesocycle number
    const completedCount = completedPlans.length;
    const mesocycleNumber = isRenewal
      ? (activePlan ? completedCount + 2 : completedCount + 1)
      : Math.max(1, completedCount + (activePlan ? 1 : 0));

    // If it's pure Month 1 initial creation with no prior plan, return null
    if (mesocycleNumber <= 1 && !activePlan && completedPlans.length === 0) {
      return null;
    }

    // 2. Extract previous plan's primary exercises to guide rotation
    const referencePlan = activePlan || completedPlans[0];
    const previousExercises: string[] = [];
    if (referencePlan?.plan_data?.workouts && Array.isArray(referencePlan.plan_data.workouts)) {
      referencePlan.plan_data.workouts.forEach((w: any) => {
        if (Array.isArray(w?.exercises)) {
          w.exercises.forEach((ex: any) => {
            if (ex?.name && typeof ex.name === "string" && !previousExercises.includes(ex.name)) {
              previousExercises.push(ex.name);
            }
          });
        }
      });
    }

    // 3. Query workout completion stats from the previous plan
    let completedWorkoutsCount = 0;
    let totalWorkoutsCount = 0;

    if (referencePlan?.id) {
      const { data: workouts } = await supabase
        .from("fitness_os_workouts")
        .select("id, status")
        .eq("plan_id", referencePlan.id);

      if (workouts && workouts.length > 0) {
        totalWorkoutsCount = workouts.length;
        completedWorkoutsCount = workouts.filter((w: any) => w.status === "completed").length;
      }
    }

    const adherencePercentage =
      totalWorkoutsCount > 0 ? Math.round((completedWorkoutsCount / totalWorkoutsCount) * 100) : 100;

    // 4. Query latest body metrics vs baseline weight and latest tape measurements
    const baselineWeightKg = Number(
      profile?.weight_trend_baseline || profile?.weight || 70,
    );

    const [{ data: latestWeightMetric }, { data: latestTapeMetric }] = await Promise.all([
      supabase
        .from("fitness_os_body_metrics")
        .select("weight, recorded_at")
        .eq("user_id", userId)
        .not("weight", "is", null)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("fitness_os_body_metrics")
        .select("waist, chest, hip, neck, left_arm, right_arm, left_thigh, right_thigh, recorded_at")
        .eq("user_id", userId)
        .or("waist.not.is.null,chest.not.is.null,hip.not.is.null,neck.not.is.null,left_arm.not.is.null,right_arm.not.is.null,left_thigh.not.is.null,right_thigh.not.is.null")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const currentWeightKg = latestWeightMetric?.weight ? Number(latestWeightMetric.weight) : baselineWeightKg;
    const weightDeltaKg = Math.round((currentWeightKg - baselineWeightKg) * 10) / 10;

    let latestMeasurements: PlanProgressionContext["latestMeasurements"] = undefined;
    if (latestTapeMetric) {
      const armValues = [latestTapeMetric.left_arm, latestTapeMetric.right_arm]
        .map(Number)
        .filter((v) => !isNaN(v) && v >= 12 && v <= 90);
      const avgArm = armValues.length > 0
        ? Math.round((armValues.reduce((a, b) => a + b, 0) / armValues.length) * 10) / 10
        : undefined;

      const thighValues = [latestTapeMetric.left_thigh, latestTapeMetric.right_thigh]
        .map(Number)
        .filter((v) => !isNaN(v) && v >= 20 && v <= 140);
      const avgThigh = thighValues.length > 0
        ? Math.round((thighValues.reduce((a, b) => a + b, 0) / thighValues.length) * 10) / 10
        : undefined;

      const waistVal = Number(latestTapeMetric.waist);
      const chestVal = Number(latestTapeMetric.chest);
      const hipVal = Number(latestTapeMetric.hip);
      const neckVal = Number(latestTapeMetric.neck);

      const mObj: NonNullable<PlanProgressionContext["latestMeasurements"]> = {};
      if (!isNaN(waistVal) && waistVal >= 35 && waistVal <= 250) mObj.waist_cm = Math.round(waistVal * 10) / 10;
      if (!isNaN(chestVal) && chestVal >= 40 && chestVal <= 250) mObj.chest_cm = Math.round(chestVal * 10) / 10;
      if (avgArm !== undefined) mObj.arms_cm = avgArm;
      if (avgThigh !== undefined) mObj.thighs_cm = avgThigh;
      if (!isNaN(hipVal) && hipVal >= 40 && hipVal <= 250) mObj.hips_cm = Math.round(hipVal * 10) / 10;
      if (!isNaN(neckVal) && neckVal >= 15 && neckVal <= 80) mObj.neck_cm = Math.round(neckVal * 10) / 10;
      if (latestTapeMetric.recorded_at) mObj.recorded_at = String(latestTapeMetric.recorded_at).split("T")[0];

      if (Object.keys(mObj).length > 0) {
        latestMeasurements = mObj;
      }
    }

    if (!latestMeasurements) {
      const fallbackObj: NonNullable<PlanProgressionContext["latestMeasurements"]> = {};
      if (typeof profile.waist_cm === "number" && profile.waist_cm >= 35) fallbackObj.waist_cm = profile.waist_cm;
      if (typeof profile.chest_cm === "number" && profile.chest_cm >= 40) fallbackObj.chest_cm = profile.chest_cm;
      if (typeof profile.arm_cm === "number" && profile.arm_cm >= 12) fallbackObj.arms_cm = profile.arm_cm;
      if (typeof profile.thigh_cm === "number" && profile.thigh_cm >= 20) fallbackObj.thighs_cm = profile.thigh_cm;
      if (Object.keys(fallbackObj).length > 0) {
        latestMeasurements = fallbackObj;
      }
    }

    // 5. Progression Focus description across 3-month phase blocks
    const progressionFocus =
      mesocycleNumber === 2
        ? "Mesocycle 2: Progressive Overload & Secondary Movement Rotation"
        : mesocycleNumber === 3
          ? "Mesocycle 3: Peak Volume Accumulation & Phase 1 Climax"
          : mesocycleNumber === 4
            ? "Mesocycle 4 (Phase 2): New Stimulus, Split Specialization & Macro Recalibration"
            : mesocycleNumber === 5
              ? "Mesocycle 5 (Phase 2): Plateau Breakthrough & Hypertrophy Density"
              : mesocycleNumber === 6
                ? "Mesocycle 6 (Phase 2): Phase 2 Climax & Mid-Journey Transformation"
                : `Mesocycle ${mesocycleNumber} (Phase 3): Final Goal Push & Set-Point Consolidation`;

    return {
      mesocycleNumber,
      isRenewal,
      previousPlanTitle: referencePlan?.name || undefined,
      previousExercises: previousExercises.slice(0, 20),
      completedWorkoutsCount,
      totalWorkoutsCount,
      adherencePercentage,
      baselineWeightKg,
      currentWeightKg,
      weightDeltaKg,
      progressionFocus,
      latestMeasurements,
    };
  } catch (err) {
    console.warn("Failed to generate mesocycle progression context:", err);
    return null;
  }
}
