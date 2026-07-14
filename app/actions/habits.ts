"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleHabitCompletion(
  habitId: string,
  dateStr: string, // YYYY-MM-DD format
  isCompleted: boolean,
  currentStreak: number,
  xpReward: number = 10
) {
  const supabase = await createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (isCompleted) {
    // 1. Insert completion log
    const { error: logError } = await supabase
      .from("habit_logs")
      .insert({
        habit_id: habitId,
        user_id: user.id,
        date: dateStr,
        status: "completed",
        streak_before: currentStreak,
        streak_after: currentStreak + 1,
        xp_earned: xpReward,
        coins_earned: 5
      });
      
    if (logError && logError.code !== '23505') { // Ignore unique constraint violation if they somehow double clicked
      console.error("Error logging habit:", logError);
      return { success: false, error: logError.message };
    }

    // 2. Update habit stats (increment streak and completions)
    // Supabase RPC would be best here, but we can do a simple update since we have the streak value
    await supabase
      .from("habits")
      .update({ 
        current_streak: currentStreak + 1,
        total_completions: currentStreak + 1 // Simplified: assuming total completions increases too
      })
      .eq("id", habitId);

    // 3. Award XP to user profile
    // We fetch current XP first, then add. (Again, RPC is better for atomic operations, but this is fine for MVP)
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level, coins")
      .eq("id", user.id)
      .single();
      
    if (profile) {
      const newXp = (profile.xp || 0) + xpReward;
      const newCoins = (profile.coins || 0) + 5;
      const newLevel = Math.floor(newXp / 1000) + 1; // Simplified level formula: 1000 XP per level
      
      await supabase
        .from("profiles")
        .update({ xp: newXp, coins: newCoins, level: newLevel })
        .eq("id", user.id);
    }
  } else {
    // Un-check the habit
    // 1. Delete the log
    await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", dateStr);
      
    // 2. Decrement streak
    await supabase
      .from("habits")
      .update({ 
        current_streak: Math.max(0, currentStreak - 1)
      })
      .eq("id", habitId);
      
    // Note: We don't deduct XP to keep it positive reinforcement, but we could!
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting habit:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/habits");
  return { success: true };
}

export async function getHabitLogsForDate(dateStr: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("habit_id, status")
    .eq("user_id", user.id)
    .eq("date", dateStr);

  if (error) {
    console.error("Error fetching logs for date:", error);
    return [];
  }
  return logs || [];
}
