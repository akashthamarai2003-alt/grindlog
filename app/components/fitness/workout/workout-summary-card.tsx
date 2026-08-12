"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Clock, Zap, Circle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WorkoutSummaryCardProps {
  workout: any;
  exerciseCount: number;
}

export function WorkoutSummaryCard({ workout, exerciseCount }: WorkoutSummaryCardProps) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    
    try {
      const res = await fetch("/api/workouts/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: workout.id })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to start workout");
      
      router.push(`/fitness/workout/${workout.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to start workout");
      setIsStarting(false);
    }
  };

  const completedCount = 0; // Mock progress for now
  
  // Extract target muscles from plan_data if available, otherwise fallback
  const targetMuscles = workout?.plan_data?.target_muscles || ["Chest", "Back", "Shoulders", "Arms"];
  const muscleString = targetMuscles.join(" • ");

  return (
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
            Today's Workout
          </h2>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">
            {workout?.name || "Upper Body"}
          </h3>
          <p className="text-sm font-semibold text-white/50 tracking-wide uppercase">
            {muscleString}
          </p>
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
            <span className="text-lg font-black text-white">{workout?.duration_minutes || 48} min</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-white/60">
              <span className="text-sm">💪</span>
              <span className="text-xs font-bold uppercase tracking-wider">Intensity</span>
            </div>
            <span className="text-lg font-black text-white">{workout?.difficulty_level || "Moderate"}</span>
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
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bfff33] transition-colors shadow-[0_0_20px_rgba(173,255,0,0.2)] active:scale-[0.98] disabled:opacity-70"
        >
          {isStarting ? "STARTING..." : "START WORKOUT"} <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </motion.div>
  );
}
