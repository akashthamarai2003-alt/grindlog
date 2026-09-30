import { BillingManagementClient } from "@/components/fitness/profile/billing-management-client";
import { CORE_PLAN, PRO_PLAN, FREE_PLAN } from "@/lib/fitness/subscription/plans";
import { FitnessSubscriptionState } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";

export default async function TestBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "active_pro" } = await searchParams;

  const now = new Date();
  const futureExpiry = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString();
  const pastExpiry = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

  let subscriptionState: FitnessSubscriptionState;
  let membershipLevel: "core" | "pro" | undefined = undefined;
  let lockedRatePaise: number | null = null;
  let paymentHistory: any[] = [];

  if (status === "free") {
    subscriptionState = {
      status: "free",
      plan: FREE_PLAN,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: null,
    };
    membershipLevel = undefined;
    lockedRatePaise = null;
    paymentHistory = [];
  } else if (status === "active_core") {
    subscriptionState = {
      status: "active",
      plan: CORE_PLAN,
      daysRemaining: 18,
      hoursRemaining: 18 * 24,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: futureExpiry,
    };
    membershipLevel = "core";
    lockedRatePaise = 2900; // ₹29
    paymentHistory = [
      {
        id: "pay_core_001",
        plan: "core",
        amount: 29,
        status: "captured",
        paymentId: "pay_test_core_123456",
        date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: futureExpiry,
      },
    ];
  } else if (status === "grace_period") {
    subscriptionState = {
      status: "grace_period",
      plan: PRO_PLAN,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 36,
      isGracePeriod: true,
      isExpired: false,
      expiresAt: pastExpiry,
    };
    membershipLevel = "pro";
    lockedRatePaise = 9900;
    paymentHistory = [
      {
        id: "pay_pro_000",
        plan: "pro",
        amount: 99,
        status: "captured",
        paymentId: "pay_test_grace_123456",
        date: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: pastExpiry,
      },
    ];
  } else if (status === "expired") {
    subscriptionState = {
      status: "expired",
      plan: PRO_PLAN,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: true,
      expiresAt: pastExpiry,
    };
    membershipLevel = "pro";
    lockedRatePaise = 9900;
    paymentHistory = [
      {
        id: "pay_pro_expired",
        plan: "pro",
        amount: 99,
        status: "captured",
        paymentId: "pay_test_expired_123456",
        date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: pastExpiry,
      },
    ];
  } else {
    // Default: active_pro
    subscriptionState = {
      status: "active",
      plan: PRO_PLAN,
      daysRemaining: 20,
      hoursRemaining: 20 * 24,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: futureExpiry,
    };
    membershipLevel = "pro";
    lockedRatePaise = 9900; // ₹99
    paymentHistory = [
      {
        id: "pay_pro_002",
        plan: "pro",
        amount: 99,
        status: "captured",
        paymentId: "pay_test_pro_789012",
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: futureExpiry,
      },
      {
        id: "pay_pro_001",
        plan: "pro",
        amount: 99,
        status: "captured",
        paymentId: "pay_test_pro_123456",
        date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[#060B06] text-white">
      <BillingManagementClient
        subscriptionState={subscriptionState}
        paymentHistory={paymentHistory}
        membershipLevel={membershipLevel}
        lockedRatePaise={lockedRatePaise}
        proPrice={99}
        proUpgradePrice={70}
        corePrice={29}
        userEmail="alex.hunter@example.com"
        userName="Alex Hunter"
      />
    </div>
  );
}
