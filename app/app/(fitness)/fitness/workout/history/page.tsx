import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutHistoryCard } from "@/components/fitness/workout/workout-history-card";
import { redirect } from "next/navigation";

export default async function WorkoutHistoryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const { data: workouts, error } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-gray-50/50">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="History" 
            backUrl="/fitness"
            avatarUrl={user.user_metadata?.avatar_url}
          />
          
          <div className="mt-6 space-y-4">
            {(!workouts || workouts.length === 0) ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center mt-10">
                <h3 className="text-lg font-bold text-gray-900 mb-2">No completed workouts yet.</h3>
                <p className="text-sm font-medium text-gray-500">
                  Your completed workouts will appear here.
                </p>
              </div>
            ) : (
              workouts.map((workout: any) => {
                const exerciseCount = workout.fitness_os_exercises?.length || 0;
                let completedSets = 0;
                let totalSets = 0;
                
                workout.fitness_os_exercises?.forEach((ex: any) => {
                  ex.fitness_os_sets?.forEach((set: any) => {
                    totalSets++;
                    if (set.completed) completedSets++;
                  });
                });

                return (
                  <WorkoutHistoryCard 
                    key={workout.id}
                    workout={workout}
                    exerciseCount={exerciseCount}
                    completedSets={completedSets}
                    totalSets={totalSets}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </FitnessGuard>
  );
}
