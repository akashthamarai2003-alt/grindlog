"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, TrendingDown, TrendingUp, Sparkles } from "lucide-react";
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

  // Calculate Progress Percentage and Deltas
  let progressPercentage = 0;
  let weightChange = 0;
  let remainingKg = 0;
  const hasWeights = typeof startWeight === "number" && typeof currentWeight === "number" && typeof targetWeight === "number";
  const totalGoal = hasWeights ? Math.abs(startWeight - targetWeight) : 0;
  const isBulking = hasWeights && targetWeight > startWeight;

  if (hasWeights && totalGoal > 0) {
    const progressMade = isBulking ? (currentWeight - startWeight) : (startWeight - currentWeight);
    weightChange = Math.round(progressMade * 10) / 10;
    progressPercentage = Math.round(Math.min(100, Math.max(0, (Math.max(0, progressMade) / totalGoal) * 100)));
    remainingKg = Math.max(0, Math.round(Math.abs(targetWeight - currentWeight) * 10) / 10);
  } else if (hasWeights && totalGoal === 0) {
    progressPercentage = 100;
  }

  const deltaKg = hasWeights ? Math.round((currentWeight - startWeight) * 10) / 10 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/40 via-transparent to-[#ADFF00]/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative bg-[#111A10] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/5 rounded-full blur-[40px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center border border-[#ADFF00]/20">
              <Target className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">Your Transformation</h3>
              <p className="text-[10px] text-white/40 font-medium">Goal Tracking & Milestones</p>
            </div>
          </div>
          <span className="text-xs font-black text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/25 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(173,255,0,0.15)]">
            {progressPercentage}%
          </span>
        </div>

        {/* 3-Column Milestone Hierarchy: START | CURRENT | TARGET */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          {/* Start Weight */}
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Start</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-xl font-black text-white">{startWeight ?? "--"}</span>
              <span className="text-[10px] font-bold text-white/40">kg</span>
            </div>
            <span className="text-[9px] text-white/30 font-medium mt-0.5">Baseline</span>
          </div>

          {/* Current Weight (Prominent Hero Focus) */}
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/30 shadow-[0_0_15px_rgba(173,255,0,0.15)] relative">
            <span className="text-[9px] sm:text-[10px] font-black text-[#ADFF00] uppercase tracking-wider mb-1">Current</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-2xl font-black text-white">{currentWeight ?? "--"}</span>
              <span className="text-[10px] font-bold text-[#ADFF00]/70">kg</span>
            </div>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-0.5 ${
              deltaKg < 0
                ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                : deltaKg > 0
                ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                : 'text-white/40 bg-white/5'
            }`}>
              {deltaKg !== 0 ? `${deltaKg > 0 ? '+' : ''}${deltaKg} kg` : 'Active'}
            </span>
          </div>

          {/* Target Weight */}
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1">Target</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-xl font-black text-[#ADFF00] drop-shadow-[0_0_8px_rgba(173,255,0,0.3)]">{targetWeight ?? "--"}</span>
              <span className="text-[10px] font-bold text-[#ADFF00]/50">kg</span>
            </div>
            <span className="text-[9px] text-[#ADFF00]/40 font-medium mt-0.5">Goal</span>
          </div>
        </div>

        {/* Progress Bar & Subtext */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex justify-between items-center text-[10px] font-bold px-1">
            <span className="text-white/40 uppercase tracking-wider">Transformation</span>
            <span className="text-[#ADFF00] font-black">
              {progressPercentage >= 100 
                ? "Goal Achieved! 🎉" 
                : isBulking
                ? `${weightChange > 0 ? `+${weightChange} kg gained` : '0 kg'} · ${remainingKg} kg to go`
                : `${weightChange > 0 ? `${weightChange} kg lost` : '0 kg'} · ${remainingKg} kg to go`}
            </span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#ADFF00]/60 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] rounded-full relative"
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Action Button */}
        {premiumLevel === "core" ? (
          <Link href="/payment?returnTo=/&intent=upgrade_pro" prefetch={true} className="w-full mt-1">
            <button className="w-full py-3 px-4 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 transition-all duration-300 rounded-xl flex items-center justify-between group/btn border border-[#ADFF00]/20 cursor-pointer">
              <span className="text-xs sm:text-sm font-bold text-[#ADFF00]">Upgrade to unlock Automated AI Tracking</span>
              <div className="bg-[#ADFF00] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Pro</div>
            </button>
          </Link>
        ) : (
          <Link href="/progress" prefetch={true} className="w-full mt-1">
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 active:bg-white/5 transition-all duration-300 rounded-xl flex items-center justify-between group/btn border border-white/5 cursor-pointer">
              <span className="text-xs sm:text-sm font-bold text-white/90 group-hover/btn:text-white transition-colors">View Full Progress & Weight History</span>
              <ArrowRight className="w-4 h-4 text-[#ADFF00] group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
