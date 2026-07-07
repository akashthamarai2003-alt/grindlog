"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trophy, Lock, Flame, Target, TreeDeciduous, Sparkles, Crown } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

const ACHIEVEMENTS = [
  { id: "1", name: "First Steps", desc: "Complete your first habit", emoji: "🏆", category: "streaks", unlocked: true, date: "Jul 1, 2026", xp: 100 },
  { id: "2", name: "Weekly Warrior", desc: "7-day streak on any habit", emoji: "🔥", category: "streaks", unlocked: true, date: "Jul 2, 2026", xp: 200 },
  { id: "3", name: "Early Bird", desc: "Complete all habits before 9 AM for 7 days", emoji: "🌅", category: "consistency", unlocked: true, date: "Jun 28, 2026", xp: 150 },
  { id: "4", name: "First Leaf", desc: "Tree grows its first leaf", emoji: "🍃", category: "tree", unlocked: true, date: "Jun 20, 2026", xp: 100 },
  { id: "5", name: "Habit Formed", desc: "21-day streak on any habit", emoji: "💪", category: "streaks", unlocked: false, progress: 14, target: 21 },
  { id: "6", name: "Perfect Week", desc: "All habits done every day for a week", emoji: "⭐", category: "consistency", unlocked: false, progress: 4, target: 7 },
  { id: "7", name: "Butterfly Effect", desc: "First butterfly on your tree", emoji: "🦋", category: "tree", unlocked: false, progress: 18, target: 21 },
  { id: "8", name: "Monthly Master", desc: "30-day streak on any habit", emoji: "📅", category: "streaks", unlocked: false, progress: 22, target: 30 },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Trophy },
  { id: "streaks", label: "Streaks", icon: Flame },
  { id: "consistency", label: "Consistency", icon: Target },
  { id: "tree", label: "Tree", icon: TreeDeciduous },
  { id: "special", label: "Special", icon: Sparkles },
  { id: "legendary", label: "Legendary", icon: Crown },
];

export default function AchievementsPage() {
  const router = useRouter();
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]"
        >
          <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
            Achievements
          </h1>
        </div>
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="rounded-2xl bg-[var(--color-bg-secondary)] p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {unlocked} of {ACHIEVEMENTS.length} Unlocked
          </span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            {Math.round((unlocked / ACHIEVEMENTS.length) * 100)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-xp)] to-[var(--color-accent-green)]"
          />
        </div>
      </motion.div>

      {/* Category pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap",
              cat.id === "all"
                ? "bg-[var(--color-accent-green)] text-white"
                : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
            )}
          >
            <cat.icon className="h-3 w-3" />
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springs.default, delay: 0.15 + i * 0.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl p-4 text-center",
              achievement.unlocked
                ? "bg-[var(--color-bg-secondary)]"
                : "bg-[var(--color-bg-tertiary)]/50"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl",
                achievement.unlocked
                  ? "bg-[var(--color-accent-green-light)]"
                  : "bg-[var(--color-bg-tertiary)] grayscale"
              )}
            >
              {achievement.emoji}
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-bold",
                  achievement.unlocked
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)]"
                )}
              >
                {achievement.name}
              </p>
              <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
                {achievement.desc}
              </p>
            </div>
            {achievement.unlocked ? (
              <div className="flex items-center gap-1 rounded-full bg-[var(--color-accent-green)]/10 px-2 py-0.5">
                <Trophy className="h-3 w-3 text-[var(--color-accent-green)]" />
                <span className="text-[10px] font-bold text-[var(--color-accent-green)]">
                  +{achievement.xp} XP
                </span>
              </div>
            ) : (
              <div className="w-full">
                <div className="h-1 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent-green)]/40"
                    style={{
                      width: `${((achievement.progress || 0) / (achievement.target || 1)) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                  {achievement.progress}/{achievement.target}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}
