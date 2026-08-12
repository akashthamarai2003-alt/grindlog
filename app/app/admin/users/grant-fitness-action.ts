"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";
import { calculateExpiryDate } from "@/lib/utils";

export async function grantFitnessOSAction(userId: string, tier: "monthly" | "lifetime" = "monthly", level: "core" | "pro" = "pro") {
  if (!userId) return { success: false, error: "No user ID provided" };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("profiles")
    .update({
      is_premium: true,
      premium_tier: tier,
      premium_level: level,
      premium_expires_at: tier === "lifetime" ? null : calculateExpiryDate(tier),
    })
    .eq("id", userId);

  if (error) {
    console.error("grantFitnessOSAction error:", error);
    return { success: false, error: error.message };
  }

  // Record in subscriptions for audit trail
  try {
    await adminClient.from("subscriptions").insert({
      user_id: userId,
      plan: `${tier}_${level}_admin_grant`,
      status: "active",
      razorpay_order_id: "admin_grant",
      razorpay_payment_id: "admin_grant",
      expires_at: tier === "lifetime" ? null : calculateExpiryDate(tier),
      started_at: new Date().toISOString(),
    });
  } catch (subErr) {
    console.warn("Grant subscription record warning:", subErr);
  }

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");

  return { success: true };
}

export async function revokeFitnessOSAction(userId: string) {
  if (!userId) return { success: false, error: "No user ID provided" };

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("profiles")
    .update({
      is_premium: false,
      premium_tier: null,
      premium_level: null,
      premium_expires_at: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("revokeFitnessOSAction error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/", "layout");

  return { success: true };
}
