import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

async function handleStatusUpdate(
  req: NextRequest,
  sessionId: string
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  if (status !== "paused" && status !== "active") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify ownership
  const { data: session, error: sessErr } = await supabase
    .from("fitness_os_workout_sessions")
    .select("user_id, status")
    .eq("id", sessionId)
    .single();

  if (sessErr || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.user_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.status === "completed" || session.status === "cancelled") {
    return NextResponse.json({ error: "Session is already completed or cancelled" }, { status: 400 });
  }

  // Update status
  const updatePayload: any = { status };
  if (status === "paused") {
    updatePayload.paused_at = new Date().toISOString();
  }

  const { error: updateErr } = await supabase
    .from("fitness_os_workout_sessions")
    .update(updatePayload)
    .eq("id", sessionId);

  if (updateErr) throw updateErr;

  return NextResponse.json({ success: true, status });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    return await handleStatusUpdate(req, sessionId);
  } catch (error: any) {
    console.error(`PATCH /api/workouts/sessions/[sessionId]/status error:`, error);
    return NextResponse.json({ error: error.message || "Failed to update session status" }, { status: 500 });
  }
}

// POST handler for navigator.sendBeacon (which always sends POST)
// This ensures auto-pause works reliably when the user navigates away or closes the tab
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    return await handleStatusUpdate(req, sessionId);
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/status error:`, error);
    return NextResponse.json({ error: error.message || "Failed to update session status" }, { status: 500 });
  }
}
