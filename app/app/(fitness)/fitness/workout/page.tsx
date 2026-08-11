import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutSummaryCard } from "@/components/fitness/workout/workout-summary-card";
import { redirect } from "next/navigation";

export default async function WorkoutIndexPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  // Get today's local date string
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's workout
  let { data: workout } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (id)
    `)
    .eq("user_id", user.id)
    .eq("workout_date", today)
    .in("status", ["scheduled", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const dateStr = new Date().toLocaleDateString("en-US", { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
  
  // If no workout, mock it for the UI design preview
  if (!workout) {
    workout = {
      id: "mock",
      name: "Upper Body",
      duration_minutes: 48,
      difficulty_level: "Moderate",
      plan_data: { target_muscles: ["Chest", "Back", "Shoulders", "Arms"] },
      fitness_os_exercises: [1,2,3,4,5,6]
    } as any;
  }

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="Workout" 
            dateStr={dateStr}
            avatarUrl={user.user_metadata?.avatar_url}
            backUrl="/fitness"
          />
          
          <div className="mt-2">
            <WorkoutSummaryCard 
              workout={workout} 
              exerciseCount={workout.fitness_os_exercises?.length || 6} 
            />
          </div>
        </div>
      </div>
    </FitnessGuard>
  );
}
