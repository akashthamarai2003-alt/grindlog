"use client";

import { AnalyticsPeriod, TransformationMetrics } from "@/types/fitness/analytics";
import { Flame } from "lucide-react";

interface ProgressHeaderProps {
  transformation: TransformationMetrics;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  isFetching?: boolean;
}

export function ProgressHeader({ transformation, period, onPeriodChange, isFetching }: ProgressHeaderProps) {
  const periods: AnalyticsPeriod[] = ['7D', '30D', '3M', '6M', 'ALL'];

  return (
    <div className="w-full flex flex-col pt-8 pb-4">
      <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
        Your Progress
      </h1>
      
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm font-bold text-white/60">
          Day <span className="text-[#ADFF00]">{transformation.transformationDay}</span> of your transformation
        </p>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20">
          <Flame className="w-3.5 h-3.5 text-[#ADFF00]" />
          <span className="text-xs font-black text-[#ADFF00] tracking-widest">{transformation.streak} Day Streak</span>
        </div>
      </div>

      <div className="relative w-full">
        <div className="w-full flex items-center justify-between bg-[#111A10] p-1.5 rounded-[16px] border border-white/5 overflow-x-auto snap-x hide-scrollbar">
          {periods.map(p => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                className={`flex-1 min-w-[64px] px-3 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all snap-center flex items-center justify-center gap-1 cursor-pointer touch-manipulation ${
                  isActive 
                    ? "bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.2)]" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{p}</span>
                {isActive && isFetching && (
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                )}
              </button>
            );
          })}
        </div>
        {isFetching && (
          <div className="absolute -bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#ADFF00] to-transparent animate-pulse rounded-full" />
        )}
      </div>
    </div>
  );
}
