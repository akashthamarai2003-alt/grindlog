"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Maximize2, X, Sparkles, Target, Dumbbell } from "lucide-react";
import { getExerciseAnimation, ExerciseAnimationInfo } from "@/lib/fitness/exercises/exercise-animations";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseAnimationPlayerProps {
  name: string;
  targetMuscle?: string;
  compact?: boolean;
  className?: string;
  showControls?: boolean;
  showBadges?: boolean;
  aspectRatio?: "square" | "video" | "auto";
  fallbackImage?: string;
  imageUrls?: string[];
}

export function ExerciseAnimationPlayer({
  name,
  targetMuscle,
  compact = false,
  className = "",
  showControls = true,
  showBadges = true,
  aspectRatio = "square",
  fallbackImage,
  imageUrls,
}: ExerciseAnimationPlayerProps) {
  const animation: ExerciseAnimationInfo = useMemo(() => {
    return getExerciseAnimation(name, targetMuscle);
  }, [name, targetMuscle]);

  // Robust candidate cascade:
  // 1. Fastly CDN (global edge)
  // 2. jsDelivr CDN
  // 3. Same-origin Next.js server proxy (immune to ISP blocks, CORS, and adblockers)
  // 4. Exercise image_urls (step photos from DB)
  // 5. Fallback muscle group GIF proxy
  const candidateUrls = useMemo(() => {
    const list: string[] = [
      animation.gifUrl,
      animation.secondaryGifUrl,
      animation.proxyGifUrl,
    ];

    if (fallbackImage && !list.includes(fallbackImage)) {
      list.push(fallbackImage);
    }

    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url && !list.includes(url)) {
          list.push(url);
        }
      }
    }

    const fallbackProxy = `/api/fitness/exercises/proxy-gif?path=${encodeURIComponent(
      "pectorals/lever-chest-press.gif"
    )}`;
    if (!list.includes(fallbackProxy)) {
      list.push(fallbackProxy);
    }

    return list;
  }, [animation, fallbackImage, imageUrls]);

  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const currentSrc = candidateUrls[candidateIndex] || candidateUrls[0];

  // Reset state whenever exercise changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [name, targetMuscle]);

  // Handle cached / fast-loaded images where React onLoad won't fire
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [currentSrc]);

  const handleImageError = () => {
    if (candidateIndex < candidateUrls.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Compact thumbnail mode (for exercise library list / workout cards)
  if (compact) {
    return (
      <div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#111A10] border border-white/10 shrink-0 flex items-center justify-center ${className}`}
      >
        {!hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={currentSrc}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? "opacity-50" : "opacity-100"
            }`}
            loading="lazy"
            onLoad={handleImageLoaded}
            onError={handleImageError}
          />
        ) : (
          <Dumbbell className="w-5 h-5 text-[#ADFF00]/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  const aspectClass =
    aspectRatio === "video"
      ? "aspect-video"
      : "aspect-square";

  return (
    <>
      <div
        className={`relative w-full rounded-3xl overflow-hidden bg-[#0A1108] border border-white/10 shadow-2xl flex flex-col items-center justify-center group select-none ${className}`}
      >
        {/* Top Badges Bar */}
        {showBadges && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
            <div className="exercise-badge-pill flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase">
                Form Demo
              </span>
            </div>

            <div className="exercise-badge-pill flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 shadow-lg">
              <Target className="w-3 h-3 text-[#ADFF00]" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                {animation.targetMuscle}
              </span>
            </div>
          </div>
        )}

        {/* Loading Spinner / Skeleton Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A1108]/90 backdrop-blur-sm pointer-events-none transition-opacity duration-300">
            <div className="w-10 h-10 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center mb-2.5 animate-pulse">
              <Sparkles className="w-5 h-5 text-[#ADFF00] animate-spin" />
            </div>
            <span className="text-[11px] font-black tracking-wider text-white uppercase">
              Loading Exercise Animation
            </span>
            <span className="text-[9px] font-bold text-white/40 mt-0.5">
              Optimizing form demonstration...
            </span>
          </div>
        )}

        {/* Media Container */}
        <div className={`w-full ${aspectClass} relative flex items-center justify-center overflow-hidden bg-[#0E170C]`}>
          {!hasError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              key={`${name}-${currentSrc}`}
              src={currentSrc}
              alt={`${name} form demonstration animation`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isLoading ? "opacity-30" : "opacity-100"
              }`}
              loading="eager"
              onLoad={handleImageLoaded}
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white/50 bg-[#0A1108] w-full h-full">
              <div className="w-14 h-14 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center mb-3">
                <Dumbbell className="w-7 h-7 text-[#ADFF00]" />
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-white">
                {name}
              </p>
              <p className="text-xs text-white/50 mt-1 max-w-xs">
                Target: {animation.targetMuscle} • {animation.equipment}
              </p>
            </div>
          )}
        </div>

        {/* Interactive Overlay Controls */}
        {showControls && !hasError && !isLoading && (
          <div className="absolute bottom-3 right-3 z-30 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Expand / Fullscreen Zoom Modal */}
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              aria-label="Expand exercise demonstration"
              className="exercise-overlay-btn p-2 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#ADFF00] border border-black/20 backdrop-blur-md transition-all active:scale-95 shadow-lg cursor-pointer"
              title="Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Equipment Chip (Bottom Left) */}
        {animation.equipment && showBadges && (
          <div className="absolute bottom-3 left-3 z-30 pointer-events-none">
            <span className="exercise-badge-pill text-[9px] font-black tracking-wider text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 uppercase shadow-lg">
              {animation.equipment}
            </span>
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
                  onClick={() => setIsZoomModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Animation View */}
              <div className="w-full aspect-square bg-[#0A1108] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSrc}
                  alt={`${name} form`}
                  className="w-full h-full object-contain"
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
