"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { FitnessWorkout } from "@/types/fitness/workout";

interface WorkoutCompleteProps {
  workout: FitnessWorkout;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
}

export function WorkoutComplete({ workout, exerciseCount, completedSets, totalSets }: WorkoutCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-5 text-center w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        className="mb-6 relative"
      >
        <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-20 rounded-full" />
        <CheckCircle className="w-24 h-24 text-emerald-500 relative z-10" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        Workout Complete 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-medium text-gray-500 mb-10"
      >
        Great work. Stay consistent.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-8"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6">{workout.name}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
            <span className="text-2xl font-bold text-gray-900">{workout.duration_minutes || "-"}</span>
            <span className="text-xs font-semibold text-gray-500 mt-1">min</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Exercises</span>
            <span className="text-2xl font-bold text-gray-900">{exerciseCount}</span>
            <span className="text-xs font-semibold text-gray-500 mt-1">completed</span>
          </div>
          <div className="col-span-2 flex flex-col items-center p-4 bg-gray-50 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sets Completed</span>
            <span className="text-2xl font-bold text-emerald-600">{completedSets} / {totalSets}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full space-y-3"
      >
        <Link 
          href="/fitness"
          className="w-full bg-gray-900 hover:bg-black active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          Back to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link 
          href="/fitness/workout/history"
          className="w-full bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          <History className="w-5 h-5" />
          View Workout History
        </Link>
      </motion.div>
    </div>
  );
}
