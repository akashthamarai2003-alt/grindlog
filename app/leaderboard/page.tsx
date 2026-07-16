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

  return <LeaderboardClient topUsers={topUsers} currentUserId={user.id} />;
}
