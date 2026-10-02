"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Camera,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type {
  TransformationRoadmapData,
  MonthMilestone,
  PhaseBlock,
} from "@/types/fitness/roadmap";
import { OnboardingData } from "@/types/fitness/onboarding";

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

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
  if (!roadmapData) {
    return <FallbackWeightCard profile={profile} premiumLevel={premiumLevel} />;
  }

  const {
    currentDay,
    currentMonth,
    currentWeekInMonth,
    totalMonthsProjected,
    direction,
    startWeight,
    currentWeight,
    targetWeight,
    progressPercentage,
    phases,
    totalWorkoutsCompleted,
    totalWorkoutsScheduled,
    streak,
    consistencyScore,
  } = roadmapData;

  const isFree = premiumLevel === "free";
  const deltaKg = Math.round((currentWeight - startWeight) * 10) / 10;
  const isBulking = direction === "gain";
  const isProgressingTowardGoal =
    (isBulking && deltaKg > 0) || (!isBulking && deltaKg < 0) || direction === "maintain";

  return (
    <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#ADFF00]/5 blur-3xl pointer-events-none" />

      <div className="p-5 space-y-4">
        {/* ── Header ── */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider text-[#ADFF00] uppercase">
                Transformation Roadmap
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {direction === "maintain"
                  ? `${startWeight} kg · Recomposition`
                  : `${startWeight} → ${targetWeight} kg`}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-black/50 border border-white/10 px-2.5 py-1 text-[10px] font-black text-white tracking-wider">
            Day {currentDay}
          </span>
        </div>

        {/* ── Overall Progress Bar ── */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase">
            <span className="text-gray-500">
              Month {currentMonth} of {totalMonthsProjected} · Week {currentWeekInMonth}
            </span>
            <span className="text-[#ADFF00]">{progressPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#ADFF00] to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          {/* Weight delta pill */}
          {deltaKg !== 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isProgressingTowardGoal
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {deltaKg > 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {deltaKg > 0 ? "+" : ""}
                {deltaKg} kg from baseline
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase Timeline ── */}
      <div className="px-5 pb-5 space-y-0">
        {phases.map((phase, phaseIdx) => {
          const isCurrentPhase = phase.status === "current";
          const isUpcomingPhase = phase.status === "upcoming";
          const isBlurred = isFree && phaseIdx >= 1;

          return (
            <div key={phase.phaseNumber} className={isBlurred ? "blur-[3px] select-none" : ""}>
              {/* Phase header bar */}
              <div
                className={`flex items-center gap-2 py-2 ${
                  phaseIdx > 0 ? "mt-2 border-t border-white/5 pt-3" : ""
                }`}
              >
                <div
                  className={`h-px flex-1 ${
                    phase.status === "completed"
                      ? "bg-emerald-500/30"
                      : isCurrentPhase
                        ? "bg-[#ADFF00]/30"
                        : "bg-white/5"
                  }`}
                />
                <span
                  className={`text-[9px] font-black tracking-[0.15em] uppercase px-2 ${
                    phase.status === "completed"
                      ? "text-emerald-500"
                      : isCurrentPhase
                        ? "text-[#ADFF00]"
                        : "text-gray-600"
                  }`}
                >
                  Phase {phase.phaseNumber}: {phase.phaseName}
                </span>
                <div
                  className={`h-px flex-1 ${
                    phase.status === "completed"
                      ? "bg-emerald-500/30"
                      : isCurrentPhase
                        ? "bg-[#ADFF00]/30"
                        : "bg-white/5"
                  }`}
                />
              </div>

              {/* Months — expanded for current/completed, condensed for upcoming */}
              {isCurrentPhase || phase.status === "completed" ? (
                <div className="space-y-0">
                  {phase.months.map((month, mIdx) => (
                    <MonthNode
                      key={month.monthNumber}
                      month={month}
                      direction={direction}
                      currentWeekInMonth={
                        month.status === "current" ? currentWeekInMonth : undefined
                      }
                      isLast={mIdx === phase.months.length - 1}
                    />
                  ))}
                </div>
              ) : (
                /* Condensed upcoming phase */
                <div className="flex items-center gap-3 py-2 pl-1">
                  <div className="w-5 h-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[8px] text-gray-500">
                      {phase.months.length > 1
                        ? `${phase.months[0].monthNumber}–${phase.months[phase.months.length - 1].monthNumber}`
                        : phase.months[0]?.monthNumber}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-500">
                      {phase.months.length === 1
                        ? `Month ${phase.months[0].monthNumber}`
                        : `Months ${phase.months[0].monthNumber}–${phase.months[phase.months.length - 1].monthNumber}`}
                      {" · "}
                      <span className="text-gray-600">{phase.weightRange}</span>
                    </p>
                    {phase.months.some((m) => m.isFinalGoal) && (
                      <p className="text-[10px] text-[#ADFF00]/60 mt-0.5">
                        🎯 Goal target: {targetWeight} kg
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Goal marker (if not already in the last phase) */}
        {progressPercentage >= 100 && (
          <div className="flex items-center gap-3 pt-3 border-t border-[#ADFF00]/20">
            <div className="w-5 h-5 rounded-full bg-[#ADFF00]/20 border border-[#ADFF00]/50 flex items-center justify-center shrink-0">
              <Trophy className="w-3 h-3 text-[#ADFF00]" />
            </div>
            <p className="text-xs font-bold text-[#ADFF00]">
              Goal Achieved! 🎉 — {targetWeight} kg reached
            </p>
          </div>
        )}
      </div>

      {/* ── Stats Summary ── */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <StatPill
            label="Workouts"
            value={`${totalWorkoutsCompleted}/${totalWorkoutsScheduled}`}
          />
          <StatPill label="Streak" value={streak > 0 ? `🔥 ${streak}` : "—"} />
          <StatPill label="Consistency" value={`${consistencyScore}%`} />
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-5 pb-5">
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
            Upgrade for AI Progress Tracking
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
// MonthNode — a single month in the expanded phase timeline
// ─────────────────────────────────────────────────────────────────────────────

function MonthNode({
  month,
  direction,
  currentWeekInMonth,
  isLast,
}: {
  month: MonthMilestone;
  direction: string;
  currentWeekInMonth?: number;
  isLast: boolean;
}) {
  const isCompleted = month.status === "completed";
  const isCurrent = month.status === "current";

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center w-5 shrink-0">
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        ) : isCurrent ? (
          <div className="relative w-5 h-5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#ADFF00]/30 animate-ping" />
            <span className="relative block w-5 h-5 rounded-full bg-[#ADFF00] border-2 border-[#121E12]" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-white/15 bg-white/5 shrink-0" />
        )}
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[20px] ${
              isCompleted
                ? "bg-gradient-to-b from-emerald-500/40 to-emerald-500/10"
                : isCurrent
                  ? "bg-gradient-to-b from-[#ADFF00]/40 to-white/5"
                  : "bg-white/5"
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? "pb-1" : "pb-3"}`}>
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-black uppercase tracking-wider ${
                isCompleted
                  ? "text-emerald-400"
                  : isCurrent
                    ? "text-[#ADFF00]"
                    : "text-gray-500"
              }`}
            >
              Month {month.monthNumber}
            </span>
            <span className={`text-[10px] ${isCompleted ? "text-emerald-400/60" : isCurrent ? "text-[#ADFF00]/60" : "text-gray-600"}`}>
              · {month.phaseName}
            </span>
            {isCurrent && (
              <span className="text-[8px] font-bold bg-[#ADFF00]/15 text-[#ADFF00] px-1.5 py-0.5 rounded-full border border-[#ADFF00]/30 uppercase tracking-wider">
                Wk {currentWeekInMonth}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-600 shrink-0">{month.dateRange}</span>
        </div>

        {/* Stats row */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
          {/* Workout completion */}
          {(isCompleted || isCurrent) && (
            <span className="text-gray-300">
              {month.workoutsCompleted}/{month.workoutsScheduled} workouts
            </span>
          )}

          {/* Weight */}
          {month.actualWeight != null ? (
            <span className="text-gray-300">
              {month.actualWeight} kg
              {month.weightDelta != null && month.weightDelta !== 0 && (
                <span
                  className={`ml-1 ${
                    (direction === "loss" && month.weightDelta < 0) ||
                    (direction === "gain" && month.weightDelta > 0)
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  ({month.weightDelta > 0 ? "+" : ""}
                  {month.weightDelta})
                </span>
              )}
            </span>
          ) : isCurrent ? (
            <span className="text-gray-500">
              Proj: {month.projectedWeight} kg
            </span>
          ) : month.status === "upcoming" ? (
            <span className="text-gray-600">
              Target: ~{month.projectedWeight} kg
            </span>
          ) : null}
        </div>

        {/* Focus area */}
        <p
          className={`mt-1 text-[10px] leading-snug ${
            isCompleted
              ? "text-gray-500"
              : isCurrent
                ? "text-gray-400"
                : "text-gray-600"
          }`}
        >
          {month.focusArea}
        </p>

        {/* Milestone badge */}
        {month.milestone && (
          <p
            className={`mt-1 text-[11px] font-medium ${
              isCompleted
                ? "text-emerald-400/80"
                : isCurrent
                  ? "text-[#ADFF00]/80"
                  : "text-gray-600"
            }`}
          >
            {month.milestone}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────

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
// Fallback when no active plan exists
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
          <Target className="w-4 h-4 text-[#ADFF00]" />
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
          <WeightPill label="Start" value={startNum} />
          <WeightPill label="Current" value={currentNum} />
          <WeightPill label="Target" value={targetNum} isTarget />
        </div>
      )}

      {hasWeights && totalGoal > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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

function WeightPill({
  label,
  value,
  isTarget,
}: {
  label: string;
  value: number;
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
    </div>
  );
}
