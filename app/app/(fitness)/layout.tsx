import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function FitnessLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <>{children}</>;
  }

  // If user has not completed onboarding, never render the app shell / bottom nav
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("fitness_os_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    return <>{children}</>;
  }

  const plan = await getFitnessPlan(user.id);

  return <FitnessShell isPro={plan?.id === "pro"}>{children}</FitnessShell>;
}
