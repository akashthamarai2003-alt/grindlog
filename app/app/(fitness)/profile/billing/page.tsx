import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { BillingManagementClient } from "@/components/fitness/profile/billing-management-client";
import { DEFAULT_PRICING } from "@/lib/constants/pricing";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FitnessBillingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile/billing");
  }

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
      .select("id, plan, status, razorpay_payment_id, started_at, expires_at")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
    getPlanPricesAction("fitness").catch(() => null),
  ]);

  const proPrice = pricingConfig?.monthly?.pro?.price ?? DEFAULT_PRICING.monthly.pro.price ?? 99;
  const corePrice = pricingConfig?.monthly?.core?.price ?? DEFAULT_PRICING.monthly.core.price ?? 10;

  const paymentHistory = (subscriptionsData || []).map((sub: any) => ({
    id: sub.id,
    plan: sub.plan,
    amount: sub.plan?.includes("pro") ? proPrice : corePrice,
    status: sub.status === "active" ? "Paid ✓" : sub.status,
    paymentId: sub.razorpay_payment_id || "",
    date: sub.started_at || new Date().toISOString(),
    expiresAt: sub.expires_at || null,
  }));

  return (
    <BillingManagementClient
      subscriptionState={subscriptionState}
      paymentHistory={paymentHistory}
      proPrice={proPrice}
      corePrice={corePrice}
      userEmail={user.email}
      userName={fitnessProfile?.name || user.user_metadata?.full_name || "Athlete"}
    />
  );
}
