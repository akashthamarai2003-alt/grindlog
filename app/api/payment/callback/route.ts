import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateExpiryDate } from "@/lib/utils";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const razorpayOrderId = params.get("razorpay_order_id");
    const razorpayPaymentId = params.get("razorpay_payment_id");
    const razorpaySignature = params.get("razorpay_signature");

    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.redirect(new URL("/dashboard?error=Missing+payment+details", req.url));
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.redirect(new URL("/dashboard?error=Invalid+payment+signature", req.url));
    }

    // Fetch the order from Razorpay to get the secure notes
    const order = await razorpay.orders.fetch(razorpayOrderId);
    if (!order || !order.notes) {
      return NextResponse.redirect(new URL("/dashboard?error=Invalid+order+metadata", req.url));
    }

    const adminClient = createAdminClient();
    const userId = order.notes.userId as string;
    const type = order.notes.type as string; // Optional, used for topups

    if (!userId) {
      return NextResponse.redirect(new URL("/dashboard?error=Missing+user+in+order", req.url));
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
      return NextResponse.redirect(new URL("/coach?success=10+AI+Messages+Added", req.url));
    } else {
      // It's a Premium Subscription
      const tier = (order.notes.tier as "monthly" | "six_months" | "lifetime") || "six_months";
      const level = (order.notes.level as "core" | "pro") || "pro";
      const couponId = order.notes.couponId as string;

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

      // Update User Profile
      await adminClient
        .from("profiles")
        .update({
          is_premium: true,
          premium_tier: tier,
          premium_level: level,
          premium_expires_at: calculateExpiryDate(tier),
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
          expires_at: calculateExpiryDate(tier),
          started_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Callback subscription insert warning:", err);
      }

      return NextResponse.redirect(new URL("/dashboard?success=Premium+Activated", req.url));
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(new URL("/dashboard?error=Payment+Verification+Failed", req.url));
  }
}
