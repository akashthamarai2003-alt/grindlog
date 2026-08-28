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

// ─── Radial layout ──────────────────────────────────────────────
// Pills placed radially around center. Angles in degrees.
// Radius as % of container half-width, clamped for mobile.
function getPillLayout(count: number) {
  const items: { angle: number; radius: number; entryAngle: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i - 90; // start from top
    // Stagger radius for organic feel
    const radius = 90 + (i % 3) * 12;
    // Entry direction: from far outside along roughly the same angle
    const entryAngle = angle + (i % 2 === 0 ? -15 : 15);
    items.push({ angle, radius, entryAngle });
  }
  return items;
}

// ─── Pill state logic ───────────────────────────────────────────
function getPillState(phase: AnimationPhase, pillIdx: number, scanIdx: number): PillState {
  switch (phase) {
    case "BOOT":
    case "AI_APPEAR":
      return "hidden";
    case "DATA_ENTER":
      return "entering";
    case "NETWORK_ROTATE":
      return "visible";
    case "ANALYZING":
      if (scanIdx === pillIdx) return "processing";
      return "visible";
    case "DATA_COLLAPSE":
      return "collapsing";
    default:
      return "hidden";
  }
}

// ─── Network rotation angle per phase ───────────────────────────
function useNetworkRotation(phase: AnimationPhase) {
  const [rotation, setRotation] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Rotation active during DATA_ENTER through DATA_COLLAPSE
    const shouldRotate =
      phase === "DATA_ENTER" ||
      phase === "NETWORK_ROTATE" ||
      phase === "ANALYZING" ||
      phase === "DATA_COLLAPSE";

    if (!shouldRotate) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!startTimeRef.current) startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // ~5 degrees per second → ~25 degrees over 5 seconds
      setRotation(elapsed * 5);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  return rotation;
}

export default function DataNetwork({ pills, phase, scanIndex }: DataNetworkProps) {
  const layout = useMemo(() => getPillLayout(pills.length), [pills.length]);
  const rotation = useNetworkRotation(phase);

  const showLines =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_ROTATE" ||
    phase === "ANALYZING";

  const showPills =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_ROTATE" ||
    phase === "ANALYZING" ||
    phase === "DATA_COLLAPSE";

  if (!showPills) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "40%",
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        width: "min(82vw, 400px)",
        height: "min(82vw, 400px)",
        zIndex: 10,
      }}
    >
      {/* SVG connection lines */}
      <svg
        viewBox="-200 -200 400 400"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="energyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {pills.map((pill, i) => {
          const { angle, radius } = layout[i];
          const rad = (angle * Math.PI) / 180;
          const px = Math.cos(rad) * radius;
          const py = Math.sin(rad) * radius;
          const state = getPillState(phase, i, scanIndex);
          const isActive = state !== "hidden";
          const isScanning = scanIndex === i && phase === "ANALYZING";
          const lineLen = Math.sqrt(px * px + py * py);

          return (
            <g key={pill.key}>
              {/* Connection line */}
              <motion.line
                x1={0}
                y1={0}
                x2={px}
                y2={py}
                stroke={isScanning ? "#39FF14" : "rgba(22,163,74,0.35)"}
                strokeWidth={isScanning ? 1.2 : 0.9}
                initial={{ strokeDasharray: lineLen, strokeDashoffset: lineLen, opacity: 0 }}
                animate={{
                  strokeDashoffset: showLines && isActive ? 0 : lineLen,
                  opacity: showLines && isActive ? (isScanning ? 0.65 : 0.3) : 0,
                }}
                transition={{
                  strokeDashoffset: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.3, delay: i * 0.08 },
                }}
              />

              {/* Energy pulse toward AI during scan */}
              {isScanning && (
                <motion.circle
                  r={3}
                  fill="#39FF14"
                  filter="url(#energyGlow)"
                  initial={{ cx: px, cy: py, opacity: 0 }}
                  animate={{
                    cx: [px, 0],
                    cy: [py, 0],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Data pills */}
      {pills.map((pill, i) => {
        const { angle, radius, entryAngle } = layout[i];
        const rad = (angle * Math.PI) / 180;
        // Position as percentage of container
        const leftPct = 50 + (Math.cos(rad) * radius * 50) / 200;
        const topPct = 50 + (Math.sin(rad) * radius * 50) / 200;
        const state = getPillState(phase, i, scanIndex);

        return (
          <FitnessDataPill
            key={pill.key}
            icon={pill.icon}
            label={pill.label}
            state={state}
            entryAngle={entryAngle}
            delay={i * 0.1}
            collapseDelay={i * 0.1}
            counterRotation={-rotation}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
              zIndex: 15,
            }}
          />
        );
      })}
    </div>
  );
}
