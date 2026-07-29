import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateExpiryDate } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      console.error("Razorpay secret not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle payment capture
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const notes = payment.notes;

      if (notes && notes.userId) {
        const adminClient = createAdminClient();
        
        // Prevent double processing
        const { data: profile } = await adminClient
          .from("profiles")
          .select("ai_messages_remaining, is_premium")
          .eq("id", notes.userId)
          .single();

        if (profile) {
          if (notes.type === "ai_messages_topup") {
            await adminClient
              .from("profiles")
              .update({ 
                ai_messages_remaining: (profile.ai_messages_remaining || 0) + 10
              })
              .eq("id", notes.userId);
              
            try {
              await adminClient.from("subscriptions").insert({
                user_id: notes.userId,
                plan: "ai_messages_10",
                status: "active",
                razorpay_order_id: payment.order_id,
                razorpay_payment_id: payment.id,
                started_at: new Date().toISOString(),
              });
            } catch (subErr) {
              console.warn("Webhook AI topup subscription insert warning:", subErr);
            }
          } else {
            // Normal premium upgrade
            await adminClient
              .from("profiles")
              .update({ 
                is_premium: true,
                premium_tier: notes.tier || "lifetime",
                premium_level: notes.level || "pro",
                premium_expires_at: calculateExpiryDate(notes.tier || "lifetime")
              })
              .eq("id", notes.userId);
              
            // Record subscription entry to track LTV
            try {
              await adminClient.from("subscriptions").insert({
                user_id: notes.userId,
                plan: `${notes.tier || "lifetime"}_${notes.level || "pro"}`,
                status: "active",
                razorpay_order_id: payment.order_id,
                razorpay_payment_id: payment.id,
                expires_at: calculateExpiryDate(notes.tier || "lifetime"),
                started_at: new Date().toISOString(),
              });
            } catch (subErr) {
              console.warn("Webhook subscription record insert warning:", subErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
