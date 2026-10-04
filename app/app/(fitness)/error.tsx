"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function FitnessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Fitness application error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A1108] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#111A10] border border-white/10 rounded-[28px] p-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} />
        </div>
        <h2 className="text-base font-black tracking-wide text-white uppercase mb-2">
          Something went wrong
        </h2>
        <p className="text-xs text-white/50 leading-relaxed mb-6">
          We encountered an unexpected error. Please reload the page to continue.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 bg-[#ADFF00] hover:bg-[#baff22] text-black font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_15px_rgba(173,255,0,0.2)] cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
          >
            <Home size={14} />
            Reload Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
