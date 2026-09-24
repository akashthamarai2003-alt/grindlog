"use client";



export function ProgressSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32 animate-pulse">
        {/* Header Skeleton */}
        <div className="w-full flex flex-col pt-2 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-8 w-56 bg-white/10 rounded-lg" />
            <div className="h-6 w-14 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20" />
          </div>
          <div className="h-4 w-64 bg-white/5 rounded mb-4" />

          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#121E12] border border-[#1A2619] p-1 rounded-2xl">
            {["7D", "30D", "3M", "6M", "ALL"].map((p, i) => (
              <div
                key={p}
                className={`flex-1 h-8 rounded-xl ${
                  i === 1 ? "bg-[#ADFF00]/20 border border-[#ADFF00]/30" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 4 Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="w-6 h-6 rounded-lg bg-white/5" />
              </div>
              <div className="h-7 w-24 bg-white/10 rounded-lg" />
              <div className="h-2.5 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-7 w-20 bg-white/5 rounded-full" />
          </div>
          <div className="h-44 w-full bg-white/5 rounded-2xl flex items-end justify-between p-4 gap-2">
            {[40, 60, 55, 75, 70, 85, 80, 95].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 bg-white/10 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Photo Comparison Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-3">
          <div className="h-4 w-36 bg-white/10 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-40 bg-white/5 rounded-2xl border border-white/5" />
            <div className="h-40 bg-white/5 rounded-2xl border border-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgressLoading() {
  return <ProgressSkeleton />;
}

