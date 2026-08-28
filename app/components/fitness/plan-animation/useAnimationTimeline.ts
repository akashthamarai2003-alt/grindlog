"use client";
import { useState, useEffect, useRef, useCallback } from "react";

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
 * 0.00–0.25  BOOT
 * 0.25–0.55  AI_APPEAR
 * 0.55–2.10  DATA_ENTER
 * 2.10–3.80  NETWORK_FULL (continuous rotation)
 * 3.80–5.20  ANALYZING (sequential processing)
 * 5.00–6.70  DATA_COLLAPSE
 * 6.70–8.65  AI_ALONE
 * 8.65–9.25  TRANSITION (slide down)
 * 9.25+      COMPLETE
 */
export function useAnimationTimeline(
  pillCount: number,
  reducedMotion: boolean
): AnimationTimeline {
  const [phase, setPhase] = useState<AnimationPhase>("BOOT");
  const [scanIndex, setScanIndex] = useState(-1);
  const refs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const t = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    refs.current.push(id);
  }, []);

  useEffect(() => {
    refs.current.forEach(clearTimeout);
    refs.current = [];

    if (reducedMotion) {
      setPhase("AI_APPEAR");
      t(() => setPhase("NETWORK_FULL"), 400);
      t(() => setPhase("COMPLETE"), 1200);
      return () => { refs.current.forEach(clearTimeout); };
    }

    const pc = Math.max(pillCount, 1);

    t(() => setPhase("AI_APPEAR"), 250);
    t(() => setPhase("DATA_ENTER"), 550);
    t(() => setPhase("NETWORK_FULL"), 2100);
    t(() => setPhase("ANALYZING"), 3800);

    // Sequential scan
    const scanMs = Math.min(160, 1300 / pc);
    for (let i = 0; i < pc; i++) {
      t(() => setScanIndex(i), 3800 + i * scanMs);
    }

    t(() => { setScanIndex(-1); setPhase("DATA_COLLAPSE"); }, 5000);
    t(() => setPhase("AI_ALONE"), 6700);
    t(() => setPhase("TRANSITION"), 8650);
    t(() => setPhase("COMPLETE"), 9250);

    return () => { refs.current.forEach(clearTimeout); };
  }, [pillCount, reducedMotion, t]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
