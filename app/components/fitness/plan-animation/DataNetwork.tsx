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

// 10 evenly spaced radial slots with generous clearance
const RADIAL_SLOTS = [
  { nx: 0,     ny: -1.0,  angle: -90 },  // 0: Top
  { nx: 0.68,  ny: -0.72, angle: -50 },  // 1: Upper-Right
  { nx: 0.96,  ny: -0.20, angle: -15 },  // 2: Right-Upper
  { nx: 0.96,  ny: 0.22,  angle: 15 },   // 3: Right-Lower
  { nx: 0.68,  ny: 0.72,  angle: 50 },   // 4: Lower-Right
  { nx: 0,     ny: 0.98,  angle: 90 },   // 5: Bottom
  { nx: -0.68, ny: 0.72,  angle: 130 },  // 6: Lower-Left
  { nx: -0.96, ny: 0.22,  angle: 165 },  // 7: Left-Lower
  { nx: -0.96, ny: -0.20, angle: -165 }, // 8: Left-Upper
  { nx: -0.68, ny: -0.72, angle: -130 }, // 9: Upper-Left
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

// Generates an organic curved timeline branch (Loki Season 2 finale style)
function getBranchPath(x: number, y: number, idx: number) {
  const curveMagnitude = (idx % 2 === 0 ? 1 : -1) * 22;
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

  // Generous, spacious radii utilizing the screen's full extra space
  const rx = 150;
  const ry = 215;

  // Compute exact positions & organic timeline branch paths
  const pillNodes = useMemo(() => {
    return pills.map((pill, idx) => {
      const slot = RADIAL_SLOTS[idx % RADIAL_SLOTS.length];
      const px = slot.nx * rx;
      const py = slot.ny * ry;
      const pathD = getBranchPath(px, py, idx);
      const lineLength = Math.hypot(px, py) * 1.05;

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
    <div
      className="network-spin-container"
      style={{
        position: "absolute",
        left: "50%",
        top: "40%",
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
        @keyframes timelinePulseFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        .network-spin-container {
          animation: constNetworkSpin 80s linear infinite;
        }
        .pill-counter-rotator {
          animation: pillCounterSpin 80s linear infinite;
        }
        .timeline-shimmer {
          stroke-dasharray: 6 12;
          animation: timelinePulseFlow 2.4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .network-spin-container, .pill-counter-rotator, .timeline-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      {/* SVG Loki Timeline Branches Layer */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: -450,
          top: -450,
          width: 900,
          height: 900,
          overflow: "visible",
          zIndex: 4,
          willChange: "transform",
        }}
        viewBox="-450 -450 900 900"
      >
        {pillNodes.map((node) => {
          const state = getPillState(phase, node.idx, scanIndex);
          const isVisible = state !== "hidden";
          const isScanning = scanIndex === node.idx && phase === "ANALYZING";

          return (
            <g key={`branch-${node.pill.key}`}>
              {/* 1. Outer Timeline Glow / Aura */}
              <motion.path
                d={node.pathD}
                fill="none"
                stroke={isScanning ? "rgba(57, 255, 20, 0.75)" : "rgba(34, 197, 94, 0.35)"}
                strokeWidth={isScanning ? 4.5 : 2.5}
                strokeLinecap="round"
                initial={{
                  strokeDasharray: node.lineLength,
                  strokeDashoffset: node.lineLength,
                  opacity: 0,
                }}
                animate={{
                  strokeDashoffset: isVisible ? 0 : node.lineLength,
                  opacity: isVisible ? (isScanning ? 0.95 : 0.45) : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.6,
                    delay: node.idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.25, delay: node.idx * 0.08 },
                }}
              />

              {/* 2. Core Living Green Timeline Strand */}
              <motion.path
                d={node.pathD}
                fill="none"
                stroke={isScanning ? "#F0FFF0" : "#39FF14"}
                strokeWidth={isScanning ? 2.0 : 1.1}
                strokeLinecap="round"
                initial={{
                  strokeDasharray: node.lineLength,
                  strokeDashoffset: node.lineLength,
                  opacity: 0,
                }}
                animate={{
                  strokeDashoffset: isVisible ? 0 : node.lineLength,
                  opacity: isVisible ? (isScanning ? 1.0 : 0.75) : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.6,
                    delay: node.idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.25, delay: node.idx * 0.08 },
                }}
              />

              {/* 3. Flowing Temporal Energy Shimmer (Loki Magic) */}
              {isVisible && (
                <path
                  d={node.pathD}
                  fill="none"
                  stroke={isScanning ? "#FFFFFF" : "#6EE7B7"}
                  strokeWidth={isScanning ? 2.2 : 1.0}
                  strokeLinecap="round"
                  className="timeline-shimmer"
                  opacity={isScanning ? 0.9 : 0.4}
                />
              )}

              {/* 4. Energy Surge Dot traveling along Timeline into Loki during scan */}
              {isScanning && (
                <g>
                  {/* Outer Surge Halo */}
                  <motion.circle
                    r={6}
                    fill="rgba(57, 255, 20, 0.45)"
                    initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                    animate={{
                      cx: [node.px, node.px * 0.5, 0],
                      cy: [node.py, node.py * 0.5, 0],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                  {/* Bright Core Magic Dot */}
                  <motion.circle
                    r={3}
                    fill="#F0FFF0"
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
