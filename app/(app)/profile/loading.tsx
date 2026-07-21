import React from "react";

export default function ProfileLoading() {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)] px-5 pt-6 pb-24 safe-top animate-pulse">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-[var(--color-bg-tertiary)]" />
        <div className="h-10 w-24 rounded-full bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* User Profile Card */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative mb-4 h-24 w-24 rounded-full bg-[var(--color-bg-tertiary)]" />
        <div className="h-6 w-32 rounded bg-[var(--color-bg-tertiary)] mb-2" />
        <div className="h-4 w-24 rounded bg-[var(--color-bg-tertiary)]" />
      </div>

      {/* Settings Groups */}
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((group) => (
          <div key={group} className="overflow-hidden rounded-2xl bg-[var(--color-bg-elevated)] shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
            <div className="flex flex-col divide-y divide-[var(--color-bg-tertiary)]/30">
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-[var(--color-bg-tertiary)]" />
                    <div className="h-5 w-32 rounded bg-[var(--color-bg-tertiary)]" />
                  </div>
                  <div className="h-5 w-10 rounded bg-[var(--color-bg-tertiary)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <div className="mt-8 flex justify-center">
        <div className="h-12 w-full max-w-[200px] rounded-full bg-[var(--color-bg-tertiary)]/50" />
      </div>

    </div>
  );
}
