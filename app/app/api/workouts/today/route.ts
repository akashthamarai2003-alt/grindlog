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

    const workout = await WorkoutService.getTodayWorkout(user.id);
    
    return NextResponse.json({ workout });
  } catch (error: any) {
    console.error("GET /api/workouts/today error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch today's workout" }, { status: 500 });
  }
}
