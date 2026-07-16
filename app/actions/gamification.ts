"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------------------------
// LEADERBOARDS
// ----------------------------------------------------------------------
export async function getGlobalLeaderboard(limit = 50) {
  const supabase = await createServerSupabase();
  
  const { data: topUsers, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, xp, level")
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
  
  return topUsers || [];
}


// ----------------------------------------------------------------------
// QUEST PERIOD HELPERS
// ----------------------------------------------------------------------
function getQuestPeriods() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  
  const currentDay = now.getUTCDay();
  const diffToMonday = now.getUTCDate() - currentDay + (currentDay === 0 ? -6 : 1);
  
  const monday = new Date(now);
  monday.setUTCDate(diffToMonday);
  const weekStartStr = monday.toISOString().split("T")[0];
  
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const weekEndStr = sunday.toISOString().split("T")[0];
  const weekKey = `W_${weekStartStr}`;
  
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthStartStr = monthStart.toISOString().split("T")[0];
  
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const monthEndStr = monthEnd.toISOString().split("T")[0];
  
  const monthKey = `M_${now.getUTCFullYear()}_${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  
  return { todayStr, weekKey, weekStartStr, weekEndStr, monthKey, monthStartStr, monthEndStr };
}

// ----------------------------------------------------------------------
// QUESTS
// ----------------------------------------------------------------------
export async function getOrCreateAllQuests() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { todayStr, weekKey, weekStartStr, weekEndStr, monthKey, monthStartStr, monthEndStr } = getQuestPeriods();

  // 1. Fetch all quests for this user
  const { data: allQuests } = await supabase
    .from("user_quests")
    .select("*")
    .eq("user_id", user.id)
    .in("date_key", [todayStr, weekKey, monthKey]);

  // 2. Count actual completed habits for today, this week, this month
  const { count: dailyCount } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .eq("status", "completed");

  const { count: weeklyCount } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("date", weekStartStr)
    .lte("date", weekEndStr)
    .eq("status", "completed");

  const { count: monthlyCount } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("date", monthStartStr)
    .lte("date", monthEndStr)
    .eq("status", "completed");

  const progress = {
    daily: dailyCount || 0,
    weekly: weeklyCount || 0,
    monthly: monthlyCount || 0,
  };

  const existingQuests = allQuests || [];
  const existingKeys = new Set(existingQuests.map(q => q.quest_key));

  const questsToInsert: any[] = [];
  
  // Define default quests
  const defaultQuestsTemplate = [
    { type: "daily", key: "daily_1_habit", target: 1, xp: 20, coins: 10, dateKey: todayStr },
    { type: "daily", key: "daily_3_habits", target: 3, xp: 50, coins: 25, dateKey: todayStr },
    { type: "weekly", key: "weekly_10_habits", target: 10, xp: 150, coins: 75, dateKey: weekKey },
    { type: "weekly", key: "weekly_20_habits", target: 20, xp: 300, coins: 150, dateKey: weekKey },
    { type: "monthly", key: "monthly_50_habits", target: 50, xp: 1000, coins: 500, dateKey: monthKey },
    { type: "monthly", key: "monthly_100_habits", target: 100, xp: 2500, coins: 1000, dateKey: monthKey },
  ];

  let totalXpToAward = 0;
  let totalCoinsToAward = 0;

  for (const tpl of defaultQuestsTemplate) {
    const actProg = progress[tpl.type as keyof typeof progress];
    const expectedProg = Math.min(actProg, tpl.target);
    const expectedComp = expectedProg >= tpl.target;

    if (!existingKeys.has(tpl.key)) {
      // Create new quest
      questsToInsert.push({
        user_id: user.id,
        quest_type: tpl.type,
        quest_key: tpl.key,
        date_key: tpl.dateKey,
        progress_current: expectedProg,
        progress_target: tpl.target,
        is_completed: expectedComp,
        xp_reward: tpl.xp,
        coins_reward: tpl.coins,
      });

      if (expectedComp) {
        totalXpToAward += tpl.xp;
        totalCoinsToAward += tpl.coins;
      }
    } else {
      // Sync existing quest
      const q = existingQuests.find(q => q.quest_key === tpl.key);
      if (q && (q.progress_current !== expectedProg || q.is_completed !== expectedComp)) {
        await supabase
          .from("user_quests")
          .update({
            progress_current: expectedProg,
            is_completed: expectedComp,
          })
          .eq("id", q.id);

        if (!q.is_completed && expectedComp) {
          totalXpToAward += tpl.xp;
          totalCoinsToAward += tpl.coins;
        }

        q.progress_current = expectedProg;
        q.is_completed = expectedComp;
      }
    }
  }

  let finalQuests = [...existingQuests];

  if (questsToInsert.length > 0) {
    const { data: insertedQuests } = await supabase
      .from("user_quests")
      .insert(questsToInsert)
      .select("*");
    
    if (insertedQuests) {
      finalQuests = [...finalQuests, ...insertedQuests];
    }
  }

  if (totalXpToAward > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, coins, level")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.xp || 0) + totalXpToAward;
      const newCoins = (profile.coins || 0) + totalCoinsToAward;
      const newLevel = Math.floor(newXp / 1000) + 1;

      await supabase
        .from("profiles")
        .update({ xp: newXp, coins: newCoins, level: newLevel })
        .eq("id", user.id);
    }
  }

  return finalQuests;
}

export async function updateQuestProgress(userId: string, eventType: "habit_completed") {
  const supabase = await createServerSupabase();
  const { todayStr, weekKey, weekStartStr, weekEndStr, monthKey, monthStartStr, monthEndStr } = getQuestPeriods();

  if (eventType === "habit_completed") {
    // 1. Fetch ALL active quests for today's periods
    const { data: activeQuests } = await supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", userId)
      .in("date_key", [todayStr, weekKey, monthKey]);

    if (!activeQuests) return;

    // 2. Count actual completed habits for all periods
    const { count: dailyCount } = await supabase
      .from("habit_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", todayStr)
      .eq("status", "completed");

    const { count: weeklyCount } = await supabase
      .from("habit_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("status", "completed");

    const { count: monthlyCount } = await supabase
      .from("habit_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", monthStartStr)
      .lte("date", monthEndStr)
      .eq("status", "completed");

    const progress = {
      daily: dailyCount || 0,
      weekly: weeklyCount || 0,
      monthly: monthlyCount || 0,
    };

    let totalXpToAward = 0;
    let totalCoinsToAward = 0;

    for (const quest of activeQuests) {
      const actProg = progress[quest.quest_type as keyof typeof progress];
      if (actProg === undefined) continue;

      const wasCompleted = quest.is_completed;
      const newProgress = Math.min(actProg, quest.progress_target);
      const isCompletedNow = newProgress >= quest.progress_target;

      if (quest.progress_current !== newProgress || wasCompleted !== isCompletedNow) {
        await supabase
          .from("user_quests")
          .update({
            progress_current: newProgress,
            is_completed: isCompletedNow,
          })
          .eq("id", quest.id);

        if (!wasCompleted && isCompletedNow) {
          totalXpToAward += quest.xp_reward;
          totalCoinsToAward += quest.coins_reward;
        }
      }
    }

    if (totalXpToAward > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, coins, level")
        .eq("id", userId)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + totalXpToAward;
        const newCoins = (profile.coins || 0) + totalCoinsToAward;
        const newLevel = Math.floor(newXp / 1000) + 1;

        await supabase
          .from("profiles")
          .update({ xp: newXp, coins: newCoins, level: newLevel })
          .eq("id", userId);
      }
    }
  }
}

// ----------------------------------------------------------------------
// ACHIEVEMENTS
// ----------------------------------------------------------------------
export async function checkAndUnlockAchievements(userId: string) {
  const supabase = await createServerSupabase();

  // 1. Get user's current habits and stats
  const { data: habits } = await supabase
    .from("habits")
    .select("current_streak, total_completions, is_active")
    .eq("user_id", userId);

  // 2. Get user's profile stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("tree_leaves_count, tree_butterflies_count")
    .eq("id", userId)
    .single();

  if (!habits || !profile) return;

  // 3. Evaluate milestones
  let maxStreak = 0;
  let totalCompletions = 0;
  
  habits.forEach((h: any) => {
    if (h.current_streak > maxStreak) maxStreak = h.current_streak;
    totalCompletions += h.total_completions;
  });

  const conditions = {
    first_steps: totalCompletions >= 1,
    weekly_warrior: maxStreak >= 7,
    habit_formed: maxStreak >= 21,
    monthly_master: maxStreak >= 30,
    year_streak: maxStreak >= 365,
    first_leaf: profile.tree_leaves_count > 0,
    butterfly_effect: profile.tree_butterflies_count > 0,
  };

  // 4. Get all available achievements
  const { data: allAchievements } = await supabase.from("achievements").select("*");
  if (!allAchievements) return;

  // 5. Get user's already unlocked achievements
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(unlocked?.map((u: any) => u.achievement_id) || []);

  // 6. Check and unlock
  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue; // Already unlocked

    const isMet = (conditions as any)[achievement.key];
    
    if (isMet) {
      // Unlock it
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
        progress_current: 1,
        progress_target: 1,
      });

      // Award XP & Coins
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("xp, coins")
        .eq("id", userId)
        .single();

      if (currentProfile) {
        const newXp = (currentProfile.xp || 0) + (achievement.xp_reward || 0);
        const newCoins = (currentProfile.coins || 0) + (achievement.coins_reward || 0);
        const newLevel = Math.floor(newXp / 1000) + 1;

        await supabase
          .from("profiles")
          .update({ xp: newXp, coins: newCoins, level: newLevel })
          .eq("id", userId);
      }
    }
  }
}
