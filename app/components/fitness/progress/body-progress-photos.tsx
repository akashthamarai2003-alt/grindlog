"use client";

import { useState } from "react";
import { BodyPhotoScan } from "@/types/fitness/analytics";
import { Camera, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export function BodyProgressPhotos({ first, latest }: { first: BodyPhotoScan | null, latest: BodyPhotoScan | null }) {
  const [view, setView] = useState<'front' | 'side' | 'back'>('front');
  const [sliderPos, setSliderPos] = useState(50);

  if (!first || !latest) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Progress
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48">
          <Camera className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-sm font-bold text-white/60 mb-2">No body scans yet</p>
          <p className="text-xs font-medium text-white/40 mb-4 px-4">Complete your first body scan to start visual progress tracking.</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-xs uppercase tracking-widest border border-[#ADFF00]/20">
            <Camera className="w-3 h-3" /> Add Scan
          </button>
        </div>
      </div>
    );
  }

  const beforeImg = view === 'front' ? first.frontUrl : view === 'side' ? first.sideUrl : first.backUrl;
  const afterImg = view === 'front' ? latest.frontUrl : view === 'side' ? latest.sideUrl : latest.backUrl;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Progress
        </h2>
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
          {['front', 'side', 'back'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${view === v ? 'bg-[#ADFF00] text-black' : 'text-white/40 hover:text-white'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col">
        {/* Slider Container */}
        <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden touch-none">
          {/* After Image (Base) */}
          {afterImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={afterImg} alt="Latest Scan" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">No Image</div>
          )}

          {/* Before Image (Clipped) */}
          <div 
            className="absolute inset-0 h-full overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            {beforeImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beforeImg} alt="First Scan" className="absolute top-0 left-0 h-full object-cover w-[100vw]" style={{ minWidth: '100%', maxWidth: 'none' }} />
            ) : (
              <div className="absolute top-0 left-0 w-screen h-full bg-[#111A10] flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">No Image</div>
            )}
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize hover:bg-[#ADFF00] transition-colors"
            style={{ left: `calc(${sliderPos}% - 2px)` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-black rounded-full shadow-xl flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 rotate-90" />
            </div>
          </div>
          
          {/* Interaction Area (Invisible input range overlay) */}
          <input 
            type="range" 
            min="0" max="100" 
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
          />

          {/* Labels */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[9px] font-black text-white/80 uppercase tracking-widest pointer-events-none">Start</div>
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[9px] font-black text-[#ADFF00] uppercase tracking-widest pointer-events-none">Current</div>
        </div>

      </div>
    </div>
  );
}
