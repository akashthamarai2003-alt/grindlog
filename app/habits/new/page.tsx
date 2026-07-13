"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { springs } from "@/animations/springs";
import { HABIT_CATEGORIES, TIME_OF_DAY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { HabitCategory, TimeOfDay, HabitFrequency } from "@/types";
import { suggestHabitAction } from "./actions";
import { createClient } from "@/lib/services/supabase/client";
import { useAuthStore } from "@/store/auth-store";

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom" },
];

export default function NewHabitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory | null>(null);
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [preferredTime, setPreferredTime] = useState<TimeOfDay>("anytime");
  const [targetCount, setTargetCount] = useState(1);
  const [emoji, setEmoji] = useState("🌱");

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickEmojis = ["🏃", "📚", "💧", "🧘", "💻", "💰", "🎨", "🚶", "🍎", "✍️"];

  const handleSuggest = async () => {
    setIsAiLoading(true);
    setErrorMsg(null);
    try {
      const suggestion = await suggestHabitAction();
      if (suggestion.name) setName(suggestion.name);
      if (suggestion.category) setCategory(suggestion.category as HabitCategory);
      if (suggestion.emoji) setEmoji(suggestion.emoji);
      if (suggestion.targetCount) setTargetCount(suggestion.targetCount);
    } catch (err: any) {
      console.error("AI Error:", err);
      setErrorMsg(err.message || "Failed to suggest habit");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setErrorMsg("User not found. Please log in again.");
      return;
    }
    if (!name || !category) {
      setErrorMsg("Please fill out the name and category.");
      return;
    }
    
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        name: name.trim(),
        emoji,
        category,
        frequency,
        preferred_time: preferredTime,
        target_count: targetCount,
        target_unit: "times",
        color: "#34c759",
      } as any);
      
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Save Error:", err);
      setErrorMsg(err.message || JSON.stringify(err) || "Failed to save habit");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (step === 0 && name && category) {
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg-secondary)]">
      <div className="flex flex-col gap-6 px-5 pb-8 pt-6 safe-top flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] shadow-sm text-[var(--color-text-primary)] transition-transform active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <span className="text-[13px] font-bold text-[var(--color-text-secondary)]">
            Step {step + 1} of 2
          </span>
          <button
            onClick={handleSave}
            disabled={!name || !category}
            className="text-[15px] font-bold text-[var(--color-accent-green)] disabled:opacity-40 active:opacity-70"
          >
            Save
          </button>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springs.default}
          className="flex flex-col gap-6 mt-2"
        >
          {errorMsg && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm font-semibold text-red-500 border border-red-500/20">
              {errorMsg}
            </div>
          )}

          {step === 0 ? (
            <>
              {/* Emoji Picker */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Choose an emoji
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {quickEmojis.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "flex h-[50px] w-[50px] items-center justify-center rounded-[16px] text-2xl transition-all shadow-sm",
                        emoji === e
                          ? "bg-[var(--color-accent-green-light)] scale-105 ring-2 ring-[var(--color-accent-green)]/30"
                          : "bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-tertiary)]"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Habit name
                </p>
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-bg-elevated)] px-4 shadow-sm transition-shadow focus-within:shadow-[0_0_0_2px_var(--color-accent-green)]">
                  <span className="text-[22px]">{emoji}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Run"
                    className="flex-1 h-[56px] bg-transparent text-[15px] font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] placeholder:font-medium outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Category
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {HABIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all shadow-sm",
                        category === cat.value
                          ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      <span className="text-[15px] opacity-90">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Suggestion Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSuggest}
                disabled={isAiLoading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-[#E5E7EB] py-4 text-sm font-bold text-[var(--color-text-primary)] shadow-sm mt-2 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader2 className="h-[18px] w-[18px] text-[var(--color-streak)] animate-spin" />
                ) : (
                  <Sparkles className="h-[18px] w-[18px] text-[var(--color-streak)]" />
                )}
                Suggest with AI
              </motion.button>

              <div className="flex-1" />

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!name || !category}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[var(--color-text-primary)] py-4 text-[15px] font-bold text-white transition-all disabled:opacity-30 active:scale-[0.98] shadow-md"
              >
                Next Step
              </button>
            </>
          ) : (
            <>
              {/* Frequency */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Frequency
                </p>
                <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFrequency(f.value)}
                      className={cn(
                        "flex-1 rounded-xl py-3 px-3 text-[13px] font-bold transition-all text-center shadow-sm",
                        frequency === f.value
                          ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Preferred time
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {TIME_OF_DAY.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setPreferredTime(t.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold transition-all shadow-sm",
                        preferredTime === t.value
                          ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      )}
                    >
                      <span className="text-[15px] opacity-90">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Count */}
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] mb-3 pl-1">
                  Daily Goal
                </p>
                <div className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg-elevated)] p-2 shadow-sm">
                  <button
                    onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors active:bg-[var(--color-bg-tertiary)]"
                  >
                    <span className="text-2xl font-medium leading-none mb-1">-</span>
                  </button>
                  <div className="flex-1 text-center font-bold text-[17px] text-[var(--color-text-primary)]">
                    {targetCount} {targetCount === 1 ? 'time' : 'times'}
                  </div>
                  <button
                    onClick={() => setTargetCount(targetCount + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-colors active:bg-[var(--color-bg-tertiary)]"
                  >
                    <span className="text-2xl font-medium leading-none mb-0.5">+</span>
                  </button>
                </div>
              </div>

              <div className="flex-1" />

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[var(--color-accent-green)] py-4 text-[15px] font-bold text-white transition-all shadow-[var(--shadow-glow-green)] active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Check className="h-5 w-5 mr-2" strokeWidth={2.5} />
                )}
                Save Habit
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
