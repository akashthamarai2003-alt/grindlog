import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutComplete } from "@/components/fitness/workout/workout-complete";
import { redirect } from "next/navigation";

export default async function WorkoutSummaryPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params;
  
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  if (workoutId === "mock") {
    const mockWorkout = {
      id: "mock",
      name: "Upper Body",
      duration_minutes: 48,
    };
    return (
      <FitnessGuard>
        <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-center">
          <WorkoutComplete 
            workout={mockWorkout as any}
            exerciseCount={6}
            completedSets={18}
            totalSets={18}
          />
        </div>
      </FitnessGuard>
    );
  }

  // Fetch full workout data
  const { data: workout, error } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `)
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    redirect("/fitness/workout");
  }

  if (workout.user_id !== user.id) {
    redirect("/fitness/workout");
  }

  // Don't enforce completed status for preview if we are coming from finish button
  // if (workout.status !== "completed") {
  //   redirect(`/fitness/workout/${workoutId}`);
  // }

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
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-center">
        <WorkoutComplete 
          workout={workout as any}
          exerciseCount={exerciseCount}
          completedSets={completedSets}
          totalSets={totalSets}
        />
      </div>
    </FitnessGuard>
  );
}
