"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";
import { calculateExpiryDate } from "@/lib/utils";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});


export async function validateCouponAction(code: string) {
  if (!code) return { success: false, error: "Please enter a code" };
  
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("id, discount_percentage, used_count, max_uses, is_active, allowed_plan, allowed_level")
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
    allowed_plan: data.allowed_plan,
    allowed_level: data.allowed_level
  };
}

export async function createRazorpayOrder(
  tier: "monthly" | "six_months" | "lifetime", 
  level: "core" | "pro", 
  couponId?: string
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Fetch dynamic live offer prices set by Admin
  const livePricing = await getPlanPricesAction();
  let finalPrice = livePricing[tier]?.[level]?.price || 0;

  if (finalPrice <= 0) {
    return { success: false, error: "Invalid plan" };
  }

  // Calculate discount
  if (couponId) {
    const adminClient = createAdminClient();
    const { data: coupon } = await adminClient
      .from("coupons")
      .select("discount_percentage, used_count, max_uses, is_active, allowed_plan, allowed_level")
      .eq("id", couponId)
      .single();
      
    if (!coupon || !coupon.is_active || coupon.used_count >= coupon.max_uses) {
      return { success: false, error: "Coupon is no longer valid" };
    }
    
    if (coupon.allowed_plan && coupon.allowed_plan !== "any" && coupon.allowed_plan !== tier) {
      return { success: false, error: `This coupon is only valid for the ${coupon.allowed_plan.replace('_', ' ')} plan` };
    }

    if (coupon.allowed_level && coupon.allowed_level !== "any" && coupon.allowed_level !== level) {
      return { success: false, error: `This coupon is only valid for ${coupon.allowed_level} level` };
    }
    
    const discount = (finalPrice * coupon.discount_percentage) / 100;
    finalPrice = Math.max(0, Math.round(finalPrice - discount));
  }

  // If final price is 0 (100% discount), we can just bypass Razorpay
  if (finalPrice === 0) {
    return { success: true, bypassRazorpay: true, finalPrice };
  }

  try {
    const options = {
      amount: finalPrice * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${user.id}_${Date.now()}`.substring(0, 40),
      notes: {
        userId: user.id,
        tier,
        level,
        couponId: couponId || "",
      },
    };
    
    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    return { success: false, error: "Failed to create payment order" };
  }
}

export async function verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  tier: "monthly" | "six_months" | "lifetime", 
  level: "core" | "pro", 
  couponId?: string,
  isBypass: boolean = false
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // If it's not a bypass (100% off), verify signature
  if (!isBypass) {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return { success: false, error: "Invalid payment signature" };
    }
  }

  const adminClient = createAdminClient();

  // If a coupon was used, increment
  if (couponId) {
    const { data: coupon } = await adminClient
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .single();
      
    if (coupon) {
      await adminClient
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("id", couponId);
        
      revalidatePath("/admin/coupons");
    }
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ 
      is_premium: true,
      premium_tier: tier,
      premium_level: level,
      premium_expires_at: calculateExpiryDate(tier),
      razorpay_payment_id: razorpayPaymentId || `pay_direct_${Date.now()}`
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating premium status with adminClient:", error);
    return { success: false, error: error.message };
  }

  // Record subscription entry
  try {
    await adminClient.from("subscriptions").insert({
      user_id: user.id,
      plan: `${tier}_${level}`,
      status: "active",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      expires_at: calculateExpiryDate(tier),
    });
  } catch (subErr) {
    console.warn("Subscription record insert warning:", subErr);
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/payment");
  revalidatePath("/profile");
  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true };
}

export async function createMessageTopUpOrder() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const options = {
      amount: 10 * 100, // ₹10 in paise
      currency: "INR",
      receipt: `msg_${user.id}_${Date.now()}`.substring(0, 40),
      notes: {
        userId: user.id,
        type: "ai_messages_topup",
      },
    };
    
    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error: any) {
    console.error("Razorpay topup order error:", error);
    return { success: false, error: "Failed to create payment order" };
  }
}

export async function verifyMessageTopUpPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(razorpayOrderId + "|" + razorpayPaymentId)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    return { success: false, error: "Invalid payment signature" };
  }

  const adminClient = createAdminClient();

  // Insert a subscription record for the purchased messages
  const { error } = await adminClient
    .from("subscriptions")
    .insert({
      user_id: user.id,
      plan: "ai_messages_10",
      status: "active",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error inserting message purchase:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/coach");
  revalidatePath("/", "layout");

  return { success: true };
}
