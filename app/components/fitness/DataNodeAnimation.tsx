"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame } from 'lucide-react';

interface NodeItem {
  id: number;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  angle: number; // degrees
  radius: number; // base distance from center in px
}

const NODES_DATA: NodeItem[] = [
  { id: 0, label: "45 min", icon: Timer, angle: -90, radius: 130 },
  { id: 1, label: "Fat Loss", icon: Flame, angle: -50, radius: 165 },
  { id: 2, label: "Intermediate", icon: Activity, angle: -15, radius: 135 },
  { id: 3, label: "High Protein", icon: Utensils, angle: 25, radius: 165 },
  { id: 4, label: "175 cm", icon: Ruler, angle: 65, radius: 140 },
  { id: 5, label: "75 kg", icon: Weight, angle: 100, radius: 165 },
  { id: 6, label: "Male", icon: User, angle: 135, radius: 135 },
  { id: 7, label: "Very Active", icon: Activity, angle: 170, radius: 165 },
  { id: 8, label: "Gym", icon: Dumbbell, angle: 205, radius: 135 },
  { id: 9, label: "4 per week", icon: Calendar, angle: 245, radius: 165 },
];

export default function DataNodeAnimation() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 375, height: 700 });

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  const cx = windowSize.width / 2;
  const cy = windowSize.height / 2;

  // Responsive scale factor so all badges fit on any screen width
  const scale = Math.min(windowSize.width / 400, 1.05);

  const positionedNodes = NODES_DATA.map(node => {
    const rad = (node.angle * Math.PI) / 180;
    const dist = node.radius * scale;
    const x = Math.cos(rad) * dist;
    const y = Math.sin(rad) * dist;
    return { ...node, x, y };
  });

  const ORBIT_DURATION = 32; // Smooth steady rotation

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      
      {/* Orbiting Network (Lines + Badges) */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Connecting Laser Lines */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {positionedNodes.map(node => (
            <motion.line
              key={`line-${node.id}`}
              x1={cx}
              y1={cy}
              x2={cx + node.x}
              y2={cy + node.y}
              stroke="#16A34A"
              strokeWidth="1.2"
              strokeOpacity="0.45"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: node.id * 0.08 }}
            />
          ))}
        </svg>

        {/* Floating Data Pill Badges */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          {positionedNodes.map(node => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                className="absolute flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.15, 1] }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + node.id * 0.08,
                  ease: "easeOut"
                }}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Counter-rotation to keep pill text horizontal */}
                <motion.div
                  className="whitespace-nowrap flex items-center gap-1.5 bg-[#020604]/90 border border-[#16A34A]/50 px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-sm"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
                >
                  <Icon size={13} className="text-[#39FF14]" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {node.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Center Core: Transparent Loki with Orbiting Atomic Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
        
        {/* Loki Character Avatar */}
        <motion.div
          className="relative w-[100px] h-[100px] flex items-center justify-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{
            scale: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
            default: { type: "spring", bounce: 0.5, duration: 1 }
          }}
        >
          <img
            src="/images/b_remove_background_fo.png"
            alt="Loki Core"
            className="w-full h-full object-contain object-top drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]"
          />
        </motion.div>

        {/* Orbit Ring 1 */}
        <motion.div
          className="absolute w-[150px] h-[52px] border-2 border-white/35 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ rotateZ: 20 }}
          animate={{ rotateZ: 380 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Orbit Ring 2 */}
        <motion.div
          className="absolute w-[150px] h-[52px] border-2 border-white/35 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ rotateZ: -70 }}
          animate={{ rotateZ: -430 }}
          transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
        >
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>

    </div>
  );
}
