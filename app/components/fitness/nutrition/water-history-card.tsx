"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Droplet, Calendar as CalendarIcon, Check } from "lucide-react";
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
  waterByDate?: Record<string, number>;
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
  
  // Navigation for real month calendar
  const [activeDate, setActiveDate] = useState(() => new Date());
  
  // Tooltip/Selection for tapped day
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    amount: number;
    percent: number;
    dayName?: string;
  } | null>(null);

  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

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

  // Level color palette matching user's dark green/cyan theme
  const getLevelColor = (level: number, isFuture: boolean = false) => {
    if (isFuture) return "bg-[#141C12] text-white/20 border-white/5";
    switch (level) {
      case 1:
        return "bg-[#004754] text-cyan-200 border-cyan-700/30";
      case 2:
        return "bg-[#007489] text-cyan-100 border-cyan-600/40";
      case 3:
        return "bg-[#00A9C7] text-white font-bold border-cyan-400/50 shadow-[0_0_8px_rgba(0,169,199,0.25)]";
      case 4:
        return "bg-[#00D2FF] text-black font-black border-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.4)]";
      case 0:
      default:
        return "bg-[#182216] text-white/40 border-white/5 hover:border-white/20";
    }
  };

  // ----------------------------------------------------
  // REAL MONTH CALENDAR COMPUTATION
  // ----------------------------------------------------
  const currentYear = activeDate.getFullYear();
  const currentMonthIdx = activeDate.getMonth(); // 0 = Jan, 8 = Sep

  const monthTitle = useMemo(() => {
    return activeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [activeDate]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === currentYear && now.getMonth() === currentMonthIdx;
  }, [currentYear, currentMonthIdx]);

  const handlePrevMonth = () => {
    setActiveDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    setActiveDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // Calendar cells for Month view
  const monthCalendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonthIdx, 1).getDay();
    // Monday as first day: 0 = Mon, ..., 6 = Sun
    const startPadding = (firstDayIndex + 6) % 7;

    const days = [];

    // Empty padding slots
    for (let i = 0; i < startPadding; i++) {
      days.push({ isPadding: true, key: `pad-${i}` });
    }

    // Days 1 through daysInMonth
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = dateStr === todayDateStr;
      const isFuture = dateStr > todayDateStr;

      let amountMl = 0;
      if (historyData?.waterByDate && historyData.waterByDate[dateStr] !== undefined) {
        amountMl = Number(historyData.waterByDate[dateStr]) || 0;
      } else if (historyData?.threeMonth?.days) {
        const found = historyData.threeMonth.days.find((item: any) => item.date === dateStr);
        if (found) amountMl = Number(found.amount_ml) || 0;
      }

      if (isToday) {
        amountMl = Math.max(amountMl, todayConsumedMl);
      }

      const percent = Math.min(100, Math.round((amountMl / (targetMl || 1)) * 100));
      let level = 0;
      if (amountMl > 0) {
        if (percent < 25) level = 1;
        else if (percent < 50) level = 2;
        else if (percent < 75) level = 3;
        else level = 4;
      }

      days.push({
        isPadding: false,
        key: dateStr,
        dayNumber: d,
        date: dateStr,
        amount_ml: amountMl,
        percent,
        level,
        isToday,
        isFuture,
      });
    }

    return days;
  }, [currentYear, currentMonthIdx, todayDateStr, historyData, todayConsumedMl, targetMl]);

  // Dynamic statistics for Month view
  const monthStats = useMemo(() => {
    let totalMl = 0;
    let loggedCount = 0;
    let goalCount = 0;

    monthCalendarDays.forEach((d: any) => {
      if (!d.isPadding && !d.isFuture) {
        if (d.amount_ml > 0) {
          totalMl += d.amount_ml;
          loggedCount++;
        }
        if (d.amount_ml >= targetMl) {
          goalCount++;
        }
      }
    });

    const dailyAvg = loggedCount > 0 ? `${(totalMl / loggedCount / 1000).toFixed(1)}L` : "0.0L";

    return {
      daily_avg: dailyAvg,
      goal_days: goalCount,
      logged: loggedCount,
    };
  }, [monthCalendarDays, targetMl]);

  // ----------------------------------------------------
  // WEEK VIEW COMPUTATION
  // ----------------------------------------------------
  const weekDays = useMemo(() => {
    const baseDate = new Date();
    const currentDay = baseDate.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = [];
    let totalMl = 0;
    let loggedCount = 0;
    let goalCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
      const isToday = dateStr === todayDateStr;
      const isFuture = dateStr > todayDateStr;

      let amountMl = 0;
      if (historyData?.waterByDate && historyData.waterByDate[dateStr] !== undefined) {
        amountMl = Number(historyData.waterByDate[dateStr]) || 0;
      } else if (historyData?.threeMonth?.days) {
        const found = historyData.threeMonth.days.find((item: any) => item.date === dateStr);
        if (found) amountMl = Number(found.amount_ml) || 0;
      }

      if (isToday) {
        amountMl = Math.max(amountMl, todayConsumedMl);
      }

      if (!isFuture && amountMl > 0) {
        totalMl += amountMl;
        loggedCount++;
      }
      if (!isFuture && amountMl >= targetMl) {
        goalCount++;
      }

      const percent = Math.min(100, Math.round((amountMl / (targetMl || 1)) * 100));
      let level = 0;
      if (amountMl > 0) {
        if (percent < 25) level = 1;
        else if (percent < 50) level = 2;
        else if (percent < 75) level = 3;
        else level = 4;
      }

      days.push({
        date: dateStr,
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        amount_ml: amountMl,
        percent,
        level,
        isToday,
        isFuture,
      });
    }

    const dailyAvg = loggedCount > 0 ? `${(totalMl / loggedCount / 1000).toFixed(1)}L` : "0.0L";

    return {
      days,
      stats: {
        daily_avg: dailyAvg,
        goal_days: goalCount,
        logged: loggedCount,
      },
    };
  }, [todayDateStr, historyData, todayConsumedMl, targetMl]);

  // ----------------------------------------------------
  // 3-MONTH VIEW COMPUTATION (Last 3 Months Selector)
  // ----------------------------------------------------
  const quarterMonths = useMemo(() => {
    const now = new Date();
    const list = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return list;
  }, []);

  // Format date helper for tooltip
  const formatFullDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const activeStats = timeframe === "week" ? weekDays.stats : monthStats;

  return (
    <div className="bg-[#111A10] border border-white/5 rounded-[28px] p-5 sm:p-6 mt-4 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Top Header: Title & Timeframe Selector */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Droplet size={18} className="text-[#00D2FF]" />
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            History
          </h3>
        </div>

        {/* Timeframe Selector Pill */}
        <div className="bg-black/50 border border-white/10 rounded-2xl p-1 flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTimeframe("week");
              setSelectedDay(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
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
              setSelectedDay(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
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
              setSelectedDay(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
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
            {activeStats.daily_avg}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Daily Avg
          </p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#00D2FF] tracking-tight">
            {activeStats.goal_days}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Goal Days
          </p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black text-[#00D2FF] tracking-tight">
            {activeStats.logged}
          </p>
          <p className="text-[10px] font-bold tracking-wider text-white/50 uppercase mt-1">
            Logged
          </p>
        </div>
      </div>

      {/* Selected Day Status Banner */}
      {selectedDay && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-black/70 border border-[#00D2FF]/30 text-xs font-bold text-white flex items-center justify-between shadow-[0_0_15px_rgba(0,210,255,0.15)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-[#00D2FF]" />
            <span>{formatFullDate(selectedDay.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#00D2FF] font-black">
              {selectedDay.amount} ml
            </span>
            <span className="text-white/50 text-[11px]">
              ({selectedDay.percent}%)
            </span>
            {selectedDay.percent >= 100 && (
              <span className="text-[10px] font-black bg-[#00D2FF] text-black px-1.5 py-0.2 rounded-md">
                GOAL
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. REAL MONTH CALENDAR FORMAT */}
      {/* ---------------------------------------------------- */}
      {timeframe === "month" && (
        <div className="w-full">
          {/* Month Header with Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon size={15} className="text-[#00D2FF]" />
              {monthTitle}
            </span>

            <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-xl p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isCurrentMonth}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isCurrentMonth
                    ? "text-white/20 cursor-not-allowed"
                    : "hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
                }`}
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Columns Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dayName) => (
              <span key={dayName} className="text-[10px] font-black text-white/40 tracking-wider">
                {dayName}
              </span>
            ))}
          </div>

          {/* Calendar Day Tiles Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthCalendarDays.map((cell: any) => {
              if (cell.isPadding) {
                return <div key={cell.key} className="w-full aspect-square" />;
              }

              const isSelected = selectedDay?.date === cell.date;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={cell.isFuture}
                  onClick={() =>
                    setSelectedDay({
                      date: cell.date,
                      amount: cell.amount_ml,
                      percent: cell.percent,
                    })
                  }
                  className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-150 select-none ${
                    cell.isFuture
                      ? "opacity-25 border-white/5 bg-[#121811] cursor-default"
                      : "cursor-pointer active:scale-90"
                  } ${getLevelColor(cell.level, cell.isFuture)} ${
                    cell.isToday ? "ring-2 ring-[#ADFF00] border-[#ADFF00]" : ""
                  } ${isSelected ? "ring-2 ring-white scale-105 z-10" : ""}`}
                >
                  <span className="text-xs sm:text-sm font-black leading-none">
                    {cell.dayNumber}
                  </span>

                  {cell.isToday && (
                    <span className="w-1 h-1 bg-[#ADFF00] rounded-full absolute bottom-1" />
                  )}

                  {cell.level === 4 && !cell.isToday && (
                    <span className="w-1 h-1 bg-black rounded-full absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. REAL WEEK CALENDAR FORMAT */}
      {/* ---------------------------------------------------- */}
      {timeframe === "week" && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-black text-white/60 uppercase tracking-wider">
              Current Week
            </span>
            <span className="text-xs font-bold text-[#00D2FF]">
              {weekDays.days[0]?.dayName} {weekDays.days[0]?.dayNumber} – {weekDays.days[6]?.dayName} {weekDays.days[6]?.dayNumber}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.days.map((d: any) => {
              const isSelected = selectedDay?.date === d.date;
              return (
                <div key={d.date} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-white/50 uppercase">
                    {d.dayName}
                  </span>

                  <button
                    type="button"
                    disabled={d.isFuture}
                    onClick={() =>
                      setSelectedDay({
                        date: d.date,
                        amount: d.amount_ml,
                        percent: d.percent,
                      })
                    }
                    className={`w-full aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all select-none ${
                      d.isFuture
                        ? "opacity-25 border-white/5 bg-[#121811] cursor-default"
                        : "cursor-pointer active:scale-90"
                    } ${getLevelColor(d.level, d.isFuture)} ${
                      d.isToday ? "ring-2 ring-[#ADFF00] border-[#ADFF00]" : ""
                    } ${isSelected ? "ring-2 ring-white scale-105 z-10" : ""}`}
                  >
                    <span className="text-sm font-black">{d.dayNumber}</span>
                    {d.isToday && (
                      <span className="w-1.5 h-1.5 bg-[#ADFF00] rounded-full mt-0.5" />
                    )}
                  </button>

                  <span className="text-[9px] font-bold text-white/40 truncate max-w-full">
                    {d.amount_ml > 0 ? `${(d.amount_ml / 1000).toFixed(1)}L` : "0L"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. REAL 3-MONTH CALENDAR FORMAT */}
      {/* ---------------------------------------------------- */}
      {timeframe === "threeMonth" && (
        <div className="w-full">
          {/* Quarter Month Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {quarterMonths.map((qm) => {
              const isSelected = activeDate.getMonth() === qm.monthIdx;
              return (
                <button
                  key={`${qm.year}-${qm.monthIdx}`}
                  type="button"
                  onClick={() => {
                    setActiveDate(new Date(qm.year, qm.monthIdx, 1));
                    setSelectedDay(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00D2FF] text-black shadow-md"
                      : "bg-black/40 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {qm.fullLabel}
                </button>
              );
            })}
          </div>

          {/* Weekday Columns Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dayName) => (
              <span key={dayName} className="text-[10px] font-black text-white/40 tracking-wider">
                {dayName}
              </span>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthCalendarDays.map((cell: any) => {
              if (cell.isPadding) {
                return <div key={cell.key} className="w-full aspect-square" />;
              }

              const isSelected = selectedDay?.date === cell.date;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={cell.isFuture}
                  onClick={() =>
                    setSelectedDay({
                      date: cell.date,
                      amount: cell.amount_ml,
                      percent: cell.percent,
                    })
                  }
                  className={`w-full aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all duration-150 select-none ${
                    cell.isFuture
                      ? "opacity-25 border-white/5 bg-[#121811] cursor-default"
                      : "cursor-pointer active:scale-90"
                  } ${getLevelColor(cell.level, cell.isFuture)} ${
                    cell.isToday ? "ring-2 ring-[#ADFF00] border-[#ADFF00]" : ""
                  } ${isSelected ? "ring-2 ring-white scale-105 z-10" : ""}`}
                >
                  <span className="text-xs sm:text-sm font-black leading-none">
                    {cell.dayNumber}
                  </span>

                  {cell.isToday && (
                    <span className="w-1 h-1 bg-[#ADFF00] rounded-full absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Legend: Less [■][■][■][■][■] Goal */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <span className="text-[10px] font-bold text-white/40">
          Target: {(targetMl / 1000).toFixed(1)}L/day
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-white/40 tracking-wider">Less</span>
          <div className="w-3.5 h-3.5 rounded-md bg-[#182216] border border-white/10" title="0%" />
          <div className="w-3.5 h-3.5 rounded-md bg-[#004754]" title="<25%" />
          <div className="w-3.5 h-3.5 rounded-md bg-[#007489]" title="25-50%" />
          <div className="w-3.5 h-3.5 rounded-md bg-[#00A9C7]" title="50-75%" />
          <div className="w-3.5 h-3.5 rounded-md bg-[#00D2FF]" title="Goal (100%)" />
          <span className="text-[10px] font-bold text-white/40 tracking-wider ml-0.5">Goal</span>
        </div>
      </div>
    </div>
  );
}
