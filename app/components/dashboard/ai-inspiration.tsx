"use client";

import { useState, useEffect } from "react";
import { generateMotivationAction } from "@/app/actions/ai";
import { Sparkles, BrainCircuit, Target, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProUpgradeModal } from "@/components/modals/pro-upgrade-modal";

type AiMotivation = {
  quote: string;
  author: string;
  action: string;
  focus: string;
};

// Static fallback for Core users
const STATIC_QUOTE = {
  quote: "Success is the product of daily habits—not once-in-a-lifetime transformations.",
  author: "James Clear",
};

export function AiInspiration({ isPro }: { isPro: boolean }) {
  const [data, setData] = useState<AiMotivation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

    const fetchMotivation = async () => {
      const today = new Date().toISOString().split("T")[0];
      const cacheKey = `grindlog_ai_motivation_${today}`;

      // 1. Check local cache (per day one motivation!)
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setIsLoading(false);
          return;
        } catch (e) {
          // Fall through to fetch if JSON parse fails
        }
      }

      // 2. Fetch fresh from AI
      setIsLoading(true);
      const res = await generateMotivationAction();
      if (res.success && res.motivation) {
        setData(res.motivation);
        // Cache it for the rest of the day
        localStorage.setItem(cacheKey, JSON.stringify(res.motivation));
      }
      setIsLoading(false);
    };

    fetchMotivation();
  }, [isPro]);

  if (!isPro) {
    return (
      <>
        <ProUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Unlock Personal AI Coach"
          description="Get personalized daily tasks, AI routine synthesis, and tailored mindset quotes with GrindLog Pro."
        />
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)] px-1">Inspiration</h2>
          <div className="relative overflow-hidden rounded-[24px] bg-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
            <div className="relative z-10 flex flex-col gap-5">
              <p className="text-[15px] font-medium italic leading-relaxed text-[var(--color-text-primary)]">
                "{STATIC_QUOTE.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[var(--color-accent-green)]/50" />
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {STATIC_QUOTE.author}
                </p>
              </div>

              {/* Teaser for Pro */}
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="mt-2 rounded-xl bg-[var(--color-bg-secondary)] p-4 flex items-center justify-between hover:bg-[var(--color-bg-tertiary)]/50 transition-all text-left cursor-pointer border border-[var(--color-bg-tertiary)] group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
                    <BrainCircuit className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[var(--color-text-primary)] group-hover:text-indigo-500 transition-colors">Unlock AI Coach</span>
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">Personalized daily tasks & coaching</span>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] group-hover:bg-indigo-500/15 transition-colors">
                  <Lock className="h-3.5 w-3.5 text-[var(--color-text-secondary)] group-hover:text-indigo-500 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-1.5">
          <BrainCircuit className="h-5 w-5 text-indigo-500" />
          AI Coach
        </h2>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-500/80">
          <Sparkles className="h-3 w-3" /> PRO
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-500/5 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)] p-6 shadow-sm ring-1 ring-indigo-500/20">
        
        {/* Decorative background glow */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        {isLoading ? (
          <div className="relative z-10 flex flex-col gap-4 animate-pulse">
            <div className="h-16 w-full rounded-xl bg-indigo-500/10" />
            <div className="h-20 w-full rounded-xl bg-purple-500/5 mt-4" />
          </div>
        ) : data ? (
          <div className="relative z-10 flex flex-col gap-6">
            
            {/* Quote Section */}
            <div className="flex flex-col gap-3">
              <p className="text-[15px] font-medium italic leading-relaxed text-[var(--color-text-primary)] relative">
                <span className="absolute -left-2 -top-2 text-4xl text-indigo-500/20">"</span>
                {data.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-indigo-500/50" />
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {data.author}
                </p>
              </div>
            </div>

            {/* AI Task & Focus Section */}
            <div className="flex flex-col gap-3 rounded-[16px] bg-[var(--color-bg-secondary)]/80 p-4 ring-1 ring-[var(--color-bg-tertiary)] backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-500">
                  <Target className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Today's Mission</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)] leading-snug">{data.action}</span>
                </div>
              </div>
              
              <div className="h-[1px] w-full bg-[var(--color-bg-tertiary)]/50" />
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-500">
                  <BrainCircuit className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Your Focus</span>
                  <span className="text-sm font-medium text-[var(--color-text-secondary)] leading-snug">{data.focus}</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-4">
            <p className="text-sm text-[var(--color-text-secondary)]">Couldn't load AI Coach today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
