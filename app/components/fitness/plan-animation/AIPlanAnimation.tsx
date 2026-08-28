"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Target,
  User,
  Weight,
  Ruler,
  Calendar,
  Timer,
  Dumbbell,
  Activity,
  TrendingUp,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AnimatedBackground } from "./AnimatedBackground";
import { AICharacter } from "./AICharacter";
import { OrbitSystem } from "./OrbitSystem";
import DataNetwork, { type PillData } from "./DataNetwork";
import { ProcessingStatus } from "./ProcessingStatus";
import { useAnimationTimeline } from "./useAnimationTimeline";

interface ProfileSummary {
  goal?: string | null;
  gender?: string | null;
  weight?: number | null;
  height?: number | null;
  training_days_per_week?: number | null;
  workout_duration_minutes?: number | null;
  training_location?: string | null;
  activity_level?: string | null;
  fitness_level?: string | null;
  food_type?: string | null;
}

interface PillConfig {
  key: string;
  field: keyof ProfileSummary;
  icon: LucideIcon;
  format: (value: any) => string;
}

const PILL_CONFIGS: PillConfig[] = [
  {
    key: "training_days",
    field: "training_days_per_week",
    icon: Calendar,
    format: (v) => `${v} per week`,
  },
  {
    key: "duration",
    field: "workout_duration_minutes",
    icon: Timer,
    format: (v) => `${v} min`,
  },
  {
    key: "location",
    field: "training_location",
    icon: Dumbbell,
    format: (v) => String(v),
  },
  {
    key: "goal",
    field: "goal",
    icon: Target,
    format: (v) => String(v),
  },
  {
    key: "activity",
    field: "activity_level",
    icon: Activity,
    format: (v) => String(v),
  },
  {
    key: "gender",
    field: "gender",
    icon: User,
    format: (v) => String(v),
  },
  {
    key: "fitness",
    field: "fitness_level",
    icon: TrendingUp,
    format: (v) => String(v),
  },
  {
    key: "weight",
    field: "weight",
    icon: Weight,
    format: (v) => `${v} kg`,
  },
  {
    key: "height",
    field: "height",
    icon: Ruler,
    format: (v) => `${v} cm`,
  },
  {
    key: "food",
    field: "food_type",
    icon: Utensils,
    format: (v) => String(v),
  },
];

export default function AIPlanAnimation() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 375, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Fetch profile data for pills
  useEffect(() => {
    let cancelled = false;
    fetch("/api/fitness/profile-summary")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setProfile(data.data);
        }
      })
      .catch(() => {
        // Silently fail — pills just won't show
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Track container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Build pills from real profile data
  const pills: PillData[] = useMemo(() => {
    if (!profile) return [];
    return PILL_CONFIGS.filter((cfg) => {
      const val = profile[cfg.field];
      return val !== null && val !== undefined && val !== "";
    }).map((cfg) => ({
      key: cfg.key,
      icon: cfg.icon,
      label: cfg.format(profile[cfg.field]),
    }));
  }, [profile]);

  const pillLabels = useMemo(() => pills.map((p) => p.label), [pills]);

  // Animation state machine
  const timeline = useAnimationTimeline(
    pills.length || 10, // fallback count for timing
    reducedMotion
  );

  const isCharVisible =
    timeline.phase !== "BOOT";
  const isProcessing =
    timeline.phase === "ANALYZING" ||
    timeline.phase === "DATA_PROCESSED";
  const isComplete =
    timeline.phase === "AI_COMPLETE" ||
    timeline.phase === "PLAN_GENERATING" ||
    timeline.phase === "COMPLETE";
  const orbitsActive =
    timeline.phase !== "BOOT" && timeline.phase !== "AI_APPEAR";

  return (
    <div className="min-h-[100dvh] bg-[#061506] text-white flex flex-col relative overflow-hidden">
      {/* Animation Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full"
        style={{ minHeight: "62dvh" }}
      >
        {/* Layer 1: Animated Background */}
        <AnimatedBackground />

        {/* Layer 2: Orbit System */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <OrbitSystem
            isActive={orbitsActive}
            isProcessing={isProcessing}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        </div>

        {/* Layer 3: AI Character */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "45%",
            transform: "translate(-50%, -50%)",
            zIndex: 8,
          }}
        >
          <AICharacter
            isVisible={isCharVisible}
            isProcessing={isProcessing}
            isComplete={isComplete}
          />
        </div>

        {/* Layer 4: Data Network (pills + connection lines) */}
        {pills.length > 0 && (
          <DataNetwork
            pills={pills}
            phase={timeline.phase}
            scanIndex={timeline.scanIndex}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        )}

        {/* Scanning radar wave */}
        {(timeline.phase === "ANALYZING" || timeline.phase === "DATA_PROCESSED") && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "45%",
              transform: "translate(-50%, -50%)",
              zIndex: 4,
            }}
          >
            <div
              className="rounded-full border border-[#16A34A]/10"
              style={{
                width: 200,
                height: 200,
                animation: reducedMotion
                  ? "none"
                  : "scanWave 3s ease-out infinite",
              }}
            />
          </div>
        )}
      </div>

      {/* Text Section - below animation area */}
      <div className="relative z-20 px-6 pb-8 pt-4 text-center">
        <ProcessingStatus
          phase={timeline.phase}
          scanIndex={timeline.scanIndex}
          pillLabels={pillLabels}
        />
      </div>

      {/* Global CSS for scan wave */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanWave {
          0% { transform: scale(0.3); opacity: 0.15; }
          100% { transform: scale(3); opacity: 0; }
        }
      ` }} />
    </div>
  );
}
