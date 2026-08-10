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
        className="w-full bg-blue-50 border border-blue-100 rounded-3xl p-5 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Timer className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Rest</p>
              <h3 className="text-3xl font-bold text-blue-900 leading-none font-mono">
                {formatTime(timeLeft)}
              </h3>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
              aria-label={isPaused ? "Resume rest timer" : "Pause rest timer"}
            >
              {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={onSkip}
              className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
              aria-label="Skip rest"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
