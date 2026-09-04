"use client";

import { useState } from "react";
import { BodyPhotoScan } from "@/types/fitness/analytics";
import { Camera, Calendar, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

function SafeImage({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-[#111A10] text-white/20 text-xs font-bold uppercase tracking-widest pointer-events-none ${className}`}
        style={style}
      >
        No Image
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

export function BodyProgressPhotos({ first, latest }: { first: BodyPhotoScan | null; latest: BodyPhotoScan | null }) {
  const router = useRouter();
  const [view, setView] = useState<'front' | 'left' | 'right' | 'back'>('front');
  const [sliderPos, setSliderPos] = useState(50);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Compute days since most recent scan
  const mostRecentDate = latest?.date || first?.date;
  let daysSinceScan = 999;
  if (mostRecentDate) {
    const lastDate = new Date(mostRecentDate);
    const today = new Date();
    const diff = Math.abs(today.getTime() - lastDate.getTime());
    daysSinceScan = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const handleAddClick = (e: React.MouseEvent) => {
    if (daysSinceScan < 14) {
      e.preventDefault();
      setShowWarningModal(true);
    }
  };

  // State A: No scans at all
  if (!first && !latest) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Body Progress
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-52">
          <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white mb-1">No body scans yet</p>
          <p className="text-xs font-medium text-white/40 mb-4 max-w-xs">
            Complete your baseline body scan to start visual progress tracking and compare your transformation over time.
          </p>
          <Link 
            href="/progress/add-scan" 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ADFF00] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#baff22] transition-colors shadow-lg shadow-[#ADFF00]/10"
          >
            <Camera className="w-3.5 h-3.5" /> Add Scan
          </Link>
        </div>
      </div>
    );
  }

  const isSingleScan = Boolean(first && (!latest || first.id === latest.id));
  const activeScan = latest || first;

  const getImageForView = (scan: BodyPhotoScan | null, angle: 'front' | 'left' | 'right' | 'back') => {
    if (!scan) return null;
    if (angle === 'front') return scan.frontUrl;
    if (angle === 'left') return scan.leftUrl;
    if (angle === 'right') return scan.rightUrl;
    return scan.backUrl;
  };

  const beforeImg = first ? getImageForView(first, view) : null;
  const afterImg = latest ? getImageForView(latest, view) : null;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header & Angle Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
              Body Progress
            </h2>
            {isSingleScan && (
              <span className="px-2 py-0.5 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 text-[9px] font-bold text-[#ADFF00] uppercase tracking-wider">
                Baseline Scan
              </span>
            )}
          </div>
          <Link 
            href="/progress/add-scan" 
            onClick={handleAddClick}
            className="sm:hidden flex items-center justify-center w-7 h-7 bg-[#ADFF00]/10 text-[#ADFF00] rounded-full border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Angle tabs */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            {(['front', 'left', 'right', 'back'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${
                  view === v ? 'bg-[#ADFF00] text-black font-extrabold shadow-sm' : 'text-white/40 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Link 
            href="/progress/add-scan" 
            onClick={handleAddClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 text-[#ADFF00] rounded-md font-black text-[9px] uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors"
          >
            <Camera className="w-3 h-3" /> Add Scan
          </Link>
        </div>
      </div>

      {/* Main Showcase / Comparison Container */}
      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
        {isSingleScan ? (
          /* Single Baseline View */
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
              {getImageForView(activeScan, view) ? (
                <SafeImage 
                  src={getImageForView(activeScan, view)!} 
                  alt={`Baseline ${view} view`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 text-xs font-bold uppercase tracking-widest gap-2">
                  <Camera className="w-6 h-6 text-white/20" />
                  <span>No {view} view recorded</span>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                Baseline (Day 1)
              </div>
              {activeScan?.date && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-bold text-[#ADFF00] tracking-wider border border-white/10">
                  {new Date(activeScan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Educational Cadence Tip */}
            <div className="bg-[#142013] border border-[#ADFF00]/10 rounded-xl p-3 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#ADFF00] shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] text-white/70 leading-relaxed">
                <span className="text-white font-bold">Baseline established.</span> Next scan recommended in{" "}
                <span className="text-[#ADFF00] font-bold">14 days</span>. Taking your next check-in scan will automatically unlock the Before/After comparison slider!
              </div>
            </div>
          </div>
        ) : (
          /* Two Scans: Interactive Comparison Slider */
          <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden touch-none select-none">
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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border border-black/10">
                <SlidersHorizontal className="w-4 h-4 rotate-90" />
              </div>
            </div>
            
            {/* Interaction Area */}
            <input 
              type="range" 
              min="0" max="100" 
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Progress comparison slider"
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />

            {/* Floating Date Labels */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-white/80 uppercase tracking-widest pointer-events-none border border-white/10">
              Start {first?.date ? `(${new Date(first.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}
            </div>
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] font-black text-[#ADFF00] uppercase tracking-widest pointer-events-none border border-white/10">
              Current {latest?.date ? `(${new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : ''}
            </div>
          </div>
        )}
      </div>

      {/* 14-Day Cadence Advisory Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111A10] border border-[#1A2619] rounded-2xl p-6 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
          >
            <div className="w-12 h-12 rounded-full bg-[#ADFF00]/10 text-[#ADFF00] border border-[#ADFF00]/20 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Recommended: 14-Day Check-in</h3>
            <p className="text-white/60 text-xs mb-6 leading-relaxed">
              Visible muscle hypertrophy and body fat reduction take 2–4 weeks of consistent nutrition and training. You recorded your previous scan{" "}
              <strong className="text-white">{daysSinceScan} {daysSinceScan === 1 ? 'day' : 'days'} ago</strong>.
            </p>
            
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  router.push("/progress/add-scan");
                }}
                className="w-full py-3 bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#baff22] transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-[#ADFF00]/10"
              >
                Continue to Add Scan <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setShowWarningModal(false)}
                className="w-full py-2.5 bg-white/5 text-white/60 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors"
              >
                Wait for 14 Days
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
