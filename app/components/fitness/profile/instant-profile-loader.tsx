"use client";

import { useState, useEffect } from "react";
import { ProfileContent } from "./profile-content";
import { ProfileSkeleton } from "./profile-skeleton";

export function InstantProfileLoader() {
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("grindlog_profile_snapshot_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.user || parsed.fitnessProfile)) {
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
        <ProfileContent
          user={snapshot.user || { id: "cached-user", email: "" }}
          fitnessProfile={snapshot.fitnessProfile || {}}
          mainProfile={snapshot.mainProfile || {}}
          activePlan={snapshot.activePlan || null}
          subscriptionPlan={snapshot.subscriptionPlan || null}
          aiLimitInfo={snapshot.aiLimitInfo || { allowed: true, limit: 10, used: 0, remaining: 10 }}
        />
      </div>
    );
  }

  return <ProfileSkeleton />;
}
