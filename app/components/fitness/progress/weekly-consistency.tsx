"use client";

import { ConsistencyMetrics } from "@/types/fitness/analytics";

function CircularProgress({ percentage, color, icon, label }: { percentage: number, color: string, icon: string, label: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* Background Circle */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle 
            cx="24" cy="24" r={radius} 
            stroke="currentColor" strokeWidth="3" fill="transparent" 
            className="text-white/10"
          />
          {/* Progress Circle */}
          <circle 
            cx="24" cy="24" r={radius} 
            stroke="currentColor" strokeWidth="3" fill="transparent" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${color}`}
          />
        </svg>
        <span className="text-sm z-10">{icon}</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] font-black text-white/70 tracking-widest uppercase">{label}</span>
        <span className="text-[9px] font-bold text-white/40">{percentage}%</span>
      </div>
    </div>
  );
}

export function WeeklyConsistency({ metrics }: { metrics: ConsistencyMetrics }) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Consistency Overview
        </h2>
        <span className="text-[10px] font-bold text-[#ADFF00]/60 uppercase tracking-widest">
          Score: {Math.round(metrics.overallScore)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-y-6 gap-x-2 bg-[#111A10] border border-white/5 rounded-2xl p-5">
        <CircularProgress percentage={metrics.workout} color="text-[#ADFF00]" icon="💪" label="Workout" />
        <CircularProgress percentage={metrics.nutrition} color="text-amber-400" icon="🥗" label="Diet" />
        <CircularProgress percentage={metrics.protein} color="text-red-400" icon="🥩" label="Protein" />
        <CircularProgress percentage={metrics.water} color="text-blue-400" icon="💧" label="Water" />
        <CircularProgress percentage={metrics.steps} color="text-emerald-400" icon="👟" label="Steps" />
        <CircularProgress percentage={metrics.sleep} color="text-indigo-400" icon="😴" label="Sleep" />
      </div>
    </div>
  );
}
