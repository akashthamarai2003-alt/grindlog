"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { FitnessDataPill, type PillState } from "./FitnessDataPill";
import type { AnimationPhase } from "./useAnimationTimeline";

export interface PillData {
  icon: LucideIcon;
  label: string;
  key: string;
}

interface DataNetworkProps {
  pills: PillData[];
  phase: AnimationPhase;
  scanIndex: number;
  containerWidth: number;
  containerHeight: number;
}

// Organic radial positions as percentages [left%, top%]
// Designed for 10 pills max, positioned around a center at [50%, 45%]
const PILL_POSITIONS: [number, number][] = [
  [55, 7],    // top center-right
  [78, 14],   // upper right
  [88, 33],   // right upper
  [90, 55],   // right lower
  [78, 72],   // lower right
  [55, 82],   // bottom center-right
  [28, 78],   // bottom center-left
  [10, 58],   // left lower
  [8, 35],    // left upper
  [25, 14],   // upper left
];

// Center of the AI character in percentage
const CENTER_X = 50;
const CENTER_Y = 45;

function getPillState(
  phase: AnimationPhase,
  pillIndex: number,
  scanIndex: number,
  totalPills: number
): PillState {
  // Before data enters
  if (
    phase === "BOOT" ||
    phase === "AI_APPEAR" ||
    phase === "ORBIT_START"
  ) {
    return "hidden";
  }

  // During data entrance
  if (phase === "DATA_ENTER") {
    return "entering";
  }

  // Network complete - all visible
  if (phase === "NETWORK_COMPLETE") {
    return "visible";
  }

  // Analyzing - scan highlights
  if (phase === "ANALYZING") {
    if (scanIndex === pillIndex) return "processing";
    return "visible";
  }

  // Data processed - all visible (peak moment)
  if (phase === "DATA_PROCESSED") {
    return "visible";
  }

  // Collapsing
  if (phase === "NETWORK_COLLAPSE") {
    return "collapsing";
  }

  // After collapse - hidden
  return "hidden";
}

export default function DataNetwork({
  pills,
  phase,
  scanIndex,
  containerWidth,
  containerHeight,
}: DataNetworkProps) {
  const positions = useMemo(() => {
    return pills.map((_, i) => {
      const pos = PILL_POSITIONS[i % PILL_POSITIONS.length];
      return { left: pos[0], top: pos[1] };
    });
  }, [pills.length]);

  const showLines =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_COMPLETE" ||
    phase === "ANALYZING" ||
    phase === "DATA_PROCESSED";

  const showPulse = phase === "ANALYZING" && scanIndex >= 0;

  // Convert percentage positions to pixel for SVG lines
  const centerPx = {
    x: (CENTER_X / 100) * containerWidth,
    y: (CENTER_Y / 100) * containerHeight,
  };

  return (
    <>
      {/* SVG Connection Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {pills.map((pill, i) => {
          const pos = positions[i];
          const pillPx = {
            x: (pos.left / 100) * containerWidth,
            y: (pos.top / 100) * containerHeight,
          };
          const state = getPillState(phase, i, scanIndex, pills.length);
          const isActive = state !== "hidden";
          const isScanning = scanIndex === i && phase === "ANALYZING";

          // Calculate line length for dash animation
          const dx = pillPx.x - centerPx.x;
          const dy = pillPx.y - centerPx.y;
          const lineLength = Math.sqrt(dx * dx + dy * dy);

          return (
            <g key={pill.key}>
              <motion.line
                x1={centerPx.x}
                y1={centerPx.y}
                x2={pillPx.x}
                y2={pillPx.y}
                stroke={isScanning ? "#39FF14" : "#16A34A"}
                strokeWidth={isScanning ? 1.2 : 0.8}
                initial={{
                  strokeDasharray: lineLength,
                  strokeDashoffset: lineLength,
                  opacity: 0,
                }}
                animate={{
                  strokeDashoffset: showLines && isActive ? 0 : lineLength,
                  opacity: showLines && isActive ? (isScanning ? 0.6 : 0.2) : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.8,
                    delay: isActive ? i * 0.12 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.4, delay: isActive ? i * 0.12 : 0 },
                }}
              />

              {/* Energy pulse traveling along line when scanning */}
              {isScanning && (
                <motion.circle
                  r={3}
                  fill="#39FF14"
                  filter="url(#pulseGlow)"
                  initial={{ cx: pillPx.x, cy: pillPx.y, opacity: 0 }}
                  animate={{
                    cx: [pillPx.x, centerPx.x],
                    cy: [pillPx.y, centerPx.y],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Glow filter for pulse */}
        <defs>
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Data Pills */}
      {pills.map((pill, i) => {
        const pos = positions[i];
        const state = getPillState(phase, i, scanIndex, pills.length);

        return (
          <FitnessDataPill
            key={pill.key}
            icon={pill.icon}
            label={pill.label}
            state={state}
            delay={i * 0.13}
            style={{
              position: "absolute",
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          />
        );
      })}
    </>
  );
}
