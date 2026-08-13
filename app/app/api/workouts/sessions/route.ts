import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { WorkoutService } from "@/lib/services/fitness/workout-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workoutId } = await req.json();

    if (!workoutId) {
      return NextResponse.json({ error: "Missing workoutId" }, { status: 400 });
    }

    const session = await WorkoutService.startSession(user.id, workoutId);
    
    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("POST /api/workouts/sessions error:", error);
    return NextResponse.json({ error: error.message || "Failed to start session" }, { status: 500 });
  }
}
