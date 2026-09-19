"use client";

import { useState, useMemo, useEffect } from "react";
import { Play, Pause, Maximize2, X, Sparkles, Target, Dumbbell } from "lucide-react";
import { getExerciseAnimation, ExerciseAnimationInfo } from "@/lib/fitness/exercises/exercise-animations";
import { motion, AnimatePresence } from "framer-motion";

const SAFE_FALLBACK_GIF = "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0/pectorals/lever-chest-press.gif";

interface ExerciseAnimationPlayerProps {
  name: string;
  targetMuscle?: string;
  compact?: boolean;
  className?: string;
  showControls?: boolean;
  showBadges?: boolean;
  aspectRatio?: "square" | "video" | "auto";
}

export function ExerciseAnimationPlayer({
  name,
  targetMuscle,
  compact = false,
  className = "",
  showControls = true,
  showBadges = true,
  aspectRatio = "square",
}: ExerciseAnimationPlayerProps) {
  const animation: ExerciseAnimationInfo = useMemo(() => {
    return getExerciseAnimation(name, targetMuscle);
  }, [name, targetMuscle]);

  const [currentSrc, setCurrentSrc] = useState<string>(animation.gifUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Synchronize state whenever the animation resolves or exercise changes
  useEffect(() => {
    setCurrentSrc(animation.gifUrl);
    setHasError(false);
    setIsLoading(true);
  }, [animation.gifUrl]);

  const handleImageError = () => {
    if (currentSrc === animation.gifUrl && animation.secondaryGifUrl) {
      setCurrentSrc(animation.secondaryGifUrl);
    } else if (currentSrc !== SAFE_FALLBACK_GIF) {
      setCurrentSrc(SAFE_FALLBACK_GIF);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  // Compact thumbnail mode (for lists/cards)
  if (compact) {
    return (
      <div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center ${className}`}
      >
        {!hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentSrc}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <Dumbbell className="w-5 h-5 text-white/40" />
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
        className={`relative w-full rounded-3xl overflow-hidden bg-white border border-white/10 shadow-2xl flex flex-col items-center justify-center group select-none ${className}`}
      >
        {/* Top Badges Bar */}
        {showBadges && (
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase">
                Form Demo
              </span>
            </div>

            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 shadow-lg">
              <Target className="w-3 h-3 text-[#ADFF00]" />
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">
                {animation.targetMuscle}
              </span>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d160b] z-0 animate-pulse">
            <Sparkles className="w-7 h-7 text-[#ADFF00]/40 animate-spin mb-2" />
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              Loading Animation...
            </span>
          </div>
        )}

        {/* Media Container */}
        <div className={`w-full ${aspectClass} relative flex items-center justify-center overflow-hidden bg-white`}>
          {!hasError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${name}-${currentSrc}`}
              src={currentSrc}
              alt={`${name} form demonstration animation`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isLoading ? "opacity-0" : "opacity-100"
              } ${!isPlaying ? "filter brightness-75" : ""}`}
              loading="eager"
              onLoad={handleImageLoaded}
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white/50 bg-[#0A1108] w-full h-full">
              <Dumbbell className="w-10 h-10 text-[#ADFF00]/40 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                {name}
              </p>
              <p className="text-[10px] text-white/40 mt-1">Form Demonstration Ready</p>
            </div>
          )}

          {/* Paused Overlay Indicator */}
          {!isPlaying && !isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/80 border border-[#ADFF00]/40 flex items-center justify-center text-[#ADFF00] shadow-[0_0_15px_rgba(173,255,0,0.3)]">
                <Pause className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* Interactive Overlay Controls */}
        {showControls && !hasError && !isLoading && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
              className="p-2 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#ADFF00] border border-black/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Expand / Fullscreen Zoom Modal */}
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(true)}
              aria-label="Expand exercise demonstration"
              className="p-2 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#ADFF00] border border-black/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
              title="Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Equipment Chip (Bottom Left) */}
        {animation.equipment && showBadges && (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="text-[9px] font-black tracking-wider text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/20 uppercase shadow-lg">
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
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Animation View */}
              <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
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
