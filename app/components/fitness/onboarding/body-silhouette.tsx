import React from 'react';

export const BodySilhouette = ({ view, className }: { view: 'front' | 'left' | 'right' | 'back', className?: string }) => {
  // We use slightly varied minimal abstract shapes for different views to give a high-tech vibe
  return (
    <svg 
      viewBox="0 0 100 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-20 ${className}`}
    >
      <defs>
        <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ADFF00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ADFF00" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {view === 'front' || view === 'back' ? (
        <g stroke="url(#bodyGlow)" strokeWidth="2" fill="url(#bodyGlow)" fillOpacity="0.1" strokeLinejoin="round">
          {/* Head */}
          <circle cx="50" cy="25" r="10" />
          {/* Torso & Shoulders */}
          <path d="M 50 35 C 70 35, 75 45, 75 55 L 70 100 L 30 100 L 25 55 C 25 45, 30 35, 50 35 Z" />
          {/* Arms */}
          <path d="M 25 55 L 15 110 L 20 110 L 30 55" />
          <path d="M 75 55 L 85 110 L 80 110 L 70 55" />
          {/* Legs */}
          <path d="M 30 100 L 30 180 L 40 180 L 45 100" />
          <path d="M 70 100 L 70 180 L 60 180 L 55 100" />
        </g>
      ) : view === 'left' ? (
        <g stroke="url(#bodyGlow)" strokeWidth="2" fill="url(#bodyGlow)" fillOpacity="0.1" strokeLinejoin="round">
          {/* Head Profile */}
          <ellipse cx="45" cy="25" rx="8" ry="11" />
          {/* Torso Profile */}
          <path d="M 45 36 C 55 36, 60 50, 55 100 L 40 100 C 35 60, 40 40, 45 36 Z" />
          {/* Arm Profile */}
          <path d="M 50 45 L 45 110 L 50 110 L 55 45" />
          {/* Leg Profile */}
          <path d="M 40 100 L 40 180 L 55 180 L 55 100" />
        </g>
      ) : (
        <g stroke="url(#bodyGlow)" strokeWidth="2" fill="url(#bodyGlow)" fillOpacity="0.1" strokeLinejoin="round">
          {/* Head Profile (Right) */}
          <ellipse cx="55" cy="25" rx="8" ry="11" />
          {/* Torso Profile */}
          <path d="M 55 36 C 45 36, 40 50, 45 100 L 60 100 C 65 60, 60 40, 55 36 Z" />
          {/* Arm Profile */}
          <path d="M 50 45 L 55 110 L 50 110 L 45 45" />
          {/* Leg Profile */}
          <path d="M 60 100 L 60 180 L 45 180 L 45 100" />
        </g>
      )}
    </svg>
  );
};
