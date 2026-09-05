"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Calendar, Flame, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

interface HeatmapProps {
  /** Array of ISO date strings for completed workout sessions */
  completedDates: string[];
  /** Optional array of ISO date strings for scheduled or in-progress workouts */
  scheduledDates?: string[];
  /** Optional date string when the user joined or started their plan */
  joinedDate?: string;
}

interface CellData {
  date: string;
  count: number;
  isScheduled: boolean;
  isToday: boolean;
  future: boolean;
}

const DAYS_IN_WEEK = 7;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const INTENSITY_COLORS = [
  "bg-white/5 border-white/5",                  // 0 — empty / rest
  "bg-[#ADFF00]/25 border-[#ADFF00]/30",        // 1 session
  "bg-[#ADFF00]/50 border-[#ADFF00]/55",        // 2 sessions
  "bg-[#ADFF00]/75 border-[#ADFF00]/80",        // 3 sessions
  "bg-[#ADFF00] border-[#ADFF00]",              // 4+ sessions
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

/**
 * Isolated & Memoized Heatmap Cell Component
 * Prevents 90-360 cell re-renders on selection or touch interaction
 */
const HeatmapCell = React.memo(function HeatmapCell({
  cell,
  isSelected,
  is3M,
  onSelect,
}: {
  cell: CellData;
  isSelected: boolean;
  is3M: boolean;
  onSelect: (cell: CellData) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(cell);
  }, [cell, onSelect]);

  const sizeClass = is3M
    ? "w-[14px] h-[14px] rounded-[3px]"
    : "w-[10px] h-[10px] rounded-[2px]";

  let colorClass = "";
  if (cell.count > 0) {
    colorClass = getIntensityClass(cell.count);
  } else if (cell.isScheduled) {
    colorClass = "bg-[#ADFF00]/15 border border-[#ADFF00]/50 sm:hover:border-[#ADFF00]";
  } else if (cell.isToday) {
    colorClass = "bg-white/10 border border-white/20";
  } else if (cell.future) {
    colorClass = "bg-white/[0.03] border border-white/[0.06] sm:hover:border-white/20";
  } else {
    colorClass = "bg-white/5 border border-white/5 sm:hover:border-white/20";
  }

  const activeClass = isSelected
    ? "scale-125 z-20 ring-2 ring-white"
    : cell.isToday
    ? "ring-1.5 ring-[#ADFF00] z-10"
    : "sm:hover:scale-110";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Date: ${cell.date}, Workouts: ${cell.count}`}
      className={`${sizeClass} ${colorClass} ${activeClass} cursor-pointer relative shrink-0 select-none touch-manipulation focus:outline-none transition-transform duration-75`}
    >
      {cell.isScheduled && cell.count === 0 && (
        <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-[#ADFF00] pointer-events-none" />
      )}
    </button>
  );
});

export function WorkoutHeatmap({ completedDates = [], scheduledDates = [], joinedDate }: HeatmapProps) {
  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "1Y">("3M");
  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const numWeeks = timeRange === "3M" ? 13 : timeRange === "6M" ? 26 : 52;
  const is3M = timeRange === "3M";
  const colStep = is3M ? 18 : 13; // cell width + gap

  const { grid, monthPositions, totalWorkouts, longestStreak, currentStreak, currentWeekCol } = useMemo(() => {
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

    // Current week's Sunday
    const currentWeekSunday = new Date(todayYear, todayMonth, todayDate);
    currentWeekSunday.setDate(currentWeekSunday.getDate() - currentWeekSunday.getDay());

    // Determine the user's start anchor:
    const dateCandidates = [
      joinedDate ? joinedDate.split("T")[0] : null,
      ...completedDates.map(d => d.split("T")[0]),
      todayStr,
    ].filter(Boolean) as string[];

    const earliestActivityDateStr = [...dateCandidates].sort()[0];

    // Start of the week the user began
    const [ey, em, ed] = earliestActivityDateStr.split("-").map(Number);
    const earliestWeekSunday = new Date(ey, em - 1, ed);
    earliestWeekSunday.setDate(earliestWeekSunday.getDate() - earliestWeekSunday.getDay());

    // How many weeks between user start and current week?
    const msDiff = currentWeekSunday.getTime() - earliestWeekSunday.getTime();
    const weeksSinceStart = Math.max(0, Math.floor(msDiff / (7 * 24 * 60 * 60 * 1000)));

    let startDate: Date;
    if (weeksSinceStart < numWeeks) {
      startDate = new Date(earliestWeekSunday);
    } else {
      startDate = new Date(currentWeekSunday);
      startDate.setDate(startDate.getDate() - (numWeeks - 1) * DAYS_IN_WEEK);
    }

    const grid: CellData[][] = [];
    const firstOfMonthList: { month: number; col: number }[] = [];
    let currentWeekCol = 0;

    const startMs = startDate.getTime();
    const ONE_DAY_MS = 86400000;

    for (let week = 0; week < numWeeks; week++) {
      const col: CellData[] = [];

      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const cellDate = new Date(startMs + (week * 7 + day) * ONE_DAY_MS);
        const dateStr = formatDate(cellDate);
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;
        const count = isFuture ? 0 : (freqMap[dateStr] || 0);
        const isScheduled = scheduledSet.has(dateStr);

        if (isToday) {
          currentWeekCol = week;
        }

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

    if (firstOfMonthList.length === 0 || firstOfMonthList[0].col >= 3) {
      monthPositions.push({ month: startDate.getMonth(), col: 0 });
    } else {
      monthPositions.push({ month: firstOfMonthList[0].month, col: 0 });
    }

    let lastCol = monthPositions.length > 0 ? monthPositions[0].col : -10;
    for (const item of firstOfMonthList) {
      if (item.col - lastCol >= 3 && item.col <= numWeeks - 1) {
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

    // Current streak
    let currentStreak = 0;
    let checkDate = new Date(todayYear, todayMonth, todayDate);
    while (true) {
      const dStr = formatDate(checkDate);
      if (freqMap[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dStr === todayStr) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { grid, monthPositions, totalWorkouts, longestStreak, currentStreak, currentWeekCol };
  }, [completedDates, scheduledDates, joinedDate, numWeeks]);

  // Auto-scroll to current week column on mount and range switch
  useEffect(() => {
    if (scrollRef.current) {
      const targetLeft = Math.max(0, currentWeekCol * colStep - 30);
      scrollRef.current.scrollTo({ left: targetLeft, behavior: "auto" });
    }
  }, [timeRange, currentWeekCol, colStep]);

  const scrollToToday = useCallback(() => {
    if (scrollRef.current) {
      const targetLeft = Math.max(0, currentWeekCol * colStep - 30);
      scrollRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  }, [currentWeekCol, colStep]);

  const handleSelectCell = useCallback((cell: CellData) => {
    setSelectedCell(prev => (prev?.date === cell.date ? null : cell));
  }, []);

  const todayCell = useMemo(() => {
    for (const week of grid) {
      for (const cell of week) {
        if (cell.isToday) return cell;
      }
    }
    return null;
  }, [grid]);

  const handleSelectToday = useCallback(() => {
    const now = new Date();
    const todayStr = formatDate(now);

    if (todayCell) {
      setSelectedCell(todayCell);
    } else {
      setSelectedCell({
        date: todayStr,
        count: 0,
        isScheduled: false,
        isToday: true,
        future: false,
      });
    }

    scrollToToday();
  }, [todayCell, scrollToToday]);

  const handleSelectScheduled = useCallback(() => {
    for (const week of grid) {
      for (const cell of week) {
        if (cell.isScheduled && !cell.count) {
          setSelectedCell(cell);
          return;
        }
      }
    }
  }, [grid]);

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

  const selectedDateStr = selectedCell?.date;

  return (
    <div className="w-full flex flex-col gap-3.5 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Training Calendar</h3>
            <p className="text-[11px] text-white/50">
              {totalWorkouts > 0 ? `${totalWorkouts} completed sessions` : "Consistency & routine activity"}
            </p>
          </div>
        </div>

        {/* Time window selector & Today button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSelectToday}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border touch-manipulation ${
              selectedCell?.isToday
                ? "bg-[#ADFF00] text-black border-[#ADFF00]"
                : "bg-[#0A1108] text-white/70 hover:text-[#ADFF00] border-white/5 hover:border-[#ADFF00]/30"
            }`}
            title="Jump & select Today"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-[#0A1108] p-1 rounded-xl border border-white/5">
            {(["3M", "6M", "1Y"] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer touch-manipulation ${
                  timeRange === range
                    ? "bg-[#ADFF00] text-black shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
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

      {/* Fast & Lightweight Inspection banner */}
      {selectedCell ? (
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0E170C] rounded-xl border border-[#ADFF00]/30 text-xs transition-opacity duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${selectedCell.count > 0 ? "bg-[#ADFF00]" : selectedCell.isScheduled ? "bg-[#ADFF00]/50" : "bg-white/20"}`} />
            <span className="font-bold text-white">{formatDisplayDate(selectedCell.date)}</span>
            {selectedCell.isToday && (
              <span className="px-1.5 py-0.5 rounded bg-[#ADFF00] text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
                Today
              </span>
            )}
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
          <div className="flex items-center gap-2 shrink-0">
            {!selectedCell.isToday && (
              <button
                type="button"
                onClick={handleSelectToday}
                className="text-[10px] font-bold text-[#ADFF00] hover:bg-[#ADFF00]/20 flex items-center gap-1 cursor-pointer bg-[#ADFF00]/10 px-2 py-0.5 rounded-lg border border-[#ADFF00]/20 transition-colors touch-manipulation"
                title="Jump back to Today"
              >
                Jump to Today
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-[10px] font-bold text-white/50 hover:text-white flex items-center gap-1 cursor-pointer p-1 rounded-lg hover:bg-white/10 transition-colors touch-manipulation"
              title="Clear selection"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : totalWorkouts === 0 ? (
        <div className="flex items-center justify-between p-3 bg-[#0A1108] rounded-xl border border-white/5 text-xs">
          <span className="text-white/60 text-[11px]">
            Ready to start? Log your first workout to ignite your streak!
          </span>
          <Link
            href="/workout"
            prefetch={true}
            className="flex items-center gap-1 text-[11px] font-black uppercase text-[#ADFF00] hover:underline shrink-0"
          >
            Start Workout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : null}

      {/* GPU Hardware-Accelerated Heatmap scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none overscroll-x-contain touch-pan-x"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          willChange: "scroll-position",
          transform: "translateZ(0)",
        }}
      >
        <div className="inline-flex flex-col gap-1 min-w-max mx-auto">
          {/* Month labels accurately positioned */}
          <div className="relative h-4" style={{ marginLeft: "20px", width: `${numWeeks * colStep + 28}px` }}>
            {monthPositions.map((mp, i) => (
              <div
                key={i}
                className="absolute text-[9px] font-black text-white/40 uppercase tracking-wider whitespace-nowrap pointer-events-none select-none"
                style={{ left: `${mp.col * colStep}px` }}
              >
                {MONTH_LABELS[mp.month]}
              </div>
            ))}
          </div>

          {/* Grid: Day labels + Week columns */}
          <div className={`flex ${is3M ? "gap-[4px]" : "gap-[3px]"}`}>
            {/* Day of week labels */}
            <div className={`flex flex-col ${is3M ? "gap-[4px]" : "gap-[3px]"} mr-1.5 select-none pointer-events-none`}>
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
                {week.map((cell) => (
                  <HeatmapCell
                    key={cell.date}
                    cell={cell}
                    isSelected={selectedDateStr === cell.date}
                    is3M={is3M}
                    onSelect={handleSelectCell}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Quick Selectors */}
      <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold uppercase tracking-wider text-[9px]">Less</span>
          {INTENSITY_COLORS.map((cls, i) => (
            <div key={i} className={`w-[10px] h-[10px] rounded-[2px] border ${cls}`} />
          ))}
          <span className="font-bold uppercase tracking-wider text-[9px]">More</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleSelectScheduled}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors cursor-pointer active:scale-95 touch-manipulation"
            title="View scheduled workouts in AI Plan"
          >
            <div className="w-[10px] h-[10px] rounded-[2px] bg-[#ADFF00]/10 border border-[#ADFF00]/40 flex items-center justify-center pointer-events-none">
              <span className="w-1 h-1 rounded-full bg-[#ADFF00]/70" />
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider">Scheduled</span>
          </button>

          <button
            type="button"
            onClick={handleSelectToday}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-colors cursor-pointer active:scale-95 touch-manipulation ${
              selectedCell?.isToday
                ? "bg-[#ADFF00] text-black border-[#ADFF00] font-black shadow-sm"
                : "bg-white/5 hover:bg-[#ADFF00]/15 text-white/70 hover:text-[#ADFF00] border-white/10 hover:border-[#ADFF00]/40"
            }`}
            title="Click to select & view Today"
          >
            <div className={`w-[10px] h-[10px] rounded-[2px] pointer-events-none ${
              selectedCell?.isToday ? "bg-black" : "ring-1 ring-[#ADFF00] border border-white/10"
            }`} />
            <span className="text-[9px] uppercase font-black tracking-wider">Today</span>
          </button>
        </div>
      </div>
    </div>
  );
}
