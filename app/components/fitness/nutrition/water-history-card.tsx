"use client";

import React, { useState, useEffect, useMemo } from "react";
import { nutritionApi } from "@/lib/api/nutrition";

interface DayData {
  date: string;
  amount_ml: number;
  target_ml: number;
  percent: number;
  level: number;
}

interface RangeHistory {
  daily_avg: string;
  goal_days: number;
  logged: number;
  target_ml: number;
  days: DayData[];
}

interface WaterHistoryData {
  week: RangeHistory;
  month: RangeHistory;
  threeMonth: RangeHistory;
}

interface WaterHistoryCardProps {
  todayConsumedMl?: number;
  targetMl?: number;
}

type Timeframe = "week" | "month" | "threeMonth";

export function WaterHistoryCard({
  todayConsumedMl = 0,
  targetMl = 2500,
}: WaterHistoryCardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [historyData, setHistoryData] = useState<WaterHistoryData | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    date: string;
    amount: number;
    percent: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    nutritionApi
      .getWaterHistory()
      .then((data) => {
        if (isMounted && data) {
          setHistoryData(data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load water history:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live data with today's live intake overlay
  const currentRange = useMemo(() => {
    if (!historyData) {
      // Fallback empty range while loading
      const count = timeframe === "week" ? 7 : timeframe === "month" ? 31 : 90;
      const days: DayData[] = [];
      const now = new Date();
      for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const isToday = i === 0;
        const amount = isToday ? todayConsumedMl : 0;
        const percent = Math.min(100, Math.round((amount / (targetMl || 1)) * 100));
        let level = 0;
        if (amount > 0) {
          if (percent < 25) level = 1;
          else if (percent < 50) level = 2;
          else if (percent < 75) level = 3;
          else level = 4;
        }
        days.push({
          date: d.toISOString().split("T")[0],
          amount_ml: amount,
          target_ml: targetMl,
          percent,
          level,
        });
      }
      const logged = todayConsumedMl > 0 ? 1 : 0;
      const goalDays = todayConsumedMl >= targetMl ? 1 : 0;
      const dailyAvg = todayConsumedMl > 0 ? `${(todayConsumedMl / 1000).toFixed(1)}L` : "0.0L";
      return {
        daily_avg: dailyAvg,
        goal_days: goalDays,
        logged,
        target_ml: targetMl,
        days,
      };
    }

    const base = historyData[timeframe];
    if (!base || !base.days) return null;

    // Overlay today's live intake on the last day item
    const days = [...base.days];
    if (days.length > 0) {
      const lastIndex = days.length - 1;
      const currentToday = days[lastIndex];
      const liveAmount = Math.max(currentToday.amount_ml, todayConsumedMl);
      const percent = Math.min(100, Math.round((liveAmount / (targetMl || 1)) * 100));
      let level = 0;
      if (liveAmount > 0) {
        if (percent < 25) level = 1;
        else if (percent < 50) level = 2;
        else if (percent < 75) level = 3;
        else level = 4;
      }
      days[lastIndex] = {
        ...currentToday,
        amount_ml: liveAmount,
        target_ml: targetMl,
        percent,
        level,
      };
    }

    // Recalculate stats with live day
    let totalMl = 0;
    let loggedCount = 0;
    let goalCount = 0;
    days.forEach((d) => {
      if (d.amount_ml > 0) {
        totalMl += d.amount_ml;
        loggedCount++;
      }
      if (d.amount_ml >= targetMl) {
        goalCount++;
      }
    });

    const dailyAvg = loggedCount > 0 ? `${(totalMl / loggedCount / 1000).toFixed(1)}L` : "0.0L";

    return {
      daily_avg: dailyAvg,
      goal_days: goalCount,
      logged: loggedCount,
      target_ml: targetMl,
      days,
    };
  }, [historyData, timeframe, todayConsumedMl, targetMl]);

  // Color mapper matching reference:
  // Level 0: dark charcoal forest #1D251C
  // Level 1: #004754
  // Level 2: #007489
  // Level 3: #00A9C7
  // Level 4: #00D2FF (vibrant cyan)
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-[#004754]";
      case 2:
        return "bg-[#007489]";
      case 3:
        return "bg-[#00A9C7]";
      case 4:
        return "bg-[#00D2FF]";
      case 0:
      default:
        return "bg-[#1D251C]";
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#111A10] border border-white/5 rounded-[28px] p-5 sm:p-6 mt-4 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Header & Pill Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
          History
        </h3>

        {/* Timeframe Selector Pill */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-1 flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTimeframe("week");
              setActiveTooltip(null);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              timeframe === "week"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeframe("month");
              setActiveTooltip(null);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              timeframe === "month"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => {
              setTimeframe("threeMonth");
              setActiveTooltip(null);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              timeframe === "threeMonth"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white"
            }`}
          >
            3 Month
          </button>
        </div>
      </div>

      {/* 3-Column Summary Stats Box */}
      <div className="bg-[#182216] border border-white/5 rounded-2xl p-4 my-4 grid grid-cols-3 divide-x divide-white/10 text-center shadow-inner">
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#00D2FF] tracking-tight">
            {currentRange?.daily_avg || "0.0L"}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Daily Avg
          </p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#00D2FF] tracking-tight">
            {currentRange?.goal_days ?? 0}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Goal Days
          </p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#00D2FF] tracking-tight">
            {currentRange?.logged ?? 0}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Logged
          </p>
        </div>
      </div>

      {/* Tooltip Overlay (if a tile is tapped/hovered) */}
      {activeTooltip && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-black/80 border border-cyan-500/30 text-center text-xs font-bold text-white flex items-center justify-between animate-fadeIn">
          <span>{formatDateLabel(activeTooltip.date)}</span>
          <span className="text-[#00D2FF]">
            {activeTooltip.amount} ml ({activeTooltip.percent}%)
          </span>
        </div>
      )}

      {/* Heatmap Grid */}
      <div className="w-full">
        {timeframe === "week" && (
          <div className="grid grid-cols-7 gap-2.5 sm:gap-3 py-2">
            {(currentRange?.days || []).map((day, idx) => {
              const d = new Date(day.date);
              const dayName = ["S", "M", "T", "W", "T", "F", "S"][d.getDay()] || "D";
              return (
                <div key={day.date || idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-white/40">{dayName}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTooltip({
                        date: day.date,
                        amount: day.amount_ml,
                        percent: day.percent,
                      })
                    }
                    className={`w-full aspect-square rounded-xl transition-all active:scale-95 cursor-pointer hover:ring-2 hover:ring-[#00D2FF]/50 ${getLevelColor(
                      day.level
                    )}`}
                    title={`${formatDateLabel(day.date)}: ${day.amount_ml}ml (${day.percent}%)`}
                  />
                  <span className="text-[9px] font-bold text-white/30">
                    {day.date.split("-")[2]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {timeframe === "month" && (
          /* Exact 11-column grid matching reference image */
          <div className="grid grid-cols-11 gap-1.5 sm:gap-2 py-2">
            {(currentRange?.days || []).map((day, idx) => (
              <button
                key={day.date || idx}
                type="button"
                onClick={() =>
                  setActiveTooltip({
                    date: day.date,
                    amount: day.amount_ml,
                    percent: day.percent,
                  })
                }
                className={`w-full aspect-square rounded-lg sm:rounded-xl transition-all active:scale-95 cursor-pointer hover:ring-2 hover:ring-[#00D2FF]/60 ${getLevelColor(
                  day.level
                )}`}
                title={`${formatDateLabel(day.date)}: ${day.amount_ml}ml (${day.percent}%)`}
              />
            ))}
          </div>
        )}

        {timeframe === "threeMonth" && (
          /* 90-day compact heatmap grid */
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 py-2">
            {(currentRange?.days || []).map((day, idx) => (
              <button
                key={day.date || idx}
                type="button"
                onClick={() =>
                  setActiveTooltip({
                    date: day.date,
                    amount: day.amount_ml,
                    percent: day.percent,
                  })
                }
                className={`w-full aspect-square rounded-md sm:rounded-lg transition-all active:scale-95 cursor-pointer hover:ring-1 hover:ring-[#00D2FF]/60 ${getLevelColor(
                  day.level
                )}`}
                title={`${formatDateLabel(day.date)}: ${day.amount_ml}ml (${day.percent}%)`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Legend: Less [■][■][■][■][■] Goal */}
      <div className="flex items-center justify-end gap-1.5 mt-3 pt-2">
        <span className="text-[10px] font-bold text-white/40 tracking-wider">Less</span>
        <div className="w-3 h-3 rounded-sm bg-[#1D251C]" />
        <div className="w-3 h-3 rounded-sm bg-[#004754]" />
        <div className="w-3 h-3 rounded-sm bg-[#007489]" />
        <div className="w-3 h-3 rounded-sm bg-[#00A9C7]" />
        <div className="w-3 h-3 rounded-sm bg-[#00D2FF]" />
        <span className="text-[10px] font-bold text-white/40 tracking-wider ml-0.5">Goal</span>
      </div>
    </div>
  );
}
