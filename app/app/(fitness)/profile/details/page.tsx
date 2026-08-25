import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { MyDetailsContent } from "@/components/fitness/profile/my-details-content";
import { redirect } from "next/navigation";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";

export default async function MyDetailsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/fitness");
  }

  const { data: fitnessProfile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: activePlan } = await supabase
    .from("fitness_os_workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const aiLimitInfo = await checkFitnessAILimit(supabase, user.id);

  return (
    <FitnessGuard>
      <MyDetailsContent
        user={user}
        fitnessProfile={fitnessProfile || {}}
        mainProfile={mainProfile || {}}
        activePlan={activePlan || null}
        aiLimitInfo={aiLimitInfo}
      />
    </FitnessGuard>
  );
}
