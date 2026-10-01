"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Dumbbell, 
  Apple, 
  Activity 
} from "lucide-react";
import confetti from "canvas-confetti";
import { AICharacter } from "@/components/fitness/plan-animation";
import { cn } from "@/lib/utils";

interface LokiProActivationProps {
  onComplete: () => void;
  planName?: string;
  orderId?: string | null;
}

const TOTAL_DURATION_MS = 10000; // 10 seconds

export function LokiProActivation({
  onComplete,
  planName = "PRO",
  orderId,
}: LokiProActivationProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const hasCompletedRef = useRef(false);

  const handleFinish = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsFinishing(true);
    onComplete();
  };

  // 1. Confetti bursts
  useEffect(() => {
    try {
      // Immediate dual side burst
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.65 },
        colors: ["#ADFF00", "#FFFFFF", "#10B981", "#EAB308"],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.65 },
        colors: ["#ADFF00", "#FFFFFF", "#10B981", "#EAB308"],
        disableForReducedMotion: true,
      });

      // Mid-stage celebration burst at 3.5s
      const midBurst = setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 85,
          origin: { x: 0.5, y: 0.45 },
          colors: ["#ADFF00", "#39FF14", "#FFFFFF"],
          disableForReducedMotion: true,
        });
      }, 3500);

      // Final celebratory burst at 7s
      const finalBurst = setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 95,
          origin: { x: 0.5, y: 0.4 },
          colors: ["#ADFF00", "#10B981", "#F59E0B"],
          disableForReducedMotion: true,
        });
      }, 7000);

      return () => {
        clearTimeout(midBurst);
        clearTimeout(finalBurst);
      };
    } catch {
      // Silently ignore if canvas-confetti fails
    }
  }, []);

  // 2. 10-second ticker
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= TOTAL_DURATION_MS) {
        setElapsedMs(TOTAL_DURATION_MS);
        clearInterval(interval);
        handleFinish();
      } else {
        setElapsedMs(elapsed);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const progress = Math.min(100, (elapsedMs / TOTAL_DURATION_MS) * 100);
  const remainingSeconds = Math.max(1, Math.ceil((TOTAL_DURATION_MS - elapsedMs) / 1000));

  // Determine active stage
  // Stage 1: 0 - 33% (0 - 3300ms)
  // Stage 2: 33% - 66% (3300ms - 6600ms)
  // Stage 3: 66% - 100% (6600ms - 10000ms)
  const currentStage = elapsedMs < 3300 ? 1 : elapsedMs < 6600 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050B05] text-white flex flex-col justify-between p-5 sm:p-7 overflow-y-auto select-none">
      {/* Background ambient lighting */}
      <div 
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#ADFF00]/12 blur-[100px]" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#10B981]/10 blur-[100px]" 
        aria-hidden="true" 
      />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF00] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ADFF00]" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ADFF00]">
              Loki Pro AI Engine
            </span>
            <p className="text-[10px] text-gray-400 font-mono">
              {orderId ? `Order: ${orderId.slice(0, 14)}...` : "Subscription Active"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          Skip to Plan
        </button>
      </header>

      {/* Centerpiece: Loki Avatar + Dynamic Stage Card */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-4 text-center max-w-md mx-auto w-full">
        {/* Loki Mascot with Atomic Orbitals */}
        <div className="relative my-2 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-[#ADFF00]/15 blur-3xl rounded-full scale-125 pointer-events-none" 
            aria-hidden="true" 
          />
          <AICharacter isVisible={true} isProcessing={true} isComplete={true} />
        </div>

        {/* Dynamic Stage Copy */}
        <div className="mt-4 min-h-[140px] flex flex-col items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {currentStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="space-y-2 w-full"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={12} className="text-[#ADFF00]" />
                  <span>Payment Verified • {planName.toUpperCase()} Unlocked</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome to <span className="text-[#ADFF00]">Pro Tier</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
                  Your payment has been confirmed. Unlocking unrestricted AI mesocycle generation and personalized nutrition.
                </p>
              </motion.div>
            )}

            {currentStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="space-y-2 w-full"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 text-[#ADFF00] text-[10px] font-black uppercase tracking-widest">
                  <Brain size={12} className="text-[#ADFF00] animate-pulse" />
                  <span>Loki & Luna AI Calibrating</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Analyzing Your Biometrics
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
                  Synthesizing your BMR, target weight trajectory, and tailored food environment with 100% whole natural foods.
                </p>
              </motion.div>
            )}

            {currentStage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="space-y-2 w-full"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Assembling Master Blueprint</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Unlocking <span className="text-[#ADFF00]">Custom Mesocycle</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
                  Generating progressive workout splits, Indian nutrition meals, and 30-day grocery shopping lists.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3 Interactive Milestones */}
        <div className="grid grid-cols-3 gap-2 w-full mt-4">
          <div
            className={cn(
              "rounded-2xl p-2.5 border text-center transition-all duration-300",
              currentStage >= 1
                ? "bg-[#102410] border-[#ADFF00]/40 text-[#ADFF00]"
                : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
            <div className="flex justify-center mb-1">
              {currentStage > 1 ? (
                <CheckCircle2 size={16} className="text-[#ADFF00]" />
              ) : (
                <Zap size={16} className="text-[#ADFF00] animate-pulse" />
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider">Payment</p>
            <p className="text-[9px] text-gray-400">Verified</p>
          </div>

          <div
            className={cn(
              "rounded-2xl p-2.5 border text-center transition-all duration-300",
              currentStage >= 2
                ? "bg-[#102410] border-[#ADFF00]/40 text-[#ADFF00]"
                : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
            <div className="flex justify-center mb-1">
              {currentStage > 2 ? (
                <CheckCircle2 size={16} className="text-[#ADFF00]" />
              ) : (
                <Activity size={16} className={cn(currentStage === 2 ? "text-[#ADFF00] animate-pulse" : "text-gray-500")} />
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider">Metabolism</p>
            <p className="text-[9px] text-gray-400">Calibrated</p>
          </div>

          <div
            className={cn(
              "rounded-2xl p-2.5 border text-center transition-all duration-300",
              currentStage >= 3
                ? "bg-[#102410] border-[#ADFF00]/40 text-[#ADFF00]"
                : "bg-white/5 border-white/10 text-gray-500"
            )}
          >
            <div className="flex justify-center mb-1">
              <Dumbbell size={16} className={cn(currentStage === 3 ? "text-[#ADFF00] animate-pulse" : "text-gray-500")} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider">Mesocycle</p>
            <p className="text-[9px] text-gray-400">Generating</p>
          </div>
        </div>
      </main>

      {/* Bottom Progress Bar & Action CTA */}
      <footer className="relative z-10 w-full max-w-md mx-auto space-y-4 pb-2">
        {/* Progress Bar with Percentage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
            <span className="text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-ping" />
              {currentStage === 1
                ? "Activating Pro Access..."
                : currentStage === 2
                ? "Synthesizing Biometric Targets..."
                : "Finalizing Plan Blueprint..."}
            </span>
            <span className="text-[#ADFF00]">{Math.round(progress)}%</span>
          </div>

          <div className="w-full bg-[#121E12] border border-[#1A2619] rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#ADFF00] via-[#10B981] to-[#ADFF00] rounded-full shadow-[0_0_12px_rgba(173,255,0,0.7)] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleFinish}
          disabled={isFinishing}
          className="w-full py-4 px-6 rounded-2xl bg-[#ADFF00] hover:bg-[#bfff2e] active:scale-[0.98] text-black font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(173,255,0,0.35)] transition-all cursor-pointer disabled:opacity-75"
        >
          {isFinishing ? (
            <span>Opening Your Plan...</span>
          ) : (
            <>
              <span>Jump to Plan Now</span>
              <span className="bg-black/15 text-black px-2 py-0.5 rounded-full text-xs font-mono font-black">
                {remainingSeconds}s
              </span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
