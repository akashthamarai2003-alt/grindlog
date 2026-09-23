import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/fitness/onboarding/onboarding-flow";
import { hasGeneratedStartingReport } from "@/lib/services/fitness/starting-report-service";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const isEditing = params?.mode === "edit" || params?.edit === "true";

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin?redirect=/onboarding");

  let { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    const admin = createAdminClient();
    const { data: adminProfile } = await admin
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (adminProfile?.onboarding_completed) {
      profile = adminProfile;
    }
  }

  // Returning users who already completed onboarding belong on their report (if unviewed) or dashboard
  if (profile?.onboarding_completed && !isEditing) {
    if (!profile?.ai_strategy?.starting_report_viewed) {
      redirect("/report");
    }
    redirect("/");
  }

  return <OnboardingFlow initialData={profile || {}} sessionId={crypto.randomUUID()} />;
}
