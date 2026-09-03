"use client";

import { motion } from "framer-motion";
import { Dumbbell, Play, Loader2, Check, Pause } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  isPaused?: boolean;
}

export function TodaysExercisesList({
  workoutId,
  exercises = [],
  readonly = false,
  sectionLabel = "Today's Exercises",
  onSelectExercise,
  isPaused = false
}: TodaysExercisesListProps) {
  const router = useRouter();
  const [navigatingExerciseId, setNavigatingExerciseId] = useState<string | null>(null);

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
    if (onSelectExercise) {
      onSelectExercise(exerciseId);
      return;
    }
    setNavigatingExerciseId(exerciseId);
    router.push(`/workout/${workoutId}?exercise=${exerciseId}`);
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

              <div className="flex justify-between items-start">
                {/* Left side: Info */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 tracking-widest uppercase mb-1">
                      {numStr}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-white/50" />
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">
                        {exercise.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                        Target
                      </span>
                      <span className="text-xs font-semibold text-white/80">
                        {exercise.muscle || "Muscle"}
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

                {/* Right side: Start / Completed button (Hidden if readonly) */}
                {!readonly && (
                  <button
                    onClick={() => !isCompleted && handleStartExercise(exercise.id)}
                    disabled={navigatingExerciseId !== null || isCompleted}
                    className={`shrink-0 h-10 px-4 transition-all duration-300 rounded-xl flex items-center justify-center gap-1.5 border group/btn disabled:opacity-50 ${
                      isCompleted
                        ? "bg-white/5 border-white/10 text-white/50 cursor-default"
                        : isPaused
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 cursor-not-allowed"
                        : "bg-white/5 border-white/5 hover:bg-[#ADFF00] hover:text-black active:scale-95 cursor-pointer"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Completed
                        </span>
                        <Check className="w-3 h-3 text-[#ADFF00]" />
                      </>
                    ) : isPaused ? (
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover/btn:text-black transition-colors">
                          Start
                        </span>
                        <Play className="w-3 h-3 text-white/50 group-hover/btn:text-black fill-current transition-colors" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
