import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutHistoryCard } from "@/components/fitness/workout/workout-history-card";
import { WorkoutHistoryExportButton } from "@/components/fitness/workout/workout-history-export-button";
import { redirect } from "next/navigation";

export default async function WorkoutHistoryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin?redirect=/fitness");
  }

  const { data: workouts } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (
        id,
        name,
        fitness_os_sets (completed)
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108]">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="History" 
            backUrl="/fitness"
            avatarUrl={user.user_metadata?.avatar_url}
          />
          
          {/* Export button */}
          {workouts && workouts.length > 0 && (
            <div className="mt-4 mb-6">
              <WorkoutHistoryExportButton />
            </div>
          )}

          <div className="mt-2 space-y-4">
            {(!workouts || workouts.length === 0) ? (
              <div className="bg-[#111A10] border border-white/5 rounded-3xl p-8 text-center mt-10">
                <h3 className="text-lg font-bold text-white mb-2">No completed workouts yet.</h3>
                <p className="text-sm font-medium text-white/50">
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
