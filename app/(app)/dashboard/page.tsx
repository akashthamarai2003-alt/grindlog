import { createServerSupabase } from "@/lib/services/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, xp, level")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Edge case if profile isn't created yet
    return <div>Loading profile...</div>;
  }

  // We need today's date string in YYYY-MM-DD format based on user's timezone ideally,
  // but for now we will use a basic UTC or server date approach.
  const todayDateStr = new Date().toISOString().split("T")[0];

  // Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  // Fetch today's logs
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, status")
    .eq("user_id", user.id)
    .eq("date", todayDateStr);

  const logsMap = new Map((logs || []).map(l => [l.habit_id, l.status]));

  // Format data for client
  const formattedHabits = (habits || []).map((h) => ({
    id: h.id,
    name: h.name,
    emoji: h.emoji || "✨",
    targetCount: h.target_count || 1,
    targetUnit: h.target_unit || "times",
    color: h.color || "#34C759",
    currentStreak: h.current_streak || 0,
    isCompleted: logsMap.get(h.id) === "completed",
  }));

  return (
    <DashboardClient 
      profile={profile as any} 
      initialHabits={formattedHabits} 
      todayDateStr={todayDateStr} 
    />
  );
}
