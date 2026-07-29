import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { StoreClient } from "./client";

export default async function StorePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("coins, unlocked_items, equipped_theme, equipped_frame")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <StoreClient 
      coins={profile.coins || 0}
      unlockedItems={profile.unlocked_items || []}
      equippedTheme={profile.equipped_theme || "default"}
      equippedFrame={profile.equipped_frame || "none"}
    />
  );
}
