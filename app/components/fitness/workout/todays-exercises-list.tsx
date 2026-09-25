"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Play, Loader2, Check, Pause, CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { completeExerciseSetsAction } from "@/app/actions/fitness";
import { ExerciseAnimationPlayer } from "./exercise-animation-player";
import { getExerciseAnimation } from "@/lib/fitness/exercises/exercise-animations";

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  targetWeight?: string;
  fitness_os_sets?: any[];
}

interface TodaysExercisesListProps {
  workoutId: string;
  exercises?: Exercise[];
  readonly?: boolean;
  sectionLabel?: string;
  onSelectExercise?: (exerciseId: string) => void;
  onCompleteExercise?: (exerciseId: string) => void;
  isPaused?: boolean;
}

export function TodaysExercisesList({
  workoutId,
  exercises = [],
  readonly = false,
  sectionLabel = "Today's Exercises",
  onSelectExercise,
  onCompleteExercise,
  isPaused = false
}: TodaysExercisesListProps) {
  const router = useRouter();
  const [navigatingExerciseId, setNavigatingExerciseId] = useState<string | null>(null);
  const [finishingExerciseId, setFinishingExerciseId] = useState<string | null>(null);
  const [confirmExercise, setConfirmExercise] = useState<Exercise | null>(null);

  // Mock exercises if none provided
  const displayExercises = exercises && exercises.length > 0 ? exercises : [
    { id: "1", name: "Bench Press", muscle: "Chest", sets: 3, reps: "8–10 reps", targetWeight: "60 kg" },
    { id: "2", name: "Incline Dumbbell Press", muscle: "Upper Chest", sets: 3, reps: "10–12 reps", targetWeight: "16 kg" },
    { id: "3", name: "Cable Fly", muscle: "Chest", sets: 3, reps: "12–15 reps" },
    { id: "4", name: "Lat Pulldown", muscle: "Back", sets: 3, reps: "10–12 reps" },
  ];

  const handleStartExercise = (exerciseId: string) => {
    if (isPaused) {
      toast.info("Workout is paused. Tap 'Resume Workout' below to continue.");
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    if (onSelectExercise) {
      onSelectExercise(exerciseId);
      return;
    }
    setNavigatingExerciseId(exerciseId);
    router.push(`/workout/${workoutId}?exercise=${exerciseId}`);
  };

  const handleFinishExercise = async (exerciseId: string) => {
    if (isPaused) {
      toast.info("Workout is paused. Tap 'Resume Workout' below to continue.");
      return;
    }
    setFinishingExerciseId(exerciseId);
    try {
      if (onCompleteExercise) {
        onCompleteExercise(exerciseId);
      } else {
        await completeExerciseSetsAction({ exerciseId });
        toast.success("Exercise marked completed!");
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || "Could not complete exercise");
    } finally {
      setFinishingExerciseId(null);
    }
  };

  return (
    <div className="w-full mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          {sectionLabel}
        </h3>
        {isPaused && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <Pause className="w-2.5 h-2.5" /> Paused
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {displayExercises.map((exercise, index) => {
          const numStr = (index + 1).toString().padStart(2, "0");
          const isCompleted =
            exercise.fitness_os_sets &&
            exercise.fitness_os_sets.length > 0 &&
            exercise.fitness_os_sets.every((set: any) => set.completed);

          const anim = getExerciseAnimation(exercise.name, exercise.muscle);
          const resolvedTargetMuscle =
            exercise.muscle && exercise.muscle.toLowerCase() !== "muscle"
              ? exercise.muscle
              : anim.targetMuscle;

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className={`bg-[#111A10] border border-white/5 rounded-2xl p-4 relative overflow-hidden group ${
                isCompleted ? "opacity-70" : isPaused ? "opacity-60" : ""
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-[#ADFF00]/50 transition-colors" />

              <div className="flex justify-between items-start gap-3">
                {/* Left side: Thumbnail + Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <ExerciseAnimationPlayer
                    name={exercise.name}
                    targetMuscle={resolvedTargetMuscle}
                    compact={true}
                    className="mt-0.5 shrink-0 shadow-md"
                  />
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-0.5">
                        {numStr}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-white/50 shrink-0" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wide truncate">
                          {exercise.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                          Target
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {resolvedTargetMuscle}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                          Sets × Reps
                        </span>
                        <span className="text-xs font-semibold text-white/80">
                          {(exercise as any).target_sets || exercise.sets} ×{" "}
                          {String((exercise as any).target_reps || exercise.reps || "").replace(
                            /^\d+\s*[xX×]\s*/,
                            ""
                          )}
                        </span>
                      </div>
                      {((exercise as any).targetWeight || exercise.targetWeight) && (
                        <>
                          <div className="w-px h-6 bg-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-[#ADFF00]/60 uppercase tracking-widest">
                              Weight
                            </span>
                            <span className="text-xs font-black text-[#ADFF00]">
                              {(exercise as any).targetWeight || exercise.targetWeight}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Start & Finish buttons (or Completed badge) */}
                {!readonly && (
                  isCompleted ? (
                    <div className="shrink-0 h-10 px-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-1.5 text-white/50">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">
                        Completed
                      </span>
                      <Check className="w-3.5 h-3.5 text-[#ADFF00]" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {/* START button */}
                      <button
                        onClick={() => handleStartExercise(exercise.id)}
                        disabled={navigatingExerciseId !== null || isPaused || finishingExerciseId === exercise.id}
                        className={`h-9 px-4 transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 border group/btn disabled:opacity-50 ${
                          isPaused
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:bg-[#ADFF00] hover:text-black active:scale-95 cursor-pointer"
                        }`}
                      >
                        {isPaused ? (
                          <>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                              Paused
                            </span>
                            <Pause className="w-3 h-3 text-amber-400" />
                          </>
                        ) : navigatingExerciseId === exercise.id ? (
                          <>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                              Loading
                            </span>
                            <Loader2 className="w-3 h-3 text-white/50 animate-spin" />
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover/btn:text-black transition-colors">
                              Start
                            </span>
                            <Play className="w-3 h-3 text-white/50 group-hover/btn:text-black fill-current transition-colors" />
                          </>
                        )}
                      </button>

                      {/* FINISH button directly below Start button */}
                      <button
                        onClick={() => {
                          if (isPaused) {
                            toast.info("Workout is paused. Tap 'Resume Workout' below to continue.");
                            return;
                          }
                          setConfirmExercise(exercise);
                        }}
                        disabled={navigatingExerciseId !== null || isPaused || finishingExerciseId === exercise.id}
                        className="h-7 px-3 bg-[#111A10] border border-[#ADFF00]/30 hover:bg-[#ADFF00] hover:text-black rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer text-[#ADFF00] disabled:opacity-50 group/finish"
                      >
                        {finishingExerciseId === exercise.id ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-[#ADFF00]" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#ADFF00]">Saving</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#ADFF00] group-hover/finish:text-black transition-colors">
                              Finish
                            </span>
                            <Check className="w-2.5 h-2.5 text-[#ADFF00] group-hover/finish:text-black transition-colors" />
                          </>
                        )}
                      </button>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmExercise && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !finishingExerciseId && setConfirmExercise(null)}
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
                    <CheckCircle2 className="w-5 h-5 text-[#ADFF00]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest">
                      Confirmation
                    </span>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      Finish This Workout?
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => !finishingExerciseId && setConfirmExercise(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Do you want to finish <strong className="text-white uppercase">{confirmExercise.name}</strong> and complete these sets?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const id = confirmExercise.id;
                    setConfirmExercise(null);
                    await handleFinishExercise(id);
                  }}
                  disabled={finishingExerciseId !== null}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.3)]"
                >
                  {finishingExerciseId === confirmExercise.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Check className="w-4 h-4 text-black" />
                  )}
                  <span>Yes, Finish</span>
                </button>

                <button
                  onClick={() => setConfirmExercise(null)}
                  disabled={finishingExerciseId !== null}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  Keep Training
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
