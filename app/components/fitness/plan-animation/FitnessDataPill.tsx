"use client";
import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type PillState = "hidden" | "entering" | "visible" | "processing" | "collapsing";

interface FitnessDataPillProps {
  icon: LucideIcon;
  label: string;
  state: PillState;
  /** Entry direction — used for the entrance translation offset */
  entryAngle: number;
  /** Stagger delay in seconds for entrance */
  delay: number;
  /** Stagger delay in seconds for collapse */
  collapseDelay: number;
  /** Counter-rotation to keep text upright while parent rotates */
  counterRotation: number;
  style?: React.CSSProperties;
}

/**
 * Individual data pill that enters from outside the composition,
 * can be highlighted during processing, and collapses toward center.
 */
export function FitnessDataPill({
  icon: Icon,
  label,
  state,
  entryAngle,
  delay,
  collapseDelay,
  counterRotation,
  style,
}: FitnessDataPillProps) {
  // Calculate entry offset — pill comes from 150px away along its entry angle
  const entryDist = 150;
  const entryX = Math.cos((entryAngle * Math.PI) / 180) * entryDist;
  const entryY = Math.sin((entryAngle * Math.PI) / 180) * entryDist;

  let animateProps: Record<string, any> = {};
  let transitionProps: Record<string, any> = {};

  switch (state) {
    case "hidden":
      animateProps = {
        opacity: 0,
        scale: 0.75,
        filter: "blur(5px)",
        x: entryX,
        y: entryY,
      };
      transitionProps = { duration: 0 };
      break;

    case "entering":
      animateProps = {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
      };
      transitionProps = {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
        delay,
      };
      break;

    case "visible":
      animateProps = {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        borderColor: "rgba(22,163,74,0.5)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      };
      transitionProps = { duration: 0.25 };
      break;

    case "processing":
      animateProps = {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        borderColor: "#39FF14",
        boxShadow: "0 0 14px rgba(57,255,20,0.3)",
        scale: [1, 1.08, 1],
      };
      transitionProps = {
        duration: 0.45,
        scale: { duration: 0.45, ease: "easeInOut" },
      };
      break;

    case "collapsing":
      animateProps = {
        opacity: 0,
        scale: 0.4,
        filter: "blur(3px)",
        x: -entryX * 0.6,
        y: -entryY * 0.6,
      };
      transitionProps = {
        duration: 0.7,
        delay: collapseDelay,
        ease: [0.16, 1, 0.3, 1],
      };
      break;
  }

  return (
    <motion.div
      style={{
        ...style,
        // Counter-rotate to keep text upright while network spins
        transform: `rotate(${counterRotation}deg)`,
      }}
      initial={{
        opacity: 0,
        scale: 0.75,
        filter: "blur(5px)",
        x: entryX,
        y: entryY,
      }}
      animate={animateProps}
      transition={transitionProps}
      className="absolute flex items-center gap-1.5 whitespace-nowrap
        bg-[#071507]/90 border border-[rgba(22,163,74,0.5)]
        px-2.5 py-1 rounded-full
        shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
    >
      <Icon size={12} className="text-[#39FF14] shrink-0" />
      <span
        className="text-[10px] sm:text-[11px] font-bold tracking-wide transition-colors duration-200"
        style={{ color: state === "processing" ? "#a7f3d0" : "#ffffff" }}
      >
        {label}
      </span>
    </motion.div>
  );
}
