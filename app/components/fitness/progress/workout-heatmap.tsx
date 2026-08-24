"use client";

import { useMemo } from "react";

interface HeatmapProps {
  /** Array of ISO date strings for completed workout sessions */
  completedDates: string[];
}

const DAYS_IN_WEEK = 7;
const WEEKS_IN_YEAR = 53;

const INTENSITY_COLORS = [
  "bg-white/5 border-white/5",        // 0 — empty
  "bg-[#ADFF00]/20 border-[#ADFF00]/20",  // 1 session
  "bg-[#ADFF00]/45 border-[#ADFF00]/40",  // 2 sessions
  "bg-[#ADFF00]/70 border-[#ADFF00]/60",  // 3 sessions
  "bg-[#ADFF00] border-[#ADFF00]",        // 4+ sessions
];

function getIntensityClass(count: number): string {
  if (count === 0) return INTENSITY_COLORS[0];
  if (count === 1) return INTENSITY_COLORS[1];
  if (count === 2) return INTENSITY_COLORS[2];
  if (count === 3) return INTENSITY_COLORS[3];
  return INTENSITY_COLORS[4];
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function WorkoutHeatmap({ completedDates }: HeatmapProps) {
  const { grid, monthPositions, totalWorkouts, longestStreak } = useMemo(() => {
    // Build a frequency map: date string → count
    const freqMap: Record<string, number> = {};
    for (const d of completedDates) {
      const key = d.split("T")[0];
      freqMap[key] = (freqMap[key] || 0) + 1;
    }

    // Build grid: 53 weeks × 7 days, starting from 52 weeks ago
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Sunday that started the 53-week window
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (WEEKS_IN_YEAR * DAYS_IN_WEEK) + 1);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const grid: { date: string; count: number; future: boolean }[][] = [];
    const monthPositions: { month: number; col: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS_IN_YEAR; week++) {
      const col: { date: string; count: number; future: boolean }[] = [];
      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = formatDate(cellDate);
        const isFuture = cellDate > today;
        col.push({ date: dateStr, count: isFuture ? 0 : (freqMap[dateStr] || 0), future: isFuture });

        if (day === 0 && cellDate.getMonth() !== lastMonth && !isFuture) {
          lastMonth = cellDate.getMonth();
          monthPositions.push({ month: lastMonth, col: week });
        }
      }
      grid.push(col);
    }

    // Calculate total workouts (unique days)
    const totalWorkouts = Object.values(freqMap).reduce((a, b) => a + Math.min(b, 1), 0);

    // Calculate longest streak
    let streak = 0;
    let longestStreak = 0;
    const sorted = Object.keys(freqMap).sort();
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { streak = 1; continue; }
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      streak = diff === 1 ? streak + 1 : 1;
      longestStreak = Math.max(longestStreak, streak);
    }

    return { grid, monthPositions, totalWorkouts, longestStreak };
  }, [completedDates]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Stats row */}
      <div className="flex gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Past Year</span>
          <span className="text-lg font-black text-white">{totalWorkouts} <span className="text-xs text-white/50">workouts</span></span>
        </div>
        {longestStreak > 0 && (
          <div className="flex flex-col border-l border-white/10 pl-4">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Best Streak</span>
            <span className="text-lg font-black text-white">{longestStreak} <span className="text-xs text-white/50">days</span></span>
          </div>
        )}
      </div>

      {/* Heatmap scroll container */}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="flex gap-[3px] ml-6">
            {monthPositions.map((mp, i) => (
              <div
                key={i}
                className="text-[9px] font-bold text-white/30 uppercase"
                style={{ marginLeft: i === 0 ? 0 : `${(mp.col - (monthPositions[i - 1]?.col ?? 0) - 1) * 11}px` }}
              >
                {MONTH_LABELS[mp.month]}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="w-4 h-[9px] flex items-center justify-center">
                  {i % 2 === 1 && (
                    <span className="text-[8px] font-bold text-white/20">{d}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={`${cell.date}${cell.count > 0 ? ` — ${cell.count} workout${cell.count > 1 ? "s" : ""}` : ""}`}
                    className={`w-[9px] h-[9px] rounded-[2px] border ${
                      cell.future ? "bg-transparent border-transparent" : getIntensityClass(cell.count)
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Less</span>
        {INTENSITY_COLORS.map((cls, i) => (
          <div key={i} className={`w-[9px] h-[9px] rounded-[2px] border ${cls}`} />
        ))}
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">More</span>
      </div>
    </div>
  );
}
