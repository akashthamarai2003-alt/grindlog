import { createServerSupabase } from "@/lib/services/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { redirect } from "next/navigation";

import { syncMissedHabits } from "@/app/actions/habits";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const todayDateStr = new Date().toISOString().split("T")[0];

  // Auto-fail any past habits that were missed and sync streaks
  // Temporarily disabled to prevent dashboard blocking
  // await syncMissedHabits(todayDateStr);

  // Run all database fetches in parallel
  const [
    { data: profile },
    { data: habits },
    { data: logs }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, xp, level, coins, premium_level")
      .eq("id", user.id)
      .single(),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("habit_id, status, remarks")
      .eq("user_id", user.id)
      .eq("date", todayDateStr)
  ]);

  let finalProfile = profile;

  if (!finalProfile) {
    // Self-heal: If profile trigger failed or doesn't exist, create it now
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Grinder",
        xp: 0,
        level: 1,
        coins: 0,
        tree_stage: 1,
        theme: "light",
      } as any)
      .select("display_name, xp, level, coins, premium_level")
      .single();
      
    finalProfile = newProfile;
  }

  // If STILL missing (e.g., db error), show a fallback so it doesn't crash
  if (!finalProfile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-[var(--color-text-secondary)]">Error loading profile. Please refresh.</p>
      </div>
    );
  }

  const logsMap = new Map((logs || []).map(l => [l.habit_id, { status: l.status, remark: l.remarks }]));

  // Format data for client
  const formattedHabits = (habits || []).map((h) => ({
    id: h.id,
    name: h.name,
    emoji: h.emoji || "✨",
    frequency: h.frequency,
    customDays: h.custom_days,
    targetCount: h.target_count || 1,
    targetUnit: h.target_unit || "times",
    color: h.color || "#34C759",
    currentStreak: h.current_streak || 0,
    isCompleted: logsMap.get(h.id)?.status === "completed",
    remark: logsMap.get(h.id)?.remark || "",
    preferredTime: h.preferred_time || "anytime",
    reminderTime: h.reminder_time || null,
    createdAt: h.created_at,
  }));

  return (
    <DashboardClient 
      profile={finalProfile as any} 
      initialHabits={formattedHabits} 
      todayDateStr={todayDateStr} 
    />
  );
}
