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
      .select("completed_at, workout_date")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("workout_date", cutoffStr)
      .order("workout_date", { ascending: true });

    if (error) throw error;

    // Return array of ISO date strings (YYYY-MM-DD)
    const dates = (workouts || []).map(w =>
      (w.completed_at || w.workout_date || "").split("T")[0]
    ).filter(Boolean);

    return NextResponse.json({ dates }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/fitness/workout-dates error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
