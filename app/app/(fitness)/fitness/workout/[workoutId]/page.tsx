import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { WorkoutExecution } from "@/components/fitness/workout/workout-execution";
import { ExerciseDetail } from "@/components/fitness/workout/exercise-detail";
import { redirect } from "next/navigation";

export default async function ActiveWorkoutPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ workoutId: string }>,
  searchParams: Promise<{ exercise?: string }>
}) {
  const { workoutId } = await params;
  const { exercise: activeExerciseId } = await searchParams;
  
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  if (workoutId === "mock") {
    const mockWorkout = {
      id: "mock",
      name: "Upper Body",
      user_id: user.id,
      status: "in_progress",
      fitness_os_exercises: [
        {
          id: '1', name: "Bench Press", target_muscles: ["Chest"], target_sets: 3, target_reps: "8–10", rest_seconds: 90,
          fitness_os_sets: [
            { id: 's1', set_number: 1, target_reps: 10, weight_kg: 60, completed: false },
            { id: 's2', set_number: 2, target_reps: 10, weight_kg: 60, completed: false },
            { id: 's3', set_number: 3, target_reps: 8, weight_kg: 60, completed: false }
          ]
        },
        {
          id: '2', name: "Incline Dumbbell Press", target_muscles: ["Upper Chest"], target_sets: 3, target_reps: "10-12", rest_seconds: 90,
          fitness_os_sets: [
            { id: 's4', set_number: 1, target_reps: 12, weight_kg: 16, completed: false },
            { id: 's5', set_number: 2, target_reps: 10, weight_kg: 16, completed: false },
            { id: 's6', set_number: 3, target_reps: 10, weight_kg: 16, completed: false }
          ]
        }
      ],
      fitness_os_workout_sessions: [{ id: "mock-session", status: "active" }]
    };

    const activeExercise = activeExerciseId 
      ? mockWorkout.fitness_os_exercises.find((e: any) => e.id === activeExerciseId)
      : null;

    return (
      <FitnessGuard>
        <div className="min-h-screen bg-[#0A1108] text-white">
          <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
            {!activeExercise && (
              <WorkoutHeader 
                title={mockWorkout.name}
                backUrl="/fitness/workout"
                startedAt={new Date().toISOString()}
                isPaused={false}
                workoutId={mockWorkout.id}
              />
            )}
            
            {activeExercise ? (
              <ExerciseDetail 
                exercise={activeExercise as any} 
                workoutId={mockWorkout.id} 
                sessionId="mock-session"
                startedAt={new Date().toISOString()}
                isPaused={false}
              />
            ) : (
              <WorkoutExecution workout={mockWorkout as any} sessionId="mock-session" />
            )}
          </div>
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

  // Find active exercise if specified
  const activeExercise = activeExerciseId 
    ? workout.fitness_os_exercises.find((e: any) => e.id === activeExerciseId)
    : null;

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          {!activeExercise && (
            <WorkoutHeader 
              title={workout.name}
              backUrl="/fitness/workout"
              avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              startedAt={activeSession.started_at}
              isPaused={activeSession.status === "paused"}
              workoutId={workout.id}
            />
          )}
          
          {activeExercise ? (
            <ExerciseDetail 
              exercise={activeExercise} 
              workoutId={workout.id} 
              sessionId={activeSession.id}
              startedAt={activeSession.started_at}
              isPaused={activeSession.status === "paused"}
            />
          ) : (
            <WorkoutExecution workout={workout as any} sessionId={activeSession.id} />
          )}
        </div>
      </div>
    </FitnessGuard>
  );
}
