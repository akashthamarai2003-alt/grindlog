import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function DELETE(
  req: Request,
  { params }: { params: { sessionId: string; exerciseId: string } }
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the sets first to avoid foreign key violations if CASCADE is missing
    const { error: setsErr } = await supabase
      .from("fitness_os_sets")
      .delete()
      .eq("exercise_id", params.exerciseId);

    if (setsErr) throw setsErr;

    // Delete the exercise
    const { error: deleteErr } = await supabase
      .from("fitness_os_exercises")
      .delete()
      .eq("id", params.exerciseId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`DELETE /api/workouts/sessions/[sessionId]/exercises/[exerciseId] error:`, error);
    return NextResponse.json({ error: error.message || "Failed to skip exercise" }, { status: 500 });
  }
}
