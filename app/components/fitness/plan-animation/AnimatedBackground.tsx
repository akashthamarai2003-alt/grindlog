'use client';

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function AnimatedBackground({ className = '' }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  // Deterministic positions for particles to avoid hydration mismatches
  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    top: `${(i * 17) % 100}%`,
    left: `${(i * 23) % 100}%`,
    animationDelay: `${(i * 0.3) % 4}s`,
    animationDuration: `${4 + (i % 3)}s`
  })), []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none bg-[#061506] bg-[radial-gradient(circle_at_center,_#061506_0%,_#030A03_100%)] ${className}`}>
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.08)_0%,_transparent_60%)]" />

      {/* Technical grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #22c55e 1px, transparent 1px),
            linear-gradient(to bottom, #22c55e 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radar rings */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-[rgba(22,163,74,0.06)]"
              style={{ width: '100px', height: '100px' }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 2.0, opacity: [0, 1, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      {/* Particles */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] bg-[#39FF14] rounded-full opacity-20"
              style={{ top: p.top, left: p.left }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: parseFloat(p.animationDuration),
                repeat: Infinity,
                delay: parseFloat(p.animationDelay),
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
