"use client";
import React from "react";

interface OrbitSystemProps {
  isActive: boolean;
  isProcessing: boolean;
}

/**
 * 4 SVG elliptical orbit paths around the AI at (50%,43%).
 * Uses lightweight GPU-accelerated concentric SVG circles (no feGaussianBlur filters)
 * to prevent mobile GPU framebuffer texture memory glitches.
 */
export function OrbitSystem({ isActive, isProcessing }: OrbitSystemProps) {
  const orbits = [
    { rx: 85,  ry: 32, tilt: 15,  dur: 18, dir: "normal",  node: true },
    { rx: 95,  ry: 40, tilt: -25, dur: 23, dir: "reverse", node: true },
    { rx: 75,  ry: 50, tilt: 65,  dur: 29, dir: "normal",  node: true },
    { rx: 110, ry: 30, tilt: -10, dur: 34, dir: "reverse", node: false },
  ];

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "39%",
        transform: "translate(-50%, -50%)",
        width: "min(88vw, 440px)",
        height: "min(52vw, 280px)",
        overflow: "visible",
        zIndex: 3,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.8s ease",
        willChange: "transform, opacity",
      }}
      viewBox="-140 -90 280 180"
    >
      <defs>
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
                        willChange: "transform",
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
                  <g>
                    {/* Outer halo */}
                    <circle
                      cx={o.rx}
                      cy={0}
                      r={5}
                      fill="rgba(57, 255, 20, 0.3)"
                    />
                    {/* Inner core node */}
                    <circle
                      cx={o.rx}
                      cy={0}
                      r={2.2}
                      fill="#39FF14"
                    />
                  </g>
                )}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
