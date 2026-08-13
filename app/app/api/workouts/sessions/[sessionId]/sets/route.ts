import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { WorkoutService } from "@/lib/services/fitness/workout-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { setId, weightKg, reps } = await req.json();

    if (!setId) {
      return NextResponse.json({ error: "Missing setId" }, { status: 400 });
    }

    await WorkoutService.completeSet(user.id, sessionId, setId, weightKg, reps);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/sets error:`, error);
    return NextResponse.json({ error: error.message || "Failed to complete set" }, { status: 500 });
  }
}
