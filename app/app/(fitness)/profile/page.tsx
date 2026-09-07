import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/fitness/profile/profile-content";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FitnessProfilePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile");
  }

  // Fetch all profile, plan, subscription and AI limit data concurrently
  const [
    { data: fitnessProfile },
    { data: mainProfile },
    { data: activePlan },
    subscriptionPlan,
    aiLimitInfo,
  ] = await Promise.all([
    supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("fitness_os_workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    getFitnessPlan(user.id),
    checkFitnessAILimit(supabase, user.id),
  ]);

  // Resolve user's real name giving first priority to onboarding provided name
  const onboardingName = 
    (typeof fitnessProfile?.name === "string" && fitnessProfile.name.trim()) ||
    (typeof (fitnessProfile?.onboarding_data as any)?.name === "string" && (fitnessProfile.onboarding_data as any).name.trim()) ||
    (typeof mainProfile?.display_name === "string" && mainProfile.display_name.trim()) ||
    (typeof mainProfile?.name === "string" && mainProfile.name.trim()) ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    null;

  if (onboardingName) {
    if (fitnessProfile && (!fitnessProfile.name || !fitnessProfile.name.trim())) {
      fitnessProfile.name = onboardingName;
      supabase
        .from("fitness_os_profiles")
        .update({ name: onboardingName })
        .eq("user_id", user.id)
        .then(() => {});
    }
    if (mainProfile && (!mainProfile.display_name || !mainProfile.display_name.trim())) {
      mainProfile.display_name = onboardingName;
      supabase
        .from("profiles")
        .update({ display_name: onboardingName })
        .eq("id", user.id)
        .then(() => {});
    }
  }

  return (
    <ProfileContent
      user={user}
      fitnessProfile={fitnessProfile || {}}
      mainProfile={mainProfile || {}}
      activePlan={activePlan || null}
      subscriptionPlan={subscriptionPlan}
      aiLimitInfo={aiLimitInfo}
    />
  );
}
