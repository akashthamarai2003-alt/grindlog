"use client";

import { useState } from "react";

import { TodaysExercisesList } from "./todays-exercises-list";
import { AiCoachNote } from "./ai-coach-note";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { Pause, Play, CheckCircle, Loader2 } from "lucide-react";
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
  const [isFinishing, setIsFinishing] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  
  const currentSession = (workout as any).fitness_os_workout_sessions?.find((s: any) => s.id === sessionId);
  const [isPaused, setIsPaused] = useState(currentSession?.status === "paused");

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    // If it's a mock workout, skip real API call
    if (workout.id === "mock") {
      await new Promise(r => setTimeout(r, 500));
      router.push(`/fitness/workout/${workout.id}/summary`);
      return;
    }

    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/complete`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to finish workout");
      
      router.push(`/fitness/workout/${workout.id}/summary`);
    } catch (e: any) {
      toast.error(e.message || "Failed to finish workout");
      setIsFinishing(false);
    }
  };

  const handlePauseToggle = async () => {
    if (isPausing) return;
    setIsPausing(true);
    
    if (workout.id === "mock") {
      await new Promise(r => setTimeout(r, 500));
      setIsPaused(!isPaused);
      setIsPausing(false);
      return;
    }

    try {
      const newStatus = isPaused ? "active" : "paused";
      const res = await fetch(`/api/workouts/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setIsPaused(!isPaused);
      router.refresh();
      toast.success(isPaused ? "Workout resumed!" : "Workout paused.");
    } catch (e: any) {
      toast.error(e.message || "Failed to pause/resume workout");
    } finally {
      setIsPausing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pb-32">
      <div className="mt-2">
        <WorkoutSummaryCard 
          workout={workout as any} 
          exerciseCount={workout.fitness_os_exercises?.length || 6} 
          hideStartButton={true}
        />
        <AiCoachNote />
        <TodaysExercisesList workoutId={workout.id} exercises={workout.fitness_os_exercises as any} />
      </div>

      <div className="w-full h-px bg-white/10 my-8" />

      <div className="flex flex-col gap-3 px-2">
        <button 
          onClick={handlePauseToggle}
          disabled={isPausing}
          className="w-full py-4 bg-[#111A10] border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPausing ? (
            <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
          ) : isPaused ? (
            <Play className="w-4 h-4 text-[#ADFF00]" />
          ) : (
            <Pause className="w-4 h-4 text-white/50" />
          )}
          <span className={`text-[11px] font-black uppercase tracking-widest ${isPaused ? "text-[#ADFF00]" : "text-white/70"}`}>
            {isPausing ? "Processing..." : isPaused ? "Resume Workout" : "Pause Workout"}
          </span>
        </button>

        <button 
          onClick={handleFinish}
          disabled={isFinishing}
          className="w-full py-4 bg-[#ADFF00] text-black active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] disabled:opacity-50"
        >
          {isFinishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          <span className="text-[11px] font-black uppercase tracking-widest">{isFinishing ? "Finishing..." : "Finish Workout"}</span>
        </button>
      </div>
    </div>
  );
}
