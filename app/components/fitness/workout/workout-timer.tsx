"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface WorkoutTimerProps {
  completedExercises: number;
  totalExercises: number;
}

export function WorkoutTimer({ completedExercises, totalExercises }: WorkoutTimerProps) {
  // In a real app, this should track from a session start timestamp in the DB
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2"
    >
      <div className="bg-[#111A10]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[#ADFF00] animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase">
            Time
          </span>
          <span className="text-sm font-black text-white w-12 text-center tabular-nums">
            {formatTime(seconds)}
          </span>
        </div>
        
        <div className="w-px h-4 bg-white/20" />
        
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
            Exercises
          </span>
          <span className="text-sm font-black text-white">
            {completedExercises} <span className="text-white/40">/ {totalExercises}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
