import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateExpiryDate } from "@/lib/utils";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function GET(req: NextRequest) {
  // If a user accidentally navigates to this URL directly, redirect them to safety
  return NextResponse.redirect(new URL("/", req.url), 303);
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const razorpayOrderId = params.get("razorpay_order_id");
    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpaySignature = params.get("razorpay_signature");

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.redirect(new URL("/pro?error=Missing+payment+details", req.url), 303);
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.redirect(new URL("/pro?error=Invalid+payment+signature", req.url), 303);
    }

    // Fetch the order from Razorpay to get the secure notes
    const order = await razorpay.orders.fetch(razorpayOrderId);
    if (!order || !order.notes) {
      return NextResponse.redirect(new URL("/pro?error=Invalid+order+metadata", req.url), 303);
    }

    const adminClient = createAdminClient();
    const userId = order.notes.userId as string;
    const type = order.notes.type as string; // Optional, used for topups

    if (!userId) {
      return NextResponse.redirect(new URL("/pro?error=Missing+user+in+order", req.url), 303);
    }

    if (type === "ai_messages_topup") {
      // It's a top-up
      await adminClient.from("subscriptions").insert({
        user_id: userId,
        plan: "ai_messages_10",
        status: "active",
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
      return NextResponse.redirect(new URL("/coach?success=10+AI+Messages+Added", req.url), 303);
    } else {
      // It's a Premium Subscription
      const tier = (order.notes.tier as "monthly" | "six_months" | "lifetime") || "six_months";
      const level = (order.notes.level as "core" | "pro") || "pro";
      const couponId = order.notes.couponId as string;
      const source = order.notes.source as string;

      // Increment coupon if used
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
        }
      }

      if (source === "fitness_ai_os") {
        // Fitness OS payment — update fitness-specific tables with fair stacking
        const { data: existingSub } = await adminClient
          .from("fitness_os_subscriptions")
          .select("current_period_end")
          .eq("user_id", userId)
          .maybeSingle();

        const { data: existingProfile } = await adminClient
          .from("fitness_os_profiles")
          .select("fitness_premium_expires_at")
          .eq("user_id", userId)
          .maybeSingle();

        const baseExpiry = existingSub?.current_period_end || existingProfile?.fitness_premium_expires_at;
        const finalExpiresAt = calculateExpiryDate(tier, baseExpiry);

        await adminClient
          .from("fitness_os_profiles")
          .update({
            fitness_is_premium: true,
            fitness_premium_tier: tier,
            fitness_premium_level: level,
            fitness_premium_expires_at: finalExpiresAt,
          })
          .eq("user_id", userId);

        try {
          await adminClient
            .from("fitness_os_subscriptions")
            .upsert(
              {
                user_id: userId,
                plan: level === "pro" ? "pro" : "starter",
                status: "active",
                provider: "razorpay",
                provider_order_id: razorpayOrderId,
                provider_payment_id: razorpayPaymentId,
                current_period_start: new Date().toISOString(),
                current_period_end: finalExpiresAt,
              },
              { onConflict: "user_id" },
            );
        } catch (subErr) {
          console.warn("Callback fitness_os_subscriptions upsert warning:", subErr);
        }

        // Record in subscriptions table for audit
        try {
          await adminClient.from("subscriptions").insert({
            user_id: userId,
            plan: `fitness_${tier}_${level}`,
            status: "active",
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            expires_at: finalExpiresAt,
            started_at: new Date().toISOString(),
          });
        } catch (subErr) {
          console.warn("Callback fitness subscription insert warning:", subErr);
        }

        return NextResponse.redirect(new URL("/payment?success=Premium+Activated", req.url), 303);
      } else {
        // GrindLog legacy payment — update profiles table with stacking
        const { data: existingMainProfile } = await adminClient
          .from("profiles")
          .select("premium_expires_at")
          .eq("id", userId)
          .maybeSingle();

        const finalExpiresAt = calculateExpiryDate(tier, existingMainProfile?.premium_expires_at);

        await adminClient
          .from("profiles")
          .update({
            is_premium: true,
            premium_tier: tier,
            premium_level: level,
            premium_expires_at: finalExpiresAt,
          })
          .eq("id", userId);

        // Record Subscription
        try {
          await adminClient.from("subscriptions").insert({
            user_id: userId,
            plan: `${tier}_${level}`,
            status: "active",
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            expires_at: finalExpiresAt,
            started_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn("Callback subscription insert warning:", err);
        }

        return NextResponse.redirect(new URL("/?success=Premium+Activated", req.url), 303);
      }
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/pro?error=Payment+Verification+Failed", req.url), 303);
  }
}
