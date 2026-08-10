function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

export function WorkoutSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-24 px-5 pt-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Progress */}
      <Skeleton className="h-14 w-full rounded-2xl mt-4" />

      {/* Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}
