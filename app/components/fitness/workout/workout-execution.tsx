"use client";

import { useState } from "react";
import { FullWorkoutData } from "@/types/fitness/workout";
import { ExerciseCard } from "./exercise-card";
import { RestTimer } from "./rest-timer";
import { WorkoutProgress } from "./workout-progress";
import { WorkoutControls } from "./workout-controls";
import { useRouter } from "next/navigation";

interface WorkoutExecutionProps {
  workout: FullWorkoutData;
  sessionId: string;
}

export function WorkoutExecution({ workout, sessionId }: WorkoutExecutionProps) {
  const router = useRouter();
  
  // Flatten sets for progress calculation
  const allSets = workout.fitness_os_exercises.flatMap(e => e.fitness_os_sets);
  const totalSets = allSets.length;
  const completedSets = allSets.filter(s => s.completed).length;

  const [activeRestSeconds, setActiveRestSeconds] = useState<number | null>(null);

  // Determine current active session state (paused vs active)
  const currentSession = workout.fitness_os_workout_sessions.find(s => s.id === sessionId);
  const isPaused = currentSession?.status === "paused";

  const handleSetCompleted = (restSeconds: number) => {
    setActiveRestSeconds(restSeconds);
    // After state update, the component will re-render and we might want to automatically scroll to timer
    // but for now simple display is fine.
  };

  const handleRestComplete = () => {
    setActiveRestSeconds(null);
  };

  const hasIncompleteSets = completedSets < totalSets;

  // If status is completed, redirect to summary
  if (workout.status === "completed") {
    // Actually we shouldn't render this if it's already completed.
    // The server component should have redirected.
  }

  // Sort exercises by order
  const sortedExercises = [...workout.fitness_os_exercises].sort((a, b) => a.exercise_order - b.exercise_order);

  return (
    <div className="pb-32">
      <WorkoutProgress completedSets={completedSets} totalSets={totalSets} />
      
      {activeRestSeconds !== null && (
        <div className="mb-6 sticky top-4 z-30">
          <RestTimer 
            initialSeconds={activeRestSeconds} 
            onComplete={handleRestComplete}
            onSkip={handleRestComplete} 
          />
        </div>
      )}

      <div className={`space-y-6 ${isPaused ? 'opacity-50 pointer-events-none grayscale-[0.5] transition-all' : 'transition-all'}`}>
        {sortedExercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            onSetCompleted={handleSetCompleted}
            isTimerActive={activeRestSeconds !== null}
          />
        ))}
      </div>

      <WorkoutControls 
        sessionId={sessionId} 
        isPaused={isPaused} 
        hasIncompleteSets={hasIncompleteSets} 
      />
    </div>
  );
}
