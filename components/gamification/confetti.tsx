"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

const COLORS = [
  "#34C759", "#007AFF", "#FF9500", "#5856D6",
  "#FF3B30", "#FFD700", "#FF6B8A", "#00C7BE",
];

export function Confetti({ trigger, onComplete, duration = 2500 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.4,
    }));

    setParticles(newParticles);
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 8 * p.scale,
                height: 8 * p.scale,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              }}
              initial={{
                opacity: 1,
                y: `${p.y}%`,
                rotate: p.rotation,
                scale: p.scale,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: `${p.y + 80 + Math.random() * 30}%`,
                x: `${p.x + (Math.random() - 0.5) * 40}%`,
                rotate: p.rotation + Math.random() * 720,
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
