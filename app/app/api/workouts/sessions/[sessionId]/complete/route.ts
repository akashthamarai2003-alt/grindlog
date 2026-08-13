import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { WorkoutService } from "@/lib/services/fitness/workout-service";

export async function PATCH(
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

    const result = await WorkoutService.completeSession(user.id, sessionId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`PATCH /api/workouts/sessions/[sessionId]/complete error:`, error);
    return NextResponse.json({ error: error.message || "Failed to complete session" }, { status: 500 });
  }
}
