"use client";

import { useState } from "react";
import { WorkoutHeader } from "./workout-header";
import { ExerciseDetail } from "./exercise-detail";
import { WorkoutExecution } from "./workout-execution";
import { FitnessWorkout, FitnessExercise, FitnessSet } from "@/types/fitness/workout";

interface WorkoutSessionManagerProps {
  workout: FitnessWorkout & {
    fitness_os_exercises: (FitnessExercise & { fitness_os_sets: FitnessSet[] })[];
  };
  sessionId: string;
  startedAt?: string | null;
  isPaused?: boolean;
  avatarUrl?: string | null;
  showAiCoach?: boolean;
  isEarlyStart?: boolean;
  scheduledDateLabel?: string;
  initialExerciseId?: string | null;
}

export function WorkoutSessionManager({
  workout: initialWorkout,
  sessionId,
  startedAt,
  isPaused,
  avatarUrl,
  showAiCoach = false,
  isEarlyStart = false,
  scheduledDateLabel,
  initialExerciseId = null,
}: WorkoutSessionManagerProps) {
  const [workout, setWorkout] = useState(initialWorkout);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(initialExerciseId);

  const activeExercise = activeExerciseId
    ? workout.fitness_os_exercises?.find((e: any) => e.id === activeExerciseId) || null
    : null;

  const handleSelectExercise = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/workout/${workout.id}?exercise=${exerciseId}`);
    }
  };

  const handleBackToOverview = () => {
    setActiveExerciseId(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/workout/${workout.id}`);
    }
  };

  const handleSetCompleted = (setId: string, reps: number, weightKg: number) => {
    setWorkout((prev: any) => {
      if (!prev?.fitness_os_exercises) return prev;
      const updatedExercises = prev.fitness_os_exercises.map((ex: any) => {
        if (!ex?.fitness_os_sets) return ex;
        const updatedSets = ex.fitness_os_sets.map((s: any) => {
          if (s.id === setId) {
            return { ...s, reps, weight_kg: weightKg, completed: true };
          }
          return s;
        });
        return { ...ex, fitness_os_sets: updatedSets };
      });
      return { ...prev, fitness_os_exercises: updatedExercises };
    });
  };

  return (
    <>
      {!activeExercise && (
        <WorkoutHeader
          title={workout.name}
          dateStr={isEarlyStart ? `Scheduled ${scheduledDateLabel} • Started early` : undefined}
          backUrl="/workout"
          avatarUrl={avatarUrl}
          startedAt={startedAt}
          isPaused={isPaused}
          workoutId={workout.id}
        />
      )}

      {activeExercise ? (
        <ExerciseDetail
          exercise={activeExercise as any}
          workoutId={workout.id}
          sessionId={sessionId}
          startedAt={startedAt}
          isPaused={isPaused}
          onBack={handleBackToOverview}
          onSetCompleted={handleSetCompleted}
        />
      ) : (
        <WorkoutExecution
          workout={workout as any}
          sessionId={sessionId}
          showAiCoach={showAiCoach}
          isEarlyStart={isEarlyStart}
          onSelectExercise={handleSelectExercise}
        />
      )}
    </>
  );
}
