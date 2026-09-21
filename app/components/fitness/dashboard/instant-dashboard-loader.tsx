"use client";

import { useState, useEffect } from "react";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { FitnessDashboard } from "./fitness-dashboard";

export function InstantDashboardLoader() {
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("grindlog_dashboard_snapshot_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.profile) {
            setSnapshot(parsed);
          }
        }
      } catch {
        // quota or private mode safely ignored
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
        <FitnessDashboard
          user={{ id: snapshot.profile?.user_id || snapshot.profile?.id || "cached-user", email: snapshot.profile?.email } as any}
          profile={snapshot.profile}
          activePlan={snapshot.activePlan}
          todayWorkout={snapshot.todayWorkout}
          weekWorkouts={snapshot.weekWorkouts || []}
          hasPlan={Boolean(snapshot.activePlan)}
          nutrition={snapshot.nutrition}
          lifestyle={snapshot.activePlan?.plan_data?.lifestyle}
          dailyActivity={snapshot.dailyActivity}
          dayNumber={snapshot.dayNumber || 1}
          premiumLevel={snapshot.premiumLevel || "core"}
          targetDateStr={snapshot.targetDateStr}
          subscriptionState={snapshot.subscriptionState}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
      <DashboardSkeleton />
    </div>
  );
}
