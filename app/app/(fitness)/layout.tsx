import { getCachedUser, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
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
