"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Dumbbell,
  Brain,
  Moon,
  BookOpen,
  DollarSign,
  Sparkles,
  Check,
} from "lucide-react";
import { springs } from "@/animations/springs";

const goals = [
  { id: "fitter", label: "Get Fitter", emoji: "🏃", desc: "Build exercise habits" },
  { id: "focus", label: "Improve Focus", emoji: "🧠", desc: "Deep work & mindfulness" },
  { id: "sleep", label: "Sleep Better", emoji: "😴", desc: "Rest & recovery" },
  { id: "learn", label: "Learn More", emoji: "📚", desc: "Knowledge & skills" },
  { id: "wealth", label: "Build Wealth", emoji: "💰", desc: "Financial habits" },
  { id: "other", label: "Something Else", emoji: "✨", desc: "Custom goals" },
];

const levels = [
  { id: "beginner", label: "Beginner", emoji: "🌱", desc: "New to habits" },
  { id: "intermediate", label: "Intermediate", emoji: "🌿", desc: "Some experience" },
  { id: "advanced", label: "Advanced", emoji: "🌳", desc: "Consistent for 6mo+" },
];

const times = [
  { id: "morning", label: "Morning", emoji: "🌅", sub: "6–9 AM" },
  { id: "midday", label: "Midday", emoji: "🌤", sub: "12–2 PM" },
  { id: "evening", label: "Evening", emoji: "🌅", sub: "5–8 PM" },
  { id: "night", label: "Night", emoji: "🌙", sub: "9–11 PM" },
];

const durations = [
  { id: "15", label: "15m" },
  { id: "30", label: "30m" },
  { id: "45", label: "45m" },
  { id: "60", label: "1h" },
  { id: "120", label: "2h+" },
];

const aiSteps = [
  "Analyzing 1000+ habit patterns...",
  "Optimizing for your schedule...",
  "Creating your Tree of Life...",
  "Personalizing your journey...",
];

export default function AIPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTime = (id: string) => {
    setSelectedTimes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const canAdvance = () => {
    if (step === 0) return !!selectedGoal;
    if (step === 1) return !!selectedLevel;
    if (step === 2) return selectedTimes.length > 0 && !!selectedDuration;
    return true;
  };

  const handleNext = () => {
    if (step === 3) {
      startGeneration();
      return;
    }
    setStep((s) => s + 1);
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    for (let i = 0; i < aiSteps.length; i++) {
      setAiStepIndex(i);
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    }
    await new Promise((r) => setTimeout(r, 800));
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-primary)] safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>

        {!isGenerating && (
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? "w-4 bg-[var(--color-accent-green)]" : "w-1.5 bg-[var(--color-bg-tertiary)]"
                }`}
              />
            ))}
          </div>
        )}

        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6">
        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={springs.default}
              className="flex flex-1 flex-col"
            >
              {/* Step 0: Goal */}
              {step === 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Step 1 of 4
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                    What&apos;s your primary goal?
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Pick one to focus on. You can add more later.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 stagger">
                    {goals.map((goal, i) => (
                      <motion.button
                        key={goal.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedGoal(goal.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                          selectedGoal === goal.id
                            ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-light)] shadow-[var(--shadow-glow-green)]"
                            : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent-green)]/30"
                        }`}
                      >
                        <span className="text-3xl">{goal.emoji}</span>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[var(--color-text-primary)]">
                            {goal.label}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {goal.desc}
                          </p>
                        </div>
                        {selectedGoal === goal.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={springs.bouncy}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-green)]"
                          >
                            <Check className="h-3.5 w-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 1: Experience */}
              {step === 1 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Step 2 of 4
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                    How experienced are you?
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    This helps us set the right pace for you.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 stagger">
                    {levels.map((level) => (
                      <motion.button
                        key={level.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedLevel(level.id)}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                          selectedLevel === level.id
                            ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-light)] shadow-[var(--shadow-glow-green)]"
                            : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent-green)]/30"
                        }`}
                      >
                        <span className="text-3xl">{level.emoji}</span>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[var(--color-text-primary)]">
                            {level.label}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {level.desc}
                          </p>
                        </div>
                        {selectedLevel === level.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={springs.bouncy}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-green)]"
                          >
                            <Check className="h-3.5 w-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2: Time & Duration */}
              {step === 2 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Step 3 of 4
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                    When do you have time?
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Pick your free windows.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {times.map((time) => (
                      <motion.button
                        key={time.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTime(time.id)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                          selectedTimes.includes(time.id)
                            ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-light)] text-[var(--color-accent-green)]"
                            : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <span>{time.emoji}</span>
                        <span>{time.label}</span>
                        <span className="text-xs opacity-60">{time.sub}</span>
                      </motion.button>
                    ))}
                  </div>

                  <p className="mt-8 text-sm font-medium text-[var(--color-text-secondary)]">
                    How much time daily?
                  </p>
                  <div className="mt-3 flex gap-2">
                    {durations.map((d) => (
                      <motion.button
                        key={d.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDuration(d.id)}
                        className={`flex-1 rounded-xl border py-3 text-center text-sm font-semibold transition-all ${
                          selectedDuration === d.id
                            ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green)] text-white"
                            : "border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {d.label}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-7xl"
                  >
                    🤖
                  </motion.div>
                  <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                    Ready for your personalized plan?
                  </h2>
                  <p className="mt-2 text-base text-[var(--color-text-secondary)] max-w-xs">
                    Our AI will analyze your goals, schedule, and experience to create the perfect habit plan.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            /* Generation Screen */
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 flex-col items-center justify-center text-center"
            >
              <motion.div
                className="relative mb-8"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-[var(--color-accent-green)]/20 blur-2xl" />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent-green-light)] to-[var(--color-accent-green)] shadow-[var(--shadow-glow-green)]">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </motion.div>

              <h2 className="mb-2 text-xl font-bold text-[var(--color-text-primary)]">
                Building your plan...
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                {aiSteps.map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: i <= aiStepIndex ? 1 : 0.3,
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                        i < aiStepIndex
                          ? "bg-[var(--color-accent-green)]"
                          : i === aiStepIndex
                          ? "bg-[var(--color-accent-green)]/40"
                          : "bg-[var(--color-bg-tertiary)]"
                      }`}
                    >
                      {i < aiStepIndex ? (
                        <Check className="h-3 w-3 text-white" />
                      ) : i === aiStepIndex ? (
                        <motion.div
                          className="h-2 w-2 rounded-full bg-[var(--color-accent-green)]"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-[var(--color-text-tertiary)]" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        i <= aiStepIndex
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-tertiary)]"
                      }`}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      {!isGenerating && (
        <div className="px-6 pb-8 safe-bottom">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25 transition-all hover:brightness-105 disabled:opacity-40"
          >
            {step === 3 ? "Generate My Plan" : "Continue"}
            <Sparkles className="h-5 w-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
