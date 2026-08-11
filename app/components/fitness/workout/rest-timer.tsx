"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Pause, Play, SkipForward } from "lucide-react";

interface RestTimerProps {
  initialSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ initialSeconds, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  
  // Track timestamps for accurate time delta
  const expectedEndTimeRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const pauseTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer when initialSeconds changes
    setTimeLeft(initialSeconds);
    expectedEndTimeRef.current = Date.now() + initialSeconds * 1000;
    pauseTimeRef.current = null;
    setIsPaused(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const end = expectedEndTimeRef.current;
      const remainingMs = end - now;

      if (remainingMs <= 0) {
        clearInterval(intervalId);
        setTimeLeft(0);
        onComplete();
      } else {
        setTimeLeft(Math.ceil(remainingMs / 1000));
      }
    }, 200); // 200ms interval for smooth updates without missing ticks

    return () => clearInterval(intervalId);
  }, [isPaused, onComplete]);

  const togglePause = () => {
    if (isPaused) {
      // Resuming
      const pausedAt = pauseTimeRef.current!;
      const now = Date.now();
      const timePausedMs = now - pausedAt;
      expectedEndTimeRef.current += timePausedMs;
      pauseTimeRef.current = null;
      setIsPaused(false);
    } else {
      // Pausing
      pauseTimeRef.current = Date.now();
      setIsPaused(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full bg-[#111A10] border border-[#ADFF00]/20 rounded-3xl p-5 overflow-hidden shadow-[0_0_20px_rgba(173,255,0,0.1)] relative"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/5 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ADFF00]/10 rounded-full flex items-center justify-center border border-[#ADFF00]/20">
              <Timer className="w-6 h-6 text-[#ADFF00]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#ADFF00]/70 uppercase tracking-widest">Rest</p>
              <h3 className="text-3xl font-black text-white leading-none font-mono">
                {formatTime(timeLeft)}
              </h3>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#ADFF00] hover:bg-white/10 transition-colors"
              aria-label={isPaused ? "Resume rest timer" : "Pause rest timer"}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={onSkip}
              className="w-12 h-12 bg-[#ADFF00] rounded-2xl flex items-center justify-center text-black hover:bg-[#bfff33] transition-colors shadow-[0_0_10px_rgba(173,255,0,0.3)]"
              aria-label="Skip rest"
            >
              <SkipForward className="w-5 h-5 fill-black" />
            </button>
          </div>
        </div>
        
        {/* Progress bar visual */}
        <div className="w-full h-1 bg-black/40 rounded-full mt-4 overflow-hidden border border-white/5 relative z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#ADFF00]/50 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)]"
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / initialSeconds) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
