"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { WorkoutHeader } from "./workout-header";
import { ExerciseDetail } from "./exercise-detail";
import { WorkoutExecution } from "./workout-execution";
import { FitnessWorkout, FitnessExercise, FitnessSet } from "@/types/fitness/workout";
import { completeExerciseSetsAction } from "@/app/actions/fitness";

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

  // Refs to track state for cleanup without stale closures
  const isPausedRef = useRef(isPaused);
  const isFinishingRef = useRef(isFinishing);
  const autoPausedRef = useRef(false);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isFinishingRef.current = isFinishing; }, [isFinishing]);

  // Auto-resume on mount: When user returns to the workout page and the session was
  // auto-paused (from navigating away), immediately resume it
  useEffect(() => {
    if (initialIsPaused && workout.id !== "mock") {
      // Session was paused (likely from our auto-pause on leave) — resume immediately
      setIsPaused(false);
      const url = `/api/workouts/sessions/${sessionId}/status`;
      fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      }).catch(() => { /* silently handle */ });
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exercises = workout.fitness_os_exercises || [];
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((ex: any) =>
    ex.fitness_os_sets && ex.fitness_os_sets.length > 0 && ex.fitness_os_sets.every((s: any) => s.completed)
  ).length;
  const allExercisesCompleted = totalExercises > 0 && completedExercises === totalExercises;

  // Pause/Resume session in the database (fire-and-forget)
  const updateSessionStatus = useCallback((status: "paused" | "active") => {
    if (workout.id === "mock") return;
    // Use navigator.sendBeacon for reliability on unmount, fall back to fetch
    const url = `/api/workouts/sessions/${sessionId}/status`;
    const body = JSON.stringify({ status });
    
    if (status === "paused" && typeof navigator !== "undefined" && navigator.sendBeacon) {
      // sendBeacon is guaranteed to fire even during page unload
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }
    
    // Fallback to fetch
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true, // ensures request survives page navigation
    }).catch(() => { /* silently handle */ });
  }, [workout.id, sessionId]);

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

  // Automatically finish ONLY when ALL exercises are completed
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
    autoPausedRef.current = false; // manual toggle clears auto-pause flag
    toast.success(nextState ? "Workout paused." : "Workout resumed!");
    updateSessionStatus(nextState ? "paused" : "active");
  };

  // Auto-pause the DB session when user leaves the page (visibilitychange + beforeunload)
  useEffect(() => {
    if (workout.id === "mock") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden → pause session in DB if not already paused
        if (!isPausedRef.current && !isFinishingRef.current) {
          setIsPaused(true);
          autoPausedRef.current = true;
          updateSessionStatus("paused");
        }
      } else {
        // Tab visible again → auto-resume ONLY if it was auto-paused (not manually paused)
        if (autoPausedRef.current && isPausedRef.current && !isFinishingRef.current) {
          setIsPaused(false);
          autoPausedRef.current = false;
          toast.success("Welcome back! Workout resumed.");
          updateSessionStatus("active");
        }
      }
    };

    const handleBeforeUnload = () => {
      // User closing/refreshing the tab → pause session
      if (!isPausedRef.current && !isFinishingRef.current) {
        updateSessionStatus("paused");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [workout.id, updateSessionStatus]);

  // CRITICAL: Auto-pause session in DB when component unmounts (user navigates away within the app)
  // This fires when user clicks the back arrow to go from /workout/[id] → /workout
  useEffect(() => {
    return () => {
      // On unmount: if session is active (not paused, not finishing), pause it in the DB
      if (!isPausedRef.current && !isFinishingRef.current && workout.id !== "mock") {
        updateSessionStatus("paused");
      }
    };
  }, [workout.id, updateSessionStatus]);

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

  const handleCompleteExercise = (exerciseId: string) => {
    const targetEx = workout.fitness_os_exercises?.find((e: any) => e.id === exerciseId);
    setWorkout((prev: any) => {
      if (!prev?.fitness_os_exercises) return prev;
      const updatedExercises = prev.fitness_os_exercises.map((ex: any) => {
        if (ex.id === exerciseId) {
          const sets = ex.fitness_os_sets || [];
          const updatedSets = (sets.length > 0 ? sets : Array.from({ length: ex.target_sets || 3 })).map((s: any, idx: number) => ({
            id: s?.id || `temp-${exerciseId}-${idx}`,
            exercise_id: exerciseId,
            set_number: s?.set_number || idx + 1,
            target_reps: s?.target_reps || 10,
            actual_reps: s?.actual_reps || s?.target_reps || 10,
            weight_kg: s?.weight_kg ?? 0,
            completed: true,
            completed_at: new Date().toISOString()
          }));
          return { ...ex, fitness_os_sets: updatedSets };
        }
        return ex;
      });
      return { ...prev, fitness_os_exercises: updatedExercises };
    });

    toast.success(`${targetEx?.name || "Exercise"} completed!`);

    completeExerciseSetsAction({ exerciseId }).catch((err) => {
      console.error("Failed to persist completeExerciseSetsAction:", err);
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
          onCompleteExercise={handleCompleteExercise}
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
