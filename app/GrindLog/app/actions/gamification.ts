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
// SEASON XP
// ----------------------------------------------------------------------
export async function awardSeasonXp(userId: string, xpAmount: number) {
  if (xpAmount === 0) return;
  
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return;
  const seasonId = "summer_2026";
  
  const { data: progress } = await supabase
    .from("season_progress")
    .select("id, current_xp")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .single();
    
  if (progress) {
    const newXp = Math.max(0, (progress.current_xp || 0) + xpAmount);
    await supabase
      .from("season_progress")
      .update({ current_xp: newXp })
      .eq("id", progress.id);
  } else if (xpAmount > 0) {
    await supabase
      .from("season_progress")
      .insert({
        user_id: userId,
        season_id: seasonId,
        current_xp: xpAmount,
        claimed_tiers: []
      });
  }
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
    { type: "daily", key: "daily_5_habits", target: 5, xp: 100, coins: 50, dateKey: todayStr },
    { type: "daily", key: "daily_7_habits", target: 7, xp: 200, coins: 100, dateKey: todayStr },
    { type: "weekly", key: "weekly_10_habits", target: 10, xp: 150, coins: 75, dateKey: weekKey },
    { type: "weekly", key: "weekly_20_habits", target: 20, xp: 300, coins: 150, dateKey: weekKey },
    { type: "weekly", key: "weekly_35_habits", target: 35, xp: 500, coins: 250, dateKey: weekKey },
    { type: "weekly", key: "weekly_50_habits", target: 50, xp: 800, coins: 400, dateKey: weekKey },
    { type: "monthly", key: "monthly_50_habits", target: 50, xp: 1000, coins: 500, dateKey: monthKey },
    { type: "monthly", key: "monthly_100_habits", target: 100, xp: 2500, coins: 1000, dateKey: monthKey },
    { type: "monthly", key: "monthly_150_habits", target: 150, xp: 4000, coins: 2000, dateKey: monthKey },
    { type: "monthly", key: "monthly_200_habits", target: 200, xp: 6000, coins: 3000, dateKey: monthKey },
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
        
      await awardSeasonXp(user.id, totalXpToAward);
    }
  }

  return finalQuests;
}

export async function updateQuestProgress(userId: string, eventType: "habit_completed") {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return;
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
          
        await awardSeasonXp(userId, totalXpToAward);
      }
    }
  }
}

// ----------------------------------------------------------------------
// ACHIEVEMENTS
// ----------------------------------------------------------------------
export async function checkAndUnlockAchievements(userId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) return;

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

  // 3. Get habit logs for early bird / night owl
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("status", "completed");

  let earlyBirdCount = 0;
  let nightOwlCount = 0;

  if (logs) {
    logs.forEach((log: any) => {
      if (!log.completed_at) return;
      const date = new Date(log.completed_at);
      const hours = date.getHours(); // Local time of the server, assuming UTC but good enough for now
      if (hours < 9) earlyBirdCount++;
      if (hours >= 21) nightOwlCount++;
    });
  }

  // 4. Evaluate milestones
  let maxStreak = 0;
  let totalCompletions = 0;
  
  if (habits) {
    habits.forEach((h: any) => {
      if (h.current_streak > maxStreak) maxStreak = h.current_streak;
      totalCompletions += h.total_completions;
    });
  }

  const stats = {
    maxStreak,
    totalCompletions,
    earlyBirdCount,
    nightOwlCount,
    treeLeaves: profile?.tree_leaves_count || 0,
    treeButterflies: profile?.tree_butterflies_count || 0
  };

  const conditions = {
    first_steps: totalCompletions >= 1,
    weekly_warrior: maxStreak >= 7,
    habit_formed: maxStreak >= 21,
    monthly_master: maxStreak >= 30,
    year_streak: maxStreak >= 365,
    quarterly_master: maxStreak >= 90,
    half_year_hero: maxStreak >= 180,
    thousand_club: totalCompletions >= 1000,
    grind_legend: totalCompletions >= 5000,
    first_leaf: stats.treeLeaves > 0,
    butterfly_effect: stats.treeButterflies > 0,
    early_bird: earlyBirdCount >= 1,
    night_owl: nightOwlCount >= 1,
  };

  // 5. Get all available achievements
  const { data: allAchievements } = await supabase.from("achievements").select("*");
  
  if (allAchievements) {
    // 6. Get user's already unlocked achievements
    const { data: unlocked } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    const unlockedIds = new Set(unlocked?.map((u: any) => u.achievement_id) || []);

    // 7. Check and unlock
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
            
          await awardSeasonXp(userId, achievement.xp_reward || 0);
        }
      }
    }
  }
  
  return stats;
}
