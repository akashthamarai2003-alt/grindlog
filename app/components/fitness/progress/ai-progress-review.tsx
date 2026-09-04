"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AIProgressReview } from "@/types/fitness/analytics";
import { Bot, CheckCircle2, AlertCircle, Target, Sparkles, Loader2, Dumbbell, Apple, Moon, Clock } from "lucide-react";
import { toast } from "sonner";

function isDateToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export function AIProgressReviewCard({
  initialReview,
  period = "30D",
  onRefresh,
}: {
  initialReview: AIProgressReview | null;
  period?: string;
  onRefresh?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [review, setReview] = useState<AIProgressReview | null>(initialReview);
  const [isGenerating, setIsGenerating] = useState(false);

  // Keep state in sync whenever initialReview prop updates (e.g. on period change)
  useEffect(() => {
    setReview(initialReview);
  }, [initialReview]);

  // Determine whether this user has already used their 1 generation for today
  const isGeneratedToday = useMemo(() => {
    if (review?.canGenerateToday === false) return true;
    return isDateToday(review?.generatedAt);
  }, [review]);

  const generateReview = async (forceRefresh = false) => {
    // Client-side guard: 1 use per day
    if (isGeneratedToday && forceRefresh) {
      toast.info("Daily limit reached (1 review per day). Your next review resets tomorrow.");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading(
      forceRefresh
        ? "Regenerating AI Coach review with Groq..."
        : "Coach AI is analyzing your progress data with Groq..."
    );

    try {
      const now = new Date();
      const clientDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const timezoneOffset = now.getTimezoneOffset();

      const res = await fetch("/api/fitness-ai/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          forceRefresh,
          clientDate,
          timezoneOffset,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.review) {
          setReview(data.review);
        }
        throw new Error(data.error || "Failed to generate AI review");
      }

      setReview(data.review);
      toast.success("AI Progress Review ready!", { id: toastId });

      if (onRefresh) {
        await onRefresh();
      }
      router.refresh();
    } catch (err: any) {
      console.error("AI Review error:", err);
      toast.error(err.message || "Failed to generate review. Please try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  // State 1: No Review Available Yet (Empty State)
  if (!review && !isGenerating) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
            AI Progress Review
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded border border-[#ADFF00]/20 uppercase">
              Groq AI Coach
            </span>
            <span className="text-[9px] font-mono font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
              1 / Day
            </span>
          </div>
        </div>

        <div className="w-full bg-[#111A10] border border-white/5 hover:border-[#ADFF00]/30 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ADFF00]/5 blur-[50px] rounded-full pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] mb-3.5 shadow-sm">
            <Bot className="w-6 h-6 text-[#ADFF00]" />
          </div>

          <h3 className="text-base font-black text-white mb-1.5">
            Coach AI Progress Analysis
          </h3>
          <p className="text-xs font-medium text-white/50 max-w-md mb-5 leading-relaxed">
            Generate an AI-driven synthesis of your workout volume, macronutrient targets, and sleep recovery for this {period} period. Available once per day.
          </p>

          {/* 3 Quick Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-md mb-6 text-left">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <Dumbbell className="w-4 h-4 text-[#ADFF00] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white">Workload & Sets</span>
                <span className="text-[8px] text-white/40">Volume progression</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <Apple className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white">Macro Targets</span>
                <span className="text-[8px] text-white/40">Calories & protein</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white">Sleep & Rest</span>
                <span className="text-[8px] text-white/40">Recovery score</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => generateReview(false)}
            className="flex items-center gap-2 px-6 py-3 bg-[#ADFF00] hover:bg-[#baff22] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#ADFF00]/15 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Today&apos;s Review (1/Day)</span>
          </button>
        </div>
      </div>
    );
  }

  // State 2: Generating Review (Loading State)
  if (isGenerating && !review) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          AI Progress Review
        </h2>
        <div className="w-full bg-[#111A10] border border-[#ADFF00]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg shadow-[#ADFF00]/5">
          <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] mb-4">
            <Loader2 className="w-6 h-6 text-[#ADFF00] animate-spin" />
          </div>
          <h3 className="text-sm font-black tracking-wider text-[#ADFF00] uppercase mb-1">
            Analyzing {period} Data with Groq AI...
          </h3>
          <p className="text-xs font-medium text-white/50 max-w-sm">
            Synthesizing workout volume, macronutrient consistency, daily steps, and sleep recovery...
          </p>
        </div>
      </div>
    );
  }

  // State 3: Active AI Review Display
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          AI Progress Review
        </h2>

        {isGeneratedToday ? (
          /* Locked / Limit Reached Pill for Today */
          <div
            title="You can generate 1 AI review per calendar day. Your next review resets tomorrow."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider select-none cursor-default"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ADFF00]/60" />
            <span>Daily Limit Reached (1/1)</span>
          </div>
        ) : (
          /* Active Button to generate today's review when an older review is displayed */
          <button
            type="button"
            onClick={() => generateReview(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/30 text-[#ADFF00] transition-all text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer active:scale-95 shadow-sm"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#ADFF00]" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#ADFF00]" />
            )}
            <span>{isGenerating ? "Analyzing..." : "Generate Today's Review"}</span>
          </button>
        )}
      </div>

      {/* Review Card */}
      <div className="w-full bg-[#111A10] border border-[#ADFF00]/25 rounded-2xl p-5 shadow-[0_0_25px_rgba(173,255,0,0.03)] relative overflow-hidden flex flex-col gap-4">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#ADFF00]/5 blur-[45px] rounded-full pointer-events-none" />

        {/* Coach Header & Quote Summary */}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#ADFF00]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white">GrindLog Coach AI</span>
                <span className="text-[9px] text-white/40 font-semibold">{period} Holistic Synthesis</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded border border-[#ADFF00]/20 uppercase">
              Groq AI Active
            </span>
          </div>

          <div className="bg-[#0A1108] border-l-2 border-[#ADFF00] border-y border-r border-white/5 rounded-xl p-3.5">
            <p className="text-xs sm:text-[13px] font-medium text-white/90 leading-relaxed italic">
              &quot;{review?.summary}&quot;
            </p>
          </div>
        </div>

        {/* Breakdown Grid: Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          {/* Key Strengths */}
          {review?.strengths && review.strengths.length > 0 && (
            <div className="flex flex-col gap-2 p-3 bg-[#0A1108] border border-white/5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ADFF00] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> What&apos;s Going Well
              </span>
              <div className="flex flex-col gap-1.5">
                {review.strengths.map((str: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                    <span className="text-[#ADFF00] font-bold text-xs mt-0.5">•</span>
                    <span className="text-[11px] font-medium leading-tight">{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas to Improve / Weaknesses */}
          {review?.weaknesses && review.weaknesses.length > 0 && (
            <div className="flex flex-col gap-2 p-3 bg-[#0A1108] border border-white/5 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Focus Areas
              </span>
              <div className="flex flex-col gap-1.5">
                {review.weaknesses.map((weak: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                    <span className="text-amber-400 font-bold text-xs mt-0.5">•</span>
                    <span className="text-[11px] font-medium leading-tight">{weak}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        {review?.recommendations && review.recommendations.length > 0 && (
          <div className="flex flex-col gap-2 p-3 bg-[#0A1108] border border-white/5 rounded-xl relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#ADFF00]" /> Coach Recommendations
            </span>
            <div className="flex flex-col gap-2 pt-1">
              {review.recommendations.map((rec: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-white/90 leading-snug"
                >
                  <span className="w-4 h-4 rounded-full bg-[#ADFF00]/10 text-[#ADFF00] text-[9px] font-mono font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Meta & Rate Limit Resets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[9px] text-white/40 pt-2 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <span>
              {review?.generatedAt
                ? `Generated ${new Date(review.generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : `Active for ${period}`}
            </span>
            {isGeneratedToday ? (
              <span className="text-[#ADFF00]/80 font-semibold flex items-center gap-1">
                • <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-pulse inline-block" /> 1/1 Used (Resets Tomorrow)
              </span>
            ) : (
              <span className="text-amber-400/80 font-medium flex items-center gap-1">
                • <Clock className="w-2.5 h-2.5 inline-block" /> 1 Review Available Today
              </span>
            )}
          </div>
          <span className="uppercase tracking-widest font-mono text-white/30">Groq AI Engine</span>
        </div>
      </div>
    </div>
  );
}

