"use client";

import { motion } from "framer-motion";
import { Play, CalendarX } from "lucide-react";
import Link from "next/link";

interface TodayPlanCardProps {
  workout?: any;
  hasPlan?: boolean;
}

export function TodayPlanCard({ workout, hasPlan }: TodayPlanCardProps) {
  if (!hasPlan) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center py-10"
      >
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <Play className="w-6 h-6 text-emerald-500 fill-current" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No plan found</h3>
        <p className="text-sm text-gray-500 font-medium mb-6">Let AI create a personalized plan for you</p>
        <Link 
          href="/scanner" prefetch={true}
          className="bg-gray-900 text-white font-bold py-3 px-6 rounded-xl text-sm active:scale-[0.98] transition-transform"
        >
          Build My Fitness Plan
        </Link>
      </motion.div>
    );
  }

  if (!workout) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center justify-center py-10"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CalendarX className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No plan today</h3>
        <p className="text-sm text-gray-500 font-medium">Take a rest or start a free workout</p>
      </motion.div>
    );
  }

  const exerciseCount = workout.fitness_os_exercises?.length || 0;
  const isStarted = workout.status === "in_progress";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="w-full bg-white rounded-[2rem] p-6 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110 duration-500 ease-out" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-emerald-500 uppercase mb-2">
            Today's Plan
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {workout.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
          {exerciseCount} Exercises
        </span>
        {workout.duration_minutes && (
          <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            ~{workout.duration_minutes} min
          </span>
        )}
      </div>

      <Link 
        href="/workout" prefetch={true}
        className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)]"
      >
        <Play className="w-5 h-5 fill-current" />
        {isStarted ? "Resume Workout" : "Start Workout"}
      </Link>
    </motion.div>
  );
}
