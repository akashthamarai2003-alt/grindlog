import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { WorkoutPageData } from "@/types/fitness/workout-page";

export async function getWorkoutPageData(userId: string): Promise<WorkoutPageData> {
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
      .select("id, name, description, plan_data, created_at")
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

  let effectiveCalendarWorkouts = calendarWorkouts || [];

  // Auto-Recurring Weekly Split:
  // If no workouts exist for this week, but athlete has an active plan,
  // automatically instantiate the recurring weekly split from their active plan template!
  if (effectiveCalendarWorkouts.length === 0 && !isFree && activePlan) {
    const recurring = await ensureWeeklyWorkoutsScheduled(
      admin,
      userId,
      activePlan,
      startOfWeek,
      weekStartStr,
      weekEndStr
    );
    if (recurring && recurring.length > 0) {
      effectiveCalendarWorkouts = recurring;
    }
  }

  // Combine calendar workouts with any in-progress workout outside the current week
  const combinedWorkoutsMap = new Map<string, any>();
  effectiveCalendarWorkouts.forEach((w: any) => combinedWorkoutsMap.set(w.id, w));
  (inProgressWorkouts || []).forEach((w: any) => combinedWorkoutsMap.set(w.id, w));
  const rawList = Array.from(combinedWorkoutsMap.values());

  // Identify today's active or scheduled workout
  const inProgress = rawList.find((w: any) => w.status === "in_progress");
  const scheduledToday = rawList.find((w: any) => w.workout_date === userLocalDate);
  const targetWorkout = inProgress || scheduledToday || null;

  // Load exercise details for whichever workout is displayed.
  async function withExercises(workout: any) {
    const { data: exercises } = await admin
      .from("fitness_os_exercises")
      .select(`
        id, name, target_sets, target_reps, rest_seconds,
        fitness_os_sets (completed)
      `)
      .eq("workout_id", workout.id);

    const exerciseList = exercises || [];
    const completedExercises = exerciseList.filter((e: any) =>
      e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
    ).length;

    return {
      ...workout,
      fitness_os_exercises: exerciseList,
      exerciseCount: exerciseList.length,
      completedExercises,
    };
  }

  const fullTargetWorkout = targetWorkout ? await withExercises(targetWorkout) : null;

  // Find next upcoming workout if no workout scheduled today
  let nextWorkout: any = null;
  if (!fullTargetWorkout) {
    const upcoming = rawList.find((w: any) => w.workout_date > userLocalDate && w.status === "scheduled");
    if (upcoming) {
      nextWorkout = upcoming;
    } else {
      // If none in this week, query the very next scheduled workout
      const { data: nextScheduled } = await admin
        .from("fitness_os_workouts")
        .select("id, name, workout_date, status, duration_minutes, plan_id")
        .eq("user_id", userId)
        .gt("workout_date", userLocalDate)
        .eq("status", "scheduled")
        .order("workout_date", { ascending: true })
        .limit(1)
        .maybeSingle();
      nextWorkout = nextScheduled || null;
    }
  }

  if (nextWorkout) nextWorkout = await withExercises(nextWorkout);

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
        timeZone: "UTC",
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date(`${nextWorkout.workout_date}T12:00:00Z`))
    : undefined;

  const targetWorkoutId = fullTargetWorkout?.id || nextWorkout?.id;
  const initialCoachNote = targetWorkoutId && subscriptionPlan?.id === "pro"
    ? aiNotes?.find((n: any) => n.workout_id === targetWorkoutId)?.note || null
    : null;

  const workoutDaysCount = planDays ? planDays.filter((d: any) => d.status !== "rest").length : 0;
  const planBadge = isFree 
    ? "Preview Split" 
    : workoutDaysCount > 0 
    ? `${workoutDaysCount}-Day Split` 
    : activePlan 
    ? "Active Plan" 
    : undefined;

  const planCreatedAt = activePlan?.created_at ? new Date(activePlan.created_at) : null;
  const daysOnPlan = planCreatedAt 
    ? Math.max(1, Math.floor((nowDate.getTime() - planCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const currentWeek = Math.min(4, Math.ceil(daysOnPlan / 7));
  const isMonthEnd = daysOnPlan >= 28;

  const cycleSummary = activePlan ? {
    currentWeek,
    totalWeeks: 4,
    isMonthEnd,
    daysOnPlan,
  } : undefined;

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
    cycleSummary,
  };

  return result;
}

/**
 * Idempotently auto-schedules recurring workouts from the active plan template
 * into the given week when no workouts exist yet.
 */
async function ensureWeeklyWorkoutsScheduled(
  admin: any,
  userId: string,
  activePlan: any,
  startOfWeek: Date,
  weekStartStr: string,
  weekEndStr: string
) {
  if (!activePlan || !activePlan.id) return [];
  const planData = activePlan.plan_data;
  const templateWorkouts = Array.isArray(planData?.workouts) ? planData.workouts : [];
  if (templateWorkouts.length === 0) return [];

  // Check if any workouts exist in this week range already to guarantee idempotence
  const { data: existing } = await admin
    .from("fitness_os_workouts")
    .select("id, name, workout_date, status, duration_minutes, plan_id")
    .eq("user_id", userId)
    .gte("workout_date", weekStartStr)
    .lte("workout_date", weekEndStr)
    .order("workout_date", { ascending: true });

  if (existing && existing.length > 0) {
    return existing;
  }

  // Pre-compute the 7 dates of this week (Monday=0 to Sunday=6)
  const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun
  const weekDatesMap = new Map<number, string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dow = d.getUTCDay();
    weekDatesMap.set(dow, dateStr);
  }

  const createdWorkouts: any[] = [];

  for (let idx = 0; idx < templateWorkouts.length; idx++) {
    const tw = templateWorkouts[idx];
    if (!tw || !tw.title) continue;

    // Determine target day of week
    let targetDow: number | undefined;
    if (tw.workout_date) {
      const templateDate = new Date(`${tw.workout_date}T12:00:00Z`);
      if (!isNaN(templateDate.getTime())) {
        targetDow = templateDate.getUTCDay();
      }
    }

    if (targetDow === undefined || !weekDatesMap.has(targetDow)) {
      const fallbackDow = dayIndices[Math.min(idx * 2, dayIndices.length - 1)];
      targetDow = fallbackDow;
    }

    const targetDateStr = weekDatesMap.get(targetDow) || weekStartStr;

    // 1. Insert Workout
    const { data: newWorkout, error: wErr } = await admin
      .from("fitness_os_workouts")
      .insert({
        user_id: userId,
        plan_id: activePlan.id,
        workout_date: targetDateStr,
        name: tw.title,
        status: "scheduled",
        duration_minutes: Number(tw.duration_minutes) || 45,
        plan_data: tw.plan_data || { target_muscles: [] }
      })
      .select("id, name, workout_date, status, duration_minutes, plan_id")
      .single();

    if (wErr || !newWorkout) {
      console.warn("Failed to auto-schedule recurring workout:", wErr);
      continue;
    }

    createdWorkouts.push(newWorkout);

    // 2. Insert Exercises & Sets
    const exercises = Array.isArray(tw.exercises) ? tw.exercises : [];
    for (let eIdx = 0; eIdx < exercises.length; eIdx++) {
      const ex = exercises[eIdx];
      if (!ex || !ex.name) continue;

      const targetSets = Number(ex.sets) || 3;
      const targetRepsNum = Number(ex.target_reps_num) || 10;
      const restSec = Number(ex.rest_seconds) || 90;

      const { data: newExercise, error: exErr } = await admin
        .from("fitness_os_exercises")
        .insert({
          workout_id: newWorkout.id,
          name: ex.name,
          exercise_order: Number(ex.exercise_order) || eIdx + 1,
          target_sets: targetSets,
          target_reps: targetRepsNum,
          rest_seconds: restSec,
          notes: ex.notes || null,
        })
        .select("id")
        .single();

      if (exErr || !newExercise) continue;

      // 3. Insert Sets
      const setsToInsert = [];
      for (let s = 1; s <= targetSets; s++) {
        setsToInsert.push({
          exercise_id: newExercise.id,
          set_number: s,
          target_reps: targetRepsNum,
          completed: false,
        });
      }
      if (setsToInsert.length > 0) {
        await admin.from("fitness_os_sets").insert(setsToInsert);
      }
    }
  }

  return createdWorkouts;
}
