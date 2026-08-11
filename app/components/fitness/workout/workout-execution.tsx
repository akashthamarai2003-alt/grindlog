"use client";

import { TodaysExercisesList } from "./todays-exercises-list";
import { AiCoachNote } from "./ai-coach-note";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { Pause, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FitnessWorkout, FitnessExercise, FitnessSet } from "@/types/fitness/workout";

interface WorkoutExecutionProps {
  workout: FitnessWorkout & {
    fitness_os_exercises: (FitnessExercise & { fitness_os_sets: FitnessSet[] })[];
  };
  sessionId: string;
}

export function WorkoutExecution({ workout, sessionId }: WorkoutExecutionProps) {
  const router = useRouter();

  const handleFinish = () => {
    // In real app, complete the session in DB
    router.push(`/fitness/workout/${workout.id}/summary`);
  };

  return (
    <div className="w-full h-full flex flex-col pb-32">
      <div className="mt-2">
        <WorkoutSummaryCard 
          workout={workout as any} 
          exerciseCount={workout.fitness_os_exercises?.length || 6} 
        />
        <AiCoachNote />
        <TodaysExercisesList workoutId={workout.id} exercises={workout.fitness_os_exercises} />
      </div>

      <div className="w-full h-px bg-white/10 my-8" />

      <div className="flex flex-col gap-3 px-2">
        <button 
          onClick={() => toast("Workout paused.")}
          className="w-full py-4 bg-[#111A10] border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
        >
          <Pause className="w-4 h-4 text-white/50" />
          <span className="text-[11px] font-black text-white/70 uppercase tracking-widest">Pause Workout</span>
        </button>

        <button 
          onClick={handleFinish}
          className="w-full py-4 bg-[#ADFF00] text-black active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)]"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-[11px] font-black uppercase tracking-widest">Finish Workout</span>
        </button>
      </div>
    </div>
  );
}
