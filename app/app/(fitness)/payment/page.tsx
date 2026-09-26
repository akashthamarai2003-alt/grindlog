import { getCachedUser } from "@/lib/services/supabase/server";
import { getFitnessSubscription } from "@/lib/fitness/subscription/access";
import { getLockedFitnessRate } from "@/lib/fitness/subscription/locked-rate";
import { Suspense } from "react";
import { getPlanPricesAction } from "@/app/actions/admin-pricing";
import { getUserPremiumDetailsAction } from "@/app/actions/payment";
import FitnessPaymentClient from "./payment-client";

export const dynamic = "force-dynamic";

function PaymentLoadingFallback() {
  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#ADFF00] border-t-transparent animate-spin" />
    </div>
  );
}

export default async function FitnessPaymentPage() {
  const [pricingConfig, premiumDetails] = await Promise.all([
    getPlanPricesAction("fitness").catch(() => null),
    getUserPremiumDetailsAction("fitness_os").catch(() => null),
  ]);

  const { data: { user } } = await getCachedUser();
  const subscription = user ? await getFitnessSubscription(user.id) : null;
  const renewalLevel = subscription ? (subscription.plan === "pro" ? "pro" : "core") : premiumDetails?.premium_level;
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
        renewalExpiresAt={subscription?.current_period_end || premiumDetails?.premium_expires_at || null}
        initialPremiumDetails={premiumDetails || undefined}
      />
    </Suspense>
  );
}
