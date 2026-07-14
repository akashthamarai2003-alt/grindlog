"use client";

import {
  useState,
  useReducer,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useReducedMotion,
} from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Loader2,
  Plus,
  Minus,
  ArrowRight,
  Shuffle,
  Trash2,
} from "lucide-react";
import { HABIT_CATEGORIES, TIME_OF_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { HabitCategory, TimeOfDay, HabitFrequency } from "@/types";

import { createClient } from "@/lib/services/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/* ────────────────────────────────────────────────────────────
   Static config
──────────────────────────────────────────────────────────── */

const FREQUENCIES: { value: HabitFrequency; label: string; icon: string }[] = [
  { value: "daily", label: "Daily", icon: "☀️" },
  { value: "weekly", label: "Weekly", icon: "📅" },
  { value: "weekdays", label: "Weekdays", icon: "💼" },
  { value: "weekends", label: "Weekends", icon: "🌴" },
  { value: "custom", label: "Custom", icon: "✨" },
];

const QUICK_EMOJIS = [
  "🏃", "📚", "💧", "🧘", "💻", "💰", "🎨",
  "🚶", "🍎", "✍️", "🌱", "🎯", "🏋️", "🎵",
  "🧠", "💊", "🚀", "🧹", "🍳", "💤", "📖",
  "🦷", "🌞", "📝", "📵", "📸", "⚽", "🎮",
];

const STEP_TITLES = [
  { title: "Create Your Habit", subtitle: "What would you like to build?" },
  { title: "Set Your Schedule", subtitle: "When will you do it?" },
  { title: "You're All Set!", subtitle: "Time to build momentum" },
] as const;

const MAX_NAME_LENGTH = 40;
const TOTAL_STEPS = 2;

const COLOR_PALETTE = [
  "#34c759", "#0a84ff", "#af52de", "#ff9f0a",
  "#ff375f", "#64d2ff", "#ffd60a", "#ff6482",
  "#30d158", "#5e5ce6",
];

const PARTICLE_ANGLES = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

function colorForCategory(cat: string | null): string {
  if (!cat) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

function triggerHaptic(pattern: number | number[] = 10) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* no-op */
    }
  }
}

/* ────────────────────────────────────────────────────────────
   Form state (useReducer keeps step logic predictable)
──────────────────────────────────────────────────────────── */

interface FormState {
  name: string;
  category: HabitCategory | null;
  frequency: HabitFrequency;
  customDays: number[];
  preferredTime: TimeOfDay;
  reminderTime: string | null;
  targetCount: number;
  emoji: string;
}

type FormAction =
  | { type: "SET"; field: keyof FormState; value: FormState[keyof FormState] }
  | { type: "SUGGEST"; payload: Partial<FormState> };

const initialFormState: FormState = {
  name: "",
  category: null,
  frequency: "daily",
  customDays: [1, 2, 3, 4, 5],
  preferredTime: "anytime",
  reminderTime: null,
  targetCount: 1,
  emoji: "🌱",
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET":
      return { ...state, [action.field]: action.value };
    case "SUGGEST":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

/* ────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */

export default function NewHabitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [bulkHabits, setBulkHabits] = useState<{ id: string; name: string; time: string; frequency: HabitFrequency; customDays: number[] }[]>([
    { id: "1", name: "", time: "06:00", frequency: "daily", customDays: [1, 2, 3, 4, 5] },
    { id: "2", name: "", time: "17:00", frequency: "weekdays", customDays: [1, 2, 3, 4, 5] },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [direction, setDirection] = useState(1);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const nameShakeControls = useAnimation();

  const set = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) =>
      dispatch({ type: "SET", field, value }),
    []
  );

  const color = useMemo(() => colorForCategory(form.category), [form.category]);
  const canProceed = form.name.trim().length > 0 && form.category !== null;
  const progressPct = step === 2 ? 100 : ((step + 1) / TOTAL_STEPS) * 100;

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  const shakeInvalid = useCallback(() => {
    triggerHaptic([0, 30, 30, 30]);
    nameShakeControls.start({
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.4 },
    });
  }, [nameShakeControls]);



  const handleShuffleEmoji = () => {
    const options = QUICK_EMOJIS.filter((e) => e !== form.emoji);
    const next = options[Math.floor(Math.random() * options.length)];
    set("emoji", next);
    triggerHaptic(8);
  };

  const handleSave = async () => {
    if (!user) return setErrorMsg("Please log in again.");
    if (!form.name || !form.category) return setErrorMsg("Fill out name and category.");
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        name: form.name.trim(),
        emoji: form.emoji,
        category: form.category,
        frequency: form.frequency,
        custom_days: form.frequency === "custom" ? form.customDays : null,
        preferred_time: form.preferredTime,
        reminder_time: form.reminderTime,
        target_count: form.targetCount,
        target_unit: "times",
        color,
      } as any);
      if (error) throw error;

      triggerHaptic([0, 20, 40, 60]);
      setDirection(1);
      setStep(2);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 4200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save habit");
      setIsSaving(false);
    }
  };

  const handleAddBulkRow = () => {
    setBulkHabits((prev) => [
      ...prev,
      { id: Math.random().toString(), name: "", time: "08:00", frequency: "daily", customDays: [1, 2, 3, 4, 5] },
    ]);
  };

  const handleRemoveBulkRow = (id: string) => {
    if (bulkHabits.length <= 1) return;
    setBulkHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleUpdateBulkRow = (id: string, field: "name" | "time" | "frequency" | "customDays", value: any) => {
    setBulkHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  const handleBulkSave = async () => {
    if (!user) return setErrorMsg("Please log in again.");
    const habitsToCreate = bulkHabits.filter((h) => h.name.trim().length > 0);

    if (habitsToCreate.length === 0) {
      return setErrorMsg("Please enter a name for at least one habit.");
    }
    
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      
      const habitsToInsert = habitsToCreate.map((h) => {
        const { emoji, category } = getBulkEmojiAndCategory(h.name);
        const catColor = colorForCategory(category);
        const preferredTime = timeToTimeOfDay(h.time);
        
        return {
          user_id: user.id,
          name: h.name.trim().slice(0, MAX_NAME_LENGTH),
          emoji,
          category,
          frequency: h.frequency,
          custom_days: h.frequency === "custom" ? h.customDays : null,
          preferred_time: "anytime",
          reminder_time: h.time,
          target_count: 1,
          target_unit: "times",
          color: catColor,
        };
      });

      const { error } = await supabase.from("habits").insert(habitsToInsert as any);
      if (error) throw error;

      triggerHaptic([0, 20, 40, 60]);
      setDirection(1);
      setStep(2);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 4200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save habits");
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (!canProceed) {
      shakeInvalid();
      return;
    }
    triggerHaptic(10);
    setDirection(1);
    setStep(1);
  };

  const handleBack = () => {
    if (step === 1) {
      setDirection(-1);
      setStep(0);
    } else if (step === 0) {
      router.back();
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const threshold = 90;
    if (step === 0 && info.offset.x < -threshold) {
      handleNext();
    } else if (step === 1 && info.offset.x > threshold) {
      setDirection(-1);
      setStep(0);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.97 }),
  };

  const renderSchedulingSettings = () => (
    <div className="flex flex-col gap-6 w-full">
      {/* Frequency */}
      <div>
        <SectionLabel>Frequency</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCIES.map((f, i) => {
            const active = form.frequency === f.value;
            return (
              <motion.button
                key={f.value}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 28 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => set("frequency", f.value)}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-2xl py-3.5 px-2 text-center overflow-hidden",
                  active
                    ? "text-white"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shadow-sm"
                )}
              >
                {active && (
                  <motion.div
                    layoutId={`freqBg-${mode}`}
                    className="absolute inset-0"
                    style={{ background: color, borderRadius: 16 }}
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative z-10 text-[18px]">{f.icon}</span>
                <span className="relative z-10 text-[11px] font-bold leading-tight">
                  {f.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Days Weekday Selector */}
      <AnimatePresence>
        {form.frequency === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            <SectionLabel>Active Days</SectionLabel>
            <div className="flex justify-between gap-1.5 py-1">
              {[
                { label: "M", value: 1 },
                { label: "T", value: 2 },
                { label: "W", value: 3 },
                { label: "T", value: 4 },
                { label: "F", value: 5 },
                { label: "S", value: 6 },
                { label: "S", value: 0 },
              ].map((day) => {
                const active = form.customDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? form.customDays.filter((d) => d !== day.value)
                        : [...form.customDays, day.value];
                      set("customDays", next);
                    }}
                    className={cn(
                      "flex h-11 w-11 flex-1 items-center justify-center rounded-2xl text-[13px] font-black transition-all border active:scale-90",
                      active
                        ? "bg-[var(--color-bg-elevated)] border-[var(--color-text-primary)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-text-primary)]"
                        : "bg-[var(--color-bg-secondary)] border-transparent text-[var(--color-text-secondary)]"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time of Day */}
      <div>
        <SectionLabel>Best time</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {TIME_OF_DAY.map((t, i) => {
            const active = form.preferredTime === t.value;
            return (
              <motion.button
                key={t.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 28 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => set("preferredTime", t.value)}
                className={cn(
                  "relative flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px] font-bold overflow-hidden",
                  active
                    ? "text-white"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shadow-sm"
                )}
              >
                {active && (
                  <motion.div
                    layoutId={`timeBg-${mode}`}
                    className="absolute inset-0"
                    style={{ background: color, borderRadius: 16 }}
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                  />
                )}
                <span className="relative z-10 text-[15px]">{t.emoji}</span>
                <span className="relative z-10">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--color-bg-secondary)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-secondary)] overflow-hidden">
      {/* Ambient background blobs */}
      {/* Ambient background blobs - Static to prevent typing lag */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -right-32 h-80 w-80 rounded-full blur-3xl opacity-30"
          style={{ background: `${color}22` }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[var(--color-streak)]/10 blur-3xl opacity-30"
        />
      </div>

      <div className="relative flex flex-col flex-1 px-5 pb-8 pt-6 safe-top gap-0">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          {step !== 2 ? (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-elevated)] shadow-sm text-[var(--color-text-primary)]"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </motion.button>
          ) : (
            <div className="h-11 w-11" />
          )}

          {/* Step Indicator Pills */}
          <div className="flex items-center gap-2">
            {mode === "single" && step < 2 &&
              [0, 1].map((s) => (
                <motion.div
                  key={s}
                  animate={{
                    width: s === step ? 28 : 8,
                    backgroundColor: s <= step ? color : "var(--color-bg-elevated)",
                    opacity: s < step ? 0.5 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="h-2 rounded-full"
                />
              ))}
          </div>

          {step !== 2 && mode === "single" ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={step === 0 ? handleNext : handleSave}
              disabled={isSaving}
              style={{ color, opacity: step === 0 ? (canProceed ? 1 : 0.3) : 1 }}
              className="text-[15px] font-bold transition-opacity"
            >
              {step === 0 ? "Next" : isSaving ? "Saving…" : "Save"}
            </motion.button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* ── Progress bar ── */}
        {mode === "single" && (
          <div className="h-1 w-full rounded-full bg-[var(--color-bg-elevated)] overflow-hidden mb-6">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            />
          </div>
        )}

        {/* ── Step Title ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={mode === "bulk" ? "bulk-title" : `title-${step}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="mb-7"
          >
            <h1 className="text-[28px] font-black text-[var(--color-text-primary)] leading-tight">
              {mode === "bulk" ? "Create All Habits" : STEP_TITLES[step].title}
            </h1>
            <p className="text-[15px] text-[var(--color-text-secondary)] font-medium mt-1">
              {mode === "bulk" ? "Set up multiple habits at once" : STEP_TITLES[step].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Mode Switcher ── */}
        {step === 0 && (
          <div className="flex rounded-2xl bg-[var(--color-bg-elevated)] p-1 mb-6 shadow-sm border border-[var(--color-bg-tertiary)]/10">
            {(["single", "bulk"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErrorMsg(null);
                }}
                className={cn(
                  "relative flex-1 py-2.5 text-center text-xs font-bold transition-all rounded-xl",
                  mode === m
                    ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-bg-tertiary)]/10"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {m === "single" ? "Single Habit" : "Create Multiple"}
              </button>
            ))}
          </div>
        )}

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 border border-red-500/20 overflow-hidden"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step Content ── */}
        <div className="flex-1 relative">
          <AnimatePresence mode="popLayout" custom={direction}>
            {mode === "single" && step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                className="flex flex-col gap-6"
              >
                  {/* Emoji Row */}
                  <div>
                    <div className="flex items-center justify-between mb-3 pl-1 pr-1">
                      <SectionLabel noMargin>Pick an emoji</SectionLabel>
                      <motion.button
                        whileTap={{ scale: 0.85, rotate: 180 }}
                        onClick={handleShuffleEmoji}
                        className="flex items-center gap-1 text-[12px] font-bold text-[var(--color-text-tertiary)]"
                      >
                        <Shuffle className="h-3.5 w-3.5" />
                        Shuffle
                      </motion.button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {QUICK_EMOJIS.map((e, i) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => set("emoji", e)}
                          className={cn(
                            "relative flex h-[48px] w-[48px] items-center justify-center rounded-[14px] text-[22px] transition-all active:scale-95 animate-scale-in"
                          )}
                          style={{
                            ...(form.emoji === e
                              ? { background: `${color}1a`, boxShadow: `0 0 0 2.5px ${color}` }
                              : {}),
                            animationDelay: `${i * 15}ms`,
                            animationFillMode: "both"
                          }}
                        >
                          {form.emoji !== e && (
                            <span className="absolute inset-0 rounded-[14px] bg-[var(--color-bg-elevated)] shadow-sm -z-10" />
                          )}
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <SectionLabel>Habit name</SectionLabel>
                    <motion.div
                      animate={nameShakeControls}
                      className="flex items-center gap-3 rounded-2xl bg-[var(--color-bg-elevated)] px-4 shadow-sm ring-0 focus-within:ring-2 transition-shadow"
                    >
                      <motion.span
                        key={form.emoji}
                        initial={{ scale: 0.5, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="text-[22px] select-none"
                      >
                        {form.emoji}
                      </motion.span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value.slice(0, MAX_NAME_LENGTH))}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                        placeholder="e.g., Morning Run"
                        className="flex-1 h-[56px] bg-transparent text-[16px] font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-medium outline-none"
                      />
                      <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)] tabular-nums">
                        {form.name.length}/{MAX_NAME_LENGTH}
                      </span>
                      <AnimatePresence>
                        {form.name.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: color }}
                          >
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Category */}
                  <div>
                    <SectionLabel>Category</SectionLabel>
                    <div className="flex gap-2 flex-wrap">
                      {HABIT_CATEGORIES.map((cat, i) => {
                        const active = form.category === cat.value;
                        const catColor = colorForCategory(cat.value);
                        return (
                          <motion.button
                            key={cat.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => set("category", cat.value)}
                            className={cn(
                              "relative flex items-center gap-1.5 rounded-[14px] px-3.5 py-2.5 text-[13px] font-bold overflow-hidden",
                              active
                                ? "text-white"
                                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] shadow-sm"
                            )}
                          >
                            {active && (
                              <motion.div
                                layoutId="categoryBg"
                                className="absolute inset-0"
                                style={{ background: catColor, borderRadius: 14 }}
                                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                              />
                            )}
                            <span className="relative z-10 text-[14px]">{cat.emoji}</span>
                            <span className="relative z-10">{cat.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>


                  {/* Next CTA */}
                  <motion.button
                    onClick={handleNext}
                    whileTap={{ scale: 0.97 }}
                    animate={{ opacity: canProceed ? 1 : 0.35 }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-text-primary)] py-4 text-[15px] font-bold text-white shadow-md"
                  >
                    <span>Continue</span>
                    <motion.div
                      animate={canProceed ? { x: [0, 4, 0] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </motion.div>
                  </motion.button>
              </motion.div>
            )}

            {mode === "bulk" && step === 0 && (
              <motion.div
                key="step-bulk"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <SectionLabel>Your Habits & Timings</SectionLabel>
                  <div className="flex flex-col gap-3 mb-6">
                    <AnimatePresence initial={false}>
                      {bulkHabits.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, height: 0, y: 15 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -15 }}
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          className="flex flex-col gap-2 py-2 w-full min-w-0"
                        >
                          <div className="flex flex-col gap-3 rounded-[20px] bg-[var(--color-bg-elevated)] p-3.5 shadow-sm border border-[var(--color-bg-tertiary)]/10 w-full">
                            {/* Top Row: Name & Trash */}
                            <div className="flex items-center gap-3 px-1">
                              <span className="text-[22px] select-none flex-shrink-0">
                                {getBulkEmojiAndCategory(item.name).emoji}
                              </span>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateBulkRow(item.id, "name", e.target.value)}
                                placeholder={
                                  index === 0
                                    ? "e.g., Morning Run"
                                    : index === 1
                                      ? "e.g., Read 10 Pages"
                                      : "e.g., Drink Water"
                                }
                                className="flex-1 min-w-0 bg-transparent text-[16px] font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-medium outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow(item.id)}
                                disabled={bulkHabits.length <= 1}
                                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]/10 text-[var(--color-text-tertiary)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-[var(--color-bg-tertiary)]/10 disabled:hover:text-[var(--color-text-tertiary)] transition-colors"
                              >
                                <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.5} />
                              </button>
                            </div>

                            {/* Divider */}
                            <div className="h-[1px] w-full bg-[var(--color-bg-tertiary)]/10 rounded-full" />

                            {/* Bottom Row: Settings */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <select
                                  value={item.frequency}
                                  onChange={(e) => handleUpdateBulkRow(item.id, "frequency", e.target.value as HabitFrequency)}
                                  className="w-full appearance-none rounded-xl bg-[var(--color-bg-primary)] px-3.5 h-[46px] text-[13px] font-bold text-[var(--color-text-primary)] outline-none border border-[var(--color-bg-tertiary)]/10 focus:border-[var(--color-accent-green)]/60 transition-all cursor-pointer shadow-sm"
                                >
                                  {FREQUENCIES.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                  <ChevronLeft className="h-4 w-4 -rotate-90 text-[var(--color-text-tertiary)]" />
                                </div>
                              </div>

                              <input
                                type="time"
                                value={item.time}
                                onChange={(e) => handleUpdateBulkRow(item.id, "time", e.target.value)}
                                className="w-[115px] rounded-xl bg-[var(--color-bg-primary)] px-3.5 h-[46px] text-[13px] font-extrabold text-[var(--color-text-primary)] outline-none border border-[var(--color-bg-tertiary)]/10 focus:border-[var(--color-accent-green)]/60 transition-all cursor-pointer shadow-sm"
                              />
                            </div>
                            
                            {/* Inline Custom Days Selector */}
                            {item.frequency === "custom" && (
                              <div className="flex gap-1.5 pt-1 justify-center w-full">
                                {["M", "T", "W", "T", "F", "S", "S"].map((dayName, dayIndex) => {
                                  const realDayIndex = dayIndex === 6 ? 0 : dayIndex + 1;
                                  const isSelected = item.customDays.includes(realDayIndex);
                                  return (
                                    <button
                                      key={dayIndex}
                                      type="button"
                                      onClick={() => {
                                        const newDays = isSelected
                                          ? item.customDays.filter((d) => d !== realDayIndex)
                                          : [...item.customDays, realDayIndex].sort();
                                        handleUpdateBulkRow(item.id, "customDays", newDays);
                                      }}
                                      className={cn(
                                        "flex h-[38px] flex-1 items-center justify-center rounded-xl text-[13px] font-bold transition-all",
                                        isSelected
                                          ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-sm"
                                          : "bg-[var(--color-bg-primary)] text-[var(--color-text-tertiary)] border border-[var(--color-bg-tertiary)]/10"
                                      )}
                                    >
                                      {dayName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBulkRow}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-bg-tertiary)]/60 py-3.5 text-sm font-bold text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)]/40 hover:text-[var(--color-accent-green)] transition-all bg-[var(--color-bg-elevated)]/40 hover:bg-[var(--color-bg-elevated)]"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    <span>Add Another Habit</span>
                  </button>

                  <p className="text-[11px] font-semibold text-[var(--color-text-tertiary)] mt-3 pl-1 leading-normal">
                    💡 Emojis, colors, and categories will be automatically set based on what you write. Timing reminders will be set to the exact times you choose.
                  </p>
                </div>

                <motion.button
                  onClick={handleBulkSave}
                  disabled={isSaving || bulkHabits.filter((h) => h.name.trim()).length === 0}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl py-[1.125rem] text-[15px] font-bold text-white overflow-hidden disabled:opacity-50 shadow-md"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-green)] to-[var(--color-accent-gold)]"
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10">
                    {isSaving ? "Creating Habits…" : `Create ${bulkHabits.filter((h) => h.name.trim()).length} Habits`}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {mode === "single" && step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                className="flex flex-col gap-6"
              >
                  {/* Habit Preview Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg-elevated)] p-4 shadow-sm border border-[var(--color-bg-elevated)]"
                  >
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
                      style={{ background: `${color}22` }}
                    >
                      {form.emoji}
                    </div>
                    <div>
                      <p className="font-black text-[17px] text-[var(--color-text-primary)] leading-tight">
                        {form.name}
                      </p>
                      <p className="text-[13px] font-semibold text-[var(--color-text-secondary)] mt-0.5 capitalize">
                        {form.category}
                      </p>
                    </div>
                    <motion.div
                      className="ml-auto h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.15 }}
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  </motion.div>

                  {renderSchedulingSettings()}

                  {/* Specific Time Picker */}
                  <div className="flex flex-col gap-2 mt-2">
                    <SectionLabel>Specific Time Reminder (Optional)</SectionLabel>
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-1 flex items-center h-[56px] rounded-2xl bg-[var(--color-bg-elevated)] px-4 border border-[var(--color-bg-tertiary)]/20 shadow-sm focus-within:ring-2 focus-within:ring-[var(--color-accent-green)]/35 transition-all">
                        <input
                          type="time"
                          value={form.reminderTime || ""}
                          onChange={(e) => set("reminderTime", e.target.value || null)}
                          className="w-full bg-transparent text-sm font-extrabold text-[var(--color-text-primary)] outline-none cursor-pointer"
                        />
                      </div>
                      {form.reminderTime && (
                        <button
                          type="button"
                          onClick={() => set("reminderTime", null)}
                          className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 active:scale-95"
                          title="Clear time"
                        >
                          <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Target Count */}
                  <div>
                    <SectionLabel>Daily goal</SectionLabel>
                    <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-bg-elevated)] p-2 shadow-sm">
                      <CounterButton
                        onClick={() => set("targetCount", Math.max(1, form.targetCount - 1))}
                        disabled={form.targetCount <= 1}
                      >
                        <Minus className="h-4 w-4" strokeWidth={2.5} />
                      </CounterButton>
                      <div className="flex-1 flex flex-col items-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={form.targetCount}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="text-[26px] font-black text-[var(--color-text-primary)] leading-none"
                          >
                            {form.targetCount}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-[12px] font-semibold text-[var(--color-text-secondary)] mt-0.5">
                          {form.targetCount === 1 ? "time per day" : "times per day"}
                        </span>
                      </div>
                      <CounterButton onClick={() => set("targetCount", form.targetCount + 1)}>
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      </CounterButton>
                    </div>
                  </div>

                  {/* Save CTA */}
                  <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl py-[1.125rem] text-[15px] font-bold text-white overflow-hidden disabled:opacity-60"
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(90deg, ${color}, #34d399, ${color})`,
                        backgroundSize: "200% 200%",
                      }}
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10 flex items-center gap-2.5">
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <Check className="h-5 w-5" strokeWidth={2.5} />
                          </motion.div>
                          <span>Save Habit</span>
                        </>
                      )}
                    </div>
                  </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col items-center justify-center text-center gap-6"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative flex items-center justify-center h-64 w-64 -my-8"
                >
                  <img
                    src="/Done.svg"
                    className="h-full w-full object-contain"
                    alt="Success"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-[24px] font-black text-[var(--color-text-primary)]">
                    Habit Created!
                  </h2>
                  <p className="text-[15px] font-medium text-[var(--color-text-secondary)] mt-1">
                    "{form.name}" is ready to build momentum.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-tertiary)]"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Taking you to your dashboard…
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── Small Reusable Components ─── */

function SectionLabel({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <p
      className={cn(
        "text-[13px] font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)] pl-1",
        noMargin ? "" : "mb-3"
      )}
    >
      {children}
    </p>
  );
}

function CounterButton({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] disabled:opacity-30 transition-colors active:bg-[var(--color-bg-tertiary)]"
    >
      {children}
    </motion.button>
  );
}

/* ─── Bulk Creation Utility ─── */

function getBulkEmojiAndCategory(name: string): { emoji: string; category: HabitCategory } {
  const lower = name.toLowerCase();
  if (
    lower.includes("run") ||
    lower.includes("gym") ||
    lower.includes("walk") ||
    lower.includes("workout") ||
    lower.includes("exercise") ||
    lower.includes("fit") ||
    lower.includes("stretch") ||
    lower.includes("yoga") ||
    lower.includes("sport")
  ) {
    return { emoji: "🏃", category: "fitness" };
  }
  if (
    lower.includes("read") ||
    lower.includes("book") ||
    lower.includes("study") ||
    lower.includes("learn") ||
    lower.includes("course") ||
    lower.includes("code") ||
    lower.includes("write") ||
    lower.includes("journal")
  ) {
    return { emoji: "📚", category: "learning" };
  }
  if (
    lower.includes("water") ||
    lower.includes("drink") ||
    lower.includes("eat") ||
    lower.includes("diet") ||
    lower.includes("sleep") ||
    lower.includes("bed") ||
    lower.includes("wake") ||
    lower.includes("health") ||
    lower.includes("fruit")
  ) {
    return { emoji: "💧", category: "health" };
  }
  if (
    lower.includes("meditate") ||
    lower.includes("breath") ||
    lower.includes("relax") ||
    lower.includes("pray") ||
    lower.includes("journal") ||
    lower.includes("reflect") ||
    lower.includes("zen")
  ) {
    return { emoji: "🧘", category: "mindfulness" };
  }
  if (
    lower.includes("money") ||
    lower.includes("save") ||
    lower.includes("budget") ||
    lower.includes("invest") ||
    lower.includes("spend") ||
    lower.includes("expense") ||
    lower.includes("finance")
  ) {
    return { emoji: "💰", category: "finance" };
  }
  if (
    lower.includes("friend") ||
    lower.includes("family") ||
    lower.includes("call") ||
    lower.includes("meet") ||
    lower.includes("social") ||
    lower.includes("talk") ||
    lower.includes("message")
  ) {
    return { emoji: "💬", category: "social" };
  }
  if (
    lower.includes("work") ||
    lower.includes("job") ||
    lower.includes("focus") ||
    lower.includes("project") ||
    lower.includes("task") ||
    lower.includes("email") ||
    lower.includes("meeting")
  ) {
    return { emoji: "💼", category: "work" };
  }
  if (
    lower.includes("draw") ||
    lower.includes("paint") ||
    lower.includes("music") ||
    lower.includes("guitar") ||
    lower.includes("piano") ||
    lower.includes("art") ||
    lower.includes("creative") ||
    lower.includes("design")
  ) {
    return { emoji: "🎨", category: "creative" };
  }
  return { emoji: "✨", category: "other" };
}

function timeToTimeOfDay(timeStr: string): TimeOfDay {
  if (!timeStr) return "anytime";
  const [hoursStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  if (isNaN(hours)) return "anytime";
  if (hours >= 5 && hours < 12) return "morning";
  if (hours >= 12 && hours < 17) return "afternoon";
  if (hours >= 17 && hours < 21) return "evening";
  return "night";
}