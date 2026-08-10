"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function CoachLoading() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-6"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-100 mt-1">
        <Sparkles className="w-4 h-4 text-emerald-600" />
      </div>
      
      <div className="bg-white border border-gray-100 rounded-[20px] rounded-tl-[5px] px-5 py-4 shadow-sm shadow-gray-200/50">
        <div className="flex items-center gap-2 h-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-emerald-400"
          />
        </div>
      </div>
    </motion.div>
  );
}
