"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
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

// ── Profile shape from the API ──────────────────────────────────
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
  { key: "goal", field: "goal", icon: Target, format: (v) => String(v) },
  { key: "activity", field: "activity_level", icon: Activity, format: (v) => String(v) },
  { key: "training_days", field: "training_days_per_week", icon: Calendar, format: (v) => `${v} per week` },
  { key: "duration", field: "workout_duration_minutes", icon: Timer, format: (v) => `${v} min` },
  { key: "fitness", field: "fitness_level", icon: TrendingUp, format: (v) => String(v) },
  { key: "weight", field: "weight", icon: Weight, format: (v) => `${v} kg` },
  { key: "height", field: "height", icon: Ruler, format: (v) => `${v} cm` },
  { key: "gender", field: "gender", icon: User, format: (v) => String(v) },
  { key: "location", field: "training_location", icon: Dumbbell, format: (v) => String(v) },
  { key: "food", field: "food_type", icon: Utensils, format: (v) => String(v) },
];

// ─────────────────────────────────────────────────────────────────
export default function AIPlanAnimation() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  // Fetch profile data for pills
  useEffect(() => {
    let cancelled = false;
    fetch("/api/fitness/profile-summary")
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.success) setProfile(d.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Build pills from real data
  const pills: PillData[] = useMemo(() => {
    if (!profile) return [];
    return PILL_CONFIGS
      .filter((c) => {
        const v = profile[c.field];
        return v !== null && v !== undefined && v !== "";
      })
      .map((c) => ({
        key: c.key,
        icon: c.icon,
        label: c.format(profile[c.field]),
      }));
  }, [profile]);

  const pillLabels = useMemo(() => pills.map((p) => p.label), [pills]);

  // Timeline state machine
  const timeline = useAnimationTimeline(pills.length || 8, reducedMotion);

  // ── Derived state ──
  const isCharVisible = timeline.phase !== "BOOT";
  const isProcessing =
    timeline.phase === "ANALYZING" || timeline.phase === "DATA_COLLAPSE";
  const isComplete =
    timeline.phase === "AI_ALONE" ||
    timeline.phase === "PLAN_GENERATING" ||
    timeline.phase === "TRANSITION" ||
    timeline.phase === "COMPLETE";
  const orbitsActive = timeline.phase !== "BOOT";
  const isTransitioning =
    timeline.phase === "TRANSITION" || timeline.phase === "COMPLETE";

  return (
    <div className="fixed inset-0 bg-[#061506] overflow-hidden" style={{ zIndex: 50 }}>
      {/* ── SCENE A: Animation ── */}
      <motion.div
        className="absolute inset-0 flex flex-col"
        animate={{
          y: isTransitioning ? "-100%" : "0%",
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Background layers */}
        <AnimatedBackground />

        {/* Animation viewport — constrained to ~62% height */}
        <div
          className="relative flex-1"
          style={{ maxHeight: "65dvh", minHeight: "55dvh" }}
        >
          {/* Orbit system — centered at 40% of viewport */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
            <OrbitSystem isActive={orbitsActive} isProcessing={isProcessing} />
          </div>

          {/* AI Character — centered */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "40%",
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

          {/* Data Network (rotating pills + connection lines) */}
          {pills.length > 0 && (
            <DataNetwork
              pills={pills}
              phase={timeline.phase}
              scanIndex={timeline.scanIndex}
            />
          )}
        </div>

        {/* Text section — below animation viewport */}
        <div className="relative z-20 pb-8 pt-3">
          <ProcessingStatus
            phase={timeline.phase}
            scanIndex={timeline.scanIndex}
            pillLabels={pillLabels}
          />
        </div>
      </motion.div>
    </div>
  );
}
