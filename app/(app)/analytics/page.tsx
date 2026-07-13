"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Optimized data generation with memoization
const generateWeekData = (): ChartDataPoint[] => [
  { day: "Mon", rate: 60 },
  { day: "Tue", rate: 72 },
  { day: "Wed", rate: 68 },
  { day: "Thu", rate: 75 },
  { day: "Fri", rate: 82 },
  { day: "Sat", rate: 78 },
  { day: "Sun", rate: 89 },
];

const generateMonthData = (): ChartDataPoint[] =>
  Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    rate: Math.max(0, Math.min(100, 55 + Math.round(Math.sin(i * 0.3) * 20 + Math.random() * 15))),
  }));

const generateYearData = (): ChartDataPoint[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    day: month,
    rate: Math.max(0, Math.min(100, 60 + Math.round(Math.sin(i * 0.5) * 25 + Math.random() * 10))),
  }));
};

const donutData: DonutDataPoint[] = [
  { name: "Fitness", value: 35, color: "#34C759" },
  { name: "Learning", value: 25, color: "#007AFF" },
  { name: "Health", value: 20, color: "#FF9500" },
  { name: "Mindfulness", value: 15, color: "#5856D6" },
  { name: "Finance", value: 5, color: "#FF3B30" },
];

// Reusable Highlight Card Component
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
    aria-label={`${label}: ${title} - ${value}`}
  >
    <Icon className={cn("mb-2 h-5 w-5", iconColor)} aria-hidden="true" />
    <p className="text-xs text-[var(--color-text-tertiary)] font-medium">{label}</p>
    <div className="flex items-end justify-between mt-1">
      <div>
        <p className="text-base font-extrabold text-[var(--color-text-primary)] leading-tight">
          {title}
        </p>
        <p className={cn("text-sm font-semibold mt-0.5", valueColor)}>{value}</p>
      </div>
      {RightIcon && <RightIcon className="h-5 w-5 text-[var(--color-text-tertiary)]" aria-hidden="true" />}
    </div>
  </motion.div>
);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("Week");
  const [isLoading, setIsLoading] = useState(false);

  // Memoized chart data based on selected period
  const chartData = useMemo(() => {
    switch (period) {
      case "Week":
        return generateWeekData();
      case "Month":
        return generateMonthData();
      case "Year":
        return generateYearData();
      default:
        return generateWeekData();
    }
  }, [period]);

  // Calculate average completion rate
  const averageRate = useMemo(() => {
    const sum = chartData.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  // Optimized period change handler
  const handlePeriodChange = useCallback((newPeriod: Period) => {
    if (newPeriod === period) return;
    
    setIsLoading(true);
    setPeriod(newPeriod);
    
    // Simulate data loading for smooth transition
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
        aria-label="Time period selector"
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
            aria-controls={`${p.toLowerCase()}-panel`}
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
        aria-label="Performance highlights"
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
            title="Morning Run"
            value="89%"
            valueColor="text-[var(--color-accent-green)]"
            delay={0.35}
          />

          <HighlightCard
            icon={ArrowDown}
            iconColor="text-[var(--color-error)]"
            label="Needs Focus"
            title="Meditate"
            value="34%"
            valueColor="text-[var(--color-error)]"
            delay={0.4}
          />

          <HighlightCard
            icon={Flame}
            iconColor="text-[var(--color-streak)]"
            label="Longest Streak"
            title="42 days"
            value="Keep going!"
            valueColor="text-[var(--color-streak)]"
            delay={0.45}
            className="col-span-2"
            rightIcon={Target}
          />
        </div>
      </motion.section>

      {/* Bottom Spacer */}
      <div className="h-4" aria-hidden="true" />
    </div>
  );
}