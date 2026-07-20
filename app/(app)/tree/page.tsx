"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getMaxUserStreak } from '@/app/actions/habits';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TreePage() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maxGrowthDays = 30; // 30 days to full growth

  useEffect(() => {
    async function loadStreak() {
      const data = await getMaxUserStreak();
      setStreak(data.currentStreak || 0);
    }
    loadStreak();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // Calculate progress percentage, capped at 100%
      const progress = Math.min(Math.max(streak / maxGrowthDays, 0), 1);
      
      const updateVideo = () => {
        if (!videoRef.current) return;
        
        // Ensure duration is valid and not NaN/Infinity
        const duration = isFinite(videoRef.current.duration) ? videoRef.current.duration : 10;
        const targetTime = duration * progress;
        
        videoRef.current.currentTime = targetTime;
      };

      if (videoRef.current.readyState >= 1) {
        updateVideo();
      } else {
        videoRef.current.addEventListener('loadedmetadata', updateVideo);
        return () => videoRef.current?.removeEventListener('loadedmetadata', updateVideo);
      }
    }
  }, [streak]);

  return (
    <div className="relative w-full h-dvh bg-black overflow-hidden flex flex-col items-center justify-center safe-top">
      {/* Back Button & Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="absolute top-6 z-10 text-center w-full">
        <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Tree of Life
        </h1>
        <p className="text-white/90 font-medium text-sm drop-shadow-md">
          Current Streak: {streak} {streak === 1 ? 'Day' : 'Days'}
        </p>
      </div>

      {/* Video element representing the real tree */}
      <video
        ref={videoRef}
        src="/tree.mp4"
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Progress Bar Overlay */}
      <div className="absolute bottom-24 z-10 w-[85%] max-w-md bg-black/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
        <div className="flex justify-between text-white/90 text-sm font-bold mb-3 tracking-wide">
          <span>Seed</span>
          <span>Mighty Oak</span>
        </div>
        <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden shadow-inner relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(52,211,113,0.5)]" 
            style={{ width: `${Math.min((streak / maxGrowthDays) * 100, 100)}%` }} 
          />
        </div>
        <p className="text-white/60 text-xs text-center mt-4 font-medium">
          Maintain your habits for {maxGrowthDays} days to fully grow your tree.
        </p>
      </div>
    </div>
  );
}