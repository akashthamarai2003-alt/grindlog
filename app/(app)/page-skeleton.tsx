import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-6 safe-top">
      
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-[var(--color-bg-tertiary)]" />
          <div className="h-8 w-32 rounded-lg bg-[var(--color-bg-tertiary)]" />
        </div>
        <div className="h-12 w-12 rounded-full bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* Main Card Skeleton */}
      <div className="h-56 w-full rounded-[32px] bg-[var(--color-bg-tertiary)] animate-pulse mt-2" />

      {/* List Skeleton */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex justify-between mb-2 animate-pulse">
           <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)]" />
           <div className="h-5 w-12 rounded bg-[var(--color-bg-tertiary)]" />
        </div>
        
        {/* Skeleton Items */}
        <div className="h-[76px] w-full rounded-[20px] bg-[var(--color-bg-tertiary)] animate-pulse" />
        <div className="h-[76px] w-full rounded-[20px] bg-[var(--color-bg-tertiary)] animate-pulse" />
        <div className="h-[76px] w-full rounded-[20px] bg-[var(--color-bg-tertiary)] animate-pulse" />
        <div className="h-[76px] w-full rounded-[20px] bg-[var(--color-bg-tertiary)] animate-pulse" />
      </div>

      {/* Global Spinner Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
        <div className="bg-[var(--color-bg-elevated)] p-4 rounded-full shadow-[var(--shadow-floating)] animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-green)]" />
        </div>
      </div>
      
    </div>
  );
}
