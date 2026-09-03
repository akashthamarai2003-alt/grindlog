"use client";

import { motion } from "framer-motion";
import { Dumbbell, Clock, Activity, Play, CalendarX } from "lucide-react";
import Link from "next/link";

interface TodaysWorkoutCardProps {
  workout?: any; // To receive today's workout plan
  targetDateStr?: string;
}

export function TodaysWorkoutCard({ workout, targetDateStr }: TodaysWorkoutCardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const cardDateStr = workout?.workout_date || targetDateStr || todayStr;
  const isFuture = cardDateStr > todayStr;

  if (!workout) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-white/5 bg-[#111A10] p-6 text-center"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ADFF00]/10">
          <CalendarX className="h-6 w-6 text-[#ADFF00]" />
        </div>
        <h3 className="text-lg font-black text-white">{isFuture ? "No workout scheduled" : "Rest & recovery day"}</h3>
        <p className="mt-2 text-sm text-white/50">
          {isFuture ? "Your saved AI plan has no training session on this date." : "No workout is scheduled in your saved plan today."}
        </p>
      </motion.div>
    );
  }

  const title = workout.name || "Workout";
  const exercises = workout?.fitness_os_exercises || [];
  const numExercises = exercises.length;
  const totalDuration = workout?.duration_minutes ? `${workout.duration_minutes} min` : null;
  
  const completedCount = exercises.filter((ex: any) => 
    ex.fitness_os_sets && 
    ex.fitness_os_sets.length > 0 && 
    ex.fitness_os_sets.every((set: any) => set.completed)
  ).length;

  const isCompleted = workout?.status === "completed";
  
  const isRestDay = title.toLowerCase().includes("rest");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/40 via-transparent to-[#ADFF00]/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-5 shadow-xl border border-white/5 backdrop-blur-md">
        
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[#ADFF00]" />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today's Workout</h3>
        </div>

        {/* Main Content */}
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-3">
            {title}
          </h2>
          
          {!isRestDay && (
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#ADFF00]" />
                <span className="text-sm font-medium">{numExercises} Exercises</span>
              </div>
              {totalDuration && <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ADFF00]" />
                <span className="text-sm font-medium">{totalDuration}</span>
              </div>}
            </div>
          )}
        </div>

        {/* Progress Tracker */}
        {!isRestDay && (
          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex justify-between text-[10px] font-medium text-white/40 uppercase tracking-wider px-1">
              <span>Progress</span>
              <span className="text-[#ADFF00]">{completedCount} / {numExercises}</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / Math.max(1, numExercises)) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                className="h-full bg-gradient-to-r from-[#ADFF00]/50 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] rounded-full relative"
              >
              </motion.div>
            </div>
          </div>
        )}

        {/* Start Button */}
        {isCompleted ? (
          <Link href={`/workout/${workout.id}/summary`} className="w-full mt-2">
            <button className="w-full py-4 px-4 bg-[#1A2619] border border-[#ADFF00]/30 hover:bg-[#ADFF00]/10 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#ADFF00]" />
              <span className="text-base font-black text-[#ADFF00] uppercase tracking-wide">View Summary</span>
            </button>
          </Link>
        ) : isFuture ? (
          <div className="w-full mt-2">
            <button disabled className="w-full py-4 px-4 bg-[#121E12] border border-white/5 opacity-50 cursor-not-allowed rounded-xl flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-white/40" />
              <span className="text-base font-black text-white/40 uppercase tracking-wide">Scheduled</span>
            </button>
          </div>
        ) : isRestDay ? (
          <div className="w-full mt-2">
            <button disabled className="w-full py-4 px-4 bg-[#121E12] border border-white/5 opacity-50 cursor-not-allowed rounded-xl flex items-center justify-center gap-2">
              <span className="text-base font-black text-white/40 uppercase tracking-wide">Rest Day</span>
            </button>
          </div>
        ) : (
          <Link href={workout ? `/workout` : "#"} className="w-full mt-2">
            <button className="w-full py-4 px-4 bg-[#ADFF00] hover:bg-[#bfff33] active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)]">
              <Play className="w-5 h-5 text-black fill-black" />
              <span className="text-base font-black text-black uppercase tracking-wide">Start Workout</span>
            </button>
          </Link>
        )}
        
      </div>
    </motion.div>
  );
}
