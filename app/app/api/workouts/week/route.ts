import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { WorkoutService } from "@/lib/services/fitness/workout-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekDays = await WorkoutService.getWeeklyWorkout(user.id);
    
    return NextResponse.json({ weekDays });
  } catch (error: any) {
    console.error("GET /api/workouts/week error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch weekly workout" }, { status: 500 });
  }
}
