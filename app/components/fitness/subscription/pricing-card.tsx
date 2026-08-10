"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { FitnessPlanConfig } from "@/lib/fitness/subscription/types";
import { motion } from "motion/react";

interface PricingCardProps {
  plan: FitnessPlanConfig;
  isActive: boolean;
  onUpgrade: (planId: string) => void;
  isPopular?: boolean;
}

export function PricingCard({ plan, isActive, onUpgrade, isPopular }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isActive) return;
    setLoading(true);
    await onUpgrade(plan.id);
    setLoading(false); // Usually we'd redirect or open a modal before this
  };

  const priceFormatted = plan.priceInPaise / 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-[32px] p-6 shadow-sm border ${
        isPopular ? "border-emerald-500 shadow-emerald-500/10" : "border-gray-100"
      } flex flex-col`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
          Most Popular
        </div>
      )}

      <div className="mb-6 text-center mt-2">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm font-medium text-gray-500 mb-4">{plan.description}</p>
        <div className="flex items-end justify-center gap-1">
          <span className="text-[32px] font-black text-gray-900 tracking-tight leading-none">₹{priceFormatted}</span>
          <span className="text-sm font-semibold text-gray-400 mb-1.5">/mo</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 mb-8">
        <div className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-2">Includes</div>
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[14px] font-medium text-gray-700 leading-snug">
              {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
        ))}
        <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[14px] font-medium text-gray-700 leading-snug">
              {plan.aiDailyLimit} AI Insights / day
            </span>
          </div>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={isActive || loading}
        className={`w-full py-4 rounded-2xl text-[15px] font-bold transition-all flex items-center justify-center gap-2 ${
          isActive 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : isPopular
              ? "bg-gray-900 hover:bg-black text-white shadow-md shadow-gray-900/20"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isActive ? "Current Plan" : isPopular ? "Upgrade to Pro" : `Get ${plan.name}`}
      </button>
    </motion.div>
  );
}
