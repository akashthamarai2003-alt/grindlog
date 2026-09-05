"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  initialCoachNote?: string | null;
}

export function WorkoutSessionManager({
  workout: initialWorkout,
  sessionId,
  startedAt,
  isPaused: initialIsPaused = false,
  avatarUrl,
  showAiCoach = false,
  isEarlyStart = false,
  scheduledDateLabel,
  initialExerciseId = null,
  initialCoachNote = null,
}: WorkoutSessionManagerProps) {
  const router = useRouter();
  const [workout, setWorkout] = useState(initialWorkout);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(initialExerciseId);
  const [isPaused, setIsPaused] = useState<boolean>(initialIsPaused || false);
  const [isFinishing, setIsFinishing] = useState(false);

  const exercises = workout.fitness_os_exercises || [];
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((ex: any) =>
    ex.fitness_os_sets && ex.fitness_os_sets.length > 0 && ex.fitness_os_sets.every((s: any) => s.completed)
  ).length;
  const allExercisesCompleted = totalExercises > 0 && completedExercises === totalExercises;

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    toast.success("All exercises completed! Finishing workout...");

    if (workout.id === "mock") {
      router.push(`/workout/${workout.id}/summary`);
      return;
    }

    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/complete`, {
        method: "PATCH"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finish workout");
      }
      router.push(`/workout/${workout.id}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to finish workout");
      setIsFinishing(false);
    }
  };

  // Automatically finish when all exercises are completed
  useEffect(() => {
    if (allExercisesCompleted && !isFinishing) {
      const delay = activeExerciseId ? 900 : 400;
      const timer = setTimeout(() => {
        handleFinish();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [allExercisesCompleted, isFinishing, activeExerciseId]);

  const handleTogglePause = async () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    toast.success(nextState ? "Workout paused." : "Workout resumed!");

    if (workout.id === "mock") return;

    try {
      await fetch(`/api/workouts/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextState ? "paused" : "active" })
      });
    } catch {
      setIsPaused(!nextState);
      toast.error("Failed to update status");
    }
  };

  const activeExercise = activeExerciseId
    ? workout.fitness_os_exercises?.find((e: any) => e.id === activeExerciseId) || null
    : null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [activeExerciseId]);

  const handleSelectExercise = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/workout/${workout.id}?exercise=${exerciseId}`);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  const handleBackToOverview = () => {
    setActiveExerciseId(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/workout/${workout.id}`);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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

  const currentIndex = exercises.findIndex((e: any) => e.id === activeExerciseId);
  const nextExercise = currentIndex >= 0 && currentIndex < exercises.length - 1
    ? { id: exercises[currentIndex + 1].id, name: exercises[currentIndex + 1].name }
    : null;

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
          nextExercise={nextExercise}
          onNextExercise={handleSelectExercise}
        />
      ) : (
        <WorkoutExecution
          workout={workout as any}
          sessionId={sessionId}
          showAiCoach={showAiCoach}
          isEarlyStart={isEarlyStart}
          onSelectExercise={handleSelectExercise}
          initialCoachNote={initialCoachNote}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          isFinishing={isFinishing}
          onFinish={handleFinish}
        />
      )}
    </>
  );
}
