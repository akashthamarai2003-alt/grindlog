'use client';

import React from 'react';

interface OrbitSystemProps {
  isActive: boolean;
  isProcessing: boolean;
  containerWidth: number;
  containerHeight: number;
}

export function OrbitSystem({ isActive, isProcessing, containerWidth, containerHeight }: OrbitSystemProps) {
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;

  const orbits = [
    { rx: 90, ry: 35, rotation: 15, direction: 'cw', duration: 18, hasNode: true },
    { rx: 110, ry: 40, rotation: -30, direction: 'ccw', duration: 22, hasNode: true },
    { rx: 75, ry: 28, rotation: 60, direction: 'cw', duration: 15, hasNode: true },
    { rx: 130, ry: 48, rotation: -10, direction: 'ccw', duration: 25, hasNode: false },
  ];

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
      style={{ overflow: 'visible' }}
      className="absolute inset-0 pointer-events-none"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>
          {`
            @keyframes orbit-cw {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes orbit-ccw {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(-360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              .orbit-anim {
                animation: none !important;
              }
            }
          `}
        </style>
      </defs>

      {orbits.map((orbit, i) => {
        const animName = orbit.direction === 'cw' ? 'orbit-cw' : 'orbit-ccw';
        const speedMultiplier = isProcessing ? 0.8 : 1;
        const duration = orbit.duration * speedMultiplier;
        const animStyle = isActive 
          ? { animation: `${animName} ${duration}s linear infinite` }
          : {};

        return (
          <g key={i} transform={`translate(${cx}, ${cy}) rotate(${orbit.rotation})`}>
            <g className="orbit-anim" style={animStyle} transform-origin="0 0">
              <ellipse
                cx={0}
                cy={0}
                rx={orbit.rx}
                ry={orbit.ry}
                fill="none"
                stroke="rgba(22,163,74,0.2)"
                strokeWidth={0.8}
              />
              {orbit.hasNode && (
                <circle
                  cx={orbit.rx}
                  cy={0}
                  r={3}
                  fill="#39FF14"
                  filter="url(#glow)"
                />
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
