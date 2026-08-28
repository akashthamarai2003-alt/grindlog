"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Timer, Calendar, Dumbbell, Home, Ruler, Weight, Target, Utensils, Flame } from 'lucide-react';

const NODES = [
  { id: 1, label: "Intermediate", icon: Activity, angle: -110, distance: 130 },
  { id: 2, label: "Fat Loss", icon: Flame, angle: -70, distance: 160 },
  { id: 3, label: "45 min", icon: Timer, angle: -30, distance: 140 },
  { id: 4, label: "4 per week", icon: Calendar, angle: 15, distance: 160 },
  { id: 5, label: "Gym", icon: Dumbbell, angle: 60, distance: 130 },
  { id: 6, label: "Very Active", icon: Activity, angle: 100, distance: 160 },
  { id: 7, label: "Male", icon: User, angle: 140, distance: 140 },
  { id: 8, label: "75 kg", icon: Weight, angle: 180, distance: 150 },
  { id: 9, label: "175 cm", icon: Ruler, angle: 215, distance: 130 },
  { id: 10, label: "High Protein", icon: Utensils, angle: 255, distance: 160 }
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

  const centerX = windowSize.width / 2;
  const centerY = windowSize.height / 2;
  
  // Calculate node positions based on angle and distance
  // We will scale down slightly on smaller screens
  const scale = Math.min(windowSize.width / 400, 1);
  
  const positionedNodes = NODES.map(node => {
    const rad = (node.angle * Math.PI) / 180;
    const dist = node.distance * scale;
    const x = Math.cos(rad) * dist;
    const y = Math.sin(rad) * dist;
    return { ...node, x, y };
  });

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#0A1108]">
      {/* Background Radar Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-[#ADFF00]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#ADFF00]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#ADFF00]" />
        
        {/* Radar spokes */}
        {[0, 45, 90, 135].map(deg => (
          <div 
            key={deg}
            className="absolute top-1/2 left-1/2 w-[1000px] h-[1px] bg-[#ADFF00] -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
          />
        ))}
      </div>

      {/* SVG Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full">
        {positionedNodes.map(node => (
          <motion.line
            key={`line-${node.id}`}
            x1={centerX}
            y1={centerY}
            x2={centerX + node.x}
            y2={centerY + node.y}
            stroke="#ADFF00"
            strokeWidth="1"
            strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
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
              className="absolute whitespace-nowrap flex items-center gap-2 bg-[#121E12] border border-[#1A2619] px-3 py-1.5 rounded-full shadow-lg"
              style={{
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [node.y - 4, node.y + 4, node.y - 4]
              }}
              transition={{ 
                opacity: { duration: 0.5, delay: 0.5 + node.id * 0.1 },
                scale: { type: "spring", bounce: 0.4, delay: 0.5 + node.id * 0.1 },
                y: { repeat: Infinity, duration: 3 + (node.id % 3), ease: "easeInOut" }
              }}
            >
              <Icon size={14} className="text-[#ADFF00]" />
              <span className="text-xs font-bold text-white tracking-wide">{node.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Center Core and Atoms */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Core Glowing Orb */}
        <motion.div 
          className="relative w-24 h-24 bg-[#ADFF00] rounded-full shadow-[0_0_40px_#ADFF00]"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ 
            scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            default: { type: "spring", bounce: 0.5, duration: 1 }
          }}
        >
          {/* Internal face dots (like the blue character in reference) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3">
            <div className="w-4 h-4 bg-[#0A1108] rounded-full" />
            <div className="w-4 h-4 bg-[#0A1108] rounded-full" />
          </div>
        </motion.div>

        {/* Orbit Ring 1 */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-40 h-12 border-2 border-white/80 rounded-full"
          style={{ transformOrigin: 'center' }}
          initial={{ x: '-50%', y: '-50%', rotateZ: 20, rotateX: 60 }}
          animate={{ rotateZ: 380 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          {/* Electron */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>

        {/* Orbit Ring 2 */}
        <motion.div 
          className="absolute top-1/2 left-1/2 w-40 h-12 border-2 border-white/80 rounded-full"
          style={{ transformOrigin: 'center' }}
          initial={{ x: '-50%', y: '-50%', rotateZ: -70, rotateX: 60 }}
          animate={{ rotateZ: -430 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          {/* Electron */}
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      </div>

    </div>
  );
}
