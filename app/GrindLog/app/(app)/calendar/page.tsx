import { createServerSupabase } from "@/lib/services/supabase/server";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { redirect } from "next/navigation";

import { syncMissedHabits } from "@/app/actions/habits";

export default async function CalendarPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0];

  // Auto-fail any past habits that were missed and sync streaks
  await syncMissedHabits(todayDateStr);

  // We fetch initial logs for the current month
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Fetch active habits
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, emoji, frequency, custom_days, target_count, target_unit, color, current_streak, preferred_time, reminder_time, created_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  // Fetch current month's logs
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, date, status, remarks")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString().split("T")[0])
    .lte("date", endOfMonth.toISOString().split("T")[0]);

  return (
    <CalendarClient 
      initialHabits={habits || []} 
      initialLogs={logs || []} 
      todayDateStr={todayDateStr} 
    />
  );
}