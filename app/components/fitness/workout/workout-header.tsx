"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Timer, Dumbbell } from "lucide-react";
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
  isMainPage?: boolean;
  planBadge?: string;
}

export function WorkoutHeader({
  title,
  dateStr,
  avatarUrl,
  backUrl = "/",
  startedAt,
  isPaused,
  workoutId,
  isMainPage = false,
  planBadge
}: WorkoutHeaderProps) {
  const { formattedTime } = useWorkoutTimer(workoutId, startedAt, isPaused);

  if (isMainPage) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex flex-col pt-2 pb-4"
      >
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
          {title || "Your Workouts"}
        </h1>
        
        <div className="flex items-center justify-between">
          {dateStr && (
            <p className="text-sm font-bold text-white/60">
              {dateStr}
            </p>
          )}
          {startedAt ? (
            <div className="flex items-center gap-1.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1.5 rounded-xl shrink-0">
              <Timer className={`w-3.5 h-3.5 ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`} />
              <span className={`text-xs font-black tracking-widest ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`}>
                {formattedTime}
              </span>
            </div>
          ) : planBadge ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20">
              <Dumbbell className="w-3.5 h-3.5 text-[#ADFF00]" />
              <span className="text-xs font-black text-[#ADFF00] tracking-widest uppercase">{planBadge}</span>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between w-full pb-4 gap-3"
    >
      {/* Left side: Back Arrow + Title and Date */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Link
          href={backUrl}
          prefetch={true}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
        </Link>
        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase leading-tight truncate">
            {title}
          </h1>
          {dateStr && (
            <p className="text-xs font-semibold text-white/50 tracking-wider uppercase truncate mt-0.5">
              {dateStr}
            </p>
          )}
        </div>
      </div>
      
      {/* Right side: Active Timer pill during workout session */}
      {startedAt && (
        <div className="flex items-center gap-1.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1.5 rounded-xl shrink-0">
          <Timer className={`w-3.5 h-3.5 ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`} />
          <span className={`text-xs font-black tracking-widest ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`}>
            {formattedTime}
          </span>
        </div>
      )}
    </motion.div>
  );
}
