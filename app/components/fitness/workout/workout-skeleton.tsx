export function WorkoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32 animate-pulse">
        {/* Header Skeleton */}
        <div className="w-full flex flex-col pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-48 bg-white/10 rounded-lg" />
            <div className="h-6 w-16 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20" />
          </div>
          <div className="h-4 w-28 bg-white/5 rounded mb-4" />

          {/* Week Calendar Row Skeleton */}
          <div className="grid grid-cols-7 gap-1.5 bg-[#121E12] border border-[#1A2619] p-2 rounded-2xl mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 py-1.5 rounded-xl bg-white/5"
              >
                <div className="h-2 w-6 bg-white/5 rounded" />
                <div className="h-4 w-4 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Active Workout Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-6 w-40 bg-white/10 rounded-lg" />
            </div>
            <div className="h-10 w-10 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20" />
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full" />
          <div className="h-12 w-full bg-[#ADFF00]/20 rounded-2xl border border-[#ADFF00]/30" />
        </div>

        {/* Exercises List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-3 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-8 w-16 bg-white/5 rounded-xl border border-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
