import { createServerSupabase } from "@/lib/services/supabase/server";
import { getGlobalLeaderboard } from "@/app/actions/gamification";
import { redirect } from "next/navigation";
import { LeaderboardClient } from "./client";

export const revalidate = 60; // Revalidate every minute

export default async function LeaderboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const topUsers = await getGlobalLeaderboard(50);

  // Add dummy users if leaderboard is too empty to make it fun!
  const bots = [
    { id: "bot1", display_name: "Karthik", avatar_url: null, xp: 2500, level: 3 },
    { id: "bot2", display_name: "Priya", avatar_url: null, xp: 1800, level: 2 },
    { id: "bot3", display_name: "Surya", avatar_url: null, xp: 1200, level: 2 },
    { id: "bot4", display_name: "Ananya", avatar_url: null, xp: 900, level: 1 },
    { id: "bot5", display_name: "Vikram", avatar_url: null, xp: 500, level: 1 },
  ];

  const combined = [...(topUsers || [])];
  
  if (combined.length < 5) {
    bots.forEach(bot => {
      if (!combined.find(u => u.id === bot.id)) {
        combined.push(bot);
      }
    });
    // Re-sort by XP since we added bots
    combined.sort((a, b) => b.xp - a.xp);
  }

  return <LeaderboardClient topUsers={combined} currentUserId={user.id} />;
}
