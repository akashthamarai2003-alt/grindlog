import { createServerSupabase } from "@/lib/services/supabase/server";

export class WorkoutService {

  /**
   * Retrieves the user's timezone from their profile, defaulting to UTC.
   */
  static async getUserTimezone(userId: string): Promise<string> {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single();
    return data?.timezone || 'UTC';
  }

  /**
   * Returns a YYYY-MM-DD string for the current date in the user's timezone.
   */
  static async getLocalDateString(userId: string): Promise<string> {
    const tz = await this.getUserTimezone(userId);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD
  }

  /**
   * Get Today's Workout and status.
   */
  static async getTodayWorkout(userId: string) {
    const supabase = await createServerSupabase();
    const today = await this.getLocalDateString(userId);

    // 1. If any workout is already in progress, that is today's active workout
    const { data: inProgressWorkout } = await supabase
      .from("fitness_os_workouts")
      .select(`
        *,
        fitness_os_exercises (
          id, name, target_sets, target_reps, rest_seconds,
          fitness_os_sets(completed)
        )
      `)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (inProgressWorkout) {
      if (inProgressWorkout.workout_date > today) {
        const origDate = inProgressWorkout.workout_date;
        await supabase
          .from("fitness_os_workouts")
          .update({ workout_date: today })
          .eq("id", inProgressWorkout.id);
        inProgressWorkout.workout_date = today;
        if (inProgressWorkout.plan_id) {
          await this.compactUpcomingPlanSchedule(supabase, inProgressWorkout.plan_id, origDate);
        }
      }

      const exerciseCount = inProgressWorkout.fitness_os_exercises?.length || 0;
      const completedExercises = inProgressWorkout.fitness_os_exercises?.filter((e: any) => 
        e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
      ).length || 0;

      return {
        ...inProgressWorkout,
        exerciseCount,
        completedExercises
      };
    }

    // 2. Check for workout with workout_date = today
    const { data: workout, error } = await supabase
      .from("fitness_os_workouts")
      .select(`
        *,
        fitness_os_exercises (
          id, name, target_sets, target_reps, rest_seconds,
          fitness_os_sets(completed)
        )
      `)
      .eq("user_id", userId)
      .eq("workout_date", today)
      .in("status", ["scheduled", "completed"])
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (workout) {
      const exerciseCount = workout.fitness_os_exercises?.length || 0;
      const completedExercises = workout.fitness_os_exercises?.filter((e: any) => 
        e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
      ).length || 0;

      return {
        ...workout,
        exerciseCount,
        completedExercises
      };
    }

    // 3. Self-healing / Early-completion recovery:
    // If no workout is scheduled/completed for today, check if a workout was completed
    // today in the user's timezone that still holds a future workout_date (e.g. started early from Monday).
    const tz = await this.getUserTimezone(userId);
    const { data: earlyCompletedWorkouts } = await supabase
      .from("fitness_os_workouts")
      .select(`
        *,
        fitness_os_exercises (
          id, name, target_sets, target_reps, rest_seconds,
          fitness_os_sets(completed)
        )
      `)
      .eq("user_id", userId)
      .eq("status", "completed")
      .gt("workout_date", today)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(5);

    if (earlyCompletedWorkouts && earlyCompletedWorkouts.length > 0) {
      const targetEarly = earlyCompletedWorkouts.find((w: any) => {
        if (!w.completed_at) return false;
        const compDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: tz,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }).format(new Date(w.completed_at));
        return compDate === today;
      });

      if (targetEarly) {
        const origDate = targetEarly.workout_date;
        await supabase
          .from("fitness_os_workouts")
          .update({ workout_date: today })
          .eq("id", targetEarly.id);

        targetEarly.workout_date = today;

        if (targetEarly.plan_id) {
          await this.compactUpcomingPlanSchedule(supabase, targetEarly.plan_id, origDate);
        }

        const exerciseCount = targetEarly.fitness_os_exercises?.length || 0;
        const completedExercises = targetEarly.fitness_os_exercises?.filter((e: any) => 
          e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
        ).length || 0;

        return {
          ...targetEarly,
          exerciseCount,
          completedExercises
        };
      }
    }

    return null;
  }

  /**
   * Returns the next saved workout after today. This is used when a plan starts
   * on a future date or today is a planned rest day.
   */
  static async getNextWorkout(userId: string, planId?: string) {
    const supabase = await createServerSupabase();
    const today = await this.getLocalDateString(userId);
    let query = supabase
      .from("fitness_os_workouts")
      .select(`
        *,
        fitness_os_exercises (
          id, name, target_sets, target_reps, rest_seconds,
          fitness_os_sets(completed)
        )
      `)
      .eq("user_id", userId)
      .gte("workout_date", today)
      .in("status", ["scheduled", "in_progress"])
      .order("workout_date", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1);

    if (planId) query = query.eq("plan_id", planId);

    const { data: workout, error } = await query.maybeSingle();
    if (error) throw error;
    if (!workout) return null;

    const exerciseCount = workout.fitness_os_exercises?.length || 0;
    const completedExercises = workout.fitness_os_exercises?.filter((e: any) =>
      e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
    ).length || 0;

    return { ...workout, exerciseCount, completedExercises };
  }

  /**
   * Get Weekly Workout Plan.
   */
  static async getWeeklyWorkout(userId: string, anchorDateStr?: string) {
    const supabase = await createServerSupabase();
    const todayStr = await this.getLocalDateString(userId);
    const tz = await this.getUserTimezone(userId);

    // Calculate week boundaries in local timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    
    // We assume the week starts on Monday
    const localDate = anchorDateStr && /^\d{4}-\d{2}-\d{2}$/.test(anchorDateStr)
      ? new Date(`${anchorDateStr}T00:00:00`)
      : new Date(`${y}-${m}-${d}T00:00:00`);
    const dayOfWeek = localDate.getDay(); // 0 is Sunday, 1 is Monday
    const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const startOfWeek = new Date(localDate);
    startOfWeek.setDate(localDate.getDate() - distToMonday);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    const { data: workouts, error } = await supabase
      .from("fitness_os_workouts")
      .select("id, name, workout_date, status")
      .eq("user_id", userId)
      .gte("workout_date", startStr)
      .lte("workout_date", endStr);

    if (error) throw error;

    // Build standard week array
    const weekDays = [];
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    
    for (let i = 0; i < 7; i++) {
      const iterDate = new Date(startOfWeek);
      iterDate.setDate(startOfWeek.getDate() + i);
      const iterStr = iterDate.toISOString().split('T')[0];
      
      const dayWorkout = workouts?.find(w => w.workout_date === iterStr);
      let name = dayWorkout ? dayWorkout.name : "Rest";
      let status = "upcoming";
      
      const isRestDay = name.toLowerCase().includes("rest");

      if (iterStr === todayStr) {
        if (dayWorkout && dayWorkout.status === "completed") {
          status = "completed";
        } else {
          status = "today";
        }
      } else if (dayWorkout && !isRestDay) {
        if (dayWorkout.status === "completed") {
          status = "completed";
        } else if (iterStr < todayStr) {
           // Past workout not completed
           status = "rest";
        } else {
           status = "upcoming";
        }
      } else {
        status = "rest";
      }

      weekDays.push({
        day: dayNames[i],
        status,
        name,
        date: iterStr,
        isToday: iterStr === todayStr
      });
    }

    return weekDays;
  }

  /**
   * When an upcoming workout is pulled forward (started early),
   * advance subsequent scheduled workouts of the plan so the originally
   * scheduled date slot is not left as an empty gap.
   */
  static async compactUpcomingPlanSchedule(
    supabase: any,
    planId: string,
    pulledWorkoutOriginalDate: string
  ) {
    if (!planId || !pulledWorkoutOriginalDate) return;

    try {
      // Fetch remaining scheduled workouts for this plan ordered by date
      const { data: scheduledWorkouts } = await supabase
        .from("fitness_os_workouts")
        .select("id, workout_date")
        .eq("plan_id", planId)
        .eq("status", "scheduled")
        .gt("workout_date", pulledWorkoutOriginalDate)
        .order("workout_date", { ascending: true });

      if (!scheduledWorkouts || scheduledWorkouts.length === 0) return;

      // The available slots begin with the pulled workout's original date
      const targetDates = [
        pulledWorkoutOriginalDate,
        ...scheduledWorkouts.slice(0, -1).map((w: any) => w.workout_date)
      ];

      for (let i = 0; i < scheduledWorkouts.length; i++) {
        const workout = scheduledWorkouts[i];
        const newDate = targetDates[i];
        if (workout.workout_date !== newDate) {
          await supabase
            .from("fitness_os_workouts")
            .update({ workout_date: newDate })
            .eq("id", workout.id);
        }
      }
    } catch (e) {
      console.error("compactUpcomingPlanSchedule error:", e);
    }
  }

  /**
   * Start or resume a session idempotently.
   */
  static async startSession(userId: string, workoutId: string, options: { allowEarlyStart?: boolean } = {}) {
    const supabase = await createServerSupabase();

    // 1. Verify ownership and get workout status
    const { data: workout, error: wErr } = await supabase
      .from("fitness_os_workouts")
      .select("user_id, status, workout_date, plan_id")
      .eq("id", workoutId)
      .single();

    if (wErr || !workout) throw new Error("WORKOUT_NOT_FOUND");
    if (workout.user_id !== userId) throw new Error("UNAUTHORIZED");
    if (workout.status === "completed") throw new Error("ALREADY_COMPLETED");
    // 2. Check for active session first (idempotent resume)
    const { data: existingSessions, error: sErr } = await supabase
      .from("fitness_os_workout_sessions")
      .select("id, started_at, status")
      .eq("workout_id", workoutId)
      .in("status", ["active", "paused"])
      .limit(1);

    if (sErr) throw sErr;

    if (existingSessions && existingSessions.length > 0) {
      const sess = existingSessions[0];
      const sessionAgeMs = sess.started_at ? Date.now() - new Date(sess.started_at).getTime() : 0;
      // Stale check: If older than 4 hours (14,400s), auto-retire and don't re-serve stale session
      if (sessionAgeMs > 4 * 60 * 60 * 1000 || sessionAgeMs < 0) {
        await supabase
          .from("fitness_os_workout_sessions")
          .update({
            status: "cancelled",
            completed_at: new Date().toISOString(),
            duration_seconds: 3600
          })
          .eq("id", sess.id);
      } else {
        // Idempotent: return valid existing session immediately
        return sess;
      }
    }

    const today = await this.getLocalDateString(userId);
    if (workout.workout_date > today && !options.allowEarlyStart) {
      throw new Error("WORKOUT_NOT_AVAILABLE_YET");
    }

    // 3. Create new session
    const { data: newSession, error: createErr } = await supabase
      .from("fitness_os_workout_sessions")
      .insert({
        user_id: userId,
        workout_id: workoutId,
        status: "active"
      })
      .select()
      .single();

    if (createErr) throw createErr;

    // 4. Update parent workout status to in_progress
    if (workout.status === "scheduled") {
      const updateData: Record<string, any> = {
        status: "in_progress",
        started_at: new Date().toISOString()
      };
      if (workout.workout_date > today) {
        updateData.workout_date = today;
      }

      await supabase
        .from("fitness_os_workouts")
        .update(updateData)
        .eq("id", workoutId);

      if (workout.workout_date > today && workout.plan_id) {
        await this.compactUpcomingPlanSchedule(supabase, workout.plan_id, workout.workout_date);
      }
    }

    return newSession;
  }

  /**
   * Complete a single set. Idempotent.
   */
  static async completeSet(userId: string, sessionId: string, setId: string, weightKg: number | null, reps: number | null) {
    const supabase = await createServerSupabase();

    // 1. Verify session ownership and active status
    const { data: session, error: sessErr } = await supabase
      .from("fitness_os_workout_sessions")
      .select("user_id, status, workout_id")
      .eq("id", sessionId)
      .single();

    if (sessErr || !session) throw new Error("SESSION_NOT_FOUND");
    if (session.user_id !== userId) throw new Error("UNAUTHORIZED");
    if (session.status !== "active" && session.status !== "paused") throw new Error("SESSION_NOT_ACTIVE");

    // 2. Verify set belongs to this workout
    const { data: setRecord, error: setErr } = await supabase
      .from("fitness_os_sets")
      .select(`
        id,
        completed,
        fitness_os_exercises!inner (workout_id)
      `)
      .eq("id", setId)
      .single();

    if (setErr || !setRecord) throw new Error("SET_NOT_FOUND");
    
    // Note: PostgREST returns related data under fitness_os_exercises based on foreign key.
    const exercise = setRecord.fitness_os_exercises as any;
    if (exercise.workout_id !== session.workout_id) {
      throw new Error("UNAUTHORIZED_SET");
    }

    if (setRecord.completed) {
      // Idempotent
      return true;
    }

    // 3. Update the set
    const { error: updateErr } = await supabase
      .from("fitness_os_sets")
      .update({
        weight_kg: weightKg,
        actual_reps: reps,
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq("id", setId);

    if (updateErr) throw updateErr;

    return true;
  }

  /**
   * Complete a session safely.
   */
  static async completeSession(userId: string, sessionId: string) {
    const supabase = await createServerSupabase();

    // 1. Fetch session
    const { data: session, error: sessErr } = await supabase
      .from("fitness_os_workout_sessions")
      .select("user_id, status, started_at, paused_at, workout_id")
      .eq("id", sessionId)
      .single();

    if (sessErr || !session) throw new Error("SESSION_NOT_FOUND");
    if (session.user_id !== userId) throw new Error("UNAUTHORIZED");

    if (session.status === "completed") {
      // Idempotent
      return { success: true, message: "Already completed" };
    }

    if (session.status !== "active" && session.status !== "paused") {
       throw new Error("INVALID_SESSION_STATE");
    }

    // Calculate duration
    let durationSec = 0;
    const started = new Date(session.started_at).getTime();
    if (session.status === "paused" && session.paused_at) {
      const pausedAt = new Date(session.paused_at).getTime();
      durationSec = Math.floor((pausedAt - started) / 1000);
    } else {
      const now = new Date().getTime();
      durationSec = Math.floor((now - started) / 1000);
    }
    if (durationSec < 0) durationSec = 0;

    // Calculate Volume (SUM(weight * reps)) for this session
    // Since sets belong to exercise, and exercise to workout, we can fetch completed sets for this workout
    const { data: setsData, error: setsErr } = await supabase
      .from("fitness_os_sets")
      .select(`
        weight_kg,
        actual_reps,
        fitness_os_exercises!inner(workout_id)
      `)
      .eq("fitness_os_exercises.workout_id", session.workout_id)
      .eq("completed", true);

    let totalVolume = 0;
    if (setsData) {
      for (const set of setsData) {
        if (set.weight_kg && set.actual_reps) {
          totalVolume += (set.weight_kg * set.actual_reps);
        }
      }
    }

    // Apply realistic real-world safeguard before database persistence:
    // If a session was left active/unclosed for > 3 hours (180 mins) or < 2 mins with completed sets,
    // estimate realistic active lifting time based on completed sets (~3.5 mins/set).
    let durationMin = Math.round(durationSec / 60);
    if (durationMin > 180 || durationMin < 2) {
      const completedSetsCount = setsData?.length || 0;
      durationMin = completedSetsCount > 0 ? Math.round(completedSetsCount * 3.5) : 45;
      durationSec = durationMin * 60;
    }

    // 2. Update session
    const { error: updateSessErr } = await supabase
      .from("fitness_os_workout_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_seconds: durationSec
      })
      .eq("id", sessionId);

    if (updateSessErr) throw updateSessErr;

    // 3. Update workout

    const today = await this.getLocalDateString(userId);
    const { data: workoutRecord } = await supabase
      .from("fitness_os_workouts")
      .select("workout_date, plan_id")
      .eq("id", session.workout_id)
      .single();

    const updateWorkoutData: Record<string, any> = {
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_minutes: durationMin
    };

    const isEarlyCompletion = Boolean(workoutRecord && workoutRecord.workout_date > today);
    const originalDate = workoutRecord?.workout_date;
    if (isEarlyCompletion) {
      updateWorkoutData.workout_date = today;
    }

    const { error: wErr } = await supabase
      .from("fitness_os_workouts")
      .update(updateWorkoutData)
      .eq("id", session.workout_id);
      
    if (wErr) throw wErr;

    if (isEarlyCompletion && workoutRecord?.plan_id && originalDate) {
      await this.compactUpcomingPlanSchedule(supabase, workoutRecord.plan_id, originalDate);
    }

    return {
      duration_seconds: durationSec,
      total_volume: totalVolume
    };
  }

  /**
   * Returns the active plan schedule with days and completion status.
   */
  static async getPlanSchedule(userId: string, planId?: string) {
    if (!planId) return null;
    const supabase = await createServerSupabase();
    const todayStr = await this.getLocalDateString(userId);
    const todayDate = new Date(`${todayStr}T12:00:00Z`);
    const todayDayOfWeek = todayDate.getUTCDay();

    const { data: workouts } = await supabase
      .from("fitness_os_workouts")
      .select("id, name, workout_date, status")
      .eq("plan_id", planId)
      .eq("user_id", userId)
      .order("workout_date", { ascending: true });

    if (!workouts || workouts.length === 0) return null;

    // Standard 7-day weekly split starting Monday
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // Monday (1) to Sunday (0)

    return dayNames.map((dayName, idx) => {
      const targetDayOfWeek = dayIndices[idx];
      const isToday = targetDayOfWeek === todayDayOfWeek;

      // Find workout whose workout_date falls on this day of the week
      const matchingWorkout = workouts.find((w: any) => {
        const d = new Date(`${w.workout_date}T12:00:00Z`);
        return d.getUTCDay() === targetDayOfWeek;
      });

      if (matchingWorkout) {
        const isCompleted = matchingWorkout.status === "completed";

        return {
          day: dayName,
          status: isCompleted ? "completed" : isToday ? "today" : "upcoming",
          name: matchingWorkout.name,
          date: matchingWorkout.workout_date,
          isToday
        };
      }

      return {
        day: dayName,
        status: "rest",
        name: "Rest",
        date: undefined,
        isToday
      };
    });
  }
}

