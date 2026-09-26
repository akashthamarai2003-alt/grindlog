import "server-only";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { invalidateFitnessSubscriptionCache } from "./access";

// Both webhooks and the browser callback use captured provider data, never client prices.
export async function settleFitnessPayment(paymentId: string, expected?: { userId: string; orderId: string; tier: string; level: string }) {
  const provider = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", key_secret: process.env.RAZORPAY_KEY_SECRET || "" });
  const payment = await provider.payments.fetch(paymentId);
  if (payment.status !== "captured" || !payment.order_id) throw new Error("Payment is not captured yet. Please wait for confirmation.");
  const order = await provider.orders.fetch(payment.order_id);
  const notes = order.notes || {};
  const userId = String(notes.userId || "");
  const tier = String(notes.tier || "");
  const level = String(notes.level || "");
  if (notes.source !== "fitness_ai_os" || !userId || !["monthly", "six_months", "lifetime"].includes(tier) || !["core", "pro"].includes(level) || payment.currency !== "INR" || order.currency !== "INR" || Number(payment.amount) !== Number(order.amount) || Number(payment.amount) <= 0) throw new Error("Payment does not match the purchase order.");
  if (expected && (expected.userId !== userId || expected.orderId !== order.id || expected.tier !== tier || expected.level !== level)) throw new Error("Payment does not belong to this account or plan.");
  const { error } = await createAdminClient().rpc("settle_fitness_payment", { p_user: userId, p_order: order.id, p_payment: payment.id, p_tier: tier, p_level: level, p_amount: Number(payment.amount), p_currency: payment.currency });
  if (error) throw new Error("Payment received, but membership activation is pending. Please contact support with your payment ID.");
  invalidateFitnessSubscriptionCache(userId);
  return { success: true as const };
}
