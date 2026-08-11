"use client";

import { FitnessExercise, FitnessSet } from "@/types/fitness/workout";
import { SetRow } from "./set-row";

interface ExerciseCardProps {
  exercise: FitnessExercise & { fitness_os_sets: FitnessSet[] };
  onSetCompleted: (restSeconds: number) => void;
  isTimerActive: boolean;
}

export function ExerciseCard({ exercise, onSetCompleted, isTimerActive }: ExerciseCardProps) {
  // Sort sets by set_number
  const sortedSets = [...exercise.fitness_os_sets].sort((a, b) => a.set_number - b.set_number);
  
  return (
    <div className="w-full bg-[#111A10] rounded-[2rem] border border-white/5 shadow-xl overflow-hidden p-5 sm:p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-xs font-bold text-[#ADFF00] uppercase tracking-widest mb-1">
            Exercise {exercise.exercise_order}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase">
            {exercise.name}
          </h2>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-semibold text-white/80">
            {exercise.target_sets} sets &times; {exercise.target_reps || "-"} reps
          </p>
          <p className="text-xs font-medium text-white/40 mt-1">
            Rest {exercise.rest_seconds}s
          </p>
        </div>
      </div>
      
      {exercise.notes && (
        <div className="bg-[#ADFF00]/10 rounded-2xl p-4 mb-6 border border-[#ADFF00]/20">
          <p className="text-sm text-[#ADFF00]/90 font-medium">{exercise.notes}</p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex px-3 pb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <div className="w-8 shrink-0 text-center">Set</div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-center">
            <div>Reps</div>
            <div>KG</div>
          </div>
          <div className="w-12 shrink-0 text-center">Done</div>
        </div>

        {sortedSets.map((s) => (
          <SetRow 
            key={s.id} 
            setRecord={s} 
            onSetCompleted={() => onSetCompleted(exercise.rest_seconds)}
            isTimerActive={isTimerActive}
          />
        ))}
      </div>
    </div>
  );
}
