import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function POST(
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

    // First get the highest set_number for this exercise to determine the next one
    const { data: existingSets, error: setsErr } = await supabase
      .from("fitness_os_sets")
      .select("set_number, target_reps, weight_kg")
      .eq("exercise_id", resolvedParams.exerciseId)
      .order("set_number", { ascending: false })
      .limit(1);

    if (setsErr) throw setsErr;

    const nextSetNumber = existingSets && existingSets.length > 0 ? existingSets[0].set_number + 1 : 1;
    const targetReps = existingSets && existingSets.length > 0 ? existingSets[0].target_reps : 10;
    const weightKg = existingSets && existingSets.length > 0 ? existingSets[0].weight_kg : null;

    // Insert new set
    const { data: newSet, error: insertErr } = await supabase
      .from("fitness_os_sets")
      .insert({
        exercise_id: resolvedParams.exerciseId,
        set_number: nextSetNumber,
        target_reps: targetReps,
        weight_kg: weightKg,
        completed: false
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return NextResponse.json({ success: true, set: newSet });
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/exercises/[exerciseId]/sets error:`, error);
    return NextResponse.json({ error: error.message || "Failed to add set" }, { status: 500 });
  }
}
