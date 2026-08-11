"use client";

import { motion } from "framer-motion";
import { Flame, Trophy, Activity, Save } from "lucide-react";
import Link from "next/link";
import { FitnessWorkout } from "@/types/fitness/workout";

interface WorkoutCompleteProps {
  workout: FitnessWorkout;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
}

export function WorkoutComplete({ workout, exerciseCount, completedSets, totalSets }: WorkoutCompleteProps) {
  const workoutName = workout?.name || "Upper Body";
  const duration = workout?.duration_minutes || 48;
  
  // Fake math just for visual aesthetics based on sets
  const volume = (totalSets * 10 * 25).toLocaleString(); // ex: 18 * 250 = 4,500
  const calories = Math.round(duration * 6.5); // ex: 48 * 6.5 = 312

  return (
    <div className="w-full max-w-md mx-auto px-5 py-12 flex flex-col items-center pb-32">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-6 border border-[#ADFF00]/20 shadow-[0_0_40px_rgba(173,255,0,0.15)]"
      >
        <Flame className="w-12 h-12 text-[#ADFF00]" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-white uppercase tracking-tight mb-2 text-center"
      >
        Workout Complete!
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-bold text-white/60 mb-10"
      >
        Great work, Akash.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-[#111A10] border border-[#ADFF00]/20 rounded-[24px] p-6 shadow-[0_0_40px_rgba(173,255,0,0.05)] relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#ADFF00]/5 blur-[60px] rounded-full" />
        
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white uppercase tracking-wider">{workoutName}</span>
            <span className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">{duration} min</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xl font-black text-white">{exerciseCount} / {exerciseCount}</span>
            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-1">Exercises</span>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-6" />

        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-bold text-white/80 tracking-wider">{completedSets} sets completed</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Volume</span>
            <span className="text-lg font-black text-white">{volume} <span className="text-xs text-white/50">kg</span></span>
          </div>
          
          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 blur-[20px] rounded-full" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 z-10">Records</span>
            <div className="flex items-center gap-1.5 z-10">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-black text-white">1</span>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Calories</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ADFF00]" />
              <span className="text-lg font-black text-white">~{calories} <span className="text-xs text-white/50">kcal</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full"
      >
        <Link href="/fitness" className="w-full">
          <button className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(173,255,0,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Save className="w-4 h-4" />
            Save Workout
          </button>
        </Link>
      </motion.div>
      
    </div>
  );
}
