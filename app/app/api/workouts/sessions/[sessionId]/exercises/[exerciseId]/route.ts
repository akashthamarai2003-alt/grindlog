import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sessionId: string; exerciseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the sets first to avoid foreign key violations if CASCADE is missing
    const { error: setsErr } = await supabase
      .from("fitness_os_sets")
      .delete()
      .eq("exercise_id", resolvedParams.exerciseId);

    if (setsErr) throw setsErr;

    // Delete the exercise
    const { error: deleteErr } = await supabase
      .from("fitness_os_exercises")
      .delete()
      .eq("id", resolvedParams.exerciseId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`DELETE /api/workouts/sessions/[sessionId]/exercises/[exerciseId] error:`, error);
    return NextResponse.json({ error: error.message || "Failed to skip exercise" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string; exerciseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (typeof body.rest_seconds !== 'number') {
      return NextResponse.json({ error: "Invalid rest_seconds" }, { status: 400 });
    }

    const { error: updateErr } = await supabase
      .from("fitness_os_exercises")
      .update({ rest_seconds: body.rest_seconds })
      .eq("id", resolvedParams.exerciseId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`PATCH /api/workouts/sessions/[sessionId]/exercises/[exerciseId] error:`, error);
    return NextResponse.json({ error: error.message || "Failed to update exercise" }, { status: 500 });
  }
}
