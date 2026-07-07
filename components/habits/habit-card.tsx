"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
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
  };
  onComplete?: () => void;
}

export function HabitCard({ habit, onComplete }: HabitCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        {/* Emoji Circle */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: habit.color + "15" }}
        >
          {habit.emoji}
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
            {habit.name}
          </span>
          <span className="text-xs font-semibold text-[var(--color-text-tertiary)] mt-0.5">
            {habit.targetCount} {habit.targetUnit}
          </span>
        </div>
      </div>

      {/* Checkmark */}
      <button
        onClick={() => onComplete?.()}
        className={cn(
          "flex h-[26px] w-[26px] items-center justify-center rounded-full transition-all duration-300",
          habit.isCompleted
            ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
            : "border-2 border-[var(--color-bg-tertiary)] bg-transparent text-transparent hover:border-[var(--color-text-tertiary)]"
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
    </motion.div>
  );
}
