"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Calendar,
  Activity,
  Zap,
  ShieldCheck,
  Flame,
  ShoppingCart,
  User,
  Brain,
  TrendingDown,
  Dumbbell,
  Sparkles,
  Apple,
} from "lucide-react";
import confetti from "canvas-confetti";
import { OnboardingData } from "@/types/fitness/onboarding";

interface RoadmapIntroAnimationProps {
  profile: Partial<OnboardingData>;
  plan?: any;
  premiumLevel?: string;
  onComplete: () => void;
}

export function RoadmapIntroAnimation({
  profile,
  plan,
  premiumLevel = "core",
  onComplete,
}: RoadmapIntroAnimationProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Auto-advance from timeline animation (step 1) to plan ready (step 2) after 6.5 seconds
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Dual celebration confetti cannon burst when Step 2 mounts
  useEffect(() => {
    if (step === 2) {
      try {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.12, y: 0.72 },
          colors: ["#ADFF00", "#FFFFFF", "#10B981"],
          disableForReducedMotion: true,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.88, y: 0.72 },
          colors: ["#ADFF00", "#FFFFFF", "#10B981"],
          disableForReducedMotion: true,
        });
        const midBurst = setTimeout(() => {
          confetti({
            particleCount: 40,
            spread: 90,
            origin: { x: 0.5, y: 0.45 },
            colors: ["#ADFF00", "#39FF14", "#FFFFFF"],
            disableForReducedMotion: true,
          });
        }, 380);
        return () => clearTimeout(midBurst);
      } catch {
        // safe ignore if canvas-confetti fails
      }
    }
  }, [step]);

  const currentWeight = profile?.weight ? `${profile.weight}` : "--";
  const targetWeight = profile?.target_weight ? `${profile.target_weight}` : "--";
  const planData = plan?.plan_data || {};
  const workoutsPerWeek = Array.isArray(planData?.workouts) ? planData.workouts.length : null;
  const nutritionTarget = planData?.nutrition;
  const lifestyleTarget = planData?.lifestyle;

  const isPro = premiumLevel === "pro";

  const deadlineDays = Number(profile?.target_deadline_days) > 0 ? Number(profile?.target_deadline_days) : null;
  const deadlineWeeks = deadlineDays ? Math.max(1, Math.ceil(deadlineDays / 7)) : null;
  const milestoneWeeks = deadlineWeeks
    ? Array.from(
        new Set(
          Array.from({ length: Math.min(8, deadlineWeeks) }, (_, index) =>
            Math.max(1, Math.round(1 + (index * (deadlineWeeks - 1)) / Math.max(1, Math.min(8, deadlineWeeks) - 1)))
          )
        )
      )
    : [1, 2, 3, 4, 5, 6, 7, 8];

  // High-tech categorized feature matrix for Step 2
  const protocolFeatures = [
    {
      icon: Target,
      tag: "WORKOUT",
      title: "Workout Strategy",
      detail: "Progressive Overload",
    },
    {
      icon: Dumbbell,
      tag: "EXERCISES",
      title: "Sets, Reps & Form",
      detail: "Execution Cues",
    },
    {
      icon: Flame,
      tag: "NUTRITION",
      title: "Target Calories",
      detail: "Protein & Macros",
    },
    {
      icon: User,
      tag: "PHYSIQUE",
      title: "Goal & Routine",
      detail: "Schedule Synced",
    },
    ...(isPro
      ? [
          {
            icon: Apple,
            tag: "DIET PLAN",
            title: "Custom Meals",
            detail: "Diet Preferences",
          },
          {
            icon: ShoppingCart,
            tag: "GROCERY",
            title: "Grocery Strategy",
            detail: "Budget Sourced",
          },
          {
            icon: Activity,
            tag: "TRACKING",
            title: "Auto Progress",
            detail: "Visual Roadmap",
          },
          {
            icon: Brain,
            tag: "COACHING",
            title: "24/7 AI Coach",
            detail: "Dynamic Advice",
          },
        ]
      : []),
  ];

  const handleStart = () => {
    try {
      sessionStorage.removeItem("fitness_new_plan_locked");
    } catch {
      // safe ignore in restricted storage
    }
    onComplete();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.045,
        delayChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 24,
        stiffness: 300,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080E07] text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto selection:bg-[#ADFF00]/20 selection:text-[#ADFF00]">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full bg-[#ADFF00]/12 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-28 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full bg-[#10B981]/12 blur-[110px]"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* Step 1: Roadmap Timeline Progression */
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.5 }}
            className="min-h-[100dvh] flex flex-col justify-between max-w-md mx-auto w-full px-4 py-5 sm:px-6 sm:py-7 relative z-10"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center pt-1 mb-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121E12] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#ADFF00] mb-2 shadow-[0_0_15px_rgba(173,255,0,0.15)]">
                <Target size={12} /> Transformation Roadmap
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">The Journey Ahead</h1>
              <p className="text-gray-400 mt-1 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
                Building progressive overload & sustainable habits over your 8-week block.
              </p>
            </motion.div>

            {/* Timeline Vertical Path */}
            <div className="relative flex justify-center max-w-sm mx-auto w-full py-3 my-auto">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1A2619]" />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 4.8, ease: "linear" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#ADFF00] shadow-[0_0_12px_#ADFF00]"
              />

              <div className="w-full flex flex-col justify-between relative py-1">
                {/* START Node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <div className="bg-[#ADFF00] text-black text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-1.5 shadow-[0_0_12px_rgba(173,255,0,0.4)]">
                    Start
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#ADFF00] shadow-[0_0_15px_#ADFF00] border-2 border-black" />
                  <span className="text-white font-black mt-1 text-xs">{currentWeight} kg</span>
                </motion.div>

                {/* Weeks Grid */}
                <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 my-3 sm:my-5 z-10 relative">
                  {milestoneWeeks.map((w, i) => (
                    <motion.div
                      key={w}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.35 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div
                        className={`flex-1 text-right text-[11px] font-bold ${
                          i % 2 === 0 ? "text-gray-300" : "opacity-0"
                        }`}
                      >
                        Week {w}
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#121E12] border-2 border-[#ADFF00] shrink-0 shadow-[0_0_6px_rgba(173,255,0,0.5)]" />
                      <div
                        className={`flex-1 text-left text-[11px] font-bold ${
                          i % 2 !== 0 ? "text-gray-300" : "opacity-0"
                        }`}
                      >
                        Week {w}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* NEXT PHASE Node */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4.2 }}
                  className="flex flex-col items-center relative z-10"
                >
                  <div className="w-4 h-4 rounded-full bg-[#ADFF00] border-2 border-black shadow-[0_0_12px_#ADFF00]" />
                  <div className="bg-[#121E12] border border-[#ADFF00]/60 text-[#ADFF00] text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full mt-2 flex items-center gap-1 shadow-[0_0_15px_rgba(173,255,0,0.25)]">
                    Next Phase <TrendingDown size={11} />
                  </div>
                  <span className="text-gray-300 font-bold mt-1 text-[11px]">Goal: {targetWeight} kg</span>
                </motion.div>
              </div>
            </div>

            {/* Target Metric Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-2 gap-2 my-2 sm:my-3"
            >
              <div className="bg-[#101A10] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Target size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Workout</p>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-100">
                    {workoutsPerWeek ? `${workoutsPerWeek} sessions/wk` : "Custom Split"}
                  </p>
                </div>
              </div>

              <div className="bg-[#101A10] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Flame size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Nutrition</p>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-100">
                    {nutritionTarget?.daily_calories ? `${nutritionTarget.daily_calories} kcal` : "Calibrated"}
                  </p>
                </div>
              </div>

              <div className="bg-[#101A10] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Activity size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Steps</p>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-100">
                    {lifestyleTarget?.daily_steps_target
                      ? `${lifestyleTarget.daily_steps_target.toLocaleString()} steps`
                      : "8,000 steps"}
                  </p>
                </div>
              </div>

              <div className="bg-[#101A10] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <TrendingDown size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Weight Goal</p>
                  <p className="text-[11px] sm:text-xs font-bold text-gray-100">
                    {profile?.target_weight ? `${profile.target_weight} kg` : "Target"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Skip to Protocol CTA */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#142614] hover:bg-[#1A331A] active:scale-[0.98] border border-[#ADFF00]/30 text-[#ADFF00] font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(173,255,0,0.15)] transition-all cursor-pointer"
              >
                <span>View Activated Protocol</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Step 2: Plan Ready Celebration Screen (Mobile Native Redesign) */
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="min-h-[100dvh] flex flex-col justify-between max-w-md mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 relative z-10"
          >
            {/* Top Hero Section */}
            <div className="text-center pt-1 sm:pt-2">
              {/* High-tech pulsing reactor badge */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2.5 flex items-center justify-center">
                {/* Outer spinning dashed ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ADFF00]/40 animate-spin [animation-duration:14s]" />
                {/* Pulsing neon aura glow */}
                <div className="absolute inset-1 rounded-full bg-[#ADFF00]/20 blur-md animate-pulse" />
                {/* Core reactor badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
                  className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#ADFF00] via-[#c6ff33] to-[#80ed00] flex items-center justify-center shadow-[0_0_30px_rgba(173,255,0,0.45)] text-black"
                >
                  <Zap size={26} strokeWidth={2.8} className="fill-black" />
                </motion.div>
              </div>

              {/* Status pill badge */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122212] border border-[#ADFF00]/30 shadow-[0_0_12px_rgba(173,255,0,0.15)] mb-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ADFF00]">
                  Master Protocol Generated
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
              >
                {isPro ? "Pro Plan Ready" : "Core Plan Ready"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-gray-400 text-xs sm:text-sm mt-0.5 max-w-xs mx-auto leading-normal"
              >
                Your AI transformation protocol is generated and active.
              </motion.p>
            </div>

            {/* Feature Showcase (2-Column Grid + VIP Banner) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="my-3 space-y-2 w-full"
            >
              {/* 2-Column Grid of 8 Features */}
              <div className="grid grid-cols-2 gap-2">
                {protocolFeatures.map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="relative bg-gradient-to-br from-[#101A10] to-[#0A120A] border border-white/10 hover:border-[#ADFF00]/40 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm group transition-all"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/25 flex items-center justify-center text-[#ADFF00] shrink-0 shadow-[0_0_10px_rgba(173,255,0,0.12)]">
                      <item.icon size={14} strokeWidth={2.4} />
                    </div>
                    <div className="flex-1 min-w-0 pr-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-black uppercase tracking-wider text-[#ADFF00]">
                          {item.tag}
                        </span>
                        <CheckCircle2 size={10} className="text-[#ADFF00] shrink-0" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-100 truncate leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[9px] text-gray-400 truncate leading-tight">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* VIP Full-Width Banner */}
              <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-r from-[#122412] via-[#0E1E0E] to-[#122412] border border-[#ADFF00]/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-[0_0_20px_rgba(173,255,0,0.12)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#ADFF00] text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(173,255,0,0.35)]">
                    <ShieldCheck size={16} strokeWidth={2.6} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#ADFF00]">
                        {isPro ? "Continuous Oversight" : "Adaptive Roadmap"}
                      </span>
                      {isPro && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#ADFF00]/20 text-[#ADFF00] text-[8px] font-extrabold uppercase">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      {isPro
                        ? "Weekly AI Reviews & Adaptation"
                        : "Structured 8-Week Core Periodization"}
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#ADFF00]/15 flex items-center justify-center text-[#ADFF00] shrink-0 ml-2">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom Grounded Action CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="pt-1 pb-1 w-full"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="relative w-full overflow-hidden bg-gradient-to-r from-[#ADFF00] via-[#c6ff33] to-[#ADFF00] text-black font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(173,255,0,0.35)] transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-widest group"
              >
                {/* Light-sweep shimmer bar */}
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <span className="relative z-10 font-black">Start My Transformation</span>
                <ArrowRight
                  size={18}
                  strokeWidth={2.8}
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
              <p className="text-[10px] text-gray-500 font-semibold text-center mt-2 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]/80" />
                Protocol synchronized with your biometrics & schedule
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
