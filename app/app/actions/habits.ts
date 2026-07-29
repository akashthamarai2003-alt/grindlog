"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";
import { isHabitScheduled } from "@/lib/habit-utils";
import { HabitFrequency } from "@/types";
import { updateQuestProgress, checkAndUnlockAchievements, awardSeasonXp } from "./gamification";


export async function revalidateDashboard() {
  revalidatePath("/", "layout");
}

export async function getMaxUserStreak() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: habits } = await supabase
    .from("habits")
    .select("current_streak")
    .eq("user_id", user.id);

  if (!habits || habits.length === 0) return 0;
  
  return Math.max(...habits.map((h: any) => h.current_streak || 0));
}

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
    // 1. Check existing log to handle remarks and prevent double XP
    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("status, remarks")
      .eq("habit_id", habitId)
      .eq("date", dateStr)
      .single();

    if (existingLog?.status === "completed") {
      // Already logged, just return without awarding double XP
      return { success: true };
    }

    let logError;
    if (existingLog) {
      // Log exists (e.g., skipped to preserve remarks), so update it
      const { error } = await supabase
        .from("habit_logs")
        .update({
          status: "completed",
          streak_before: currentStreak,
          streak_after: currentStreak + 1,
          xp_earned: xpReward,
          coins_earned: 5
        })
        .eq("habit_id", habitId)
        .eq("date", dateStr);
      logError = error;
    } else {
      // No log exists, insert a new one
      const { error } = await supabase
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
      logError = error;
    }
      
    if (logError) {
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
        
      await awardSeasonXp(user.id, xpReward);
    }
    
    // 4. Trigger gamification logic
    await Promise.all([
      updateQuestProgress(user.id, "habit_completed"),
      checkAndUnlockAchievements(user.id)
    ]).catch(console.error);
  } else {
    // Un-check the habit
    // 1. Check if there are remarks
    const { data: logToUncheck } = await supabase
      .from("habit_logs")
      .select("remarks")
      .eq("habit_id", habitId)
      .eq("date", dateStr)
      .single();

    let deletedLogs = null;
    let deleteError = null;

    if (logToUncheck?.remarks && logToUncheck.remarks.trim() !== "") {
      // Preserve remarks, just change status to skipped
      const { data, error } = await supabase
        .from("habit_logs")
        .update({
          status: "skipped",
          streak_before: 0,
          streak_after: 0,
          xp_earned: 0,
          coins_earned: 0
        })
        .eq("habit_id", habitId)
        .eq("date", dateStr)
        .select();
      
      deletedLogs = data;
      deleteError = error;
    } else {
      // Safely delete if no remarks
      const { data, error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("date", dateStr)
        .select();
        
      deletedLogs = data;
      deleteError = error;
    }
      
    if (deleteError) {
      console.error("Error un-logging habit:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // If nothing was modified, do not deduct XP
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
        
      await awardSeasonXp(user.id, -xpReward);
    }
  }

  revalidatePath("/", "layout");
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

  revalidatePath("/", "layout");
  return { success: true };
}

export async function getHabitLogsForDate(dateStr: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("habit_id, status, remarks")
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
  
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateHabitRemark(habitId: string, dateStr: string, remarks: string | null) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("habit_logs")
    .update({ remarks })
    .eq("habit_id", habitId)
    .eq("date", dateStr)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating remark:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
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
          status: "missed",
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

export async function checkHabitLimitAction(requestedNewCount: number = 1) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: false, error: "Not authenticated" };

    const [{ data: profile }, { count }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true)
    ]);

    const isPro = (profile as any)?.premium_level === "pro";
    const activeCount = count || 0;

    if (!isPro && (activeCount + requestedNewCount) > 10) {
      return {
        allowed: false,
        activeCount,
        isPro: false,
        error: `Core plan limit reached! You have ${activeCount} active habit(s). Core plan allows maximum 10 active habits. Upgrade to Pro for unlimited habits!`
      };
    }

    return { allowed: true, activeCount, isPro };
  } catch (err: any) {
    console.error("Habit limit check error:", err);
    return { allowed: true, activeCount: 0, isPro: false };
  }
}

export async function getUserTreeStats() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { streak: 1, habitsCompleted: 0 };

    const [{ data: habits }, { count: habitsCompleted }] = await Promise.all([
      supabase.from("habits").select("current_streak").eq("user_id", user.id).eq("is_active", true),
      supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed")
    ]);

    const maxStreak = habits && habits.length > 0 ? Math.max(...habits.map((h: any) => h.current_streak || 0)) : 0;
    
    return {
      streak: maxStreak === 0 ? 1 : maxStreak,
      habitsCompleted: habitsCompleted || 0
    };
  } catch (err: any) {
    console.error("Failed to fetch user tree stats:", err);
    return { streak: 1, habitsCompleted: 0 };
  }
}
