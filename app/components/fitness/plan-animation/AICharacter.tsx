"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AICharacterProps {
  isVisible: boolean;
  isProcessing: boolean;
  isComplete: boolean;
}

export function AICharacter({ isVisible, isProcessing, isComplete }: AICharacterProps) {
  const shouldReduceMotion = useReducedMotion();

  const glowIntensity = isComplete ? 0.7 : isProcessing ? 0.55 : 0.3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={
        isVisible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.7 }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <motion.img
        src="/images/b_remove_background_fo.png"
        alt="GrindLog AI"
        className="w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] object-contain object-top"
        style={{
          filter: `drop-shadow(0 0 18px rgba(57,255,20,${glowIntensity}))`,
        }}
        animate={
          shouldReduceMotion
            ? {}
            : isProcessing
            ? {
                scale: [1.0, 1.035, 1.0],
              }
            : {
                y: [0, -4, 0],
                scale: [1.0, 1.02, 1.0],
              }
        }
        transition={
          isProcessing
            ? { duration: 0.4, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
}
