"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function StreakCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full bg-white rounded-3xl border border-gray-100 p-5 flex flex-col justify-between aspect-square max-h-[160px]"
    >
      <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center">
        <Flame className="w-5 h-5 text-orange-500" />
      </div>
      
      <div className="space-y-1">
        <h4 className="text-2xl font-bold text-gray-900 leading-none">0</h4>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Day Streak
        </p>
      </div>
      
      <p className="text-sm font-medium text-gray-500">
        Start your first day
      </p>
    </motion.div>
  );
}
