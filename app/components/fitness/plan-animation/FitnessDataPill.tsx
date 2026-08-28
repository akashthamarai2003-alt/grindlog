'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export type PillState = 'hidden' | 'entering' | 'visible' | 'processing' | 'collapsing';

interface FitnessDataPillProps {
  icon: LucideIcon;
  label: string;
  state: PillState;
  delay: number;
  style?: React.CSSProperties;
}

export function FitnessDataPill({ icon: Icon, label, state, delay, style }: FitnessDataPillProps) {
  let animateProps: any = {};
  let transitionProps: any = {};

  switch (state) {
    case 'hidden':
      animateProps = { opacity: 0, scale: 0.7, filter: 'blur(4px)' };
      transitionProps = { duration: 0 };
      break;
    case 'entering':
      animateProps = { opacity: 1, scale: 1, filter: 'blur(0px)' };
      transitionProps = { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay };
      break;
    case 'visible':
      animateProps = { 
        opacity: 1, 
        scale: 1, 
        filter: 'blur(0px)', 
        borderColor: 'rgba(22,163,74,0.3)', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)', 
        color: '#ffffff' 
      };
      transitionProps = { duration: 0.2 };
      break;
    case 'processing':
      animateProps = { 
        opacity: 1,
        filter: 'blur(0px)',
        borderColor: '#39FF14',
        boxShadow: '0 0 12px rgba(57,255,20,0.25)',
        scale: [1, 1.06, 1],
      };
      transitionProps = { 
        duration: 0.4,
        scale: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
      };
      break;
    case 'collapsing':
      animateProps = { opacity: 0, scale: 0.5, x: 0, y: 0 };
      transitionProps = { duration: 0.6 };
      break;
  }

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, scale: 0.7, filter: 'blur(4px)' }}
      animate={animateProps}
      transition={transitionProps}
      className="absolute flex items-center gap-1.5 whitespace-nowrap bg-[#061506]/85 border border-[rgba(22,163,74,0.3)] px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-[2px]"
    >
      <Icon size={13} className="text-[#39FF14] shrink-0" />
      <span 
        className="text-xs font-bold tracking-wide transition-colors duration-200" 
        style={{ color: state === 'processing' ? '#a7f3d0' : '#ffffff' }}
      >
        {label}
      </span>
    </motion.div>
  );
}
