"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame, Sparkles, Home, Zap } from 'lucide-react';

interface NodeItem {
  id: number;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  angle: number; // degrees
  radius: number; // base distance from center in px
  highlight?: boolean;
}

const NODES_DATA: NodeItem[] = [
  { id: 0, label: "5 per week", icon: Calendar, angle: -65, radius: 145 },
  { id: 1, label: "Home", icon: Home, angle: -30, radius: 185 },
  { id: 2, label: "30 min", icon: Timer, angle: -125, radius: 145 },
  { id: 3, label: "Fat Loss", icon: Flame, angle: -160, radius: 185 },
  { id: 4, label: "Intermediate", icon: Zap, angle: -195, radius: 135 },
  { id: 5, label: "Build Muscle", icon: Dumbbell, angle: 145, radius: 155 },
  { id: 6, label: "The Full GrindLog Experience", icon: Sparkles, angle: 115, radius: 190, highlight: true },
  { id: 7, label: "Very Active", icon: Activity, angle: -5, radius: 140 },
  { id: 8, label: "Male", icon: User, angle: 25, radius: 175 },
  { id: 9, label: "75 kg", icon: Weight, angle: 60, radius: 140 },
  { id: 10, label: "175 cm", icon: Ruler, angle: 85, radius: 180 },
  { id: 11, label: "High Protein", icon: Utensils, angle: -95, radius: 170 },
];

export default function DataNodeAnimation() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 375, height: 700 });
  const [phase, setPhase] = useState<'spawn' | 'orbit' | 'retract' | 'idle'>('spawn');

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation lifecycle loop: spawn -> orbit -> retract -> repeat
  useEffect(() => {
    if (!mounted) return;

    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    const runCycle = () => {
      setPhase('spawn');
      t1 = setTimeout(() => setPhase('orbit'), 1200);
      t2 = setTimeout(() => setPhase('retract'), 5500);
      t3 = setTimeout(() => {
        setPhase('idle');
        setTimeout(runCycle, 600);
      }, 7200);
    };

    runCycle();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [mounted]);

  if (!mounted) return null;

  const cx = windowSize.width / 2;
  const cy = windowSize.height / 2;

  // Responsive scale factor to fit comfortably on all screen sizes
  const scale = Math.min(windowSize.width / 420, 1);

  const positionedNodes = NODES_DATA.map(node => {
    const rad = (node.angle * Math.PI) / 180;
    const dist = node.radius * scale;
    const x = Math.cos(rad) * dist;
    const y = Math.sin(rad) * dist;
    return { ...node, x, y };
  });

  const ORBIT_DURATION = 24; // Smooth continuous rotation speed

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      
      {/* 1. Subtle Radar Scanning Background Grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[#16A34A]/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-[#16A34A]/30 border-dashed" />
        
        {[0, 45, 90, 135].map(deg => (
          <div
            key={deg}
            className="absolute top-1/2 left-1/2 w-[550px] h-[1px] bg-gradient-to-r from-transparent via-[#16A34A]/20 to-transparent -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
          />
        ))}
      </div>

      {/* 2. Orbiting Container for Lines & Nodes */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {/* Connecting Laser Lines (Rendered behind nodes & center core) */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {positionedNodes.map(node => {
            const isVisible = phase === 'spawn' || phase === 'orbit';
            return (
              <motion.line
                key={`line-${node.id}`}
                x1={cx}
                y1={cy}
                x2={cx + node.x}
                y2={cy + node.y}
                stroke={node.highlight ? "#39FF14" : "#16A34A"}
                strokeWidth={node.highlight ? "1.8" : "1.2"}
                strokeOpacity={node.highlight ? 0.8 : 0.45}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: isVisible ? 1 : 0,
                  opacity: isVisible ? (node.highlight ? 0.85 : 0.5) : 0
                }}
                transition={{
                  duration: isVisible ? 0.7 : 0.5,
                  delay: isVisible ? node.id * 0.07 : 0,
                  ease: isVisible ? "easeOut" : "easeInOut"
                }}
              />
            );
          })}
        </svg>

        {/* Floating Data Pill Nodes */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          {positionedNodes.map(node => {
            const Icon = node.icon;
            const isVisible = phase === 'spawn' || phase === 'orbit';
            return (
              <motion.div
                key={node.id}
                className="absolute flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? [0, 1.18, 1] : [1, 0.4, 0],
                }}
                transition={{
                  duration: isVisible ? 0.5 : 0.4,
                  delay: isVisible ? 0.15 + node.id * 0.07 : (11 - node.id) * 0.03,
                  ease: isVisible ? "easeOut" : "easeInOut"
                }}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Counter-rotation to keep pill badges horizontal */}
                <motion.div
                  className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border transition-colors ${
                    node.highlight
                      ? 'bg-[#39FF14] text-[#020604] border-[#39FF14] font-extrabold shadow-[0_0_15px_rgba(57,255,20,0.5)]'
                      : 'bg-[#040D06]/90 text-white border-[#16A34A]/50 font-semibold backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
                  }`}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
                >
                  <Icon
                    size={13}
                    className={node.highlight ? "text-[#020604]" : "text-[#39FF14]"}
                  />
                  <span className="text-[11px] tracking-wide leading-none">
                    {node.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Center Core: Clean Glowing Sphere with Orbiting Electron Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        
        {/* Core Glowing Orb */}
        <motion.div
          className="relative w-[78px] h-[78px] rounded-full bg-gradient-to-tr from-[#15803D] via-[#22C55E] to-[#39FF14] shadow-[0_0_35px_rgba(57,255,20,0.7)] flex items-center justify-center border-2 border-white/40 overflow-hidden z-10"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            scale: { repeat: Infinity, duration: 2.4, ease: "easeInOut" },
            default: { type: "spring", bounce: 0.5, duration: 1 }
          }}
        >
          {/* Mascot eyes matching reference video */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_6px_white]" />
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_6px_white]" />
          </div>
        </motion.div>

        {/* Orbit Ring 1 */}
        <motion.div
          className="absolute w-[140px] h-[48px] border-2 border-white/50 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ rotateZ: 25 }}
          animate={{ rotateZ: 385 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
        >
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_12px_white]" />
        </motion.div>

        {/* Orbit Ring 2 */}
        <motion.div
          className="absolute w-[140px] h-[48px] border-2 border-white/50 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ rotateZ: -65 }}
          animate={{ rotateZ: -425 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_12px_white]" />
        </motion.div>
      </div>

    </div>
  );
}
