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
  | "TRANSITION"
  | "COMPLETE";

export interface AnimationTimeline {
  phase: AnimationPhase;
  scanIndex: number;
  isComplete: boolean;
}

/**
 * The opening sequence is cinematic, but the analysing phase is deliberately
 * unbounded. It keeps rotating through real saved-profile fields until the
 * final plan request has actually returned and passed validation.
 */
export function useAnimationTimeline(
  pillCount: number,
  reducedMotion: boolean,
  isPlanReady: boolean,
): AnimationTimeline {
  const [phase, setPhase] = useState<AnimationPhase>("BOOT");
  const [scanIndex, setScanIndex] = useState(-1);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionStarted = useRef(false);

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
    setPhase("BOOT");
    setScanIndex(-1);

    if (reducedMotion) {
      schedule(() => setPhase("AI_APPEAR"), 120);
      schedule(() => setPhase("ANALYZING"), 300);
      return clearScheduledWork;
    }

    const cycleLength = Math.max(pillCount, 1);
    schedule(() => setPhase("AI_APPEAR"), 250);
    schedule(() => setPhase("DATA_ENTER"), 550);
    schedule(() => setPhase("NETWORK_FULL"), 2100);
    schedule(() => {
      setPhase("ANALYZING");
      setScanIndex(0);
      scanInterval.current = setInterval(() => {
        setScanIndex((current) => (current + 1) % cycleLength);
      }, 1050);
    }, 3800);

    return clearScheduledWork;
  }, [clearScheduledWork, pillCount, reducedMotion, schedule]);

  useEffect(() => {
    if (!isPlanReady || phase !== "ANALYZING" || completionStarted.current) {
      return;
    }

    completionStarted.current = true;
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }

    setScanIndex(-1);
    setPhase("DATA_COLLAPSE");
    schedule(() => setPhase("AI_ALONE"), 1700);
    schedule(() => setPhase("TRANSITION"), 3300);
    schedule(() => setPhase("COMPLETE"), 4050);
  }, [isPlanReady, phase, schedule]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
