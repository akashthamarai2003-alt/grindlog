import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

// Fast in-memory cache for user onboarding status and subscription tier (TTL: 10 minutes)
const layoutUserStateCache = new Map<string, { onboardingCompleted: boolean; isPro: boolean; expiresAt: number }>();

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
  }

  const cached = layoutUserStateCache.get(user.id);
  if (cached && Date.now() < cached.expiresAt) {
    if (!cached.onboardingCompleted) {
      return <>{children}</>;
    }
    return <FitnessShell isPro={cached.isPro}>{children}</FitnessShell>;
  }

  // Fetch onboarding status and subscription plan in parallel
  const admin = createAdminClient();
  const [
    { data: profile },
    plan,
  ] = await Promise.all([
    admin
      .from("fitness_os_profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle(),
    getFitnessPlan(user.id),
  ]);

  const onboardingCompleted = Boolean(profile?.onboarding_completed);
  const isPro = plan?.id === "pro";

  layoutUserStateCache.set(user.id, {
    onboardingCompleted,
    isPro,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  if (!onboardingCompleted) {
    return <>{children}</>;
  }

  return <FitnessShell isPro={isPro}>{children}</FitnessShell>;
}
