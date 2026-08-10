"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Target } from "lucide-react";
import { OnboardingData } from "@/types/fitness/onboarding";

interface TransformationCardProps {
  profile: Partial<OnboardingData>;
}

export function TransformationCard({ profile }: TransformationCardProps) {
  const hasWeights = profile.weight && profile.target_weight;
  
  const isLosing = profile.goal === "Lose Fat";
  const isGaining = profile.goal === "Build Muscle" || profile.goal === "Build Strength";
  
  // Determine if goal is ambiguous regarding weight
  const isAmbiguous = !isLosing && !isGaining;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full bg-gray-900 rounded-3xl p-5 flex flex-col justify-between aspect-square max-h-[160px]"
    >
      <div className="bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center">
        {isLosing ? (
          <TrendingDown className="w-5 h-5 text-emerald-400" />
        ) : isGaining ? (
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        ) : (
          <Target className="w-5 h-5 text-emerald-400" />
        )}
      </div>
      
      {hasWeights ? (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Current
              </p>
              <h4 className="text-xl font-bold text-white leading-none">
                {profile.weight} <span className="text-sm text-gray-400 font-medium">kg</span>
              </h4>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Target
              </p>
              <h4 className="text-xl font-bold text-white leading-none">
                {profile.target_weight} <span className="text-sm text-gray-400 font-medium">kg</span>
              </h4>
            </div>
          </div>
          
          {!isAmbiguous ? (
            <div className="bg-gray-800 rounded-lg p-2 flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-gray-300">Remaining:</span>
              <span className="text-sm font-bold text-emerald-400">
                {Math.abs(profile.weight! - profile.target_weight!).toFixed(1)} kg
              </span>
            </div>
          ) : (
            <p className="text-xs font-medium text-gray-400 text-center">
              Your transformation journey starts here.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1 mt-auto">
          <h4 className="text-lg font-bold text-white leading-tight">Transformation</h4>
          <p className="text-xs font-medium text-gray-400">
            Complete your profile to track transformation.
          </p>
        </div>
      )}
    </motion.div>
  );
}
