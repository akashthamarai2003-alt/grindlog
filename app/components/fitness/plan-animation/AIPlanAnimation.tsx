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
  { key: "weight", field: "weight", icon: Weight, format: (v) => `${v} kg` },
  { key: "gender", field: "gender", icon: User, format: (v) => String(v) },
  { key: "food", field: "food_type", icon: Utensils, format: (v) => String(v) },
  { key: "location", field: "training_location", icon: Dumbbell, format: (v) => String(v) },
  { key: "goal", field: "goal", icon: Target, format: (v) => String(v) },
];

interface AIPlanAnimationProps {
  onAnimationComplete?: () => void;
}

export default function AIPlanAnimation({ onAnimationComplete }: AIPlanAnimationProps) {
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

  // Dynamically build real user data pills
  const pills: PillData[] = useMemo(() => {
    if (!profile) return [];
    return PILL_CONFIGS.filter((c) => {
      const v = profile[c.field];
      return v !== null && v !== undefined && v !== "";
    }).map((c) => ({
      key: c.key,
      icon: c.icon,
      label: c.format(profile[c.field]),
    }));
  }, [profile]);

  const timeline = useAnimationTimeline(pills.length || 8, reducedMotion);

  // Trigger completion callback when timeline finishes
  useEffect(() => {
    if (timeline.isComplete && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [timeline.isComplete, onAnimationComplete]);

  // Derived states for components
  const isCharVisible = timeline.phase !== "BOOT";
  const isProcessing =
    timeline.phase === "ANALYZING" || timeline.phase === "DATA_COLLAPSE";
  const isComplete =
    timeline.phase === "AI_ALONE" ||
    timeline.phase === "TRANSITION" ||
    timeline.phase === "COMPLETE";
  const orbitsActive = timeline.phase !== "BOOT";
  const isTransitioning =
    timeline.phase === "TRANSITION" || timeline.phase === "COMPLETE";

  return (
    <motion.div
      className="fixed inset-0 w-screen h-[100dvh] bg-[#061506] overflow-hidden select-none"
      style={{ zIndex: 50 }}
      initial={{ y: "0%" }}
      animate={{
        // Critical Rule #20 & AE: Slide DOWNWARD (translateY(0) -> translateY(100%))
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
          top: "43%",
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
      {pills.length > 0 && (
        <DataNetwork
          pills={pills}
          phase={timeline.phase}
          scanIndex={timeline.scanIndex}
        />
      )}

      {/* Layer 5: Dynamic Bottom Status & Heading Text */}
      <ProcessingStatus
        phase={timeline.phase}
        scanIndex={timeline.scanIndex}
        pillLabels={pills.map((p) => p.label)}
      />
    </motion.div>
  );
}
