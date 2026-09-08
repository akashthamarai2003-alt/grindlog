import { Metadata } from "next";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import { RemindersClient } from "./reminders-client";

export const metadata: Metadata = {
  title: "Set Reminders - Fitness AI OS",
  description: "Configure your fitness and nutrition reminders.",
};

export default async function RemindersPage() {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/reminders");
  }

  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("onboarding_completed, reminders_enabled, custom_reminders")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const isEnabled = profile?.reminders_enabled ?? true;
  const customReminders = profile?.custom_reminders || [];

  return (
    <RemindersClient initialEnabled={isEnabled} initialReminders={customReminders} />
  );
}
