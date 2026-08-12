import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate local today's date
    const { data: profile } = await supabase.from('profiles').select('timezone').eq('id', user.id).single();
    const tz = profile?.timezone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayStr = formatter.format(new Date());

    // 1. Create Workout
    const { data: workout, error: workoutErr } = await supabase
      .from("fitness_os_workouts")
      .insert({
        user_id: user.id,
        name: "Chest and Triceps (Generated)",
        workout_date: todayStr,
        status: "scheduled",
        duration_minutes: 45,
        difficulty_level: "Moderate",
        plan_data: { target_muscles: ["Chest", "Triceps", "Shoulders"] }
      })
      .select()
      .single();

    if (workoutErr) throw workoutErr;

    // 2. Insert Exercises
    const exercises = [
      { name: "Bench Press", target_sets: 3, target_reps: "8-10", rest_seconds: 90, sort_order: 1 },
      { name: "Incline Dumbbell Press", target_sets: 3, target_reps: "10-12", rest_seconds: 90, sort_order: 2 },
      { name: "Tricep Pushdowns", target_sets: 3, target_reps: "12-15", rest_seconds: 60, sort_order: 3 }
    ];

    for (const ex of exercises) {
      const { data: exerciseRecord, error: exErr } = await supabase
        .from("fitness_os_exercises")
        .insert({
          workout_id: workout.id,
          name: ex.name,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          rest_seconds: ex.rest_seconds,
          sort_order: ex.sort_order
        })
        .select()
        .single();
        
      if (exErr) throw exErr;

      // 3. Insert Sets
      const sets = [];
      for (let i = 1; i <= ex.target_sets; i++) {
        sets.push({
          exercise_id: exerciseRecord.id,
          set_number: i,
          target_reps: parseInt(ex.target_reps.split('-')[0]),
          weight_kg: 20 // Dummy default weight
        });
      }
      
      const { error: setErr } = await supabase.from("fitness_os_sets").insert(sets);
      if (setErr) throw setErr;
    }

    return NextResponse.json({ success: true, workoutId: workout.id });
  } catch (error: any) {
    console.error("POST /api/workouts/generate-plan error:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
