"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import Link from "next/link";
import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
  Activity,
  Footprints,
  Bike,
  Waves,
  Zap,
  Trash2,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/services/supabase/client";

interface Workout {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned: number;
  date: string;
  created_at: string;
  notes?: string;
}

const WEEKLY_GOAL_MINUTES = 150;

const WORKOUT_CONFIG: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  strength: { icon: Dumbbell, color: "text-[#007AFF]", bg: "bg-[#007AFF]/10", label: "Strength" },
  cardio: { icon: Activity, color: "text-[#FF2D55]", bg: "bg-[#FF2D55]/10", label: "Cardio" },
  yoga: { icon: Flame, color: "text-[#FF9500]", bg: "bg-[#FF9500]/10", label: "Yoga" },
  walking: { icon: Footprints, color: "text-[#34C759]", bg: "bg-[#34C759]/10", label: "Walking" },
  cycling: { icon: Bike, color: "text-[#5856D6]", bg: "bg-[#5856D6]/10", label: "Cycling" },
  swimming: { icon: Waves, color: "text-[#00C7BE]", bg: "bg-[#00C7BE]/10", label: "Swimming" },
  hiit: { icon: Zap, color: "text-[#FFD60A]", bg: "bg-[#FFD60A]/10", label: "HIIT" },
};

const DEFAULT_CONFIG = { icon: Activity, color: "text-[var(--color-text-secondary)]", bg: "bg-[var(--color-bg-tertiary)]", label: "Other" };

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "cardio", label: "Cardio" },
  { id: "yoga", label: "Yoga" },
  { id: "other", label: "Other" },
];

const QUICK_ADD = [
  { type: "strength", label: "Strength", icon: Dumbbell },
  { type: "cardio", label: "Cardio", icon: Activity },
  { type: "yoga", label: "Yoga", icon: Flame },
  { type: "walking", label: "Walk", icon: Footprints },
  { type: "cycling", label: "Cycle", icon: Bike },
];

function getConfig(type: string) {
  return WORKOUT_CONFIG[type] || DEFAULT_CONFIG;
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getWorkoutDate(w: Workout) {
  return w.date || w.created_at?.slice(0, 10);
}

/** Animated number that tweens from its previous value to the new one */
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(display, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{display}</span>;
}

export default function FitnessPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("fitness_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setWorkouts(data as Workout[]);
      }
      setIsLoading(false);
    }
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    const { error } = await supabase.from("fitness_logs").delete().eq("id", id);
    if (error) {
      // revert silently on failure is out of scope here; log for now
      console.error(error);
    }
    setDeletingId(null);
  }

  // ---- Derived data ----
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
  }, []);

  const last7Isos = useMemo(() => new Set(last7Days.map(toIso)), [last7Days]);

  const weekWorkouts = useMemo(
    () => workouts.filter((w) => last7Isos.has(getWorkoutDate(w))),
    [workouts, last7Isos]
  );

  const weeklyMinutes = weekWorkouts.reduce((s, w) => s + (w.duration_minutes || 0), 0);
  const weeklyCalories = weekWorkouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const avgDuration = workouts.length ? Math.round(totalMinutes / workouts.length) : 0;

  const progressPct = Math.min(100, Math.round((weeklyMinutes / WEEKLY_GOAL_MINUTES) * 100));
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * progressPct) / 100;

  const streak = useMemo(() => {
    const dates = new Set(workouts.map(getWorkoutDate));
    let count = 0;
    const cursor = new Date();
    const todayIso = toIso(cursor);
    if (!dates.has(todayIso)) cursor.setDate(cursor.getDate() - 1);
    while (dates.has(toIso(cursor))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [workouts]);

  const chartData = useMemo(() => {
    const todayIso = toIso(new Date());
    return last7Days.map((d) => {
      const iso = toIso(d);
      const dayWorkouts = workouts.filter((w) => getWorkoutDate(w) === iso);
      const minutes = dayWorkouts.reduce((s, w) => s + (w.duration_minutes || 0), 0);
      return {
        iso,
        label: d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0),
        minutes,
        isToday: iso === todayIso,
      };
    });
  }, [last7Days, workouts]);

  const maxMinutes = Math.max(...chartData.map((c) => c.minutes), 1);

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === "all") return workouts;
    if (activeFilter === "other") {
      return workouts.filter((w) => !WORKOUT_CONFIG[w.workout_type]);
    }
    return workouts.filter((w) => w.workout_type === activeFilter);
  }, [workouts, activeFilter]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="flex flex-col min-h-dvh px-5 pb-8 pt-4 safe-top bg-[var(--color-bg-primary)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-0.5"
          >
            {greeting}
          </motion.p>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Fitness
          </h1>
        </div>
        <Link href="/fitness/new">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            transition={springs.default}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF3B30] text-white shadow-lg shadow-[#FF2D55]/30"
          >
            <motion.div whileTap={{ rotate: 90 }} transition={springs.default}>
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Streak banner */}
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={springs.default}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9500]/15 to-[#FF2D55]/15 px-4 py-3"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-5 w-5 text-[#FF9500]" fill="#FF9500" />
            </motion.div>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              {streak} day streak — keep it going!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Goal Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="flex items-center gap-5 rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] mb-4"
      >
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-bg-tertiary)"
              strokeWidth="10"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF2D55" />
                <stop offset="100%" stopColor="#FF9500" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              <AnimatedNumber value={progressPct} />%
            </span>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]">
              Weekly
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              <AnimatedNumber value={weeklyMinutes} />/{WEEKLY_GOAL_MINUTES} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#FF9500]" />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              <AnimatedNumber value={weeklyCalories} /> kcal this week
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#5856D6]" />
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              {weekWorkouts.length} workout{weekWorkouts.length === 1 ? "" : "s"} logged
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.15 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: "Total kcal", value: totalCalories, icon: Flame, color: "text-[#FF9500]", bg: "bg-[#FF9500]/10" },
          { label: "Total min", value: totalMinutes, icon: Clock, color: "text-[#007AFF]", bg: "bg-[#007AFF]/10" },
          { label: "Avg min", value: avgDuration, icon: TrendingUp, color: "text-[#34C759]", bg: "bg-[#34C759]/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col rounded-2xl bg-[var(--color-bg-elevated)] p-3.5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]"
          >
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full mb-2", stat.bg, stat.color)}>
              <stat.icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">
              <AnimatedNumber value={stat.value} />
            </span>
            <span className="text-[10px] font-bold uppercase text-[var(--color-text-tertiary)]">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* 7-day activity chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)] mb-6"
      >
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Last 7 days</h2>
        <div className="flex items-end justify-between gap-2 h-24">
          {chartData.map((d, i) => (
            <div key={d.iso} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-16 w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, d.minutes > 0 ? 12 : 4)}%` }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "w-2.5 rounded-full",
                    d.isToday
                      ? "bg-gradient-to-t from-[#FF2D55] to-[#FF9500]"
                      : d.minutes > 0
                      ? "bg-[#007AFF]/60"
                      : "bg-[var(--color-bg-tertiary)]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  d.isToday ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"
                )}
              >
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick add */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.25 }}
        className="mb-6"
      >
        <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">Quick add</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {QUICK_ADD.map((q, i) => {
            const config = getConfig(q.type);
            return (
              <Link key={q.type} href={`/fitness/new?type=${q.type}`}>
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springs.default, delay: 0.3 + i * 0.05 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-bg-secondary)] pl-2.5 pr-4 py-2"
                >
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-full", config.bg, config.color)}>
                    <q.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text-primary)] whitespace-nowrap">
                    {q.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.3 }}
        className="flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] p-1 mb-4 overflow-x-auto scrollbar-none"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className="relative flex-1 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors"
          >
            {activeFilter === tab.id && (
              <motion.div
                layoutId="filterPill"
                transition={springs.default}
                className="absolute inset-0 rounded-full bg-[var(--color-bg-elevated)] shadow-sm"
              />
            )}
            <span
              className={cn(
                "relative z-10",
                activeFilter === tab.id
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)]"
              )}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Workouts list */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recent Workouts</h2>
          <span className="text-xs font-bold text-[var(--color-text-tertiary)]">
            {filteredWorkouts.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                className="h-20 rounded-2xl bg-[var(--color-bg-secondary)]"
              />
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springs.default}
            className="flex flex-col items-center justify-center py-14 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] mb-4"
            >
              <Dumbbell className="h-7 w-7 text-[var(--color-text-tertiary)]" />
            </motion.div>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              {activeFilter === "all"
                ? "No workouts logged yet. Go get a sweat in!"
                : "No workouts in this category yet."}
            </p>
            <Link href="/fitness/new">
              <motion.span
                whileTap={{ scale: 0.95 }}
                className="mt-4 inline-block rounded-full bg-[#FF2D55] px-5 py-2.5 text-xs font-bold text-white"
              >
                Log a workout
              </motion.span>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {filteredWorkouts.map((workout, i) => {
                const config = getConfig(workout.workout_type);
                const Icon = config.icon;

                return (
                  <motion.div
                    key={workout.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: deletingId === workout.id ? 0.4 : 1, x: 0 }}
                    exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
                    transition={{ ...springs.default, delay: 0.05 * i }}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    {/* Delete backdrop */}
                    <div className="absolute inset-0 flex items-center justify-end bg-[#FF3B30] px-5">
                      <Trash2 className="h-5 w-5 text-white" />
                    </div>

                    {/* Foreground draggable card */}
                    <motion.div
                      drag="x"
                      dragDirectionLock
                      dragConstraints={{ left: -88, right: 0 }}
                      dragElastic={{ left: 0.4, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -64) handleDelete(workout.id);
                      }}
                      className="relative z-10 flex items-center gap-4 rounded-2xl bg-[var(--color-bg-secondary)] p-4 cursor-grab active:cursor-grabbing"
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shrink-0", config.bg, config.color)}>
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">
                          {config.label}
                        </h3>
                        <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">
                          {workout.notes || workout.date}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
                          {workout.duration_minutes}m
                        </span>
                        <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">
                          {workout.calories_burned} kcal
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}