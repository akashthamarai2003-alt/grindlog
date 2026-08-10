"use client";

import { motion } from "framer-motion";

export function WeeklyProgress() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  
  // Empty state for Phase 3
  const hasData = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="w-full bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Progress</h3>
      
      <div className="flex justify-between items-center mb-6">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center" />
            <span className="text-xs font-semibold text-gray-400">
              {day}
            </span>
          </div>
        ))}
      </div>
      
      {!hasData && (
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-gray-500">
            Your weekly progress will appear here once you start training.
          </p>
        </div>
      )}
    </motion.div>
  );
}
