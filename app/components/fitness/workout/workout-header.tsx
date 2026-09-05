"use client";

import { motion } from "framer-motion";
import { ArrowLeft, UserCircle, Timer, Bot } from "lucide-react";
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

export function WorkoutHeader({
  title,
  dateStr,
  avatarUrl,
  backUrl = "/",
  startedAt,
  isPaused,
  workoutId
}: WorkoutHeaderProps) {
  const { formattedTime } = useWorkoutTimer(workoutId, startedAt, isPaused);

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
      
      {/* Right side: Active Timer pill during workout OR Profile Avatar otherwise */}
      {startedAt ? (
        <div className="flex items-center gap-1.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1.5 rounded-xl shrink-0">
          <Timer className={`w-3.5 h-3.5 ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`} />
          <span className={`text-xs font-black tracking-widest ${isPaused ? 'text-white/50' : 'text-[#ADFF00]'}`}>
            {formattedTime}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open_fitness_chatbot"));
            }}
            className="w-10 h-10 rounded-full bg-[#121E12] border border-[#ADFF00]/40 text-[#ADFF00] shadow-[0_0_12px_rgba(173,255,0,0.2)] flex items-center justify-center relative hover:bg-[#1A2619] active:scale-95 transition-all cursor-pointer group shrink-0"
            title="Open AI Fitness Coach"
          >
            <Bot size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF00] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ADFF00]" />
            </span>
          </button>

          <Link
            href="/profile"
            prefetch={true}
            className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors shrink-0 overflow-hidden"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle className="h-6 w-6 stroke-[1.5]" />
            )}
          </Link>
        </div>
      )}
    </motion.div>
  );
}
