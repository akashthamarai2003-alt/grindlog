"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Maximize2, X, Sparkles, Target, Dumbbell, Play, Pause, ChevronLeft, ChevronRight, Image as ImageIcon, Zap } from "lucide-react";
import { getExerciseAnimation, ExerciseAnimationInfo } from "@/lib/fitness/exercises/exercise-animations";
import { motion, AnimatePresence } from "framer-motion";

const SAFE_FALLBACK_GIF = "https://fastly.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-chest-press.gif";

export interface ExerciseAnimationPlayerProps {
  name: string;
  targetMuscle?: string;
  imageUrls?: string[];
  primaryImageUrl?: string;
  compact?: boolean;
  className?: string;
  showControls?: boolean;
  showBadges?: boolean;
  aspectRatio?: "square" | "video" | "auto";
}

export function ExerciseAnimationPlayer({
  name,
  targetMuscle,
  imageUrls,
  primaryImageUrl,
  compact = false,
  className = "",
  showControls = true,
  showBadges = true,
  aspectRatio = "square",
}: ExerciseAnimationPlayerProps) {
  // 1. Resolve GIF animation from dictionary
  const animation: ExerciseAnimationInfo = useMemo(() => {
    return getExerciseAnimation(name, targetMuscle);
  }, [name, targetMuscle]);

  // Clean and filter valid step image URLs
  const resolvedImages = useMemo(() => {
    const list: string[] = [];
    if (primaryImageUrl) list.push(primaryImageUrl);
    if (imageUrls && Array.isArray(imageUrls)) {
      for (const u of imageUrls) {
        if (u && typeof u === "string" && !list.includes(u)) {
          list.push(u);
        }
      }
    }
    return list;
  }, [imageUrls, primaryImageUrl]);

  const hasPhotos = resolvedImages.length > 0;

  // Mode: "photos" (real step photos motion loop) or "gif" (3D animated model)
  // Default to "photos" if real photos exist because they are 100% authentic and never block
  const [activeMode, setActiveMode] = useState<"photos" | "gif">(
    hasPhotos ? "photos" : "gif"
  );

  // Step photo loop state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingMotion, setIsPlayingMotion] = useState<boolean>(true);
  const motionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // GIF fallback state
  const [currentGifSrc, setCurrentGifSrc] = useState<string>(animation.gifUrl);
  const [gifAttemptIndex, setGifAttemptIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Auto-cycle step photos (start position -> peak contraction loop)
  useEffect(() => {
    if (activeMode !== "photos" || resolvedImages.length < 2 || !isPlayingMotion) {
      if (motionTimerRef.current) clearInterval(motionTimerRef.current);
      return;
    }

    motionTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % resolvedImages.length);
    }, 1100);

    return () => {
      if (motionTimerRef.current) clearInterval(motionTimerRef.current);
    };
  }, [activeMode, resolvedImages.length, isPlayingMotion]);

  // Synchronize state whenever the exercise changes
  useEffect(() => {
    setCurrentGifSrc(animation.gifUrl);
    setGifAttemptIndex(0);
    setHasError(false);
    setIsLoading(true);
    setCurrentStepIndex(0);
    setActiveMode(hasPhotos ? "photos" : "gif");
  }, [animation.gifUrl, hasPhotos]);

  // GIF error cascading: Fastly -> Raw GitHub -> GCore -> Step Photos -> Placeholder
  const handleGifError = () => {
    if (gifAttemptIndex === 0 && animation.secondaryGifUrl) {
      setGifAttemptIndex(1);
      setCurrentGifSrc(animation.secondaryGifUrl);
    } else if (gifAttemptIndex <= 1 && animation.tertiaryGifUrl) {
      setGifAttemptIndex(2);
      setCurrentGifSrc(animation.tertiaryGifUrl);
    } else if (gifAttemptIndex <= 2 && currentGifSrc !== SAFE_FALLBACK_GIF) {
      setGifAttemptIndex(3);
      setCurrentGifSrc(SAFE_FALLBACK_GIF);
    } else if (hasPhotos) {
      // Gracefully fall back to real photos
      setActiveMode("photos");
      setIsLoading(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleMediaLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Compact thumbnail mode (for lists/cards)
  if (compact) {
    const thumbSrc = hasPhotos ? resolvedImages[0] : currentGifSrc;
    return (
      <div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#111A10] border border-white/10 shrink-0 flex items-center justify-center ${className}`}
      >
        {!hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbSrc}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleGifError}
          />
        ) : (
          <Dumbbell className="w-5 h-5 text-[#ADFF00]/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  const aspectClass =
    aspectRatio === "video"
      ? "aspect-video"
      : "aspect-square";

  const currentDisplaySrc =
    activeMode === "photos" && hasPhotos
      ? resolvedImages[currentStepIndex]
      : currentGifSrc;

  return (
    <>
      <div
        className={`relative w-full rounded-3xl overflow-hidden bg-[#0D160C] border border-[#1F301D] shadow-2xl flex flex-col items-center justify-center group select-none ${className}`}
      >
        {/* Top Badges Bar */}
        {showBadges && (
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase">
                {activeMode === "photos" ? "Real Form Demo" : "Form Demo"}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
              <Target className="w-3 h-3 text-[#ADFF00]" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                {animation.targetMuscle}
              </span>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D160C] z-10 animate-pulse">
            <Sparkles className="w-7 h-7 text-[#ADFF00] animate-spin mb-2" />
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
              Loading Demonstration...
            </span>
          </div>
        )}

        {/* Media Container with Cyberpunk Dark Frame */}
        <div className={`w-full ${aspectClass} relative flex items-center justify-center overflow-hidden bg-[#081007]`}>
          {!hasError ? (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`${name}-${activeMode}-${currentDisplaySrc}`}
                src={currentDisplaySrc}
                alt={`${name} exercise form demonstration`}
                className={`w-full h-full ${
                  activeMode === "photos" ? "object-cover" : "object-contain bg-white/95 rounded-2xl p-2 max-w-[95%] max-h-[95%] shadow-md"
                } transition-opacity duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="eager"
                onLoad={handleMediaLoaded}
                onError={activeMode === "gif" ? handleGifError : undefined}
              />

              {/* Bottom Subtle Gradient for Text Contrast */}
              {activeMode === "photos" && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white/70 bg-[#0A1108] w-full h-full">
              <div className="w-14 h-14 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/25 flex items-center justify-center mb-3">
                <Dumbbell className="w-7 h-7 text-[#ADFF00]" />
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-white">
                {name}
              </p>
              <p className="text-xs text-white/50 mt-1 max-w-xs">
                {animation.targetMuscle} · {animation.equipment}
              </p>
              <span className="mt-2 text-[10px] font-black text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Exercise Ready
              </span>
            </div>
          )}
        </div>

        {/* Interactive Step Motion Controls (when in Real Photos mode with 2+ photos) */}
        {activeMode === "photos" && resolvedImages.length >= 2 && !isLoading && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-auto">
            {/* Step Pills & Play/Pause */}
            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={() => setIsPlayingMotion((prev) => !prev)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#ADFF00] transition-colors cursor-pointer"
                title={isPlayingMotion ? "Pause motion" : "Play motion"}
              >
                {isPlayingMotion ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <div className="flex items-center gap-1 pl-1">
                {resolvedImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlayingMotion(false);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                      currentStepIndex === idx
                        ? "bg-[#ADFF00] text-black shadow-sm"
                        : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    Step {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle to 3D Demo GIF if available */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("gif");
                  setIsLoading(true);
                }}
                className="flex items-center gap-1 bg-black/85 hover:bg-black text-white hover:text-[#ADFF00] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
                title="Switch to 3D Demonstration"
              >
                <Zap className="w-3 h-3 text-[#ADFF00]" />
                <span className="hidden sm:inline">3D Demo</span>
              </button>

              {showControls && (
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="p-1.5 rounded-xl bg-black/85 hover:bg-black text-white hover:text-[#ADFF00] border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
                  title="Full View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Interactive Controls when in GIF mode */}
        {activeMode === "gif" && !isLoading && !hasError && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-auto">
            {/* If real photos exist, button to toggle back to photos */}
            {hasPhotos ? (
              <button
                type="button"
                onClick={() => {
                  setActiveMode("photos");
                  setIsLoading(false);
                }}
                className="flex items-center gap-1 bg-black/85 hover:bg-black text-white hover:text-[#ADFF00] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
                title="Switch to Real Photos"
              >
                <ImageIcon className="w-3 h-3 text-[#ADFF00]" />
                <span>Real Photos ({resolvedImages.length})</span>
              </button>
            ) : (
              <span className="text-[9px] font-black tracking-wider text-white/70 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 uppercase shadow-lg">
                {animation.equipment}
              </span>
            )}

            {showControls && (
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(true)}
                className="p-1.5 rounded-xl bg-black/85 hover:bg-black text-white hover:text-[#ADFF00] border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer ml-auto"
                title="Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#0E170C] border border-[#ADFF00]/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest">
                    Form Breakdown
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Animation View */}
              <div className="w-full aspect-square bg-[#081007] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentDisplaySrc}
                  alt={`${name} form`}
                  className={`w-full h-full ${
                    activeMode === "photos" ? "object-contain" : "object-contain bg-white/95 rounded-xl p-2 max-w-[95%] max-h-[95%]"
                  }`}
                />
              </div>

              {/* Meta details */}
              <div className="flex items-center justify-between text-xs text-white/70 pt-1">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-[#ADFF00]" /> {animation.targetMuscle}
                </span>
                <span className="font-semibold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full border border-white/10 text-[10px]">
                  {animation.equipment}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
