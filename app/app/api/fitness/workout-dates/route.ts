import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

/**
 * GET /api/fitness/workout-dates
 * Returns all completed workout dates for the last 365 days
 * Used by the 52-week workout heatmap component
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 365);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const { data: workouts, error } = await supabase
      .from("fitness_os_workouts")
      .select("completed_at, workout_date, status")
      .eq("user_id", user.id)
      .gte("workout_date", cutoffStr)
      .order("workout_date", { ascending: true });

    if (error) throw error;

    // Separate completed vs scheduled/in_progress workouts
    const completedWorkouts = (workouts || []).filter(w => w.status === "completed");
    const dates = completedWorkouts.map(w =>
      (w.completed_at || w.workout_date || "").split("T")[0]
    ).filter(Boolean);

    const scheduledWorkouts = (workouts || []).filter(w => w.status === "scheduled" || w.status === "in_progress");
    const scheduledDates = scheduledWorkouts.map(w =>
      (w.workout_date || "").split("T")[0]
    ).filter(Boolean);

    // Fetch recent exercises for the muscle map
    const cutoff30 = new Date();
    cutoff30.setDate(cutoff30.getDate() - 30);
    const cutoff30Str = cutoff30.toISOString().split("T")[0];

    const { data: recentWorkouts } = await supabase
      .from("fitness_os_workouts")
      .select("fitness_os_exercises(name)")
      .eq("user_id", user.id)
      .gte("workout_date", cutoff30Str);

    let exerciseNames: string[] = [];
    if (recentWorkouts && recentWorkouts.length > 0) {
      exerciseNames = recentWorkouts.flatMap((w: any) =>
        (w.fitness_os_exercises || []).map((e: any) => e.name)
      ).filter(Boolean);
    }

    // Fallback: If no recent workouts logged yet, read targeted exercises from the user's active AI plan
    if (exerciseNames.length === 0) {
      const { data: activePlan } = await supabase
        .from("fitness_os_workout_plans")
        .select("plan_data")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      const planWorkouts = (activePlan?.plan_data as any)?.workouts || [];
      exerciseNames = planWorkouts.flatMap((w: any) =>
        (w.exercises || []).map((e: any) => e.name)
      ).filter(Boolean);
    }

    // Fetch joined / plan start date
    const { data: profile } = await supabase
      .from("fitness_os_profiles")
      .select("created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: activePlanRecord } = await supabase
      .from("fitness_os_workout_plans")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const joinedDate = profile?.created_at || activePlanRecord?.created_at || user.created_at;

    return NextResponse.json({ 
      dates, 
      completedDates: dates, 
      scheduledDates, 
      exerciseNames,
      joinedDate
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/fitness/workout-dates error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
