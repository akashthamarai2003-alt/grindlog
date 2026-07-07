"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Bell, Quote } from "lucide-react";
import { staggerContainer, staggerItem } from "@/animations/springs";
import { getLevel } from "@/lib/utils";
import { HabitCard } from "@/components/habits/habit-card";
import { Confetti } from "@/components/gamification/confetti";

const MOCK_HABITS = [
  {
    id: "1",
    name: "Wake Up Early",
    emoji: "☀️",
    category: "health" as const,
    currentStreak: 12,
    longestStreak: 12,
    targetCount: 1,
    targetUnit: "5:00 AM",
    color: "#34C759",
    status: "completed" as const,
    isCompleted: true,
  },
  {
    id: "2",
    name: "Workout",
    emoji: "🏋️",
    category: "fitness" as const,
    currentStreak: 4,
    longestStreak: 10,
    targetCount: 45,
    targetUnit: "min",
    color: "#007AFF",
    status: "completed" as const,
    isCompleted: true,
  },
  {
    id: "3",
    name: "Reading",
    emoji: "📖",
    category: "learning" as const,
    currentStreak: 2,
    longestStreak: 5,
    targetCount: 20,
    targetUnit: "min",
    color: "#FF9500",
    status: "completed" as const,
    isCompleted: true,
  },
  {
    id: "4",
    name: "Meditation",
    emoji: "🧘",
    category: "mindfulness" as const,
    currentStreak: 0,
    longestStreak: 30,
    targetCount: 15,
    targetUnit: "min",
    color: "#5856D6",
    status: "pending" as const,
    isCompleted: false,
  },
  {
    id: "5",
    name: "Cold Shower",
    emoji: "🚿",
    category: "health" as const,
    currentStreak: 5,
    longestStreak: 15,
    targetCount: 2,
    targetUnit: "min",
    color: "#5AC8FA",
    status: "completed" as const,
    isCompleted: true,
  },
];

export default function DashboardPage() {
  const levelInfo = getLevel(840);
  const [showConfetti, setShowConfetti] = useState(false);
  const [habits] = useState(MOCK_HABITS);

  const completedCount = habits.filter((h) => h.isCompleted).length;
  const totalCount = habits.length;
  const progressPct = Math.round((completedCount / (totalCount || 1)) * 100);

  const handleHabitComplete = () => {
    setShowConfetti(true);
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4 safe-top">
      {/* Confetti */}
      <Confetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
          <div className="h-[2px] w-[18px] rounded-full bg-current" />
          <div className="h-[2px] w-[18px] rounded-full bg-current" />
          <div className="h-[2px] w-[18px] rounded-full bg-current" />
        </button>
        <div className="relative">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-primary)]">
            <Bell className="h-[22px] w-[22px]" strokeWidth={2.5} />
          </button>
          <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-error)]" />
        </div>
      </div>

      {/* Greeting */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Good Morning,</p>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mt-0.5">Akash 👋</h1>
        </div>
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[var(--color-bg-secondary)] shadow-sm">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Hero Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#34c759] to-[#28a745] p-5 shadow-[var(--shadow-glow-green)] text-white">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[40px] font-extrabold tracking-tight leading-none">91</h3>
            <p className="text-[13px] font-semibold text-white mt-1">Day Streak 🔥</p>
          </div>
          
          {/* Progress Ring */}
          <div className="relative flex h-[76px] w-[76px] items-center justify-center">
            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="fill-none stroke-white/20 stroke-[8]" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="fill-none stroke-white stroke-[8]"
                strokeLinecap="round"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * progressPct) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{progressPct}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-white">Level 14</span>
            <span className="text-white/90">Next Level</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${levelInfo.progress * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-white/90">
            <span>12,550 XP</span>
            <span>13,800 XP</span>
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3 mt-4"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            Today's Habits
          </h2>
          <Link href="/habits" className="text-[11px] font-bold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
            See All
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {MOCK_HABITS.map((habit) => (
            <motion.div key={habit.id} variants={staggerItem}>
              <HabitCard habit={habit} onComplete={handleHabitComplete} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Today's Quote */}
      <div className="flex flex-col gap-3 mt-6">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Today's Quote</h2>
        <div className="relative flex min-h-[130px] items-center rounded-2xl bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-card)]">
          <div className="pr-16 relative z-10">
            <Quote className="mb-2 h-6 w-6 text-[var(--color-accent-green)]/30 fill-[var(--color-accent-green)]/10" />
            <p className="text-[12px] font-semibold leading-relaxed text-[var(--color-text-secondary)] italic">
              "Discipline is doing what needs to be done, even when you don't feel like it."
            </p>
            <p className="mt-3 text-[10px] font-bold text-[var(--color-text-tertiary)]">- Unknown</p>
          </div>
          <div className="absolute bottom-2 right-4 text-7xl opacity-90 drop-shadow-sm select-none">
            🪴
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
