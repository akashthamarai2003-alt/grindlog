"use client";

import { useState, useEffect } from "react";
import { ProgressView } from "./progress-view";
import { ProgressSkeleton } from "./progress-skeleton";

export function InstantProgressLoader() {
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("grindlog_progress_snapshot_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.stats || parsed.weightHistory || parsed.chartData)) {
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
        <ProgressView initialData={snapshot} isPro={true} />
      </div>
    );
  }

  return <ProgressSkeleton />;
}
