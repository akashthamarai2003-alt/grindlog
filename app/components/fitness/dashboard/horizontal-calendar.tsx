"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface HorizontalCalendarProps {
  weekWorkouts?: Array<{
    id: string;
    workout_date: string;
    status: string;
    name?: string;
  }>;
  targetDateStr?: string;
}

export function HorizontalCalendar({ weekWorkouts = [], targetDateStr }: HorizontalCalendarProps) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const activeDateStr = dateParam || targetDateStr || todayStr;
  const activeDate = parseISO(activeDateStr);

  // Clear pending spinner once the URL updates
  useEffect(() => {
    setPendingDate(null);
  }, [dateParam]);

  // Week starts Monday (1) to Sunday per fitness standards
  const weekStart = startOfWeek(activeDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Determine Month Header text
  const weekEnd = days[6];
  const startMonth = format(weekStart, "MMM");
  const endMonth = format(weekEnd, "MMM");
  const yearStr = format(weekEnd, "yyyy");
  const monthHeader = startMonth === endMonth 
    ? `${format(weekStart, "MMMM")} ${yearStr}`
    : `${startMonth} – ${endMonth} ${yearStr}`;

  const isViewingToday = activeDateStr === todayStr;

  // Build workout lookup map by date
  const workoutMap = new Map<string, { status: string; name?: string }>();
  (weekWorkouts || []).forEach(w => {
    if (w.workout_date) {
      workoutMap.set(w.workout_date, { status: w.status, name: w.name });
    }
  });

  return (
    <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-3.5 sm:p-4 shadow-xl">
      {/* Calendar Header with Month/Year and Quick Jump */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#ADFF00]/10 flex items-center justify-center">
            <CalendarIcon className="w-3.5 h-3.5 text-[#ADFF00]" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {monthHeader}
          </span>
        </div>

        {!isViewingToday && (
          <Link
            href="/"
            scroll={false}
            prefetch={true}
            className="text-[10px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/30 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
          >
            Today
          </Link>
        )}
      </div>

      {/* 7-Column Grid: 100% width, zero overflow, all 7 days visible simultaneously */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date, idx) => {
          const dateString = format(date, "yyyy-MM-dd");
          const isActive = dateString === activeDateStr;
          const isToday = dateString === todayStr;
          const dayName = format(date, "EEE"); // "Mon", "Tue"
          const dayNum = format(date, "d");   // "1", "2"
          const isPending = pendingDate === dateString;

          const workoutInfo = workoutMap.get(dateString);
          const isCompleted = workoutInfo?.status === "completed";
          const isScheduled = !!workoutInfo && !isCompleted;

          return (
            <Link
              key={idx}
              href={`/?date=${dateString}`}
              scroll={false}
              prefetch={true}
              onClick={() => {
                if (!isActive) setPendingDate(dateString);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
            >
              {/* Day Name Label */}
              <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                isActive 
                  ? 'text-[#ADFF00]' 
                  : isToday
                  ? 'text-white font-black'
                  : 'text-white/40 group-hover:text-white/70'
              }`}>
                {dayName}
              </span>

              {/* Day Number Circle */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center relative transition-all ${
                isActive 
                  ? 'border-2 border-[#ADFF00] text-[#ADFF00] shadow-[0_0_15px_rgba(173,255,0,0.35)] bg-[#1A2619]' 
                  : isToday
                  ? 'border border-white/20 text-white bg-white/5 group-hover:border-white/40'
                  : 'border border-white/5 text-white/50 bg-black/20 group-hover:border-white/20 group-hover:text-white/80'
              }`}>
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ADFF00]" />
                ) : (
                  <span className={`text-xs sm:text-sm leading-none ${
                    isActive || isToday ? 'font-black' : 'font-semibold'
                  }`}>
                    {dayNum}
                  </span>
                )}

                {/* Today tiny indicator badge if not active */}
                {isToday && !isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ADFF00] shadow-[0_0_6px_rgba(173,255,0,0.8)]" />
                )}
              </div>

              {/* Workout Status Indicator Dot */}
              <div className="h-2 flex items-center justify-center">
                {isCompleted ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] shadow-[0_0_6px_rgba(173,255,0,0.8)]" title="Workout Completed" />
                ) : isScheduled ? (
                  <div className="w-1.5 h-1.5 rounded-full border border-[#ADFF00]/50 bg-[#ADFF00]/20" title="Workout Scheduled" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
