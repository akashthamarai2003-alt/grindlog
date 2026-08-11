"use client";

import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AIMessageCard() {
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
        <Link href="/fitness/workout">
          <button className="bg-black text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-full flex items-center gap-1 shadow-xl hover:bg-gray-900 transition-colors">
            Start <ArrowRight size={12} />
          </button>
        </Link>
      </div>

    </div>
  );
}
