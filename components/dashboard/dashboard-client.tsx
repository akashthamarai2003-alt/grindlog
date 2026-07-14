"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Bell, Quote, Trophy, Flame, Plus } from "lucide-react";
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

const QUOTES = [
  { text: "Discipline is doing what needs to be done, even when you don't feel like it.", author: "Unknown" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Success is the product of daily habits—not once-in-a-lifetime transformations.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" }
];

export function DashboardClient({ profile, initialHabits, todayDateStr }: DashboardClientProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [optimisticHabits, setOptimisticHabits] = useState(initialHabits);
  const [optimisticXp, setOptimisticXp] = useState(profile.xp);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const completedCount = optimisticHabits.filter((h) => h.isCompleted).length;
  const totalCount = optimisticHabits.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isPerfectDay = totalCount > 0 && completedCount === totalCount;

  // Calculate level progress (assuming 1000 XP per level)
  const currentLevelXp = optimisticXp % 1000;
  const levelProgressPct = currentLevelXp / 1000;
  const nextLevelTotalXp = (profile.level * 1000);

  // Generate week calendar for visual strip
  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + 1 + i); // Start from Monday
    return {
      dayStr: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      isToday: d.toDateString() === today.toDateString(),
      dateObj: d,
    };
  });

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
    <div className="flex flex-col gap-7 px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Good Morning,
          </p>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            {profile.display_name?.split(' ')[0] || "There"} <span className="inline-block origin-bottom-right animate-tree-sway">👋</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <div className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[var(--color-bg-secondary)] bg-[var(--color-error)]" />
          </Link>
          <Link href="/profile">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#34C759] to-[#28a745] text-white shadow-sm ring-2 ring-[var(--color-bg-primary)] ring-offset-1">
              <span className="font-bold text-lg">{profile.display_name?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-[28px] bg-[var(--color-bg-elevated)] p-6 shadow-xl ring-1 ring-[var(--color-bg-tertiary)]/50"
      >
        {/* Subtle background glow effect */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-accent-green)]/10 blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-4xl font-black tracking-tight text-[var(--color-text-primary)]">{completedCount}<span className="text-[var(--color-text-tertiary)]">/{totalCount}</span></h3>
            <p className="text-sm font-bold text-[var(--color-text-secondary)]">Done Today ✨</p>
            
            {/* Streak Badge inside Hero */}
            <div className="mt-2 flex items-center gap-1.5 w-max rounded-full bg-[var(--color-streak)]/10 px-2.5 py-1 text-xs font-bold text-[#ff9500] ring-1 ring-[#ff9500]/20">
              <Flame className="h-3.5 w-3.5 fill-[#ff9500]" />
              {optimisticHabits.reduce((acc, h) => Math.max(acc, h.currentStreak), 0)} Day Streak
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="relative flex h-[90px] w-[90px] items-center justify-center">
            <svg className="h-full w-full rotate-[-90deg] drop-shadow-md" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="fill-none stroke-[var(--color-bg-secondary)] stroke-[8]" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="fill-none stroke-[var(--color-accent-green)] stroke-[8]"
                strokeLinecap="round"
                strokeDasharray="263.89"
                strokeDashoffset={263.89 - (263.89 * Math.max(progressPct, 1)) / 100}
                style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-[var(--color-text-primary)]">{progressPct}%</span>
            </div>
          </div>
        </div>
        
        {/* Level & XP Bar */}
        <div className="relative z-10 mt-6 flex flex-col gap-2 rounded-2xl bg-[var(--color-bg-secondary)]/50 p-3 ring-1 ring-[var(--color-bg-tertiary)]">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--color-text-primary)]">Level {profile.level}</span>
            <span className="text-[var(--color-text-tertiary)]">Next Level</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#34C759] to-[#00C7BE] transition-all duration-1000 ease-out"
              style={{ width: `${levelProgressPct * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-text-secondary)]">
            <span>{optimisticXp.toLocaleString()} XP</span>
            <span>{nextLevelTotalXp.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Mini Week Calendar Strip */}
      <div className="flex justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">{day.dayStr}</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
              day.isToday 
                ? isPerfectDay
                  ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                  : "ring-2 ring-[var(--color-accent-green)] ring-offset-2 ring-offset-[var(--color-bg-elevated)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                : day.dateObj < today
                  ? "bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)]" // Mock past days as completed
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
            }`}>
              {day.dateObj.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Perfect Day Banner */}
      <AnimatePresence>
        {isPerfectDay && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FFD700]/20 via-[#FF9500]/20 to-[#FFD700]/20 py-3 text-sm font-extrabold text-[#d48806] ring-1 ring-[#FFD700]/30 shadow-sm"
          >
            <Trophy className="h-4 w-4" />
            Perfect Day Achieved!
            <Trophy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Habits */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">
              Today's Habits
            </h2>
            <Link href="/habits/new" className="inline-flex">
              <button 
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/25 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Add Habit"
              >
                <Plus className="h-4 w-4" strokeWidth={3.5} />
              </button>
            </Link>
          </div>
          <Link href="/habits" className="rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            See All
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {optimisticHabits.length === 0 ? (
            <div className="text-center p-6 bg-[var(--color-bg-elevated)] rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No active habits today.</p>
              <Link href="/habits/new" className="mt-2 inline-block rounded-full bg-[var(--color-accent-green)]/10 px-4 py-2 text-xs font-bold text-[var(--color-accent-green)]">
                + Add a new habit
              </Link>
            </div>
          ) : (
            <>
              {optimisticHabits.map((habit) => (
                <motion.div key={habit.id} variants={staggerItem}>
                  <HabitCard 
                    habit={habit} 
                    onComplete={() => handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak)} 
                  />
                </motion.div>
              ))}
              <motion.div variants={staggerItem}>
                <Link 
                  href="/habits/new" 
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--color-bg-tertiary)] py-4 text-sm font-semibold text-[var(--color-text-tertiary)] transition-all hover:border-[var(--color-accent-gold)]/40 hover:text-[var(--color-accent-gold)] bg-[var(--color-bg-elevated)]"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <Plus className="h-4 w-4" />
                  Add a Habit
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Today's Quote */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)] px-1">Inspiration</h2>
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-6 shadow-lg">
          <Quote className="absolute -right-4 -top-4 h-24 w-24 text-white/10" />
          <div className="relative z-10 flex flex-col gap-4">
            <p className="text-[15px] font-bold leading-relaxed text-white">
              "{QUOTES[quoteIdx].text}"
            </p>
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-6 bg-white/50" />
              <p className="text-xs font-black text-white/80 uppercase tracking-wider">{QUOTES[quoteIdx].author}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
