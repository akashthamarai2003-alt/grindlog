"use client";
import React from "react";

interface OrbitSystemProps {
  isActive: boolean;
  isProcessing: boolean;
}

/**
 * 4 SVG elliptical orbit paths around the AI at (50%,43%).
 * Each orbit is a tilted ellipse that rotates at its own speed.
 * 3 orbits carry small energy nodes.
 * Sized relative to viewport to match the large constellation layout.
 */
export function OrbitSystem({ isActive, isProcessing }: OrbitSystemProps) {
  const orbits = [
    { rx: 85, ry: 32, tilt: 15,  dur: 18, dir: "normal",  node: true },
    { rx: 95, ry: 40, tilt: -25, dur: 23, dir: "reverse", node: true },
    { rx: 75, ry: 50, tilt: 65,  dur: 29, dir: "normal",  node: true },
    { rx: 110, ry: 30, tilt: -10, dur: 34, dir: "reverse", node: false },
  ];

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "43%",
        transform: "translate(-50%, -50%)",
        width: "min(88vw, 440px)",
        height: "min(52vw, 280px)",
        overflow: "visible",
        zIndex: 3,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}
      viewBox="-140 -90 280 180"
    >
      <defs>
        <filter id="ng" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <style>{`
          @keyframes ospin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { .og { animation: none !important; } }
        `}</style>
      </defs>

      {orbits.map((o, i) => {
        const speed = isProcessing ? o.dur * 0.7 : o.dur;
        return (
          <g key={i}>
            <g transform={`rotate(${o.tilt})`}>
              <g
                className="og"
                style={
                  isActive
                    ? {
                        animation: `ospin ${speed}s linear infinite`,
                        animationDirection: o.dir as any,
                        transformOrigin: "0 0",
                      }
                    : { transformOrigin: "0 0" }
                }
              >
                <ellipse
                  cx={0} cy={0} rx={o.rx} ry={o.ry}
                  fill="none"
                  stroke="rgba(210,235,210,0.18)"
                  strokeWidth={0.9}
                />
                {o.node && (
                  <circle
                    cx={o.rx} cy={0} r={2.5}
                    fill="#39FF14" filter="url(#ng)"
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
