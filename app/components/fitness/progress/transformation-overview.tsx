"use client";

import { useEffect } from "react";
import { TransformationMetrics } from "@/types/fitness/analytics";
import { ArrowRight, ChevronRight, Target } from "lucide-react";
import confetti from "canvas-confetti";

export function TransformationOverview({ metrics }: { metrics: TransformationMetrics }) {
  const hasData = metrics.startingWeight !== null && metrics.currentWeight !== null && metrics.targetWeight !== null;

  useEffect(() => {
    if (hasData && metrics.completionPercentage >= 100) {
      const storageKey = `grindlog_confetti_${metrics.targetWeight}`;
      
      // Only fire if we haven't fired for this specific goal yet
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, 'true');
        
        // Fire confetti when goal is reached!
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ADFF00', '#FFFFFF']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ADFF00', '#FFFFFF']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, [hasData, metrics.completionPercentage, metrics.targetWeight]);

  const formatWeight = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "0";
    const num = Number(val);
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  const formatChange = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(Number(val))) return "0";
    const num = Math.abs(Number(val));
    return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
        Transformation Overview
      </h2>

      <div className="w-full bg-[#111A10] border border-[#ADFF00]/30 rounded-[24px] p-6 shadow-[0_0_40px_rgba(173,255,0,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADFF00]/5 blur-[50px] rounded-full" />
        
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-6 text-center z-10 relative">
            <Target className="w-10 h-10 text-white/20 mb-3" />
            <p className="text-sm font-bold text-white/60 mb-1">No weight goal set</p>
            <p className="text-xs font-medium text-white/40">Set your starting and target weight to track transformation.</p>
          </div>
        ) : (
          <div className="flex flex-col z-10 relative">
            {/* Main numbers */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Start</span>
                <span className="text-xl font-black text-white">{formatWeight(metrics.startingWeight)}<span className="text-[10px] text-white/50 ml-0.5">kg</span></span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#ADFF00]" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-[#ADFF00]/70 uppercase tracking-widest mb-1">Current</span>
                <span className="text-2xl font-black text-[#ADFF00]">{formatWeight(metrics.currentWeight)}<span className="text-[10px] text-[#ADFF00]/50 ml-0.5">kg</span></span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Target</span>
                <span className="text-xl font-black text-white">{formatWeight(metrics.targetWeight)}<span className="text-[10px] text-white/50 ml-0.5">kg</span></span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex flex-col gap-2 mb-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-[#ADFF00]">{formatChange(metrics.totalChange)} kg Changed</span>
                {metrics.completionPercentage >= 100 ? (
                  <span className="text-[#ADFF00] drop-shadow-[0_0_8px_rgba(173,255,0,0.5)]">Goal Achieved 🏆</span>
                ) : (
                  <span className="text-white/40">{formatChange(metrics.remainingChange)} kg Left</span>
                )}
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, metrics.completionPercentage))}%` }}
                />
              </div>
            </div>

            {/* Bottom Button */}
            <button 
              onClick={() => document.getElementById('transformation-details')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">View Transformation Details</span>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
