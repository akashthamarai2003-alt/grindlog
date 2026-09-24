"use client";

import { WorkoutSkeleton } from "./workout-skeleton";

/**
 * Clean skeleton placeholder while the server refreshes today's data.
 */
export function WorkoutInstantFallback() {
  return <WorkoutSkeleton />;
}

