"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { startWorkoutSessionAction } from "@/app/actions/fitness";
import { toast } from "sonner";
import { FitnessWorkout } from "@/types/fitness/workout";

interface WorkoutOverviewProps {
  workout: FitnessWorkout;
  exerciseCount: number;
}

export function WorkoutOverview({ workout, exerciseCount }: WorkoutOverviewProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    
    const res = await startWorkoutSessionAction({ workoutId: workout.id });
    if (res.success) {
      router.push(`/workout/${workout.id}`);
    } else {
      toast.error(res.error || "Failed to start workout");
      setIsStarting(false);
    }
  };

  return (
    <div className="w-full bg-[#111A10] rounded-3xl border border-white/5 shadow-xl p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-sm font-black tracking-widest text-[#ADFF00] uppercase mb-2">
          Today's Workout
        </h2>
        <h3 className="text-2xl font-black text-white leading-tight uppercase">
          {workout.name}
        </h3>
        
        <div className="flex items-center gap-4 mt-3">
          <span className="text-sm font-semibold text-white/70 bg-black/40 border border-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
            {exerciseCount} Exercises
          </span>
          {workout.duration_minutes && (
            <span className="text-sm font-semibold text-white/70 bg-black/40 border border-white/5 px-3 py-1 rounded-full uppercase tracking-wider">
              ~{workout.duration_minutes} min
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleStart}
        disabled={isStarting}
        className="w-full bg-[#ADFF00] hover:bg-[#bfff33] active:scale-[0.98] transition-all text-black font-black uppercase tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.3)] disabled:opacity-50"
      >
        {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
        {isStarting ? "Starting..." : "Start Workout"}
      </button>
    </div>
  );
}
