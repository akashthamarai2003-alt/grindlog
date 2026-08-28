"use client";
import React from "react";

interface OrbitSystemProps {
  isActive: boolean;
  isProcessing: boolean;
}

/**
 * SVG orbit ellipses — white/pale green, thin, continuously rotating.
 * Each orbit is a <g> group that rotates via CSS animation.
 * Energy nodes sit at fixed points on the ellipse and orbit with the group.
 */
export function OrbitSystem({ isActive, isProcessing }: OrbitSystemProps) {
  const orbits = [
    { rx: 85, ry: 32, rotation: 15, duration: 18, dir: "normal", hasNode: true },
    { rx: 88, ry: 36, rotation: -25, duration: 24, dir: "reverse", hasNode: true },
    { rx: 75, ry: 45, rotation: 65, duration: 30, dir: "normal", hasNode: true },
    { rx: 100, ry: 28, rotation: -10, duration: 22, dir: "reverse", hasNode: false },
  ];

  const speedFactor = isProcessing ? 0.75 : 1;

  return (
    <svg
      viewBox="-130 -80 260 160"
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "40%",
        transform: "translate(-50%, -50%)",
        width: "min(85vw, 420px)",
        height: "min(50vw, 240px)",
        overflow: "visible",
      }}
    >
      <defs>
        <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes orbitSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .orbit-group { animation: none !important; }
          }
        `}</style>
      </defs>

      {orbits.map((o, i) => {
        const dur = o.duration * speedFactor;
        return (
          <g key={i} style={{ transformOrigin: "0 0" }}>
            {/* Static rotation offset for the ellipse tilt */}
            <g transform={`rotate(${o.rotation})`}>
              {/* Rotating group */}
              <g
                className="orbit-group"
                style={
                  isActive
                    ? {
                        animation: `orbitSpin ${dur}s linear infinite`,
                        animationDirection: o.dir as "normal" | "reverse",
                        transformOrigin: "0 0",
                      }
                    : { transformOrigin: "0 0" }
                }
              >
                <ellipse
                  cx={0}
                  cy={0}
                  rx={o.rx}
                  ry={o.ry}
                  fill="none"
                  stroke="rgba(220,240,220,0.18)"
                  strokeWidth={1}
                />
                {o.hasNode && (
                  <circle
                    cx={o.rx}
                    cy={0}
                    r={2.5}
                    fill="#39FF14"
                    filter="url(#nodeGlow)"
                  />
                )}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
