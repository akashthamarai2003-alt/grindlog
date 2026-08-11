"use client";

import { Play, Clock } from "lucide-react";
import Image from "next/image";

interface HorizontalWorkoutListProps {
  workout?: any;
}

export function HorizontalWorkoutList({ workout }: HorizontalWorkoutListProps) {
  // Mock data to match aesthetic if no workout provided
  const exercises = workout?.fitness_os_exercises || [
    { id: '1', name: 'Core Blaster', duration_seconds: 900, category: 'Strength', target_muscle_group: 'Core' },
    { id: '2', name: 'Partner Power', duration_seconds: 600, category: 'HIIT', target_muscle_group: 'Full Body' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Your Routine</h3>
        <button className="text-[10px] font-bold text-[#ADFF00] uppercase tracking-wider">See All</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {exercises.map((ex: any, idx: number) => {
          const durationMins = ex.duration_seconds ? Math.floor(ex.duration_seconds / 60) : 10;
          
          return (
            <div 
              key={ex.id || idx}
              className="w-48 shrink-0 snap-center bg-[#121E12] border border-[#1A2619] rounded-[24px] overflow-hidden group cursor-pointer"
            >
              <div className="relative h-32 w-full bg-[#1A2619] overflow-hidden">
                {/* Fallback pattern / image */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Play size={16} className="ml-1" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                  <span className="text-[9px] font-bold text-[#ADFF00] uppercase tracking-wider">
                    {ex.category || 'Focus'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-bold text-white mb-1 truncate">{ex.name || 'AI Generated Exercise'}</h4>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-semibold">{durationMins} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
