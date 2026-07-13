"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  TrendingUp,
  Flame,
  Trophy,
  AlertCircle,
  Activity,
  Smartphone,
  Calendar,
  BatteryCharging,
  Smile,
} from "lucide-react";
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
  { label: "Productive", value: 45, color: "var(--color-accent-primary)" },
  { label: "Social", value: 30, color: "var(--color-accent-secondary)" },
  { label: "Entertainment", value: 25, color: "var(--color-accent-tertiary)" },
];

// Heatmap mock data (7 cols x 4 rows)
const HEATMAP_DATA = Array.from({ length: 28 }, () =>
  Math.floor(Math.random() * 5)
);

// Animated counter component
function AnimatedCounter({
  value,
  suffix = "",
  duration = 1.5,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, duration, delay]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

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
  const pointsX = WEEKLY_DATA.map(
    (_, i) => (i / (WEEKLY_DATA.length - 1)) * chartWidth
  );

  const generatePath = (dataKey: "mood" | "energy") => {
    const pointsY = WEEKLY_DATA.map(
      (d) => chartHeight - (d[dataKey] / 10) * chartHeight
    );
    let path = `M ${pointsX[0]} ${pointsY[0]}`;
    for (let i = 1; i < pointsX.length; i++) {
      const cx = (pointsX[i - 1] + pointsX[i]) / 2;
      path += ` C ${cx} ${pointsY[i - 1]}, ${cx} ${pointsY[i]}, ${pointsX[i]} ${pointsY[i]}`;
    }
    return path;
  };

  const generateAreaPath = (dataKey: "mood" | "energy") => {
    const linePath = generatePath(dataKey);
    return `${linePath} L ${pointsX[pointsX.length - 1]} ${chartHeight} L ${pointsX[0]} ${chartHeight} Z`;
  };

  // Donut Chart Calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;
  const donutSegments = DONUT_DATA.map((segment) => {
    const gapSize = 4;
    const strokeLength = (segment.value / 100) * circumference - gapSize;
    const offset = currentOffset;
    currentOffset += strokeLength + gapSize;
    return { ...segment, strokeLength, offset };
  });

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.05 }}
        className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md pb-2"
      >
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
      </motion.div>

      <div className="flex flex-col gap-6">
        {/* 1. HIGHLIGHTS GRID */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springs.default, delay: 0.08 }}
            className="text-sm font-bold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider"
          >
            Highlights
          </motion.h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springs.default, delay: 0.1 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden relative"
            >
              {/* Subtle background glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: "var(--color-accent-primary)" }}
              />
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--color-accent-primary)" }}>
                <Activity className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Completion
                </span>
              </div>
              <span className="text-3xl font-black text-[var(--color-text-primary)]">
                <AnimatedCounter
                  value={HIGHLIGHTS.completion}
                  suffix="%"
                  delay={0.3}
                />
              </span>
              {/* Mini progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${HIGHLIGHTS.completion}%` }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                  className="h-full rounded-full"
                  style={{ background: "var(--color-accent-primary)" }}
                />
              </div>
            </motion.div>

            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springs.default, delay: 0.2 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden relative"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: "var(--color-accent-tertiary)" }}
              />
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--color-accent-tertiary)" }}>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{
                    duration: 0.5,
                    delay: 1.2,
                    ease: "easeInOut",
                  }}
                >
                  <Flame className="h-4 w-4" />
                </motion.div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Best Streak
                </span>
              </div>
              <span className="text-3xl font-black text-[var(--color-text-primary)]">
                <AnimatedCounter
                  value={HIGHLIGHTS.longestStreak}
                  delay={0.4}
                />{" "}
                <span className="text-sm font-bold text-[var(--color-text-tertiary)]">
                  days
                </span>
              </span>
            </motion.div>

            {/* Best Habit */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springs.default, delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden relative"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: "var(--color-status-success)" }}
              />
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--color-status-success)" }}>
                <motion.div
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ ...springs.default, delay: 0.9 }}
                >
                  <Trophy className="h-4 w-4" />
                </motion.div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Top Habit
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg font-bold text-[var(--color-text-primary)] leading-tight"
              >
                {HIGHLIGHTS.bestHabit}
              </motion.span>
            </motion.div>

            {/* Worst Habit */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...springs.default, delay: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden relative"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.06 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full"
                style={{ background: "var(--color-status-error)" }}
              />
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--color-status-error)" }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 0.6,
                    delay: 1.4,
                    ease: "easeInOut",
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                </motion.div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Needs Work
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg font-bold text-[var(--color-text-primary)] leading-tight"
              >
                {HIGHLIGHTS.worstHabit}
              </motion.span>
            </motion.div>
          </div>
        </section>

        {/* 2. MOOD & ENERGY (LINE CHART) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.5 }}
          className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Mood & Energy
            </h2>
            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1" style={{ color: "var(--color-accent-secondary)" }}>
                <Smile className="h-3 w-3" /> Mood
              </span>
              <span className="flex items-center gap-1" style={{ color: "var(--color-accent-tertiary)" }}>
                <BatteryCharging className="h-3 w-3" /> Energy
              </span>
            </div>
          </div>

          <div className="relative w-full h-[140px] flex items-end overflow-hidden pl-2">
            <svg
              viewBox={`0 -10 ${chartWidth} ${chartHeight + 20}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <motion.line
                  key={i}
                  x1="0"
                  y1={chartHeight * pct}
                  x2={chartWidth}
                  y2={chartHeight * pct}
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                />
              ))}

              {/* Energy Area Fill */}
              <defs>
                <linearGradient
                  id="energyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="var(--color-accent-tertiary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-accent-tertiary)" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="moodGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="var(--color-accent-secondary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-accent-secondary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <motion.path
                d={generateAreaPath("energy")}
                fill="url(#energyGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.3 }}
              />
              <motion.path
                d={generateAreaPath("mood")}
                fill="url(#moodGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
              />

              {/* Energy Line */}
              <motion.path
                d={generatePath("energy")}
                fill="none"
                stroke="var(--color-accent-tertiary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
              />
              {/* Mood Line */}
              <motion.path
                d={generatePath("mood")}
                fill="none"
                stroke="var(--color-accent-secondary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 1.0 }}
              />

              {/* Data points - Energy */}
              {WEEKLY_DATA.map((d, i) => {
                const y =
                  chartHeight - (d.energy / 10) * chartHeight;
                return (
                  <motion.circle
                    key={`energy-${i}`}
                    cx={pointsX[i]}
                    cy={y}
                    r="4"
                    fill="var(--color-bg-secondary)"
                    stroke="var(--color-accent-tertiary)"
                    strokeWidth="2.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      delay: 1.5 + i * 0.08,
                    }}
                  />
                );
              })}

              {/* Data points - Mood */}
              {WEEKLY_DATA.map((d, i) => {
                const y = chartHeight - (d.mood / 10) * chartHeight;
                return (
                  <motion.circle
                    key={`mood-${i}`}
                    cx={pointsX[i]}
                    cy={y}
                    r="4"
                    fill="var(--color-bg-secondary)"
                    stroke="var(--color-accent-secondary)"
                    strokeWidth="2.5"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      delay: 1.7 + i * 0.08,
                    }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between mt-3 px-1 text-xs font-bold text-[var(--color-text-tertiary)]">
            {WEEKLY_DATA.map((d, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.05 }}
              >
                {d.day}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* 3. WEEKLY BARS (HABITS DONE) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.6 }}
          className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Habits Completed
            </h2>
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <TrendingUp className="h-4 w-4" style={{ color: "var(--color-status-success)" }} />
            </motion.div>
          </div>
          <div className="flex items-end justify-between h-[120px] px-1 gap-2">
            {WEEKLY_DATA.map((d, i) => {
              const max = 10;
              const heightPct = (d.habits / max) * 100;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  {/* Value label */}
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                    className="text-[10px] font-bold text-[var(--color-text-tertiary)]"
                  >
                    {d.habits}
                  </motion.span>
                  <div className="w-full bg-[var(--color-bg-tertiary)] rounded-xl h-full relative flex items-end justify-center overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 80,
                        damping: 18,
                        delay: 1.2 + i * 0.1,
                      }}
                      className="w-full rounded-xl"
                      style={{
                        background: `linear-gradient(to top, var(--color-accent-primary), var(--color-accent-secondary))`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-tertiary)]">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 4. DONUT & HEATMAP ROW */}
        <div className="grid grid-cols-2 gap-4">
          {/* Screen Time Donut */}
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springs.default, delay: 0.7 }}
            className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] items-center justify-center relative"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div style={{ color: "var(--color-accent-primary)" }}>
                <Smartphone className="h-4 w-4" />
              </div>
              <h2 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Screen
              </h2>
            </div>

            <div className="mt-2 relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                {/* Background ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="14"
                />
                {donutSegments.map((seg, i) => (
                  <motion.circle
                    key={i}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={`${seg.strokeLength} ${circumference}`}
                    strokeDashoffset={-seg.offset}
                    strokeLinecap="round"
                    initial={{
                      strokeDasharray: `0 ${circumference}`,
                    }}
                    animate={{
                      strokeDasharray: `${seg.strokeLength} ${circumference}`,
                    }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 1.5 + i * 0.2,
                    }}
                  />
                ))}
              </svg>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springs.default, delay: 2.0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span className="text-xl font-black text-[var(--color-text-primary)]">
                  4h
                </span>
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">
                  20m
                </span>
              </motion.div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1 mt-3 w-full">
              {DONUT_DATA.map((seg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.0 + i * 0.1 }}
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: seg.color }}
                  />
                  <span className="text-[9px] font-semibold text-[var(--color-text-tertiary)]">
                    {seg.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Calendar Heatmap Mini */}
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springs.default, delay: 0.8 }}
            className="flex flex-col rounded-[24px] bg-[var(--color-bg-secondary)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] relative"
          >
            <div className="flex items-center justify-between mb-3">
              <Calendar className="h-4 w-4" style={{ color: "var(--color-accent-secondary)" }} />
              <h2 className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                Activity
              </h2>
            </div>

            <div className="grid grid-cols-7 gap-[5px] w-full flex-1 content-start">
              {HEATMAP_DATA.map((val, i) => {
                const opacityValues = [0.08, 0.25, 0.45, 0.7, 1];
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: opacityValues[val],
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                      delay: 1.8 + i * 0.025,
                    }}
                    className="aspect-square rounded-[4px]"
                    style={{ background: "var(--color-accent-secondary)" }}
                  />
                );
              })}
            </div>

            {/* Week labels */}
            <div className="flex justify-between mt-2 px-0.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 + i * 0.03 }}
                  className="text-[8px] font-bold text-[var(--color-text-tertiary)] w-full text-center"
                >
                  {d}
                </motion.span>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}