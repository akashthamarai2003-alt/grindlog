"use client";

import { useState, useEffect } from "react";
import { WorkoutSkeleton } from "./workout-skeleton";
import { WorkoutViewClient, WorkoutViewProps } from "./workout-view-client";

export function InstantWorkoutLoader() {
  const [snapshot, setSnapshot] = useState<WorkoutViewProps | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("grindlog_workout_snapshot_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.effectiveWeekDays || parsed.dateStr)) {
            setSnapshot(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (snapshot) {
    return (
      <div className="relative">
        {/* Subtle native-style syncing top progress bar */}
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[9999] overflow-hidden bg-black/40 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff33] to-[#ADFF00] shadow-[0_0_10px_#ADFF00] animate-pulse w-full" />
        </div>
        <WorkoutViewClient {...snapshot} />
      </div>
    );
  }

  return <WorkoutSkeleton />;
}
