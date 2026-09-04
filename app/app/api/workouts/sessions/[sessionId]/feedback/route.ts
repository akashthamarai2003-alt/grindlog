import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { difficulty, feel, pain, painLocation } = body;

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatePayload: Record<string, any> = {
      notes: JSON.stringify({
        difficulty,
        feel,
        pain,
        painLocation,
        recorded_at: new Date().toISOString(),
      }),
    };

    if (difficulty) updatePayload.difficulty = difficulty;
    if (feel) updatePayload.feeling = feel;

    const { error } = await supabase
      .from("fitness_os_workout_sessions")
      .update(updatePayload as any)
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.warn("Feedback column update warning:", error.message);
    }

    return NextResponse.json({ success: true, message: "Feedback saved" });
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/feedback error:`, error);
    return NextResponse.json({ error: error.message || "Failed to save feedback" }, { status: 500 });
  }
}
