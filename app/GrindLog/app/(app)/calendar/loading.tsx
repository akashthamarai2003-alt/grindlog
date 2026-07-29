import React from "react";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)] px-5 pt-6 pb-24 safe-top animate-pulse">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-[var(--color-bg-tertiary)]" />
        <div className="h-10 w-24 rounded-full bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* Weekdays row */}
      <div className="mb-4 grid grid-cols-7 gap-1 px-2 text-center text-[11px] font-bold">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <span key={day} className="text-[var(--color-text-tertiary)]/50">{day}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="mb-8 grid grid-cols-7 gap-y-2 gap-x-1 px-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <div className="w-[44px] h-[44px] rounded-[14px] bg-[var(--color-bg-tertiary)]/30" />
          </div>
        ))}
      </div>

      {/* Selected date header */}
      <div className="mb-2 h-6 w-40 rounded bg-[var(--color-bg-tertiary)]" />

      {/* Habit Rows Skeleton */}
      <div className="flex-1 overflow-y-auto rounded-3xl bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 mb-2">
            <div className="w-[46px] h-[46px] rounded-[16px] bg-[var(--color-bg-tertiary)] shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)]" />
              <div className="h-3 w-16 rounded bg-[var(--color-bg-tertiary)]" />
            </div>
            <div className="flex items-center gap-2">
               <div className="h-9 w-9 rounded-full bg-[var(--color-bg-tertiary)] shrink-0" />
               <div className="h-9 w-9 rounded-full bg-[var(--color-bg-tertiary)] shrink-0" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
