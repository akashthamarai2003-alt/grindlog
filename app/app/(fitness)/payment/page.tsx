import { getCachedUser } from "@/lib/services/supabase/server";
import { getFitnessSubscription, getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { getLockedFitnessRate } from "@/lib/fitness/subscription/locked-rate";
import { Suspense } from "react";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { getUserPremiumDetailsAction } from "@/app/actions/payment";
import { redirect } from "next/navigation";
import FitnessPaymentClient from "./payment-client";

export const dynamic = "force-dynamic";

function PaymentLoadingFallback() {
  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#ADFF00] border-t-transparent animate-spin" />
    </div>
  );
}

export default async function FitnessPaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const intent = typeof resolvedParams.intent === "string" ? resolvedParams.intent : undefined;

  const [pricingConfig, premiumDetails] = await Promise.all([
    getPlanPricesAction("fitness").catch(() => null),
    getUserPremiumDetailsAction("fitness_os").catch(() => null),
  ]);

  const { data: { user } } = await getCachedUser();
  const [subscription, subscriptionState] = user
    ? await Promise.all([
        getFitnessSubscription(user.id).catch(() => null),
        getFitnessSubscriptionState(user.id).catch(() => null),
      ])
    : [null, null];

  const isExpired = Boolean(subscriptionState?.isExpired);
  const isActivePro = Boolean(
    subscriptionState?.status === "active" &&
    !isExpired &&
    (subscriptionState?.plan?.id === "pro" || premiumDetails?.premium_level === "pro" || subscription?.plan === "pro")
  );

  // If user is already active Pro, visiting renewal intent is obsolete — return to dashboard
  if (user && isActivePro && intent === "renew_monthly") {
    redirect("/");
  }
  const renewalLevel: "core" | "pro" = isExpired
    ? (subscriptionState?.previousPlan?.id === "core" ? "core" : "pro")
    : (subscriptionState?.plan?.id === "pro" || subscriptionState?.plan?.id === "core"
        ? (subscriptionState.plan.id as "core" | "pro")
        : (subscription?.plan === "pro" ? "pro" : subscription?.plan === "core" ? "core" : (premiumDetails?.premium_level === "core" ? "core" : "pro")));

  const renewalExpiresAt =
    subscription?.current_period_end || subscriptionState?.expiresAt || premiumDetails?.premium_expires_at || null;

  let lockedRatePaise: number | null = null;
  let rateCheckFailed = false;
  if (user && (renewalLevel === "core" || renewalLevel === "pro")) {
    try {
      lockedRatePaise = await getLockedFitnessRate(user.id, renewalLevel);
    } catch {
      rateCheckFailed = true;
    }
  }

  return (
    <Suspense fallback={<PaymentLoadingFallback />}>
      <FitnessPaymentClient
        initialPricing={pricingConfig || undefined}
        renewalPlan={renewalLevel}
        lockedRatePaise={lockedRatePaise}
        rateCheckFailed={rateCheckFailed}
        renewalExpiresAt={renewalExpiresAt}
        initialPremiumDetails={premiumDetails || undefined}
        isExpiredSubscriber={isExpired}
      />
    </Suspense>
  );
}
