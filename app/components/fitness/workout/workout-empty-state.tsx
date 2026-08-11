"use client";

import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";

export function WorkoutEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="w-16 h-16 bg-[#111A10] border border-white/5 shadow-xl rounded-full flex items-center justify-center mb-6">
        <CalendarX className="w-8 h-8 text-[#ADFF00]/50" />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">No workout scheduled yet</h2>
      <p className="text-sm font-semibold text-white/50 max-w-[260px] uppercase tracking-wider">
        Your personalized workout plan will appear here.
      </p>
    </motion.div>
  );
}
