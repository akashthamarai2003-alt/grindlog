"use client";

import Link from "next/link";
import { Flame, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { FitnessSubscriptionState } from "@/lib/fitness/subscription/access";

export function RenewalBanner({ state }: { state: FitnessSubscriptionState }) {
  if (!state) return null;

  // 1. Grace Period (0-48h after expiry)
  if (state.isGracePeriod) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#241708] via-[#1a1205] to-[#241708] p-4 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded-full">
                  Grace Period Active
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {state.graceHoursRemaining}h Remaining
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Your previous month has ended. You are in a 48-hour gym grace period. Renew now so workout logging stays active.
              </p>
            </div>
          </div>
          <Link
            href="/payment?intent=renew_monthly&level=pro"
            className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black uppercase tracking-wider text-xs rounded-xl text-center shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Renew Month ⚡</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. Expired (beyond 48h grace)
  if (state.isExpired) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-r from-[#1c0f24] via-[#120817] to-[#1c0f24] p-4 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white px-2 py-0.5 rounded-full">
                  Month Completed
                </span>
                <span className="text-xs font-bold text-purple-300">Read-Only Mode</span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Ready for your next phase? Renew to recalibrate your weight, target calories, and unlock your next progressive workout split.
              </p>
            </div>
          </div>
          <Link
            href="/payment?intent=renew_monthly&level=pro"
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-white font-black uppercase tracking-wider text-xs rounded-xl text-center shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Unlock Next Month ⚡</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Expiring soon (1 to 5 days remaining)
  if (state.daysRemaining > 0 && state.daysRemaining <= 5) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#ADFF00]/40 bg-gradient-to-r from-[#1A2619] via-[#121E12] to-[#1A2619] p-4 shadow-[0_0_20px_rgba(173,255,0,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ADFF00]/20 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] shrink-0 mt-0.5">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#ADFF00] text-black px-2 py-0.5 rounded-full">
                  {state.daysRemaining} {state.daysRemaining === 1 ? "Day" : "Days"} Left
                </span>
                <span className="text-xs font-bold text-[#ADFF00]">Keep Your Streak</span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Renew before your plan expires to stack your remaining days and ensure your next training split is ready without interruption.
              </p>
            </div>
          </div>
          <Link
            href="/payment?intent=renew_monthly&level=pro"
            className="px-4 py-2.5 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black uppercase tracking-wider text-xs rounded-xl text-center shadow-[0_0_15px_rgba(173,255,0,0.3)] shrink-0 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Renew Early ⚡</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
