"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { OnboardingData } from "@/types/fitness/onboarding";

interface TransformationCardProps {
  profile: Partial<OnboardingData>;
  premiumLevel?: string;
}

export function TransformationCard({ profile, premiumLevel = "core" }: TransformationCardProps) {
  const startWeight = (profile as any).weight_trend_baseline || profile.weight || null;
  const currentWeight = profile.weight || null;
  const targetWeight = profile.target_weight || null;
  
  // Calculate Progress Percentage
  let progressPercentage = 0;
  const hasWeights = typeof startWeight === "number" && typeof currentWeight === "number" && typeof targetWeight === "number";
  const totalGoal = hasWeights ? Math.abs(startWeight - targetWeight) : 0;
  if (hasWeights && totalGoal > 0) {
    const isBulking = targetWeight > startWeight;
    let progressMade = isBulking ? (currentWeight - startWeight) : (startWeight - currentWeight);
    progressMade = Math.max(0, progressMade); // Floor at 0 if moving wrong direction
    progressPercentage = Math.round(Math.min(100, Math.max(0, (progressMade / totalGoal) * 100)));
  } else if (hasWeights && totalGoal === 0) {
    progressPercentage = 100;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/40 via-transparent to-[#ADFF00]/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/5 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Your Transformation</h3>
          </div>
          <span className="text-xs font-medium text-[#ADFF00] bg-[#ADFF00]/10 px-2.5 py-1 rounded-full">
            {progressPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Start</span>
            <span className="text-2xl font-black tracking-tight text-white">{startWeight ?? "--"} <span className="text-sm font-medium text-white/50">kg</span></span>
          </div>

          <div className="flex flex-col items-center justify-center pt-4">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#ADFF00]/50 to-transparent relative flex justify-center">
              <motion.div 
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[11px] w-6 h-6 bg-[#111A10] rounded-full border border-[#ADFF00]/30 flex items-center justify-center"
              >
                <ArrowRight className="w-3 h-3 text-[#ADFF00]" />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-white/50 uppercase tracking-wider mb-1">Target</span>
            <span className="text-2xl font-black tracking-tight text-[#ADFF00] drop-shadow-[0_0_10px_rgba(173,255,0,0.3)]">{targetWeight ?? "--"} <span className="text-sm font-medium text-[#ADFF00]/50">kg</span></span>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] font-medium text-white/40 uppercase tracking-wider px-1">
            <span>Progress</span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[#ADFF00]/50 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] rounded-full relative"
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/20 to-transparent" />
            </motion.div>
          </div>
        </div>

        {premiumLevel === "core" ? (
          <Link href="/payment?returnTo=/&intent=upgrade_pro" prefetch={true} className="w-full mt-3">
            <button className="w-full py-3 px-4 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 transition-all duration-300 rounded-xl flex items-center justify-between group/btn border border-[#ADFF00]/20">
              <span className="text-sm font-semibold text-[#ADFF00] group-hover/btn:text-[#ADFF00] transition-colors">Upgrade to unlock Automated AI Tracking</span>
              <div className="bg-[#ADFF00] text-black text-[9px] font-black uppercase px-2 py-1 rounded-full">Pro</div>
            </button>
          </Link>
        ) : (
          <Link href="/progress" prefetch={true} className="w-full mt-3">
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 active:bg-white/5 transition-all duration-300 rounded-xl flex items-center justify-between group/btn border border-white/5">
              <span className="text-sm font-semibold text-white/90 group-hover/btn:text-white transition-colors">View Full Progress</span>
              <ArrowRight className="w-4 h-4 text-[#ADFF00] group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        )}
        
      </div>
    </motion.div>
  );
}
