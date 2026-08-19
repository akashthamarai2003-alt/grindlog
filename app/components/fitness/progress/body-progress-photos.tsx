"use client";

import { useState } from "react";
import { BodyPhotoScan } from "@/types/fitness/analytics";
import { Camera, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function SafeImage({ src, alt, className, style }: { src: string, alt: string, className?: string, style?: any }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-[#111A10] text-white/20 text-xs font-bold uppercase tracking-widest pointer-events-none ${className}`}
        style={style}
      >
        Image Deleted
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={() => setError(true)} 
    />
  );
}

export function BodyProgressPhotos({ first, latest }: { first: BodyPhotoScan | null, latest: BodyPhotoScan | null }) {
  const [view, setView] = useState<'front' | 'left' | 'right' | 'back'>('front');
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
          <Link href="/fitness/progress/add-scan" className="flex items-center gap-2 px-4 py-2 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-xs uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors">
            <Camera className="w-3 h-3" /> Add Scan
          </Link>
        </div>
      </div>
    );
  }

  const beforeImg = view === 'front' ? first.frontUrl : view === 'left' ? first.leftUrl : view === 'right' ? first.rightUrl : first.backUrl;
  const afterImg = view === 'front' ? latest.frontUrl : view === 'left' ? latest.leftUrl : view === 'right' ? latest.rightUrl : latest.backUrl;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
            Body Progress
          </h2>
          <Link 
            href="/fitness/progress/add-scan" 
            className="sm:hidden flex items-center justify-center w-7 h-7 bg-[#ADFF00]/10 text-[#ADFF00] rounded-full border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            {['front', 'left', 'right', 'back'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${view === v ? 'bg-[#ADFF00] text-black' : 'text-white/40 hover:text-white'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Link 
            href="/fitness/progress/add-scan" 
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#ADFF00]/10 text-[#ADFF00] rounded-md font-black text-[9px] uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors"
          >
            <Camera className="w-3 h-3" /> Add
          </Link>
        </div>
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col">
        {/* Slider Container */}
        <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden touch-none">
          {/* After Image (Base) */}
          {afterImg ? (
            <SafeImage src={afterImg} alt="Latest Scan" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">No Image</div>
          )}

          {/* Before Image (Clipped) */}
          {beforeImg ? (
            <SafeImage 
              src={beforeImg} 
              alt="First Scan" 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
              style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
            />
          ) : (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-[#111A10] text-white/20 text-xs font-bold uppercase tracking-widest pointer-events-none" 
              style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
            >
              No Image
            </div>
          )}

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
