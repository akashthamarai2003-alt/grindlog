"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, Flame, Trophy, AlertCircle, Activity, Smartphone, Calendar, BatteryCharging, Smile } from "lucide-react";
import { useRouter } from "next/navigation";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

// MOCK DATA
const HIGHLIGHTS = {
  completion: 87,
  longestStreak: 14,
  bestHabit: "Reading",
  worstHabit: "Wake up 6am",
};

const WEEKLY_DATA = [
  { day: "Mon", habits: 5, mood: 8, energy: 7 },
  { day: "Tue", habits: 6, mood: 7, energy: 6 },
  { day: "Wed", habits: 4, mood: 6, energy: 4 },
  { day: "Thu", habits: 7, mood: 9, energy: 8 },
  { day: "Fri", habits: 8, mood: 10, energy: 9 },
  { day: "Sat", habits: 6, mood: 8, energy: 7 },
  { day: "Sun", habits: 5, mood: 7, energy: 6 },
];

const DONUT_DATA = [
  { label: "Productive", value: 45, color: "#34C759" },
  { label: "Social", value: 30, color: "#007AFF" },
  { label: "Entertainment", value: 25, color: "#FF9500" },
];

// Heatmap mock data (7 cols x 4 rows)
const HEATMAP_DATA = Array.from({ length: 28 }, () => Math.floor(Math.random() * 5));

export default function AnalyticsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Line Chart Path Generators
  const chartHeight = 120;
  const chartWidth = 300;
  const pointsX = WEEKLY_DATA.map((_, i) => (i / (WEEKLY_DATA.length - 1)) * chartWidth);
  
  const generatePath = (dataKey: "mood" | "energy") => {
    const pointsY = WEEKLY_DATA.map(d => chartHeight - (d[dataKey] / 10) * chartHeight);
    let path = `M ${pointsX[0]} ${pointsY[0]}`;
    for (let i = 1; i < pointsX.length; i++) {
      const cx = (pointsX[i - 1] + pointsX[i]) / 2;
      path += ` C ${cx} ${pointsY[i - 1]}, ${cx} ${pointsY[i]}, ${pointsX[i]} ${pointsY[i]}`;
    }
    return path;
  };

  // Donut Chart Calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;
  const donutSegments = DONUT_DATA.map((segment) => {
    const strokeLength = (segment.value / 100) * circumference;
    const offset = currentOffset;
    currentOffset += strokeLength;
    return { ...segment, strokeLength, offset };
  });

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md pb-2">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-transform active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
          Life Analytics
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-col gap-6">
        
        {/* 1. HIGHLIGHTS GRID */}
        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Highlights</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Completion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.1 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-2 mb-2 text-[#AF52DE]">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Completion</span>
              </div>
              <span className="text-3xl font-black text-[var(--color-text-primary)]">{HIGHLIGHTS.completion}%</span>
            </motion.div>
            
            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.2 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-2 mb-2 text-[#FF9500]">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Best Streak</span>
              </div>
              <span className="text-3xl font-black text-[var(--color-text-primary)]">{HIGHLIGHTS.longestStreak} <span className="text-sm">days</span></span>
            </motion.div>

            {/* Best Habit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.3 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-2 mb-2 text-[#34C759]">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Top Habit</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{HIGHLIGHTS.bestHabit}</span>
            </motion.div>

            {/* Worst Habit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...springs.default, delay: 0.4 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-2 mb-2 text-[#FF3B30]">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Needs Work</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{HIGHLIGHTS.worstHabit}</span>
            </motion.div>
          </div>
        </section>

        {/* 2. MOOD & ENERGY (LINE CHART) */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springs.default, delay: 0.5 }}
          className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Mood & Energy</h2>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-[#007AFF]"><Smile className="h-3 w-3"/> Mood</span>
              <span className="flex items-center gap-1 text-[#FF9500]"><BatteryCharging className="h-3 w-3"/> Energy</span>
            </div>
          </div>
          
          <div className="relative w-full h-[140px] flex items-end overflow-hidden pl-2">
            <svg viewBox={`0 -10 ${chartWidth} ${chartHeight + 20}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {/* Energy Line (Orange) */}
              <motion.path
                d={generatePath("energy")}
                fill="none"
                stroke="#FF9500"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
                className="drop-shadow-sm"
              />
              {/* Mood Line (Blue) */}
              <motion.path
                d={generatePath("mood")}
                fill="none"
                stroke="#007AFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1.0 }}
                className="drop-shadow-sm"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-2 px-1 text-xs font-bold text-[var(--color-text-tertiary)]">
            {WEEKLY_DATA.map((d, i) => <span key={i}>{d.day[0]}</span>)}
          </div>
        </motion.section>

        {/* 3. WEEKLY BARS (HABITS DONE) */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springs.default, delay: 0.6 }}
          className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Habits Completed</h2>
            <TrendingUp className="h-4 w-4 text-[#34C759]" />
          </div>
          <div className="flex items-end justify-between h-[120px] px-1 gap-2">
            {WEEKLY_DATA.map((d, i) => {
              const max = 10;
              const heightPct = (d.habits / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-[var(--color-bg-tertiary)] rounded-t-full rounded-b-sm h-full relative flex items-end justify-center overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 1.2 + (i * 0.1) }}
                      className="w-full bg-gradient-to-t from-[#34C759]/80 to-[#30B0C7] rounded-t-full rounded-b-sm"
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-tertiary)]">{d.day[0]}</span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 4. DONUT & HEATMAP ROW */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Screen Time Donut */}
          <motion.section
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springs.default, delay: 0.7 }}
            className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] items-center justify-center relative"
          >
            <div className="absolute top-4 left-4 text-[#AF52DE]">
              <Smartphone className="h-4 w-4" />
            </div>
            <h2 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider absolute top-4 right-4">Screen</h2>
            
            <div className="mt-8 relative w-24 h-24 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                {donutSegments.map((seg, i) => (
                  <motion.circle
                    key={i}
                    cx="70" cy="70" r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={`${seg.strokeLength} ${circumference}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${seg.strokeLength} ${circumference}` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 + (i * 0.2) }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[var(--color-text-primary)]">4h</span>
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">20m</span>
              </div>
            </div>
          </motion.section>

          {/* Calendar Heatmap Mini */}
          <motion.section
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springs.default, delay: 0.8 }}
            className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] relative"
          >
            <div className="flex items-center justify-between mb-3">
              <Calendar className="h-4 w-4 text-[#007AFF]" />
              <h2 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Map</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-1 w-full flex-1">
              {HEATMAP_DATA.map((val, i) => {
                // Map 0-4 to opacity levels of brand color
                const opacities = ["opacity-10", "opacity-40", "opacity-60", "opacity-80", "opacity-100"];
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.8 + (i * 0.02) }}
                    className={cn(
                      "aspect-square rounded-[3px] bg-[#007AFF]", 
                      opacities[val]
                    )}
                  />
                );
              })}
            </div>
          </motion.section>

        </div>

      </div>
    </div>
  );
}