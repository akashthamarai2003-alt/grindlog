"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, Zap, Circle, CheckCircle2, X, CalendarClock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { reopenWorkoutAction, quickCompleteWorkoutAction } from "@/app/actions/fitness";
import { clearWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";

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
  const [isFinishingDirectly, setIsFinishingDirectly] = useState(false);
  const [showQuickFinishConfirm, setShowQuickFinishConfirm] = useState(false);

  const isCompleted = workout?.status === "completed";
  const exercises = workout?.fitness_os_exercises || [];
  const completedCount = exercises.filter((ex: any) => 
    ex.fitness_os_sets && 
    ex.fitness_os_sets.length > 0 && 
    ex.fitness_os_sets.every((set: any) => set.completed)
  ).length;

  // A workout is ONLY genuinely complete if at least 1 exercise was completed
  const isTrulyCompleted = isCompleted && completedCount > 0;
  const isInProgress = !isTrulyCompleted && (workout?.status === "in_progress" || (completedCount > 0 && completedCount < exerciseCount));

  const resolvedEyebrow = eyebrow || (isUpcoming ? "Early Start" : "Today's Workout");

  useEffect(() => {
    if (workout?.id && workout.id !== "mock") {
      router.prefetch(`/workout/${workout.id}`);
      if (isTrulyCompleted && completedCount === exerciseCount) {
        router.prefetch(`/workout/${workout.id}/summary`);
      }
    }
  }, [workout?.id, isTrulyCompleted, completedCount, exerciseCount, router]);

  const startWorkout = async () => {
    if (isStarting) return;
    setIsStarting(true);

    if (isTrulyCompleted && completedCount === exerciseCount) {
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

  const handleStart = async () => {
    if (isStarting) return;
    if (isTrulyCompleted && completedCount === exerciseCount) {
      router.push(`/workout/${workout.id}/summary`);
      return;
    }

    // If workout was falsely marked completed with 0 sets (or partial sets), reopen it!
    if (workout?.status === "completed") {
      setIsStarting(true);
      try {
        await reopenWorkoutAction({ workoutId: workout.id });
        router.push(`/workout/${workout.id}`);
      } catch {
        router.push(`/workout/${workout.id}`);
      }
      return;
    }

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

  const handleQuickFinish = async () => {
    if (isFinishingDirectly) return;
    setIsFinishingDirectly(true);
    setShowQuickFinishConfirm(false);

    if (workout?.id === "mock") {
      clearWorkoutTimer("mock");
      toast.success("Workout completed!");
      router.push(`/workout/${workout.id}/summary`);
      return;
    }

    try {
      clearWorkoutTimer(workout.id);
      const res = await quickCompleteWorkoutAction({ workoutId: workout.id });
      if (!res.success) {
        throw new Error(res.error || "Failed to finish workout");
      }
      toast.success("Workout completed! Great job today.");
      router.push(`/workout/${workout.id}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to complete workout");
      setIsFinishingDirectly(false);
    }
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

  // Smart TIME estimation from exercise data when duration_minutes is not set
  const rawDuration = workout?.duration_minutes;
  let displayDuration: string | number;
  if (rawDuration && rawDuration >= 2 && rawDuration <= 180) {
    displayDuration = rawDuration;
  } else {
    // Estimate from exercises: ~3.5 min per set (including rest)
    const totalSets = exercises.reduce((sum: number, ex: any) => {
      const sets = ex.fitness_os_sets?.length || ex.target_sets || 3;
      return sum + sets;
    }, 0);
    const estimatedMinutes = totalSets > 0 ? Math.round(totalSets * 3.5) : Math.round(exerciseCount * 10);
    displayDuration = Math.max(15, Math.min(estimatedMinutes, 120));
  }

  // Smart INTENSITY inference when difficulty_level is not set
  const rawIntensity = workout?.difficulty_level;
  let displayIntensity: string;
  if (rawIntensity) {
    displayIntensity = rawIntensity;
  } else {
    const totalSets = exercises.reduce((sum: number, ex: any) => {
      return sum + (ex.fitness_os_sets?.length || ex.target_sets || 3);
    }, 0);
    const workoutName = (workout?.name || "").toLowerCase();
    
    // Infer from workout name or volume
    if (workoutName.includes("hiit") || workoutName.includes("intense") || workoutName.includes("heavy")) {
      displayIntensity = "High";
    } else if (totalSets >= 20 || exerciseCount >= 6) {
      displayIntensity = "High";
    } else if (totalSets >= 12 || exerciseCount >= 4) {
      displayIntensity = "Moderate";
    } else {
      displayIntensity = "Light";
    }
  }

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
              <span className="text-lg font-black text-white">{displayDuration} min</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-sm">💪</span>
                <span className="text-xs font-bold uppercase tracking-wider">Intensity</span>
              </div>
              <span className="text-lg font-black text-white">{displayIntensity}</span>
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
            isTrulyCompleted && completedCount === exerciseCount ? (
              <Link
                href={`/workout/${workout.id}/summary`}
                className="w-full font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] cursor-pointer bg-white/10 text-white hover:bg-white/20"
              >
                <span>VIEW WORKOUT SUMMARY</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="w-full font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-70 cursor-pointer bg-[#ADFF00] text-black hover:bg-[#bfff33] shadow-[0_0_20px_rgba(173,255,0,0.2)]"
                >
                  {isStarting ? (
                    <>
                      <span>{isInProgress ? "RESUMING..." : "STARTING..."}</span>
                      <Loader2 className="w-5 h-5 animate-spin" />
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

                {/* Finish Workout button directly below Start */}
                <button
                  type="button"
                  onClick={() => setShowQuickFinishConfirm(true)}
                  disabled={isStarting || isFinishingDirectly}
                  className="w-full font-black uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-white/10 bg-[#111A10] hover:bg-white/5 text-white/80 hover:text-white"
                >
                  {isFinishingDirectly ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#ADFF00]" />
                      <span className="text-xs font-black text-[#ADFF00]">COMPLETING...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#ADFF00]" />
                      <span className="text-xs font-black tracking-widest">FINISH WORKOUT</span>
                    </>
                  )}
                </button>

                {isTrulyCompleted && completedCount < exerciseCount && (
                  <Link
                    href={`/workout/${workout.id}/summary`}
                    className="w-full text-center text-xs font-bold text-white/50 hover:text-white py-1 uppercase tracking-wider transition-colors"
                  >
                    View Incomplete Summary
                  </Link>
                )}
              </div>
            )
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

      {showQuickFinishConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-finish-dialog-title"
            className="w-full max-w-sm rounded-3xl border border-[#ADFF00]/25 bg-[#111A10] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ADFF00]/10 text-[#ADFF00]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">Finish Workout</p>
                  <h3 id="quick-finish-dialog-title" className="mt-1 text-lg font-black text-white">Mark as Finished?</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickFinishConfirm(false)}
                className="rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Close confirmation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Already completed this workout offline? This will mark all <span className="font-bold text-white">{exerciseCount} exercises</span> in <span className="font-bold text-[#ADFF00]">{workout?.name || "today's workout"}</span> as completed, count toward your streak, and save your workout summary.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowQuickFinishConfirm(false)}
                className="rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-white/70 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleQuickFinish}
                disabled={isFinishingDirectly}
                className="rounded-xl bg-[#ADFF00] py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(173,255,0,0.3)] hover:bg-[#bfff33] cursor-pointer flex items-center justify-center gap-1.5 font-black"
              >
                {isFinishingDirectly ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Finishing...</span>
                  </>
                ) : (
                  <span>Yes, Finish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
