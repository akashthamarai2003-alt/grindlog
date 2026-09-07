"use client";

import { BodyMeasurement } from "@/types/fitness/analytics";
import { ChevronRight, Ruler, Lock } from "lucide-react";
import Link from "next/link";

export function BodyMeasurementsList({ 
  measurements, 
  isBulking = false,
  isPro = true,
  onProClick
}: { 
  measurements: BodyMeasurement[]; 
  isBulking?: boolean;
  isPro?: boolean;
  onProClick?: (feature: string) => void;
}) {
  if (measurements.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Measurements
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-white/60 mb-2">No measurements yet</p>
          {isPro ? (
            <Link href="/progress/log-measurements" className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/80 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-colors">
              <Ruler className="w-3 h-3" /> Log Measurements
            </Link>
          ) : (
            <button 
              type="button" 
              onClick={() => onProClick?.("Body Measurements")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest border border-white/15 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Log Measurements <span className="text-[9px] text-amber-400 uppercase font-black ml-1">PRO</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Measurements
        </h2>
        {isPro ? (
          <Link href="/progress/log-measurements" className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest hover:text-white transition-colors">
            Add +
          </Link>
        ) : (
          <button 
            type="button"
            onClick={() => onProClick?.("Body Measurements")}
            className="text-[10px] font-black text-white/70 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Lock className="w-3 h-3 text-amber-400" /> Add + <span className="text-[9px] text-amber-400 uppercase font-black ml-0.5">PRO</span>
          </button>
        )}
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-4 p-3 bg-white/5 text-[9px] font-black tracking-widest text-white/40 uppercase border-b border-white/5 text-center">
          <div className="text-left pl-2">Part</div>
          <div>Start</div>
          <div>Current</div>
          <div>Change</div>
        </div>
        
        {/* List */}
        <div className="flex flex-col">
          {measurements.map((m, idx) => {
            const isMuscleGroup = /arm|chest|thigh|calf|shoulder|bicep|tricep|glute|forearm/i.test(m.name);
            const isFatMarker = /waist|hip|neck|belly|stomach/i.test(m.name);

            let isGood = false;
            let isBad = false;

            if (isMuscleGroup) {
              // For muscles: growing is always good, shrinking is bad
              isGood = m.change > 0;
              isBad = m.change < 0;
            } else if (isFatMarker) {
              // For fat markers (waist/hips): shrinking is good, growing is bad
              isGood = m.change < 0;
              isBad = m.change > 0;
            } else {
              // Fallback
              isGood = isBulking ? m.change > 0 : m.change < 0;
              isBad = isBulking ? m.change < 0 : m.change > 0;
            }
            const textColorClass = isGood ? 'text-[#ADFF00]' : isBad ? 'text-red-400' : 'text-white/30';

            return (
              <div key={m.id} className={`grid grid-cols-4 p-3.5 items-center text-center ${idx !== measurements.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="text-xs font-bold text-white/80 text-left pl-2 uppercase tracking-wider">{m.name}</div>
                <div className="text-xs font-medium text-white/50">{m.startValue !== null && m.startValue !== undefined ? `${m.startValue} ${m.unit}` : '-'}</div>
                <div className="text-xs font-black text-white">{m.currentValue !== null && m.currentValue !== undefined ? `${m.currentValue} ${m.unit}` : '-'}</div>
                <div className={`text-xs font-black ${textColorClass}`}>
                  {m.change > 0 ? '+' : ''}{m.change !== 0 ? `${m.change} ${m.unit}` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
