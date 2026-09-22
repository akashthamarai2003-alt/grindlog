import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { WorkoutPageData } from "@/types/fitness/workout-page";

interface CachedEntry {
  data: WorkoutPageData;
  timestamp: number;
}

const workoutServerCache = new Map<string, CachedEntry>();

export function invalidateWorkoutServerCache(userId?: string) {
  if (userId) {
    workoutServerCache.delete(userId);
  } else {
    workoutServerCache.clear();
  }
}

export async function getWorkoutPageData(userId: string): Promise<WorkoutPageData> {
  const cached = workoutServerCache.get(userId);
  const now = Date.now();

  // 30-second server cache: return in 0ms if visited recently
  if (cached && (now - cached.timestamp < 30_000)) {
    return cached.data;
  }

  const admin = createAdminClient();
  const nowDate = new Date();

  // 1. Fetch user timezone, active workout plan, and subscription in parallel
  const [
    { data: mainProfile },
    { data: activePlan },
    subscriptionPlan,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("timezone")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("fitness_os_workout_plans")
      .select("id, name, description, plan_data")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getFitnessPlan(userId),
  ]);

  const tz = mainProfile?.timezone || "UTC";
  const userLocalDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(nowDate);

  const formatter = new Intl.DateTimeFormat("en-US", { 
    timeZone: tz, weekday: "short", month: "short", day: "numeric" 
  });
  const dateStr = formatter.format(nowDate);

  const isFree = subscriptionPlan?.id === "free";

  // Calculate Monday to Sunday of the active week
  const activeDate = new Date(`${userLocalDate}T12:00:00Z`);
  const dayOfWeek = activeDate.getUTCDay(); // 0 is Sunday, 1 is Monday
  const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(activeDate);
  startOfWeek.setDate(activeDate.getDate() - distToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekStartStr = startOfWeek.toISOString().split("T")[0];
  const weekEndStr = endOfWeek.toISOString().split("T")[0];

  // 2. Fetch workouts for the current week or in-progress, plus AI notes if pro
  const [
    { data: calendarWorkouts },
    { data: inProgressWorkouts },
    { data: aiNotes },
  ] = await Promise.all([
    admin
      .from("fitness_os_workouts")
      .select("id, name, workout_date, status, duration_minutes, plan_id")
      .eq("user_id", userId)
      .gte("workout_date", weekStartStr)
      .lte("workout_date", weekEndStr)
      .order("workout_date", { ascending: true }),
    admin
      .from("fitness_os_workouts")
      .select("id, name, workout_date, status, duration_minutes, plan_id")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .limit(1),
    subscriptionPlan?.id === "pro"
      ? admin
          .from("workout_ai_notes")
          .select("workout_id, note")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  // Combine calendar workouts with any in-progress workout outside the current week
  const combinedWorkoutsMap = new Map<string, any>();
  (calendarWorkouts || []).forEach((w: any) => combinedWorkoutsMap.set(w.id, w));
  (inProgressWorkouts || []).forEach((w: any) => combinedWorkoutsMap.set(w.id, w));
  const rawList = Array.from(combinedWorkoutsMap.values());

  // Identify today's active or scheduled workout
  const inProgress = rawList.find((w: any) => w.status === "in_progress");
  const scheduledToday = rawList.find((w: any) => w.workout_date === userLocalDate);
  const targetWorkout = inProgress || scheduledToday || null;

  // 3. Query exercises ONLY for targetWorkout (direct indexed lookup by workout_id, fast ~10-20ms)
  let fullTargetWorkout: any = targetWorkout;
  if (targetWorkout?.id) {
    const { data: exercises } = await admin
      .from("fitness_os_exercises")
      .select(`
        id, name, target_sets, target_reps, rest_seconds,
        fitness_os_sets (completed)
      `)
      .eq("workout_id", targetWorkout.id);

    const exerciseList = exercises || [];
    const completedExercises = exerciseList.filter((e: any) =>
      e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
    ).length;

    fullTargetWorkout = {
      ...targetWorkout,
      fitness_os_exercises: exerciseList,
      exerciseCount: exerciseList.length,
      completedExercises,
    };
  }

  // Find next upcoming workout if no workout scheduled today
  let nextWorkout: any = null;
  if (!fullTargetWorkout) {
    const upcoming = rawList.find((w: any) => w.workout_date >= userLocalDate && w.status === "scheduled")
      || rawList.find((w: any) => w.status === "scheduled");
    if (upcoming) {
      nextWorkout = upcoming;
    } else {
      // If none in this week, query the very next scheduled workout
      const { data: nextScheduled } = await admin
        .from("fitness_os_workouts")
        .select("id, name, workout_date, status, duration_minutes, plan_id")
        .eq("user_id", userId)
        .gte("workout_date", userLocalDate)
        .eq("status", "scheduled")
        .order("workout_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      nextWorkout = nextScheduled || null;
    }
  }

  // Build weekly calendar (Monday to Sunday)
  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weekDays = dayNames.map((dayName, i) => {
    const iterDate = new Date(startOfWeek);
    iterDate.setDate(startOfWeek.getDate() + i);
    const iterStr = iterDate.toISOString().split("T")[0];
    const dayWorkout = rawList.find((w: any) => w.workout_date === iterStr);
    const isToday = iterStr === userLocalDate;
    let status = "rest";
    let name = dayWorkout ? dayWorkout.name : "Rest";
    const isRestDay = name.toLowerCase().includes("rest");

    if (isToday) {
      status = dayWorkout?.status === "completed" ? "completed" : "today";
    } else if (dayWorkout && !isRestDay) {
      if (dayWorkout.status === "completed") {
        status = "completed";
      } else if (iterStr < userLocalDate) {
        status = "rest";
      } else {
        status = "upcoming";
      }
    }

    return {
      day: dayName,
      status,
      name,
      date: iterStr,
      isToday,
    };
  });

  // Build standard 7-day plan split
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];
  const planDays = dayNames.map((dayName, idx) => {
    const targetDayOfWeek = dayIndices[idx];
    const isToday = targetDayOfWeek === dayOfWeek;
    const matchingWorkout = rawList.find((w: any) => {
      const d = new Date(`${w.workout_date}T12:00:00Z`);
      return d.getUTCDay() === targetDayOfWeek;
    });

    if (matchingWorkout) {
      return {
        day: dayName,
        status: matchingWorkout.status === "completed" ? "completed" : isToday ? "today" : "upcoming",
        name: matchingWorkout.name,
        date: matchingWorkout.workout_date,
        isToday,
      };
    }

    return {
      day: dayName,
      status: "rest",
      name: "Rest",
      date: undefined,
      isToday,
    };
  });

  const effectiveWorkout = isFree ? (SAMPLE_FREE_WORKOUT as any) : fullTargetWorkout;
  const effectiveWeekDays = isFree ? (SAMPLE_FREE_WEEK_DAYS as any) : weekDays;
  const effectivePlanDays = isFree ? (SAMPLE_FREE_WEEK_DAYS as any) : planDays;

  const nextWorkoutLabel = nextWorkout?.workout_date
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date(`${nextWorkout.workout_date}T12:00:00Z`))
    : undefined;

  const targetWorkoutId = fullTargetWorkout?.id || nextWorkout?.id;
  const initialCoachNote = targetWorkoutId && subscriptionPlan?.id === "pro"
    ? aiNotes?.find((n: any) => n.workout_id === targetWorkoutId)?.note || null
    : null;

  const planBadge = isFree 
    ? "Preview Split" 
    : planDays && planDays.length > 0 
    ? `${planDays.length}-Day Split` 
    : activePlan 
    ? "Active Plan" 
    : undefined;

  const result: WorkoutPageData = {
    dateStr,
    isFree,
    planBadge,
    effectiveWeekDays,
    effectivePlanDays,
    effectiveWorkout,
    nextWorkout,
    nextWorkoutLabel,
    hasActivePlan: !!activePlan,
    isPro: subscriptionPlan?.id === "pro",
    initialCoachNote,
  };

  // Cache result for 30s
  workoutServerCache.set(userId, { data: result, timestamp: Date.now() });

  return result;
}
