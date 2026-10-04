"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Flame,
  Calendar,
  Dumbbell,
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type {
  TransformationRoadmapData,
  MonthMilestone,
} from "@/types/fitness/roadmap";
import { OnboardingData } from "@/types/fitness/onboarding";
import { BottomNav } from "@/components/fitness/dashboard/bottom-nav";

interface RoadmapViewProps {
  roadmapData: TransformationRoadmapData | null;
  profile: Partial<OnboardingData>;
  premiumLevel?: string;
  hasPlan?: boolean;
}

export function RoadmapView({
  roadmapData,
  profile,
  premiumLevel = "core",
  hasPlan = true,
}: RoadmapViewProps) {
  const isPro = premiumLevel === "pro";
  const isFree = premiumLevel === "free";

  if (!roadmapData) {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-between">
        <div className="max-w-md mx-auto w-full pt-6 pb-24 px-5">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white">Transformation Roadmap</h1>
              <p className="text-xs text-gray-400">Personalized Goal Projection</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-6 text-center space-y-4 mt-8">
            <div className="w-14 h-14 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center mx-auto text-[#ADFF00]">
              <Target size={28} />
            </div>
            <h2 className="text-lg font-black text-white">Your Roadmap Is Being Prepared</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              Your transformation journey is tied directly to your active workout and nutrition plan.
            </p>
            <div className="pt-2">
              <Link
                href={hasPlan ? "/" : "/plan-setup"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-extrabold text-sm rounded-full transition-transform active:scale-95"
              >
                <span>{hasPlan ? "Go to Dashboard" : "Set Up My Plan"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        <BottomNav isPro={isPro} />
      </div>
    );
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

  const deltaKg = Math.round((currentWeight - startWeight) * 10) / 10;
  const isBulking = direction === "gain";
  const isProgressingTowardGoal =
    (isBulking && deltaKg > 0) || (!isBulking && deltaKg < 0) || direction === "maintain";

  return (
    <div className="min-h-screen bg-[#0A1108] text-white flex flex-col relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="dark-ambient-glow absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60 z-0" />

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 pb-36 px-5 z-10 relative space-y-5">
        {/* ── Top Navigation Bar ── */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#121E12] border border-[#1A2619] flex items-center justify-center group-hover:border-[#ADFF00]/40 transition-colors">
              <ArrowLeft size={16} className="text-gray-300 group-hover:text-[#ADFF00] transition-colors" />
            </div>
            <span>Dashboard</span>
          </Link>

          <span className="shrink-0 rounded-full bg-[#121E12] border border-[#ADFF00]/30 px-3 py-1 text-[11px] font-black text-[#ADFF00] tracking-wider uppercase">
            Day {currentDay}
          </span>
        </div>

        {/* ── Hero Journey Title Card ── */}
        <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#ADFF00]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/25 flex items-center justify-center text-[#ADFF00]">
                <Target size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase">
                  Transformation Roadmap
                </p>
                <h1 className="text-lg font-black text-white mt-0.5">
                  {direction === "maintain"
                    ? "Body Recomposition"
                    : `${startWeight} kg → ${targetWeight} kg`}
                </h1>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-[#ADFF00]">{progressPercentage}%</span>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10 space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase">
              <span className="text-gray-400">
                Month {currentMonth} of {totalMonthsProjected} · Week {currentWeekInMonth}
              </span>
              <span className="text-gray-400">
                {direction === "maintain"
                  ? "Stable Set Point"
                  : isBulking
                  ? `${Math.abs(Math.round((targetWeight - currentWeight) * 10) / 10)} kg to goal`
                  : `${Math.abs(Math.round((currentWeight - targetWeight) * 10) / 10)} kg to goal`}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ADFF00] via-emerald-400 to-[#ADFF00]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(5, progressPercentage)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Weight Delta Banner */}
          <div className="relative z-10 flex items-center justify-between rounded-2xl border border-white/5 bg-[#0D150D] p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">Starting:</span>
              <span className="font-bold text-white">{startWeight} kg</span>
              <span className="text-gray-600">→</span>
              <span className="text-gray-400 font-medium">Current:</span>
              <span className="font-bold text-white">{currentWeight} kg</span>
            </div>
            <div className="flex items-center gap-1 font-bold">
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] ${
                  isProgressingTowardGoal
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                {deltaKg > 0 ? (
                  <TrendingUp className="w-2.5 h-2.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5" />
                )}
                {deltaKg > 0 ? "+" : ""}
                {deltaKg} kg
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-3 text-center">
              <p className="text-xs font-black text-white">{totalWorkoutsCompleted}/{totalWorkoutsScheduled}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Workouts</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-3 text-center">
              <p className="text-xs font-black text-white">{streak > 0 ? `🔥 ${streak} Days` : "—"}</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Streak</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0D150D] p-3 text-center">
              <p className="text-xs font-black text-[#ADFF00]">{consistencyScore}%</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Consistency</p>
            </div>
          </div>
        </div>

        {/* ── Journey Phase Breakdown Timeline ── */}
        <section className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <h2 className="text-sm font-black tracking-wide text-white uppercase">
                Phased Progression Timeline
              </h2>
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              {phases.length} Phases Total
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {phases.map((phase, phaseIdx) => {
              const isCurrentPhase = phase.status === "current";
              const isBlurred = isFree && phaseIdx >= 1;

              return (
                <div key={phase.phaseNumber} className={isBlurred ? "blur-[3px] select-none" : ""}>
                  {/* Phase header */}
                  <div className="flex items-center gap-2 py-2">
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
                      className={`text-[9px] font-black tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full border ${
                        phase.status === "completed"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                          : isCurrentPhase
                          ? "text-[#ADFF00] bg-[#ADFF00]/10 border-[#ADFF00]/30"
                          : "text-gray-500 bg-white/5 border-white/10"
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

                  {/* Expanded months */}
                  {isCurrentPhase || phase.status === "completed" ? (
                    <div className="space-y-0 mt-2">
                      {phase.months.map((month, mIdx) => (
                        <RoadmapMonthRow
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
                    <div className="flex items-center gap-3 py-3 px-3 rounded-2xl border border-white/5 bg-[#0D150D]">
                      <div className="w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-gray-400">
                          {phase.months.length > 1
                            ? `${phase.months[0].monthNumber}–${phase.months[phase.months.length - 1].monthNumber}`
                            : phase.months[0]?.monthNumber}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-300">
                          {phase.months.length === 1
                            ? `Month ${phase.months[0].monthNumber}`
                            : `Months ${phase.months[0].monthNumber}–${phase.months[phase.months.length - 1].monthNumber}`}
                          {" · "}
                          <span className="text-gray-500 font-normal">{phase.weightRange}</span>
                        </p>
                        {phase.months.some((m) => m.isFinalGoal) && (
                          <p className="text-[11px] text-[#ADFF00] font-semibold mt-0.5 flex items-center gap-1">
                            <span>🎯</span> Final Goal Target: {targetWeight} kg
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Goal Completed Trophy */}
          {progressPercentage >= 100 && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#ADFF00]/40 bg-[#ADFF00]/10">
              <div className="w-8 h-8 rounded-full bg-[#ADFF00]/20 border border-[#ADFF00]/50 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[#ADFF00]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#ADFF00]">Goal Achieved! 🎉</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  You have successfully hit your target {targetWeight} kg physique!
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Why 3-Month Mesocycles Card ── */}
        <div className="rounded-3xl border border-white/5 bg-[#121E12] p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ADFF00]">
            <ShieldCheck size={15} />
            <span>Science-Backed Periodization</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            GrindLog automatically periodizes your journey into 3-month mesocycles. At the end of
            Month 3, a photo check-in recalibrates your training volume, exercise selection, and
            metabolic caloric targets so you progress smoothly without hitting plateaus.
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/workout"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(173,255,0,0.2)] transition-transform active:scale-95"
          >
            <Dumbbell size={16} />
            <span>Go to Today's Workout</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#121E12] hover:bg-[#1A2619] border border-white/10 text-gray-300 font-bold text-xs transition-colors"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </main>

      <BottomNav isPro={isPro} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Month Timeline Node
// ─────────────────────────────────────────────────────────────────────────────

function RoadmapMonthRow({
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
      {/* Spine */}
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

      {/* Content Card */}
      <div className={`flex-1 ${isLast ? "pb-1" : "pb-4"}`}>
        <div
          className={`rounded-2xl border p-3.5 transition-all ${
            isCurrent
              ? "border-[#ADFF00]/30 bg-[#ADFF00]/5"
              : isCompleted
              ? "border-emerald-500/20 bg-[#0D150D]"
              : "border-white/5 bg-[#0D150D]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isCompleted
                    ? "text-emerald-400"
                    : isCurrent
                    ? "text-[#ADFF00]"
                    : "text-gray-400"
                }`}
              >
                Month {month.monthNumber}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  isCompleted
                    ? "text-emerald-400/70"
                    : isCurrent
                    ? "text-[#ADFF00]/70"
                    : "text-gray-500"
                }`}
              >
                · {month.phaseName}
              </span>
              {isCurrent && (
                <span className="text-[8px] font-black bg-[#ADFF00] text-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Wk {currentWeekInMonth}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 shrink-0 font-medium">
              {month.dateRange}
            </span>
          </div>

          {/* Stats Row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {(isCompleted || isCurrent) && (
              <span className="text-gray-300 font-semibold">
                {month.workoutsCompleted}/{month.workoutsScheduled} workouts
              </span>
            )}

            {month.actualWeight != null ? (
              <span className="text-white font-bold">
                {month.actualWeight} kg
                {month.weightDelta != null && month.weightDelta !== 0 && (
                  <span
                    className={`ml-1 text-[11px] ${
                      (direction === "loss" && month.weightDelta < 0) ||
                      (direction === "gain" && month.weightDelta > 0)
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    ({month.weightDelta > 0 ? "+" : ""}
                    {month.weightDelta} kg)
                  </span>
                )}
              </span>
            ) : isCurrent ? (
              <span className="text-[#ADFF00] font-bold">
                Proj: {month.projectedWeight} kg
              </span>
            ) : month.status === "upcoming" ? (
              <span className="text-gray-400 font-medium">
                Target: ~{month.projectedWeight} kg
              </span>
            ) : null}
          </div>

          {/* Expected changes description */}
          <p className="mt-1.5 text-xs leading-relaxed text-gray-300">
            {month.focusArea}
          </p>

          {/* Milestone takeaway */}
          {month.milestone && (
            <p
              className={`mt-2 text-xs font-semibold flex items-center gap-1.5 ${
                isCompleted
                  ? "text-emerald-400"
                  : isCurrent
                  ? "text-[#ADFF00]"
                  : "text-gray-400"
              }`}
            >
              <span>{isCompleted ? "✓" : isCurrent ? "📊" : "📸"}</span>
              <span>{month.milestone}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
