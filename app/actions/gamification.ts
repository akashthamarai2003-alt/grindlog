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
// QUESTS
// ----------------------------------------------------------------------
export async function getOrCreateDailyQuests() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check if quests exist for today
  const { data: existingQuests } = await supabase
    .from("user_quests")
    .select("*")
    .eq("user_id", user.id)
    .eq("quest_type", "daily")
    .eq("date_key", todayStr);

  // 2. Count actual completed habits for today to ensure accurate progress
  const { count: completedCount } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .eq("status", "completed");

  const actualProgress = completedCount || 0;

  if (existingQuests && existingQuests.length > 0) {
    // Self-heal: ensure progress is accurate for today
    for (const quest of existingQuests) {
      const expectedProgress = Math.min(actualProgress, quest.progress_target);
      const expectedCompleted = expectedProgress >= quest.progress_target;
      
      if (quest.progress_current !== expectedProgress || quest.is_completed !== expectedCompleted) {
        // Sync this quest
        await supabase
          .from("user_quests")
          .update({
            progress_current: expectedProgress,
            is_completed: expectedCompleted,
          })
          .eq("id", quest.id);
          
        // Award XP if it just became completed due to the sync
        if (!quest.is_completed && expectedCompleted) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("xp, coins, level")
              .eq("id", user.id)
              .single();
              
            if (profile) {
              const newXp = (profile.xp || 0) + quest.xp_reward;
              const newCoins = (profile.coins || 0) + quest.coins_reward;
              const newLevel = Math.floor(newXp / 1000) + 1;

              await supabase
                .from("profiles")
                .update({ xp: newXp, coins: newCoins, level: newLevel })
                .eq("id", user.id);
            }
        }
        
        // Update local object to reflect the fix
        quest.progress_current = expectedProgress;
        quest.is_completed = expectedCompleted;
      }
    }
    return existingQuests;
  }

  // Define default daily quests
  const defaultQuests = [
    {
      user_id: user.id,
      quest_type: "daily",
      quest_key: "daily_1_habit",
      date_key: todayStr,
      progress_current: Math.min(actualProgress, 1),
      progress_target: 1,
      is_completed: actualProgress >= 1,
      xp_reward: 20,
      coins_reward: 10,
    },
    {
      user_id: user.id,
      quest_type: "daily",
      quest_key: "daily_3_habits",
      date_key: todayStr,
      progress_current: Math.min(actualProgress, 3),
      progress_target: 3,
      is_completed: actualProgress >= 3,
      xp_reward: 50,
      coins_reward: 25,
    },
  ];

  // Insert them
  const { data: newQuests, error } = await supabase
    .from("user_quests")
    .insert(defaultQuests)
    .select("*");

  if (error) {
    console.error("Error creating daily quests:", error);
    return [];
  }

  // If the user already met the criteria, award XP/Coins immediately upon creation!
  let totalXpToAward = 0;
  let totalCoinsToAward = 0;
  
  if (actualProgress >= 1) {
    totalXpToAward += 20;
    totalCoinsToAward += 10;
  }
  if (actualProgress >= 3) {
    totalXpToAward += 50;
    totalCoinsToAward += 25;
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

  return newQuests || [];
}

export async function updateQuestProgress(userId: string, eventType: "habit_completed") {
  const supabase = await createServerSupabase();
  const todayStr = new Date().toISOString().split("T")[0];

  if (eventType === "habit_completed") {
    // 1. Fetch ALL daily quests for today (so we can self-heal un-completed ones too)
    const { data: activeQuests } = await supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", userId)
      .eq("date_key", todayStr);

    if (!activeQuests) return;

    // 2. Count actual completed habits for today
    const { count: completedCount } = await supabase
      .from("habit_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", todayStr)
      .eq("status", "completed");

    const actualProgress = completedCount || 0;

    for (const quest of activeQuests) {
      if (quest.quest_key.startsWith("daily_")) {
        const wasCompleted = quest.is_completed;
        const newProgress = Math.min(actualProgress, quest.progress_target);
        const isCompletedNow = newProgress >= quest.progress_target;

        // Only update if something changed
        if (quest.progress_current !== newProgress || wasCompleted !== isCompletedNow) {
          await supabase
            .from("user_quests")
            .update({
              progress_current: newProgress,
              is_completed: isCompletedNow,
            })
            .eq("id", quest.id);

          if (!wasCompleted && isCompletedNow) {
            // Award XP and Coins!
            const { data: profile } = await supabase
              .from("profiles")
              .select("xp, coins, level")
              .eq("id", userId)
              .single();

            if (profile) {
              const newXp = (profile.xp || 0) + quest.xp_reward;
              const newCoins = (profile.coins || 0) + quest.coins_reward;
              const newLevel = Math.floor(newXp / 1000) + 1;

              await supabase
                .from("profiles")
                .update({ xp: newXp, coins: newCoins, level: newLevel })
                .eq("id", userId);
            }
          }
        }
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
