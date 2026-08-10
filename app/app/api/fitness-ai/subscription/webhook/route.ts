import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
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
    // Assuming razorpay_order_id or subscription_id is sent in payload
    // A full implementation would check event.event === "payment.captured", "subscription.charged", etc.

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      
      // Ignore GrindLog legacy orders
      if (payment.notes?.source !== "fitness_ai_os") {
        return NextResponse.json({ success: true, message: "Ignored by Fitness OS, handled by GrindLog" });
      }

      const orderId = payment.order_id;
      
      if (orderId) {
        await adminClient
          .from("fitness_os_subscriptions")
          .update({
            status: "active",
            provider_payment_id: payment.id,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq("provider_order_id", orderId)
          .eq("status", "created");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server error processing webhook" }, { status: 500 });
  }
}
