import { redirect } from "next/navigation";
import { getCachedUser, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { getRoadmapData } from "@/lib/services/fitness/roadmap-service";
import { RoadmapView } from "@/components/fitness/roadmap/roadmap-view";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/roadmap");
  }

  const admin = createAdminClient();
  const [profile, { data: plan }, subscriptionState] = await Promise.all([
    getCachedFitnessProfile(user.id),
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

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const isPaidUser =
    subscriptionState?.status === "active" ||
    subscriptionState?.status === "grace_period" ||
    Boolean(subscriptionState?.plan && subscriptionState.plan.id !== "free");

  const premiumLevel = !isPaidUser
    ? "free"
    : subscriptionState?.plan?.id === "pro"
    ? "pro"
    : "core";

  const roadmapData = await getRoadmapData(user.id, profile, plan);

  return (
    <RoadmapView
      roadmapData={roadmapData}
      profile={profile}
      premiumLevel={premiumLevel}
      hasPlan={Boolean(plan)}
    />
  );
}
