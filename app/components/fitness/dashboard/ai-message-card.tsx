"use client";

import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AIMessageCard({ premiumLevel = "core" }: { premiumLevel?: string }) {
  if (premiumLevel === "core") {
    return (
      <Link href="/payment?returnTo=/">
        <div className="relative w-full overflow-hidden rounded-[24px] bg-[#121E12] border border-[#1A2619] p-5 flex justify-between items-center group cursor-pointer transition-transform hover:scale-[1.02]">
          <div className="relative z-10 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center shrink-0 border border-[#1A2619]">
              <Brain size={20} className="text-gray-500" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-400 font-black text-sm uppercase tracking-wider mb-1 flex items-center gap-1">
                AI Coach Support
              </h3>
              <p className="text-gray-500 text-[10px] font-semibold leading-snug max-w-[200px]">
                Upgrade to Pro to unlock 24/7 hyper-personalized AI guidance.
              </p>
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            <div className="bg-[#ADFF00] text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(173,255,0,0.2)]">
              Unlock Pro
            </div>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <div className="relative w-full overflow-hidden rounded-[24px] bg-[#ADFF00] p-5 shadow-[0_0_30px_rgba(173,255,0,0.15)] flex justify-between items-center group cursor-pointer transition-transform hover:scale-[1.02]">
      
      {/* Decorative gradient / texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex gap-4 items-center">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0 border border-black/5">
          <Brain size={24} className="text-black" />
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <h3 className="text-black font-black text-sm uppercase tracking-wider mb-1">
            AI Target
          </h3>
          <p className="text-black/80 text-xs font-semibold leading-snug max-w-[200px]">
            Your first goal today: complete your workout and hit your protein target.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 shrink-0">
        <Link href="/workout">
          <button className="bg-black text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-full flex items-center gap-1 shadow-xl hover:bg-gray-900 transition-colors">
            Start <ArrowRight size={12} />
          </button>
        </Link>
      </div>

    </div>
  );
}
