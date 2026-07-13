"use client";

import { motion } from "motion/react";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    emoji: string;
    targetCount: number;
    targetUnit: string;
    color: string;
    isCompleted: boolean;
    currentStreak: number;
  };
  onComplete?: () => void;
}

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative flex items-center justify-between overflow-hidden rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 transition-shadow hover:shadow-md"
    >
      {/* Left Color Accent Strip */}
      <div 
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{ backgroundColor: habit.color }}
      />

      <div className="ml-2 flex items-center gap-4">
        {/* Emoji Circle */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl shadow-sm"
          style={{ backgroundColor: habit.color + "15", color: habit.color }}
        >
          {habit.emoji}
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-extrabold text-[var(--color-text-primary)]">
              {habit.name}
            </span>
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-[var(--color-streak)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ff9500]">
                <Flame className="h-3 w-3" />
                {habit.currentStreak}
              </span>
            )}
          </div>
          <span className="mt-0.5 text-[13px] font-semibold text-[var(--color-text-tertiary)]">
            {habit.targetCount} {habit.targetUnit}
          </span>
        </div>
      </div>

      {/* Checkmark */}
      <button
        onClick={() => onComplete?.()}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
          habit.isCompleted
            ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)] scale-110"
            : "border-2 border-[var(--color-bg-tertiary)] bg-transparent text-transparent hover:border-[var(--color-text-tertiary)]"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: habit.isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </motion.div>
      </button>
    </motion.div>
  );
}
