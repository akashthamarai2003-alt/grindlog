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

  let opacity = 0;
  let scale = 0.7;
  let transform = `translate(${ex}px, ${ey}px)`;
  let transition = "none";
  let borderColor = "rgba(22,163,74,0.55)";
  let backgroundColor = "rgba(6, 21, 6, 0.85)";
  let boxShadow = "none";
  let iconColor = "#22c55e";
  let textColor = "#ffffff";

  switch (state) {
    case "hidden":
      break;
    case "entering":
      // Enter from the profile point with an explicit keyframe. A transition
      // cannot animate reliably when this element is mounted already at its
      // destination value.
      opacity = 0;
      scale = 0.7;
      transform = `translate(${ex}px, ${ey}px)`;
      transition = "none";
      break;
    case "visible":
      opacity = 1;
      scale = 1;
      transform = `translate(0px, 0px)`;
      transition = "all 0.25s ease";
      borderColor = "rgba(34, 197, 94, 0.65)";
      backgroundColor = "rgba(7, 22, 7, 0.95)";
      boxShadow = "0 0 12px rgba(34, 197, 94, 0.3), 0 4px 14px rgba(0, 0, 0, 0.7)";
      break;
    case "processing":
      opacity = 1;
      scale = 1.05;
      transform = `translate(0px, 0px)`;
      transition = "all 0.45s ease-in-out";
      borderColor = "#39FF14";
      backgroundColor = "rgba(10, 35, 10, 0.98)";
      boxShadow = "0 0 22px rgba(57, 255, 20, 0.5), 0 0 40px rgba(34, 197, 94, 0.25)";
      iconColor = "#39FF14";
      textColor = "#f0fdf4";
      break;
    case "collapsing":
      opacity = 0;
      scale = 0.1;
      transform = `translate(0px, 0px)`;
      transition = `opacity 0.55s ease-in ${collapseDelay}s, transform 0.55s ease-in ${collapseDelay}s`;
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
      <div
        className="flex items-center gap-2 whitespace-nowrap rounded-full select-none"
        style={{
          border: `1px solid ${borderColor}`,
          backgroundColor,
          boxShadow,
          padding: "7px 13px",
          minHeight: "36px",
          opacity,
          transform: `${transform} scale(${scale})`,
          transition,
          animation: state === "entering"
            ? `lokiPillEnter 0.6s cubic-bezier(0.16,1,0.3,1) ${enterDelay}s both`
            : "none",
          ["--entry-x" as string]: `${ex}px`,
          ["--entry-y" as string]: `${ey}px`,
          willChange: "transform, opacity, border-color, background-color, box-shadow",
        }}
      >
        <Icon
          size={15}
          className="shrink-0 transition-colors duration-200"
          style={{ color: iconColor }}
        />
        <span
          className="font-bold tracking-wide transition-colors duration-200"
          style={{
            fontSize: "clamp(12px, 3.2vw, 14px)",
            color: textColor,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
