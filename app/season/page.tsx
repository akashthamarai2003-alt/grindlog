import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { SeasonClient } from "./client";

export default async function SeasonPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch season progress and user profile XP
  const { data: progress } = await supabase
    .from("season_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("season_id", "summer_2026")
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", user.id)
    .single();

  const realXp = profile?.xp || 0;

  let finalProgress = progress;

  if (!finalProgress) {
    // Initialize if they don't have it
    const { data: newProgress } = await supabase
      .from("season_progress")
      .insert({
        user_id: user.id,
        season_id: "summer_2026",
        current_xp: realXp,
        claimed_tiers: []
      })
      .select("*")
      .single();
    
    finalProgress = newProgress;
  } else if (finalProgress && finalProgress.current_xp !== realXp) {
    // Keep it synced with their real total XP
    const { data: updatedProgress } = await supabase
      .from("season_progress")
      .update({ current_xp: realXp })
      .eq("id", finalProgress.id)
      .select("*")
      .single();
    if (updatedProgress) finalProgress = updatedProgress;
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
