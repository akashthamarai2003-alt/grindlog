import { Metadata } from "next";
import { createClient, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { RemindersClient } from "./reminders-client";

export const metadata: Metadata = {
  title: "Set Reminders - Fitness AI OS",
  description: "Configure your fitness and nutrition reminders.",
};

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user } } = await getCachedUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("reminders_enabled, custom_reminders")
    .eq("user_id", user.id)
    .single();

  const isEnabled = profile?.reminders_enabled ?? true;
  const customReminders = profile?.custom_reminders || [];

  return (
    <FitnessGuard requirePro={false}>
      <RemindersClient initialEnabled={isEnabled} initialReminders={customReminders} />
    </FitnessGuard>
  );
}
