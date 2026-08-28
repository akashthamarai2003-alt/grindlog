"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export type AnimationPhase =
  | "BOOT"
  | "AI_APPEAR"
  | "DATA_ENTER"
  | "NETWORK_ROTATE"
  | "ANALYZING"
  | "DATA_COLLAPSE"
  | "AI_ALONE"
  | "PLAN_GENERATING"
  | "TRANSITION"
  | "COMPLETE";

export interface AnimationTimeline {
  phase: AnimationPhase;
  scanIndex: number;
  isComplete: boolean;
}

/**
 * State machine matching the reference animation timeline:
 *
 * 0.00–0.25s   BOOT (dark screen)
 * 0.20–0.50s   AI_APPEAR (character fades in)
 * 0.35–1.80s   DATA_ENTER (pills fly in from outside)
 * 1.80–4.00s   NETWORK_ROTATE (full constellation + slow rotation)
 * 3.50–5.00s   ANALYZING (sequential processing/highlighting)
 * 5.00–6.30s   DATA_COLLAPSE (pills collapse into AI)
 * 6.30–8.50s   AI_ALONE (AI core breathing, orbit continues)
 * 8.50–8.80s   PLAN_GENERATING (status text updates)
 * 8.80–9.20s   TRANSITION (vertical scene slide)
 * 9.20s+       COMPLETE
 */
export function useAnimationTimeline(
  pillCount: number,
  reducedMotion: boolean
): AnimationTimeline {
  const [phase, setPhase] = useState<AnimationPhase>("BOOT");
  const [scanIndex, setScanIndex] = useState(-1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (reducedMotion) {
      setPhase("AI_APPEAR");
      schedule(() => setPhase("DATA_ENTER"), 200);
      schedule(() => setPhase("NETWORK_ROTATE"), 600);
      schedule(() => setPhase("COMPLETE"), 1500);
      return () => { timeoutsRef.current.forEach(clearTimeout); };
    }

    // ── Reference timeline ──

    // 0.00s BOOT
    // 0.25s AI appears
    schedule(() => setPhase("AI_APPEAR"), 250);

    // 0.40s Data pills start entering
    schedule(() => setPhase("DATA_ENTER"), 400);

    // 1.80s Full constellation formed, continuous rotation
    schedule(() => setPhase("NETWORK_ROTATE"), 1800);

    // 3.50s Sequential processing begins
    schedule(() => setPhase("ANALYZING"), 3500);

    // Sequential scan per pill (~170ms each)
    const scanStart = 3500;
    const scanInterval = Math.min(170, 1200 / Math.max(pillCount, 1));
    for (let i = 0; i < pillCount; i++) {
      schedule(() => setScanIndex(i), scanStart + i * scanInterval);
    }

    // 5.00s Collapse begins
    schedule(() => {
      setScanIndex(-1);
      setPhase("DATA_COLLAPSE");
    }, 5000);

    // 6.30s AI alone
    schedule(() => setPhase("AI_ALONE"), 6300);

    // 8.50s Plan generating text
    schedule(() => setPhase("PLAN_GENERATING"), 8500);

    // 8.80s Vertical transition
    schedule(() => setPhase("TRANSITION"), 8800);

    // 9.30s Complete
    schedule(() => setPhase("COMPLETE"), 9300);

    return () => { timeoutsRef.current.forEach(clearTimeout); };
  }, [pillCount, reducedMotion, schedule]);

  return {
    phase,
    scanIndex,
    isComplete: phase === "COMPLETE",
  };
}
