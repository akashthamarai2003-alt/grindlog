import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
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

  if (!profile?.onboarding_completed) {
    return <>{children}</>;
  }

  return <FitnessShell isPro={plan?.id === "pro"}>{children}</FitnessShell>;
}
