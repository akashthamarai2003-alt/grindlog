import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";

export async function FitnessGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/fitness/onboarding");
  }

  if (!mainProfile?.is_premium) {
    redirect("/payment?returnTo=/fitness");
  }

  return <>{children}</>;
}
