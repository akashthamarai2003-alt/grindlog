import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6 safe-top bg-[var(--color-bg-primary)] min-h-screen">
      
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-8 w-40 rounded-lg bg-[var(--color-bg-tertiary)]" />
        </div>
        
        {/* Tree Circle Placeholder */}
        <div className="relative flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] shadow-sm">
          <div className="h-[84px] w-[84px] rounded-full bg-[var(--color-bg-tertiary)]" />
        </div>
      </div>

      {/* Level & XP Bar Skeleton */}
      <div className="mt-4 flex flex-col gap-2.5 rounded-[20px] bg-white/50 p-4 shadow-sm ring-1 ring-black/5 animate-pulse">
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-4 w-16 rounded bg-[var(--color-bg-tertiary)]" />
        </div>
        <div className="h-3 w-full rounded-full bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* Gamification Quick Links Skeleton */}
      <div className="flex gap-3 overflow-hidden pb-2 -mx-5 px-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 flex items-center gap-3 rounded-[20px] bg-[var(--color-bg-elevated)] p-3 pr-6 h-16 w-32 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50" />
        ))}
      </div>

      {/* Mini Week Calendar Skeleton */}
      <div className="flex justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-3 w-3 rounded bg-[var(--color-bg-tertiary)]" />
            <div className="h-8 w-8 rounded-full bg-[var(--color-bg-tertiary)]" />
          </div>
        ))}
      </div>

      {/* Today's Habits Skeleton */}
      <div className="flex flex-col gap-4 animate-pulse mt-2">
        <div className="flex items-center justify-between px-1">
          <div className="h-6 w-32 rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-6 w-16 rounded-full bg-[var(--color-bg-tertiary)]" />
        </div>

        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[76px] w-full rounded-[20px] bg-[var(--color-bg-elevated)] shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 flex items-center px-4 gap-4">
               <div className="h-11 w-11 rounded-[14px] bg-[var(--color-bg-tertiary)]" />
               <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-24 rounded bg-[var(--color-bg-tertiary)]" />
                  <div className="h-3 w-16 rounded bg-[var(--color-bg-tertiary)]" />
               </div>
               <div className="h-8 w-8 rounded-full bg-[var(--color-bg-tertiary)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Quote Skeleton */}
      <div className="flex flex-col gap-3 animate-pulse mt-4">
        <div className="h-6 w-24 rounded bg-[var(--color-bg-tertiary)] ml-1" />
        <div className="h-32 w-full rounded-[24px] bg-[var(--color-bg-elevated)] shadow-xl ring-1 ring-white/10" />
      </div>
      
    </div>
  );
}
