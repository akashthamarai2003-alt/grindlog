"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Target, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { OnboardingData } from "@/types/fitness/onboarding";
import styles from "./dashboard.module.css";

interface TransformationCardProps {
  profile: Partial<OnboardingData>;
  premiumLevel?: string;
}

export function TransformationCard({
  profile,
  premiumLevel = "core",
}: TransformationCardProps) {
  const reduceMotion = useReducedMotion();
  const baseline = (
    profile as Partial<OnboardingData> & { weight_trend_baseline?: number }
  ).weight_trend_baseline;
  const startWeight = baseline ?? profile.weight ?? null;
  const currentWeight = profile.weight ?? null;
  const targetWeight = profile.target_weight ?? null;
  const hasWeights =
    typeof startWeight === "number" &&
    typeof currentWeight === "number" &&
    typeof targetWeight === "number";
  const totalGoal = hasWeights ? Math.abs(startWeight - targetWeight) : 0;
  const isBulking = hasWeights && targetWeight > startWeight;
  const deltaKg = hasWeights ? Math.round((currentWeight - startWeight) * 10) / 10 : 0;
  const progressMade = isBulking ? deltaKg : -deltaKg;
  const progressPercentage = hasWeights
    ? totalGoal === 0
      ? 100
      : Math.round(Math.min(100, Math.max(0, (progressMade / totalGoal) * 100)))
    : 0;
  const remainingKg = hasWeights
    ? Math.max(
        0,
        Math.round(
          (isBulking ? targetWeight - currentWeight : currentWeight - targetWeight) * 10,
        ) / 10,
      )
    : 0;
  const DeltaIcon = deltaKg > 0 ? TrendingUp : TrendingDown;

  return (
    <section className={styles.card} aria-labelledby="transformation-title">
      <div className={styles.cardHeading}>
        <div className={styles.headingLabel}>
          <span className={styles.headingIcon}>
            <Target size={16} aria-hidden="true" />
          </span>
          <h2 id="transformation-title" className={styles.eyebrow}>
            Your transformation
          </h2>
        </div>
        <span className={styles.percent}>{progressPercentage}%</span>
      </div>
      <div className={styles.weightHero}>
        <div className={styles.weightValue}>
          {currentWeight ?? "—"}
          <span className={styles.weightUnit}>kg</span>
        </div>
        <p className={styles.weightCaption}>Current weight</p>
        <span
          className={`${styles.weightDelta} ${progressMade <= 0 ? styles.weightDeltaNeutral : ""}`}
        >
          {deltaKg !== 0 && <DeltaIcon size={12} aria-hidden="true" />}
          {deltaKg !== 0
            ? `${deltaKg > 0 ? "+" : ""}${deltaKg} kg since you started`
            : "Your journey, one day at a time"}
        </span>
      </div>
      <div className={styles.milestones}>
        <div className={styles.milestone}>
          <span>Started at</span>
          <strong>{startWeight ?? "—"} kg</strong>
        </div>
        <div className={styles.milestone}>
          <span>Your goal</span>
          <strong>{targetWeight ?? "—"} kg</strong>
        </div>
      </div>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Weight goal progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercentage}
      >
        <motion.div
          className={styles.progressFill}
          initial={false}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
        />
      </div>
      <div className={styles.progressCopy}>
        <strong>
          {!hasWeights
            ? "Set your weight goal"
            : progressPercentage >= 100
              ? "Goal achieved!"
              : `${Math.max(0, progressMade)} kg ${isBulking ? "gained" : "lost"}`}
        </strong>
        <span>{hasWeights ? `${remainingKg} kg to go` : "Track your progress"}</span>
      </div>
      <Link
        href={
          premiumLevel === "core" ? "/payment?returnTo=/&intent=upgrade_pro" : "/progress"
        }
        prefetch
        className={styles.cardLink}
      >
        <span>
          {premiumLevel === "core" ? "Unlock AI progress tracking" : "View your progress"}
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
