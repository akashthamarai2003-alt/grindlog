"use client";
import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type PillState = "hidden" | "entering" | "visible" | "processing" | "collapsing";

interface FitnessDataPillProps {
  icon: LucideIcon;
  label: string;
  state: PillState;
  entryAngle: number;
  enterDelay: number;
  collapseDelay: number;
  style?: React.CSSProperties;
}

/**
 * High-performance, GPU-accelerated data pill.
 * Uses hardware-accelerated transforms and opacity only (no blur filters to prevent mobile GPU glitching).
 */
export function FitnessDataPill({
  icon: Icon,
  label,
  state,
  entryAngle,
  enterDelay,
  collapseDelay,
  style,
}: FitnessDataPillProps) {
  const rad = (entryAngle * Math.PI) / 180;
  const ex = Math.cos(rad) * 110;
  const ey = Math.sin(rad) * 110;

  let animateProps: Record<string, any> = {};
  let transitionProps: Record<string, any> = {};

  switch (state) {
    case "hidden":
      animateProps = {
        opacity: 0,
        scale: 0.7,
        x: ex,
        y: ey,
      };
      transitionProps = { duration: 0 };
      break;
    case "entering":
      animateProps = {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
      };
      transitionProps = {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: enterDelay,
      };
      break;
    case "visible":
      animateProps = {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        borderColor: "rgba(34, 197, 94, 0.65)",
        backgroundColor: "rgba(7, 22, 7, 0.95)",
        boxShadow: "0 0 12px rgba(34, 197, 94, 0.3), 0 4px 14px rgba(0, 0, 0, 0.7)",
      };
      transitionProps = {
        duration: 0.25,
      };
      break;
    case "processing":
      animateProps = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: [1, 1.07, 1],
        borderColor: "#39FF14",
        backgroundColor: "rgba(10, 35, 10, 0.98)",
        boxShadow: "0 0 22px rgba(57, 255, 20, 0.5), 0 0 40px rgba(34, 197, 94, 0.25)",
      };
      transitionProps = {
        duration: 0.45,
        scale: { duration: 0.45, ease: "easeInOut" },
      };
      break;
    case "collapsing":
      animateProps = {
        opacity: 0,
        scale: 0.1,
      };
      transitionProps = {
        duration: 0.55,
        delay: collapseDelay,
        ease: "easeIn",
      };
      break;
  }

  return (
    <div
      style={{
        zIndex: 15,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <motion.div
        className="flex items-center gap-2 whitespace-nowrap
          border border-[rgba(22,163,74,0.55)]
          rounded-full select-none"
        style={{
          padding: "7px 13px",
          minHeight: "36px",
          willChange: "transform, opacity",
        }}
        initial={{
          opacity: 0,
          scale: 0.7,
          x: ex,
          y: ey,
        }}
        animate={animateProps}
        transition={transitionProps}
      >
        <Icon
          size={15}
          className="shrink-0 transition-colors duration-200"
          style={{ color: state === "processing" ? "#39FF14" : "#22c55e" }}
        />
        <span
          className="font-bold tracking-wide transition-colors duration-200"
          style={{
            fontSize: "clamp(12px, 3.2vw, 14px)",
            color: state === "processing" ? "#f0fdf4" : "#ffffff",
          }}
        >
          {label}
        </span>
      </motion.div>
    </div>
  );
}
