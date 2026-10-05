import { redirect } from "next/navigation";
import { getCachedUser, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { getRoadmapData } from "@/lib/services/fitness/roadmap-service";
import { RoadmapView } from "@/components/fitness/roadmap/roadmap-view";

export const dynamic = "force-dynamic";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams?: Promise<{ new?: string; [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isNewPlan = resolvedSearchParams?.new === "true";

  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/roadmap");
  }

  const admin = createAdminClient();
  const [profileResult, { data: plan }, subscriptionState] = await Promise.all([
    admin
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    admin
      .from("fitness_os_workout_plans")
      .select("id, name, description, goal, plan_data, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getFitnessSubscriptionState(user.id),
  ]);

  const profile = profileResult.data;

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  // Merge onboarding_data to ensure 100% field coverage across all onboarding iterations
  const mergedProfile = {
    ...profile,
    ...(profile.onboarding_data || {}),
    // Ensure primary database values take precedence
    weight: profile.weight ?? profile.onboarding_data?.weight,
    target_weight: profile.target_weight ?? profile.onboarding_data?.target_weight,
    goal: profile.goal ?? profile.onboarding_data?.goal,
    created_at: profile.created_at,
  };

  const profileIsPremium = Boolean(
    profile.fitness_is_premium ||
    profile.fitness_premium_tier === "pro" ||
    profile.fitness_premium_tier === "core" ||
    profile.fitness_premium_level === "pro" ||
    profile.fitness_premium_level === "core"
  );

  const isPaidUser =
    subscriptionState?.status === "active" ||
    subscriptionState?.status === "grace_period" ||
    Boolean(subscriptionState?.plan && subscriptionState.plan.id !== "free") ||
    profileIsPremium;

  const isPro =
    subscriptionState?.plan?.id === "pro" ||
    profile.fitness_premium_tier === "pro" ||
    profile.fitness_premium_level === "pro";

  const premiumLevel = !isPaidUser
    ? "free"
    : isPro
    ? "pro"
    : "core";

  const roadmapData = await getRoadmapData(user.id, mergedProfile, plan);

  return (
    <RoadmapView
      roadmapData={roadmapData}
      profile={mergedProfile}
      premiumLevel={premiumLevel}
      hasPlan={Boolean(plan)}
      plan={plan}
      initialIsNewPlan={isNewPlan}
    />
  );
}
