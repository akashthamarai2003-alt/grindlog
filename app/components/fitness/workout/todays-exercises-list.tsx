"use client";

import { motion } from "framer-motion";
import { Dumbbell, Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  targetWeight?: string;
}

interface TodaysExercisesListProps {
  workoutId: string;
  exercises?: Exercise[];
}

export function TodaysExercisesList({ workoutId, exercises }: TodaysExercisesListProps) {
  const router = useRouter();

  // Mock exercises if none provided
  const displayExercises = exercises && exercises.length > 0 ? exercises : [
    { id: '1', name: "Bench Press", muscle: "Chest", sets: 3, reps: "8–10 reps", targetWeight: "60 kg" },
    { id: '2', name: "Incline Dumbbell Press", muscle: "Upper Chest", sets: 3, reps: "10–12 reps", targetWeight: "16 kg" },
    { id: '3', name: "Cable Fly", muscle: "Chest", sets: 3, reps: "12–15 reps" },
    { id: '4', name: "Lat Pulldown", muscle: "Back", sets: 3, reps: "10–12 reps" },
  ];

  const handleStartExercise = (exerciseId: string) => {
    // Navigate to the specific exercise in the workout session
    router.push(`/fitness/workout/${workoutId}?exercise=${exerciseId}`);
  };

  return (
    <div className="w-full mt-8">
      <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase mb-4 px-2">
        Today's Exercises
      </h3>

      <div className="flex flex-col gap-3">
        {displayExercises.map((exercise, index) => {
          const numStr = (index + 1).toString().padStart(2, '0');

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
              className="bg-[#111A10] border border-white/5 rounded-2xl p-4 relative overflow-hidden group"
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
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Target</span>
                      <span className="text-xs font-semibold text-white/80">{exercise.muscle}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Sets × Reps</span>
                      <span className="text-xs font-semibold text-white/80">{exercise.sets} × {exercise.reps}</span>
                    </div>
                    {exercise.targetWeight && (
                      <>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-[#ADFF00]/60 uppercase tracking-widest">Weight</span>
                          <span className="text-xs font-black text-[#ADFF00]">{exercise.targetWeight}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: Start button */}
                <button 
                  onClick={() => handleStartExercise(exercise.id)}
                  className="shrink-0 h-10 px-4 bg-white/5 hover:bg-[#ADFF00] hover:text-black active:scale-95 transition-all duration-300 rounded-xl flex items-center justify-center gap-1.5 border border-white/5 group/btn"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover/btn:text-black transition-colors">Start</span>
                  <Play className="w-3 h-3 text-white/50 group-hover/btn:text-black fill-current transition-colors" />
                </button>

              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
