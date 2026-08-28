"use client";
import React, { useMemo } from "react";
import type { AnimationPhase } from "./useAnimationTimeline";

interface Props {
  phase: AnimationPhase;
}

export function AnimatedBackground({ phase }: Props) {
  const phaseIdx = [
    "BOOT","AI_APPEAR","DATA_ENTER","NETWORK_FULL",
    "ANALYZING","DATA_COLLAPSE","AI_ALONE","TRANSITION","COMPLETE",
  ].indexOf(phase);

  // Grid becomes visible after ~2s, radar after ~3s
  const gridOpacity = phaseIdx >= 2 ? 0.035 : 0.01;
  const radarOpacity = phaseIdx >= 3 ? 0.08 : 0;

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        top: `${(i * 17 + 7) % 90 + 5}%`,
        left: `${(i * 23 + 11) % 90 + 5}%`,
        size: i % 3 === 0 ? 2 : 1.5,
        delay: `${(i * 0.7) % 6}s`,
        dur: `${6 + (i % 5)}s`,
        opacity: 0.08 + (i % 5) * 0.04,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Base dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 39%, #0a1f0a 0%, #061506 35%, #030a03 100%)",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute inset-0 transition-opacity duration-[2s]"
        style={{
          opacity: phaseIdx >= 1 ? 1 : 0,
          background: "radial-gradient(circle at 50% 39%, rgba(34,197,94,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Subtle grid — fades in after constellation forms */}
      <div
        className="absolute inset-0 transition-opacity duration-[3s]"
        style={{
          opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(to right, #22c55e 1px, transparent 1px),
            linear-gradient(to bottom, #22c55e 1px, transparent 1px)
          `,
          backgroundSize: "38px 38px",
        }}
      />

      {/* Radar circles — appear during network phase */}
      <div
        className="absolute pointer-events-none transition-opacity duration-[2s]"
        style={{
          left: "50%", top: "39%", transform: "translate(-50%, -50%)",
          opacity: radarOpacity,
        }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 180 + i * 80,
              height: 180 + i * 80,
              left: -(90 + i * 40),
              top: -(90 + i * 40),
              border: "1px solid rgba(22,163,74,0.12)",
              animation: `radarPulse ${4 + i}s ease-out ${i * 1.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Sparse particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#39FF14]"
          style={{
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            opacity: p.opacity,
            animation: `pFloat ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radarPulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes pFloat {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(4px,-6px); }
        }
      `}} />
    </div>
  );
}
