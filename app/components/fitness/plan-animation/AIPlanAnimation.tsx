"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Target, User, Weight, Ruler, Calendar, Timer,
  Dumbbell, Activity, TrendingUp, Utensils,
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
  format: (v: any) => string;
}

const PILL_CONFIGS: PillConfig[] = [
  { key: "training_days", field: "training_days_per_week", icon: Calendar, format: (v) => `${v} per week` },
  { key: "duration", field: "workout_duration_minutes", icon: Timer, format: (v) => `${v} min` },
  { key: "activity", field: "activity_level", icon: Activity, format: (v) => String(v) },
  { key: "fitness", field: "fitness_level", icon: TrendingUp, format: (v) => String(v) },
  { key: "height", field: "height", icon: Ruler, format: (v) => `${v} cm` },
  { key: "gender", field: "gender", icon: User, format: (v) => String(v) },
  { key: "food", field: "food_type", icon: Utensils, format: (v) => String(v) },
  { key: "location", field: "training_location", icon: Dumbbell, format: (v) => String(v) },
  { key: "goal", field: "goal", icon: Target, format: (v) => String(v) },
];

const DEFAULT_FALLBACK_PROFILE: ProfileSummary = {
  training_days_per_week: 4,
  workout_duration_minutes: 45,
  activity_level: "Active",
  fitness_level: "Intermediate",
  height: 175,
  weight: 70,
  gender: "Member",
  food_type: "Balanced",
  training_location: "Fitness",
  goal: "Custom Plan",
};

interface AIPlanAnimationProps {
  /** Keep the final state visible until the live plan request settles. */
  isReady?: boolean;
  hasError?: boolean;
  minDurationMs?: number;
  exitMode?: "slide" | "hold";
  onAnimationComplete?: () => void;
}

export default function AIPlanAnimation({
  isReady = false,
  hasError = false,
  minDurationMs = 8_000,
  exitMode = "slide",
  onAnimationComplete,
}: AIPlanAnimationProps) {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Fetch real profile data immediately
  useEffect(() => {
    let active = true;
    fetch("/api/fitness/profile-summary")
      .then((r) => r.json())
      .then((d) => {
        if (active && d.success) setProfile(d.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Dynamically build real user data pills with immediate fallback while loading
  const pills: PillData[] = useMemo(() => {
    const activeData = profile || DEFAULT_FALLBACK_PROFILE;
    return PILL_CONFIGS.filter((c) => {
      const v = activeData[c.field];
      return v !== null && v !== undefined && v !== "";
    }).map((c) => ({
      key: c.key,
      icon: c.icon,
      label: c.format(activeData[c.field]),
    }));
  }, [profile]);

  // Start the timeline from the actual pill count.
  const timeline = useAnimationTimeline(pills.length, reducedMotion, isReady, minDurationMs);

  // In "slide" mode (plan-setup page), slide down when complete to reveal the plan underneath.
  // In "hold" mode (report page), stay full-screen and never reveal the report page before navigating.
  const isTransitioning = exitMode === "slide" && timeline.phase === "COMPLETE";

  useEffect(() => {
    if (timeline.phase !== "COMPLETE" || !onAnimationComplete) return;

    if (exitMode === "slide") {
      const timer = window.setTimeout(onAnimationComplete, 750);
      return () => window.clearTimeout(timer);
    } else {
      onAnimationComplete();
    }
  }, [timeline.phase, onAnimationComplete, exitMode]);

  // Derived states for components
  const isCharVisible = timeline.phase !== "BOOT";
  const isProcessing =
    timeline.phase === "ANALYZING" || timeline.phase === "DATA_COLLAPSE";
  const isComplete =
    timeline.phase === "AI_ALONE" ||
    timeline.phase === "FINAL_REVEAL" ||
    timeline.phase === "TRANSITION" ||
    timeline.phase === "COMPLETE";
  const orbitsActive = timeline.phase !== "BOOT";
  return (
    <motion.div
      className="fixed inset-0 w-screen h-[100dvh] bg-[#061506] overflow-hidden select-none"
      style={{ zIndex: 100 }}
      initial={{ y: "0%" }}
      animate={{
        y: isTransitioning ? "100%" : "0%",
      }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Layer 1: Ambient Background */}
      <AnimatedBackground phase={timeline.phase} />

      {/* Layer 2: Orbit System centered at (50%, 43%) */}
      <OrbitSystem isActive={orbitsActive} isProcessing={isProcessing} />

      {/* Layer 3: Central AI Character at (50%, 43%) */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "38%",
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

      {/* Layer 4: Full Constellation Data Network */}
      {/* Mount the rotation clock immediately; it stays visually empty until
          profile pills arrive, preventing a delayed/stuck first start. */}
      <DataNetwork
        pills={pills}
        phase={timeline.phase}
        scanIndex={timeline.scanIndex}
      />

      {/* Layer 5: Dynamic Bottom Status & Heading Text */}
      <ProcessingStatus
        phase={timeline.phase}
        scanIndex={timeline.scanIndex}
        pillLabels={pills.map((p) => p.label)}
        hasError={hasError}
      />
    </motion.div>
  );
}
