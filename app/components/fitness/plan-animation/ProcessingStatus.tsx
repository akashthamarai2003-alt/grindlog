"use client";
import React from "react";
import type { AnimationPhase } from "./useAnimationTimeline";

interface ProcessingStatusProps {
  phase: AnimationPhase;
  scanIndex?: number;
  pillLabels?: string[];
}

/**
 * Clean status component.
 * Per reference specifications, no bottom text occupies the viewport
 * during the main network phases, keeping 100% of the canvas dedicated
 * to the AI and orbital constellation.
 */
export function ProcessingStatus({ phase }: ProcessingStatusProps) {
  // Return null during all constellation and AI phases
  return null;
}
