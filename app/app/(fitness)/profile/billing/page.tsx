import { isFitnessOrderSettled } from "@/app/actions/payment";
import { invalidateFitnessSubscriptionCache } from "@/lib/fitness/subscription/access";
import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { BillingManagementClient } from "@/components/fitness/profile/billing-management-client";
import { DEFAULT_PRICING } from "@/lib/constants/pricing";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { getLockedFitnessRate } from "@/lib/fitness/subscription/locked-rate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FitnessBillingPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile/billing");
  }

  const { order } = await searchParams;
  const paymentConfirmed = order ? await isFitnessOrderSettled(order) : false;
  if (paymentConfirmed) invalidateFitnessSubscriptionCache(user.id);
  const adminClient = createAdminClient();

  const [
    subscriptionState,
    { data: fitnessProfile },
    { data: subscriptionsData },
    pricingConfig,
  ] = await Promise.all([
    getFitnessSubscriptionState(user.id),
    supabase
      .from("fitness_os_profiles")
      .select("name, fitness_premium_level, fitness_premium_tier, fitness_premium_expires_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    adminClient
      .from("subscriptions")
      .select("id, plan, status, razorpay_payment_id, started_at, expires_at, amount_paise, currency")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
    getPlanPricesAction("fitness").catch(() => null),
  ]);

  const proPrice = pricingConfig?.monthly?.pro?.originalPrice ?? DEFAULT_PRICING.monthly.pro.originalPrice ?? 5;
  const corePrice = pricingConfig?.monthly?.core?.originalPrice ?? DEFAULT_PRICING.monthly.core.originalPrice ?? 10;
  const proUpgradePrice = pricingConfig?.monthly?.pro?.price ?? DEFAULT_PRICING.monthly.pro.price ?? 2;
  const membershipLevel = fitnessProfile?.fitness_premium_level === "pro" || subscriptionState.plan.id === "pro"
    ? "pro"
    : fitnessProfile?.fitness_premium_level === "core" || subscriptionState.plan.id === "starter"
    ? "core"
    : undefined;
  const lockedRatePaise = membershipLevel ? await getLockedFitnessRate(user.id, membershipLevel) : null;

  const paymentHistory = (subscriptionsData || []).map((sub: any) => ({
    id: sub.id,
    plan: sub.plan,
    amount: sub.amount_paise == null ? null : Number(sub.amount_paise) / 100,
    status: sub.status === "active" ? "Paid ✓" : sub.status,
    paymentId: sub.razorpay_payment_id || "",
    date: sub.started_at || new Date().toISOString(),
    expiresAt: sub.expires_at || null,
  }));

  return (
    <BillingManagementClient
      paymentConfirmed={paymentConfirmed}
      subscriptionState={subscriptionState}
      paymentHistory={paymentHistory}
      proPrice={proPrice}
      proUpgradePrice={proUpgradePrice}
      corePrice={corePrice}
      lockedRatePaise={lockedRatePaise}
      membershipLevel={membershipLevel}
      userEmail={user.email}
      userName={fitnessProfile?.name || user.user_metadata?.full_name || "Athlete"}
    />
  );
}
