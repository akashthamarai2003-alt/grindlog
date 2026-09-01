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

// The loading scene is part of the product experience. A quick model response
// must not skip it, but a slow response must never be hidden behind a fake
// countdown either.
const MINIMUM_VISIBLE_DURATION_MS = 13_000;
const EXIT_DURATION_MS = 750;
const FULL_FINALIZATION_DURATION_MS = 4_000;
const AI_ALONE_DELAY_MS = 1_700;

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

    const beginFinalization = (transitionDelay: number) => {
      if (scanInterval.current) {
        clearInterval(scanInterval.current);
        scanInterval.current = null;
      }

      setScanIndex(-1);
      setPhase("DATA_COLLAPSE");

      // When the model finishes during the last few seconds, compress the
      // finalization rather than extending the screen past the 13-second
      // minimum. A late result skips straight to the exit instead.
      if (transitionDelay > 0) {
        schedule(
          () => setPhase("AI_ALONE"),
          Math.min(AI_ALONE_DELAY_MS, Math.round(transitionDelay * 0.55)),
        );
        schedule(() => setPhase("TRANSITION"), transitionDelay);
        schedule(() => setPhase("COMPLETE"), transitionDelay + EXIT_DURATION_MS);
      } else {
        setPhase("TRANSITION");
        schedule(() => setPhase("COMPLETE"), EXIT_DURATION_MS);
      }
    };

    const elapsed = Date.now() - startedAt.current;
    const normalFinalizationStart =
      MINIMUM_VISIBLE_DURATION_MS - FULL_FINALIZATION_DURATION_MS;

    if (elapsed < normalFinalizationStart) {
      // Keep cycling actual onboarding facts until there is enough room to
      // play the full "finalizing" sequence and reveal the plan at 13s.
      schedule(
        () => beginFinalization(FULL_FINALIZATION_DURATION_MS - EXIT_DURATION_MS),
        normalFinalizationStart - elapsed,
      );
      return;
    }

    const remainingBeforeExit =
      MINIMUM_VISIBLE_DURATION_MS - EXIT_DURATION_MS - elapsed;
    beginFinalization(Math.max(0, remainingBeforeExit));
  }, [isPlanReady, phase, schedule]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
