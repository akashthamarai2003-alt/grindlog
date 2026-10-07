import { getCachedUser, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { Suspense } from "react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function FitnessLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
  }

  // Fetch onboarding status and subscription plan in parallel using request-memoized helpers
  const [
    profile,
    plan,
  ] = await Promise.all([
    getCachedFitnessProfile(user.id),
    getFitnessPlan(user.id),
  ]);

  if (!profile?.onboarding_completed) {
    return <>{children}</>;
  }

  return <FitnessShell isPro={plan?.id === "pro"}>{children}</FitnessShell>;
}

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isProCookie = cookieStore.get("grindlog_is_pro")?.value === "true";

  // Keep the app shell and route-level loading UI visible while auth/profile
  // checks complete. Passing isProCookie prevents Pro users from seeing free-tier badges on refresh.
  return (
    <Suspense fallback={<FitnessShell isPro={isProCookie}>{children}</FitnessShell>}>
      <FitnessLayoutContent>{children}</FitnessLayoutContent>
    </Suspense>
  );
}
