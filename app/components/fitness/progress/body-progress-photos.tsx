"use client";

import { useState, useRef, useEffect } from "react";
import { BodyPhotoScan } from "@/types/fitness/analytics";
import { Camera, Calendar, SlidersHorizontal, Sparkles, ArrowRight, Target, Upload, X, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import placeholderGoal from "@/assets/images/placeholder-goal.png";

function SafeImage({ src, alt, className, style }: { src: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setError(false);
  }, [src]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0) {
      setError(true);
    }
  }, [src]);

  if (error || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-[#111A10] text-white/30 text-xs font-bold uppercase tracking-widest pointer-events-none ${className}`}
        style={style}
      >
        <span className="opacity-40">No Image</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      ref={imgRef}
      src={src} 
      alt="" 
      className={className} 
      style={style} 
      onError={() => setError(true)} 
    />
  );
}

export function BodyProgressPhotos({ 
  first, 
  latest, 
  initialGoalUrl 
}: { 
  first: BodyPhotoScan | null; 
  latest: BodyPhotoScan | null; 
  initialGoalUrl?: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<'front' | 'left' | 'right' | 'back'>('front');
  const [sliderPos, setSliderPos] = useState(50);
  const [goalSliderPos, setGoalSliderPos] = useState(50);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // Goal Compare State
  const [activeMode, setActiveMode] = useState<'timeline' | 'goal'>('timeline');
  const [goalUrl, setGoalUrl] = useState<string | null>(initialGoalUrl || null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalPreview, setGoalPreview] = useState<string | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const goalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialGoalUrl) {
      setGoalUrl(initialGoalUrl);
    }
  }, [initialGoalUrl]);

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

  const handleGoalCompareToggle = () => {
    if (!goalUrl) {
      setShowGoalModal(true);
    } else {
      setActiveMode(prev => prev === 'goal' ? 'timeline' : 'goal');
    }
  };

  // Image compressor for goal picture
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGoalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setGoalPreview(compressed);
    } catch (err) {
      console.error("Goal compression error:", err);
      toast.error("Failed to process photo");
    }
  };

  const handleSaveGoalPicture = async () => {
    if (!goalPreview) return;
    setIsSavingGoal(true);
    const toastId = toast.loading("Saving goal physique picture...");

    try {
      const res = await fetch("/api/fitness/set-goal-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalImage: goalPreview }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save goal photo");
      }

      setGoalUrl(data.goalUrl || goalPreview);
      setGoalPreview(null);
      setShowGoalModal(false);
      setActiveMode('goal');
      toast.success("Goal physique updated successfully!", { id: toastId });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update goal photo", { id: toastId });
    } finally {
      setIsSavingGoal(false);
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

  const isSingleScan = Boolean(first && (!latest || first.id === latest.id || first.date === latest.date));
  const activeScan = latest || first;
  const userFrontPhoto = latest?.frontUrl || first?.frontUrl || null;

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
      {/* Header Row: Title, Badges, and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase whitespace-nowrap">
            Body Progress
          </h2>
          {isSingleScan && activeMode === 'timeline' && (
            <span className="px-2 py-0.5 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 text-[9px] font-bold text-[#ADFF00] uppercase tracking-wider whitespace-nowrap">
              Baseline Scan
            </span>
          )}
          {activeMode === 'goal' && (
            <span className="px-2 py-0.5 rounded-full bg-[#ADFF00]/20 border border-[#ADFF00]/30 text-[9px] font-bold text-[#ADFF00] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Target className="w-2.5 h-2.5" /> Goal Compare
            </span>
          )}
        </div>

        {/* Buttons Near Add Scan */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Compare Goal Button */}
          <button
            type="button"
            onClick={handleGoalCompareToggle}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${
              activeMode === 'goal'
                ? 'bg-[#ADFF00] text-black border-[#ADFF00] shadow-md shadow-[#ADFF00]/20 font-extrabold'
                : 'bg-[#ADFF00]/10 text-[#ADFF00] border-[#ADFF00]/20 hover:bg-[#ADFF00]/20'
            }`}
            title="Compare Front Photo with Goal Picture"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Compare Goal</span>
          </button>

          {/* Add Scan Button */}
          <Link 
            href="/progress/add-scan" 
            onClick={handleAddClick}
            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-[10px] uppercase tracking-wider border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors shadow-sm"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Add Scan</span>
          </Link>
        </div>
      </div>

      {/* Main Showcase / Comparison Container */}
      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
        {activeMode === 'goal' ? (
          /* ======================================================== */
          /* GOAL COMPARE MODE: Side-by-Side Normal Full View          */
          /* ======================================================== */
          <div className="flex flex-col gap-3">
            {/* Mode Sub-header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#ADFF00]" /> Full Compare: Front vs Goal
              </span>
              <button
                type="button"
                onClick={() => setShowGoalModal(true)}
                className="text-[9px] font-bold text-[#ADFF00] hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Change Goal
              </button>
            </div>

            {/* Side-by-Side Full View Grid */}
            {goalUrl && userFrontPhoto ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Left Column: Full Front Photo */}
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <SafeImage 
                        src={userFrontPhoto} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-black text-white uppercase tracking-wider border border-white/10">
                        Current Front
                      </div>
                      {activeScan?.date && (
                        <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-[#ADFF00] tracking-wider border border-white/10">
                          {new Date(activeScan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                        My Physique
                      </span>
                      <span className="text-[9px] font-bold text-white/40">
                        {activeScan?.date ? new Date(activeScan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Baseline'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Full Goal Photo */}
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-[#ADFF00]/40 shadow-lg shadow-[#ADFF00]/5">
                      <SafeImage 
                        src={goalUrl} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2.5 left-2.5 bg-[#ADFF00] px-2 py-0.5 rounded-md text-[8px] font-black text-black uppercase tracking-wider shadow-sm">
                        Target Goal
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-[#ADFF00] tracking-wider border border-[#ADFF00]/20">
                        Vision
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#ADFF00]">
                        Goal Physique
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGoalModal(true)}
                        className="text-[9px] font-bold text-white/40 hover:text-[#ADFF00] transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Change Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Motivational Comparison Tip */}
                <div className="bg-[#142013] border border-[#ADFF00]/15 rounded-xl p-3.5 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#ADFF00] shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px] text-white/70 leading-relaxed">
                    <span className="text-white font-bold">Side-by-Side Target.</span> Full view of your current front physique alongside your target goal. Stay consistent with progressive overload and your daily macros to bridge the gap!
                  </div>
                </div>

                {/* Back to Scans Button */}
                <button
                  type="button"
                  onClick={() => setActiveMode('timeline')}
                  className="w-full py-2.5 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 text-[#ADFF00] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[#ADFF00]/20 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  ← Back to My Scans
                </button>
              </div>
            ) : (
              /* Goal Not Set Prompt */
              <div className="w-full aspect-[3/4] bg-[#0D150D] border border-dashed border-[#ADFF00]/30 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00] mb-3">
                  <Target className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-white mb-1">Set Your Goal Physique</p>
                <p className="text-xs text-white/50 mb-4 max-w-xs">
                  Upload an inspiration photo of your target body shape to unlock side-by-side full comparison.
                </p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-4 py-2 bg-[#ADFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#baff22] transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Goal Picture
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* STANDARD TIMELINE MODE: Baseline or Transformation View  */
          /* ======================================================== */
          <>
            {/* Full-width Angle Switcher */}
            <div className="grid grid-cols-4 bg-[#0D150D] p-1 rounded-xl border border-white/5 w-full">
              {(['front', 'left', 'right', 'back'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all text-center ${
                    view === v ? 'bg-[#ADFF00] text-black font-extrabold shadow-sm' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

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
                  <div 
                    className="absolute inset-0 w-full h-full bg-[#111A10] pointer-events-none overflow-hidden"
                    style={{ clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)` }}
                  >
                    <SafeImage 
                      src={beforeImg} 
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                  </div>
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
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* Upload Goal Physique Picture Modal                       */}
      {/* ======================================================== */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111A10] border border-[#1A2619] rounded-2xl p-6 max-w-sm w-full flex flex-col shadow-2xl relative"
          >
            <button 
              onClick={() => { setShowGoalModal(false); setGoalPreview(null); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-white font-black text-lg">Goal Physique Picture</h3>
            </div>
            
            <p className="text-white/60 text-xs mb-4 leading-relaxed">
              Upload your target / inspiration physique to compare side-by-side with your front photo.
            </p>

            <input 
              ref={goalInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleGoalFileChange} 
              className="hidden" 
            />

            <div 
              onClick={() => !goalPreview && goalInputRef.current?.click()}
              className={`relative w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden mb-4 ${
                goalPreview 
                  ? 'border-[#ADFF00] bg-[#ADFF00]/10 cursor-default' 
                  : 'border-[#1A2619] bg-[#0D150D] hover:border-[#ADFF00]/50 cursor-pointer'
              }`}
            >
              {goalPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={goalPreview} alt="Goal preview" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setGoalPreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-20 backdrop-blur-sm"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={typeof placeholderGoal === 'string' ? placeholderGoal : (placeholderGoal as any).src}
                      alt="Goal reference silhouette"
                      className="w-full h-full object-cover object-top opacity-20"
                    />
                  </div>
                  <div className="z-10 flex flex-col items-center justify-center gap-1.5 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                    <Upload className="w-4 h-4 text-[#ADFF00]" />
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">+ Choose Photo</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleSaveGoalPicture}
                disabled={!goalPreview || isSavingGoal}
                className="w-full py-3 bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#baff22] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#ADFF00]/10"
              >
                {isSavingGoal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Goal Picture</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowGoalModal(false); setGoalPreview(null); }}
                className="w-full py-2 bg-white/5 text-white/60 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 14-Day Cadence Advisory Modal                            */}
      {/* ======================================================== */}
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
