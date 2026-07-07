"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, ArrowDown, Flame, Target } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { DonutChart } from "@/components/analytics/donut-chart";

const periods = ["Week", "Month", "Year"] as const;
type Period = (typeof periods)[number];

const weekData = [
  { day: "Mon", rate: 60 },
  { day: "Tue", rate: 72 },
  { day: "Wed", rate: 68 },
  { day: "Thu", rate: 75 },
  { day: "Fri", rate: 82 },
  { day: "Sat", rate: 78 },
  { day: "Sun", rate: 89 },
];

const monthData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  rate: 55 + Math.round(Math.sin(i * 0.3) * 20 + Math.random() * 15),
}));

const donutData = [
  { name: "Fitness", value: 35, color: "#34C759" },
  { name: "Learning", value: 25, color: "#007AFF" },
  { name: "Health", value: 20, color: "#FF9500" },
  { name: "Mindfulness", value: 15, color: "#5856D6" },
  { name: "Finance", value: 5, color: "#FF3B30" },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("Week");

  const chartData = period === "Week" ? weekData : monthData;

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-4 safe-top">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
      >
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Your growth, visualized.
        </p>
      </motion.div>

      {/* Period Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex rounded-xl bg-[var(--color-bg-secondary)] p-1"
      >
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 rounded-[10px] py-2 text-sm font-semibold transition-all",
              period === p
                ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-tertiary)]",
            )}
          >
            {p}
          </button>
        ))}
      </motion.div>

      {/* Real Area Chart */}
      <CompletionChart data={chartData} />

      {/* Real Donut Chart */}
      <DonutChart data={donutData} />

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.4 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-2xl bg-[var(--color-bg-secondary)] p-4"
        >
          <Trophy className="mb-2 h-5 w-5 text-[var(--color-accent-green)]" />
          <p className="text-xs text-[var(--color-text-tertiary)]">Best Habit</p>
          <p className="text-base font-extrabold text-[var(--color-text-primary)]">
            Morning Run
          </p>
          <p className="text-sm font-semibold text-[var(--color-accent-green)]">89%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.45 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-2xl bg-[var(--color-bg-secondary)] p-4"
        >
          <ArrowDown className="mb-2 h-5 w-5 text-[var(--color-error)]" />
          <p className="text-xs text-[var(--color-text-tertiary)]">Needs Focus</p>
          <p className="text-base font-extrabold text-[var(--color-text-primary)]">Meditate</p>
          <p className="text-sm font-semibold text-[var(--color-error)]">34%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springs.default, delay: 0.5 }}
          whileTap={{ scale: 0.96 }}
          className="col-span-2 rounded-2xl bg-[var(--color-bg-secondary)] p-4"
        >
          <Flame className="mb-2 h-5 w-5 text-[var(--color-streak)]" />
          <p className="text-xs text-[var(--color-text-tertiary)]">Longest Active Streak</p>
          <div className="flex items-end justify-between">
            <p className="text-xl font-extrabold text-[var(--color-text-primary)]">
              42{" "}
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">days</span>
            </p>
            <Target className="h-5 w-5 text-[var(--color-text-tertiary)]" />
          </div>
        </motion.div>
      </div>

      <div className="h-4" />
    </div>
  );
}
