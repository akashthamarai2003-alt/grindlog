import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { getUserSupportMessages } from "@/app/actions/support";
import { SupportClient } from "@/components/fitness/support/support-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FitnessSupportPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/support");
  }

  const [
    messagesRes,
    { data: fitnessProfile },
    { data: profile },
  ] = await Promise.all([
    getUserSupportMessages(),
    supabase
      .from("fitness_os_profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name, name")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const userName =
    fitnessProfile?.name ||
    profile?.display_name ||
    profile?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Athlete";

  return (
    <SupportClient
      initialMessages={messagesRes.data || []}
      userEmail={user.email}
      userName={userName}
    />
  );
}
