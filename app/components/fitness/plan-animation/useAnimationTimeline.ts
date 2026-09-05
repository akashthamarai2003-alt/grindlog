"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AnimationPhase =
  | "BOOT"
  | "AI_APPEAR"
  | "DATA_ENTER"
  | "NETWORK_FULL"
  | "ANALYZING"
  | "DATA_COLLAPSE"
  | "AI_ALONE"
  | "FINAL_REVEAL"
  | "TRANSITION"
  | "COMPLETE";

export interface AnimationTimeline {
  phase: AnimationPhase;
  scanIndex: number;
  isComplete: boolean;
}

// The loading scene is part of the product experience. A quick model response
// must not skip it, but a slow response must never be hidden behind a fake
// countdown either.
const MINIMUM_VISIBLE_DURATION_MS = 12_000;
const EXIT_DURATION_MS = 750;

/**
 * The opening sequence is cinematic, but the analysing phase is deliberately
 * unbounded. It keeps rotating through real saved-profile fields until the
 * final plan request has actually returned and passed validation.
 */
export function useAnimationTimeline(
  pillCount: number,
  reducedMotion: boolean,
  isPlanReady: boolean,
  minDurationMs: number = 12_000,
): AnimationTimeline {
  const [phase, setPhase] = useState<AnimationPhase>("BOOT");
  const [scanIndex, setScanIndex] = useState(-1);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionStarted = useRef(false);
  const startedAt = useRef(Date.now());
  const pillCountRef = useRef(Math.max(pillCount, 1));

  useEffect(() => {
    pillCountRef.current = Math.max(pillCount, 1);
  }, [pillCount]);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(callback, delay);
    timeouts.current.push(id);
  }, []);

  const clearScheduledWork = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
  }, []);

  useEffect(() => {
    clearScheduledWork();
    completionStarted.current = false;
    startedAt.current = Date.now();
    setPhase("BOOT");
    setScanIndex(-1);

    if (reducedMotion) {
      schedule(() => setPhase("AI_APPEAR"), 120);
      schedule(() => setPhase("ANALYZING"), 300);
      return clearScheduledWork;
    }

    schedule(() => setPhase("AI_APPEAR"), 250);
    schedule(() => setPhase("DATA_ENTER"), 550);
    schedule(() => setPhase("NETWORK_FULL"), 2100);
    schedule(() => {
      setPhase("ANALYZING");
      setScanIndex(0);
      scanInterval.current = setInterval(() => {
        setScanIndex((current) => (current + 1) % pillCountRef.current);
      }, 1050);
    }, 3800);

    return clearScheduledWork;
  }, [clearScheduledWork, reducedMotion, schedule]);

  useEffect(() => {
    if (!isPlanReady || phase !== "ANALYZING" || completionStarted.current) {
      return;
    }

    completionStarted.current = true;

    const revealFinishedPlan = () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
        scanInterval.current = null;
      }

      setScanIndex(-1);
      setPhase("FINAL_REVEAL");
    };

    const elapsed = Date.now() - startedAt.current;
    // The rotating profile network remains on-screen until the last 750ms.
    // The final reveal then slides that still-rotating scene into the actual
    // plan, so users never see an early static replacement for the rotation.
    const effectiveMinDuration = minDurationMs ?? MINIMUM_VISIBLE_DURATION_MS;
    const earliestRevealAt = Math.max(0, effectiveMinDuration - EXIT_DURATION_MS);

    if (elapsed < earliestRevealAt) {
      schedule(revealFinishedPlan, earliestRevealAt - elapsed);
      return;
    }

    revealFinishedPlan();
  }, [isPlanReady, phase, schedule, minDurationMs]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
