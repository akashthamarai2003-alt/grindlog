"use client";

import { useState, useEffect } from "react";
import { AIProgressReview } from "@/types/fitness/analytics";
import { Bot, CheckCircle2, ChevronRight, Sparkles, XCircle, Loader2 } from "lucide-react";
import { ProgressChatModal } from "./progress-chat-modal";

export function AIProgressReviewCard({ initialReview, period = '30D' }: { initialReview: AIProgressReview | null, period?: string }) {
  const [review, setReview] = useState<AIProgressReview | null>(initialReview);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // If there's no initial review, we can optionally auto-generate or wait for user interaction.
  // For safety and rate limits, we'll wait for user interaction if it's completely missing,
  // or we can auto-generate on mount. Let's provide a button if missing.

  const generateReview = async (forceRefresh = false) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/fitness-ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, forceRefresh })
      });
      const data = await res.json();
      if (data.review) {
        setReview(data.review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!review && !isGenerating) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          AI Progress Review
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center text-center">
          <Bot className="w-10 h-10 text-white/20 mb-3" />
          <p className="text-sm font-bold text-white/60 mb-2">No AI Review Available</p>
          <p className="text-xs font-medium text-white/40 mb-4 px-4">Log more workouts and data to get personalized AI insights.</p>
          <button 
            onClick={() => generateReview(false)}
            className="flex items-center gap-2 px-4 py-2 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-xs uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-all"
          >
            <Sparkles className="w-3 h-3" /> Generate Review
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating && !review) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          AI Progress Review
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#ADFF00] animate-spin mb-4" />
          <p className="text-xs font-bold tracking-widest text-[#ADFF00] uppercase animate-pulse">Analyzing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
        AI Progress Review
      </h2>

      <div className="w-full bg-[#111A10] border border-[#ADFF00]/20 rounded-[24px] p-5 shadow-[0_0_20px_rgba(173,255,0,0.02)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ADFF00]/5 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex items-start gap-3 mb-4 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#ADFF00]/10 flex items-center justify-center shrink-0 border border-[#ADFF00]/20">
            <Bot className="w-5 h-5 text-[#ADFF00]" />
          </div>
          <div className="pt-1">
            <p className="text-[13px] font-medium text-white/90 leading-relaxed">
              &quot;{review?.summary}&quot;
            </p>
          </div>
        </div>

        {review?.strengths && review.strengths.length > 0 && (
          <div className="flex flex-col gap-2 mb-4 relative z-10 pl-13">
            {review.strengths.map((str: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ADFF00] shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium text-white/70">{str}</span>
              </div>
            ))}
          </div>
        )}

        {review?.recommendations && review.recommendations.length > 0 && (
          <div className="flex flex-col gap-2 mb-6 relative z-10 pl-13">
            {review.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]" />
                </div>
                <span className="text-[11px] font-bold text-white/90">{rec}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#ADFF00]/10 rounded-xl border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">Ask AI</span>
          </button>
          <button 
            onClick={() => generateReview(true)}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 text-white/60 animate-spin" />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Refresh</span>
            )}
          </button>
        </div>
      </div>

      <ProgressChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
