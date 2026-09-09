import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { getOrSyncFitnessNotifications } from "@/app/actions/fitness-notifications";
import { NotificationsClient } from "@/components/fitness/notifications/notifications-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FitnessNotificationsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/notifications");
  }

  const [notificationsRes, { data: profile }] = await Promise.all([
    getOrSyncFitnessNotifications(),
    supabase
      .from("fitness_os_profiles")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const userName = profile?.name || user.user_metadata?.full_name || "Athlete";

  return (
    <NotificationsClient
      initialNotifications={notificationsRes.notifications}
      initialUnreadCount={notificationsRes.unreadCount}
      userName={userName}
    />
  );
}
