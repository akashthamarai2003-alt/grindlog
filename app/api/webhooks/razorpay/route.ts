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
        
        // This acts as a fallback. If the user already got upgraded via the 
        // client-side callback, this will just be a redundant update (which is fine).
        await adminClient
          .from("profiles")
          .update({ 
            is_premium: true,
            premium_tier: notes.tier || "lifetime",
            premium_level: notes.level || "pro",
            premium_expires_at: calculateExpiryDate(notes.tier || "lifetime"),
            razorpay_payment_id: payment.id
          })
          .eq("id", notes.userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
