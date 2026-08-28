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

// 10 evenly spaced, non-colliding radial slots with wide clearance
const RADIAL_SLOTS = [
  { nx: 0,     ny: -1.0,  angle: -90 },  // 0: Top
  { nx: 0.62,  ny: -0.76, angle: -50 },  // 1: Upper-Right
  { nx: 0.96,  ny: -0.28, angle: -16 },  // 2: Right-Upper
  { nx: 0.96,  ny: 0.28,  angle: 16 },   // 3: Right-Lower
  { nx: 0.62,  ny: 0.76,  angle: 50 },   // 4: Lower-Right
  { nx: 0,     ny: 1.0,   angle: 90 },   // 5: Bottom
  { nx: -0.62, ny: 0.76,  angle: 130 },  // 6: Lower-Left
  { nx: -0.96, ny: 0.28,  angle: 164 },  // 7: Left-Lower
  { nx: -0.96, ny: -0.28, angle: -164 }, // 8: Left-Upper
  { nx: -0.62, ny: -0.76, angle: -130 }, // 9: Upper-Left
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

// Generates an organic curved timeline branch path (Loki Season 2 finale style)
function getBranchPath(x: number, y: number, idx: number) {
  const curveMagnitude = (idx % 2 === 0 ? 1 : -1) * 20;
  const len = Math.hypot(x, y) || 1;
  const perpX = (-y / len) * curveMagnitude;
  const perpY = (x / len) * curveMagnitude;
  const cx = x * 0.5 + perpX;
  const cy = y * 0.5 + perpY;
  return `M 0,0 Q ${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
}

export default function DataNetwork({ pills, phase, scanIndex }: DataNetworkProps) {
  const showPills =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_FULL" ||
    phase === "ANALYZING" ||
    phase === "DATA_COLLAPSE";

  // Large, spacious radii utilizing the extra top & bottom space
  const rx = 135;
  const ry = 228;

  // Compute exact positions & organic timeline branch paths
  const pillNodes = useMemo(() => {
    return pills.map((pill, idx) => {
      const slot = RADIAL_SLOTS[idx % RADIAL_SLOTS.length];
      const px = slot.nx * rx;
      const py = slot.ny * ry;
      const pathD = getBranchPath(px, py, idx);
      const lineLength = Math.hypot(px, py) * 1.06;

      return {
        pill,
        idx,
        px,
        py,
        pathD,
        lineLength,
        entryAngle: slot.angle,
      };
    });
  }, [pills, rx, ry]);

  if (!showPills) return null;

  return (
    <>
      <style>{`
        @keyframes constNetworkSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pillCounterSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes lokiTimelineFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
        /* Dynamic, smooth rotation (~28s full revolution) */
        .network-spin-layer {
          animation: constNetworkSpin 28s linear infinite;
        }
        .pill-counter-rotator {
          animation: pillCounterSpin 28s linear infinite;
        }
        .timeline-flowing-sparks {
          stroke-dasharray: 8 16;
          animation: lokiTimelineFlow 1.8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .network-spin-layer, .pill-counter-rotator, .timeline-flowing-sparks {
            animation: none !important;
          }
        }
      `}</style>

      {/* 
        LAYER A (Behind Loki - zIndex: 4): 
        Realistic, Colorful Loki Season 2 Yggdrasil Timeline Branches 
      */}
      <div
        className="network-spin-layer pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "39%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
          zIndex: 4,
          willChange: "transform",
        }}
      >
        <svg
          className="absolute pointer-events-none"
          style={{
            left: -450,
            top: -450,
            width: 900,
            height: 900,
            overflow: "visible",
            willChange: "transform",
          }}
          viewBox="-450 -450 900 900"
        >
          <defs>
            {/* Loki S2 Finale Vibrant Gradient - Emerald & Neon Lime */}
            <linearGradient id="lokiAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF87" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#39FF14" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ADFF00" stopOpacity="0.4" />
            </linearGradient>

            {/* Glowing Core Magic Gradient */}
            <linearGradient id="lokiCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* High-Voltage Surge Gradient */}
            <linearGradient id="lokiSurgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0FFF0" />
              <stop offset="50%" stopColor="#39FF14" />
              <stop offset="100%" stopColor="#00FF87" />
            </linearGradient>
          </defs>

          {pillNodes.map((node) => {
            const state = getPillState(phase, node.idx, scanIndex);
            const isScanning = scanIndex === node.idx && phase === "ANALYZING";
            const isCollapsing = state === "collapsing";
            const isHidden = state === "hidden";
            const collapseDelay = node.idx * 0.07;

            // Line animates in, stays visible, and retracts/vanishes on collapse
            let targetOffset = 0;
            let targetOpacity = isScanning ? 0.95 : 0.45;
            let animDuration = 0.55;
            let animDelay = node.idx * 0.08;

            if (isHidden) {
              targetOffset = node.lineLength;
              targetOpacity = 0;
              animDuration = 0;
            } else if (isCollapsing) {
              // Line retracts into Loki simultaneously as the pill vanishes
              targetOffset = node.lineLength;
              targetOpacity = 0;
              animDuration = 0.5;
              animDelay = collapseDelay;
            }

            return (
              <g key={`branch-${node.pill.key}`}>
                {/* 1. Broad Outer Atmospheric Glow */}
                <motion.path
                  d={node.pathD}
                  fill="none"
                  stroke={isScanning ? "url(#lokiSurgeGrad)" : "url(#lokiAuraGrad)"}
                  strokeWidth={isScanning ? 5.5 : 3.2}
                  strokeLinecap="round"
                  initial={{
                    strokeDasharray: node.lineLength,
                    strokeDashoffset: node.lineLength,
                    opacity: 0,
                  }}
                  animate={{
                    strokeDashoffset: targetOffset,
                    opacity: targetOpacity,
                  }}
                  transition={{
                    strokeDashoffset: {
                      duration: animDuration,
                      delay: animDelay,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: {
                      duration: animDuration * 0.8,
                      delay: animDelay,
                    },
                  }}
                />

                {/* 2. Core Living Green Timeline Thread */}
                <motion.path
                  d={node.pathD}
                  fill="none"
                  stroke={isScanning ? "#FFFFFF" : "url(#lokiCoreGrad)"}
                  strokeWidth={isScanning ? 2.2 : 1.2}
                  strokeLinecap="round"
                  initial={{
                    strokeDasharray: node.lineLength,
                    strokeDashoffset: node.lineLength,
                    opacity: 0,
                  }}
                  animate={{
                    strokeDashoffset: targetOffset,
                    opacity: isCollapsing || isHidden ? 0 : (isScanning ? 1.0 : 0.85),
                  }}
                  transition={{
                    strokeDashoffset: {
                      duration: animDuration,
                      delay: animDelay,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: {
                      duration: animDuration * 0.8,
                      delay: animDelay,
                    },
                  }}
                />

                {/* 3. Flowing Temporal Energy Shimmer (Living Magic Tendril) */}
                {!isCollapsing && !isHidden && (
                  <path
                    d={node.pathD}
                    fill="none"
                    stroke={isScanning ? "#FFFFFF" : "#6EE7B7"}
                    strokeWidth={isScanning ? 2.0 : 0.9}
                    strokeLinecap="round"
                    className="timeline-flowing-sparks"
                    opacity={isScanning ? 0.95 : 0.5}
                  />
                )}

                {/* 4. Temporal Pulse Surge along Branch into Loki during scanning */}
                {isScanning && (
                  <g>
                    <motion.circle
                      r={6.5}
                      fill="rgba(57, 255, 20, 0.45)"
                      initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                      animate={{
                        cx: [node.px, node.px * 0.5, 0],
                        cy: [node.py, node.py * 0.5, 0],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                    />
                    <motion.circle
                      r={3}
                      fill="#FFFFFF"
                      initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                      animate={{
                        cx: [node.px, node.px * 0.5, 0],
                        cy: [node.py, node.py * 0.5, 0],
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
      </div>

      {/* 
        LAYER B (In Front of Loki - zIndex: 12): 
        Counter-Rotating Fitness Data Pills 
      */}
      <div
        className="network-spin-layer pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "39%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
          zIndex: 12,
          willChange: "transform",
        }}
      >
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
    </>
  );
}
