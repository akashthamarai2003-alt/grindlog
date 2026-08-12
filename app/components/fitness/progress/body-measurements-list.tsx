"use client";

import { BodyMeasurement } from "@/types/fitness/analytics";
import { ChevronRight, Ruler } from "lucide-react";

export function BodyMeasurementsList({ measurements }: { measurements: BodyMeasurement[] }) {
  if (measurements.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Measurements
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-white/60 mb-2">No measurements yet</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/80 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10">
            <Ruler className="w-3 h-3" /> Log Measurements
          </button>
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
        <button className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
          History <ChevronRight className="inline w-3 h-3 -mt-0.5" />
        </button>
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
          {measurements.map((m, idx) => (
            <div key={m.id} className={`grid grid-cols-4 p-3.5 items-center text-center ${idx !== measurements.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="text-xs font-bold text-white/80 text-left pl-2 uppercase tracking-wider">{m.name}</div>
              <div className="text-xs font-medium text-white/50">{m.startValue ? `${m.startValue}${m.unit}` : '-'}</div>
              <div className="text-xs font-black text-white">{m.currentValue ? `${m.currentValue}${m.unit}` : '-'}</div>
              <div className={`text-xs font-black ${m.change < 0 ? 'text-[#ADFF00]' : m.change > 0 ? 'text-red-400' : 'text-white/30'}`}>
                {m.change > 0 ? '+' : ''}{m.change !== 0 ? `${m.change}${m.unit}` : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
