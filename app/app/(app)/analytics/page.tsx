import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient, { AnalyticsData } from "./analytics-client";
import { isHabitScheduled } from "@/lib/habit-utils";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return redirect("/login");
  }

  const [
    { data: profile },
    { data: habits }
  ] = await Promise.all([
    supabase.from("profiles").select("premium_level").eq("id", user.id).single(),
    supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true)
  ]);

  if (profile?.premium_level !== "pro") {
    return redirect("/payment");
  }

  const allHabits = habits || [];

  // Calculate Highlights
  let completionAvg = 0;
  let longestStreak = 0;
  let bestHabit = "";
  let bestHabitEmoji = "";
  let worstHabit = "";
  let worstHabitEmoji = "";
  let worstHabitRate = 100;
  let maxRate = -1;

  const donutCategories: Record<string, { count: number; color: string }> = {};

  if (allHabits.length > 0) {
    let totalRate = 0;
    allHabits.forEach((h: any) => {
      totalRate += h.completion_rate;
      if (h.longest_streak > longestStreak) longestStreak = h.longest_streak;
      
      if (h.completion_rate > maxRate && h.completion_rate > 0) {
        maxRate = h.completion_rate;
        bestHabit = h.name;
        bestHabitEmoji = h.emoji;
      }
      if (h.completion_rate < worstHabitRate) {
        worstHabitRate = h.completion_rate;
        worstHabit = h.name;
        worstHabitEmoji = h.emoji;
      }

      const cat = h.category || "General";
      if (!donutCategories[cat]) donutCategories[cat] = { count: 0, color: h.color || "#3b82f6" };
      donutCategories[cat].count++;
    });
    completionAvg = Math.round(totalRate / allHabits.length);
  }

  const initialData: AnalyticsData = {
    completionAvg,
    longestStreak,
    bestHabit: maxRate > -1 ? { name: bestHabit, emoji: bestHabitEmoji } : undefined,
    worstHabit: worstHabitRate < 100 ? { name: worstHabit, emoji: worstHabitEmoji } : undefined,
    donutData: Object.entries(donutCategories).map(([name, val]) => ({
      name,
      value: val.count,
      color: val.color,
    }))
  };

  return <AnalyticsClient initialData={initialData} allHabits={allHabits} />;
}
