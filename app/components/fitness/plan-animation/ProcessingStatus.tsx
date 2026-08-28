'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnimationPhase } from './useAnimationTimeline';

interface ProcessingStatusProps {
  phase: AnimationPhase;
  scanIndex: number;
  pillLabels: string[];
}

export function ProcessingStatus({ phase, scanIndex, pillLabels }: ProcessingStatusProps) {
  
  const getStatusText = () => {
    switch(phase) {
      case 'BOOT':
      case 'AI_APPEAR': return "INITIALIZING AI...";
      case 'ORBIT_START': return "CALIBRATING NEURAL NETWORK...";
      case 'DATA_ENTER': return "READING FITNESS PROFILE...";
      case 'NETWORK_COMPLETE': return "PROFILE DATA LOADED";
      case 'ANALYZING': 
        return `ANALYZING ${pillLabels[scanIndex] ? pillLabels[scanIndex].toUpperCase() : 'TRAINING GOALS'}...`;
      case 'DATA_PROCESSED': return "PROFILE ANALYSIS COMPLETE";
      case 'NETWORK_COLLAPSE': return "SYNTHESIZING DATA...";
      case 'AI_COMPLETE': return "OPTIMIZATION COMPLETE";
      case 'PLAN_GENERATING': return "GENERATING YOUR PLAN...";
      case 'COMPLETE': return "PLAN READY";
      default: return "PROCESSING...";
    }
  };

  const statusText = getStatusText();

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 drop-shadow-md">
      <h2 className="text-xl font-black text-white mb-2">Building your perfect plan...</h2>
      <p className="text-sm text-gray-300 mb-4">AI is analyzing your body scan and fitness profile...</p>
      
      <div className="h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="uppercase text-xs font-bold tracking-widest text-[#39FF14]"
          >
            {statusText}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
