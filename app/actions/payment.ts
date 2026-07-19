"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";

export async function validateCouponAction(code: string) {
  if (!code) return { success: false, error: "Please enter a code" };
  
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("id, discount_percentage, used_count, max_uses, is_active, allowed_plan")
    .eq("code", code.toUpperCase().trim())
    .single();
    
  if (error || !data) {
    return { success: false, error: "Invalid coupon code" };
  }
  
  if (!data.is_active) {
    return { success: false, error: "This coupon is disabled" };
  }
  
  if (data.used_count >= data.max_uses) {
    return { success: false, error: "This coupon has reached its usage limit" };
  }
  
  return { 
    success: true, 
    discount: data.discount_percentage,
    id: data.id,
    allowed_plan: data.allowed_plan
  };
}

export async function processMockPayment(tier: "monthly" | "six_months" | "lifetime", level?: "core" | "pro", couponId?: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // If a coupon was used, validate and increment
  if (couponId) {
    const adminClient = createAdminClient();
    const { data: coupon } = await adminClient
      .from("coupons")
      .select("used_count, max_uses, is_active, allowed_plan")
      .eq("id", couponId)
      .single();
      
    if (!coupon || !coupon.is_active || coupon.used_count >= coupon.max_uses) {
      return { success: false, error: "Coupon is no longer valid" };
    }
    
    if (coupon.allowed_plan && coupon.allowed_plan !== tier) {
      return { success: false, error: `This coupon is only valid for the ${coupon.allowed_plan} plan` };
    }
    
    // Increment usage (simple approach for mock)
    await adminClient
      .from("coupons")
      .update({ used_count: coupon.used_count + 1 })
      .eq("id", couponId);
  }

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
