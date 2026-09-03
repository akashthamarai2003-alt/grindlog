"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserCircle, Timer } from "lucide-react";
import Link from "next/link";
import { useWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";

interface WorkoutHeaderProps {
  title: string;
  dateStr?: string;
  avatarUrl?: string | null;
  backUrl?: string;
  startedAt?: string | null;
  isPaused?: boolean;
  workoutId?: string;
}

export function WorkoutHeader({ title, dateStr, avatarUrl, backUrl = "/", startedAt, isPaused, workoutId }: WorkoutHeaderProps) {
  const { formattedTime } = useWorkoutTimer(workoutId, startedAt, isPaused);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between w-full pb-4"
    >
      <div className="flex items-center gap-3">
        <Link href={backUrl} prefetch={true} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-none truncate max-w-[200px]">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {dateStr && (
              <p className="text-xs font-semibold text-white/50 tracking-wider uppercase">
                {dateStr}
              </p>
            )}
            {startedAt && (
              <div className="flex items-center gap-1.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 rounded-md">
                <Timer className={`w-3 h-3 ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`} />
                <span className={`text-[10px] font-black tracking-widest ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`}>
                  {formattedTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
        ) : (
          <UserCircle className="h-6 w-6 stroke-[1.5]" />
        )}
      </button>
    </motion.div>
  );
}
