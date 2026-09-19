"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Timer, Dumbbell, RotateCcw, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  onResetTimer?: () => void;
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
  planBadge,
  onResetTimer,
}: WorkoutHeaderProps) {
  const router = useRouter();
  const { formattedTime } = useWorkoutTimer(workoutId, startedAt, isPaused);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  useEffect(() => {
    if (backUrl && !isMainPage) {
      router.prefetch(backUrl);
    }
  }, [backUrl, isMainPage, router]);

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
                {isPaused ? `PAUSED • ${formattedTime}` : formattedTime}
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
    <>
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
            onClick={() => setIsNavigatingBack(true)}
            aria-label="Go back"
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
          >
            {isNavigatingBack ? (
              <Loader2 className="w-5 h-5 text-[#ADFF00] animate-spin" />
            ) : (
              <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white transition-transform active:scale-90" />
            )}
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
          <button
            type="button"
            onClick={() => onResetTimer && setShowResetModal(true)}
            title={onResetTimer ? "Click to reset workout timer to 00:00" : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 transition-all ${
              onResetTimer ? "cursor-pointer hover:scale-105 active:scale-95" : ""
            } ${
              isPaused 
                ? 'bg-amber-500/10 border border-amber-500/20' 
                : 'bg-[#ADFF00]/10 border border-[#ADFF00]/20 hover:border-[#ADFF00]/50'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : 'text-[#ADFF00]'}`} />
            <span className={`text-xs font-black tracking-widest tabular-nums ${isPaused ? 'text-amber-400' : 'text-[#ADFF00]'}`}>
              {isPaused ? `PAUSED • ${formattedTime}` : formattedTime}
            </span>
            {onResetTimer && (
              <RotateCcw className="w-3 h-3 text-white/40 hover:text-white ml-0.5" />
            )}
          </button>
        )}
      </motion.div>

      {/* Reset Timer Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0A1108] border-t border-white/10 sm:border sm:rounded-[24px] rounded-t-[32px] p-6 shadow-2xl z-10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4 text-[#ADFF00]" />
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Reset Workout Timer?
                  </h3>
                </div>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">
                Do you want to reset your active timer back to <span className="text-[#ADFF00] font-bold">00:00</span>? Your completed sets and exercises will remain saved.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    if (onResetTimer) onResetTimer();
                  }}
                  className="w-full py-4 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-xl active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#b8ff1a]"
                >
                  Yes, Reset to 00:00
                </button>

                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/70 font-bold uppercase tracking-widest text-xs rounded-xl active:scale-[0.98] transition-colors cursor-pointer"
                >
                  Keep Current Time ({formattedTime})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
