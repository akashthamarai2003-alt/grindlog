"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { Bell, Quote, Trophy, Flame, Plus, Sparkles, Target, Medal, Gift } from "lucide-react";
import { HabitCard } from "@/components/habits/habit-card";
import { Confetti } from "@/components/gamification/confetti";
import { toggleHabitCompletion, getHabitLogsForDate } from "@/app/actions/habits";
import { isHabitScheduled } from "@/lib/habit-utils";
import { createClient } from "@/lib/services/supabase/client";

const NotificationPrompt = dynamic(() => import('@/components/notifications/notification-prompt').then(mod => mod.NotificationPrompt), {
  ssr: false,
});

interface Profile {
  display_name: string;
  xp: number;
  level: number;
  coins?: number;
}

interface HabitWithLog {
  id: string;
  name: string;
  emoji: string;
  frequency?: string;
  customDays?: number[] | null;
  targetCount: number;
  targetUnit: string;
  color: string;
  currentStreak: number;
  isCompleted: boolean;
  preferredTime?: string;
  reminderTime?: string | null;
  createdAt?: string;
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
  const supabase = createClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const [optimisticHabits, setOptimisticHabits] = useState(initialHabits);
  const [optimisticXp, setOptimisticXp] = useState(profile.xp);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [selectedDateStr, setSelectedDateStr] = useState(todayDateStr);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [cheatConfirm, setCheatConfirm] = useState<{habitId: string, currentCompletedStatus: boolean, streak: number} | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }
    async function loadLogs() {
      setIsFetchingLogs(true);
      const logs = await getHabitLogsForDate(selectedDateStr);
      const logsMap = new Map(logs.map((l: any) => [l.habit_id, l.status]));
      setOptimisticHabits(prev => prev.map(h => ({
        ...h,
        isCompleted: logsMap.get(h.id) === "completed"
      })));
      setIsFetchingLogs(false);
    }
    loadLogs();
  }, [selectedDateStr, hasMounted]);

  useEffect(() => {
    async function loadUnreadCount() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("in_app_notifications")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      setUnreadCount(count || 0);
    }
    loadUnreadCount();
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const visibleHabits = useMemo(() => {
    return optimisticHabits.filter(h => {
      // 1. Must be created on or before the selected date
      if (h.createdAt) {
        const createdDateStr = h.createdAt.split("T")[0];
        if (createdDateStr > selectedDateStr) return false;
      }
      
      // 2. Must be scheduled for this day of the week
      const dateObj = new Date(selectedDateStr + "T12:00:00Z");
      return isHabitScheduled(h.frequency, h.customDays, dateObj);
    });
  }, [optimisticHabits, selectedDateStr]);

  const completedCount = visibleHabits.filter((h) => h.isCompleted).length;
  const totalCount = visibleHabits.length;
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
    const dayOfWeek = today.getDay() || 7; 
    d.setDate(today.getDate() - dayOfWeek + 1 + i); // Start from Monday
    const dateStr = d.toISOString().split("T")[0];
    return {
      dayStr: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
      isToday: dateStr === todayDateStr,
      isSelected: dateStr === selectedDateStr,
      dateObj: d,
      dateStr: dateStr,
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
      await toggleHabitCompletion(habitId, selectedDateStr, newStatus, streak, 10);
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
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Good Morning,
          </p>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            {profile.display_name?.split(' ')[0] || "There"} <span className="inline-block origin-bottom-right animate-tree-sway">👋</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/store" prefetch={true} className="flex flex-col items-center justify-center -mr-1 transition-transform hover:scale-105 active:scale-95">
            <div className="flex items-center gap-1.5 rounded-full bg-[#FFD60A]/15 px-3 py-1 shadow-sm ring-1 ring-[#FFD60A]/30">
              <span className="text-sm">🪙</span>
              <span className="text-sm font-black text-[#d48806]">{profile.coins || 0}</span>
            </div>
          </Link>
          <Link href="/tree" prefetch={true} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759] transition-colors shadow-sm ring-1 ring-[#34C759]/20 overflow-hidden">
            <Image src="/tree-in-the-wind.svg" width={32} height={32} alt="Tree" className="drop-shadow-sm scale-[1.15]" />
          </Link>
          <Link href="/notifications" prefetch={true} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 -mr-1 -mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-bg-primary)] bg-[var(--color-error)] text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Link>
          <Link href="/profile" prefetch={true}>
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#34C759] to-[#28a745] text-white shadow-sm ring-2 ring-[var(--color-bg-primary)] ring-offset-1">
              <span className="font-bold text-lg">{profile.display_name?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Hero Card */}
      <div 
        className="relative overflow-hidden rounded-[28px] bg-[var(--color-bg-elevated)] p-6 shadow-xl ring-1 ring-[var(--color-bg-tertiary)]/50 animate-in fade-in zoom-in-95 duration-500"
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
              {visibleHabits.reduce((acc, h) => Math.max(acc, h.currentStreak), 0)} Day Streak
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
      </div>

      {/* Gamification Quick Links */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x hide-scrollbar">
        {[
          { name: "Quests", icon: Target, path: "/quests", color: "from-[#FF2D55] to-[#AF52DE]" },
          { name: "Leaderboard", icon: Medal, path: "/leaderboard", color: "from-[#007AFF] to-[#32ADE6]" },
          { name: "Achievements", icon: Trophy, path: "/achievements", color: "from-[#FFD60A] to-[#FF9500]" },
          { name: "Season", icon: Gift, path: "/season", color: "from-[#34C759] to-[#00C7BE]" },
        ].map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className="snap-start shrink-0 flex items-center gap-2 rounded-[20px] bg-[var(--color-bg-elevated)] p-3 pr-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 transition-transform active:scale-95"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-sm`}>
              <item.icon className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Mini Week Calendar Strip */}
      <div className="flex justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50">
        {weekDays.map((day, i) => {
          const isFuture = day.dateStr > todayDateStr;
          return (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">{day.dayStr}</span>
            <div 
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
              day.isSelected
                ? isPerfectDay
                  ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                  : "ring-2 ring-[var(--color-accent-green)] ring-offset-2 ring-offset-[var(--color-bg-elevated)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                : day.isToday
                  ? "ring-1 ring-[var(--color-accent-green)]/50 text-[var(--color-accent-green)] hover:bg-[var(--color-bg-tertiary)] cursor-pointer"
                  : `bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--color-bg-tertiary)] cursor-pointer"}`
            }`}
              onClick={() => {
                if (!isFuture) setSelectedDateStr(day.dateStr);
              }}
            >
              {day.dateObj.getDate()}
            </div>
          </div>
        )})}
      </div>

      {/* Perfect Day Banner */}
      {isPerfectDay && (
          <div
            className="flex items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#FFD700]/20 via-[#FF9500]/20 to-[#FFD700]/20 py-3 text-sm font-extrabold text-[#d48806] ring-1 ring-[#FFD700]/30 shadow-sm animate-in fade-in zoom-in-95 duration-300"
          >
            <Trophy className="h-4 w-4" />
            Perfect Day Achieved!
            <Trophy className="h-4 w-4" />
          </div>
      )}

      {/* Today's Habits */}
      <div
        className={`flex flex-col gap-4 transition-opacity duration-300 ${isFetchingLogs ? "opacity-50 pointer-events-none" : "opacity-100"} animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both`}
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-tight text-[var(--color-text-primary)]">
              {selectedDateStr === todayDateStr ? "Today's Habits" : new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <Link href="/habits/new" prefetch={true} className="inline-flex">
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
          {visibleHabits.length === 0 ? (
            <div className="text-center p-6 bg-[var(--color-bg-elevated)] rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">No active habits today.</p>
              <Link href="/habits/new" className="mt-2 inline-block rounded-full bg-[var(--color-accent-green)]/10 px-4 py-2 text-xs font-bold text-[var(--color-accent-green)]">
                + Add a new habit
              </Link>
            </div>
          ) : (
            <>
              {visibleHabits.map((habit) => (
                <div key={habit.id}>
                  <HabitCard 
                    habit={habit} 
                    onComplete={() => {
                      if (!habit.isCompleted && selectedDateStr < todayDateStr) {
                        setCheatConfirm({ habitId: habit.id, currentCompletedStatus: habit.isCompleted, streak: habit.currentStreak });
                        return;
                      }
                      handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak);
                    }} 
                  />
                </div>
              ))}
              <div>
                <Link 
                  href="/habits/new" 
                  prefetch={true}
                  className="group relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#34C759]/40 py-4 text-sm font-bold text-[#34C759] transition-all hover:border-[#34C759] hover:bg-[#34C759]/10 bg-[var(--color-bg-elevated)]"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#34C759]/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  <Sparkles className="h-5 w-5 text-[#34C759] fill-[#34C759] animate-pulse drop-shadow-[0_0_8px_rgba(52,199,89,0.6)]" />
                  <span className="relative z-10 drop-shadow-sm">
                    Add a Habit
                  </span>
                  <Sparkles className="h-5 w-5 text-[#34C759] fill-[#34C759] animate-pulse drop-shadow-[0_0_8px_rgba(52,199,89,0.6)]" style={{ animationDelay: '300ms' }} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's Quote */}
      <div 
        className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both"
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
      </div>
      
      {/* Notification Prompt (only shows if not enabled) */}
      <NotificationPrompt variant="modal" />

      <div className="h-6" />

      {/* ── Anti-Cheat Modal ── */}
      {cheatConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col items-center text-center gap-4 border-2 border-[#FF3B30]/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-14 h-14 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-1">
              <span className="text-3xl">🛑</span>
            </div>
            <h2 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Don't cheat yourself!</h2>
            <p className="text-[13px] font-bold text-[var(--color-text-secondary)] leading-relaxed">
              If you really completed this habit on this day, then only check in. Did you actually do it?
            </p>
            
            <div className="flex gap-2 w-full mt-3">
              <button
                onClick={() => setCheatConfirm(null)}
                className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleHabitComplete(cheatConfirm.habitId, cheatConfirm.currentCompletedStatus, cheatConfirm.streak);
                  setCheatConfirm(null);
                }}
                className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[#34C759] text-white shadow-[0_0_20px_rgba(52,199,89,0.4)] active:scale-95 transition-transform"
              >
                Yes, I did it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
