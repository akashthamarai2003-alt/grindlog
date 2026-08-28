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
}

// Evenly distributed radial constellation slots (10 distinct non-colliding sectors)
const RADIAL_SLOTS = [
  { nx: 0,     ny: -1.0,  angle: -90 },  // 0: Top
  { nx: 0.68,  ny: -0.72, angle: -54 },  // 1: Upper-Right
  { nx: 0.96,  ny: -0.22, angle: -18 },  // 2: Right-Upper
  { nx: 0.96,  ny: 0.22,  angle: 18 },   // 3: Right-Lower
  { nx: 0.68,  ny: 0.72,  angle: 54 },   // 4: Lower-Right
  { nx: 0,     ny: 1.0,   angle: 90 },   // 5: Bottom
  { nx: -0.68, ny: 0.72,  angle: 126 },  // 6: Lower-Left
  { nx: -0.96, ny: 0.22,  angle: 162 },  // 7: Left-Lower
  { nx: -0.96, ny: -0.22, angle: -162 }, // 8: Left-Upper
  { nx: -0.68, ny: -0.72, angle: -126 }, // 9: Upper-Left
];

function getPillState(phase: AnimationPhase, pillIdx: number, scanIdx: number): PillState {
  switch (phase) {
    case "BOOT":
    case "AI_APPEAR":
      return "hidden";
    case "DATA_ENTER":
      return "entering";
    case "NETWORK_FULL":
      return "visible";
    case "ANALYZING":
      return scanIdx === pillIdx ? "processing" : "visible";
    case "DATA_COLLAPSE":
      return "collapsing";
    default:
      return "hidden";
  }
}

export default function DataNetwork({ pills, phase, scanIndex }: DataNetworkProps) {
  const showPills =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_FULL" ||
    phase === "ANALYZING" ||
    phase === "DATA_COLLAPSE";

  // Fixed responsive radii calculated safely with clamp
  const rx = 135;
  const ry = 185;

  // Compute exact positions for each pill
  const pillNodes = useMemo(() => {
    return pills.map((pill, idx) => {
      const slot = RADIAL_SLOTS[idx % RADIAL_SLOTS.length];
      const px = slot.nx * rx;
      const py = slot.ny * ry;
      return {
        pill,
        idx,
        px,
        py,
        entryAngle: slot.angle,
      };
    });
  }, [pills, rx, ry]);

  if (!showPills) return null;

  return (
    <div
      className="network-spin-container"
      style={{
        position: "absolute",
        left: "50%",
        top: "43%",
        transform: "translate(-50%, -50%)",
        width: 0,
        height: 0,
        zIndex: 10,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <style>{`
        @keyframes constNetworkSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pillCounterSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        .network-spin-container {
          animation: constNetworkSpin 75s linear infinite;
        }
        .pill-counter-rotator {
          animation: pillCounterSpin 75s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .network-spin-container, .pill-counter-rotator {
            animation: none !important;
          }
        }
      `}</style>

      {/* SVG Connection Lines Layer */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: -400,
          top: -400,
          width: 800,
          height: 800,
          overflow: "visible",
          zIndex: 4,
          willChange: "transform",
        }}
        viewBox="-400 -400 800 800"
      >
        {pillNodes.map((node) => {
          const lineLength = Math.hypot(node.px, node.py);
          const state = getPillState(phase, node.idx, scanIndex);
          const isVisible = state !== "hidden";
          const isScanning = scanIndex === node.idx && phase === "ANALYZING";

          return (
            <g key={`line-${node.pill.key}`}>
              {/* Radial connection line */}
              <motion.line
                x1={0}
                y1={0}
                x2={node.px}
                y2={node.py}
                stroke={isScanning ? "#39FF14" : "rgba(34, 197, 94, 0.32)"}
                strokeWidth={isScanning ? 1.4 : 0.85}
                initial={{
                  strokeDasharray: lineLength,
                  strokeDashoffset: lineLength,
                  opacity: 0,
                }}
                animate={{
                  strokeDashoffset: isVisible ? 0 : lineLength,
                  opacity: isVisible ? (isScanning ? 0.9 : 0.35) : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.55,
                    delay: node.idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.25, delay: node.idx * 0.08 },
                }}
              />

              {/* Energy pulse traveling toward AI during active scanning */}
              {isScanning && (
                <g>
                  {/* Outer pulse halo */}
                  <motion.circle
                    r={5}
                    fill="rgba(57, 255, 20, 0.3)"
                    initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                    animate={{
                      cx: [node.px, 0],
                      cy: [node.py, 0],
                      opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                  {/* Core energy dot */}
                  <motion.circle
                    r={2.5}
                    fill="#39FF14"
                    initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                    animate={{
                      cx: [node.px, 0],
                      cy: [node.py, 0],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Fitness Data Pills */}
      {pillNodes.map((node) => {
        const state = getPillState(phase, node.idx, scanIndex);
        return (
          <FitnessDataPill
            key={node.pill.key}
            icon={node.pill.icon}
            label={node.pill.label}
            state={state}
            entryAngle={node.entryAngle}
            enterDelay={node.idx * 0.08}
            collapseDelay={node.idx * 0.07}
            style={{
              left: `${node.px}px`,
              top: `${node.py}px`,
            }}
          />
        );
      })}
    </div>
  );
}
