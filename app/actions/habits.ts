"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";
import { isHabitScheduled } from "@/lib/habit-utils";
import { HabitFrequency } from "@/types";


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
      
    if (logError) {
      if (logError.code === '23505') {
        // Already logged, just return without awarding double XP
        return { success: true };
      }
      console.error("Error logging habit:", logError);
      return { success: false, error: logError.message };
    }

    // 2. Update habit stats via perfect historical recalculation
    await recalculateStreak(habitId, user.id);

    // 3. Award XP to user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level, coins")
      .eq("id", user.id)
      .single();
      
    if (profile) {
      const newXp = (profile.xp || 0) + xpReward;
      const newCoins = (profile.coins || 0) + 5;
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      await supabase
        .from("profiles")
        .update({ xp: newXp, coins: newCoins, level: newLevel })
        .eq("id", user.id);
    }
  } else {
    // Un-check the habit
    // 1. Delete the log
    const { data: deletedLogs, error: deleteError } = await supabase
      .from("habit_logs")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", dateStr)
      .select();
      
    if (deleteError) {
      console.error("Error un-logging habit:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // If nothing was deleted (e.g. rapid double clicks), do not deduct XP
    if (!deletedLogs || deletedLogs.length === 0) {
      return { success: true };
    }

    // 2. Decrement streak via perfect historical recalculation
    await recalculateStreak(habitId, user.id);
      
    // 3. Deduct XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level, coins")
      .eq("id", user.id)
      .single();
      
    if (profile) {
      const newXp = Math.max(0, (profile.xp || 0) - xpReward);
      const newCoins = Math.max(0, (profile.coins || 0) - 5);
      const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
      
      await supabase
        .from("profiles")
        .update({ xp: newXp, coins: newCoins, level: newLevel })
        .eq("id", user.id);
    }
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

export async function setHabitLogStatus(habitId: string, dateStr: string, status: "completed" | "skipped" | "failed" | null) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (status === null) {
    await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("date", dateStr).eq("user_id", user.id);
  } else {
    await supabase.from("habit_logs").upsert({ habit_id: habitId, date: dateStr, status, user_id: user.id }, { onConflict: "habit_id,date" });
  }

  // Recalculate streak immediately for this habit
  await recalculateStreak(habitId, user.id);
  
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function syncMissedHabits(todayDateStr: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: habits } = await supabase
    .from("habits")
    .select("id, created_at, current_streak, frequency, custom_days")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!habits || habits.length === 0) return;

  const yesterday = new Date(todayDateStr + "T12:00:00");
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, date")
    .eq("user_id", user.id)
    .lte("date", yesterdayStr);

  const logsMap = new Set(logs?.map((l: any) => `${l.habit_id}_${l.date}`) || []);
  const logsToInsert: any[] = [];
  const habitsToResetStreak = new Set<string>();

  for (const habit of habits) {
    if (!habit.created_at) continue;
    const createdDate = new Date(habit.created_at);
    const createdStr = createdDate.toISOString().split("T")[0];

    let curr = new Date(createdStr + "T12:00:00");
    let yDate = new Date(yesterdayStr + "T12:00:00");
    let missedYesterday = false;

    while (curr <= yDate) {
      const isScheduled = isHabitScheduled(habit.frequency, habit.custom_days, curr);
      if (!isScheduled) {
        curr.setDate(curr.getDate() + 1);
        continue;
      }
      const dStr = curr.toISOString().split("T")[0];
      const key = `${habit.id}_${dStr}`;
      
      if (!logsMap.has(key)) {
        logsToInsert.push({
          habit_id: habit.id,
          user_id: user.id,
          date: dStr,
          status: "failed",
          streak_before: 0,
          streak_after: 0,
          xp_earned: 0,
          coins_earned: 0
        });
        if (dStr === yesterdayStr) {
          missedYesterday = true;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (missedYesterday && habit.current_streak > 0) {
      habitsToResetStreak.add(habit.id);
    }
  }

  if (logsToInsert.length > 0) {
    await supabase.from("habit_logs").insert(logsToInsert);
  }

  for (const habitId of habitsToResetStreak) {
    await supabase.from("habits").update({ current_streak: 0 }).eq("id", habitId);
  }
}

async function recalculateStreak(habitId: string, userId: string) {
  const supabase = await createServerSupabase();
  
  const { data: habit } = await supabase
    .from("habits")
    .select("frequency, custom_days, created_at")
    .eq("id", habitId)
    .single();

  if (!habit) return;

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("date")
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("status", "completed");

  if (!logs || logs.length === 0) {
    await supabase.from("habits").update({ current_streak: 0, total_completions: 0 }).eq("id", habitId);
    return;
  }

  const completedDates = new Set(logs.map(l => l.date));
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];
  const createdStr = habit.created_at ? habit.created_at.split("T")[0] : "2000-01-01";
  
  let d = new Date(todayStr + "T12:00:00Z");
  let streak = 0;

  while (true) {
    const dStr = d.toISOString().split("T")[0];
    if (dStr < createdStr) break;

    const isScheduled = isHabitScheduled(habit.frequency, habit.custom_days, d);
    const isCompleted = completedDates.has(dStr);

    if (isCompleted) {
      streak++;
    } else {
      if (isScheduled && dStr !== todayStr) {
        break; // Streak broken on a past scheduled day
      }
    }
    
    d.setUTCDate(d.getUTCDate() - 1);
  }

  await supabase.from("habits").update({ current_streak: streak, total_completions: logs.length }).eq("id", habitId);
}
