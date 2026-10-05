export default function PaymentLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white flex flex-col justify-between p-4 sm:p-6 animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="w-full max-w-md mx-auto pt-2 flex items-center justify-between">
        <div className="h-8 w-8 rounded-full bg-white/5" />
        <div className="h-4 w-28 rounded-full bg-white/10" />
        <div className="h-4 w-8" />
      </div>

      {/* Center Body Skeleton */}
      <div className="w-full max-w-md mx-auto my-auto space-y-4 py-6">
        {/* Shimmer Badge */}
        <div className="mx-auto h-6 w-36 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20" />

        {/* Title */}
        <div className="space-y-2 text-center">
          <div className="mx-auto h-7 w-48 rounded-lg bg-white/10" />
          <div className="mx-auto h-4 w-64 rounded-lg bg-white/5" />
        </div>

        {/* Plan Cards Skeleton */}
        <div className="space-y-3 pt-2">
          {/* Pro Card */}
          <div className="p-4 rounded-2xl bg-[#122212] border border-[#ADFF00]/30 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-20 rounded bg-[#ADFF00]/20" />
              <div className="h-6 w-16 rounded bg-[#ADFF00]/30" />
            </div>
            <div className="h-3 w-3/4 rounded bg-white/5" />
          </div>

          {/* Core Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 w-16 rounded bg-white/10" />
              <div className="h-6 w-14 rounded bg-white/10" />
            </div>
            <div className="h-3 w-2/3 rounded bg-white/5" />
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar Skeleton */}
      <div className="w-full max-w-md mx-auto pb-4">
        <div className="h-14 w-full rounded-full bg-[#ADFF00]/20 border border-[#ADFF00]/30 flex items-center justify-center">
          <div className="h-4 w-32 rounded bg-black/40" />
        </div>
      </div>
    </div>
  );
}
