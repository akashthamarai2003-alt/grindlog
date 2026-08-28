"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export type AnimationPhase =
  | "BOOT"
  | "AI_APPEAR"
  | "ORBIT_START"
  | "DATA_ENTER"
  | "NETWORK_COMPLETE"
  | "ANALYZING"
  | "DATA_PROCESSED"
  | "NETWORK_COLLAPSE"
  | "AI_COMPLETE"
  | "PLAN_GENERATING"
  | "COMPLETE";

const PHASE_ORDER: AnimationPhase[] = [
  "BOOT",
  "AI_APPEAR",
  "ORBIT_START",
  "DATA_ENTER",
  "NETWORK_COMPLETE",
  "ANALYZING",
  "DATA_PROCESSED",
  "NETWORK_COLLAPSE",
  "AI_COMPLETE",
  "PLAN_GENERATING",
  "COMPLETE",
];

export interface AnimationTimeline {
  phase: AnimationPhase;
  phaseIndex: number;
  /** Index of the pill currently being "scanned" during ANALYZING phase (-1 if not scanning) */
  scanIndex: number;
  isComplete: boolean;
  pillCount: number;
}

/**
 * State machine hook that drives the entire animation sequence.
 * Total duration: ~9 seconds.
 * 
 * @param pillCount - Number of data pills to animate
 * @param reducedMotion - Whether the user prefers reduced motion
 */
export function useAnimationTimeline(
  pillCount: number,
  reducedMotion: boolean
): AnimationTimeline {
  const [phase, setPhase] = useState<AnimationPhase>("BOOT");
  const [scanIndex, setScanIndex] = useState(-1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (reducedMotion) {
      // Reduced motion: skip directly to a minimal sequence
      setPhase("AI_APPEAR");
      scheduleTimeout(() => setPhase("DATA_ENTER"), 300);
      scheduleTimeout(() => setPhase("NETWORK_COMPLETE"), 800);
      scheduleTimeout(() => setPhase("PLAN_GENERATING"), 1500);
      scheduleTimeout(() => setPhase("COMPLETE"), 2000);
      return () => {
        timeoutsRef.current.forEach(clearTimeout);
      };
    }

    // Full animation timeline
    let t = 0;

    // 0.0s - BOOT (already set)
    
    // 0.3s - AI character appears
    t += 300;
    scheduleTimeout(() => setPhase("AI_APPEAR"), t);

    // 0.6s - Orbits start
    t += 300;
    scheduleTimeout(() => setPhase("ORBIT_START"), t);

    // 0.9s - Data pills begin entering
    t += 300;
    scheduleTimeout(() => setPhase("DATA_ENTER"), t);

    // 2.5s - All pills visible, network settles
    // Stagger: pillCount * 150ms + 600ms buffer from DATA_ENTER start
    const dataEnterDuration = pillCount * 150 + 400;
    t += dataEnterDuration;
    scheduleTimeout(() => setPhase("NETWORK_COMPLETE"), t);

    // 3.5s - Begin sequential scanning
    t += 800;
    scheduleTimeout(() => setPhase("ANALYZING"), t);

    // Scan each pill sequentially (~250ms per pill)
    const scanStart = t;
    for (let i = 0; i < pillCount; i++) {
      scheduleTimeout(() => setScanIndex(i), scanStart + i * 280);
    }

    // After all pills scanned
    t = scanStart + pillCount * 280 + 200;
    scheduleTimeout(() => {
      setScanIndex(-1);
      setPhase("DATA_PROCESSED");
    }, t);

    // Network peak hold
    t += 600;

    // Data collapse
    scheduleTimeout(() => setPhase("NETWORK_COLLAPSE"), t);

    // AI complete
    t += 1200;
    scheduleTimeout(() => setPhase("AI_COMPLETE"), t);

    // Plan generating
    t += 800;
    scheduleTimeout(() => setPhase("PLAN_GENERATING"), t);

    // Complete
    t += 1000;
    scheduleTimeout(() => setPhase("COMPLETE"), t);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [pillCount, reducedMotion, scheduleTimeout]);

  const phaseIndex = PHASE_ORDER.indexOf(phase);

  return {
    phase,
    phaseIndex,
    scanIndex,
    isComplete: phase === "COMPLETE",
    pillCount,
  };
}
