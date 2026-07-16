import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { SeasonClient } from "./client";

export default async function SeasonPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch season progress
  const { data: progress } = await supabase
    .from("season_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("season_id", "summer_2026")
    .single();

  let finalProgress = progress;

  if (!finalProgress) {
    // Initialize if they don't have it
    const { data: newProgress } = await supabase
      .from("season_progress")
      .insert({
        user_id: user.id,
        season_id: "summer_2026",
        current_xp: 0,
        claimed_tiers: []
      })
      .select("*")
      .single();
    
    finalProgress = newProgress;
  }

  // We could fetch a real "season_rewards" table here, but for now we hardcode the season structure.
  const seasonData = {
    id: "summer_2026",
    name: "Summer 2026 Season",
    endDate: "2026-08-31",
    tiers: Array.from({ length: 20 }).map((_, i) => ({
      tier: i + 1,
      xpRequired: (i + 1) * 500, // 500 XP per tier
      rewardCoins: (i + 1) % 5 === 0 ? 500 : 100,
    }))
  };

  return <SeasonClient seasonData={seasonData} progress={finalProgress} />;
}
