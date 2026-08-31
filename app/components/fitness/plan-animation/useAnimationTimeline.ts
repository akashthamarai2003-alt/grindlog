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
 * 3.80–9.05  ANALYZING (sequential processing)
 * 9.05–10.80 DATA_COLLAPSE
 * 10.80–13.80 AI_ALONE (Loki atomic reveal)
 * 13.80–14.30 TRANSITION (slide down)
 * 14.30+     COMPLETE
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

    // AI is analyzing... complete one-and-a-half controlled rotations quickly.
    t(() => setPhase("ANALYZING"), 3800);
    
    // Faster rotation completes one-and-a-half turns before collapse.
    const collapseAt = 9050;
    const analyzingDuration = collapseAt - 3800;
    
    for (let i = 0; i < pc; i++) {
      t(() => setScanIndex(i), 3800 + i * (analyzingDuration / pc));
    }

    t(() => { setScanIndex(-1); setPhase("DATA_COLLAPSE"); }, collapseAt);

    // AI alone phase before generating
    // Give time for the sequential one-by-one collapse to finish (9 * 120ms + 500ms = ~1.6s)
    t(() => setPhase("AI_ALONE"), 10800);

    t(() => setPhase("TRANSITION"), 13800);
    t(() => setPhase("COMPLETE"), 14300);

    return () => { refs.current.forEach(clearTimeout); };
  }, [pillCount, reducedMotion, t]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
