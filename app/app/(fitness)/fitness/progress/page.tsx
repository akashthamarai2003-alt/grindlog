import { Metadata } from "next";
import { createClient } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";
import { ProgressView } from "@/components/fitness/progress/progress-view";

export const metadata: Metadata = {
  title: "Progress - Fitness AI OS",
  description: "Track your fitness progress.",
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Calculate deterministic stats
  const today = new Date();
  const weekEndStr = today.toISOString().split("T")[0];
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // 1. Workouts
  const { data: workouts } = await supabase
    .from("fitness_os_workouts")
    .select("id, status")
    .eq("user_id", user.id)
    .gte("workout_date", weekStartStr)
    .lte("workout_date", weekEndStr);

  const workoutsPlanned = workouts?.length || 0;
  const workoutsCompleted = workouts?.filter(w => w.status === "completed").length || 0;

  // 2. Sessions
  const { data: sessions } = await supabase
    .from("fitness_os_workout_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .gte("created_at", weekStart.toISOString())
    .lte("created_at", today.toISOString());

  const totalMinutes = sessions?.reduce((acc, s) => acc + (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0), 0) || 0;

  // 3. Sets
  let setsCompleted = 0;
  if (workoutsCompleted > 0) {
    const completedWorkoutIds = workouts!.filter(w => w.status === "completed").map(w => w.id);
    const { data: exercises } = await supabase.from("fitness_os_exercises").select("id").in("workout_id", completedWorkoutIds);
    if (exercises && exercises.length > 0) {
      const exerciseIds = exercises.map(e => e.id);
      const { count } = await supabase.from("fitness_os_sets").select("id", { count: "exact", head: true }).in("exercise_id", exerciseIds).eq("completed", true);
      setsCompleted = count || 0;
    }
  }

  // 4. Latest Review
  const { data: latestReview } = await supabase
    .from("fitness_os_progress_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const stats = {
    workoutsPlanned,
    workoutsCompleted,
    setsCompleted,
    totalMinutes,
    activeDays: workoutsCompleted // Simplified for UI
  };

  return (
    <FitnessGuard>
      <FitnessShell>
        <ProgressView stats={stats} latestReview={latestReview || null} />
      </FitnessShell>
    </FitnessGuard>
  );
}
