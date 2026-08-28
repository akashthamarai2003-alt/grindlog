'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AICharacterProps {
  isVisible: boolean; // fade in when true
  isProcessing: boolean; // subtle glow increase when processing  
  isComplete: boolean; // brighter glow when complete
}

export function AICharacter({ isVisible, isProcessing, isComplete }: AICharacterProps) {
  const shouldReduceMotion = useReducedMotion();

  const getGlowIntensity = () => {
    if (isComplete) return 0.7;
    if (isProcessing) return 0.55;
    return 0.35;
  };

  const glowStyle = {
    filter: `drop-shadow(0 0 20px rgba(57,255,20,${getGlowIntensity()}))`
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isVisible ? { 
          opacity: 1, 
          scale: 1,
        } : { 
          opacity: 0, 
          scale: 0.8 
        }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <motion.img
        src="/images/b_remove_background_fo.png"
        alt="GrindLog AI"
        className="w-[140px] h-[140px] md:w-[200px] md:h-[200px] object-contain object-top"
        style={glowStyle}
        animate={
          shouldReduceMotion ? {} :
          isProcessing ? {
            scale: [1.0, 1.035, 1.0],
            transition: { duration: 0.4, ease: "easeInOut" }
          } : {
            scale: [1.0, 1.025, 1.0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        }
      />
    </motion.div>
  );
}
