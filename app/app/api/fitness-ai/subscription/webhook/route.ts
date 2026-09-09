import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateExpiryDate } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn("Razorpay webhook secret not configured. Ignoring webhook.");
      return NextResponse.json({ success: true });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const adminClient = createAdminClient();

    // Idempotent processing of webhook events
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      
      // Ignore GrindLog legacy orders
      if (payment.notes?.source !== "fitness_ai_os") {
        return NextResponse.json({ success: true, message: "Ignored by Fitness OS, handled by GrindLog" });
      }

      const orderId = payment.order_id;
      const userId = payment.notes?.userId;
      
      if (orderId && userId) {
        // Fetch existing subscription to stack expiry
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
        const tier = payment.notes?.tier || "monthly";
        const level = payment.notes?.level || "pro";
        const finalExpiresAt = calculateExpiryDate(tier, baseExpiry);

        // Update the profile to grant premium access
        await adminClient
          .from("fitness_os_profiles")
          .update({
            fitness_is_premium: true,
            fitness_premium_tier: tier,
            fitness_premium_level: level,
            fitness_premium_expires_at: finalExpiresAt
          })
          .eq("user_id", userId);

        // Update the subscription record to active
        await adminClient
          .from("fitness_os_subscriptions")
          .update({
            status: "active",
            provider_payment_id: payment.id,
            current_period_start: new Date().toISOString(),
            current_period_end: finalExpiresAt
          })
          .eq("provider_order_id", orderId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server error processing webhook" }, { status: 500 });
  }
}
