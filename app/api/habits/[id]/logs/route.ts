import { NextResponse } from "next/server";
import { createServerSupabase } from "@/services/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const { id: habitId } = await params;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { status } = body;
  const today = new Date().toISOString().split("T")[0];

  // Get current habit
  const { data: habit } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .single();

  if (!habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  if (status === "completed") {
    const newStreak = habit.current_streak + 1;
    const newLongest = Math.max(newStreak, habit.longest_streak);

    await supabase.from("habit_logs").upsert({
      habit_id: habitId,
      user_id: user.id,
      date: today,
      status: "completed",
      completed_at: new Date().toISOString(),
      streak_before: habit.current_streak,
      streak_after: newStreak,
      xp_earned: 50,
      coins_earned: 10,
    } as any);

    await supabase
      .from("habits")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        total_completions: habit.total_completions + 1,
        completion_rate:
          ((habit.total_completions + 1) /
            (habit.total_completions + habit.total_skips + 1)) *
          100,
      } as any)
      .eq("id", habitId);

    await supabase.rpc("add_xp", { xp_amount: 50 } as any);
    await supabase.rpc("water_tree");
  } else if (status === "skipped") {
    await supabase.from("habit_logs").upsert({
      habit_id: habitId,
      user_id: user.id,
      date: today,
      status: "skipped",
      streak_before: habit.current_streak,
      streak_after: 0,
      xp_earned: 0,
      coins_earned: 0,
    } as any);

    await supabase
      .from("habits")
      .update({
        current_streak: 0,
        total_skips: habit.total_skips + 1,
        completion_rate:
          (habit.total_completions /
            (habit.total_completions + habit.total_skips + 1)) *
          100,
      } as any)
      .eq("id", habitId);
  }

  return NextResponse.json({ success: true });
}
