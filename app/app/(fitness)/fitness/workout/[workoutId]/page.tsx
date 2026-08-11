import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutExecution } from "@/components/fitness/workout/workout-execution";
import { redirect } from "next/navigation";

export default async function ActiveWorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params;
  
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch full workout data
  const { data: workout, error } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (
        *,
        fitness_os_sets (*)
      ),
      fitness_os_workout_sessions (*)
    `)
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    redirect("/fitness/workout");
  }

  if (workout.user_id !== user.id) {
    redirect("/fitness/workout");
  }

  if (workout.status === "completed") {
    redirect(`/fitness/workout/${workoutId}/summary`);
  }

  // Find active session
  const activeSession = workout.fitness_os_workout_sessions?.find(
    (s: any) => s.status === "active" || s.status === "paused"
  );

  if (!activeSession) {
    // If no active session, they shouldn't be here executing it. Send back to start.
    redirect("/fitness/workout");
  }

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          <WorkoutHeader 
            title={workout.name}
            backUrl="/fitness/workout"
          />
          <WorkoutExecution workout={workout as any} sessionId={activeSession.id} />
        </div>
      </div>
    </FitnessGuard>
  );
}
