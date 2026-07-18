import { createServerSupabase } from "@/lib/services/supabase/server";
import { AchievementsClient } from "./client";
import { redirect } from "next/navigation";
import { checkAndUnlockAchievements } from "@/app/actions/gamification";

export default async function AchievementsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Retroactively check and unlock any pending achievements 
  // based on the user's real historical data before fetching
  const liveStats = await checkAndUnlockAchievements(user.id);

  // Fetch all achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });

  // Fetch user's unlocked achievements
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id);

  const unlockedMap = new Map((unlocked || []).map(u => [u.achievement_id, u]));

  // Merge them
  const formattedAchievements = (achievements || []).map(a => {
    const userAch = unlockedMap.get(a.id);
    let currentProgress = 0;
    let target = 1;

    if (userAch) {
      currentProgress = userAch.progress_current;
      target = userAch.progress_target;
    } else if (liveStats) {
      // It's locked, map live stats to progress and target based on achievement key
      switch (a.key) {
        case 'first_steps':
          currentProgress = liveStats.totalCompletions;
          target = 1;
          break;
        case 'weekly_warrior':
          currentProgress = liveStats.maxStreak;
          target = 7;
          break;
        case 'habit_formed':
          currentProgress = liveStats.maxStreak;
          target = 21;
          break;
        case 'monthly_master':
          currentProgress = liveStats.maxStreak;
          target = 30;
          break;
        case 'year_streak':
          currentProgress = liveStats.maxStreak;
          target = 365;
          break;
        case 'first_leaf':
          currentProgress = liveStats.treeLeaves;
          target = 1;
          break;
        case 'butterfly_effect':
          currentProgress = liveStats.treeButterflies;
          target = 1;
          break;
        case 'early_bird':
          currentProgress = liveStats.earlyBirdCount;
          target = 1;
          break;
        case 'night_owl':
          currentProgress = liveStats.nightOwlCount;
          target = 1;
          break;
        default:
          currentProgress = 0;
          target = 1;
      }
    }

    return {
      id: a.id,
      name: a.name,
      desc: a.description,
      emoji: a.emoji,
      category: a.category,
      xp: a.xp_reward,
      unlocked: !!userAch,
      date: userAch?.unlocked_at ? new Date(userAch.unlocked_at).toLocaleDateString() : undefined,
      progress: currentProgress,
      target: target
    };
  });

  return <AchievementsClient initialAchievements={formattedAchievements} />;
}
