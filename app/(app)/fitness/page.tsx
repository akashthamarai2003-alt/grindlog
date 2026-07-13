"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Dumbbell, Flame, Clock, Plus, Activity } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

// Mock Data for now
const MOCK_WORKOUTS = [
  { id: "1", type: "Strength", duration: 45, calories: 320, date: "Today", icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "2", type: "Cardio", duration: 30, calories: 400, date: "Yesterday", icon: Activity, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function FitnessPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network fetch
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
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
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Fitness
          </h1>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
            Track your physical health
          </p>
        </div>
        <Link 
          href="/fitness/new"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF2D55] to-[#FF3B30] text-white shadow-lg shadow-[#FF2D55]/30 hover:scale-95 active:scale-90 transition-transform"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      </motion.div>

      {/* Weekly Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="flex flex-col rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9500]/10 text-[#FF9500]">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Calories</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">720</span>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">kcal</span>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
              <Clock className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Time</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">75</span>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">min</span>
          </div>
        </div>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Recent Workouts</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-[var(--color-bg-secondary)]" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {MOCK_WORKOUTS.map((workout, i) => {
              const Icon = workout.icon;
              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springs.default, delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-4 rounded-2xl bg-[var(--color-bg-secondary)] p-4"
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", workout.bg, workout.color)}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">{workout.type}</h3>
                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">{workout.date}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[15px] font-bold text-[var(--color-text-primary)]">{workout.duration}m</span>
                    <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">{workout.calories} kcal</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
