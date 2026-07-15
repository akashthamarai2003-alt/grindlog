"use client";

import { use, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Flame,
  Trophy,
  Check,
  Trash2,
  Edit3,
  Loader2,
  Plus,
  Minus
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/services/supabase/client";
import { deleteHabit, toggleHabitCompletion } from "@/app/actions/habits";
import type { HabitCategory, TimeOfDay, HabitFrequency } from "@/types";

const FREQUENCIES: { value: HabitFrequency; label: string; icon: string }[] = [
  { value: "daily", label: "Every day", icon: "🔥" },
  { value: "weekdays", label: "Weekdays", icon: "💼" },
  { value: "weekends", label: "Weekends", icon: "🍹" },
  { value: "custom", label: "Custom", icon: "⚙️" },
];

const CATEGORIES: { id: HabitCategory; label: string; icon: string }[] = [
  { id: "fitness", label: "Fitness", icon: "🏃" },
  { id: "learning", label: "Learning", icon: "📚" },
  { id: "health", label: "Health", icon: "💧" },
  { id: "mindfulness", label: "Mindfulness", icon: "🧘" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "social", label: "Social", icon: "💬" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "creative", label: "Creative", icon: "🎨" },
];

const EMOJIS = ["🏃", "📚", "💧", "🧘", "💰", "💬", "💼", "🎨", "🚴", "🍳", "🦷", "🛌", "🚶", "🍎", "🥛", "🎹", "✍️", "💻", "🧹", "🚿", "🌱", "🧘‍♀️", "🏋️", "🏀"];

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("✨");
  const [editCategory, setEditCategory] = useState<HabitCategory>("other");
  const [editTime, setEditTime] = useState("08:00");
  const [editFrequency, setEditFrequency] = useState<HabitFrequency>("daily");
  const [editCustomDays, setEditCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Today log completion status
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  const fetchHabitDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Fetch habit details
      const { data: rawHabitData, error: habitError } = await supabase
        .from("habits")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (habitError || !rawHabitData) {
        throw new Error("Habit not found");
      }

      const habitData = rawHabitData as any;
      setHabit(habitData);
      setEditName(habitData.name);
      setEditEmoji(habitData.emoji || "✨");
      setEditCategory(habitData.category as HabitCategory);
      setEditTime(habitData.reminder_time || "08:00");
      setEditFrequency(habitData.frequency || "daily");
      setEditCustomDays(habitData.custom_days || [1, 2, 3, 4, 5]);
      setCurrentStreak(habitData.current_streak || 0);

      // Fetch today's completion log
      const todayDateStr = new Date().toISOString().split("T")[0];
      const { data: rawLogData } = await supabase
        .from("habit_logs")
        .select("status")
        .eq("habit_id", id)
        .eq("date", todayDateStr)
        .maybeSingle();

      const logData = rawLogData as any;
      setIsCompleted(logData?.status === "completed");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load habit");
    } finally {
      setLoading(false);
    }
  }, [id, router, supabase]);

  useEffect(() => {
    fetchHabitDetails();
  }, [fetchHabitDetails]);

  const handleToggleComplete = async () => {
    if (!habit) return;
    const previousCompleted = isCompleted;
    const previousStreak = currentStreak;

    // Optimistic UI updates
    setIsCompleted(!previousCompleted);
    setCurrentStreak(prev => previousCompleted ? Math.max(0, prev - 1) : prev + 1);

    try {
      const todayDateStr = new Date().toISOString().split("T")[0];
      await toggleHabitCompletion(habit.id, todayDateStr, !previousCompleted, previousStreak, 10);
    } catch (err) {
      console.error(err);
      setIsCompleted(previousCompleted);
      setCurrentStreak(previousStreak);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      return setErrorMsg("Please enter a name");
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const preferredTime = timeToTimeOfDay(editTime);
      const catColor = colorForCategory(editCategory);

      const { error } = await (supabase
        .from("habits") as any)
        .update({
          name: editName.trim(),
          emoji: editEmoji,
          category: editCategory,
          color: catColor,
          reminder_time: editTime,
          preferred_time: preferredTime,
          frequency: editFrequency,
          custom_days: editFrequency === "custom" ? editCustomDays : null,
        })
        .eq("id", id);

      if (error) throw error;

      setIsEditing(false);
      fetchHabitDetails();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to save updates");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    setLoading(true);
    try {
      const res = await deleteHabit(id);
      if (!res.success) throw new Error(res.error || "Failed to delete");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to delete habit");
      setLoading(false);
    }
  };

  const handleShuffleEmoji = () => {
    const next = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setEditEmoji(next);
  };

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 text-[var(--color-accent-green)] animate-spin" />
        <p className="text-[var(--color-text-secondary)] font-bold text-sm">Loading habit...</p>
      </div>
    );
  }

  if (errorMsg && !habit) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 text-center px-5 pt-4">
        <p className="text-red-500 font-bold">{errorMsg}</p>
        <Link href="/dashboard" className="text-[var(--color-accent-green)] font-bold text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const habitColor = habit.color || "#34C759";

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <h1 className="text-base font-black text-[var(--color-text-primary)]">
          {isEditing ? "Edit Habit" : "Habit Details"}
        </h1>
        <div className="w-9" />
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-red-500/10 p-3 text-xs font-bold text-red-500 border border-red-500/20">
          ⚠️ {errorMsg}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6"
          >
            {/* Hero */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl shadow-sm border border-[var(--color-bg-tertiary)]/10"
                style={{ backgroundColor: habitColor + "18" }}
              >
                {habit.emoji || "✨"}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-black text-[var(--color-text-primary)]">
                  {habit.name}
                </h1>
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <span className="rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-text-secondary)] capitalize">
                    {habit.category}
                  </span>
                  <span className="rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-text-secondary)] capitalize">
                    {habit.frequency}
                  </span>
                  {habit.reminder_time && (
                    <span className="rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-text-secondary)]">
                      ⏰ {formatTime12h(habit.reminder_time)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div
              className="relative overflow-hidden rounded-3xl p-5 shadow-sm border border-[var(--color-bg-tertiary)]/20"
              style={{
                background: `linear-gradient(135deg, ${habitColor}12, var(--color-bg-secondary))`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-6 w-6 text-[var(--color-streak)] fill-[var(--color-streak)]" />
                    <span className="text-4xl font-black tabular-nums text-[var(--color-text-primary)]">
                      {currentStreak}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--color-text-secondary)]">
                    Day Streak
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Trophy className="h-4.5 w-4.5 text-[var(--color-xp)]" />
                    <span className="text-lg font-black text-[var(--color-xp)]">
                      {habit.longest_streak || 0}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-[var(--color-text-tertiary)]">
                    Best Streak
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleToggleComplete}
              className={cn(
                "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white shadow-md transition-all duration-300",
                isCompleted
                  ? "bg-[var(--color-accent-green)] shadow-[var(--shadow-glow-green)]"
                  : "bg-[var(--color-text-primary)]"
              )}
              style={!isCompleted ? { backgroundColor: habitColor } : undefined}
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
              <span>{isCompleted ? "Completed Today!" : "Mark Completed"}</span>
            </motion.button>

            {/* Detail Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-bg-tertiary)]/20 py-4 text-sm font-bold text-[var(--color-text-primary)] shadow-sm active:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Habit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 py-4 text-sm font-bold text-red-500 shadow-sm active:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6"
          >
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Habit Name
              </label>
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-bg-elevated)] px-4 border border-[var(--color-bg-tertiary)]/20 h-[56px]">
                {/* Emoji Circle with Shuffle */}
                <button
                  type="button"
                  onClick={handleShuffleEmoji}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] hover:scale-105 active:scale-95 transition-all text-2xl"
                >
                  {editEmoji}
                </button>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Drink Water"
                  className="flex-1 bg-transparent text-sm font-bold text-[var(--color-text-primary)] outline-none"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Daily Timing
              </label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full rounded-2xl bg-[var(--color-bg-elevated)] px-4 h-[56px] text-sm font-bold text-[var(--color-text-primary)] outline-none border border-[var(--color-bg-tertiary)]/20 focus:border-[var(--color-accent-green)]/60 shadow-sm transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Category
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat, i) => {
                  const active = editCategory === cat.id;
                  const catColor = colorForCategory(cat.id);
                  return (
                    <motion.button
                      key={cat.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setEditCategory(cat.id)}
                      className={cn(
                        "relative flex items-center gap-1.5 rounded-[14px] px-3.5 py-2.5 text-[13px] font-bold overflow-hidden border",
                        active
                          ? "text-white border-transparent"
                          : "bg-[var(--color-bg-elevated)] border-[var(--color-bg-tertiary)]/20 text-[var(--color-text-secondary)] shadow-sm"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="editCategoryBg"
                          className="absolute inset-0"
                          style={{ background: catColor, borderRadius: 14 }}
                          transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10 text-[14px]">{cat.icon}</span>
                      <span className="relative z-10">{cat.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Frequency Select */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Frequency
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {FREQUENCIES.map((f) => {
                  const active = editFrequency === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setEditFrequency(f.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl py-3.5 px-4 border transition-all active:scale-95",
                        active
                          ? "bg-[var(--color-bg-elevated)] border-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-text-primary)] text-[var(--color-text-primary)]"
                          : "bg-[var(--color-bg-secondary)]/50 border-transparent text-[var(--color-text-secondary)]"
                      )}
                    >
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-sm font-bold">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Days Weekday Selector */}
            <AnimatePresence>
              {editFrequency === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label className="text-xs font-black uppercase tracking-wider text-[var(--color-text-tertiary)] mt-2">
                    Active Days
                  </label>
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
                      const active = editCustomDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? editCustomDays.filter((d) => d !== day.value)
                              : [...editCustomDays, day.value];
                            setEditCustomDays(next);
                          }}
                          className={cn(
                            "flex h-[44px] flex-1 items-center justify-center rounded-2xl text-[13px] font-black transition-all border active:scale-90",
                            active
                              ? "bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] shadow-sm border-[var(--color-text-primary)]"
                              : "bg-[var(--color-bg-elevated)] border-[var(--color-bg-tertiary)]/20 text-[var(--color-text-secondary)]"
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


            {/* Save / Cancel buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-text-primary)] py-4 text-sm font-bold text-white shadow-md disabled:opacity-50"
              >
                {isSaving ? "Saving Updates..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg(null);
                }}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-secondary)] py-4 text-sm font-bold text-[var(--color-text-secondary)] border border-[var(--color-bg-tertiary)]/20"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
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

function colorForCategory(cat: HabitCategory): string {
  switch (cat) {
    case "fitness": return "#34C759";
    case "learning": return "#007AFF";
    case "health": return "#FF2D55";
    case "mindfulness": return "#5856D6";
    case "finance": return "#FF9500";
    case "social": return "#FFCC00";
    case "work": return "#8E8E93";
    case "creative": return "#AF52DE";
    default: return "#8E8E93";
  }
}
