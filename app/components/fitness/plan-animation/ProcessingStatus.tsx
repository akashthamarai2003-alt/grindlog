"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      case "TRANSITION":
      case "COMPLETE":
        return "PLAN READY";
      default:
        return "PROCESSING...";
    }
  };

  const showHeading = phase !== "BOOT";
  const statusText = getStatusText();

  return (
    <div className="absolute bottom-6 sm:bottom-10 inset-x-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-20">
      {showHeading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <h2
            className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-tight"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
          >
            Building your perfect plan...
          </h2>
          <p
            className="text-xs sm:text-sm text-gray-400 mb-3 max-w-xs sm:max-w-md"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
          >
            AI is analyzing your body scan and fitness profile...
          </p>
        </motion.div>
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
