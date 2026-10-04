"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Dumbbell,
  Sparkles,
  Trophy,
  ShieldCheck,
  Zap,
  ChevronDown,
  Lock,
  Apple,
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

// ── 60fps Mobile-Optimized Animation Variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 24,
      stiffness: 280,
    },
  },
};

export function RoadmapView({
  roadmapData,
  profile,
  premiumLevel = "core",
  hasPlan = true,
}: RoadmapViewProps) {
  const isPro = premiumLevel === "pro";
  const isFree = premiumLevel === "free";

  // State to track which month node is expanded for deep drill-down
  const [expandedMonth, setExpandedMonth] = useState<number | null>(
    roadmapData?.currentMonth ?? 1
  );

  const toggleMonth = (mNum: number) => {
    setExpandedMonth((prev) => (prev === mNum ? null : mNum));
  };

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

          <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-6 text-center space-y-4 mt-8 shadow-xl">
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
    <div className="min-h-screen bg-[#0A1108] text-white flex flex-col relative overflow-x-hidden selection:bg-[#ADFF00]/20 selection:text-[#ADFF00]">
      {/* Background ambient glow - hardware accelerated */}
      <div className="dark-ambient-glow absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-60 z-0 transform-gpu" />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 pb-44 px-4 sm:px-5 z-10 relative space-y-4"
      >
        {/* ── Top Navigation Bar ── */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-3 transform-gpu will-change-transform"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#121E12] border border-[#1A2619] flex items-center justify-center group-hover:border-[#ADFF00]/40 transition-colors">
              <ArrowLeft size={16} className="text-gray-300 group-hover:text-[#ADFF00] transition-colors" />
            </div>
            <span>Dashboard</span>
          </Link>

          <span className="shrink-0 rounded-full bg-[#121E12] border border-[#ADFF00]/30 px-3 py-1 text-[11px] font-black text-[#ADFF00] tracking-wider uppercase shadow-[0_0_12px_rgba(173,255,0,0.15)]">
            Day {currentDay}
          </span>
        </motion.div>

        {/* ── Hero Journey Title Card ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-4 relative overflow-hidden shadow-2xl transform-gpu will-change-transform"
        >
          <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-[#ADFF00]/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/25 flex items-center justify-center text-[#ADFF00] shadow-[0_0_15px_rgba(173,255,0,0.15)]">
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
                {/* Onboarding Profile Pills */}
                {(() => {
                  const targetPhysique = profile.target_physique || (profile as any).onboarding_data?.target_physique;
                  const trainingLocation = profile.training_location || (profile as any).onboarding_data?.training_location;
                  const fitnessLevel = profile.fitness_level || (profile as any).onboarding_data?.fitness_level;
                  const foodType = profile.food_type || (profile as any).diet_preference || (profile as any).onboarding_data?.food_type;

                  return (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {targetPhysique && (
                        <span className="roadmap-pill text-[9px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          🎯 {targetPhysique}
                        </span>
                      )}
                      {trainingLocation && (
                        <span className="roadmap-pill text-[9px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          📍 {trainingLocation}
                        </span>
                      )}
                      {fitnessLevel && (
                        <span className="roadmap-pill text-[9px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          ⚡ {fitnessLevel}
                        </span>
                      )}
                      {foodType && (
                        <span className="roadmap-pill text-[9px] font-bold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          🥗 {foodType}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-[#ADFF00] drop-shadow-[0_0_8px_rgba(173,255,0,0.3)]">
                {progressPercentage}%
              </span>
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
            <div className="h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/5 relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#ADFF00] via-emerald-400 to-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.4)]"
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
              {deltaKg === 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Starting Baseline
                </span>
              ) : (
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
              )}
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
        </motion.div>

        {/* ── Active Workout Plan Reminder (If User has no plan yet) ── */}
        {!hasPlan && (
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-[#ADFF00]/30 bg-[#ADFF00]/5 p-4 flex items-center justify-between gap-3 transform-gpu will-change-transform"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-[#ADFF00] shrink-0" />
              <div>
                <p className="text-xs font-black text-white">Daily Plan Sync Pending</p>
                <p className="text-[11px] text-gray-400">
                  Generate your custom plan to link real-time workout logging.
                </p>
              </div>
            </div>
            <Link
              href="/plan-setup"
              className="shrink-0 px-3 py-1.5 rounded-full bg-[#ADFF00] text-black text-[11px] font-black hover:bg-[#c4ff33] active:scale-95 transition-transform"
            >
              Setup Plan
            </Link>
          </motion.div>
        )}

        {/* ── Journey Phase Breakdown Timeline ── */}
        <motion.section
          variants={itemVariants}
          className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-5 space-y-4 shadow-xl transform-gpu will-change-transform"
        >
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
              const isLockedPhase = isFree && phaseIdx >= 1;

              return (
                <div key={phase.phaseNumber} className="relative">
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
                  <div className={isLockedPhase ? "blur-[2.5px] select-none pointer-events-none opacity-50" : ""}>
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
                            isExpanded={expandedMonth === month.monthNumber}
                            onToggle={() => toggleMonth(month.monthNumber)}
                            isLast={mIdx === phase.months.length - 1}
                          />
                        ))}
                      </div>
                    ) : (
                      /* Condensed upcoming phase */
                      <div
                        onClick={() => toggleMonth(phase.months[0]?.monthNumber)}
                        className="flex items-center justify-between gap-3 py-3 px-3.5 rounded-2xl border border-white/5 bg-[#0D150D] cursor-pointer hover:border-white/10 active:scale-[0.99] transition-all"
                      >
                        <div className="flex items-center gap-3">
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
                        <ChevronDown size={14} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Free Tier Lock Overlay */}
                  {isLockedPhase && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10 text-center">
                      <div className="w-9 h-9 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] mb-2">
                        <Lock size={16} />
                      </div>
                      <p className="text-xs font-black text-white">Phase {phase.phaseNumber} Locked</p>
                      <p className="text-[10px] text-gray-400 max-w-[220px] mt-0.5">
                        Upgrade to Pro to unlock your complete multi-month periodized progression.
                      </p>
                      <Link
                        href="/pricing"
                        className="mt-2.5 px-4 py-1.5 rounded-full bg-[#ADFF00] text-black text-[11px] font-black hover:bg-[#c4ff33] active:scale-95 transition-transform"
                      >
                        Unlock with Pro
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Goal Completed Trophy */}
          {progressPercentage >= 100 && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-[#ADFF00]/40 bg-[#ADFF00]/10 shadow-[0_0_20px_rgba(173,255,0,0.15)]">
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
        </motion.section>

        {/* ── Why 3-Month Mesocycles Card ── */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/5 bg-[#121E12] p-4 space-y-2 transform-gpu will-change-transform shadow-lg"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-[#ADFF00]">
            <ShieldCheck size={15} />
            <span>Science-Backed Periodization</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            GrindLog automatically periodizes your journey into 3-month mesocycles. At the end of
            each phase, a photo check-in recalibrates your training volume, exercise selection, and
            metabolic caloric targets so you progress smoothly without hitting plateaus.
          </p>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          variants={itemVariants}
          className="space-y-2.5 pt-2 mb-4 transform-gpu will-change-transform"
        >
          <Link
            href="/workout"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(173,255,0,0.25)] transition-transform active:scale-95"
          >
            <Dumbbell size={16} />
            <span>Go to Today's Workout</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#121E12] hover:bg-[#1A2619] border border-white/10 text-gray-300 font-bold text-xs transition-colors active:scale-95"
          >
            <span>Return to Dashboard</span>
          </Link>
        </motion.div>
      </motion.main>

      <BottomNav isPro={isPro} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Month Timeline Node (Smooth 60fps & Tap-to-Expand)
// ─────────────────────────────────────────────────────────────────────────────

function RoadmapMonthRow({
  month,
  direction,
  currentWeekInMonth,
  isExpanded,
  onToggle,
  isLast,
}: {
  month: MonthMilestone;
  direction: string;
  currentWeekInMonth?: number;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const isCompleted = month.status === "completed";
  const isCurrent = month.status === "current";

  return (
    <div className="flex gap-3">
      {/* Spine with Smooth Glowing Radar Node */}
      <div className="flex flex-col items-center w-5 shrink-0 pt-0.5">
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        ) : isCurrent ? (
          <div className="relative w-5 h-5 shrink-0 flex items-center justify-center">
            {/* Smooth 60fps radar ping */}
            <motion.span
              className="absolute inset-0 rounded-full bg-[#ADFF00]/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            />
            <span className="relative block w-3.5 h-3.5 rounded-full bg-[#ADFF00] border-2 border-[#121E12] shadow-[0_0_12px_#ADFF00]" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-white/15 bg-white/5 shrink-0" />
        )}
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-[26px] my-1 ${
              isCompleted
                ? "bg-gradient-to-b from-emerald-500/40 to-emerald-500/10"
                : isCurrent
                ? "bg-gradient-to-b from-[#ADFF00]/40 to-white/5"
                : "bg-white/5"
            }`}
          />
        )}
      </div>

      {/* Content Card with Tap Feedback */}
      <div className={`flex-1 ${isLast ? "pb-1" : "pb-3.5"}`}>
        <motion.div
          whileTap={{ scale: 0.985 }}
          onClick={onToggle}
          className={`rounded-2xl border p-3.5 transition-colors cursor-pointer select-none transform-gpu will-change-transform ${
            isCurrent
              ? "border-[#ADFF00]/30 bg-[#ADFF00]/5 shadow-[0_0_15px_rgba(173,255,0,0.05)]"
              : isCompleted
              ? "border-emerald-500/20 bg-[#0D150D]"
              : "border-white/5 bg-[#0D150D] hover:border-white/10"
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
                className={`text-[11px] font-semibold ${
                  isCompleted
                    ? "text-emerald-400/80"
                    : isCurrent
                    ? "text-[#ADFF00]/80"
                    : "text-gray-400"
                }`}
              >
                · {month.phaseName}
              </span>
              {isCurrent && (
                <span className="text-[8px] font-black bg-[#ADFF00] text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Wk {currentWeekInMonth}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-gray-500 font-medium">
                {month.dateRange}
              </span>
              <ChevronDown
                size={13}
                className={`text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "rotate-180 text-gray-300" : ""
                }`}
              />
            </div>
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

          {/* Primary Focus Area */}
          <p className="mt-1.5 text-xs leading-relaxed text-gray-300">
            {month.focusArea}
          </p>

          {/* Milestone Badge (CLEAN - ZERO DUPLICATE EMOJIS) */}
          {month.milestone && (
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                  isCompleted
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : isCurrent
                    ? "text-[#ADFF00] bg-[#ADFF00]/10 border-[#ADFF00]/25 shadow-[0_0_10px_rgba(173,255,0,0.1)]"
                    : "text-gray-400 bg-white/5 border-white/10"
                }`}
              >
                {month.milestone}
              </span>
            </div>
          )}

          {/* ── Expandable Deep Scientific Drill-Down ── */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden pt-3 mt-3 border-t border-white/5 space-y-2 text-[11px]"
              >
                {month.trainingFocus && (
                  <div className="roadmap-focus-card flex items-start gap-2 rounded-xl bg-black/30 p-2.5 border border-white/5">
                    <Dumbbell className="w-3.5 h-3.5 text-[#ADFF00] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-200">Training Focus</p>
                      <p className="text-gray-400 leading-normal mt-0.5">{month.trainingFocus}</p>
                    </div>
                  </div>
                )}

                {month.nutritionFocus && (
                  <div className="roadmap-focus-card flex items-start gap-2 rounded-xl bg-black/30 p-2.5 border border-white/5">
                    <Apple className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-200">Nutrition Strategy</p>
                      <p className="text-gray-400 leading-normal mt-0.5">{month.nutritionFocus}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
