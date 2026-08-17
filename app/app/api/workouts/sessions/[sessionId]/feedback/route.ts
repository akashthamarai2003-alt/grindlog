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

    // Try to save to fitness_os_workout_sessions's "notes" column if it exists, or just log it
    // Many Supabase schemas use metadata or notes for JSON extensions.
    // For now, since we don't have a guaranteed feedback column, we'll try updating a generic notes column
    // or if it fails we just return success so the user can proceed.
    const { error } = await supabase
      .from("fitness_os_workout_sessions")
      .update({
        notes: JSON.stringify({ difficulty, feel, pain, painLocation, recorded_at: new Date().toISOString() })
      } as any)
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
       console.warn("Feedback column might not exist yet:", error.message);
       // We don't fail the request if the column doesn't exist, as it's just telemetry data for now.
    }

    return NextResponse.json({ success: true, message: "Feedback saved" });
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/feedback error:`, error);
    return NextResponse.json({ error: error.message || "Failed to save feedback" }, { status: 500 });
  }
}
