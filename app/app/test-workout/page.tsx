import { WorkoutView } from "@/components/fitness/workout/workout-view";
import { WorkoutSessionManager } from "@/components/fitness/workout/workout-session-manager";
import { WorkoutComplete } from "@/components/fitness/workout/workout-complete";
import {
  mockFreeWorkoutPageData,
  mockProScheduledWorkoutPageData,
  mockProInProgressWorkoutPageData,
  mockRestDayWorkoutPageData,
  mockExecutionWorkout,
} from "./mock-data";

export const dynamic = "force-dynamic";

export default async function TestWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; exercise?: string }>;
}) {
  const { view = "pro", exercise } = await searchParams;

  if (view === "execution") {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          <WorkoutSessionManager
            workout={mockExecutionWorkout as any}
            sessionId="session-test-1"
            startedAt={mockExecutionWorkout.fitness_os_workout_sessions[0].started_at}
            isPaused={false}
            avatarUrl={null}
            showAiCoach={true}
            isEarlyStart={false}
            initialExerciseId={exercise || null}
          />
        </div>
      </div>
    );
  }

  if (view === "summary") {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-center">
        <WorkoutComplete
          workout={mockExecutionWorkout as any}
          exerciseCount={2}
          completedExercises={2}
          completedSets={4}
          totalSets={4}
          actualVolume={1560}
          actualCalories={310}
          actualDuration={42}
          recordsBroken={2}
          exerciseNames={["Bench Press", "Incline Dumbbell Press"]}
          sessionId="session-test-1"
          userName="Test Lifter"
          initialFeedback={undefined}
        />
      </div>
    );
  }

  const initialData =
    view === "free"
      ? mockFreeWorkoutPageData
      : view === "in_progress"
      ? mockProInProgressWorkoutPageData
      : view === "rest_day"
      ? mockRestDayWorkoutPageData
      : mockProScheduledWorkoutPageData;

  return (
    <div data-testid="workout-page-root">
      <WorkoutView initialData={initialData} />
    </div>
  );
}
