import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/fitness/profile/profile-content";
import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import {
  getCachedProfilePageData,
  setCachedProfilePageData,
} from "@/lib/services/profile/profile-cache";

export default async function FitnessProfilePage() {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile");
  }

  // Fast in-memory cache check (<1ms response time)
  const cached = getCachedProfilePageData(user.id);
  if (cached) {
    return (
      <ProfileContent
        user={user}
        fitnessProfile={cached.fitnessProfile || {}}
        mainProfile={cached.mainProfile || {}}
        activePlan={cached.activePlan || null}
        subscriptionPlan={cached.subscriptionPlan}
        aiLimitInfo={cached.aiLimitInfo}
      />
    );
  }

  const admin = createAdminClient();

  // Fetch all profile, subscription and AI limit data concurrently with admin client (bypassing RLS latency)
  const [
    { data: fitnessProfile },
    { data: mainProfile },
    { data: activePlan },
    subscriptionPlan,
    aiLimitInfo,
  ] = await Promise.all([
    admin
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
    admin
      .from("fitness_os_workout_plans")
      .select("id, name, description, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    getFitnessPlan(user.id),
    checkFitnessAILimit(admin, user.id),
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
      admin
        .from("fitness_os_profiles")
        .update({ name: onboardingName })
        .eq("user_id", user.id)
        .then(() => {});
    }
    if (mainProfile && (!mainProfile.display_name || !mainProfile.display_name.trim())) {
      mainProfile.display_name = onboardingName;
      admin
        .from("profiles")
        .update({ display_name: onboardingName })
        .eq("id", user.id)
        .then(() => {});
    }
  }

  const resultData = {
    fitnessProfile: fitnessProfile || {},
    mainProfile: mainProfile || {},
    activePlan: activePlan || null,
    subscriptionPlan,
    aiLimitInfo,
  };

  // Cache in server memory with 10-minute TTL
  setCachedProfilePageData(user.id, resultData);

  return (
    <ProfileContent
      user={user}
      fitnessProfile={resultData.fitnessProfile}
      mainProfile={resultData.mainProfile}
      activePlan={resultData.activePlan}
      subscriptionPlan={resultData.subscriptionPlan}
      aiLimitInfo={resultData.aiLimitInfo}
    />
  );
}
