import "server-only";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/services/supabase/admin";

/** The captured wheel price is the monthly renewal rate for that plan. */
export async function getLockedFitnessRate(userId: string, level: "core" | "pro"): Promise<number | null> {
  const admin = createAdminClient();
  const { data: current } = await admin
    .from("fitness_os_subscriptions")
    .select("locked_rate_paise, locked_level, provider_payment_id")
    .eq("user_id", userId)
    .maybeSingle();

  const saved = Number(current?.locked_rate_paise);
  if (current?.locked_level === level && Number.isSafeInteger(saved) && saved > 0) return saved;

  // Payments made before the rate column existed can still prove their lock
  // from the provider's signed order and captured payment.
  const { data: history } = await admin
    .from("subscriptions")
    .select("razorpay_payment_id")
    .eq("user_id", userId)
    .eq("plan", `fitness_monthly_${level}`)
    .order("started_at", { ascending: false })
    .limit(20);
  const paymentIds = [current?.provider_payment_id, ...(history || []).map(row => row.razorpay_payment_id)]
    .filter((id): id is string => typeof id === "string" && id !== "bypass");
  if (!paymentIds.length) return null;

  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });
  for (const paymentId of new Set(paymentIds)) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      if (payment.status !== "captured" || !payment.order_id) continue;
      const order = await razorpay.orders.fetch(payment.order_id);
      if (
        order.notes?.source === "fitness_ai_os" &&
        order.notes?.userId === userId &&
        order.notes?.level === level &&
        order.notes?.isLifetimeLock === "true" &&
        payment.currency === "INR" &&
        order.currency === "INR" &&
        Number(payment.amount) === Number(order.amount) &&
        Number.isSafeInteger(Number(payment.amount)) &&
        Number(payment.amount) > 0
      ) return Number(payment.amount);
    } catch {
      // A stale history row must never create an unverified rate.
    }
  }
  return null;
}
