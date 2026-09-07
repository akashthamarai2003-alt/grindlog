"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleCheck } from "lucide-react";
import type { AnimationPhase } from "./useAnimationTimeline";

interface ProcessingStatusProps {
  phase: AnimationPhase;
  scanIndex: number;
  pillLabels: string[];
  hasError?: boolean;
}

export function ProcessingStatus({
  phase,
  scanIndex,
  pillLabels,
  hasError = false,
}: ProcessingStatusProps) {
  const getStatusText = (): string => {
    if (hasError && (phase === "TRANSITION" || phase === "COMPLETE")) {
      return "GENERATION NEEDS YOUR ATTENTION";
    }

    switch (phase) {
      case "BOOT":
        return "";
      case "AI_APPEAR":
        return "INITIALIZING AI...";
      case "DATA_ENTER":
        return "READING FITNESS PROFILE...";
      case "NETWORK_FULL":
        return "ANALYZING YOUR FITNESS PROFILE...";
      case "ANALYZING": {
        const current = pillLabels[scanIndex];
        if (current) return `ANALYZING ${current.toUpperCase()}...`;
        return "ANALYZING FITNESS PROFILE...";
      }
      case "DATA_COLLAPSE":
        return "FINALIZING YOUR PERSONALIZED PLAN...";
      case "AI_ALONE":
        return "VALIDATING YOUR PLAN...";
      case "FINAL_REVEAL":
      case "TRANSITION":
      case "COMPLETE":
        return "YOUR PERSONALIZED PLAN IS READY";
      default:
        return "PROCESSING...";
    }
  };

  const showHeading = phase !== "BOOT";
  const statusText = getStatusText();
  const isFinalReveal = phase === "FINAL_REVEAL" || phase === "TRANSITION" || phase === "COMPLETE";

  return (
    <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-20">
      <AnimatePresence mode="wait">
        {isFinalReveal && (
          <motion.div
            key="final-check-badge"
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex items-center justify-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ADFF00]/70 bg-[#ADFF00]/15 text-[#ADFF00] shadow-[0_0_25px_rgba(173,255,0,0.35)]">
              <CircleCheck size={26} strokeWidth={2.5} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showHeading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={isFinalReveal ? "plan-ready" : "building-plan"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center"
          >
            <h2
              className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-tight"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
            >
              {isFinalReveal ? "Your plan is ready" : "Building your perfect plan..."}
            </h2>
            <p
              className="text-xs sm:text-sm text-gray-400 mb-3 max-w-xs sm:max-w-md"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
            >
              {isFinalReveal
                ? "Luna has finished your personalised plan."
                : "AI is analyzing your body scan and fitness profile..."}
            </p>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {statusText && (
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="uppercase text-xs sm:text-sm font-extrabold tracking-[0.22em] text-[#39FF14]"
              style={{ textShadow: "0 0 12px rgba(57,255,20,0.5)" }}
            >
              {statusText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
