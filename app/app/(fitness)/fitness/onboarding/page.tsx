import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/fitness/onboarding/onboarding-flow";

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

  if (!user) redirect("/auth/signin?redirect=/fitness");

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Only redirect to dashboard if onboarding is completed AND user is NOT explicitly trying to edit/retake it
  if (profile?.onboarding_completed && !isEditing) {
    redirect("/fitness");
  }

  return <OnboardingFlow initialData={profile || {}} sessionId={crypto.randomUUID()} />;
}
