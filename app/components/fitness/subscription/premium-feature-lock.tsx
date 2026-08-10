"use client";

import { motion } from "motion/react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PremiumFeatureLockProps {
  isLocked: boolean;
  featureName: string;
  description: string;
  children: ReactNode;
  limitReachedMessage?: string;
  isLimitReached?: boolean;
}

export function PremiumFeatureLock({ 
  isLocked, 
  featureName, 
  description, 
  children,
  limitReachedMessage,
  isLimitReached 
}: PremiumFeatureLockProps) {
  
  if (!isLocked && !isLimitReached) {
    return <>{children}</>;
  }

  const title = isLimitReached ? "AI Limit Reached" : featureName;
  const subtitle = isLimitReached ? limitReachedMessage : description;

  return (
    <div className="relative group rounded-3xl overflow-hidden">
      {/* Blurred background preview */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none transition-all group-hover:blur-md">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-white/90 via-white/80 to-white/60 backdrop-blur-[2px]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 max-w-sm w-full text-center flex flex-col items-center"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-100 mb-4 shadow-inner">
            {isLimitReached ? (
              <Sparkles className="w-6 h-6 text-emerald-600" />
            ) : (
              <Lock className="w-6 h-6 text-emerald-600" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-[14px] text-gray-500 font-medium mb-6 leading-relaxed">
            {subtitle}
          </p>
          
          <Link 
            href="/fitness/pro"
            className="w-full bg-gray-900 hover:bg-black text-white text-[15px] font-bold py-3.5 rounded-2xl transition-colors shadow-md flex items-center justify-center gap-2 group/btn"
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
