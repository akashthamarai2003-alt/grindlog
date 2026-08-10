import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FITNESS_PLANS } from "@/lib/fitness/subscription/plans";
import { FitnessPlanId } from "@/lib/fitness/subscription/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    const body = await req.json();
    const planId = body.planId as FitnessPlanId;

    if (planId !== "starter" && planId !== "pro") {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const planConfig = FITNESS_PLANS[planId];
    if (!planConfig) {
      return NextResponse.json({ error: "Plan configuration not found." }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn("Razorpay credentials not configured. Returning safe mock data.");
      return NextResponse.json({
        id: `mock_order_${Date.now()}`,
        currency: planConfig.currency,
        amount: planConfig.priceInPaise,
        mock: true
      });
    }

    // Call Razorpay API directly using fetch to create an order
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        amount: planConfig.priceInPaise,
        currency: planConfig.currency,
        receipt: `rec_${Date.now().toString(36)}_${userId.substring(0, 8)}`,
        notes: {
          userId: userId,
          planId: planId,
          source: "fitness_ai_os"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay Order Creation Failed:", data);
      return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }

    // Upsert subscription as 'created' (pending payment)
    const adminSupabase = createAdminClient();
    const { error: dbError } = await adminSupabase
      .from("fitness_os_subscriptions")
      .upsert({
        user_id: userId,
        plan: planId,
        status: "created",
        provider: "razorpay",
        provider_order_id: data.id,
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Failed to save pending subscription:", dbError);
      return NextResponse.json({ error: `DB Error: ${dbError.message || JSON.stringify(dbError)}` }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      currency: data.currency,
      amount: data.amount
    });

  } catch (error: any) {
    console.error("Create Checkout API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
