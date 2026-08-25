import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";

export async function FitnessGuard({ children, requirePro = false }: { children: React.ReactNode, requirePro?: boolean }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/fitness");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed, fitness_is_premium, fitness_premium_level")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  if (!profile?.fitness_is_premium) {
    redirect("/payment?returnTo=/fitness");
  }

  if (requirePro && profile?.fitness_premium_level !== "pro") {
    redirect("/payment?returnTo=/fitness");
  }

  return <>{children}</>;
}
