"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, Flame, Lock, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { TransformationRoadmapData, WeekMilestone } from "@/types/fitness/roadmap";
import { OnboardingData } from "@/types/fitness/onboarding";

interface TransformationRoadmapCardProps {
  roadmapData: TransformationRoadmapData | null;
  profile: Partial<OnboardingData>;
  premiumLevel?: string;
}

export function TransformationRoadmapCard({
  roadmapData,
  profile,
  premiumLevel = "core",
}: TransformationRoadmapCardProps) {
  // ── Fallback: no plan → show simple weight summary ──
  if (!roadmapData) {
    return <FallbackWeightCard profile={profile} premiumLevel={premiumLevel} />;
  }

  const {
    currentDay,
    currentWeek,
    totalWeeks,
    phaseName,
    phaseDescription,
    startWeight,
    currentWeight,
    targetWeight,
    direction,
    weeks,
    totalWorkoutsCompleted,
    totalWorkoutsScheduled,
    streak,
    consistencyScore,
  } = roadmapData;

  const isFree = premiumLevel === "free";
  const deltaKg = Math.round((currentWeight - startWeight) * 10) / 10;
  const isBulking = direction === "gain";
  const isProgressingTowardGoal =
    (isBulking && deltaKg > 0) || (!isBulking && deltaKg < 0);

  return (
    <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-5 overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#ADFF00]/5 blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
            <Target className="w-4.5 h-4.5 text-[#ADFF00]" />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider text-[#ADFF00] uppercase">
              Your Transformation Roadmap
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Phase: {phaseName}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-black/50 border border-white/10 px-2.5 py-1 text-[10px] font-black text-white tracking-wider uppercase">
          Day {currentDay} / 28
        </span>
      </div>

      {/* ── Phase Description ── */}
      <p className="text-[11px] leading-relaxed text-gray-400 relative z-10">
        {phaseDescription}
      </p>

      {/* ── Weight Summary Row ── */}
      <div className="relative z-10 grid grid-cols-3 gap-2">
        <WeightPill label="Start" value={startWeight} sub="Baseline" />
        <div className="relative rounded-2xl border border-[#ADFF00]/30 bg-[#ADFF00]/5 px-3 py-2.5 text-center">
          <p className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
            Current
          </p>
          <p className="text-lg font-black text-white leading-tight">
            {currentWeight}<span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
          </p>
          {deltaKg !== 0 && (
            <span
              className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                isProgressingTowardGoal
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {deltaKg > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {deltaKg > 0 ? "+" : ""}{deltaKg} kg
            </span>
          )}
        </div>
        <WeightPill label="Target" value={targetWeight} sub="Goal" isTarget />
      </div>

      {/* ── Vertical Timeline ── */}
      <div className="relative z-10 space-y-0">
        {weeks.map((week, index) => {
          const isBlurred = isFree && week.weekNumber >= 3;
          return (
            <div key={week.weekNumber} className={isBlurred ? "blur-[3px] select-none" : ""}>
              <WeekNode
                week={week}
                direction={direction}
                isLast={index === weeks.length - 1}
              />
            </div>
          );
        })}
      </div>

      {/* ── Stats Summary ── */}
      <div className="relative z-10 grid grid-cols-3 gap-2">
        <StatPill
          label="Workouts"
          value={`${totalWorkoutsCompleted}/${totalWorkoutsScheduled}`}
        />
        <StatPill
          label="Streak"
          value={streak > 0 ? `🔥 ${streak}` : "—"}
        />
        <StatPill
          label="Consistency"
          value={`${consistencyScore}%`}
        />
      </div>

      {/* ── CTA ── */}
      <div className="relative z-10">
        {premiumLevel === "pro" ? (
          <Link
            href="/progress"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-bold text-gray-200 hover:bg-white/[0.07] transition-colors"
          >
            View Full Progress & Weight History
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : premiumLevel === "core" ? (
          <Link
            href="/payment?returnTo=/&intent=upgrade_pro"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-bold text-gray-200 hover:bg-white/[0.07] transition-colors"
          >
            Upgrade to unlock AI Progress Tracking
            <span className="text-[9px] bg-black text-amber-400 px-1.5 py-0.5 rounded font-black">
              PRO
            </span>
          </Link>
        ) : (
          <Link
            href="/payment"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-bold text-gray-200 hover:bg-white/[0.07] transition-colors"
          >
            Choose Plan to Unlock Tracking
            <span className="text-[9px] bg-[#ADFF00] text-black px-1.5 py-0.5 rounded font-black">
              UPGRADE
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function WeekNode({
  week,
  direction,
  isLast,
}: {
  week: WeekMilestone;
  direction: string;
  isLast: boolean;
}) {
  const isCompleted = week.status === "completed";
  const isCurrent = week.status === "current";
  const isUpcoming = week.status === "upcoming";

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center w-5 shrink-0">
        {/* Node dot */}
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        ) : isCurrent ? (
          <div className="relative w-5 h-5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#ADFF00]/30 animate-ping" />
            <span className="relative block w-5 h-5 rounded-full bg-[#ADFF00] border-2 border-[#0A1108]" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-white/15 bg-white/5 shrink-0" />
        )}
        {/* Connector line */}
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[24px] ${
              isCompleted
                ? "bg-gradient-to-b from-emerald-500/40 to-emerald-500/10"
                : isCurrent
                  ? "bg-gradient-to-b from-[#ADFF00]/40 to-white/5"
                  : "bg-white/5"
            }`}
          />
        )}
      </div>

      {/* Week content */}
      <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? "text-emerald-400"
                  : isCurrent
                    ? "text-[#ADFF00]"
                    : "text-gray-500"
              }`}
            >
              Week {week.weekNumber}
            </span>
            {isCurrent && (
              <span className="text-[9px] font-bold bg-[#ADFF00]/15 text-[#ADFF00] px-1.5 py-0.5 rounded-full border border-[#ADFF00]/30 uppercase tracking-wider">
                Now
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500">{week.dateRange}</span>
        </div>

        {/* Stats row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {/* Workout completion */}
          <span className={isUpcoming ? "text-gray-600" : "text-gray-300"}>
            {isUpcoming
              ? `${week.workoutsScheduled} workouts`
              : `${week.workoutsCompleted}/${week.workoutsScheduled} workouts`}
          </span>

          {/* Weight info */}
          {week.actualWeight != null && (
            <span className="text-gray-300">
              {week.actualWeight} kg
              {week.weightDelta != null && week.weightDelta !== 0 && (
                <span
                  className={`ml-1 ${
                    (direction === "loss" && week.weightDelta < 0) ||
                    (direction === "gain" && week.weightDelta > 0)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  ({week.weightDelta > 0 ? "+" : ""}
                  {week.weightDelta} kg)
                </span>
              )}
            </span>
          )}

          {isUpcoming && week.projectedWeight != null && (
            <span className="text-gray-600">
              Target: ~{week.projectedWeight} kg
            </span>
          )}

          {isCurrent && week.projectedWeight != null && (
            <span className="text-gray-500">
              Proj: {week.projectedWeight} kg
            </span>
          )}
        </div>

        {/* Milestone badge */}
        {week.milestone && (
          <p
            className={`mt-1.5 text-[11px] font-medium leading-snug ${
              isCompleted
                ? "text-emerald-400/80"
                : isCurrent
                  ? "text-[#ADFF00]/80"
                  : "text-gray-600"
            }`}
          >
            {week.milestone}
          </p>
        )}
      </div>
    </div>
  );
}

function WeightPill({
  label,
  value,
  sub,
  isTarget,
}: {
  label: string;
  value: number;
  sub: string;
  isTarget?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0D150D] px-3 py-2.5 text-center">
      <p className="text-[9px] font-bold tracking-wider text-gray-500 uppercase">
        {label}
      </p>
      <p
        className={`text-lg font-black leading-tight ${
          isTarget ? "text-[#ADFF00]" : "text-white"
        }`}
      >
        {value}
        <span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
      </p>
      <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0D150D] px-3 py-2.5 text-center">
      <p className="text-sm font-black text-white leading-tight">{value}</p>
      <p className="text-[9px] font-bold tracking-wider text-gray-500 uppercase mt-0.5">
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback card when no active plan exists (same as original TransformationCard)
// ─────────────────────────────────────────────────────────────────────────────

function FallbackWeightCard({
  profile,
  premiumLevel,
}: {
  profile: Partial<OnboardingData>;
  premiumLevel?: string;
}) {
  const startWeight = (profile as any).weight_trend_baseline || profile.weight || null;
  const currentWeight = profile.weight || null;
  const targetWeight = profile.target_weight || null;

  const startNum = startWeight != null ? Number(startWeight) : null;
  const currentNum = currentWeight != null ? Number(currentWeight) : null;
  const targetNum = targetWeight != null ? Number(targetWeight) : null;

  const hasWeights =
    startNum != null &&
    currentNum != null &&
    targetNum != null &&
    Number.isFinite(startNum) &&
    Number.isFinite(currentNum) &&
    Number.isFinite(targetNum) &&
    startNum > 0 &&
    targetNum > 0;

  const totalGoal = hasWeights ? Math.abs(startNum - targetNum) : 0;
  const isBulking = hasWeights && targetNum > startNum;
  let progressPercentage = 0;

  if (hasWeights && totalGoal > 0) {
    const progressMade = isBulking ? currentNum - startNum : startNum - currentNum;
    progressPercentage = Math.round(
      Math.min(100, Math.max(0, (Math.max(0, progressMade) / totalGoal) * 100))
    );
  } else if (hasWeights && totalGoal === 0) {
    progressPercentage = 100;
  }

  return (
    <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center">
          <Target className="w-4.5 h-4.5 text-[#ADFF00]" />
        </div>
        <div>
          <p className="text-[10px] font-black tracking-wider text-[#ADFF00] uppercase">
            Your Transformation
          </p>
          <p className="text-[11px] text-gray-400">Goal Tracking</p>
        </div>
      </div>

      {hasWeights && (
        <div className="grid grid-cols-3 gap-2">
          <WeightPill label="Start" value={startNum} sub="Baseline" />
          <WeightPill label="Current" value={currentNum} sub="Now" />
          <WeightPill label="Target" value={targetNum} sub="Goal" isTarget />
        </div>
      )}

      {/* Progress bar */}
      {hasWeights && totalGoal > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ADFF00] to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <Link
        href={premiumLevel === "pro" ? "/progress" : "/payment"}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-bold text-gray-200 hover:bg-white/[0.07] transition-colors"
      >
        {premiumLevel === "pro" ? "View Progress" : "Unlock Tracking"}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
