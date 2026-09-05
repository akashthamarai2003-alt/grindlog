import { redirect } from "next/navigation";
import { ProfileContent } from "@/components/fitness/profile/profile-content";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

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
