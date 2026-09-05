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

    const elapsed = Date.now() - startedAt.current;
    const effectiveMinDuration = minDurationMs ?? MINIMUM_VISIBLE_DURATION_MS;

    const stopScanning = () => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
        scanInterval.current = null;
      }
      setScanIndex(-1);
    };

    const runFullEnding = (collapseDelay: number) => {
      schedule(() => {
        stopScanning();
        setPhase("DATA_COLLAPSE");
      }, collapseDelay);

      schedule(() => {
        setPhase("AI_ALONE");
      }, collapseDelay + 1700);

      schedule(() => {
        setPhase("FINAL_REVEAL");
      }, collapseDelay + 1700 + 1600);

      schedule(() => {
        setPhase("COMPLETE");
      }, collapseDelay + 1700 + 1600 + 1200);
    };

    // Full sequence takes 4500ms (1700ms collapse + 1600ms atomic rings + 1200ms final reveal badge)
    const targetCollapseAt = Math.max(0, effectiveMinDuration - 4500);

    if (elapsed < targetCollapseAt) {
      runFullEnding(targetCollapseAt - elapsed);
      return;
    }

    // Compressed ending if time remaining is shorter than full sequence
    const remaining = Math.max(0, effectiveMinDuration - elapsed);
    if (remaining <= 2400) {
      stopScanning();
      setPhase("DATA_COLLAPSE");
      schedule(() => setPhase("AI_ALONE"), Math.round(remaining * 0.35));
      schedule(() => setPhase("FINAL_REVEAL"), Math.round(remaining * 0.7));
      schedule(() => setPhase("COMPLETE"), remaining);
    } else {
      const collapseDur = Math.round(remaining * 0.38);
      const aloneDur = Math.round(remaining * 0.35);
      schedule(() => {
        stopScanning();
        setPhase("DATA_COLLAPSE");
      }, 0);
      schedule(() => setPhase("AI_ALONE"), collapseDur);
      schedule(() => setPhase("FINAL_REVEAL"), collapseDur + aloneDur);
      schedule(() => setPhase("COMPLETE"), remaining);
    }
  }, [isPlanReady, phase, schedule, minDurationMs]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
