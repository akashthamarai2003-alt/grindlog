import { getCachedUser } from "@/lib/services/supabase/server";
import { getFitnessSubscription, getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { getLockedFitnessRate } from "@/lib/fitness/subscription/locked-rate";
import { Suspense } from "react";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { getUserPremiumDetailsAction } from "@/app/actions/payment";
import { redirect } from "next/navigation";
import FitnessPaymentClient from "./payment-client";

export const dynamic = "force-dynamic";

import PaymentLoading from "./loading";

export default async function FitnessPaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const intent = typeof resolvedParams.intent === "string" ? resolvedParams.intent : undefined;

  // Step 1: Concurrently fetch user authentication, plan pricing, and premium details
  const [userResult, pricingConfig, premiumDetails] = await Promise.all([
    getCachedUser().catch(() => ({ data: { user: null } })),
    getPlanPricesAction("fitness").catch(() => null),
    getUserPremiumDetailsAction("fitness_os").catch(() => null),
  ]);

  const user = userResult?.data?.user ?? null;

  // Step 2: Concurrently fetch subscription and locked renewal rate
  const [subscription, subscriptionState, initialLockedRate] = user
    ? await Promise.all([
        getFitnessSubscription(user.id).catch(() => null),
        getFitnessSubscriptionState(user.id).catch(() => null),
        getLockedFitnessRate(user.id, "pro").catch(() => null),
      ])
    : [null, null, null];

  const isExpired = Boolean(subscriptionState?.isExpired);
  const isActivePro = Boolean(
    subscriptionState?.status === "active" &&
    !isExpired &&
    (subscriptionState?.plan?.id === "pro" || premiumDetails?.premium_level === "pro" || subscription?.plan === "pro")
  );

  const daysRemaining = subscriptionState?.daysRemaining ?? 30;
  const returnToParam = typeof resolvedParams.returnTo === "string" ? resolvedParams.returnTo : "";
  const isRenewalIntent = intent === "renew" || intent === "renew_monthly" || returnToParam.includes("renew=true") || resolvedParams.renew === "true";
  const isEarlyRenewalWindow = daysRemaining <= 7 || Boolean(subscriptionState?.isGracePeriod) || isRenewalIntent;

  // If user is already active Pro with plenty of time left (>7 days) and NO renewal/setup intent, return to dashboard
  if (user && isActivePro && !isEarlyRenewalWindow && !intent) {
    redirect("/");
  }
  const renewalLevel: "core" | "pro" = isExpired
    ? (subscriptionState?.previousPlan?.id === "core" ? "core" : "pro")
    : (subscriptionState?.plan?.id === "pro" || subscriptionState?.plan?.id === "core"
        ? (subscriptionState.plan.id as "core" | "pro")
        : (subscription?.plan === "pro" ? "pro" : subscription?.plan === "core" ? "core" : (premiumDetails?.premium_level === "core" ? "core" : "pro")));

  const renewalExpiresAt =
    subscription?.current_period_end || subscriptionState?.expiresAt || premiumDetails?.premium_expires_at || null;

  let lockedRatePaise: number | null = initialLockedRate ?? null;
  let rateCheckFailed = false;
  if (user && renewalLevel === "core" && initialLockedRate === null) {
    try {
      lockedRatePaise = await getLockedFitnessRate(user.id, "core");
    } catch {
      rateCheckFailed = true;
    }
  }

  return (
    <Suspense fallback={<PaymentLoading />}>
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
