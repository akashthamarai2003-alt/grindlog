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
        {isComplete && (
          <span className="loki-atomic__orbits" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index} className="loki-atomic__orbit" />
            ))}
          </span>
        )}
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
        .loki-atomic__orbits { position: absolute; inset: -30% -38%; pointer-events: none; }
        .loki-atomic__orbit {
          position: absolute; inset: 0; border: 1px solid rgba(57,255,20,.72);
          border-radius: 50%; box-shadow: 0 0 10px rgba(57,255,20,.28);
          animation: lokiAtomicOrbit 3s linear infinite; pointer-events: none;
        }
        .loki-atomic__orbit:nth-child(1) { transform: rotate(0deg) scaleY(.58); }
        .loki-atomic__orbit:nth-child(2) { transform: rotate(30deg) scaleY(.58); animation-delay: -0.15s; }
        .loki-atomic__orbit:nth-child(3) { transform: rotate(60deg) scaleY(.58); animation-delay: -0.3s; }
        .loki-atomic__orbit:nth-child(4) { transform: rotate(90deg) scaleY(.58); animation-delay: -0.45s; }
        .loki-atomic__orbit:nth-child(5) { transform: rotate(120deg) scaleY(.58); animation-delay: -0.6s; }
        .loki-atomic__orbit:nth-child(6) { transform: rotate(150deg) scaleY(.58); animation-delay: -0.75s; }
        .loki-atomic__orbit:first-child::after {
          content: ""; position: absolute; width: 7px; height: 7px; border-radius: 50%;
          background: #39ff14; box-shadow: 0 0 10px #39ff14; left: 50%; top: -4px;
        }
        @keyframes lokiAtomicOrbit { to { rotate: 360deg; } }
        @media (prefers-reduced-motion: reduce) { .loki-atomic__orbit { animation: none; } }
      `}</style>
    </motion.div>
  );
}
