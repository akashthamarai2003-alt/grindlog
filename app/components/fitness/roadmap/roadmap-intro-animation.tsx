"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
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

  const activatedFeatures = [
    { icon: Target, label: "Personalized Workout Strategy" },
    { icon: Dumbbell, label: "Exercise Sets, Reps & Form Guidance" },
    { icon: Flame, label: "Calorie & Protein Targets" },
    { icon: User, label: "Goal, Physique & Schedule Mapping" },
    ...(isPro
      ? [
          { icon: Flame, label: "Personalized Diet Plan" },
          { icon: ShoppingCart, label: "Smart Grocery Strategy" },
          { icon: Activity, label: "Automated Progress Tracking" },
          { icon: Brain, label: "AI Coach Support" },
          { icon: ShieldCheck, label: "Weekly AI Reviews" },
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

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1108] text-white flex flex-col justify-between overflow-y-auto selection:bg-[#ADFF00]/20 selection:text-[#ADFF00]">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#ADFF00]/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#10B981]/10 blur-[100px]"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col px-5 pt-10 pb-8 z-10 max-w-md mx-auto w-full justify-between"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121E12] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#ADFF00] mb-2 shadow-[0_0_12px_rgba(173,255,0,0.15)]">
                <Target size={12} /> Transformation Roadmap
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">The Journey Ahead</h1>
              <p className="text-gray-400 mt-1.5 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
                Building progressive overload & sustainable habits over your 8-week block.
              </p>
            </motion.div>

            {/* Timeline Vertical Path */}
            <div className="relative flex justify-center max-w-sm mx-auto w-full py-4 my-auto">
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
                <div className="flex flex-col items-center justify-center gap-3.5 my-6 z-10 relative">
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
              className="grid grid-cols-2 gap-2.5 my-3"
            >
              <div className="bg-[#121E12] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Target size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Workout</p>
                  <p className="text-xs font-bold text-gray-200">
                    {workoutsPerWeek ? `${workoutsPerWeek} sessions/wk` : "Custom Split"}
                  </p>
                </div>
              </div>

              <div className="bg-[#121E12] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Flame size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Nutrition</p>
                  <p className="text-xs font-bold text-gray-200">
                    {nutritionTarget?.daily_calories ? `${nutritionTarget.daily_calories} kcal` : "Calibrated"}
                  </p>
                </div>
              </div>

              <div className="bg-[#121E12] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <Activity size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Steps</p>
                  <p className="text-xs font-bold text-gray-200">
                    {lifestyleTarget?.daily_steps_target
                      ? `${lifestyleTarget.daily_steps_target.toLocaleString()} steps`
                      : "8,000 steps"}
                  </p>
                </div>
              </div>

              <div className="bg-[#121E12] border border-[#1A2619] p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="bg-[#1A2619] p-2 rounded-xl text-[#ADFF00]">
                  <TrendingDown size={15} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Weight Goal</p>
                  <p className="text-xs font-bold text-gray-200">
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
                className="w-full py-3.5 px-5 rounded-2xl bg-[#142614] hover:bg-[#1A331A] border border-[#ADFF00]/30 text-[#ADFF00] font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(173,255,0,0.15)] transition-all cursor-pointer active:scale-98"
              >
                <span>View Activated Protocol</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Step 2: Plan Ready Celebration Screen */
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="flex-1 flex flex-col justify-center px-5 py-8 z-10 max-w-md mx-auto w-full my-auto"
          >
            <div className="bg-[#121E12] border border-[#1A2619] rounded-[2.2rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#ADFF00]/12 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#10B981]/12 rounded-full blur-3xl pointer-events-none" />

              {/* Pulsing Zap Icon Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
                className="w-16 h-16 bg-[#ADFF00] rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-[0_0_35px_rgba(173,255,0,0.4)]"
              >
                <Zap className="text-black" size={32} />
              </motion.div>

              <div className="text-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ADFF00] block mb-1">
                  Master Protocol Generated
                </span>
                <h2 className="text-2xl sm:text-3xl font-black mb-1.5 tracking-tight text-white">
                  {isPro ? "Pro Plan Ready" : "Core Plan Ready"}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Your AI transformation protocol is generated and active.
                </p>
              </div>

              {/* Unlocked Features List */}
              <div className="space-y-3 mb-8">
                {activatedFeatures.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.07 }}
                    className="flex items-center gap-3 bg-[#0D150D] border border-white/5 p-2.5 rounded-xl"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1A2619] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} className="text-[#ADFF00]" />
                    </div>
                    <span className="text-xs font-semibold text-gray-200">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Primary Start My Transformation CTA */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                onClick={handleStart}
                className="w-full bg-[#ADFF00] hover:bg-[#bfff2e] active:scale-[0.98] text-black font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(173,255,0,0.35)] transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
              >
                <span>Start My Transformation</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
