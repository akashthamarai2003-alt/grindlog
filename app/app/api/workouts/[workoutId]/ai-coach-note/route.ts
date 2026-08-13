import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AiWorkoutCoachService } from "@/lib/services/ai/ai-workout-coach-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await AiWorkoutCoachService.getOrGenerateCoachNote(user.id, workoutId);
    
    return NextResponse.json({ note });
  } catch (error: any) {
    console.error(`GET /api/workouts/[workoutId]/ai-coach-note error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch coach note" }, { status: 500 });
  }
}
