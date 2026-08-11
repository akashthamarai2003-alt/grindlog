"use client";

import { motion } from "framer-motion";

interface WorkoutProgressProps {
  completedSets: number;
  totalSets: number;
}

export function WorkoutProgress({ completedSets, totalSets }: WorkoutProgressProps) {
  const percentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="w-full bg-[#111A10] rounded-3xl p-5 border border-white/5 shadow-xl mb-6 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ADFF00]/5 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex justify-between items-end mb-3 relative z-10">
        <h3 className="text-sm font-black text-white uppercase tracking-wide">Workout Progress</h3>
        <p className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          <span className="text-[#ADFF00] font-black">{completedSets}</span> / {totalSets} sets
        </p>
      </div>
      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#ADFF00]/50 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
