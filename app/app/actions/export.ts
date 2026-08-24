"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";

export async function exportUserData() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch all relevant data for the user
    const [
      { data: profile },
      { data: habits },
      { data: habitLogs },
      { data: journalEntries },
      { data: goals },
      { data: fitnessLogs },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("habits").select("*").eq("user_id", user.id),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
      supabase.from("journal_entries").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("fitness_logs").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || {},
      habits: habits || [],
      habitLogs: habitLogs || [],
      journalEntries: journalEntries || [],
      goals: goals || [],
      fitnessLogs: fitnessLogs || [],
    };

    return { success: true, data: exportData };
  } catch (error: any) {
    console.error("Export data error:", error);
    return { success: false, error: error.message || "Failed to export data" };
  }
}

/**
 * Export workout history as CSV
 * Returns a CSV string with all completed workout sets
 * Format: Date, Workout, Exercise, Set, Weight (kg), Reps, Volume (kg)
 */
export async function exportWorkoutHistoryCSV() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated", csv: null };
    }

    const { data: workouts, error } = await supabase
      .from("fitness_os_workouts")
      .select(`
        id,
        name,
        workout_date,
        completed_at,
        duration_minutes,
        fitness_os_exercises (
          id,
          name,
          exercise_order,
          fitness_os_sets (
            set_number,
            actual_reps,
            weight_kg,
            completed,
            completed_at
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (error) throw error;
    if (!workouts || workouts.length === 0) {
      return { success: true, csv: "Date,Workout,Exercise,Set,Weight (kg),Reps,Volume (kg)\n", rowCount: 0 };
    }

    const rows: string[] = [];
    rows.push("Date,Workout,Exercise,Set,Weight (kg),Reps,Volume (kg)");

    for (const workout of workouts) {
      const date = (workout.completed_at || workout.workout_date || "").split("T")[0];
      const workoutName = `"${(workout.name || "Workout").replace(/"/g, '""')}"`;

      for (const exercise of (workout.fitness_os_exercises || [])) {
        const exerciseName = `"${(exercise.name || "").replace(/"/g, '""')}"`;
        const completedSets = (exercise.fitness_os_sets || [])
          .filter((s: any) => s.completed)
          .sort((a: any, b: any) => a.set_number - b.set_number);

        for (const set of completedSets) {
          const weight = set.weight_kg ? parseFloat(String(set.weight_kg)) : 0;
          const reps = set.actual_reps || 0;
          const volume = weight > 0 ? (weight * reps).toFixed(1) : "BW";
          rows.push(`${date},${workoutName},${exerciseName},${set.set_number},${weight},${reps},${volume}`);
        }
      }
    }

    const csv = rows.join("\n");
    const rowCount = rows.length - 1; // Exclude header

    return { success: true, csv, rowCount };
  } catch (error: any) {
    console.error("Export workout CSV error:", error);
    return { success: false, error: error.message || "Failed to export", csv: null };
  }
}

