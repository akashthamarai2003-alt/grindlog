import { differenceInCalendarDays, addDays, format } from "date-fns";
import { createAdminClient } from "@/lib/services/supabase/admin";
import type {
  TransformationRoadmapData,
  MonthMilestone,
  PhaseBlock,
} from "@/types/fitness/roadmap";

// ─────────────────────────────────────────────────────────────────────────────
// Compute the FULL transformation roadmap: Phase 1 → Phase 2 → Phase 3 → Goal
//
// 3 lightweight indexed DB queries. All else is pure in-memory computation.
// Uses the same sports-science rates as scientific-timeframe-card.tsx:
//   Fat loss:    3.2 kg/month  (~0.75 kg/week)
//   Muscle gain: 1.3 kg/month  (~0.3 kg/week)
//   Recomp:      0 kg/month    (12-week standard)
// ─────────────────────────────────────────────────────────────────────────────

export async function getRoadmapData(
  userId: string,
  profile: any,
  activePlan?: any,
  targetDateStr?: string,
): Promise<TransformationRoadmapData | null> {
  if (!userId || !profile) return null;

  const admin = createAdminClient();

  // ── 3 parallel queries ──
  const [earliestPlanResult, workoutsResult, weightLogsResult] = await Promise.all([
    // Q1: Journey start = earliest plan creation
    admin
      .from("fitness_os_workout_plans")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    // Q2: ALL workouts across all plans
    admin
      .from("fitness_os_workouts")
      .select("id, workout_date, status, name, plan_id")
      .eq("user_id", userId)
      .order("workout_date", { ascending: true }),
    // Q3: ALL weight logs
    admin
      .from("fitness_os_body_metrics")
      .select("weight, recorded_at")
      .eq("user_id", userId)
      .not("weight", "is", null)
      .order("recorded_at", { ascending: true }),
  ]);

  // ── Journey start date ──
  const rawStartDate =
    earliestPlanResult.data?.created_at ||
    activePlan?.created_at ||
    profile?.created_at ||
    new Date();
  const journeyStartDate = new Date(rawStartDate);
  const now = targetDateStr ? new Date(`${targetDateStr}T12:00:00Z`) : new Date();
  // Day 1 on signup day, Day 2 on next day, etc.
  const daysOnJourney = Math.max(1, differenceInCalendarDays(now, journeyStartDate) + 1);

  const allWorkouts = workoutsResult.data || [];
  const weightLogs = weightLogsResult.data || [];

  // ── Goal direction & weights ──
  const earliestWeightLog = weightLogs.length > 0 ? Number(weightLogs[0].weight) : null;
  const latestWeightLog = weightLogs.length > 0 ? Number(weightLogs[weightLogs.length - 1].weight) : null;

  const startWeight = Number(
    (profile as any).starting_weight ||
    (profile as any).weight_trend_baseline ||
    earliestWeightLog ||
    profile.weight
  ) || 70;
  const currentWeight = Number(latestWeightLog || profile.weight || startWeight);

  // ── Goal recognition from onboarding ──
  const goalLower = (profile.goal || "").toLowerCase().trim();

  const isGoalRecomp =
    goalLower.includes("maintain") ||
    goalLower.includes("recomp") ||
    goalLower.includes("strength") ||
    goalLower.includes("fitness") ||
    goalLower.includes("lose fat + build muscle") ||
    goalLower.includes("build muscle + lose fat");

  const isGoalLoss =
    !isGoalRecomp && (
      goalLower.includes("loss") ||
      goalLower.includes("cut") ||
      goalLower.includes("fat") ||
      goalLower.includes("lose")
    );

  const isGoalGain =
    !isGoalRecomp && (
      goalLower.includes("gain") ||
      goalLower.includes("bulk") ||
      goalLower.includes("muscle") ||
      goalLower.includes("mass")
    );

  // ── Target weight sanitization & intelligent defaults ──
  let rawTargetWeight = Number(profile.target_weight);
  let targetWeight: number;

  if (!rawTargetWeight || isNaN(rawTargetWeight) || rawTargetWeight <= 20) {
    if (isGoalLoss) {
      targetWeight = Math.round(startWeight * 0.92 * 10) / 10;
    } else if (isGoalGain) {
      targetWeight = Math.round(startWeight * 1.08 * 10) / 10;
    } else {
      targetWeight = startWeight;
    }
  } else {
    // Correct inverted user inputs (e.g. said "Lose Fat" but typed higher target)
    if (isGoalLoss && rawTargetWeight > startWeight) {
      targetWeight = Math.round(startWeight * 0.92 * 10) / 10;
    } else if (isGoalGain && rawTargetWeight < startWeight) {
      targetWeight = Math.round(startWeight * 1.08 * 10) / 10;
    } else {
      targetWeight = rawTargetWeight;
    }
  }

  const diffKg = Math.round(Math.abs(targetWeight - startWeight) * 10) / 10;
  const isMaintain = diffKg < 0.5 || isGoalRecomp || (diffKg <= 1.5 && !isGoalLoss && !isGoalGain);
  const direction: "loss" | "gain" | "maintain" =
    isMaintain ? "maintain" : targetWeight > startWeight ? "gain" : "loss";

  // Scientific sports-science monthly delta rates
  const monthlyRate = direction === "loss" ? 3.2 : direction === "gain" ? 1.3 : 0;

  // ── Total months projected ──
  const userDeadlineDays =
    typeof (profile as any).target_deadline_days === "number" && (profile as any).target_deadline_days > 0
      ? (profile as any).target_deadline_days
      : null;

  let totalMonthsProjected: number;
  if (isMaintain || monthlyRate === 0) {
    totalMonthsProjected = 3; // Standard 12-week recomp mesocycle
  } else if (userDeadlineDays) {
    const userMonths = Math.ceil(userDeadlineDays / 28);
    // Respect user deadline while maintaining safe bounds (3 to 12 months)
    totalMonthsProjected = Math.max(3, Math.min(12, userMonths));
  } else {
    totalMonthsProjected = Math.max(3, Math.min(12, Math.ceil(diffKg / monthlyRate)));
  }

  // ── Current position ──
  const currentMonth = Math.max(1, Math.min(totalMonthsProjected, Math.ceil(daysOnJourney / 28)));
  const currentWeekInMonth = Math.min(4, Math.ceil((daysOnJourney - (currentMonth - 1) * 28) / 7));

  // ── AI-generated timeline descriptions (personalized) ──
  const aiTimeline: any[] =
    profile?.ai_strategy?.timeline_projection || [];
  const aiRoadmap: string[] =
    profile?.ai_strategy?.progress_roadmap || [];

  // ── Build monthly milestones ──
  const months: MonthMilestone[] = [];

  for (let m = 1; m <= totalMonthsProjected; m++) {
    const monthStart = addDays(journeyStartDate, (m - 1) * 28);
    const monthEnd = addDays(journeyStartDate, m * 28 - 1);
    const monthStartStr = format(monthStart, "yyyy-MM-dd");
    const monthEndStr = format(monthEnd, "yyyy-MM-dd");

    // Bucket workouts
    const mWorkouts = allWorkouts.filter(
      (w: any) => w.workout_date >= monthStartStr && w.workout_date <= monthEndStr
    );
    const completed = mWorkouts.filter((w: any) => w.status === "completed").length;
    const scheduled = mWorkouts.length;

    // Bucket weight logs → latest in this month
    const mWeights = weightLogs.filter((wl: any) => {
      const d = (wl.recorded_at || "").split("T")[0];
      return d >= monthStartStr && d <= monthEndStr;
    });
    const latestWeight =
      mWeights.length > 0 ? Number(mWeights[mWeights.length - 1].weight) : null;

    // Projected weight (using calibrated linear mesocycle projection)
    let projectedWeight: number;
    if (isMaintain) {
      projectedWeight = startWeight;
    } else {
      const stepDelta = diffKg / totalMonthsProjected;
      const cumulativeDelta = direction === "loss" ? -(stepDelta * m) : stepDelta * m;
      projectedWeight = Math.round((startWeight + cumulativeDelta) * 10) / 10;
      // Don't overshoot
      if (direction === "loss") projectedWeight = Math.max(targetWeight, projectedWeight);
      if (direction === "gain") projectedWeight = Math.min(targetWeight, projectedWeight);
    }

    // Status
    const status: MonthMilestone["status"] =
      m < currentMonth ? "completed" : m === currentMonth ? "current" : "upcoming";

    // Phase context customized with onboarding details
    const aiEntry = aiTimeline[m - 1];
    const { phaseName, focusArea, trainingFocus, nutritionFocus } = getMonthContext(
      m, direction, isMaintain, totalMonthsProjected, profile,
      aiEntry?.expected_changes,
      aiRoadmap[m - 1],
    );

    // Markers
    const isPhaseEnd = m % 3 === 0;
    const isFinalGoal = m === totalMonthsProjected ||
      (projectedWeight === targetWeight && !isMaintain && m >= 2);

    // Milestone badge
    const milestone = generateMonthMilestone(
      m, completed, scheduled, status, isPhaseEnd, isFinalGoal, direction,
    );

    months.push({
      monthNumber: m,
      status,
      dateRange: formatDateRange(monthStart, monthEnd),
      weekRange: `Weeks ${(m - 1) * 4 + 1}–${m * 4}`,
      phaseName,
      focusArea,
      trainingFocus,
      nutritionFocus,
      projectedWeight,
      actualWeight: latestWeight,
      weightDelta: null,
      workoutsCompleted: completed,
      workoutsScheduled: scheduled,
      isPhaseEnd,
      isFinalGoal,
      milestone,
    });
  }

  // ── Weight deltas ──
  for (let i = 0; i < months.length; i++) {
    if (months[i].actualWeight == null) continue;
    if (i === 0) {
      months[i].weightDelta = round1(months[i].actualWeight! - startWeight);
    } else if (months[i - 1].actualWeight != null) {
      months[i].weightDelta = round1(months[i].actualWeight! - months[i - 1].actualWeight!);
    }
  }

  // ── Group into phases (3 months each) ──
  const phases = groupIntoPhases(months, direction, isMaintain);

  // ── Progress percentage ──
  let progressPercentage = 0;
  if (!isMaintain && diffKg > 0) {
    const progressMade = direction === "gain"
      ? currentWeight - startWeight
      : startWeight - currentWeight;
    progressPercentage = Math.round(
      Math.min(100, Math.max(0, (Math.max(0, progressMade) / diffKg) * 100))
    );
  } else if (isMaintain) {
    // Time-based progress for recomp
    progressPercentage = Math.round(Math.min(100, (daysOnJourney / (totalMonthsProjected * 28)) * 100));
  }

  // ── Aggregate stats ──
  const totalCompleted = allWorkouts.filter((w: any) => w.status === "completed").length;
  const totalScheduled = allWorkouts.length;
  const streak = computeStreak(allWorkouts, now);
  // On Day 1 with 0 scheduled workouts yet, show 100% baseline consistency
  const consistencyScore =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 100;

  return {
    journeyStartDate: journeyStartDate.toISOString(),
    totalMonthsProjected,
    currentMonth,
    currentWeekInMonth,
    currentDay: daysOnJourney,
    goal: profile.goal || "",
    direction,
    startWeight,
    currentWeight,
    targetWeight,
    progressPercentage,
    phases,
    totalWorkoutsCompleted: totalCompleted,
    totalWorkoutsScheduled: totalScheduled,
    streak,
    consistencyScore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Group months into 3-month phase blocks (Supports 1 to 4 phases up to 12 months)
// ─────────────────────────────────────────────────────────────────────────────

function groupIntoPhases(
  months: MonthMilestone[],
  direction: string,
  isMaintain: boolean,
): PhaseBlock[] {
  const phases: PhaseBlock[] = [];
  const phaseNames: Record<number, Record<string, string>> = {
    1: {
      loss: "Cut & Define",
      gain: "Foundation & Growth",
      maintain: "Recomposition",
    },
    2: {
      loss: "Sustained Fat Loss",
      gain: "Progressive Overload",
      maintain: "Advanced Recomp",
    },
    3: {
      loss: "Deep Definition",
      gain: "Hypertrophy Push",
      maintain: "Peak Density",
    },
    4: {
      loss: "Final Goal Consolidation",
      gain: "Peak Physique Accumulation",
      maintain: "Physique Mastery",
    },
  };

  const totalPhases = Math.ceil(months.length / 3);
  for (let p = 1; p <= totalPhases; p++) {
    const startM = (p - 1) * 3 + 1;
    const endM = p * 3;
    const pMonths = months.filter((m) => m.monthNumber >= startM && m.monthNumber <= endM);
    if (pMonths.length === 0) continue;

    const dirKey = isMaintain ? "maintain" : direction === "gain" ? "gain" : "loss";
    const phaseName = phaseNames[p]?.[dirKey] || `Phase ${p} Progression`;

    phases.push({
      phaseNumber: p,
      phaseName,
      status: getBlockStatus(pMonths),
      months: pMonths,
      weightRange: weightRangeStr(pMonths),
    });
  }

  return phases;
}

function getBlockStatus(
  months: MonthMilestone[]
): "completed" | "current" | "upcoming" {
  if (months.some((m) => m.status === "current")) return "current";
  if (months.every((m) => m.status === "completed")) return "completed";
  return "upcoming";
}

function weightRangeStr(months: MonthMilestone[]): string {
  if (months.length === 0) return "";
  const first = months[0].projectedWeight;
  const last = months[months.length - 1].projectedWeight;
  if (first === last) return `${first} kg`;
  return `${Math.min(first, last)} – ${Math.max(first, last)} kg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Month context — personalized descriptions
// ─────────────────────────────────────────────────────────────────────────────

function getMonthContext(
  month: number,
  direction: string,
  isMaintain: boolean,
  totalMonths: number,
  profile?: any,
  aiDescription?: string,
  aiRoadmapEntry?: string,
): { phaseName: string; focusArea: string; trainingFocus?: string; nutritionFocus?: string } {
  const genericPhaseName = getGenericPhaseName(month, direction, isMaintain);

  const isHome = profile?.training_location === "Home";
  const isVeg = profile?.food_type === "Vegetarian" || profile?.food_type === "Vegan";
  const isVegan = profile?.food_type === "Vegan";

  const dietNote = isVegan
    ? " (Plant-based anchors: tofu, soy chunks, lentils, pea protein)"
    : isVeg
    ? " (Veg anchors: paneer, Greek yogurt/curd, lentils, whey)"
    : " (Lean anchors: eggs, chicken breast, fish, dairy)";

  const locationNote = isHome
    ? " [Home Setup: Calisthenics levers, dumbbell tempo & high tension]"
    : " [Gym Setup: Barbell compounds, cable isolation & progressive overload]";

  if (isMaintain) {
    const recompData: Record<number, { focusArea: string; trainingFocus: string; nutritionFocus: string }> = {
      1: {
        focusArea: aiDescription || "Establish workout rhythm, dial in compound exercise execution, and stabilize metabolic baseline.",
        trainingFocus: `Movement mechanics mastery, consistent session completion, RPE 6-7 calibration${locationNote}`,
        nutritionFocus: `Caloric maintenance target, 2.0g/kg protein intake, 3-4L daily hydration${dietNote}`,
      },
      2: {
        focusArea: aiDescription || "Body recomposition underway: subcutaneous fat reducing, muscle firmness increasing, compound lifts progressing.",
        trainingFocus: `Progressive overload on major lifts, increased time-under-tension, controlled eccentrics${locationNote}`,
        nutritionFocus: `Nutrient timing around workout windows, electrolyte balance, optimal sleep recovery${dietNote}`,
      },
      3: {
        focusArea: aiDescription || "Peak muscle density achieved: noticeable strength improvements and athletic silhouette refinement.",
        trainingFocus: `Peak strength testing, supersets and density blocks, volume optimization${locationNote}`,
        nutritionFocus: `Long-term sustainable macro balance, lifestyle integration, metabolic stability${dietNote}`,
      },
    };
    const current = recompData[month] || {
      focusArea: aiDescription || "Sustaining your athletic silhouette through structured training and flexible nutrition.",
      trainingFocus: `Periodized volume maintenance and injury prevention${locationNote}`,
      nutritionFocus: `Intuitive maintenance eating with protein anchor${dietNote}`,
    };
    return { phaseName: genericPhaseName, ...current };
  }

  if (direction === "loss") {
    const lossData: Record<number, { focusArea: string; trainingFocus: string; nutritionFocus: string }> = {
      1: {
        focusArea: aiDescription || "Establishing caloric deficit, flushing intracellular water retention, and metabolic fat adaptation.",
        trainingFocus: `Compound movement foundation, elevated daily NEAT steps, moderate intensity volume${locationNote}`,
        nutritionFocus: `Targeted 300-500 kcal deficit, 2.0-2.2g/kg protein anchor, high-volume whole foods${dietNote}`,
      },
      2: {
        focusArea: aiDescription || "Accelerated fat loss phase: waistline reduction clearly visible, muscle tone emerging, stamina improving.",
        trainingFocus: `Progressive overload preservation, metabolic supersets, post-workout conditioning${locationNote}`,
        nutritionFocus: `Strict deficit adherence, zero liquid calories, micronutrient density optimization${dietNote}`,
      },
      3: {
        focusArea: aiDescription || "Phase 1 completion milestone: major reduction in body fat percentage, muscle shape defined across core and arms.",
        trainingFocus: `Deload and intensity maintenance, heavy compounds to retain lean mass${locationNote}`,
        nutritionFocus: `Structured refeed meal if needed, metabolic check-in, fiber and hydration audit${dietNote}`,
      },
      4: {
        focusArea: aiDescription || "Sustained deficit loading: targeting stubborn fat reserves with adjusted macros to prevent metabolic slowdown.",
        trainingFocus: `High-density training, drop-sets and rest-pause sets, targeted isolation${locationNote}`,
        nutritionFocus: `Macro recalculation for lowered bodyweight, nutrient partitioning${dietNote}`,
      },
      5: {
        focusArea: aiDescription || "Deep cut refinement: muscular striations appearing, vascularity increasing, athletic silhouette locked in.",
        trainingFocus: `Peak workout intensity, core stabilization, volume preservation${locationNote}`,
        nutritionFocus: `Precision meal timing, peri-workout carbohydrate allocation${dietNote}`,
      },
      6: {
        focusArea: aiDescription || "Consolidation phase: reaching final goal body composition, setting up safe reverse-dieting to maintain results.",
        trainingFocus: `Strength consolidation, mobility maintenance, sustainable workout habits${locationNote}`,
        nutritionFocus: `Gradual calorie increase to maintenance set-point without fat rebound${dietNote}`,
      },
    };
    const current = lossData[month] || {
      focusArea: aiDescription || "Reaching your target body composition safely while maintaining lean muscle mass.",
      trainingFocus: `High-intensity resistance training to signal muscle retention${locationNote}`,
      nutritionFocus: `Carefully calibrated caloric deficit with high protein${dietNote}`,
    };
    return { phaseName: genericPhaseName, ...current };
  }

  // Gain / Bulking
  const gainData: Record<number, { focusArea: string; trainingFocus: string; nutritionFocus: string }> = {
    1: {
      focusArea: aiDescription || "Neural adaptation phase: neuromuscular efficiency, form mastery on compound lifts, initial glycogen storage.",
      trainingFocus: `Perfect exercise technique, motor unit recruitment, compound lifting foundation${locationNote}`,
      nutritionFocus: `Controlled caloric surplus (+250 kcal), 1.8-2.0g/kg protein, complex carb loading${dietNote}`,
    },
    2: {
      focusArea: aiDescription || "Strength foundation: measurable strength PRs on major compound lifts, fuller muscle bellies visible.",
      trainingFocus: `Systematic progressive overload, +2.5kg weight increments, 6-10 rep hypertrophy range${locationNote}`,
      nutritionFocus: `Consistent daily surplus adherence, intra-workout hydration, creatine saturation${dietNote}`,
    },
    3: {
      focusArea: aiDescription || "Hypertrophy loading: noticeable muscle growth in chest, shoulders, and back with progressive mechanical tension.",
      trainingFocus: `Hypertrophy volume expansion, 12-16 sets per muscle group per week, form discipline${locationNote}`,
      nutritionFocus: `Caloric surplus adjustment, post-workout fast-digesting protein and carbs${dietNote}`,
    },
    4: {
      focusArea: aiDescription || "Advanced progressive overload: breaking through strength plateaus with targeted accessory work and deload balance.",
      trainingFocus: `Heavy compound anchors + hypertrophy isolation accessories, mind-muscle connection${locationNote}`,
      nutritionFocus: `Sustained nutrient density, clean calorie surplus, digestive health optimization${dietNote}`,
    },
    5: {
      focusArea: aiDescription || "Mass building acceleration: substantial lean tissue accretion, overall frame filling out noticeably.",
      trainingFocus: `High-volume hypertrophy, mechanical drops, intense eccentric control${locationNote}`,
      nutritionFocus: `Calorie density management, high quality fats and slow burning carbohydrates${dietNote}`,
    },
    6: {
      focusArea: aiDescription || "Peak physique consolidation: target lean mass achieved with balanced muscle symmetry and dense muscle maturity.",
      trainingFocus: `Weak point targeting, symmetry and posture balance, peak strength preservation${locationNote}`,
      nutritionFocus: `Transitioning to maintenance calories to solidify new lean muscle tissue${dietNote}`,
    },
  };
  const current = gainData[month] || {
    focusArea: aiDescription || "Reaching target muscle mass with continuous progressive overload and surplus nutrition.",
    trainingFocus: `Progressive mechanical tension on multi-joint lifts${locationNote}`,
    nutritionFocus: `Sustained clean hypercaloric diet with adequate protein${dietNote}`,
  };
  return { phaseName: genericPhaseName, ...current };
}

function getGenericPhaseName(month: number, direction: string, isMaintain: boolean): string {
  if (isMaintain) {
    switch (month) {
      case 1: return "Baseline Adaptation";
      case 2: return "Body Recomposition";
      case 3: return "Peak Density";
      default: return "Physique Maintenance";
    }
  }
  if (direction === "loss") {
    switch (month) {
      case 1: return "Fat Adaptation";
      case 2: return "Accelerated Loss";
      case 3: return "Phase 1 Completion";
      case 4: return "Sustained Deficit";
      case 5: return "Deep Definition";
      case 6: return "Phase 2 Peak";
      default: return "Goal Attainment";
    }
  }
  // direction === "gain"
  switch (month) {
    case 1: return "Neural Adaptation";
    case 2: return "Strength Foundation";
    case 3: return "Hypertrophy Loading";
    case 4: return "Progressive Overload";
    case 5: return "Mass Building";
    case 6: return "Phase 2 Peak";
    default: return "Peak Physique";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone generation
// ─────────────────────────────────────────────────────────────────────────────

function generateMonthMilestone(
  month: number,
  completed: number,
  scheduled: number,
  status: string,
  isPhaseEnd: boolean,
  isFinalGoal: boolean,
  direction: string,
): string | null {
  if (status === "upcoming") {
    if (isFinalGoal) return "🎯 Goal Achievement Target";
    if (isPhaseEnd) return "📸 Phase Check-In & Body Scan";
    return null;
  }
  if (status === "current") {
    if (month === 1) return "📊 Building your foundation — consistency is king";
    return "📊 Keep pushing — results are compounding";
  }
  // Completed months
  if (completed === scheduled && scheduled > 0) return "💪 Perfect month — every workout crushed";
  if (scheduled > 0 && completed >= scheduled * 0.8) return "🔥 Strong month — near perfect consistency";
  if (scheduled > 0 && completed >= scheduled * 0.5) return "👊 Solid effort — building momentum";
  if (completed > 0) return "🌱 Started the habit — keep showing up";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak & helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeStreak(allWorkouts: any[], now: Date): number {
  const completedDates = new Set(
    allWorkouts
      .filter((w: any) => w.status === "completed")
      .map((w: any) => w.workout_date)
  );
  let streak = 0;
  let iterations = 0;
  const checkDate = new Date(now);
  const todayStr = format(checkDate, "yyyy-MM-dd");
  while (iterations < 365) {
    iterations++;
    const ymd = format(checkDate, "yyyy-MM-dd");
    if (completedDates.has(ymd)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (ymd === todayStr) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
