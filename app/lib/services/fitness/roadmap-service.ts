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
  activePlan: any,
): Promise<TransformationRoadmapData | null> {
  if (!activePlan?.created_at || !activePlan?.id) return null;

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
  const journeyStartDate = new Date(
    earliestPlanResult.data?.created_at || activePlan.created_at
  );
  const now = new Date();
  const daysOnJourney = Math.max(1, differenceInCalendarDays(now, journeyStartDate));

  const allWorkouts = workoutsResult.data || [];
  const weightLogs = weightLogsResult.data || [];

  // ── Goal direction & scientific rates ──
  const startWeight = Number(
    (profile as any).weight_trend_baseline || profile.weight
  ) || 70;
  const currentWeight = Number(profile.weight) || startWeight;
  const targetWeight = Number(profile.target_weight) || currentWeight;
  const goalLower = (profile.goal || "").toLowerCase();

  const isGoalLoss =
    goalLower.includes("loss") ||
    goalLower.includes("cut") ||
    goalLower.includes("fat");
  const isGoalGain =
    goalLower.includes("gain") ||
    goalLower.includes("bulk") ||
    goalLower.includes("muscle") ||
    goalLower.includes("mass");
  const isGoalRecomp =
    goalLower.includes("maintain") ||
    goalLower.includes("recomp") ||
    goalLower.includes("strength") ||
    goalLower.includes("fitness");

  const diffKg = Math.round(Math.abs(targetWeight - startWeight) * 10) / 10;
  const isMaintain = diffKg < 0.5 || (isGoalRecomp && diffKg <= 1.5);
  const direction: "loss" | "gain" | "maintain" =
    isMaintain ? "maintain" : (startWeight > targetWeight || isGoalLoss) ? "loss" : "gain";

  const monthlyRate = direction === "loss" ? 3.2 : direction === "gain" ? 1.3 : 0;

  // ── Total months projected ──
  let totalMonthsProjected: number;
  if (isMaintain || monthlyRate === 0) {
    totalMonthsProjected = 3; // Standard 12-week recomp
  } else {
    totalMonthsProjected = Math.max(3, Math.ceil(diffKg / monthlyRate));
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

    // Projected weight (using same logic as scientific-timeframe-card.tsx)
    let projectedWeight: number;
    if (isMaintain) {
      projectedWeight = startWeight;
    } else {
      const cumulativeDelta = direction === "loss"
        ? -Math.min(diffKg, monthlyRate * m)
        : Math.min(diffKg, monthlyRate * m);
      projectedWeight = Math.round((startWeight + cumulativeDelta) * 10) / 10;
      // Don't overshoot
      if (direction === "loss") projectedWeight = Math.max(targetWeight, projectedWeight);
      if (direction === "gain") projectedWeight = Math.min(targetWeight, projectedWeight);
    }

    // Status
    const status: MonthMilestone["status"] =
      m < currentMonth ? "completed" : m === currentMonth ? "current" : "upcoming";

    // Phase context from AI or fallback
    const aiEntry = aiTimeline[m - 1];
    const { phaseName, focusArea } = getMonthContext(
      m, direction, isMaintain, totalMonthsProjected,
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
  const consistencyScore =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

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
// Group months into 3-month phase blocks
// ─────────────────────────────────────────────────────────────────────────────

function groupIntoPhases(
  months: MonthMilestone[],
  direction: string,
  isMaintain: boolean,
): PhaseBlock[] {
  const phases: PhaseBlock[] = [];

  // Phase 1: Months 1–3
  const p1 = months.filter((m) => m.monthNumber <= 3);
  if (p1.length > 0) {
    phases.push({
      phaseNumber: 1,
      phaseName: isMaintain
        ? "Recomposition"
        : direction === "loss"
          ? "Cut & Define"
          : "Foundation & Growth",
      status: getBlockStatus(p1),
      months: p1,
      weightRange: weightRangeStr(p1),
    });
  }

  // Phase 2: Months 4–6
  const p2 = months.filter((m) => m.monthNumber >= 4 && m.monthNumber <= 6);
  if (p2.length > 0) {
    phases.push({
      phaseNumber: 2,
      phaseName: direction === "loss"
        ? "Sustained Fat Loss"
        : direction === "gain"
          ? "Progressive Overload"
          : "Advanced Recomp",
      status: getBlockStatus(p2),
      months: p2,
      weightRange: weightRangeStr(p2),
    });
  }

  // Phase 3: Months 7+
  const p3 = months.filter((m) => m.monthNumber >= 7);
  if (p3.length > 0) {
    phases.push({
      phaseNumber: 3,
      phaseName: "Final Push to Goal",
      status: getBlockStatus(p3),
      months: p3,
      weightRange: weightRangeStr(p3),
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
  aiDescription?: string,
  aiRoadmapEntry?: string,
): { phaseName: string; focusArea: string } {
  // Prefer AI-generated descriptions when available
  if (aiDescription) {
    return {
      phaseName: getGenericPhaseName(month, direction, isMaintain),
      focusArea: aiDescription,
    };
  }

  if (isMaintain) {
    const recompPhases: Record<number, { phaseName: string; focusArea: string }> = {
      1: { phaseName: "Baseline Adaptation", focusArea: "Dial in training intensity, establish protein targets, and stabilize metabolic rate" },
      2: { phaseName: "Body Recomposition", focusArea: "Subcutaneous fat reducing, muscular firmness increasing, strength PRs building" },
      3: { phaseName: "Peak Density", focusArea: "Measurable strength PRs and a visibly tighter, more athletic silhouette" },
    };
    return recompPhases[month] || { phaseName: "Maintenance", focusArea: "Sustaining your physique with consistent training" };
  }

  if (direction === "loss") {
    const lossPhases: Record<number, { phaseName: string; focusArea: string }> = {
      1: { phaseName: "Fat Adaptation", focusArea: "Establishing calorie deficit, water balance optimization, metabolic adaptation" },
      2: { phaseName: "Accelerated Loss", focusArea: "Visible waistline reduction, increased workout endurance, clothes fitting looser" },
      3: { phaseName: "Phase 1 Completion", focusArea: "Body recomposition visible, muscle retention confirmed, metabolic check-in" },
      4: { phaseName: "Sustained Deficit", focusArea: "Adjusted macros to prevent plateaus, training intensity maintained" },
      5: { phaseName: "Deep Cut", focusArea: "Stubborn fat areas targeted, definition sharpening across core and arms" },
      6: { phaseName: "Consolidation", focusArea: "Approaching target, preparing for reverse diet and new maintenance" },
    };
    return lossPhases[month] || { phaseName: "Final Push", focusArea: "Reaching your goal physique safely while keeping muscle" };
  }

  // Gain
  const gainPhases: Record<number, { phaseName: string; focusArea: string }> = {
    1: { phaseName: "Neural Adaptation", focusArea: "Glycogen replenishment, exercise form mastery, establishing progressive overload" },
    2: { phaseName: "Strength Foundation", focusArea: "Measurable compound lift increases, fuller muscle bellies, appetite adapting" },
    3: { phaseName: "Phase 1 Completion", focusArea: "Noticeable chest, shoulder, and back hypertrophy with progressive tension" },
    4: { phaseName: "Hypertrophy Push", focusArea: "Advanced progressive overload, isolation volume increase, deload weeks" },
    5: { phaseName: "Mass Building", focusArea: "Visible size gains, strength PRs across all lifts, surplus nutrition locked" },
    6: { phaseName: "Density Phase", focusArea: "Myofibrillar density increasing, muscle maturity developing" },
  };
  return gainPhases[month] || { phaseName: "Final Growth", focusArea: "Reaching your target mass with lean muscle quality" };
}

function getGenericPhaseName(month: number, direction: string, isMaintain: boolean): string {
  if (isMaintain) {
    return month === 1 ? "Baseline" : month === 2 ? "Recomposition" : "Peak Density";
  }
  if (month <= 2) return direction === "loss" ? "Fat Adaptation" : "Neural Adaptation";
  if (month === 3) return "Phase 1 Completion";
  if (month <= 6) return direction === "loss" ? "Sustained Deficit" : "Hypertrophy Push";
  return "Final Push";
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
  const checkDate = new Date(now);
  const todayStr = format(checkDate, "yyyy-MM-dd");
  // eslint-disable-next-line no-constant-condition
  while (true) {
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
