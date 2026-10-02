import { differenceInCalendarDays, addDays, format } from "date-fns";
import { createAdminClient } from "@/lib/services/supabase/admin";
import type { TransformationRoadmapData, WeekMilestone } from "@/types/fitness/roadmap";

// ─────────────────────────────────────────────────────────────────────────────
// Compute the live transformation roadmap data for the dashboard.
// Only 2 lightweight DB queries — all else is pure in-memory computation.
// ─────────────────────────────────────────────────────────────────────────────

export async function getRoadmapData(
  userId: string,
  profile: any,
  activePlan: any,
): Promise<TransformationRoadmapData | null> {
  if (!activePlan?.created_at || !activePlan?.id) return null;

  const planStartDate = new Date(activePlan.created_at);
  const now = new Date();
  const daysOnPlan = Math.max(1, differenceInCalendarDays(now, planStartDate));
  const currentWeek = Math.min(4, Math.ceil(daysOnPlan / 7));
  const currentMonth = Math.ceil(daysOnPlan / 28) || 1;

  // Week boundaries anchored to plan start date
  const weekBoundaries = Array.from({ length: 4 }, (_, i) => ({
    weekNumber: i + 1,
    start: addDays(planStartDate, i * 7),
    end: addDays(planStartDate, i * 7 + 6),
  }));

  // ── 2 parallel indexed queries ──
  const admin = createAdminClient();
  const planStartStr = format(planStartDate, "yyyy-MM-dd");

  const [workoutsResult, weightLogsResult] = await Promise.all([
    admin
      .from("fitness_os_workouts")
      .select("id, workout_date, status, name")
      .eq("plan_id", activePlan.id)
      .gte("workout_date", planStartStr)
      .order("workout_date", { ascending: true }),
    admin
      .from("fitness_os_body_metrics")
      .select("weight, recorded_at")
      .eq("user_id", userId)
      .not("weight", "is", null)
      .gte("recorded_at", planStartDate.toISOString())
      .order("recorded_at", { ascending: true }),
  ]);

  const allWorkouts = workoutsResult.data || [];
  const weightLogs = weightLogsResult.data || [];

  // ── Goal direction & weekly projection rate ──
  const startWeight = Number(
    (profile as any).weight_trend_baseline || profile.weight
  );
  const currentWeight = Number(profile.weight) || startWeight;
  const targetWeight = Number(profile.target_weight) || currentWeight;
  const goalLower = (profile.goal || "").toLowerCase();

  const direction: "loss" | "gain" | "maintain" =
    goalLower.includes("loss") || goalLower.includes("cut") || goalLower.includes("fat")
      ? "loss"
      : goalLower.includes("gain") || goalLower.includes("bulk") || goalLower.includes("muscle")
        ? "gain"
        : "maintain";

  // Safe weekly rates from the existing scientific engine
  const weeklyRate = direction === "loss" ? -0.75 : direction === "gain" ? 0.3 : 0;

  // ── Build week milestones ──
  const weeks: WeekMilestone[] = weekBoundaries.map((wb) => {
    const weekStart = format(wb.start, "yyyy-MM-dd");
    const weekEnd = format(wb.end, "yyyy-MM-dd");

    // Bucket workouts into this week
    const weekWorkouts = allWorkouts.filter(
      (w: any) => w.workout_date >= weekStart && w.workout_date <= weekEnd
    );
    const completed = weekWorkouts.filter((w: any) => w.status === "completed").length;
    const scheduled = weekWorkouts.length;

    // Latest weight log in this week
    const weekWeights = weightLogs.filter((wl: any) => {
      const d = (wl.recorded_at || "").split("T")[0];
      return d >= weekStart && d <= weekEnd;
    });
    const latestWeight =
      weekWeights.length > 0 ? Number(weekWeights[weekWeights.length - 1].weight) : null;

    // Projected weight for end of this week
    const projectedWeight =
      startWeight > 0
        ? Math.round((startWeight + weeklyRate * wb.weekNumber) * 10) / 10
        : null;

    const status: WeekMilestone["status"] =
      wb.weekNumber < currentWeek
        ? "completed"
        : wb.weekNumber === currentWeek
          ? "current"
          : "upcoming";

    const milestone = generateMilestone(wb.weekNumber, completed, scheduled, status);

    return {
      weekNumber: wb.weekNumber,
      status,
      dateRange: formatDateRange(wb.start, wb.end),
      startDate: weekStart,
      endDate: weekEnd,
      workoutsCompleted: completed,
      workoutsScheduled: scheduled,
      projectedWeight,
      actualWeight: latestWeight,
      weightDelta: null,
      milestone,
    };
  });

  // ── Week-over-week weight deltas ──
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].actualWeight == null) continue;
    if (i === 0) {
      weeks[i].weightDelta =
        Math.round((weeks[i].actualWeight! - startWeight) * 10) / 10;
    } else if (weeks[i - 1].actualWeight != null) {
      weeks[i].weightDelta =
        Math.round((weeks[i].actualWeight! - weeks[i - 1].actualWeight!) * 10) / 10;
    }
  }

  // ── Phase classification ──
  const { phaseName, phaseDescription } = getPhaseInfo(currentWeek, direction);

  // ── Aggregate stats ──
  const totalCompleted = allWorkouts.filter((w: any) => w.status === "completed").length;
  const totalScheduled = allWorkouts.length;
  const streak = computeStreak(allWorkouts, now);
  const consistencyScore =
    totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

  return {
    currentDay: daysOnPlan,
    currentWeek,
    currentMonth,
    totalWeeks: 4,
    planStartDate: planStartDate.toISOString(),
    goal: profile.goal || "",
    direction,
    phaseName,
    phaseDescription,
    startWeight: startWeight || 0,
    currentWeight: currentWeight || 0,
    targetWeight: targetWeight || 0,
    weeks,
    totalWorkoutsCompleted: totalCompleted,
    totalWorkoutsScheduled: totalScheduled,
    streak,
    consistencyScore,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getPhaseInfo(
  currentWeek: number,
  direction: string
): { phaseName: string; phaseDescription: string } {
  if (currentWeek <= 2) {
    return {
      phaseName: "Foundation",
      phaseDescription:
        direction === "loss"
          ? "Building calorie deficit habits and workout consistency"
          : direction === "gain"
            ? "Establishing progressive overload base and surplus nutrition"
            : "Locking in training form and daily routine",
    };
  }
  if (currentWeek === 3) {
    return {
      phaseName: "Momentum",
      phaseDescription:
        direction === "loss"
          ? "Fat adaptation kicking in, energy stabilizing"
          : direction === "gain"
            ? "Compound lifts progressing, glycogen stores optimizing"
            : "Strength and endurance gains becoming measurable",
    };
  }
  return {
    phaseName: "Peak & Review",
    phaseDescription:
      "Final push before mesocycle check-in. Review progress & prepare for next phase.",
  };
}

function generateMilestone(
  week: number,
  completed: number,
  scheduled: number,
  status: string
): string | null {
  if (status === "upcoming") {
    if (week === 4) return "🔄 Phase Check-In & Plan Renewal";
    if (week === 3) return "🎯 Strength gains become visible";
    return null;
  }
  if (status === "current") {
    return "📊 Keep pushing — results compound this week";
  }
  // Completed week milestones
  if (completed === scheduled && scheduled > 0)
    return "💪 Perfect week — every workout crushed";
  if (completed >= scheduled * 0.8) return "🔥 Strong week — almost perfect";
  if (completed >= scheduled * 0.5) return "👊 Solid effort — building momentum";
  if (completed > 0) return "🌱 Started the habit — keep showing up";
  return null;
}

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
      // Grace for today — workout might not be done yet
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatDateRange(start: Date, end: Date): string {
  const s = format(start, "MMM d");
  const e = format(end, "MMM d");
  return `${s} – ${e}`;
}
