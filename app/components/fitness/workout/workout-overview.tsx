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
      router.push(`/fitness/workout/${workout.id}`);
    } else {
      toast.error(res.error || "Failed to start workout");
      setIsStarting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-2">
          Today's Workout
        </h2>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
          {workout.name}
        </h3>
        
        <div className="flex items-center gap-4 mt-3">
          <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {exerciseCount} Exercises
          </span>
          {workout.duration_minutes && (
            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              ~{workout.duration_minutes} min
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={handleStart}
        disabled={isStarting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)]"
      >
        {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
        {isStarting ? "Starting..." : "Start Workout"}
      </button>
    </div>
  );
}
