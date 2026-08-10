"use client";

import { motion } from "framer-motion";

interface WorkoutProgressProps {
  completedSets: number;
  totalSets: number;
}

export function WorkoutProgress({ completedSets, totalSets }: WorkoutProgressProps) {
  const percentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className="w-full bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-sm font-bold text-gray-900 tracking-tight">Workout Progress</h3>
        <p className="text-sm font-semibold text-gray-500">
          <span className="text-emerald-500 font-bold">{completedSets}</span> / {totalSets} sets
        </p>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
