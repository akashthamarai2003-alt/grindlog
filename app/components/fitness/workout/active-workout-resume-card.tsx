"use client";

import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveWorkoutResumeCardProps {
  workoutId: string;
  completedExercises: number;
  totalExercises: number;
}

export function ActiveWorkoutResumeCard({ 
  workoutId, 
  completedExercises, 
  totalExercises 
}: ActiveWorkoutResumeCardProps) {
  const router = useRouter();

  const handleContinue = () => {
    router.push(`/fitness/workout/${workoutId}`);
  };

  const handleEnd = () => {
    router.push(`/fitness/workout/${workoutId}/summary`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#1A2619] border border-[#ADFF00]/30 rounded-2xl p-5 mb-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#ADFF00]" />
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        Continue workout?
      </h3>
      
      <p className="text-sm font-medium text-white/60 mb-6">
        You have completed <span className="font-bold text-[#ADFF00]">{completedExercises} / {totalExercises}</span> exercises.
      </p>

      <div className="flex flex-col gap-3">
        <button 
          onClick={handleContinue}
          className="w-full py-4 bg-[#ADFF00] text-black active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)]"
        >
          <Play className="w-4 h-4 fill-black" />
          <span className="text-[11px] font-black uppercase tracking-widest">Continue</span>
        </button>

        <button 
          onClick={handleEnd}
          className="w-full py-4 bg-[#111A10] border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2"
        >
          <Square className="w-4 h-4 text-white/50" />
          <span className="text-[11px] font-black text-white/70 uppercase tracking-widest">End Workout</span>
        </button>
      </div>
    </motion.div>
  );
}
