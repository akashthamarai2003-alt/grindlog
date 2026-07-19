"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";

export async function processMockPayment(tier: "monthly" | "six_months" | "lifetime", level?: "core" | "pro") {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // We save the tier, and we could also save level if we wanted to enforce it.
  // For the mock, we just upgrade them.
  const { error } = await supabase
    .from("profiles")
    .update({ 
      is_premium: true,
      premium_tier: tier 
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating premium status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
