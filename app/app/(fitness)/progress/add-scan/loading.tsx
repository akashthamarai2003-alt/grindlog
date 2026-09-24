export default function AddScanLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-28 animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-1">
            <div className="h-5 w-40 bg-white/10 rounded-lg" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        </div>

        {/* 4 Photo Upload Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-[#111A10] border border-white/5 rounded-3xl" />
          ))}
        </div>

        {/* Upload Action Skeleton */}
        <div className="h-12 w-full bg-[#ADFF00]/15 rounded-2xl border border-[#ADFF00]/20" />
      </div>
    </div>
  );
}
