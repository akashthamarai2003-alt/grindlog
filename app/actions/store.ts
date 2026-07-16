"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";

export async function purchaseItem(itemId: string, cost: number) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("coins, unlocked_items")
    .eq("id", user.id)
    .single();

  if (!profile) return { success: false, error: "Profile not found" };
  
  if ((profile.coins || 0) < cost) {
    return { success: false, error: "Not enough coins!" };
  }

  const currentItems = profile.unlocked_items || [];
  if (currentItems.includes(itemId)) {
    return { success: false, error: "Already owned!" };
  }

  const newCoins = profile.coins - cost;
  const newItems = [...currentItems, itemId];

  const { error } = await supabase
    .from("profiles")
    .update({ 
      coins: newCoins,
      unlocked_items: newItems
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error purchasing item:", error);
    return { success: false, error: "Failed to purchase" };
  }

  revalidatePath("/store");
  return { success: true };
}

export async function equipItem(itemId: string, type: "theme" | "frame") {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updateData = type === "theme" 
    ? { equipped_theme: itemId }
    : { equipped_frame: itemId };

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error(`Error equipping ${type}:`, error);
    return { success: false, error: "Failed to equip" };
  }

  revalidatePath("/store");
  revalidatePath("/", "layout");
  return { success: true };
}
