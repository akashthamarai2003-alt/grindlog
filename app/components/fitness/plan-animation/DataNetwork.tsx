"use client";
import React, { useMemo, useRef, useEffect, useState } from "react";
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

// Normalized coordinate multipliers [normX, normY, entryAngle]
// Designed for a spacious, non-overlapping radial constellation
const CONSTELLATION_SLOTS = [
  { nx: 0, ny: -0.98, angle: -90 },       // Top
  { nx: 0.82, ny: -0.66, angle: -40 },    // Upper-Right
  { nx: 0.96, ny: -0.08, angle: 0 },      // Right
  { nx: 0.80, ny: 0.58, angle: 45 },      // Lower-Right
  { nx: 0, ny: 0.96, angle: 90 },         // Bottom
  { nx: -0.80, ny: 0.58, angle: 135 },    // Lower-Left
  { nx: -0.96, ny: -0.08, angle: 180 },   // Left
  { nx: -0.82, ny: -0.66, angle: -140 },  // Upper-Left
  { nx: -0.42, ny: -0.86, angle: -115 },  // Mid-Upper-Left (for 9+ pills)
  { nx: 0.42, ny: -0.86, angle: -65 },    // Mid-Upper-Right (for 10+ pills)
  { nx: -0.42, ny: 0.80, angle: 120 },    // Mid-Lower-Left (for 11+ pills)
  { nx: 0.42, ny: 0.80, angle: 60 },      // Mid-Lower-Right (for 12+ pills)
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
  const [rotation, setRotation] = useState(0);
  const [windowSize, setWindowSize] = useState({ w: 375, h: 698 });
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Track window dimensions for responsive ellipse radius
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        w: window.innerWidth || 375,
        h: window.innerHeight || 698,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive radial spread
  // Keeps pills well within viewport boundaries while filling ~85% width & ~60% height
  const rx = useMemo(() => Math.min(Math.max(windowSize.w * 0.38, 120), 160), [windowSize.w]);
  const ry = useMemo(() => Math.min(Math.max(windowSize.h * 0.28, 150), 220), [windowSize.h]);

  // Smooth continuous network rotation: 0° -> ~28° over ~5s
  useEffect(() => {
    const active =
      phase === "DATA_ENTER" ||
      phase === "NETWORK_FULL" ||
      phase === "ANALYZING" ||
      phase === "DATA_COLLAPSE";

    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // 5.5 degrees per second
      setRotation(elapsed * 5.5);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const showPills =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_FULL" ||
    phase === "ANALYZING" ||
    phase === "DATA_COLLAPSE";

  if (!showPills) return null;

  // Compute exact positions for each pill
  const pillNodes = pills.map((pill, idx) => {
    const slot = CONSTELLATION_SLOTS[idx % CONSTELLATION_SLOTS.length];
    const px = slot.nx * rx;
    const py = slot.ny * ry;
    const state = getPillState(phase, idx, scanIndex);
    return {
      pill,
      idx,
      px,
      py,
      entryAngle: slot.angle,
      state,
      isScanning: scanIndex === idx && phase === "ANALYZING",
    };
  });

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "43%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: 0,
        height: 0,
        zIndex: 10,
      }}
    >
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
        }}
        viewBox="-400 -400 800 800"
      >
        <defs>
          <filter id="netPulseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {pillNodes.map((node) => {
          const lineLength = Math.hypot(node.px, node.py);
          const isVisible = node.state !== "hidden";

          return (
            <g key={`line-${node.pill.key}`}>
              {/* Radial spoke line connecting AI center (0,0) to pill (px, py) */}
              <motion.line
                x1={0}
                y1={0}
                x2={node.px}
                y2={node.py}
                stroke={node.isScanning ? "#39FF14" : "rgba(34, 197, 94, 0.35)"}
                strokeWidth={node.isScanning ? 1.5 : 0.9}
                initial={{
                  strokeDasharray: lineLength,
                  strokeDashoffset: lineLength,
                  opacity: 0,
                }}
                animate={{
                  strokeDashoffset: isVisible ? 0 : lineLength,
                  opacity: isVisible ? (node.isScanning ? 0.9 : 0.4) : 0,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.6,
                    delay: node.idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.3, delay: node.idx * 0.08 },
                }}
              />

              {/* Energy pulse traveling toward AI (px,py) -> (0,0) during processing */}
              {node.isScanning && (
                <motion.circle
                  r={3.5}
                  fill="#39FF14"
                  filter="url(#netPulseGlow)"
                  initial={{ cx: node.px, cy: node.py, opacity: 0 }}
                  animate={{
                    cx: [node.px, 0],
                    cy: [node.py, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Fitness Data Pills */}
      {pillNodes.map((node) => (
        <FitnessDataPill
          key={node.pill.key}
          icon={node.pill.icon}
          label={node.pill.label}
          state={node.state}
          entryAngle={node.entryAngle}
          enterDelay={node.idx * 0.09}
          collapseDelay={node.idx * 0.08}
          counterRotation={-rotation}
          style={{
            left: `${node.px}px`,
            top: `${node.py}px`,
          }}
        />
      ))}
    </div>
  );
}
