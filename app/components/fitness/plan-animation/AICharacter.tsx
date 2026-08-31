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
 * Clean GPU hardware compositing without memory-corrupting blur filters.
 */
export function AICharacter({ isVisible, isProcessing, isComplete }: AICharacterProps) {
  const reduced = useReducedMotion();
  const glow = isComplete ? 0.65 : isProcessing ? 0.5 : 0.3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={
        isVisible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.75 }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      <div className={isComplete ? "loki-atomic" : undefined}>
        {isComplete && <span className="loki-atomic__orbit" aria-hidden="true" />}
        <motion.img
          src="/images/b_remove_background_fo.png"
          alt="GrindLog AI"
          className="object-contain object-center select-none"
          style={{
            width: "clamp(100px, 28vw, 140px)",
            height: "clamp(120px, 35vw, 170px)",
            filter: `drop-shadow(0 0 20px rgba(57,255,20,${glow}))`,
            willChange: "transform",
          }}
          animate={
            reduced
              ? {}
              : isComplete
              ? { scale: [1.08, 1.24, 1.16, 1.24], y: [0, -3, 0, -3] }
              : isProcessing
              ? { scale: [1, 1.03, 1] }
              : { y: [0, -4, 0], scale: [1, 1.015, 1] }
          }
          transition={
            isComplete
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : isProcessing
              ? { duration: 0.35, ease: "easeInOut" }
              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </div>
      <style>{`
        .loki-atomic { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .loki-atomic__orbit {
          position: absolute; width: 155%; height: 115%; border: 1px solid rgba(57,255,20,.8);
          border-radius: 50%; transform: rotate(-18deg); box-shadow: 0 0 14px rgba(57,255,20,.55);
          animation: lokiAtomicOrbit 3s linear infinite; pointer-events: none;
        }
        .loki-atomic__orbit::after {
          content: ""; position: absolute; width: 7px; height: 7px; border-radius: 50%;
          background: #39ff14; box-shadow: 0 0 10px #39ff14; left: 50%; top: -4px;
        }
        @keyframes lokiAtomicOrbit { to { transform: rotate(342deg); } }
        @media (prefers-reduced-motion: reduce) { .loki-atomic__orbit { animation: none; } }
      `}</style>
    </motion.div>
  );
}
