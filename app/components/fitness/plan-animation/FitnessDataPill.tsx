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
  counterRotation: number;
  style?: React.CSSProperties;
}

/**
 * Large, highly readable data pill (height ~42-48px, font 14-16px).
 * Enters from outside along entryAngle, collapses toward center.
 * Counter-rotates smoothly so text remains strictly horizontal.
 */
export function FitnessDataPill({
  icon: Icon,
  label,
  state,
  entryAngle,
  enterDelay,
  collapseDelay,
  counterRotation,
  style,
}: FitnessDataPillProps) {
  const rad = (entryAngle * Math.PI) / 180;
  const ex = Math.cos(rad) * 140;
  const ey = Math.sin(rad) * 140;

  let animateProps: Record<string, any> = {};
  let transitionProps: Record<string, any> = {};

  switch (state) {
    case "hidden":
      animateProps = {
        opacity: 0,
        scale: 0.75,
        filter: "blur(5px)",
        x: ex,
        y: ey,
        rotate: counterRotation,
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
        rotate: counterRotation,
      };
      transitionProps = {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
        delay: enterDelay,
        rotate: { duration: 0 },
      };
      break;
    case "visible":
      animateProps = {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        rotate: counterRotation,
        borderColor: "rgba(22, 163, 74, 0.6)",
        backgroundColor: "rgba(10, 26, 10, 0.92)",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
      };
      transitionProps = {
        duration: 0.25,
        rotate: { duration: 0 },
      };
      break;
    case "processing":
      animateProps = {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        rotate: counterRotation,
        scale: [1, 1.07, 1],
        borderColor: "#39FF14",
        backgroundColor: "rgba(14, 42, 14, 0.96)",
        boxShadow: "0 0 20px rgba(57, 255, 20, 0.35)",
      };
      transitionProps = {
        duration: 0.45,
        scale: { duration: 0.45, ease: "easeInOut" },
        rotate: { duration: 0 },
      };
      break;
    case "collapsing":
      animateProps = {
        opacity: 0,
        scale: 0.45,
        filter: "blur(4px)",
        x: -ex * 0.75,
        y: -ey * 0.75,
        rotate: counterRotation,
      };
      transitionProps = {
        duration: 0.65,
        delay: collapseDelay,
        ease: [0.16, 1, 0.3, 1],
        rotate: { duration: 0 },
      };
      break;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: style?.left,
        top: style?.top,
        transform: "translate(-50%, -50%)",
        zIndex: 15,
        pointerEvents: "none",
      }}
    >
      <motion.div
        className="flex items-center gap-2 whitespace-nowrap
          border border-[rgba(22,163,74,0.6)]
          rounded-full select-none"
        style={{
          padding: "10px 18px",
          minHeight: "44px",
        }}
        initial={{
          opacity: 0,
          scale: 0.75,
          filter: "blur(5px)",
          x: ex,
          y: ey,
          rotate: counterRotation,
        }}
        animate={animateProps}
        transition={transitionProps}
      >
        <Icon
          size={18}
          className="shrink-0 transition-colors duration-200"
          style={{ color: state === "processing" ? "#39FF14" : "#22c55e" }}
        />
        <span
          className="font-bold tracking-wide transition-colors duration-200"
          style={{
            fontSize: "clamp(13.5px, 3.8vw, 16px)",
            color: state === "processing" ? "#f0fdf4" : "#ffffff",
          }}
        >
          {label}
        </span>
      </motion.div>
    </div>
  );
}
