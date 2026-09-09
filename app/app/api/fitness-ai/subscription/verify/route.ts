import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateExpiryDate } from "@/lib/utils";
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
    const adminClient = createAdminClient();

    // Query existing subscription for stacking
    const { data: existingSub } = await adminClient
      .from("fitness_os_subscriptions")
      .select("current_period_end, plan")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: existingProfile } = await adminClient
      .from("fitness_os_profiles")
      .select("fitness_premium_expires_at, fitness_premium_level")
      .eq("user_id", userId)
      .maybeSingle();

    const baseExpiry = existingSub?.current_period_end || existingProfile?.fitness_premium_expires_at;
    const finalExpiresAt = calculateExpiryDate("monthly", baseExpiry);
    const planLevel = existingSub?.plan === "starter" ? "starter" : "pro";

    // Handle mock for development without keys
    if (isMock && (!process.env.RAZORPAY_KEY_ID || !keySecret)) {
      console.warn("Mocking successful payment verification.");
      
      await adminClient
        .from("fitness_os_profiles")
        .update({
          fitness_is_premium: true,
          fitness_premium_tier: "monthly",
          fitness_premium_level: planLevel === "starter" ? "core" : "pro",
          fitness_premium_expires_at: finalExpiresAt,
        })
        .eq("user_id", userId);

      const { error: updateError } = await adminClient
        .from("fitness_os_subscriptions")
        .upsert({
          user_id: userId,
          plan: planLevel,
          status: "active",
          provider_payment_id: "mock_payment_id",
          current_period_start: new Date().toISOString(),
          current_period_end: finalExpiresAt,
        }, { onConflict: "user_id" });

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

    // Update profile
    await adminClient
      .from("fitness_os_profiles")
      .update({
        fitness_is_premium: true,
        fitness_premium_tier: "monthly",
        fitness_premium_level: planLevel === "starter" ? "core" : "pro",
        fitness_premium_expires_at: finalExpiresAt,
      })
      .eq("user_id", userId);

    // Update subscription using adminClient to bypass RLS restrictions
    const { error: updateError } = await adminClient
      .from("fitness_os_subscriptions")
      .upsert({
        user_id: userId,
        plan: planLevel,
        status: "active",
        provider_order_id: razorpay_order_id,
        provider_payment_id: razorpay_payment_id,
        current_period_start: new Date().toISOString(),
        current_period_end: finalExpiresAt,
      }, { onConflict: "user_id" });

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
