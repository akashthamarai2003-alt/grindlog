import { createServerSupabase } from "@/lib/services/supabase/server";
import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id);

  // Fetch last year of logs
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", oneYearAgo.toISOString());

  return <AnalyticsClient habits={habits || []} logs={logs || []} />;
}