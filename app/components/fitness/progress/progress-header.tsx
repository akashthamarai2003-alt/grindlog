"use client";

import { AnalyticsPeriod, TransformationMetrics } from "@/types/fitness/analytics";
import { Flame } from "lucide-react";

interface ProgressHeaderProps {
  transformation: TransformationMetrics;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  isFetching?: boolean;
  joinedDate?: string;
}

function getPeriodDescription(period: AnalyticsPeriod, joinedDate?: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  
  const formatDate = (d: Date) => `${months[d.getMonth()]} ${d.getDate()}`;
  
  if (period === '7D') {
    const start = new Date(now.getTime());
    start.setDate(start.getDate() - 7);
    return `Past 7 Days • ${formatDate(start)} – ${formatDate(now)}`;
  }
  if (period === '30D') {
    const start = new Date(now.getTime());
    start.setDate(start.getDate() - 30);
    return `Past 30 Days • ${formatDate(start)} – ${formatDate(now)}`;
  }
  if (period === '3M') {
    const start = new Date(now.getTime());
    start.setMonth(start.getMonth() - 3);
    return `Past 3 Months • ${formatDate(start)} – ${formatDate(now)}`;
  }
  if (period === '6M') {
    const start = new Date(now.getTime());
    start.setMonth(start.getMonth() - 6);
    return `Past 6 Months • ${formatDate(start)} – ${formatDate(now)}`;
  }
  if (period === 'ALL') {
    if (joinedDate) {
      try {
        const jd = new Date(joinedDate);
        return `All Time • Since ${months[jd.getMonth()]} ${jd.getDate()}, ${jd.getFullYear()}`;
      } catch {}
    }
    return `All Time • All recorded logs`;
  }
  return '';
}

export function ProgressHeader({ transformation, period, onPeriodChange, isFetching, joinedDate }: ProgressHeaderProps) {
  const periods: AnalyticsPeriod[] = ['7D', '30D', '3M', '6M', 'ALL'];
  const periodDesc = getPeriodDescription(period, joinedDate);

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

      {/* Active Timeframe Context & Sync Status */}
      <div className="flex items-center justify-between mt-2.5 px-1">
        <span className="text-[11px] font-bold text-white/50 tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]/80 inline-block" />
          {periodDesc}
        </span>
        <div className="flex items-center gap-1">
          {isFetching ? (
            <span className="text-[10px] font-bold text-[#ADFF00] uppercase tracking-wider animate-pulse">
              Updating...
            </span>
          ) : (
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
              Synced ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
