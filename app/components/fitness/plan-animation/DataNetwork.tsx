"use client";
import React from "react";
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

const INNER_RX = 105;
const INNER_RY = 150;
const OUTER_RX = 138;
const OUTER_RY = 215;

const INNER_A = INNER_RY / INNER_RX;
const OUTER_A = OUTER_RY / OUTER_RX;

// Pre-calculate the exact 7-second cinematic acceleration curve into a pure CSS keyframe
// This moves 100% of the rotation math to the GPU compositor, eliminating JS freezes.
const generateKeyframes = () => {
  let spin = "@keyframes lokiSpin {\n";
  let counter = "@keyframes lokiCounterSpin {\n";
  let currentAngle = 0;
  
  for (let i = 0; i <= 100; i++) {
    // Format to 2 decimal places to keep CSS clean
    const angleStr = currentAngle.toFixed(2);
    spin += `  ${i}% { transform: rotate(${angleStr}deg); }\n`;
    counter += `  ${i}% { transform: rotate(-${angleStr}deg); }\n`;
    
    if (i < 100) {
      for (let ms = 0; ms < 300; ms++) {
        const t = (i * 300) + ms;
        const p = Math.min(1, t / 7000); // 7-second ramp
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        
        const startV = 1 / 45000; // VERY SLOW (45s per round)
        const targetV = 1 / 8000; // MEDIUM FAST (8s per round)
        const v = startV + (targetV - startV) * ease;
        currentAngle += (v * 360);
      }
    }
  }
  spin += "}\n";
  counter += "}\n";
  return spin + counter;
};

const cinematicKeyframes = generateKeyframes();

export default function DataNetwork({ pills, phase, scanIndex }: DataNetworkProps) {
  const showPills =
    phase === "DATA_ENTER" ||
    phase === "NETWORK_FULL" ||
    phase === "ANALYZING" ||
    phase === "DATA_COLLAPSE";

  if (!showPills) return null;

  const isCollapsing = phase === "DATA_COLLAPSE";
  const TOTAL_PILLS = Math.max(pills.length, 1);

  // Helper to render the orbit rings (SVG branches)
  const renderBranches = (isOuterRing: boolean) => {
    const A = isOuterRing ? OUTER_A : INNER_A;
    const baseR = isOuterRing ? OUTER_RX : INNER_RX;
    const curve = isOuterRing ? 10 : -10;
    const cx = baseR * 0.5;
    const cy = curve; // Control point for the subtle branch curve
    const pathD = `M 0,0 Q ${cx},${cy} ${baseR},0`;
    const maxLineLength = Math.hypot(baseR, curve) * 1.2;

    return (
      <div style={{ position: "absolute", left: "50%", top: "40%", width: 0, height: 0, zIndex: 4, transform: `scale(1, ${A})` }}>
        <div style={{ animation: "lokiSpin 30s linear forwards", width: 0, height: 0 }}>
          <svg className="absolute overflow-visible" style={{ left: -350, top: -350, width: 700, height: 700 }} viewBox="-350 -350 700 700">
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
            <g transform="translate(350, 350)">
              {pills.map((pill, idx) => {
                if ((idx % 2 === 1) !== isOuterRing) return null;
                const state = getPillState(phase, idx, scanIndex);
                const isScanning = scanIndex === idx && phase === "ANALYZING";
                const isHidden = state === "hidden";
                const angle = (idx / TOTAL_PILLS) * 360 - 90;
                
                let targetOffset = isHidden || isCollapsing ? maxLineLength : 0;
                let targetOpacity = isHidden || isCollapsing ? 0 : (isScanning ? 0.95 : 0.45);
                let animDuration = isHidden ? 0 : (isCollapsing ? 0.45 : 0.55);
                let animDelay = isCollapsing ? idx * 0.12 : idx * 0.08;

                return (
                  <g key={`branch-${pill.key}`} transform={`rotate(${angle})`}>
                    <g style={{ transform: `scaleX(${isCollapsing ? 0 : 1})`, transition: `transform 0.45s ease-in ${idx * 0.12}s`, transformOrigin: "0 0" }}>
                      <path fill="none" stroke={isScanning ? "url(#lokiSurgeGrad)" : "url(#lokiAuraGrad)"} strokeWidth={isScanning ? 4.5 : 2.6} strokeLinecap="round" d={pathD}
                        style={{ strokeDasharray: maxLineLength, strokeDashoffset: targetOffset, opacity: targetOpacity, transition: animDuration > 0 ? `stroke-dashoffset ${animDuration}s cubic-bezier(0.16,1,0.3,1) ${animDelay}s, opacity ${animDuration * 0.8}s ease ${animDelay}s, stroke 0.3s ease` : 'none' }} />
                      <path fill="none" stroke={isScanning ? "#FFFFFF" : "url(#lokiCoreGrad)"} strokeWidth={isScanning ? 1.8 : 1.0} strokeLinecap="round" d={pathD}
                        style={{ strokeDasharray: maxLineLength, strokeDashoffset: targetOffset, opacity: targetOpacity, transition: animDuration > 0 ? `stroke-dashoffset ${animDuration}s cubic-bezier(0.16,1,0.3,1) ${animDelay}s, opacity ${animDuration * 0.8}s ease ${animDelay}s, stroke 0.3s ease` : 'none' }} />
                      {!isHidden && !isCollapsing && (
                        <path fill="none" stroke={isScanning ? "#FFFFFF" : "#6EE7B7"} strokeWidth={isScanning ? 1.6 : 0.75} strokeLinecap="round" className="timeline-flowing-sparks" d={pathD}
                          style={{ opacity: isScanning ? 0.95 : 0.5, transition: 'opacity 0.3s ease, stroke 0.3s ease' }} />
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    );
  };

  // Helper to render the data pills
  const renderPills = (isOuterRing: boolean) => {
    const A = isOuterRing ? OUTER_A : INNER_A;
    const baseR = isOuterRing ? OUTER_RX : INNER_RX;

    return (
      <div style={{ position: "absolute", left: "50%", top: "40%", width: 0, height: 0, zIndex: 7, transform: `scale(1, ${A})` }}>
        <div style={{ animation: "lokiSpin 30s linear forwards", width: 0, height: 0 }}>
          {pills.map((pill, idx) => {
            if ((idx % 2 === 1) !== isOuterRing) return null;
            const state = getPillState(phase, idx, scanIndex);
            const angle = (idx / TOTAL_PILLS) * 360 - 90;
            const collapseDelay = idx * 0.12;
            
            return (
              <div key={`pill-${pill.key}`} style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${angle}deg)` }}>
                <div style={{ transform: `translateX(${isCollapsing ? 0 : baseR}px)`, transition: `transform 0.45s ease-in ${collapseDelay}s` }}>
                  <div style={{ animation: "lokiCounterSpin 30s linear forwards", transformOrigin: "center center" }}>
                    <div style={{ transform: `scale(1, ${1/A})`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
                        <FitnessDataPill icon={pill.icon} label={pill.label} state={state} entryAngle={angle} enterDelay={idx * 0.08} collapseDelay={collapseDelay} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes lokiTimelineFlow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -32; } }
        .timeline-flowing-sparks { stroke-dasharray: 6 12; animation: lokiTimelineFlow 1.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .timeline-flowing-sparks { animation: none !important; } }
        ${cinematicKeyframes}
      `}</style>
      {renderBranches(false)}
      {renderBranches(true)}
      {renderPills(false)}
      {renderPills(true)}
    </>
  );
}
