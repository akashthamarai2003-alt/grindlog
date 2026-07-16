import { createServerSupabase } from "@/lib/services/supabase/server";
import { AchievementsClient } from "./client";
import { redirect } from "next/navigation";

export default async function AchievementsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

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
    return {
      id: a.id,
      name: a.name,
      desc: a.description,
      emoji: a.emoji,
      category: a.category,
      xp: a.xp_reward,
      unlocked: !!userAch,
      date: userAch?.unlocked_at ? new Date(userAch.unlocked_at).toLocaleDateString() : undefined,
      progress: userAch?.progress_current || 0,
      target: userAch?.progress_target || 1
    };
  });

  return <AchievementsClient initialAchievements={formattedAchievements} />;
}
