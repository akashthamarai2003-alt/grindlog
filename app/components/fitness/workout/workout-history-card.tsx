"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { FitnessWorkout } from "@/types/fitness/workout";

interface WorkoutHistoryCardProps {
  workout: FitnessWorkout;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
}

export function WorkoutHistoryCard({ workout, exerciseCount, completedSets, totalSets }: WorkoutHistoryCardProps) {
  const dateStr = new Date(workout.workout_date).toLocaleDateString("en-US", { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  return (
    <Link href={`/workout/${workout.id}/summary`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all active:scale-[0.98]"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {workout.name}
            </h3>
            <div className="flex items-center gap-1.5 text-gray-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-widest">{dateStr}</span>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
            <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {workout.duration_minutes || "-"}m
            </span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Exercises</span>
            <span className="text-sm font-bold text-gray-900">{exerciseCount}</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sets</span>
            <span className="text-sm font-bold text-gray-900">{completedSets}/{totalSets}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
