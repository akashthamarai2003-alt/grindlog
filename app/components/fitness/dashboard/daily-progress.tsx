"use client";

import { motion } from "framer-motion";
import { Activity, Apple, Droplet, Moon } from "lucide-react";

export function DailyProgress() {
  const metrics = [
    { id: "workout", label: "Workout", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50", progress: 0 },
    { id: "nutrition", label: "Nutrition", icon: Apple, color: "text-orange-500", bg: "bg-orange-50", progress: 0 },
    { id: "water", label: "Water", icon: Droplet, color: "text-blue-500", bg: "bg-blue-50", progress: 0 },
    { id: "sleep", label: "Sleep", icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", progress: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full space-y-4"
    >
      <h3 className="text-lg font-bold text-gray-900 px-1">Today's Progress</h3>
      
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((metric, index) => (
          <div key={metric.id} className="flex flex-col items-center gap-2">
            <div className="relative w-full aspect-square max-w-[80px]">
              {/* Circular Progress Background */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  className="text-gray-100" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="8"
                  strokeDasharray={`${251.2 * (metric.progress / 100)} 251.2`}
                  className={metric.color}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-8 h-8 rounded-full ${metric.bg} flex items-center justify-center`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
              </div>
            </div>
            
            <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
