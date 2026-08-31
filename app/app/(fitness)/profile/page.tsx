import { redirect } from "next/navigation";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { ProfileContent } from "@/components/fitness/profile/profile-content";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";

export default async function FitnessProfilePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile");
  }

  // 1. Fetch Fitness OS Profile
  const { data: fitnessProfile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Fetch Main Profile (for premium statuses and metadata)
  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // 3. Fetch Active Workout Plan
  const { data: activePlan } = await supabase
    .from("fitness_os_workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  // 4. Fetch AI Limit Info
  const aiLimitInfo = await checkFitnessAILimit(supabase, user.id);

  return (
    <FitnessShell>
      <ProfileContent
        user={user}
        fitnessProfile={fitnessProfile || {}}
        mainProfile={mainProfile || {}}
        activePlan={activePlan || null}
        aiLimitInfo={aiLimitInfo}
      />
    </FitnessShell>
  );
}
