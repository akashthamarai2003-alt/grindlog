import { createClient } from "@/lib/services/supabase/server";

export async function buildFitnessCoachContext(userId: string): Promise<string> {
  const supabase = await createClient();

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("goal, fitness_level, weight, target_weight, height, age, gender")
    .eq("id", userId)
    .single();

  // 2. Fetch Active Plan
  const { data: activePlan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id, name, goal")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // 3. Fetch Recent Workouts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentWorkouts } = await supabase
    .from("fitness_os_workouts")
    .select("id, name, status, duration_minutes, workout_date, completed_at")
    .eq("user_id", userId)
    .gte("workout_date", sevenDaysAgo.toISOString().split("T")[0])
    .order("workout_date", { ascending: false });

  // 4. Fetch Recent Sessions to see actual performance
  const { data: recentSessions } = await supabase
    .from("fitness_os_workout_sessions")
    .select("workout_id, status, duration_seconds")
    .eq("user_id", userId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  // 5. Fetch Recent Progress Reviews
  const { data: recentReviews } = await supabase
    .from("fitness_os_progress_reviews")
    .select("week_start, week_end, workouts_completed, workouts_planned, ai_summary")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  // Build Context String
  let context = "User Profile Data:\n";
  if (!profile) {
    context += "No profile data available.\n";
  } else {
    context += `- Goal: ${profile.goal}\n`;
    context += `- Fitness Level: ${profile.fitness_level}\n`;
    context += `- Weight: ${profile.weight} kg (Target: ${profile.target_weight} kg)\n`;
  }

  context += "\nCurrent Plan:\n";
  if (!activePlan) {
    context += "No active plan available.\n";
  } else {
    context += `- Name: ${activePlan.name}\n- Goal: ${activePlan.goal}\n`;
  }

  context += "\nRecent Workouts (Last 7 Days):\n";
  if (!recentWorkouts || recentWorkouts.length === 0) {
    context += "No recent workouts found.\n";
  } else {
    recentWorkouts.forEach(w => {
      const session = recentSessions?.find(s => s.workout_id === w.id);
      const actualDuration = session?.duration_seconds ? Math.round(session.duration_seconds / 60) : 0;
      context += `- Date: ${w.workout_date}, Name: ${w.name}, Status: ${w.status}, Planned Duration: ${w.duration_minutes || 0}m, Actual Duration: ${actualDuration}m\n`;
    });
  }

  context += "\nRecent Progress Review:\n";
  if (!recentReviews || recentReviews.length === 0) {
    context += "No recent progress review available.\n";
  } else {
    const rev = recentReviews[0];
    context += `- Period: ${rev.week_start} to ${rev.week_end}\n`;
    context += `- Workouts: ${rev.workouts_completed} / ${rev.workouts_planned} completed\n`;
    context += `- Previous AI Summary: ${rev.ai_summary || "None"}\n`;
  }

  return context;
}
