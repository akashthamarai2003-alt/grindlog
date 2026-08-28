"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame } from 'lucide-react';

const NODES_DATA = [
  { id: 0, label: "Intermediate", icon: Activity, angle: -15, distBase: 120 },
  { id: 1, label: "Fat Loss", icon: Flame, angle: -50, distBase: 160 },
  { id: 2, label: "45 min", icon: Timer, angle: -85, distBase: 100 },
  { id: 3, label: "4 per week", icon: Calendar, angle: -125, distBase: 140 },
  { id: 4, label: "Gym", icon: Dumbbell, angle: -175, distBase: 110 },
  { id: 5, label: "Very Active", icon: Activity, angle: -215, distBase: 150 },
  { id: 6, label: "Male", icon: User, angle: -250, distBase: 110 },
  { id: 7, label: "75 kg", icon: Weight, angle: -285, distBase: 170 },
  { id: 8, label: "175 cm", icon: Ruler, angle: -320, distBase: 130 },
  { id: 9, label: "High Protein", icon: Utensils, angle: -350, distBase: 160 }
];

export default function DataNodeAnimation() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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
  
  const scale = Math.min(windowSize.width / 400, 1.1);
  
  const positionedNodes = NODES_DATA.map(node => {
    const rad = (node.angle * Math.PI) / 180;
    const dist = node.distBase * scale;
    const x = Math.cos(rad) * dist;
    const y = Math.sin(rad) * dist;
    return { ...node, x, y };
  });

  const ORBIT_DURATION = 40; // Seconds for one full rotation

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      
      {/* Orbiting Container for Lines and Nodes */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      >
        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full">
          {positionedNodes.map(node => (
            <motion.line
              key={`line-${node.id}`}
              x1={cx}
              y1={cy}
              x2={cx + node.x}
              y2={cy + node.y}
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: node.id * 0.1 }}
            />
          ))}
        </svg>

        {/* Floating Data Nodes */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          {positionedNodes.map(node => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.id}
                className="absolute flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.2, 1] }}
                transition={{ 
                  opacity: { duration: 0.3, delay: 0.3 + node.id * 0.1 },
                  scale: { duration: 0.5, delay: 0.3 + node.id * 0.1, ease: "easeOut" }
                }}
                style={{ 
                  left: node.x, 
                  top: node.y, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                {/* Counter-rotation container to keep text level while orbiting */}
                <motion.div 
                  className="whitespace-nowrap flex items-center gap-2 bg-[#020604] border border-[#16A34A]/50 px-3 py-1.5 rounded-full shadow-lg"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: ORBIT_DURATION, ease: "linear" }}
                >
                  <Icon size={14} className="text-[#39FF14]" />
                  <span className="text-xs font-bold text-white tracking-wide">{node.label}</span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Center Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div 
          className="relative w-[110px] h-[110px] flex items-center justify-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            default: { type: "spring", bounce: 0.5, duration: 1 }
          }}
        >
          <img 
            src="/images/b_remove_background_fo.png" 
            alt="Loki Core" 
            className="w-full h-full object-contain object-top"
          />
        </motion.div>

        {/* Orbit Ring 1 (Restored) */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[160px] h-[50px] border-2 border-white/40 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ x: '-50%', y: '-50%', rotateZ: 20 }}
          animate={{ rotateZ: 380 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          {/* Electron */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Orbit Ring 2 (Restored) */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[160px] h-[50px] border-2 border-white/40 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ x: '-50%', y: '-50%', rotateZ: -70 }}
          animate={{ rotateZ: -430 }}
          transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
        >
          {/* Electron */}
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>

    </div>
  );
}
