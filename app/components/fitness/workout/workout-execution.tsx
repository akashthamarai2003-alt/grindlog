"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWakeLock } from "@/hooks/fitness/useWakeLock";

import { TodaysExercisesList } from "./todays-exercises-list";
import { AiCoachNote } from "./ai-coach-note";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { Pause, Play, CheckCircle, Loader2, AlertTriangle, X, Trash2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FitnessWorkout, FitnessExercise, FitnessSet } from "@/types/fitness/workout";
import { discardWorkoutSessionAction } from "@/app/actions/fitness";
import { clearWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";
import { workoutClientCache } from "@/lib/api/workout-cache";

interface WorkoutExecutionProps {
  workout: FitnessWorkout & {
    fitness_os_exercises: (FitnessExercise & { fitness_os_sets: FitnessSet[] })[];
  };
  sessionId: string;
  showAiCoach?: boolean;
  isEarlyStart?: boolean;
  onSelectExercise?: (exerciseId: string) => void;
  onCompleteExercise?: (exerciseId: string) => void;
  initialCoachNote?: string | null;
  isPaused?: boolean;
  onTogglePause?: () => void;
  isFinishing?: boolean;
  onFinish?: () => void;
  onResetTimer?: () => void;
}

export function WorkoutExecution({
  workout,
  sessionId,
  showAiCoach = false,
  isEarlyStart = false,
  onSelectExercise,
  onCompleteExercise,
  initialCoachNote,
  isPaused: externalIsPaused,
  onTogglePause,
  isFinishing: externalIsFinishing,
  onFinish,
  onResetTimer,
}: WorkoutExecutionProps) {
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [showEarlyFinishModal, setShowEarlyFinishModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showResetTimerModal, setShowResetTimerModal] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  
  const effectiveIsFinishing = externalIsFinishing !== undefined ? externalIsFinishing : isFinishing;
  const currentSession = (workout as any).fitness_os_workout_sessions?.find((s: any) => s.id === sessionId);
  const [localIsPaused, setLocalIsPaused] = useState(currentSession?.status === "paused");

  const isPaused = externalIsPaused !== undefined ? externalIsPaused : localIsPaused;

  // Keep screen awake during workout — released automatically on unmount
  useWakeLock(!isPaused);

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
    if (effectiveIsFinishing) return;
    setIsFinishing(true);
    setShowEarlyFinishModal(false);
    toast.success("Finishing workout...");
    
    // If it's a mock workout, skip real API call
    if (workout.id === "mock") {
      clearWorkoutTimer("mock");
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
      clearWorkoutTimer(workout.id);
      router.push(`/workout/${workout.id}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to finish workout");
      setIsFinishing(false);
    }
  };

  const handleDiscard = async () => {
    if (isDiscarding) return;
    setIsDiscarding(true);

    if (workout.id === "mock") {
      clearWorkoutTimer("mock");
      toast.success("Workout session discarded.");
      router.push("/workout");
      return;
    }

    try {
      const res = await discardWorkoutSessionAction({ workoutId: workout.id, sessionId });
      if (!res.success) {
        throw new Error(res.error || "Failed to discard workout");
      }
      clearWorkoutTimer(workout.id);
      workoutClientCache.clear();
      workoutClientCache.notifyUpdated();
      toast.success("Workout session discarded.");
      router.push("/workout");
    } catch (e: any) {
      toast.error(e.message || "Failed to discard workout");
      setIsDiscarding(false);
    }
  };

  const triggerFinish = onFinish || handleFinish;

  // Prompt user with finish confirmation modal when all exercises are completed
  useEffect(() => {
    if (allExercisesCompleted && !effectiveIsFinishing) {
      setShowFinishModal(true);
    }
  }, [allExercisesCompleted, effectiveIsFinishing]);

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
          onCompleteExercise={onCompleteExercise}
          isPaused={isPaused}
        />
      </div>

      {/* Auto-complete & auto-pause info */}
      {!allExercisesCompleted && (
        <div className="mt-4 mx-1 px-4 py-3 bg-[#111A10] border border-white/5 rounded-xl">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider leading-relaxed">
            ✓ Automatically completes when all exercises are done
          </p>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider leading-relaxed mt-1">
            ⏸ Timer auto-pauses when you leave this page
          </p>
        </div>
      )}

      <div className="w-full h-px bg-white/10 my-8" />

      <div className="flex flex-col gap-3 px-2">
        {/* Pause / Resume + Reset Timer Action Row */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePauseToggle}
            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
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

          {onResetTimer && (
            <button
              onClick={() => setShowResetTimerModal(true)}
              title="Reset timer to 00:00"
              className="py-4 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer bg-[#111A10] border border-white/10 hover:bg-white/5 text-white/50 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

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
            onClick={() => setShowFinishModal(true)}
            disabled={effectiveIsFinishing}
            className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)] cursor-pointer hover:bg-[#b8ff1a]"
          >
            {effectiveIsFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span className="text-xs font-black">{effectiveIsFinishing ? "Finishing..." : "Finish Workout"}</span>
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setShowEarlyFinishModal(true)}
              className="w-full py-3 text-white/40 hover:text-white/80 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span>End Workout Early ({completedExercises}/{totalExercises} Completed)</span>
            </button>
            <button
              onClick={() => setShowDiscardModal(true)}
              className="w-full py-2 text-rose-400/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard Workout Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Finish Workout Confirmation Modal */}
      <AnimatePresence>
        {showFinishModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !effectiveIsFinishing && setShowFinishModal(false)}
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
                  <div className="w-9 h-9 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#ADFF00]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest">
                      Workout Complete
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Finish This Workout?
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => !effectiveIsFinishing && setShowFinishModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                All <strong className="text-[#ADFF00]">{totalExercises} exercises</strong> are completed! Do you want to finish this workout and save your session to your workout summary?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowFinishModal(false);
                    triggerFinish();
                  }}
                  disabled={effectiveIsFinishing}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)]"
                >
                  {effectiveIsFinishing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-black" />
                  )}
                  <span>{effectiveIsFinishing ? "Finishing..." : "Yes, Finish Workout"}</span>
                </button>

                <button
                  onClick={() => setShowFinishModal(false)}
                  disabled={effectiveIsFinishing}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Keep Reviewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <button
                  onClick={() => {
                    setShowEarlyFinishModal(false);
                    setShowDiscardModal(true);
                  }}
                  className="w-full py-2 text-rose-400/50 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Discard Workout Completely</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discard Workout Confirmation Modal */}
      <AnimatePresence>
        {showDiscardModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDiscarding && setShowDiscardModal(false)}
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
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Discard Workout?
                  </h3>
                </div>
                <button
                  onClick={() => !isDiscarding && setShowDiscardModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Are you sure you want to discard this workout session? Your active timer will be reset, no sets will be recorded, and the workout will return to scheduled.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowDiscardModal(false)}
                  disabled={isDiscarding}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a] disabled:opacity-50"
                >
                  Keep Training
                </button>

                <button
                  onClick={handleDiscard}
                  disabled={isDiscarding}
                  className="w-full py-3.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDiscarding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDiscarding ? "Discarding..." : "Yes, Discard Workout"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Timer Confirmation Modal */}
      <AnimatePresence>
        {showResetTimerModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetTimerModal(false)}
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
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-[#ADFF00]" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Reset Workout Timer?
                  </h3>
                </div>
                <button
                  onClick={() => setShowResetTimerModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Do you want to reset your active timer back to <span className="text-[#ADFF00] font-bold">00:00</span>? Your completed sets and exercises will remain saved.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowResetTimerModal(false);
                    if (onResetTimer) onResetTimer();
                  }}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a]"
                >
                  Yes, Reset to 00:00
                </button>

                <button
                  onClick={() => setShowResetTimerModal(false)}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
