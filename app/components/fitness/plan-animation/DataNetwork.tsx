"use client";
import React, { useRef, useEffect } from "react";
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

  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowLineRefs = useRef<(SVGPathElement | null)[]>([]);
  const shimmerRefs = useRef<(SVGPathElement | null)[]>([]);

  // Track exact moment collapse begins for perfectly synchronized spiral-in
  const collapseStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "DATA_COLLAPSE") {
      collapseStartTime.current = null;
    }
  }, [phase]);

  const INNER_RX = 105;
  const INNER_RY = 150;
  const OUTER_RX = 138;
  const OUTER_RY = 215;
  
  // Persistent refs to survive React re-renders and phase changes
  const angleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const pillsRef = useRef(pills);
  // Keep the animation loop stable while React updates visual states.
  phaseRef.current = phase;
  pillsRef.current = pills;

  // Use a RAW NATIVE requestAnimationFrame loop to completely bypass Framer Motion
  // and React 19 concurrent mode. This guarantees the absolute highest priority 
  // execution directly on the browser's native paint cycle.
  useEffect(() => {
    let frameId: number;

    const tick = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      if (lastTimeRef.current === null) {
        // Seed the first delta so the very first painted frame has gentle
        // movement instead of appearing frozen at the starting angle.
        lastTimeRef.current = time - 16;
      }
      
      const rawDelta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      
      // Bound missed-frame catch-up so a busy mobile frame does not look like
      // a stall, while still preventing any visible speed burst.
      const safeDelta = Math.min(Math.max(rawDelta, 0), 48);
      const elapsed = time - startTimeRef.current;
      
      // --- 7-SECOND CINEMATIC ACCELERATION CURVE ---
      // 0-1.5s: VERY SLOW
      // 1.5-3s: SLOW
      // 3-5s: SLIGHTLY FAST
      // 5-7s: MEDIUM FAST
      // >7s: SMOOTH STEADY ROTATION
      const p = Math.min(1, elapsed / 7000);
      
      // Quintic smootherstep is monotonic (never eases back down), with zero
      // slope at both ends so acceleration remains cinematic and imperceptible.
      const ease = p * p * p * (p * (p * 6 - 15) + 10);
      
      // Velocity in rotations per ms
      const startV = 1 / 12000; // Very slow (12s per round), visibly moving at entry
      const targetV = 1 / 8500; // Medium-fast (about 8.5s per round)
      const currentV = startV + (targetV - startV) * ease;
      
      // Accumulate angle continuously, surviving all React re-renders!
      angleRef.current += safeDelta * currentV * Math.PI * 2;

      // Handle mathematical spiral collapse
      const currentPhase = phaseRef.current;
      const currentPills = pillsRef.current;
      const totalPills = Math.max(currentPills.length, 1);
      const isCollapsing = currentPhase === "DATA_COLLAPSE";
      if (isCollapsing && collapseStartTime.current === null) {
        collapseStartTime.current = time;
      }

      currentPills.forEach((_, i) => {
        const isOuter = i % 2 === 1;
        let rx = isOuter ? OUTER_RX : INNER_RX;
        let ry = isOuter ? OUTER_RY : INNER_RY;

        if (collapseStartTime.current !== null) {
          const collapseElapsed = time - collapseStartTime.current;
          const collapseDelay = i * 120; 
          const collapseDuration = 550;
          
          if (collapseElapsed > collapseDelay) {
            const progress = Math.min(1, (collapseElapsed - collapseDelay) / collapseDuration);
            const easeProgress = progress * progress * progress; 
            rx = rx * (1 - easeProgress);
            ry = ry * (1 - easeProgress);
          }
        }

        const pillAngle = angleRef.current + (i * Math.PI * 2) / totalPills - Math.PI / 2;
        const px = Math.cos(pillAngle) * rx;
        const py = Math.sin(pillAngle) * ry;

        const pillEl = pillRefs.current[i];
        if (pillEl) {
          pillEl.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
        }

        const lineLen = Math.hypot(px, py);
        const curve = isOuter ? 10 : -10;
        
        const curveFactor = (lineLen / Math.hypot(OUTER_RX, OUTER_RY)) * curve;
        
        const perpX = lineLen === 0 ? 0 : (-py / lineLen) * curveFactor;
        const perpY = lineLen === 0 ? 0 : (px / lineLen) * curveFactor;
        const cx = px * 0.5 + perpX;
        const cy = py * 0.5 + perpY;
        const pathD = `M 0,0 Q ${cx.toFixed(2)},${cy.toFixed(2)} ${px.toFixed(2)},${py.toFixed(2)}`;

        if (lineRefs.current[i]) lineRefs.current[i]!.setAttribute("d", pathD);
        if (glowLineRefs.current[i]) glowLineRefs.current[i]!.setAttribute("d", pathD);
        if (shimmerRefs.current[i]) shimmerRefs.current[i]!.setAttribute("d", pathD);
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      // Only clear lastTimeRef so it cleanly resumes next frame without a jump.
      // angleRef and startTimeRef are intentionally preserved to keep continuous velocity!
      lastTimeRef.current = null;
    };
  }, []);

  if (!showPills) return null;

  return (
    <>
      <style>{`
        @keyframes lokiTimelineFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        @keyframes lokiPillEnter {
          from { opacity: 0; transform: translate(var(--entry-x), var(--entry-y)) scale(0.7); }
          to { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes lokiLineDraw {
          from { stroke-dashoffset: var(--line-length); }
          to { stroke-dashoffset: 0; }
        }
        .timeline-flowing-sparks {
          stroke-dasharray: 6 12;
          animation: lokiTimelineFlow 1.6s linear infinite; /* Normal spark speed */
        }
        @media (prefers-reduced-motion: reduce) {
          .timeline-flowing-sparks {
            animation: none !important;
          }
        }
      `}</style>

      {/* LAYER A: SVG Lines (Behind Loki - zIndex: 4) */}
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
            const isEntering = state === "entering";
            
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
              animDuration = 0.55;
              // Sync SVG line fade out exactly with the 120ms stagger logic
              animDelay = idx * 0.12; 
            }

            return (
              <g key={`branch-${pill.key}`}>
                <path
                  ref={(el) => { glowLineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "url(#lokiSurgeGrad)" : "url(#lokiAuraGrad)"}
                  strokeWidth={isScanning ? 4.5 : 2.6}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: maxLineLength,
                    strokeDashoffset: targetOffset,
                    opacity: targetOpacity,
                    ["--line-length" as string]: maxLineLength,
                    animation: isEntering
                      ? `lokiLineDraw 0.6s cubic-bezier(0.16,1,0.3,1) ${animDelay}s both`
                      : "none",
                    transition: !isEntering && animDuration > 0
                      ? `stroke-dashoffset ${animDuration}s cubic-bezier(0.16,1,0.3,1) ${animDelay}s, opacity ${animDuration * 0.8}s ease ${animDelay}s, stroke 0.3s ease`
                      : 'none'
                  }}
                />
                <path
                  ref={(el) => { lineRefs.current[idx] = el; }}
                  fill="none"
                  stroke={isScanning ? "#FFFFFF" : "url(#lokiCoreGrad)"}
                  strokeWidth={isScanning ? 1.8 : 1.0}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: maxLineLength,
                    strokeDashoffset: targetOffset,
                    opacity: isHidden || isCollapsing ? 0 : (isScanning ? 1.0 : 0.85),
                    ["--line-length" as string]: maxLineLength,
                    animation: isEntering
                      ? `lokiLineDraw 0.6s cubic-bezier(0.16,1,0.3,1) ${animDelay}s both`
                      : "none",
                    transition: !isEntering && animDuration > 0
                      ? `stroke-dashoffset ${animDuration}s cubic-bezier(0.16,1,0.3,1) ${animDelay}s, opacity ${animDuration * 0.8}s ease ${animDelay}s, stroke 0.3s ease`
                      : 'none'
                  }}
                />
                {!isHidden && !isCollapsing && (
                  <path
                    ref={(el) => { shimmerRefs.current[idx] = el; }}
                    fill="none"
                    stroke={isScanning ? "#FFFFFF" : "#6EE7B7"}
                    strokeWidth={isScanning ? 1.6 : 0.75}
                    strokeLinecap="round"
                    className="timeline-flowing-sparks"
                    style={{
                      opacity: isScanning ? 0.95 : 0.5,
                      transition: 'opacity 0.3s ease, stroke 0.3s ease'
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 
        LAYER B: Pills 
        zIndex: 7 places them BEHIND Loki (zIndex: 8).
        They spiral down to (0,0) one by one and vanish seamlessly.
      */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          width: 0,
          height: 0,
          zIndex: 7, 
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
              <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
                <FitnessDataPill
                  icon={pill.icon}
                  label={pill.label}
                  state={state}
                  entryAngle={idx * 36 - 90}
                  enterDelay={idx * 0.08}
                  collapseDelay={idx * 0.12} // Sync pill fade with the 120ms stagger logic
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
