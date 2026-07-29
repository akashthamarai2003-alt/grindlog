import { createClient } from "@/lib/services/supabase/client";

interface AchievementCheck {
  key: string;
  check: () => Promise<{ unlocked: boolean; progress: number; target: number }>;
}

export function getAchievementChecks(userId: string): AchievementCheck[] {
  const supabase = createClient();

  return [
    {
      key: "first_habit",
      check: async () => {
        const { count } = await supabase
          .from("habit_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "completed");
        return { unlocked: (count ?? 0) >= 1, progress: count ?? 0, target: 1 };
      },
    },
    {
      key: "seven_day",
      check: async () => {
        const { data } = await supabase
          .from("habits")
          .select("longest_streak")
          .eq("user_id", userId);
        const rows = data as { longest_streak: number }[] | null;
        const maxStreak = Math.max(0, ...(rows ?? []).map((h) => h.longest_streak));
        return { unlocked: maxStreak >= 7, progress: maxStreak, target: 7 };
      },
    },
    {
      key: "twenty_one_day",
      check: async () => {
        const { data } = await supabase
          .from("habits")
          .select("longest_streak")
          .eq("user_id", userId);
        const rows = data as { longest_streak: number }[] | null;
        const maxStreak = Math.max(0, ...(rows ?? []).map((h) => h.longest_streak));
        return { unlocked: maxStreak >= 21, progress: maxStreak, target: 21 };
      },
    },
    {
      key: "thirty_day",
      check: async () => {
        const { data } = await supabase
          .from("habits")
          .select("longest_streak")
          .eq("user_id", userId);
        const rows = data as { longest_streak: number }[] | null;
        const maxStreak = Math.max(0, ...(rows ?? []).map((h) => h.longest_streak));
        return { unlocked: maxStreak >= 30, progress: maxStreak, target: 30 };
      },
    },
  ];
}

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const checks = getAchievementChecks(userId);
  const newlyUnlocked: string[] = [];

  for (const check of checks) {
    const { unlocked, progress, target } = await check.check();

    const { data: achievement } = await supabase
      .from("achievements")
      .select("id, xp_reward, coins_reward")
      .eq("key", check.key)
      .single();

    if (!achievement) continue;

    const ach = achievement as { id: string; xp_reward: number; coins_reward: number };

    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", ach.id)
      .single();

    if (existing) continue;

    if (unlocked) {
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: ach.id,
        progress_current: progress,
        progress_target: target,
      });

      await supabase.rpc("add_xp", { xp_amount: ach.xp_reward });

      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("id", userId)
        .single();

      const prof = profile as { coins: number } | null;
      if (prof) {
        await supabase
          .from("profiles")
          .update({ coins: prof.coins + ach.coins_reward })
          .eq("id", userId);
      }

      newlyUnlocked.push(check.key);
    } else {
      await supabase.from("user_achievements").upsert({
        user_id: userId,
        achievement_id: ach.id,
        progress_current: progress,
        progress_target: target,
      });
    }
  }

  return newlyUnlocked;
}
