"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  ArrowDown, 
  Flame, 
  Target, 
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { DonutChart } from "@/components/analytics/donut-chart";
import { subDays, format, isSameDay, isSameMonth, subMonths } from "date-fns";
import type { Database } from "@/types/database";

type Habit = Database["public"]["Tables"]["habits"]["Row"];
type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];

const periods = ["Week", "Month", "Year"] as const;
type Period = (typeof periods)[number];

interface ChartDataPoint {
  day: string;
  rate: number;
}

interface DonutDataPoint {
  name: string;
  value: number;
  color: string;
}

interface HighlightCardProps {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  title: string;
  value: string;
  valueColor?: string;
  delay?: number;
  className?: string;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fitness: "#34C759",
  Learning: "#007AFF",
  Health: "#FF9500",
  Mindfulness: "#5856D6",
  Finance: "#FF3B30",
  Other: "#8E8E93"
};

const HighlightCard = ({
  icon: Icon,
  iconColor,
  label,
  title,
  value,
  valueColor,
  delay = 0,
  className,
  rightIcon: RightIcon,
}: HighlightCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...springs.default, delay }}
    whileTap={{ scale: 0.96 }}
    className={cn(
      "rounded-2xl bg-[var(--color-bg-secondary)] p-4 active:bg-[var(--color-bg-tertiary)] transition-colors touch-manipulation",
      className
    )}
    role="button"
    tabIndex={0}
  >
    <Icon className={cn("mb-2 h-5 w-5", iconColor)} aria-hidden="true" />
    <p className="text-xs text-[var(--color-text-tertiary)] font-medium">{label}</p>
    <div className="flex items-end justify-between mt-1">
      <div>
        <p className="text-base font-extrabold text-[var(--color-text-primary)] leading-tight truncate max-w-[120px]">
          {title}
        </p>
        <p className={cn("text-sm font-semibold mt-0.5", valueColor)}>{value}</p>
      </div>
      {RightIcon && <RightIcon className="h-5 w-5 text-[var(--color-text-tertiary)]" aria-hidden="true" />}
    </div>
  </motion.div>
);

export function AnalyticsClient({ habits, logs }: { habits: Habit[], logs: HabitLog[] }) {
  const [period, setPeriod] = useState<Period>("Week");
  const [isLoading, setIsLoading] = useState(false);

  const chartData = useMemo(() => {
    const today = new Date();
    const activeHabitsCount = Math.max(1, habits.filter(h => h.is_active).length);

    if (period === "Week") {
      return Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, 6 - i);
        const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
        const completed = dayLogs.filter(l => l.status === "completed").length;
        return {
          day: format(date, "EEE"),
          rate: Math.round((completed / activeHabitsCount) * 100),
        };
      });
    }

    if (period === "Month") {
      return Array.from({ length: 30 }).map((_, i) => {
        const date = subDays(today, 29 - i);
        const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
        const completed = dayLogs.filter(l => l.status === "completed").length;
        return {
          day: format(date, "d"),
          rate: Math.round((completed / activeHabitsCount) * 100),
        };
      });
    }

    // Year view
    return Array.from({ length: 12 }).map((_, i) => {
      const date = subMonths(today, 11 - i);
      const monthLogs = logs.filter(l => isSameMonth(new Date(l.date), date));
      const completed = monthLogs.filter(l => l.status === "completed").length;
      // Rough estimate of expected logs for the month
      const expected = activeHabitsCount * 30; 
      return {
        day: format(date, "MMM"),
        rate: Math.min(100, Math.round((completed / expected) * 100)),
      };
    });
  }, [period, habits, logs]);

  const averageRate = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const donutData = useMemo(() => {
    const categories: Record<string, number> = {};
    const completedLogs = logs.filter(l => l.status === "completed");
    
    if (completedLogs.length === 0) {
      return [{ name: "No Data", value: 100, color: "#e5e5ea" }];
    }

    completedLogs.forEach(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      if (habit) {
        categories[habit.category] = (categories[habit.category] || 0) + 1;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
    }));
  }, [habits, logs]);

  // Calculate Highlights
  const bestHabit = useMemo(() => {
    if (habits.length === 0) return { title: "None", value: "0%" };
    let best = habits[0];
    habits.forEach(h => {
      if ((h.completion_rate || 0) > (best.completion_rate || 0)) best = h;
    });
    return { title: best.name, value: `${Math.round(best.completion_rate || 0)}%` };
  }, [habits]);

  const needsFocus = useMemo(() => {
    const active = habits.filter(h => h.is_active);
    if (active.length === 0) return { title: "None", value: "0%" };
    let worst = active[0];
    active.forEach(h => {
      if ((h.completion_rate || 0) < (worst.completion_rate || 0)) worst = h;
    });
    return { title: worst.name, value: `${Math.round(worst.completion_rate || 0)}%` };
  }, [habits]);

  const longestStreak = useMemo(() => {
    if (habits.length === 0) return { title: "0 days", label: "Start tracking!" };
    let max = 0;
    habits.forEach(h => {
      if ((h.longest_streak || 0) > max) max = h.longest_streak;
    });
    return { title: `${max} days`, label: max > 0 ? "Keep going!" : "Start tracking!" };
  }, [habits]);

  const handlePeriodChange = useCallback((newPeriod: Period) => {
    if (newPeriod === period) return;
    setIsLoading(true);
    setPeriod(newPeriod);
    setTimeout(() => setIsLoading(false), 150);
  }, [period]);

  return (
    <div className="flex flex-col gap-5 px-4 sm:px-5 pb-8 pt-4 safe-top min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="space-y-1"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Analytics
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Track your progress and growth
        </p>
      </motion.header>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex rounded-xl bg-[var(--color-bg-secondary)] p-1 shadow-sm"
        role="tablist"
      >
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={cn(
              "flex-1 rounded-[10px] py-2.5 text-sm font-semibold transition-all duration-200 touch-manipulation",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2",
              period === p
                ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-tertiary)] active:text-[var(--color-text-secondary)]"
            )}
            role="tab"
            aria-selected={period === p}
          >
            {p}
          </button>
        ))}
      </motion.div>

      {/* Average Completion Rate Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 self-start px-3 py-2 rounded-full bg-[var(--color-accent-primary)]/10"
      >
        <TrendingUp className="h-4 w-4 text-[var(--color-accent-primary)]" />
        <span className="text-sm font-semibold text-[var(--color-accent-primary)]">
          {averageRate}% Average
        </span>
      </motion.div>

      {/* Charts Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {/* Completion Chart */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-primary)]/50 backdrop-blur-sm rounded-2xl z-10">
                <Activity className="h-6 w-6 animate-pulse text-[var(--color-accent-primary)]" />
              </div>
            )}
            <CompletionChart data={chartData} period={period} />
          </div>

          {/* Donut Chart */}
          <DonutChart data={donutData} />
        </motion.div>
      </AnimatePresence>

      {/* Highlights Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Highlights
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <HighlightCard
            icon={Trophy}
            iconColor="text-[var(--color-accent-green)]"
            label="Best Habit"
            title={bestHabit.title}
            value={bestHabit.value}
            valueColor="text-[var(--color-accent-green)]"
            delay={0.35}
          />

          <HighlightCard
            icon={ArrowDown}
            iconColor="text-[var(--color-error)]"
            label="Needs Focus"
            title={needsFocus.title}
            value={needsFocus.value}
            valueColor="text-[var(--color-error)]"
            delay={0.4}
          />

          <HighlightCard
            icon={Flame}
            iconColor="text-[var(--color-streak)]"
            label="Longest Streak"
            title={longestStreak.title}
            value={longestStreak.label}
            valueColor="text-[var(--color-streak)]"
            delay={0.45}
            className="col-span-2"
            rightIcon={Target}
          />
        </div>
      </motion.section>

      {/* Bottom Spacer */}
      <div className="h-32" aria-hidden="true" />
    </div>
  );
}
