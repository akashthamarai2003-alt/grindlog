"use client";

import { useState } from "react";
import { workoutClientCache } from "@/lib/api/workout-cache";
import { WorkoutView } from "./workout-view";
import { WorkoutSkeleton } from "./workout-skeleton";

/**
 * Paint the last known workout screen while the server refreshes today's data.
 * On a first visit there is no safe client data yet, so we keep the skeleton.
 */
export function WorkoutInstantFallback() {
  const [cachedData] = useState(() => workoutClientCache.get());

  return cachedData ? <WorkoutView initialData={cachedData} /> : <WorkoutSkeleton />;
}
