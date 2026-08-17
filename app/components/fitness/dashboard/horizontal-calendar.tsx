"use client";

import { useRef, useEffect, useState } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function HorizontalCalendar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  
  const today = new Date();
  const activeDate = dateParam ? parseISO(dateParam) : today;
  
  // Clear the pending state as soon as the URL updates and the new data is loaded
  useEffect(() => {
    setPendingDate(null);
  }, [dateParam]);
  
  // Generate the week based on the currently active date (Sunday to Saturday)
  const weekStart = startOfWeek(activeDate, { weekStartsOn: 0 }); // 0 = Sunday
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Auto-scroll to active if needed
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [dateParam]);

  return (
    <div className="w-full">
      <div 
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((date, idx) => {
          const isActive = date.toDateString() === activeDate.toDateString();
          const dayName = format(date, "EEE"); // "Sun", "Mon"
          const dayNum = format(date, "d");   // "13", "14"
          const dateString = format(date, "yyyy-MM-dd");

          const isPending = pendingDate === dateString;

          return (
            <Link 
              key={idx}
              href={`/fitness?date=${dateString}`}
              scroll={false}
              onClick={() => {
                if (!isActive) setPendingDate(dateString);
              }}
              data-active={isActive}
              className="flex flex-col items-center gap-2 snap-center shrink-0 cursor-pointer group relative"
            >
              <span className={`text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {dayName}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                isActive 
                  ? 'border-[#ADFF00] text-white shadow-[0_0_15px_rgba(173,255,0,0.3)] bg-[#1A2619]' 
                  : 'border-[#1A2619] text-gray-400 bg-[#121E12] group-hover:border-gray-700'
              }`}>
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#ADFF00]" />
                ) : (
                  <span className={`text-sm ${isActive ? 'font-black' : 'font-medium'}`}>{dayNum}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
