import { Brain, Sparkles } from "lucide-react";

export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] p-6 pb-28 text-white">
      <div className="mx-auto mt-4 max-w-md space-y-8 animate-pulse">
        {/* Header */}
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-1">
            <Brain size={14} className="text-[#ADFF00] animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-gray-400">
              AI STARTING REPORT
            </span>
          </div>
          <div className="h-9 w-56 rounded-xl bg-[#1A2619]" />
        </div>

        {/* Top 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 space-y-2"
            >
              <div className="h-3 w-16 rounded bg-white/10" />
              <div className="h-7 w-24 rounded-lg bg-white/15" />
            </div>
          ))}
        </div>

        {/* Body Scan Insights Card Loading Skeleton */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-36 rounded bg-[#ADFF00]/20" />
              <div className="h-5 w-48 rounded-lg bg-white/15" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ADFF00]/30 bg-[#ADFF00]/10 px-2.5 py-1 text-[10px] font-bold text-[#ADFF00]">
              <Sparkles size={11} className="animate-spin" />
              <span>Analyzing</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 space-y-2.5">
              <div className="h-3 w-28 rounded bg-emerald-400/20" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-4/5 rounded bg-white/10" />
              <div className="h-4 w-3/5 rounded bg-white/10" />
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 space-y-2.5">
              <div className="h-3 w-32 rounded bg-[#ADFF00]/20" />
              <div className="h-4 w-5/6 rounded bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Personal Numbers Skeleton */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="space-y-1.5">
            <div className="h-3 w-32 rounded bg-[#ADFF00]/20" />
            <div className="h-5 w-44 rounded bg-white/15" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-[#0D150D] px-3.5 py-3 space-y-1.5"
              >
                <div className="h-2.5 w-20 rounded bg-white/10" />
                <div className="h-4 w-16 rounded bg-white/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Reality Check / Phases Skeleton */}
        <div className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5">
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-[#ADFF00]/20" />
            <div className="h-5 w-40 rounded bg-white/15" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 rounded bg-white/15" />
                  <div className="h-4 w-16 rounded-full bg-white/10" />
                </div>
                <div className="h-3 w-3/4 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Score Skeleton */}
        <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-6 flex flex-col items-center justify-center space-y-3">
          <div className="h-16 w-24 rounded-2xl bg-white/15" />
          <div className="h-3 w-36 rounded bg-[#ADFF00]/20" />
        </div>

        {/* Bottom Button Skeleton */}
        <div className="pt-4">
          <div className="h-14 w-full rounded-2xl bg-[#ADFF00]/30" />
        </div>
      </div>
    </div>
  );
}
