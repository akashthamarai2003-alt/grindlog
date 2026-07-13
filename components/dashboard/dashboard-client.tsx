"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Bell, Quote } from "lucide-react";
import { staggerContainer, staggerItem } from "@/animations/springs";
import { HabitCard } from "@/components/habits/habit-card";
import { Confetti } from "@/components/gamification/confetti";
import { toggleHabitCompletion } from "@/app/actions/habits";

interface Profile {
  display_name: string;
  xp: number;
  level: number;
}

interface HabitWithLog {
  id: string;
  name: string;
  emoji: string;
  targetCount: number;
  targetUnit: string;
  color: string;
  currentStreak: number;
  isCompleted: boolean;
}

interface DashboardClientProps {
  profile: Profile;
  initialHabits: HabitWithLog[];
  todayDateStr: string;
}

export function DashboardClient({ profile, initialHabits, todayDateStr }: DashboardClientProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  // We use optimistic updates for instant feedback
  const [optimisticHabits, setOptimisticHabits] = useState(initialHabits);
  const [optimisticXp, setOptimisticXp] = useState(profile.xp);

  const completedCount = optimisticHabits.filter((h) => h.isCompleted).length;
  const totalCount = optimisticHabits.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Calculate level progress (assuming 1000 XP per level)
  const currentLevelXp = optimisticXp % 1000;
  const levelProgressPct = currentLevelXp / 1000;
  const nextLevelTotalXp = (profile.level * 1000);

  const handleHabitComplete = async (habitId: string, currentCompletedStatus: boolean, streak: number) => {
    const newStatus = !currentCompletedStatus;
    
    // Optimistic UI update
    if (newStatus) {
      setShowConfetti(true);
      setOptimisticXp(prev => prev + 10);
    } else {
      setOptimisticXp(prev => Math.max(0, prev - 10)); // Revert if un-checked
    }

    setOptimisticHabits(prev => 
      prev.map(h => h.id === habitId ? { ...h, isCompleted: newStatus } : h)
    );

    // Call server action
    try {
      await toggleHabitCompletion(habitId, todayDateStr, newStatus, streak, 10);
    } catch (e) {
      // Revert on failure
      setOptimisticHabits(initialHabits);
      setOptimisticXp(profile.xp);
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4 safe-top">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/profile">
          <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
            <div className="h-[2px] w-[18px] rounded-full bg-current" />
            <div className="h-[2px] w-[18px] rounded-full bg-current" />
            <div className="h-[2px] w-[18px] rounded-full bg-current" />
          </button>
        </Link>
        <Link href="/notifications" className="relative">
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors">
            <Bell className="h-[22px] w-[22px]" strokeWidth={2.5} />
          </button>
          <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-error)]" />
        </Link>
      </div>

      {/* Greeting */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Good Morning,</p>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-primary)] mt-0.5">
            {profile.display_name?.split(' ')[0] || "There"} 👋
          </h1>
        </div>
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[var(--color-bg-secondary)] shadow-sm bg-green-100 flex items-center justify-center">
           <span className="text-green-700 font-bold text-xl">{profile.display_name?.charAt(0).toUpperCase() || "?"}</span>
        </div>
      </div>

      {/* Hero Card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#34c759] to-[#28a745] p-5 shadow-[var(--shadow-glow-green)] text-white">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-[40px] font-extrabold tracking-tight leading-none">{completedCount}</h3>
            <p className="text-[13px] font-semibold text-white mt-1">Done Today ✨</p>
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
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{progressPct}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-white">Level {profile.level}</span>
            <span className="text-white/90">Next Level</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000"
              style={{ width: `${levelProgressPct * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-white/90">
            <span>{optimisticXp.toLocaleString()} XP</span>
            <span>{nextLevelTotalXp.toLocaleString()} XP</span>
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
          {optimisticHabits.length === 0 ? (
            <div className="text-center p-6 bg-[var(--color-bg-secondary)] rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">No active habits today.</p>
              <Link href="/habits" className="mt-2 inline-block text-xs font-bold text-[var(--color-accent-green)]">
                + Add a new habit
              </Link>
            </div>
          ) : (
            optimisticHabits.map((habit) => (
              <motion.div key={habit.id} variants={staggerItem}>
                <HabitCard 
                  habit={habit} 
                  onComplete={() => handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak)} 
                />
              </motion.div>
            ))
          )}
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
