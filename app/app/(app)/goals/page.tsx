"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Target, Plus, CheckCircle2, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/services/supabase/client";

// Colors for goals
const GOAL_COLORS = [
  "from-[#FFD60A] to-[#FF9500]",
  "from-[#34C759] to-[#30B0C7]",
  "from-[#007AFF] to-[#5856D6]",
  "from-[#FF2D55] to-[#FF3B30]",
  "from-[#AF52DE] to-[#3A3A3C]"
];

export default function GoalsPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    async function fetchGoals() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (data) {
        setGoals(data);
      }
      setIsLoading(false);
    }
    fetchGoals();
  }, []);

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;

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
            Goals
          </h1>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
            Track your massive life objectives
          </p>
        </div>
        <Link 
          href="/goals/new"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD60A] to-[#FF9500] text-white shadow-lg shadow-[#FF9500]/30 hover:scale-95 active:scale-90 transition-transform"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <div className="flex flex-col rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Active</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{activeCount}</span>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">goals</span>
          </div>
        </div>

        <div className="flex flex-col rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34C759]/10 text-[#34C759]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Done</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{completedCount}</span>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">goals</span>
          </div>
        </div>
      </motion.div>

      {/* Goal Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Your OKRs</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-[24px] bg-[var(--color-bg-secondary)]" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-[var(--color-text-secondary)]">No goals yet. Set your first objective!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {goals.map((goal, i) => {
              const Icon = Target;
              const color = GOAL_COLORS[i % GOAL_COLORS.length];
              const progressPct = goal.target_value > 0 ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100) : 0;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...springs.default, delay: 0.3 + (i * 0.1) }}
                  className="relative flex flex-col gap-4 overflow-hidden rounded-[24px] bg-[var(--color-bg-secondary)] p-5 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-sm", color)}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-[17px] font-bold text-[var(--color-text-primary)]">{goal.title}</h3>
                    </div>
                    <span className="text-sm font-black text-[var(--color-text-primary)]">{progressPct}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                    <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                    {goal.deadline && <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {goal.deadline}</span>}
                  </div>

                  {/* Progress Bar Track */}
                  <div className="h-3 w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                    {/* Animated Fill */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                      className={cn("h-full rounded-full bg-gradient-to-r", color)}
                    />
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
