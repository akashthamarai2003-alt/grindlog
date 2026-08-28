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

    // AI is analyzing... stretch this out for two controlled rotations.
    t(() => setPhase("ANALYZING"), 3800);
    
    // Rotation starts around 550ms, so collapse should happen around 24550ms.
    const analyzingDuration = 24550 - 3800;
    
    for (let i = 0; i < pc; i++) {
      t(() => setScanIndex(i), 3800 + i * (analyzingDuration / pc));
    }

    t(() => { setScanIndex(-1); setPhase("DATA_COLLAPSE"); }, 24550);

    // AI alone phase before generating
    // Give time for the sequential one-by-one collapse to finish (9 * 120ms + 500ms = ~1.6s)
    t(() => setPhase("AI_ALONE"), 26500);

    t(() => setPhase("TRANSITION"), 28500);
    t(() => setPhase("COMPLETE"), 29000);

    return () => { refs.current.forEach(clearTimeout); };
  }, [pillCount, reducedMotion, t]);

  return { phase, scanIndex, isComplete: phase === "COMPLETE" };
}
