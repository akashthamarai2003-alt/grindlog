import { ShoppingCart } from "lucide-react";

export default function GroceryLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-36 animate-pulse">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="h-6 w-36 bg-white/10 rounded-lg" />
            <div className="h-3 w-24 bg-white/5 rounded-md" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-white/5" />
            <div className="w-10 h-10 rounded-xl bg-white/5" />
          </div>
        </div>

        {/* Toggle Skeleton */}
        <div className="h-12 bg-[#121E12] border border-[#1A2619] rounded-2xl p-1 mb-4 flex gap-1">
          <div className="flex-1 bg-[#ADFF00]/10 rounded-xl" />
          <div className="flex-1 bg-white/5 rounded-xl" />
        </div>

        {/* Overview Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-1">
              <div className="h-2.5 w-24 bg-white/5 rounded" />
              <div className="h-6 w-28 bg-white/10 rounded" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-2.5 w-20 bg-white/5 rounded ml-auto" />
              <div className="h-6 w-16 bg-white/10 rounded ml-auto" />
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full" />
          <div className="h-3 w-48 bg-white/5 rounded" />
        </div>

        {/* Search & Filter Skeleton */}
        <div className="space-y-2.5 mb-5">
          <div className="h-10 bg-[#121E12] border border-[#1A2619] rounded-xl" />
          <div className="flex gap-1.5 overflow-hidden">
            <div className="h-7 w-16 bg-[#ADFF00]/10 rounded-full" />
            <div className="h-7 w-28 bg-[#121E12] rounded-full" />
            <div className="h-7 w-24 bg-[#121E12] rounded-full" />
            <div className="h-7 w-24 bg-[#121E12] rounded-full" />
          </div>
        </div>

        {/* Items Skeleton */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#121E12] border border-[#1A2619] flex items-start gap-3.5"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-36 bg-white/10 rounded" />
                  <div className="h-4 w-12 bg-white/10 rounded" />
                </div>
                <div className="h-3 w-20 bg-[#ADFF00]/10 rounded" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
