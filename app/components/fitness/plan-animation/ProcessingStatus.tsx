"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnimationPhase } from "./useAnimationTimeline";

interface ProcessingStatusProps {
  phase: AnimationPhase;
  scanIndex: number;
  pillLabels: string[];
}

export function ProcessingStatus({ phase, scanIndex, pillLabels }: ProcessingStatusProps) {
  const getStatusText = (): string => {
    switch (phase) {
      case "BOOT":
        return "";
      case "AI_APPEAR":
        return "INITIALIZING AI...";
      case "DATA_ENTER":
        return "READING FITNESS PROFILE...";
      case "NETWORK_ROTATE":
        return "ANALYZING YOUR FITNESS PROFILE...";
      case "ANALYZING": {
        const current = pillLabels[scanIndex];
        if (current) return `ANALYZING ${current.toUpperCase()}...`;
        return "ANALYZING TRAINING GOALS...";
      }
      case "DATA_COLLAPSE":
        return "OPTIMIZING YOUR WORKOUT...";
      case "AI_ALONE":
        return "CALCULATING NUTRITION TARGETS...";
      case "PLAN_GENERATING":
        return "GENERATING YOUR PLAN...";
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
    <div className="flex flex-col items-center justify-center text-center px-6">
      {showHeading && (
        <>
          <h2
            className="text-lg sm:text-xl font-black text-white mb-1.5"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
          >
            Building your perfect plan...
          </h2>
          <p
            className="text-xs sm:text-sm text-gray-400 mb-3"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
          >
            AI is analyzing your body scan and fitness profile...
          </p>
        </>
      )}

      <div className="h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {statusText && (
            <motion.div
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="uppercase text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#39FF14]"
              style={{ textShadow: "0 0 10px rgba(57,255,20,0.4)" }}
            >
              {statusText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
