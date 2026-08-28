"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AICharacterProps {
  isVisible: boolean;
  isProcessing: boolean;
  isComplete: boolean;
}

/**
 * Central character — 100-120px on mobile, positioned by parent.
 * Subtle floating/breathing animation. Glow reacts to processing.
 */
export function AICharacter({ isVisible, isProcessing, isComplete }: AICharacterProps) {
  const reduced = useReducedMotion();
  const glow = isComplete ? 0.65 : isProcessing ? 0.5 : 0.3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, filter: "blur(6px)" }}
      animate={
        isVisible
          ? { opacity: 1, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, scale: 0.75, filter: "blur(6px)" }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.img
        src="/images/b_remove_background_fo.png"
        alt="GrindLog AI"
        className="object-contain object-center"
        style={{
          width: "clamp(100px, 28vw, 140px)",
          height: "clamp(120px, 35vw, 170px)",
          filter: `drop-shadow(0 0 22px rgba(57,255,20,${glow}))`,
        }}
        animate={
          reduced
            ? {}
            : isProcessing
            ? { scale: [1, 1.03, 1] }
            : { y: [0, -4, 0], scale: [1, 1.015, 1] }
        }
        transition={
          isProcessing
            ? { duration: 0.35, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
}
