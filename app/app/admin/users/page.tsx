import { createAdminClient } from "@/lib/services/supabase/admin";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import UsersTableClient from "./users-table-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  // Fetch profiles, fitness profiles, payment receipts, fitness subscriptions, and dynamic pricing in parallel
  const [
    { data: users, error: usersError },
    { data: fitnessProfiles },
    { data: receipts },
    { data: fitSubscriptions },
    fitnessPricingConfig,
  ] = await Promise.all([
    supabase
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
          razorpay_payment_id,
          amount_paise,
          currency
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("fitness_os_profiles")
      .select("user_id, onboarding_completed, fitness_is_premium, fitness_premium_tier, fitness_premium_level, fitness_premium_expires_at"),
    supabase
      .from("fitness_payment_receipts")
      .select("*")
      .order("processed_at", { ascending: false }),
    supabase
      .from("fitness_os_subscriptions")
      .select("*"),
    getPlanPricesAction("fitness"),
  ]);

  if (usersError) {
    console.error("Error fetching profiles:", usersError);
  }

  const fitnessUsersMap = new Map((fitnessProfiles || []).map(fp => [fp.user_id, fp]));
  const fitSubscriptionsMap = new Map((fitSubscriptions || []).map(fs => [fs.user_id, fs]));

  // Group receipts by user_id
  const receiptsByUser = new Map<string, any[]>();
  (receipts || []).forEach(r => {
    const list = receiptsByUser.get(r.user_id) || [];
    list.push(r);
    receiptsByUser.set(r.user_id, list);
  });

  // Helper to get dynamic price configured by admin for legacy users without receipts
  const getPaidAmount = (tier?: string, level?: string, isPremium?: boolean) => {
    if (!isPremium || !tier || !level) return 0;
    const t = tier as "monthly" | "six_months" | "lifetime";
    const l = level as "core" | "pro";
    const configuredPrice = fitnessPricingConfig?.[t]?.[l]?.price;
    if (typeof configuredPrice === "number" && configuredPrice > 0) {
      return configuredPrice;
    }
    return 0;
  };

  const usersWithAmounts = (users || []).map((user) => {
    const paymentIds = new Set<string>();
    let actualPaidAmount = 0;
    const paymentHistory: any[] = [];
    const seenPaymentIds = new Set<string>();

    if (user.razorpay_payment_id) {
      paymentIds.add(user.razorpay_payment_id);
    }

    if (user.subscriptions) {
      user.subscriptions.forEach((sub: any) => {
        if (sub.razorpay_payment_id) paymentIds.add(sub.razorpay_payment_id);
        if (sub.razorpay_subscription_id) paymentIds.add(sub.razorpay_subscription_id);
      });
    }

    const fitSub = fitSubscriptionsMap.get(user.id);
    if (fitSub?.provider_payment_id) {
      paymentIds.add(fitSub.provider_payment_id);
    }

    // 1. Process database payment receipts for this user
    const userReceipts = receiptsByUser.get(user.id) || [];
    userReceipts.forEach((r) => {
      paymentIds.add(r.payment_id);
      seenPaymentIds.add(r.payment_id);
      const amount = Number(r.amount_paise) / 100;
      actualPaidAmount += amount;
      paymentHistory.push({
        id: r.payment_id,
        amount,
        currency: r.currency || "INR",
        status: "captured",
        created_at: r.processed_at ? new Date(r.processed_at).getTime() / 1000 : Date.now() / 1000,
        method: "razorpay",
        description: "Fitness Subscription",
      });
    });

    // 2. Process subscriptions with amount_paise if not already captured
    if (user.subscriptions) {
      user.subscriptions.forEach((sub: any) => {
        const pid = sub.razorpay_payment_id || sub.id;
        if (sub.amount_paise && !seenPaymentIds.has(pid)) {
          seenPaymentIds.add(pid);
          const amount = Number(sub.amount_paise) / 100;
          actualPaidAmount += amount;
          paymentHistory.push({
            id: pid,
            amount,
            currency: sub.currency || "INR",
            status: sub.status === "active" ? "captured" : sub.status,
            created_at: sub.started_at ? new Date(sub.started_at).getTime() / 1000 : Date.now() / 1000,
            method: "razorpay",
            description: sub.plan || "Premium Plan",
          });
        }
      });
    }

    // 2b. Process fitness_os_subscriptions if not already captured
    if (fitSub?.provider_payment_id && !seenPaymentIds.has(fitSub.provider_payment_id)) {
      seenPaymentIds.add(fitSub.provider_payment_id);
      const amount = typeof fitSub.locked_rate_paise === "number" && fitSub.locked_rate_paise > 0
        ? Number(fitSub.locked_rate_paise) / 100
        : getPaidAmount("monthly", fitSub.plan || fitSub.locked_level || "pro", true);
      if (amount > 0) {
        actualPaidAmount += amount;
        paymentHistory.push({
          id: fitSub.provider_payment_id,
          amount,
          currency: "INR",
          status: fitSub.status === "active" ? "captured" : fitSub.status,
          created_at: fitSub.created_at ? new Date(fitSub.created_at).getTime() / 1000 : Date.now() / 1000,
          method: "razorpay",
          description: `Fitness ${fitSub.plan || "Pro"} Plan`,
        });
      }
    }

    // 3. Fallback for legacy users with premium status but no receipts
    const fp = fitnessUsersMap.get(user.id);
    const isUserPremium = user.is_premium || fp?.fitness_is_premium;
    if (isUserPremium && actualPaidAmount === 0) {
      const tier = user.premium_tier || fp?.fitness_premium_tier;
      const level = user.premium_level || fp?.fitness_premium_level;
      const estimated = getPaidAmount(tier, level, true);
      if (estimated > 0) {
        actualPaidAmount += estimated;
        paymentHistory.push({
          id: "legacy_record",
          amount: estimated,
          currency: "INR",
          status: "captured",
          created_at: new Date(user.created_at).getTime() / 1000,
          method: "legacy",
          description: "Legacy Plan (No Receipt)",
        });
      }
    }

    paymentHistory.sort((a, b) => b.created_at - a.created_at);

    const validPaymentIds = Array.from(paymentIds).filter(id => id && id.startsWith("pay_"));

    return {
      ...user,
      has_fitness_profile: fitnessUsersMap.has(user.id),
      fitness_onboarding_completed: fp?.onboarding_completed || false,
      fitness_is_premium: fp?.fitness_is_premium || false,
      fitness_premium_tier: fp?.fitness_premium_tier || null,
      fitness_premium_level: fp?.fitness_premium_level || null,
      fitness_premium_expires_at: fp?.fitness_premium_expires_at || null,
      actualPaidAmount,
      paymentHistory,
      paymentId: validPaymentIds.length > 0 ? validPaymentIds.join(", ") : "-"
    };
  });

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
