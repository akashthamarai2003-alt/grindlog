import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { MyDetailsContent } from "@/components/fitness/profile/my-details-content";
import { redirect } from "next/navigation";

export default async function MyDetailsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/profile/details");
  }

  const { data: fitnessProfile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: activePlan } = await supabase
    .from("fitness_os_workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return (
    <FitnessGuard>
      <MyDetailsContent
        fitnessProfile={fitnessProfile || {}}
        activePlan={activePlan || null}
      />
    </FitnessGuard>
  );
}
