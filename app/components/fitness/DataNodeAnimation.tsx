"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame } from 'lucide-react';

const NODES_DATA = [
  { id: 0, label: "Intermediate", icon: Activity, angle: -30, distBase: 130 },
  { id: 1, label: "Fat Loss", icon: Flame, angle: -60, distBase: 160 },
  { id: 2, label: "45 min", icon: Timer, angle: -90, distBase: 140 },
  { id: 3, label: "4 per week", icon: Calendar, angle: -120, distBase: 160 },
  { id: 4, label: "Gym", icon: Dumbbell, angle: -150, distBase: 130 },
  { id: 5, label: "Very Active", icon: Activity, angle: -180, distBase: 150 },
  { id: 6, label: "Male", icon: User, angle: -210, distBase: 130 },
  { id: 7, label: "75 kg", icon: Weight, angle: -240, distBase: 160 },
  { id: 8, label: "175 cm", icon: Ruler, angle: -270, distBase: 140 },
  { id: 9, label: "High Protein", icon: Utensils, angle: -300, distBase: 160 }
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

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Background Radar Grid */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#16A34A]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#16A34A]" />
        
        {/* Radar spokes */}
        {[0, 45, 90, 135].map(deg => (
          <div 
            key={deg}
            className="absolute top-1/2 left-1/2 w-[1000px] h-[1px] bg-[#16A34A] -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
          />
        ))}
      </div>

      {/* SVG Connecting Lines - Clean Straight Lines */}
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
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: node.id * 0.1 }}
          />
        ))}
      </svg>

      {/* Floating Data Nodes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
        {positionedNodes.map(node => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.id}
              className="absolute whitespace-nowrap flex items-center gap-2 bg-[#020604] border border-[#16A34A]/50 px-3 py-1.5 rounded-full shadow-lg"
              style={{
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [node.y - 6, node.y + 6, node.y - 6]
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: 0.5 + node.id * 0.1 },
                scale: { type: "spring", bounce: 0.4, delay: 0.5 + node.id * 0.1 },
                y: { repeat: Infinity, duration: 4 + (node.id % 3), ease: "easeInOut" }
              }}
            >
              <Icon size={14} className="text-[#39FF14]" />
              <span className="text-xs font-bold text-white tracking-wide">{node.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Center Core and Atoms */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Core Solid Orb for Progress Text */}
        <motion.div 
          className="relative w-[85px] h-[85px] bg-[#39FF14] rounded-full shadow-[0_0_30px_rgba(57,255,20,0.6)] flex items-center justify-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            default: { type: "spring", bounce: 0.5, duration: 1 }
          }}
        >
        </motion.div>

        {/* Orbit Ring 1 */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[160px] h-[50px] border-2 border-white/60 rounded-[50%]"
          style={{ transformOrigin: 'center' }}
          initial={{ x: '-50%', y: '-50%', rotateZ: 20 }}
          animate={{ rotateZ: 380 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          {/* Electron */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Orbit Ring 2 */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[160px] h-[50px] border-2 border-white/60 rounded-[50%]"
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
