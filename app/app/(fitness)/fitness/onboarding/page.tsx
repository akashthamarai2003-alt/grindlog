import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/fitness/onboarding/onboarding-flow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) {
    redirect("/fitness");
  }

  return <OnboardingFlow />;
}
