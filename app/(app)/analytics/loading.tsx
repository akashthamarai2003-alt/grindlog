import React from "react";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)] px-5 pt-6 pb-24 safe-top animate-pulse">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* Highlights Cards (2x2 Grid) */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-[24px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
            <div className="h-6 w-6 rounded-full bg-[var(--color-bg-tertiary)]" />
            <div className="h-8 w-16 rounded bg-[var(--color-bg-tertiary)]" />
            <div className="h-3 w-24 rounded bg-[var(--color-bg-tertiary)] mt-1" />
          </div>
        ))}
      </div>

      {/* 30-Day Trend Chart Skeleton */}
      <div className="mb-6 rounded-[24px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 flex flex-col gap-4">
        <div className="flex justify-between items-center">
           <div className="h-5 w-24 rounded bg-[var(--color-bg-tertiary)]" />
           <div className="h-5 w-10 rounded bg-[var(--color-bg-tertiary)]" />
        </div>
        <div className="h-40 w-full rounded-lg bg-[var(--color-bg-tertiary)]/50" />
      </div>

      {/* Distribution Chart Skeleton */}
      <div className="mb-6 rounded-[24px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center">
           <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)]" />
        </div>
        <div className="h-32 w-32 rounded-full bg-[var(--color-bg-tertiary)]/50" />
      </div>

    </div>
  );
}
