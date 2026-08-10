import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutEmptyState } from "@/components/fitness/workout/workout-empty-state";
import { WorkoutOverview } from "@/components/fitness/workout/workout-overview";
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
  const { data: workout } = await supabase
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

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-gray-50/50">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="Workout" 
            dateStr={dateStr}
            avatarUrl={user.user_metadata?.avatar_url}
          />
          
          <div className="mt-6">
            {workout ? (
              <WorkoutOverview 
                workout={workout as any} 
                exerciseCount={workout.fitness_os_exercises?.length || 0} 
              />
            ) : (
              <WorkoutEmptyState />
            )}
          </div>
        </div>
      </div>
    </FitnessGuard>
  );
}
