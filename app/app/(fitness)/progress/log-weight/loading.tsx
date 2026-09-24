export default function LogWeightLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-28 animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-1">
            <div className="h-5 w-32 bg-white/10 rounded-lg" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        </div>

        {/* Input Card Skeleton */}
        <div className="bg-[#111A10] border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-16 w-40 mx-auto bg-white/10 rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="h-12 w-full bg-[#ADFF00]/15 rounded-2xl border border-[#ADFF00]/20" />
      </div>
    </div>
  );
}
