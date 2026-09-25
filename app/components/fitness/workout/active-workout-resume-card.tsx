"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Loader2, Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { discardWorkoutSessionAction, endWorkoutAction } from "@/app/actions/fitness";
import { clearWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";
import { workoutClientCache } from "@/lib/api/workout-cache";

interface ActiveWorkoutResumeCardProps {
  workoutId: string;
  completedExercises: number;
  totalExercises: number;
  onDiscard?: () => void;
}

export function ActiveWorkoutResumeCard({ 
  workoutId, 
  completedExercises, 
  totalExercises,
  onDiscard,
}: ActiveWorkoutResumeCardProps) {
  const router = useRouter();
  const [isResuming, setIsResuming] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const isBusy = isResuming || isEnding || isDiscarding;
  const isAllDone = totalExercises > 0 && completedExercises >= totalExercises;

  const handleContinue = async () => {
    if (isBusy) return;
    setIsResuming(true);
    try {
      if (!isAllDone && workoutId !== "mock") {
        const response = await fetch("/api/workouts/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutId }),
        });
        const result = await response.json();
        if (!response.ok || !result.session?.id) {
          throw new Error(result.error || "Could not resume workout. Please try again.");
        }
      }
      router.push(isAllDone ? `/workout/${workoutId}/summary` : `/workout/${workoutId}`);
    } catch (e: any) {
      toast.error(e.message || "Could not resume workout. Please try again.");
      setIsResuming(false);
    }
  };

  const handleDiscard = async () => {
    if (isBusy) return;
    setIsDiscarding(true);
    try {
      if (workoutId === "mock") {
        clearWorkoutTimer("mock");
        onDiscard?.();
        toast.success("Workout session discarded.");
        return;
      }

      const res = await discardWorkoutSessionAction({ workoutId });
      if (!res.success) throw new Error(res.error || "Failed to discard workout");

      clearWorkoutTimer(workoutId);

      // Trigger immediate local state reset
      onDiscard?.();

      // Update client cache so any listeners or reloads receive the scheduled status
      const cached = workoutClientCache.get();
      if (cached?.effectiveWorkout?.id === workoutId) {
        const updated = {
          ...cached,
          effectiveWorkout: {
            ...cached.effectiveWorkout,
            status: "scheduled",
            started_at: null,
            completed_at: null,
            duration_minutes: null,
            completedExercises: 0,
            fitness_os_exercises: cached.effectiveWorkout.fitness_os_exercises?.map((exercise: any) => ({
              ...exercise,
              fitness_os_sets: exercise.fitness_os_sets?.map((set: any) => ({
                ...set,
                completed: false,
                actual_reps: null,
                weight_kg: null,
                duration_seconds: null,
                completed_at: null,
              })),
            })),
          }
        };
        workoutClientCache.set(updated);
      }
      workoutClientCache.notifyUpdated();

      toast.success("Workout session discarded.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to discard workout");
    } finally {
      setIsDiscarding(false);
    }
  };

  const handleEndWorkout = async () => {
    if (isBusy) return;
    setIsEnding(true);
    try {
      clearWorkoutTimer(workoutId);
      workoutClientCache.clear();
      workoutClientCache.notifyUpdated();
      const res = await endWorkoutAction({ workoutId });
      if (!res.success) throw new Error(res.error || "Failed to end workout");
      router.push(`/workout/${workoutId}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to end workout");
    } finally {
      setIsEnding(false);
    }
  };

  // Execution is opened only after the user explicitly continues.
  useEffect(() => {
    if (workoutId && workoutId !== "mock" && isAllDone) {
      router.prefetch(`/workout/${workoutId}/summary`);
    }
  }, [workoutId, isAllDone, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#1A2619] border border-[#ADFF00]/30 rounded-2xl p-5 mb-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#ADFF00]" />
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        {isAllDone ? "Workout Completed!" : "Continue workout?"}
      </h3>
      
      <p className="text-sm font-medium text-white/60 mb-6">
        {isAllDone ? (
          <>All <span className="font-bold text-[#ADFF00]">{totalExercises}</span> exercises completed!</>
        ) : (
          <>You have completed <span className="font-bold text-[#ADFF00]">{completedExercises} / {totalExercises}</span> exercises.</>
        )}
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isBusy}
          className={`w-full py-4 bg-[#ADFF00] text-black active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] font-black ${
            isBusy ? "opacity-80 pointer-events-none" : "hover:bg-[#bfff33]"
          }`}
        >
          {isResuming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isAllDone ? "Loading Summary..." : "Resuming..."}
              </span>
            </>
          ) : (
            <>
              {isAllDone ? <Check className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isAllDone ? "View Workout Summary" : "Continue"}
              </span>
            </>
          )}
        </button>

        {!isAllDone && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEndWorkout}
              disabled={isBusy}
              className={`flex-1 py-3.5 bg-[#111A10] border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                isBusy ? "opacity-80 pointer-events-none" : ""
              }`}
            >
              {isEnding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white/70" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Ending...</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">End Workout</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDiscard}
              disabled={isBusy}
              className="px-4 py-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Discard Workout"
            >
              {isDiscarding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">Discard</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
