function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-300 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44 rounded-xl" />
          <Skeleton className="h-4 w-56 rounded-lg bg-white/5" />
        </div>
        <Skeleton className="h-11 w-11 rounded-2xl border border-white/10" />
      </div>

      {/* Today Plan Card */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded bg-white/5" />
            <Skeleton className="h-6 w-36 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-20 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20" />
        </div>
        <Skeleton className="h-3 w-full rounded-full bg-white/5" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-3 w-24 rounded bg-white/5" />
          <Skeleton className="h-3 w-16 rounded bg-white/5" />
        </div>
      </div>

      {/* Daily Progress Row */}
      <div className="grid grid-cols-4 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-3 flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
            <Skeleton className="h-2.5 w-12 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Streak and Transformation Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-4 space-y-2">
          <Skeleton className="h-3 w-16 rounded bg-white/5" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-2.5 w-24 rounded bg-white/5" />
        </div>
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-4 space-y-2">
          <Skeleton className="h-3 w-16 rounded bg-white/5" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-2.5 w-24 rounded bg-white/5" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-3.5 flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl bg-white/5" />
            <Skeleton className="h-3.5 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Weekly Progress */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-3">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
      </div>
    </div>
  );
}
