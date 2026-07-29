import React from "react";

export default function HubLoading() {
  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)] animate-pulse">
      
      <div className="mb-6 flex flex-col gap-2">
        <div className="h-8 w-32 rounded-lg bg-[var(--color-bg-tertiary)]" />
        <div className="h-4 w-48 rounded bg-[var(--color-bg-tertiary)]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="w-full relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-bg-tertiary)]" />
            <div className="h-4 w-16 rounded bg-[var(--color-bg-tertiary)]" />
          </div>
        ))}
      </div>
      
    </div>
  );
}
