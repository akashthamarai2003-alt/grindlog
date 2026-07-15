import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsClient, { AnalyticsData } from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 1. Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

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

      // Group for donut chart
      const cat = h.category || "Uncategorized";
      if (!donutCategories[cat]) {
        donutCategories[cat] = { count: 0, color: h.color || "#007AFF" };
      }
      donutCategories[cat].count += 1;
    });
    completionAvg = Math.round(totalRate / allHabits.length);
  }

  const CHART_COLORS = [
    "#FF2D55", // Pink
    "#007AFF", // Blue
    "#34C759", // Green
    "#FF9500", // Orange
    "#5856D6", // Purple
    "#FFCC00", // Yellow
    "#5AC8FA", // Light Blue
    "#FF3B30", // Red
  ];

  const donutData = Object.keys(donutCategories).map((label, index) => ({
    label,
    value: donutCategories[label].count,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  // 2. Dates for the last 30 days (for trend, heatmap, weekly)
  const today = new Date();
  const dates30: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates30.push(d.toISOString().split('T')[0]);
  }

  const thirtyDaysAgoStr = dates30[0];
  const sevenDaysAgoStr = dates30[23]; // index 23 is 7 days ago
  const dates28 = dates30.slice(2); // Last 28 days for heatmap

  // 3. Fetch habit logs
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("date, status, completed_at, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("date", thirtyDaysAgoStr);

  const completedLogs = logs || [];
  
  // Aggregate completions per date
  const completionsPerDate: Record<string, number> = {};
  
  // Aggregate time of day (0-23)
  const timeOfDayMap: Record<number, number> = {};
  for(let i=0; i<24; i++) timeOfDayMap[i] = 0;

  completedLogs.forEach((log: any) => {
    if (!completionsPerDate[log.date]) completionsPerDate[log.date] = 0;
    completionsPerDate[log.date]++;

    const ts = log.completed_at || log.created_at;
    if (ts) {
      const h = new Date(ts).getHours();
      if (!isNaN(h)) timeOfDayMap[h]++;
    }
  });

  const timeOfDayData = Object.keys(timeOfDayMap).map(h => ({
    hour: parseInt(h),
    count: timeOfDayMap[parseInt(h)]
  }));

  // Heatmap Data (array of 28 numbers, chronological)
  const heatmapData = dates28.map(d => completionsPerDate[d] || 0);
  
  // Trend Data (30 days)
  const trendData = dates30.map(d => ({
    date: d,
    completions: completionsPerDate[d] || 0
  }));

  // 4. Fetch journal entries for Mood/Energy (last 7 days)
  const { data: journals } = await supabase
    .from("journal_entries")
    .select("date, mood, energy")
    .eq("user_id", user.id)
    .gte("date", sevenDaysAgoStr);

  const journalData = journals || [];
  const journalByDate: Record<string, { mood: number; energy: number }> = {};
  journalData.forEach((j: any) => {
    journalByDate[j.date] = {
      mood: j.mood || 0,
      energy: j.energy || 0,
    };
  });

  // Weekly Data (last 7 days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = dates28.slice(21).map(dString => {
    const dObj = new Date(dString);
    return {
      day: dayNames[dObj.getDay()],
      habits: completionsPerDate[dString] || 0,
      mood: journalByDate[dString]?.mood || 0,
      energy: journalByDate[dString]?.energy || 0,
    };
  });

  const radarData = Object.keys(donutCategories).map(label => ({
    category: label,
    value: donutCategories[label].count,
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 categories

  const analyticsData: AnalyticsData = {
    highlights: {
      completion: completionAvg,
      longestStreak: longestStreak,
      bestHabit: bestHabit,
      bestHabitEmoji: bestHabitEmoji,
      worstHabit: worstHabit,
      worstHabitEmoji: worstHabitEmoji,
      worstHabitRate: worstHabitRate === 100 && allHabits.length === 0 ? 0 : worstHabitRate,
    },
    totalActiveHabits: allHabits.length,
    weeklyData,
    donutData,
    heatmapData,
    trendData,
    timeOfDayData,
    radarData,
  };

  return <AnalyticsClient data={analyticsData} />;
}