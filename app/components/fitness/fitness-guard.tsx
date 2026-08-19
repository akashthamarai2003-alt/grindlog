import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";

export async function FitnessGuard({ children, requirePro = false }: { children: React.ReactNode, requirePro?: boolean }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/fitness");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("is_premium, premium_level")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/fitness/onboarding");
  }

  if (!mainProfile?.is_premium) {
    redirect("/fitness/payment?returnTo=/fitness");
  }

  if (requirePro && mainProfile?.premium_level !== "pro") {
    redirect("/fitness/payment?returnTo=/fitness");
  }

  return <>{children}</>;
}
