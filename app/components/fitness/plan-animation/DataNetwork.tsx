"use client";
import React, { useRef, useMemo } from "react";
import { motion, useAnimationFrame } from "framer-motion";
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

  // DOM Refs for high-performance 60fps hardware-accelerated updates (0 React re-renders)
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowLineRefs = useRef<(SVGPathElement | null)[]>([]);
  const shimmerRefs = useRef<(SVGPathElement | null)[]>([]);

  // Staggered Oval Orbit constants (Perfect mobile spacing, zero overlaps)
  const INNER_RX = 105;
  const INNER_RY = 150;
  const OUTER_RX = 138;
  const OUTER_RY = 215;
  
  const TOTAL_PILLS = Math.max(pills.length, 1);
  const ROTATION_SPEED_MS = 28000; // 28s per revolution

  useAnimationFrame((time) => {
    if (!showPills) return;

    // Start rotation immediately (smooth, continuous motion from frame 1)
    // This completely removes the "stuck" pause behavior
    const globalAngle = (time / ROTATION_SPEED_MS) * Math.PI * 2;

    pills.forEach((_, i) => {
      // 1. Calculate exact staggered radius
      const isOuter = i % 2 === 1;
      const rx = isOuter ? OUTER_RX : INNER_RX;
      const ry = isOuter ? OUTER_RY : INNER_RY;

      // 2. Calculate exact angle in constellation
      const pillAngle = globalAngle + (i * Math.PI * 2) / TOTAL_PILLS - Math.PI / 2;

      // 3. Compute (x, y) coordinate
      const px = Math.cos(pillAngle) * rx;
      const py = Math.sin(pillAngle) * ry;

      // 4. Update Pill wrapper DOM (translate center to px, py)
      const pillEl = pillRefs.current[i];
      if (pillEl) {
        pillEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      }

      // 5. Update SVG Lines exactly to px, py
      const lineLen = Math.hypot(px, py);
      const curve = isOuter ? 10 : -10;
      const perpX = (-py / lineLen) * curve;
      const perpY = (px / lineLen) * curve;
      const cx = px * 0.5 + perpX;
      const cy = py * 0.5 + perpY;
      const pathD = `M 0,0 Q ${cx.toFixed(1)},${cy.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)}`;

      if (lineRefs.current[i]) lineRefs.current[i]!.setAttribute("d", pathD);
      if (glowLineRefs.current[i]) glowLineRefs.current[i]!.setAttribute("d", pathD);
      if (shimmerRefs.current[i]) shimmerRefs.current[i]!.setAttribute("d", pathD);
    });
  });

  if (!showPills) return null;

  return (
    <>
      <style>{`
        @keyframes lokiTimelineFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        .timeline-flowing-sparks {
          stroke-dasharray: 6 12;
          animation: lokiTimelineFlow 1.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .timeline-flowing-sparks {
            animation: none !important;
          }
        }
      `}</style>

      {/* LAYER A: SVG Lines (Behind Loki) */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
          zIndex: 4,
        }}
      >
        <svg
          className="absolute pointer-events-none"
          style={{ left: -350, top: -350, width: 700, height: 700, overflow: "visible" }}
          viewBox="-350 -350 700 700"
        >
          <defs>
            <linearGradient id="lokiAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FF87" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#39FF14" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ADFF00" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="lokiCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="lokiSurgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F0FFF0" />
              <stop offset="50%" stopColor="#39FF14" />
              <stop offset="100%" stopColor="#00FF87" />
            </linearGradient>
          </defs>

          {pills.map((pill, idx) => {
            const state = getPillState(phase, idx, scanIndex);
            const isScanning = scanIndex === idx && phase === "ANALYZING";
            const isCollapsing = state === "collapsing";
            const isHidden = state === "hidden";
            
            const maxLineLength = Math.hypot(OUTER_RX, OUTER_RY) * 1.1;

            let targetOffset = 0;
            let targetOpacity = isScanning ? 0.95 : 0.45;
            let animDuration = 0.55;
            let animDelay = idx * 0.08;

            if (isHidden) {
              targetOffset = maxLineLength;
              targetOpacity = 0;
              animDuration = 0;
            } else if (isCollapsing) {
              targetOffset = maxLineLength;
              targetOpacity = 0;
              animDuration = 0.45;
              animDelay = idx * 0.07;
            }

            return (
              <g key={`branch-${pill.key}`}>
                <motion.path
                  ref={(el) => { glowLineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "url(#lokiSurgeGrad)" : "url(#lokiAuraGrad)"}
                  strokeWidth={isScanning ? 4.5 : 2.6}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: maxLineLength, strokeDashoffset: maxLineLength, opacity: 0 }}
                  animate={{ strokeDashoffset: targetOffset, opacity: targetOpacity }}
                  transition={{ strokeDashoffset: { duration: animDuration, delay: animDelay, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: animDuration * 0.8, delay: animDelay } }}
                />
                <motion.path
                  ref={(el) => { lineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "#FFFFFF" : "url(#lokiCoreGrad)"}
                  strokeWidth={isScanning ? 1.8 : 1.0}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: maxLineLength, strokeDashoffset: maxLineLength, opacity: 0 }}
                  animate={{ strokeDashoffset: targetOffset, opacity: isCollapsing || isHidden ? 0 : (isScanning ? 1.0 : 0.85) }}
                  transition={{ strokeDashoffset: { duration: animDuration, delay: animDelay, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: animDuration * 0.8, delay: animDelay } }}
                />
                {!isCollapsing && !isHidden && (
                  <path
                    ref={(el) => { shimmerRefs.current[idx] = el; }}
                    fill="none"
                    stroke={isScanning ? "#FFFFFF" : "#6EE7B7"}
                    strokeWidth={isScanning ? 1.6 : 0.75}
                    strokeLinecap="round"
                    className="timeline-flowing-sparks"
                    opacity={isScanning ? 0.95 : 0.5}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* LAYER B: Pills (In Front of Loki) */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          width: 0,
          height: 0,
          zIndex: 12,
        }}
      >
        {pills.map((pill, idx) => {
          const state = getPillState(phase, idx, scanIndex);
          return (
            <div
              key={pill.key}
              ref={(el) => { pillRefs.current[idx] = el; }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                willChange: "transform",
              }}
            >
              {/* 
                CRITICAL FIX: translate(-50%, -50%) centers the pill EXACTLY at (px, py).
                This completely prevents the lines from shooting past the pills.
              */}
              <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
                <FitnessDataPill
                  icon={pill.icon}
                  label={pill.label}
                  state={state}
                  entryAngle={idx * 36 - 90}
                  enterDelay={idx * 0.08}
                  collapseDelay={idx * 0.07}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
