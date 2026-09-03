"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWakeLock } from "@/hooks/fitness/useWakeLock";

import { TodaysExercisesList } from "./todays-exercises-list";
import { AiCoachNote } from "./ai-coach-note";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { Pause, Play, CheckCircle, Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FitnessWorkout, FitnessExercise, FitnessSet } from "@/types/fitness/workout";

interface WorkoutExecutionProps {
  workout: FitnessWorkout & {
    fitness_os_exercises: (FitnessExercise & { fitness_os_sets: FitnessSet[] })[];
  };
  sessionId: string;
  showAiCoach?: boolean;
  isEarlyStart?: boolean;
  onSelectExercise?: (exerciseId: string) => void;
  initialCoachNote?: string | null;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export function WorkoutExecution({
  workout,
  sessionId,
  showAiCoach = false,
  isEarlyStart = false,
  onSelectExercise,
  initialCoachNote,
  isPaused: externalIsPaused,
  onTogglePause,
}: WorkoutExecutionProps) {
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  
  const currentSession = (workout as any).fitness_os_workout_sessions?.find((s: any) => s.id === sessionId);
  const [localIsPaused, setLocalIsPaused] = useState(currentSession?.status === "paused");

  const isPaused = externalIsPaused !== undefined ? externalIsPaused : localIsPaused;

  // Keep screen awake during workout — released automatically on unmount
  useWakeLock(!isPaused);

  // Prefetch workout summary route for instant transition on finish
  useEffect(() => {
    if (workout?.id && workout.id !== "mock") {
      router.prefetch(`/workout/${workout.id}/summary`);
    }
  }, [workout?.id, router]);

  // Compute completed exercises status
  const exercises = workout.fitness_os_exercises || [];
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((ex: any) =>
    ex.fitness_os_sets && ex.fitness_os_sets.length > 0 && ex.fitness_os_sets.every((s: any) => s.completed)
  ).length;
  const allExercisesCompleted = totalExercises > 0 && completedExercises === totalExercises;
  const nextIncompleteExercise = exercises.find((ex: any) =>
    !ex.fitness_os_sets || ex.fitness_os_sets.length === 0 || !ex.fitness_os_sets.every((s: any) => s.completed)
  );

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setShowEarlyFinishModal(false);
    
    // If it's a mock workout, skip real API call
    if (workout.id === "mock") {
      router.push(`/workout/${workout.id}/summary`);
      return;
    }

    try {
      // Optimistic navigation
      router.push(`/workout/${workout.id}/summary`);

      const res = await fetch(`/api/workouts/sessions/${sessionId}/complete`, {
        method: "PATCH"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finish workout");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to finish workout");
      setIsFinishing(false);
    }
  };

  const handlePauseToggle = async () => {
    if (onTogglePause) {
      onTogglePause();
      return;
    }

    const nextState = !isPaused;
    setLocalIsPaused(nextState);
    toast.success(nextState ? "Workout paused." : "Workout resumed!");

    if (workout.id === "mock") return;

    try {
      await fetch(`/api/workouts/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextState ? "paused" : "active" })
      });
    } catch {
      setLocalIsPaused(!nextState);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-32">
      <div className="mt-2">
        <WorkoutSummaryCard 
          workout={workout as any} 
          exerciseCount={workout.fitness_os_exercises?.length || 6} 
          hideStartButton={true}
          eyebrow={isEarlyStart ? "Early Start" : undefined}
        />
        {showAiCoach && <AiCoachNote workoutId={workout.id} isEarlyStart={isEarlyStart} initialNote={initialCoachNote} />}
        <TodaysExercisesList
          workoutId={workout.id}
          exercises={workout.fitness_os_exercises as any}
          sectionLabel={isEarlyStart ? "Early Start Exercises" : undefined}
          onSelectExercise={onSelectExercise}
          isPaused={isPaused}
        />
      </div>

      <div className="w-full h-px bg-white/10 my-8" />

      <div className="flex flex-col gap-3 px-2">
        {/* Pause / Resume button — Instant 0ms toggle */}
        <button 
          onClick={handlePauseToggle}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
            isPaused
              ? "bg-[#ADFF00]/10 border border-[#ADFF00]/30 hover:bg-[#ADFF00]/20"
              : "bg-[#111A10] border border-white/10 hover:bg-white/5"
          }`}
        >
          {isPaused ? (
            <Play className="w-4 h-4 text-[#ADFF00] fill-current" />
          ) : (
            <Pause className="w-4 h-4 text-white/50" />
          )}
          <span className={`text-xs font-black uppercase tracking-widest ${isPaused ? "text-[#ADFF00]" : "text-white/70"}`}>
            {isPaused ? "Resume Workout" : "Pause Workout"}
          </span>
        </button>

        {/* Next exercise shortcut if not all exercises complete */}
        {!allExercisesCompleted && nextIncompleteExercise && (
          <button
            onClick={() => {
              if (isPaused) {
                toast.info("Workout is paused. Tap 'Resume Workout' above to continue.");
                return;
              }
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }
              if (onSelectExercise) onSelectExercise(nextIncompleteExercise.id);
            }}
            disabled={isPaused}
            className={`w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.25)] active:scale-[0.98] transition-all cursor-pointer ${
              isPaused ? "opacity-50 cursor-not-allowed" : "hover:bg-[#b8ff1a]"
            }`}
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">Next: {nextIncompleteExercise.name}</span>
          </button>
        )}

        {/* Finish Workout button — enabled ONLY when all exercises completed */}
        {allExercisesCompleted ? (
          <button 
            onClick={handleFinish}
            disabled={isFinishing}
            className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)] cursor-pointer hover:bg-[#b8ff1a]"
          >
            {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span className="text-xs font-black">{isFinishing ? "Finishing..." : "Finish Workout"}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowEarlyFinishModal(true)}
            className="w-full py-3 text-white/40 hover:text-white/80 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>End Workout Early ({completedExercises}/{totalExercises} Completed)</span>
          </button>
        )}
      </div>

      {/* Early Finish Confirmation Modal */}
      <AnimatePresence>
        {showEarlyFinishModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEarlyFinishModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0A1108] border-t border-white/10 sm:border sm:rounded-[24px] rounded-t-[32px] p-6 shadow-2xl z-10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    End Workout Early?
                  </h3>
                </div>
                <button
                  onClick={() => setShowEarlyFinishModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                You still have <strong className="text-white">{totalExercises - completedExercises} exercise{totalExercises - completedExercises > 1 ? "s" : ""}</strong> remaining. All <strong className="text-[#ADFF00]">{completedExercises} completed exercise{completedExercises > 1 ? "s" : ""}</strong> will be logged and saved to your history.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowEarlyFinishModal(false)}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a]"
                >
                  Keep Training
                </button>

                <button
                  onClick={handleFinish}
                  disabled={isFinishing}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isFinishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Finish Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
