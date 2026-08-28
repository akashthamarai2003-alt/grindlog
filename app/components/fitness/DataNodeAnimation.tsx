"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Ruler, Weight, Utensils, Flame } from 'lucide-react';

const NODES_DATA = [
  { id: 0, label: "Intermediate", icon: Activity, angle: -36, distBase: 130 },
  { id: 1, label: "Fat Loss", icon: Flame, angle: -72, distBase: 160 },
  { id: 2, label: "45 min", icon: Timer, angle: -108, distBase: 140 },
  { id: 3, label: "4 per week", icon: Calendar, angle: -144, distBase: 160 },
  { id: 4, label: "Gym", icon: Dumbbell, angle: -180, distBase: 130 },
  { id: 5, label: "Very Active", icon: Activity, angle: -216, distBase: 150 },
  { id: 6, label: "Male", icon: User, angle: -252, distBase: 130 },
  { id: 7, label: "75 kg", icon: Weight, angle: -288, distBase: 160 },
  { id: 8, label: "175 cm", icon: Ruler, angle: -324, distBase: 140 },
  { id: 9, label: "High Protein", icon: Utensils, angle: -360, distBase: 160 }
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
              stroke="#16A34A"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              initial={{ x2: cx, y2: cy, opacity: 0 }}
              animate={{ x2: cx + node.x, y2: cy + node.y, opacity: 0.5 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: node.id * 0.1 }}
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
                initial={{ left: 0, top: 0, opacity: 0, scale: 0 }}
                animate={{ 
                  left: node.x, 
                  top: node.y, 
                  opacity: 1, 
                  scale: 1,
                }}
                transition={{ 
                  opacity: { duration: 0.4, delay: 0.3 + node.id * 0.1 },
                  scale: { type: "spring", bounce: 0.4, delay: 0.3 + node.id * 0.1 },
                  left: { type: "spring", bounce: 0.2, duration: 1.2, delay: 0.1 + node.id * 0.1 },
                  top: { type: "spring", bounce: 0.2, duration: 1.2, delay: 0.1 + node.id * 0.1 }
                }}
                style={{ transform: 'translate(-50%, -50%)' }}
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
            src="/images/b_remove_background_fo.jpeg" 
            alt="Loki Core" 
            className="w-full h-full object-contain object-top"
            style={{ WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)', maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)' }}
          />
        </motion.div>
      </div>

    </div>
  );
}
