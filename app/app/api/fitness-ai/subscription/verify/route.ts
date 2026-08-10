import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Handle mock for development without keys
    if (isMock && (!process.env.RAZORPAY_KEY_ID || !keySecret)) {
      console.warn("Mocking successful payment verification.");
      
      const { error: updateError } = await supabase
        .from("fitness_os_subscriptions")
        .update({
          status: "active",
          provider_payment_id: "mock_payment_id",
          current_period_start: new Date().toISOString(),
          // Default mock period: 1 month
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("user_id", userId)
        .eq("status", "created");

      if (updateError) throw new Error("Failed to update subscription status");

      return NextResponse.json({ success: true });
    }

    // Real Razorpay verification
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 });
    }

    if (!keySecret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed: Invalid signature" }, { status: 400 });
    }

    // Update subscription
    const { error: updateError } = await supabase
      .from("fitness_os_subscriptions")
      .update({
        status: "active",
        provider_payment_id: razorpay_payment_id,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Razorpay subscriptions webhook should ideally update this exactly, but setting default 30 days for simple order checkout.
      })
      .eq("user_id", userId)
      .eq("provider_order_id", razorpay_order_id);

    if (updateError) {
      console.error("Failed to activate subscription in DB:", updateError);
      return NextResponse.json({ error: "Failed to activate subscription." }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Verify API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
