"use client";

import { useState, useEffect, useRef } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export interface BodyScanInsightsData {
  overall_summary: string;
  observed_strengths: string[];
  priority_improvements: string[];
  posture_or_movement_note?: string | null;
  goal_gap?: string | null;
}

interface BodyScanInsightsCardProps {
  initialInsights: BodyScanInsightsData | null;
  initialHasBodyScan: boolean;
  initialIsAnalyzing?: boolean;
  goalGap?: string | null;
  isRenew?: boolean;
}

export function BodyScanInsightsCard({
  initialInsights,
  initialHasBodyScan,
  initialIsAnalyzing = false,
  goalGap: initialGoalGap,
  isRenew = false,
}: BodyScanInsightsCardProps) {
  const router = useRouter();
  const [insights, setInsights] = useState<BodyScanInsightsData | null>(initialInsights);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(initialIsAnalyzing && !initialInsights);
  const [pollCount, setPollCount] = useState(0);
  const hasLoadedRef = useRef(Boolean(initialInsights));

  useEffect(() => {
    if (initialInsights) {
      setInsights(initialInsights);
      setIsAnalyzing(false);
      hasLoadedRef.current = true;
    }
  }, [initialInsights]);

  // Polling effect: When analysis is in progress, poll /api/fitness/scan-status every 2.5s
  useEffect(() => {
    if (hasLoadedRef.current || !isAnalyzing) return;

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const checkStatus = async () => {
      try {
        const res = await fetch("/api/fitness/scan-status");
        if (!res.ok) return;
        const data = await res.json();

        if (isCancelled) return;

        if (data.status === "ready" && data.insights) {
          setInsights(data.insights);
          setIsAnalyzing(false);
          hasLoadedRef.current = true;
          router.refresh();
          return;
        }

        if (data.status === "none" && pollCount > 10) {
          // If no scan record exists after multiple checks, stop polling
          setIsAnalyzing(false);
          return;
        }

        // Keep polling up to 15 times (~35 seconds)
        if (pollCount < 15) {
          setPollCount((prev) => prev + 1);
          timeoutId = setTimeout(checkStatus, 2500);
        } else {
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.warn("[BodyScanInsightsCard] Status check notice:", err);
        if (!isCancelled && pollCount < 15) {
          setPollCount((prev) => prev + 1);
          timeoutId = setTimeout(checkStatus, 3000);
        } else {
          setIsAnalyzing(false);
        }
      }
    };

    timeoutId = setTimeout(checkStatus, 2000);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isAnalyzing, pollCount, router]);

  const currentGoalGap = insights?.goal_gap || initialGoalGap;

  return (
    <section className="space-y-4 rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
            {isRenew ? "Month-End Check-In Insights" : initialHasBodyScan ? "Your body scan insights" : "AI Body Analysis"}
          </p>
          <h2 className="text-lg font-black tracking-tight text-white">
            {isRenew ? "Month 2 Physique & Progress Check" : initialHasBodyScan ? "What the uploaded photos show" : "Physique & Biometric Assessment"}
          </h2>
        </div>

        {/* Live Loading Badge */}
        {isAnalyzing && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ADFF00]/40 bg-[#ADFF00]/10 px-2.5 py-1 text-[10px] font-black text-[#ADFF00] tracking-wider uppercase animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ADFF00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ADFF00]"></span>
            </span>
            <span>Analyzing...</span>
          </span>
        )}
      </div>

      {/* STATE 1: Ready Insights (Matches uploaded screenshot) */}
      {insights ? (
        <>
          <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 transition-all">
            <p className="mb-3 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              {isRenew ? "Month 1 Progress Observation" : initialHasBodyScan ? "What I notice" : "Coaching Observations"}
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              {insights.overall_summary || (isRenew ? "Your check-in photos show solid foundation from Month 1 training." : "Your photos provide a useful starting point for coaching.")}
            </p>
            {insights.observed_strengths && insights.observed_strengths.length > 0 && (
              <ul className="mt-3 space-y-2">
                {insights.observed_strengths.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed text-gray-300">
                    <span className="text-[#ADFF00]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {insights.priority_improvements && insights.priority_improvements.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 transition-all">
              <p className="mb-2 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                {isRenew ? "Month 2 Training Priorities" : "Your first priorities"}
              </p>
              <ul className="space-y-2">
                {insights.priority_improvements.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed text-gray-300">
                    <span className="text-[#ADFF00]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.posture_or_movement_note && (
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 transition-all">
              <p className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Posture & alignment observation
              </p>
              <p className="text-sm leading-relaxed text-gray-300">
                {String(insights.posture_or_movement_note)}
              </p>
            </div>
          )}

          {currentGoalGap && (
            <div className="rounded-2xl border border-[#ADFF00]/15 bg-[#ADFF00]/5 p-4 transition-all">
              <p className="mb-1 text-xs font-bold tracking-wider text-[#ADFF00] uppercase">
                Goal direction & gap
              </p>
              <p className="text-sm leading-relaxed text-gray-300">
                {currentGoalGap}
              </p>
            </div>
          )}
        </>
      ) : isAnalyzing ? (
        /* STATE 2: High-Tech Loading Skeleton with Active Vision Scanner */
        <div className="space-y-3.5">
          {/* Active scanning callout banner */}
          <div className="relative overflow-hidden rounded-2xl border border-[#ADFF00]/30 bg-[#0D150D] p-4 shadow-[0_0_20px_rgba(173,255,0,0.06)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[pulse_2s_infinite]" />
            <div className="relative flex items-start gap-3">
              <LoaderCircle className="h-5 w-5 shrink-0 text-[#ADFF00] animate-spin mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                  <span>AI Vision Analysis In Progress</span>
                  <Sparkles size={13} className="text-[#ADFF00]" />
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  Scanning your uploaded front, side, and back photos for posture alignment, frame structure, and muscle distribution...
                </p>
              </div>
            </div>
          </div>

          {/* Skeleton Box 1: What I notice placeholder */}
          <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 space-y-3">
            <div className="h-3 w-28 rounded bg-emerald-500/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-3.5 w-[92%] rounded bg-white/10 animate-pulse" />
              <div className="h-3.5 w-[75%] rounded bg-white/10 animate-pulse" />
            </div>
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ADFF00]/40 shrink-0" />
                <div className="h-3 w-[80%] rounded bg-white/5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ADFF00]/40 shrink-0" />
                <div className="h-3 w-[65%] rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Skeleton Box 2: Your first priorities placeholder */}
          <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4 space-y-2.5">
            <div className="h-3 w-36 rounded bg-[#ADFF00]/20 animate-pulse" />
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ADFF00]/40 shrink-0" />
                <div className="h-3 w-[88%] rounded bg-white/5 animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ADFF00]/40 shrink-0" />
                <div className="h-3 w-[72%] rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* STATE 3: No photos uploaded in onboarding */
        <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-4">
          <p className="text-sm font-bold text-white">Visual coaching feedback</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-400">
            Coaching observations are generated based on your biometric profile and fitness goals.
          </p>
        </div>
      )}

      <p className="text-[11px] text-gray-500">
        {initialHasBodyScan
          ? "Photo observations are coaching guidance only, not a medical diagnosis or body-fat measurement."
          : "Observations are generated from your biometric profile and fitness goals."}
      </p>
    </section>
  );
}
