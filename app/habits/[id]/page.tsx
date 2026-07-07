"use client";

import { use } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  Flame,
  Trophy,
  Check,
  Trash2,
  Edit3,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Mock habit data
  const habit = {
    id,
    name: "Morning Run",
    emoji: "🏃",
    category: "Fitness",
    frequency: "Daily",
    currentStreak: 42,
    longestStreak: 56,
    color: "#34C759",
    description: "A refreshing morning run to kickstart your day with energy and clarity.",
    targetCount: 1,
    targetUnit: "times",
    totalCompletions: 847,
    totalSkips: 23,
    completionRate: 89,
  };

  // Mock week data
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekStatus = [true, true, true, true, false, false, false];

  // Mock history
  const history = [
    { date: "Jul 1", status: "completed" },
    { date: "Jun 30", status: "completed" },
    { date: "Jun 29", status: "skipped" },
    { date: "Jun 28", status: "completed" },
    { date: "Jun 27", status: "completed" },
    { date: "Jun 26", status: "completed" },
    { date: "Jun 25", status: "completed" },
  ];

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
          <MoreHorizontal className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl"
          style={{ backgroundColor: habit.color + "18" }}
        >
          {habit.emoji}
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
            {habit.name}
          </h1>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {habit.category}
            </span>
            <span className="rounded-full bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
              {habit.frequency}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent-green-light)] to-[var(--color-bg-secondary)] p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-5 w-5 text-[var(--color-streak)]" />
              <span className="text-4xl font-extrabold tabular-nums text-[var(--color-text-primary)]">
                {habit.currentStreak}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
              Day Streak
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Trophy className="h-4 w-4 text-[var(--color-xp)]" />
              <span className="text-lg font-bold text-[var(--color-xp)]">
                {habit.longestStreak}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Best Streak
            </p>
          </div>
        </div>
      </motion.div>

      {/* This Week */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.15 }}
        className="rounded-2xl bg-[var(--color-bg-secondary)] p-4"
      >
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          This Week
        </h3>
        <div className="flex justify-between">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                {day}
              </span>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs",
                  weekStatus[i]
                    ? "bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]"
                    : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
                )}
              >
                {weekStatus[i] ? <Check className="h-3.5 w-3.5" /> : "—"}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Complete Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent-green)] text-base font-semibold text-white shadow-lg shadow-[var(--color-accent-green)]/25"
        style={{ backgroundColor: habit.color }}
      >
        <Check className="h-5 w-5" />
        Mark Complete
      </motion.button>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          History
        </h3>
        <div className="rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden">
          {history.map((entry, i) => (
            <div key={i}>
              {i > 0 && <div className="mx-4 h-px bg-[var(--color-bg-tertiary)]" />}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {entry.date}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    entry.status === "completed"
                      ? "text-[var(--color-accent-green)]"
                      : "text-[var(--color-warning)]"
                  )}
                >
                  {entry.status === "completed" ? "✓ Completed" : "✗ Skipped"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-bg-secondary)] py-3.5 text-sm font-semibold text-[var(--color-text-primary)]">
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--color-error)]/10 py-3.5 text-sm font-semibold text-[var(--color-error)]">
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}
