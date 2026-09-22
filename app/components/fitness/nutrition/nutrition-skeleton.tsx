export function NutritionSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32 animate-pulse">
        {/* Header Skeleton */}
        <div className="w-full flex flex-col pt-2 pb-4">
          <div className="h-8 w-44 bg-white/10 rounded-lg mb-2" />
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="h-4 w-28 bg-white/5 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-28 bg-white/5 rounded-full border border-white/10" />
              <div className="h-8 w-28 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20" />
            </div>
          </div>
        </div>

        {/* Today Summary Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-7 w-32 bg-white/10 rounded-lg" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10" />
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full" />
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
              <div className="h-2.5 w-12 bg-white/5 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
              <div className="h-2.5 w-12 bg-white/5 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
            <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
              <div className="h-2.5 w-12 bg-white/5 rounded" />
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Water Tracker Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-white/5 rounded" />
            <div className="h-5 w-36 bg-white/10 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/5" />
            <div className="w-9 h-9 rounded-xl bg-[#ADFF00]/10" />
          </div>
        </div>

        {/* Meals List Skeleton */}
        <div className="space-y-3">
          {["Breakfast", "Lunch", "Pre-workout", "Dinner"].map((meal) => (
            <div
              key={meal}
              className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-white/10 rounded" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
