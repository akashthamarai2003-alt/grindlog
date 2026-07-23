import { createAdminClient } from "@/lib/services/supabase/admin";
import Razorpay from "razorpay";
import UsersTableClient from "./users-table-client";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();
  const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  // Fetch all users with their active subscriptions if any
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      subscriptions (
        id,
        plan,
        status,
        started_at,
        expires_at,
        razorpay_subscription_id,
        razorpay_payment_id
      )
    `)
    .order("created_at", { ascending: false });

  // Helper to estimate paid amount since it wasn't historically tracked in DB
  const getPaidAmount = (tier?: string, level?: string, isPremium?: boolean) => {
    if (!isPremium || !tier || !level) return 0;
    if (tier === 'monthly' && level === 'core') return 49;
    if (tier === 'monthly' && level === 'pro') return 69;
    if (tier === 'six_months' && level === 'core') return 199;
    if (tier === 'six_months' && level === 'pro') return 249;
    if (tier === 'lifetime' && level === 'core') return 599;
    if (tier === 'lifetime' && level === 'pro') return 799;
    return 0;
  };

  const { getPlanPricesAction } = await import("@/app/actions/admin-pricing");
  const livePricing = await getPlanPricesAction();

  const usersWithAmounts = await Promise.all(
    (users || []).map(async (user) => {
      const paymentIds = new Set<string>();
      let hasPremiumPaymentId = false;

      if (user.razorpay_payment_id) {
        paymentIds.add(user.razorpay_payment_id);
        hasPremiumPaymentId = true;
      }

      if (user.subscriptions) {
        user.subscriptions.forEach((sub: any) => {
          if (sub.razorpay_payment_id) paymentIds.add(sub.razorpay_payment_id);
          if (sub.razorpay_subscription_id) paymentIds.add(sub.razorpay_subscription_id);
          if (sub.plan && sub.plan !== "ai_messages_10") {
            hasPremiumPaymentId = true;
          }
        });
      }
      
      const validPaymentIds = Array.from(paymentIds).filter(id => id && id.startsWith("pay_"));
      let actualPaidAmount = 0;
      
      // Fetch amounts for all valid Razorpay payments (AI topups + any recorded subs)
      if (validPaymentIds.length > 0) {
        for (const pid of validPaymentIds) {
          try {
            const payment = await razorpay.payments.fetch(pid);
            actualPaidAmount += Number(payment.amount) / 100;
          } catch (e) {
            console.error("Failed to fetch Razorpay payment", pid);
          }
        }
      } 
      
      // If user is premium but their primary premium payment ID wasn't found in Razorpay records
      if (user.is_premium && !hasPremiumPaymentId) {
        const tier = user.premium_tier as "monthly" | "six_months" | "lifetime";
        const level = user.premium_level as "core" | "pro";
        
        let estimatedPremiumCost = 0;
        if (tier && level && livePricing[tier] && livePricing[tier][level]) {
          estimatedPremiumCost = livePricing[tier][level].price;
        } else {
          estimatedPremiumCost = getPaidAmount(tier, level, true);
        }
        actualPaidAmount += estimatedPremiumCost;
      }
      
      return {
        ...user,
        actualPaidAmount,
        paymentId: validPaymentIds.length > 0 ? validPaymentIds.join(", ") : "-"
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">View all registered users and their payment statuses.</p>
      </div>

      <UsersTableClient users={usersWithAmounts} />
    </div>
  );
}
