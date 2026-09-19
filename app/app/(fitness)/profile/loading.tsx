export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32 animate-pulse">
        {/* User Card Skeleton */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-6 mb-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/10 mb-3 border-2 border-white/10" />
          <div className="h-6 w-36 bg-white/10 rounded-lg mb-1.5" />
          <div className="h-3.5 w-48 bg-white/5 rounded mb-3" />
          <div className="h-6 w-24 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-3.5 flex flex-col items-center text-center space-y-1.5"
            >
              <div className="h-6 w-12 bg-white/10 rounded" />
              <div className="h-2.5 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Menu Cards */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-2 space-y-1 mb-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3.5 flex items-center justify-between rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-white/10 rounded" />
                  <div className="h-2.5 w-40 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-4 h-4 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
