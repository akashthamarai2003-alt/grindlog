import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { WorkoutPageData } from "@/types/fitness/workout-page";

export async function getWorkoutPageData(userId: string): Promise<WorkoutPageData> {
  const admin = createAdminClient();
  const nowDate = new Date();

  // ── WAVE 1: Fire all independent queries in parallel ──
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

  const dateStr = new Intl.DateTimeFormat("en-US", { 
    timeZone: tz, weekday: "short", month: "short", day: "numeric" 
  }).format(nowDate);

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

  // ── WAVE 2: Calendar workouts + in-progress + AI notes ──
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
  // If workouts are missing for this week, but athlete has an active plan,
  // automatically instantiate the recurring weekly split from their active plan template!
  if (!isFree && activePlan) {
    const recurring = await ensureWeeklyWorkoutsScheduled(
      admin, userId, activePlan, startOfWeek, weekStartStr, weekEndStr, effectiveCalendarWorkouts, userLocalDate
    );
    if (recurring && recurring.length > 0) {
      effectiveCalendarWorkouts = [...effectiveCalendarWorkouts, ...recurring];
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

  // Find next upcoming workout if no workout scheduled today
  let nextWorkoutRaw: any = null;
  let nextWorkoutQueryPromise: Promise<any> | null = null;

  if (!targetWorkout) {
    const upcoming = rawList.find((w: any) => w.workout_date > userLocalDate && w.status === "scheduled");
    if (upcoming) {
      nextWorkoutRaw = upcoming;
    } else {
      // Fire DB query for next scheduled workout outside this week
      nextWorkoutQueryPromise = Promise.resolve(
        admin
          .from("fitness_os_workouts")
          .select("id, name, workout_date, status, duration_minutes, plan_id")
          .eq("user_id", userId)
          .gt("workout_date", userLocalDate)
          .eq("status", "scheduled")
          .order("workout_date", { ascending: true })
          .limit(1)
          .maybeSingle()
      );
    }
  }

  // ── WAVE 3: Load exercises for target + next workout IN PARALLEL ──
  // Collect all workout IDs we need exercises for
  const workoutIdsToFetch: string[] = [];
  if (targetWorkout) workoutIdsToFetch.push(targetWorkout.id);

  // Resolve next workout query if needed
  if (nextWorkoutQueryPromise) {
    const { data: nextScheduled } = await nextWorkoutQueryPromise;
    nextWorkoutRaw = nextScheduled || null;
  }
  if (!targetWorkout && nextWorkoutRaw) {
    workoutIdsToFetch.push(nextWorkoutRaw.id);
  }

  // Single batch query for exercises of ALL needed workouts
  let exercisesByWorkoutId = new Map<string, any[]>();
  if (workoutIdsToFetch.length > 0) {
    const { data: allExercises } = await admin
      .from("fitness_os_exercises")
      .select(`
        id, name, target_sets, target_reps, rest_seconds, workout_id,
        fitness_os_sets (completed)
      `)
      .in("workout_id", workoutIdsToFetch);

    for (const ex of (allExercises || [])) {
      const wid = ex.workout_id;
      if (!exercisesByWorkoutId.has(wid)) {
        exercisesByWorkoutId.set(wid, []);
      }
      exercisesByWorkoutId.get(wid)!.push(ex);
    }
  }

  function enrichWorkout(workout: any) {
    const exerciseList = exercisesByWorkoutId.get(workout.id) || [];
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

  const fullTargetWorkout = targetWorkout ? enrichWorkout(targetWorkout) : null;
  const nextWorkout = !targetWorkout && nextWorkoutRaw ? enrichWorkout(nextWorkoutRaw) : null;

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

    return { day: dayName, status, name, date: iterStr, isToday };
  });

  // Build standard 7-day plan split
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];
  const templateWorkouts: any[] = Array.isArray(activePlan?.plan_data?.workouts)
    ? activePlan.plan_data.workouts
    : [];

  const planDays = dayNames.map((dayName, idx) => {
    const targetDayOfWeek = dayIndices[idx];
    const isToday = targetDayOfWeek === dayOfWeek;

    // 1. Check if there is an active/completed workout in the current week's rawList for real-time status
    const currentWeekWorkout = rawList.find((w: any) => {
      const d = new Date(`${w.workout_date}T12:00:00Z`);
      return d.getUTCDay() === targetDayOfWeek;
    });

    // 2. Check the master plan template in activePlan.plan_data.workouts
    const templateMatch = templateWorkouts.find((tw: any, twIdx: number) => {
      let dow: number | undefined;
      if (tw.workout_date) {
        const d = new Date(`${tw.workout_date}T12:00:00Z`);
        if (!isNaN(d.getTime())) dow = d.getUTCDay();
      }
      if (dow === undefined) {
        dow = dayIndices[Math.min(twIdx * 2, dayIndices.length - 1)];
      }
      return dow === targetDayOfWeek;
    });

    const workout = currentWeekWorkout || templateMatch;

    if (workout) {
      const name = workout.name || workout.title;
      let status = "upcoming";
      if (currentWeekWorkout) {
        status = currentWeekWorkout.status === "completed"
          ? "completed"
          : isToday
          ? "today"
          : "upcoming";
      } else if (isToday) {
        status = "today";
      }

      return {
        day: dayName,
        status,
        name,
        date: currentWeekWorkout?.workout_date || workout.workout_date,
        isToday,
      };
    }

    return { day: dayName, status: "rest", name: "Rest", date: undefined, isToday };
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
 * Optimized: batched inserts for exercises and sets.
 */
async function ensureWeeklyWorkoutsScheduled(
  admin: any,
  userId: string,
  activePlan: any,
  startOfWeek: Date,
  _weekStartStr: string,
  _weekEndStr: string,
  existingWorkouts: any[] = [],
  userLocalDate: string = ""
) {
  if (!activePlan || !activePlan.id) return [];
  const planData = activePlan.plan_data;
  const templateWorkouts = Array.isArray(planData?.workouts) ? planData.workouts : [];
  if (templateWorkouts.length === 0) return [];

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

  const existingDatesSet = new Set(existingWorkouts.map((w: any) => w.workout_date));
  const planCreatedAtStr = activePlan.created_at
    ? new Date(activePlan.created_at).toISOString().split("T")[0]
    : userLocalDate;

  // ── STEP 1: Batch insert ONLY missing workouts for this week ──
  const workoutInserts = [];
  for (let idx = 0; idx < templateWorkouts.length; idx++) {
    const tw = templateWorkouts[idx];
    if (!tw || !tw.title) continue;

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

    const targetDateStr = weekDatesMap.get(targetDow) || _weekStartStr;

    // Skip if workout already exists on this date
    if (existingDatesSet.has(targetDateStr)) continue;

    // Do NOT insert workouts on past dates prior to when the plan was created
    if (targetDateStr < userLocalDate && targetDateStr < planCreatedAtStr) continue;

    workoutInserts.push({
      user_id: userId,
      plan_id: activePlan.id,
      workout_date: targetDateStr,
      name: tw.title,
      status: "scheduled",
      duration_minutes: Number(tw.duration_minutes) || 45,
      plan_data: tw.plan_data || { target_muscles: [] },
      _templateIdx: idx, // internal ref, stripped before insert
    });
  }

  if (workoutInserts.length === 0) return [];

  // Strip _templateIdx before insert
  const cleanInserts = workoutInserts.map(({ _templateIdx, ...rest }) => rest);

  const { data: newWorkouts, error: wErr } = await admin
    .from("fitness_os_workouts")
    .insert(cleanInserts)
    .select("id, name, workout_date, status, duration_minutes, plan_id");

  if (wErr || !newWorkouts || newWorkouts.length === 0) {
    console.warn("Failed to batch auto-schedule recurring workouts:", wErr);
    return [];
  }

  // ── STEP 2: Batch insert ALL exercises for ALL workouts ──
  const exerciseInserts: any[] = [];
  // Map template index -> workout id for exercise association
  for (let i = 0; i < newWorkouts.length; i++) {
    const templateIdx = workoutInserts[i]._templateIdx;
    const tw = templateWorkouts[templateIdx];
    const exercises = Array.isArray(tw?.exercises) ? tw.exercises : [];

    for (let eIdx = 0; eIdx < exercises.length; eIdx++) {
      const ex = exercises[eIdx];
      if (!ex || !ex.name) continue;

      exerciseInserts.push({
        workout_id: newWorkouts[i].id,
        name: ex.name,
        exercise_order: Number(ex.exercise_order) || eIdx + 1,
        target_sets: Number(ex.sets) || 3,
        target_reps: Number(ex.target_reps_num) || 10,
        rest_seconds: Number(ex.rest_seconds) || 90,
        notes: ex.notes || null,
        _targetSets: Number(ex.sets) || 3, // internal ref for set generation
        _targetReps: Number(ex.target_reps_num) || 10, // internal ref
      });
    }
  }

  if (exerciseInserts.length === 0) return newWorkouts;

  const cleanExInserts = exerciseInserts.map(({ _targetSets, _targetReps, ...rest }) => rest);

  const { data: newExercises, error: exErr } = await admin
    .from("fitness_os_exercises")
    .insert(cleanExInserts)
    .select("id");

  if (exErr || !newExercises) {
    console.warn("Failed to batch insert exercises:", exErr);
    return newWorkouts;
  }

  // ── STEP 3: Batch insert ALL sets for ALL exercises ──
  const setInserts: any[] = [];
  for (let i = 0; i < newExercises.length; i++) {
    const targetSets = exerciseInserts[i]._targetSets;
    const targetReps = exerciseInserts[i]._targetReps;

    for (let s = 1; s <= targetSets; s++) {
      setInserts.push({
        exercise_id: newExercises[i].id,
        set_number: s,
        target_reps: targetReps,
        completed: false,
      });
    }
  }

  if (setInserts.length > 0) {
    const { error: setErr } = await admin.from("fitness_os_sets").insert(setInserts);
    if (setErr) {
      console.warn("Failed to batch insert sets:", setErr);
    }
  }

  return newWorkouts;
}
