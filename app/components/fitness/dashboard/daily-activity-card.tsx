"use client";

import { motion } from "framer-motion";
import { Activity, Droplets, Moon, Flame } from "lucide-react";

interface DailyActivityCardProps {
  lifestyle?: any;
  workoutCompleted?: boolean;
}

export function DailyActivityCard({ lifestyle, workoutCompleted = false }: DailyActivityCardProps) {
  // Pull targets from the AI plan (or use defaults)
  const stepsTarget = lifestyle?.daily_steps_target || 10000;
  const waterTarget = lifestyle?.water_target_liters || 3.0;
  const sleepTarget = lifestyle?.sleep_target_hours || 8.0;

  // Tracked data (mocked until tracking is built)
  const stepsTracked = 0;
  const waterTracked = 0.0;
  const sleepTracked = "0h 0m";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today</h3>
        </div>

        {/* Grid layout for activities */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Steps */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/60">
              <span className="text-sm">🚶</span>
              <span className="text-xs font-bold uppercase tracking-widest">Steps</span>
            </div>
            <div className="text-sm font-black text-white">
              {stepsTracked.toLocaleString()} <span className="text-white/40 font-medium text-xs">/ {stepsTarget.toLocaleString()}</span>
            </div>
          </div>

          {/* Water */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#3b82f6]/80">
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Water</span>
            </div>
            <div className="text-sm font-black text-white">
              {waterTracked.toFixed(1)} <span className="text-white/40 font-medium text-xs">/ {waterTarget.toFixed(1)} L</span>
            </div>
          </div>

          {/* Sleep */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#8b5cf6]/80">
              <Moon className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Sleep</span>
            </div>
            <div className="text-sm font-black text-white">
              {sleepTracked}
            </div>
          </div>

          {/* Workout */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#ef4444]/80">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Workout</span>
            </div>
            <div className={`text-sm font-black ${workoutCompleted ? 'text-[#ADFF00]' : 'text-white/40'}`}>
              {workoutCompleted ? "Completed" : "Not completed"}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
