export default function LogMeasurementsLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-28 animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-1">
            <div className="h-5 w-44 bg-white/10 rounded-lg" />
            <div className="h-3 w-52 bg-white/5 rounded" />
          </div>
        </div>

        {/* Inputs List Skeleton */}
        <div className="bg-[#111A10] border border-white/5 rounded-3xl p-5 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-9 w-28 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Save Button Skeleton */}
        <div className="h-12 w-full bg-[#ADFF00]/15 rounded-2xl border border-[#ADFF00]/20" />
      </div>
    </div>
  );
}
