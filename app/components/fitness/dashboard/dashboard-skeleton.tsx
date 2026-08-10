function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {/* Today Plan */}
      <Skeleton className="h-40 w-full rounded-3xl" />

      {/* Daily Progress Row */}
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>
        ))}
      </div>

      {/* Streak and Transformation Row */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>

      {/* Weekly Progress */}
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  );
}
