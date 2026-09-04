"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Calendar, Flame, Trophy, ArrowRight, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface HeatmapProps {
  /** Array of ISO date strings for completed workout sessions */
  completedDates: string[];
  /** Optional array of ISO date strings for scheduled or in-progress workouts */
  scheduledDates?: string[];
}

const DAYS_IN_WEEK = 7;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const INTENSITY_COLORS = [
  "bg-white/5 border-white/5",                  // 0 — empty / rest
  "bg-[#ADFF00]/25 border-[#ADFF00]/30",        // 1 session
  "bg-[#ADFF00]/50 border-[#ADFF00]/55",        // 2 sessions
  "bg-[#ADFF00]/75 border-[#ADFF00]/80",        // 3 sessions
  "bg-[#ADFF00] border-[#ADFF00] shadow-[0_0_8px_rgba(173,255,0,0.4)]", // 4+ sessions
];

function getIntensityClass(count: number): string {
  if (count === 0) return INTENSITY_COLORS[0];
  if (count === 1) return INTENSITY_COLORS[1];
  if (count === 2) return INTENSITY_COLORS[2];
  if (count === 3) return INTENSITY_COLORS[3];
  return INTENSITY_COLORS[4];
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function WorkoutHeatmap({ completedDates = [], scheduledDates = [] }: HeatmapProps) {
  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "1Y">("3M");
  const [selectedCell, setSelectedCell] = useState<{
    date: string;
    count: number;
    isScheduled: boolean;
    isToday: boolean;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const numWeeks = timeRange === "3M" ? 13 : timeRange === "6M" ? 26 : 52;
  const is3M = timeRange === "3M";
  const colStep = is3M ? 18 : 13; // cell width + gap

  const { grid, monthPositions, totalWorkouts, longestStreak, currentStreak } = useMemo(() => {
    // Frequency map for completed workouts
    const freqMap: Record<string, number> = {};
    for (const d of completedDates) {
      const key = d.split("T")[0];
      freqMap[key] = (freqMap[key] || 0) + 1;
    }

    // Set of scheduled / in-progress workout dates
    const scheduledSet = new Set<string>();
    for (const d of scheduledDates) {
      const key = d.split("T")[0];
      scheduledSet.add(key);
    }

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const today = new Date(todayYear, todayMonth, todayDate);
    const todayStr = formatDate(today);

    // Calculate start date based on selected time window
    const startDate = new Date(todayYear, todayMonth, todayDate);
    startDate.setDate(startDate.getDate() - (numWeeks * DAYS_IN_WEEK) + 1);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const grid: {
      date: string;
      count: number;
      isScheduled: boolean;
      isToday: boolean;
      future: boolean;
    }[][] = [];

    const firstOfMonthList: { month: number; col: number }[] = [];

    for (let week = 0; week < numWeeks; week++) {
      const col: {
        date: string;
        count: number;
        isScheduled: boolean;
        isToday: boolean;
        future: boolean;
      }[] = [];

      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = formatDate(cellDate);
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;
        const count = isFuture ? 0 : (freqMap[dateStr] || 0);
        const isScheduled = scheduledSet.has(dateStr);

        col.push({
          date: dateStr,
          count,
          isScheduled,
          isToday,
          future: isFuture,
        });

        // Track when a new month begins in this column
        if (cellDate.getDate() === 1) {
          firstOfMonthList.push({ month: cellDate.getMonth(), col: week });
        }
      }
      grid.push(col);
    }

    // Non-overlapping month labels
    const monthPositions: { month: number; col: number }[] = [];

    // Only show initial month at col 0 if the next month is at least 3 columns away
    if (firstOfMonthList.length > 0 && firstOfMonthList[0].col >= 3) {
      const initialCell = new Date(startDate);
      monthPositions.push({ month: initialCell.getMonth(), col: 0 });
    }

    let lastCol = monthPositions.length > 0 ? monthPositions[0].col : -10;
    for (const item of firstOfMonthList) {
      // Must be separated by at least 3 columns and not right at the boundary
      if (item.col - lastCol >= 3 && item.col <= numWeeks - 2) {
        monthPositions.push(item);
        lastCol = item.col;
      }
    }

    // Unique completed workout days
    const totalWorkouts = Object.values(freqMap).reduce((a, b) => a + Math.min(b, 1), 0);

    // Streaks calculation
    let streak = 0;
    let longestStreak = 0;
    const sorted = Object.keys(freqMap).filter(k => k <= todayStr).sort();
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        streak = diff === 1 ? streak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    // Current streak (checking backwards from today in local time)
    let currentStreak = 0;
    let checkDate = new Date(todayYear, todayMonth, todayDate);
    while (true) {
      const dStr = formatDate(checkDate);
      if (freqMap[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dStr === todayStr) {
        // Today hasn't been completed yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { grid, monthPositions, totalWorkouts, longestStreak, currentStreak };
  }, [completedDates, scheduledDates, numWeeks]);

  // Auto-scroll to current week (far right) whenever the range changes or on initial render
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [timeRange]);

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Training Calendar</h3>
            <p className="text-[11px] text-white/50">
              {totalWorkouts > 0 ? `${totalWorkouts} completed sessions` : "Consistency & routine activity"}
            </p>
          </div>
        </div>

        {/* Time window selector */}
        <div className="flex items-center gap-1 bg-[#0A1108] p-1 rounded-xl border border-white/5">
          {(["3M", "6M", "1Y"] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                timeRange === range
                  ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 bg-[#0A1108] p-3 rounded-xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Completed</span>
          <span className="text-base font-black text-white">
            {totalWorkouts} <span className="text-[10px] text-white/40 font-normal">workouts</span>
          </span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#ADFF00]" /> Current
          </span>
          <span className="text-base font-black text-[#ADFF00]">
            {currentStreak} <span className="text-[10px] text-white/40 font-normal">days</span>
          </span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-400" /> Best
          </span>
          <span className="text-base font-black text-white">
            {longestStreak} <span className="text-[10px] text-white/40 font-normal">days</span>
          </span>
        </div>
      </div>

      {/* Interactive cell inspection banner */}
      <AnimatePresence mode="wait">
        {selectedCell ? (
          <motion.div
            key={selectedCell.date}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className="flex items-center justify-between px-3.5 py-2 bg-[#0E170C] rounded-xl border border-[#ADFF00]/30 text-xs"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${selectedCell.count > 0 ? "bg-[#ADFF00]" : selectedCell.isScheduled ? "bg-[#ADFF00]/50" : "bg-white/20"}`} />
              <span className="font-bold text-white">{formatDisplayDate(selectedCell.date)}</span>
              <span className="text-white/40">•</span>
              <span className={`font-semibold ${selectedCell.count > 0 ? "text-[#ADFF00]" : selectedCell.isScheduled ? "text-emerald-400" : "text-white/50"}`}>
                {selectedCell.count > 0
                  ? `${selectedCell.count} Completed Workout${selectedCell.count > 1 ? "s" : ""}`
                  : selectedCell.isScheduled
                  ? "Scheduled in AI Plan"
                  : selectedCell.isToday
                  ? "Today (Rest / Unlogged)"
                  : "Rest Day"}
              </span>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className="text-[10px] font-bold text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </motion.div>
        ) : totalWorkouts === 0 ? (
          <motion.div
            key="empty-cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-3 bg-[#0A1108] rounded-xl border border-white/5 text-xs"
          >
            <span className="text-white/60 text-[11px]">
              Ready to start? Log your first workout to ignite your streak!
            </span>
            <Link
              href="/workout"
              prefetch={true}
              className="flex items-center gap-1 text-[11px] font-black uppercase text-[#ADFF00] hover:underline"
            >
              Start Workout <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Heatmap scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className={`inline-flex flex-col gap-1 min-w-max select-none ${is3M ? "w-full items-center" : ""}`}>
          {/* Month labels accurately positioned */}
          <div className="relative h-4" style={{ marginLeft: "20px", width: `${numWeeks * colStep}px` }}>
            {monthPositions.map((mp, i) => (
              <div
                key={i}
                className="absolute text-[9px] font-black text-white/40 uppercase tracking-wider"
                style={{ left: `${mp.col * colStep}px` }}
              >
                {MONTH_LABELS[mp.month]}
              </div>
            ))}
          </div>

          {/* Grid: Day labels + Week columns */}
          <div className={`flex ${is3M ? "gap-[4px]" : "gap-[3px]"}`}>
            {/* Day of week labels */}
            <div className={`flex flex-col ${is3M ? "gap-[4px]" : "gap-[3px]"} mr-1.5`}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} className={`w-3.5 ${is3M ? "h-[14px]" : "h-[10px]"} flex items-center justify-center`}>
                  {i % 2 === 1 && (
                    <span className="text-[8px] font-black text-white/30">{d}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Week Columns */}
            {grid.map((week, wi) => (
              <div key={wi} className={`flex flex-col ${is3M ? "gap-[4px]" : "gap-[3px]"}`}>
                {week.map((cell, di) => {
                  const isSelected = selectedCell?.date === cell.date;
                  return (
                    <button
                      key={di}
                      onClick={() =>
                        setSelectedCell({
                          date: cell.date,
                          count: cell.count,
                          isScheduled: cell.isScheduled,
                          isToday: cell.isToday,
                        })
                      }
                      className={`${is3M ? "w-[14px] h-[14px] rounded-[3px]" : "w-[10px] h-[10px] rounded-[2px]"} transition-all cursor-pointer relative ${
                        cell.future
                          ? "bg-transparent border border-transparent cursor-default pointer-events-none"
                          : cell.count > 0
                          ? getIntensityClass(cell.count)
                          : cell.isScheduled
                          ? "bg-[#ADFF00]/10 border border-[#ADFF00]/40"
                          : "bg-white/5 border border-white/5 hover:border-white/20"
                      } ${
                        cell.isToday
                          ? "ring-1.5 ring-[#ADFF00] ring-offset-1 ring-offset-black z-10"
                          : ""
                      } ${
                        isSelected
                          ? "scale-125 z-20 ring-2 ring-white"
                          : "hover:scale-110"
                      }`}
                    >
                      {/* Scheduled dot indicator */}
                      {cell.isScheduled && cell.count === 0 && !cell.future && (
                        <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-[#ADFF00]/70" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Help */}
      <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold uppercase tracking-wider text-[9px]">Less</span>
          {INTENSITY_COLORS.map((cls, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-[2px] border ${cls}`} />
          ))}
          <span className="font-bold uppercase tracking-wider text-[9px]">More</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#ADFF00]/10 border border-[#ADFF00]/40 flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-[#ADFF00]/70" />
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider">Scheduled</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-[10px] h-[10px] rounded-[2px] ring-1 ring-[#ADFF00] border border-white/10" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
