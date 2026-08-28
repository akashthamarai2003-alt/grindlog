"use client";
import React, { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();

  // Deterministic particle positions (avoid hydration mismatch)
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        top: `${(i * 17 + 5) % 95}%`,
        left: `${(i * 23 + 3) % 95}%`,
        size: i % 3 === 0 ? 2 : 1.5,
        delay: `${(i * 0.4) % 5}s`,
        duration: `${5 + (i % 4)}s`,
        opacity: 0.1 + (i % 4) * 0.06,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #0a1f0a 0%, #061506 40%, #030a03 100%)",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(34,197,94,0.07) 0%, transparent 55%)",
        }}
      />

      {/* Technical grid — very subtle */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(to right, #22c55e 1px, transparent 1px),
            linear-gradient(to bottom, #22c55e 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }}
      />

      {/* Radar rings */}
      {!shouldReduceMotion && (
        <div
          className="absolute pointer-events-none"
          style={{ left: "50%", top: "40%", transform: "translate(-50%, -50%)" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 120,
                height: 120,
                left: -60,
                top: -60,
                border: "1px solid rgba(22,163,74,0.06)",
                animation: `radarPulse 4s ease-out ${i * 1.3}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Particles */}
      {!shouldReduceMotion &&
        particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#39FF14]"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `particleFloat ${p.duration} ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radarPulse {
          0% { transform: scale(0.7); opacity: 0.15; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(6px, -8px); }
        }
      ` }} />
    </div>
  );
}
