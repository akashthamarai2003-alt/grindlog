"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
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

  // Mathematical constants for Staggered Oval Orbit (Matches Reference Image Exactly)
  // Inner ring: closer to center. Outer ring: further out.
  // This staggering completely prevents wide pills from ever touching each other!
  const INNER_RX = 100;
  const INNER_RY = 150;
  const OUTER_RX = 135;
  const OUTER_RY = 220;
  
  // Base configuration
  const TOTAL_PILLS = Math.max(pills.length, 1);
  const ROTATION_SPEED_MS = 28000; // 28s per revolution (smooth, normal speed)

  useAnimationFrame((time) => {
    if (!showPills) return;

    // Calculate the current global rotation angle based on elapsed time
    const globalAngle = (time / ROTATION_SPEED_MS) * Math.PI * 2;

    pills.forEach((_, i) => {
      // 1. Calculate the exact staggered radius for this pill
      const isOuter = i % 2 === 1;
      const rx = isOuter ? OUTER_RX : INNER_RX;
      const ry = isOuter ? OUTER_RY : INNER_RY;

      // 2. Calculate its exact angle in the constellation
      const pillAngle = globalAngle + (i * Math.PI * 2) / TOTAL_PILLS - Math.PI / 2;

      // 3. Compute (x, y) coordinate
      const px = Math.cos(pillAngle) * rx;
      const py = Math.sin(pillAngle) * ry;

      // 4. Update the Pill DOM Element (Hardware accelerated translate)
      const pillEl = pillRefs.current[i];
      if (pillEl) {
        pillEl.style.transform = `translate(-50%, -50%) translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      }

      // 5. Update the SVG Lines (Straight, clean lines connecting center strictly to the pill)
      // We use a very subtle curve to maintain the organic feel, but terminating exactly at px,py
      const lineLen = Math.hypot(px, py);
      const curve = isOuter ? 8 : -8;
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

      {/* 
        LAYER A (Behind Loki - zIndex: 4): 
        Exact matching straight/subtle-curve lines connecting to pills
      */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "40%", // Centered behind Loki
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
          zIndex: 4,
        }}
      >
        <svg
          className="absolute pointer-events-none"
          style={{
            left: -350,
            top: -350,
            width: 700,
            height: 700,
            overflow: "visible",
          }}
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
            
            // Assume max possible line length for SVG dasharray calculation (to ensure smooth draw/erase)
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
                {/* 1. Broad Outer Atmospheric Glow */}
                <motion.path
                  ref={(el) => { glowLineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "url(#lokiSurgeGrad)" : "url(#lokiAuraGrad)"}
                  strokeWidth={isScanning ? 4.5 : 2.6}
                  strokeLinecap="round"
                  initial={{
                    strokeDasharray: maxLineLength,
                    strokeDashoffset: maxLineLength,
                    opacity: 0,
                  }}
                  animate={{
                    strokeDashoffset: targetOffset,
                    opacity: targetOpacity,
                  }}
                  transition={{
                    strokeDashoffset: { duration: animDuration, delay: animDelay, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: animDuration * 0.8, delay: animDelay },
                  }}
                />

                {/* 2. Core Living Green Timeline Thread */}
                <motion.path
                  ref={(el) => { lineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "#FFFFFF" : "url(#lokiCoreGrad)"}
                  strokeWidth={isScanning ? 1.8 : 1.0}
                  strokeLinecap="round"
                  initial={{
                    strokeDasharray: maxLineLength,
                    strokeDashoffset: maxLineLength,
                    opacity: 0,
                  }}
                  animate={{
                    strokeDashoffset: targetOffset,
                    opacity: isCollapsing || isHidden ? 0 : (isScanning ? 1.0 : 0.85),
                  }}
                  transition={{
                    strokeDashoffset: { duration: animDuration, delay: animDelay, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: animDuration * 0.8, delay: animDelay },
                  }}
                />

                {/* 3. Flowing Temporal Energy Shimmer */}
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

      {/* 
        LAYER B (In Front of Loki - zIndex: 12): 
        Fitness Data Pills (Directly manipulated via JS for perfect layout)
      */}
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
                // initial hide before JS kicks in
                transform: "translate(-50%, -50%)", 
              }}
            >
              <FitnessDataPill
                icon={pill.icon}
                label={pill.label}
                state={state}
                entryAngle={idx * 36 - 90}
                enterDelay={idx * 0.08}
                collapseDelay={idx * 0.07}
                style={{ left: 0, top: 0 }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
