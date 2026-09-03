import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutSessionManager } from "@/components/fitness/workout/workout-session-manager";
import { redirect } from "next/navigation";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export default async function ActiveWorkoutPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ workoutId: string }>,
  searchParams: Promise<{ exercise?: string }>
}) {
  const { workoutId } = await params;
  const { exercise: activeExerciseId } = await searchParams;
  
  const { data: { user } } = await getCachedUser();
  
  if (!user) {
    redirect(`/auth/signin?redirect=${encodeURIComponent(`/workout/${workoutId}`)}`);
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
      fitness_os_workout_sessions: [{ id: "mock-session", status: "active", started_at: new Date().toISOString() }]
    };

    return (
      <FitnessGuard>
        <div className="min-h-screen bg-[#0A1108] text-white">
          <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
            <WorkoutSessionManager
              workout={mockWorkout as any}
              sessionId="mock-session"
              startedAt={mockWorkout.fitness_os_workout_sessions[0].started_at}
              isPaused={false}
              avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              showAiCoach={false}
              isEarlyStart={false}
              initialExerciseId={activeExerciseId}
            />
          </div>
        </div>
      </FitnessGuard>
    );
  }

  const supabase = await createServerSupabase();

  // Run independent database and plan fetches in parallel
  const [
    { data: workout, error },
    { data: profile },
    subscriptionPlan
  ] = await Promise.all([
    supabase
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
      .single(),
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    getFitnessPlan(user.id)
  ]);

  if (error || !workout) {
    redirect("/workout");
  }

  if (workout.user_id !== user.id) {
    redirect("/workout");
  }

  if (workout.status === "completed") {
    redirect(`/workout/${workoutId}/summary`);
  }

  // Find active session
  const activeSession = workout.fitness_os_workout_sessions?.find(
    (s: any) => s.status === "active" || s.status === "paused"
  );

  if (!activeSession) {
    redirect("/workout");
  }

  const timezone = profile?.timezone || "UTC";
  const todayInTimezone = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const isEarlyStart = typeof workout.workout_date === "string" && workout.workout_date > todayInTimezone;
  const scheduledDateLabel = typeof workout.workout_date === "string"
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(`${workout.workout_date}T12:00:00Z`))
    : undefined;

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          <WorkoutSessionManager
            workout={workout as any}
            sessionId={activeSession.id}
            startedAt={activeSession.started_at}
            isPaused={activeSession.status === "paused"}
            avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
            showAiCoach={subscriptionPlan?.id === "pro"}
            isEarlyStart={isEarlyStart}
            scheduledDateLabel={scheduledDateLabel}
            initialExerciseId={activeExerciseId}
          />
        </div>
      </div>
    </FitnessGuard>
  );
}
