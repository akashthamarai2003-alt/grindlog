"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, Zap, Circle, CheckCircle2, X, CalendarClock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WorkoutSummaryCardProps {
  workout: any;
  exerciseCount: number;
  hideStartButton?: boolean;
  eyebrow?: string;
  scheduledLabel?: string;
  isUpcoming?: boolean;
}

export function WorkoutSummaryCard({
  workout,
  exerciseCount,
  hideStartButton = false,
  eyebrow,
  scheduledLabel,
  isUpcoming = false
}: WorkoutSummaryCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [showEarlyStartConfirm, setShowEarlyStartConfirm] = useState(false);

  const isCompleted = workout?.status === "completed";
  const exercises = workout?.fitness_os_exercises || [];
  const completedCount = exercises.filter((ex: any) => 
    ex.fitness_os_sets && 
    ex.fitness_os_sets.length > 0 && 
    ex.fitness_os_sets.every((set: any) => set.completed)
  ).length;
  const isInProgress = workout?.status === "in_progress" || completedCount > 0;

  const resolvedEyebrow = eyebrow || (isUpcoming ? "Early Start" : "Today's Workout");

  useEffect(() => {
    if (workout?.id && workout.id !== "mock") {
      router.prefetch(`/workout/${workout.id}`);
      if (isCompleted) {
        router.prefetch(`/workout/${workout.id}/summary`);
      }
    }
  }, [workout?.id, isCompleted, router]);

  const startWorkout = async () => {
    if (isStarting) return;
    setIsStarting(true);

    if (isCompleted) {
      router.push(`/workout/${workout.id}/summary`);
      return;
    }

    // Instant 0ms navigation if session is already active or in progress
    if (isInProgress || workout.id === "mock") {
      router.push(`/workout/${workout.id}`);
      return;
    }

    // Immediate optimistic navigation
    router.push(`/workout/${workout.id}`);

    // Create session in parallel
    try {
      await fetch("/api/workouts/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: workout.id, allowEarlyStart: isUpcoming })
      });
    } catch (e: any) {
      console.warn("Session initiation background notice:", e);
    }
  };

  const handleStart = () => {
    if (isStarting) return;
    if (isInProgress) {
      setIsStarting(true);
      router.push(`/workout/${workout.id}`);
      return;
    }
    if (isUpcoming) {
      setShowEarlyStartConfirm(true);
      return;
    }
    void startWorkout();
  };

  // Extract target muscles from plan_data if available, otherwise infer from name
  let targetMuscles = workout?.plan_data?.target_muscles;
  
  if (!targetMuscles || targetMuscles.length === 0) {
    targetMuscles = [];
    const workoutName = (workout?.name || "").toLowerCase();
    const allMuscles = ["Chest", "Back", "Shoulders", "Arms", "Biceps", "Triceps", "Legs", "Core", "Glutes", "Quads", "Hamstrings", "Calves", "Full Body"];
    
    allMuscles.forEach(muscle => {
      if (workoutName.includes(muscle.toLowerCase())) {
        targetMuscles.push(muscle);
      }
    });

    if (targetMuscles.length === 0) {
      targetMuscles = ["Full Body"];
    }
  }

  const muscleString = targetMuscles.join(" • ");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-6"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A2619] to-transparent rounded-[24px]" />
        
        <div className="relative bg-[#0A1108] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col gap-6">
          
          {/* Title & Muscle Groups */}
          <div>
            <h2 className="text-[11px] font-black tracking-[0.2em] text-[#ADFF00] uppercase mb-2">
              {resolvedEyebrow}
            </h2>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">
              {workout?.name || "Upper Body"}
            </h3>
            <p className="text-sm font-semibold text-white/50 tracking-wide uppercase">
              {muscleString}
            </p>
            {scheduledLabel && (
              <p className="mt-2 text-xs font-bold text-[#ADFF00]">Scheduled for {scheduledLabel}</p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold uppercase tracking-wider">Exercises</span>
              </div>
              <span className="text-lg font-black text-white">{exerciseCount}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-sm">⏱</span>
                <span className="text-xs font-bold uppercase tracking-wider">Time</span>
              </div>
              <span className="text-lg font-black text-white">{workout?.duration_minutes ? `${workout.duration_minutes} min` : "Not set"}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-sm">💪</span>
                <span className="text-xs font-bold uppercase tracking-wider">Intensity</span>
              </div>
              <span className="text-lg font-black text-white">{workout?.difficulty_level || "Not set"}</span>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-white/50 tracking-[0.1em] uppercase">Progress</span>
              <span className="text-[11px] font-black text-white uppercase">{completedCount} / {exerciseCount} Exercises</span>
            </div>
            
            <div className="flex items-center justify-between gap-1 w-full">
              {Array.from({ length: Math.max(exerciseCount, 1) }).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 h-1.5 rounded-full ${i < completedCount ? 'bg-[#ADFF00] shadow-[0_0_8px_rgba(173,255,0,0.5)]' : 'bg-white/10'}`} 
                />
              ))}
            </div>
          </div>

          {/* Action Button */}
          {!hideStartButton && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className={`w-full font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-70 cursor-pointer ${
                isCompleted 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-[#ADFF00] text-black hover:bg-[#bfff33] shadow-[0_0_20px_rgba(173,255,0,0.2)]'
              }`}
            >
              {isStarting ? (
                <>
                  <span>{isInProgress ? "RESUMING..." : "STARTING..."}</span>
                  <Loader2 className="w-5 h-5 animate-spin" />
                </>
              ) : isCompleted ? (
                <>
                  <span>VIEW WORKOUT SUMMARY</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : isInProgress ? (
                <>
                  <span>CONTINUE WORKOUT</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : isUpcoming ? (
                <>
                  <span>START EARLY</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>START WORKOUT</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}

        </div>
      </motion.div>

      {showEarlyStartConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="early-start-dialog-title"
            className="w-full max-w-sm rounded-3xl border border-[#ADFF00]/25 bg-[#111A10] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ADFF00]/10 text-[#ADFF00]">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">Early start</p>
                  <h3 id="early-start-dialog-title" className="mt-1 text-lg font-black text-white">Start this workout now?</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEarlyStartConfirm(false)}
                className="rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              This session is scheduled for <span className="font-bold text-white">{scheduledLabel || "a future date"}</span>. Starting early will record this workout as completed today and keep your upcoming plan progression in sync.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowEarlyStartConfirm(false)}
                className="rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEarlyStartConfirm(false);
                  void startWorkout();
                }}
                className="rounded-xl bg-[#ADFF00] py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(173,255,0,0.3)] hover:bg-[#bfff33]"
              >
                Start now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
