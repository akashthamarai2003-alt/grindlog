"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Check, Flame, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
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
    preferredTime?: string;
    reminderTime?: string | null;
  };
  onComplete?: () => void;
  onDelete?: () => void;
}

export function HabitCard({ habit, onComplete, onDelete }: HabitCardProps) {
  const targetLabel = useMemo(() => {
    if (habit.targetCount === 1 && habit.targetUnit === "times") {
      if (habit.reminderTime) {
        return formatTime12h(habit.reminderTime);
      }
      if (habit.preferredTime && habit.preferredTime !== "anytime") {
        return habit.preferredTime.charAt(0).toUpperCase() + habit.preferredTime.slice(1);
      }
      return "Anytime";
    }
    return `${habit.targetCount} ${habit.targetUnit}`;
  }, [habit.targetCount, habit.targetUnit, habit.reminderTime, habit.preferredTime]);

  return (
    <div
      className="group relative flex items-center justify-between overflow-hidden rounded-[20px] bg-[var(--color-bg-elevated)] p-3 shadow-sm ring-1 ring-[var(--color-bg-tertiary)]/50 transition-transform transition-shadow hover:shadow-md active:scale-[0.98]"
    >
      {/* Left Color Accent Strip */}
      <div 
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{ backgroundColor: habit.color }}
      />

      <div className="ml-2 flex items-center gap-4">
        {/* Emoji Box */}
        <div
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] text-[20px] shadow-sm"
          style={{ backgroundColor: habit.color + "25", color: habit.color }}
        >
          {habit.emoji}
        </div>
        
        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-[var(--color-text-primary)]">
              {habit.name}
            </span>
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-0.5 rounded-full bg-[var(--color-streak)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ff9500]">
                <Flame className="h-3 w-3" />
                {habit.currentStreak}
              </span>
            )}
          </div>
          <span className="mt-0.5 text-[12px] font-bold text-[var(--color-text-tertiary)]">
            {targetLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/habits/${habit.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-sm"
          title="Edit Habit"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.5} />
        </Link>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-sm"
            title="Delete Habit"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}

        {/* Checkmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          className={cn(
            "flex h-[42px] w-[42px] items-center justify-center rounded-[14px] transition-all duration-200",
            habit.isCompleted
              ? "bg-[var(--color-accent-green)]/15 border-2 border-[var(--color-accent-green)] text-[var(--color-accent-green)] shadow-[0_0_12px_rgba(52,199,89,0.4)] scale-105"
              : "bg-[var(--color-bg-secondary)] text-transparent hover:bg-[var(--color-bg-tertiary)] border-2 border-transparent"
          )}
        >
          <div
            className={cn(
              "transition-transform duration-300 ease-out",
              habit.isCompleted ? "scale-100" : "scale-0"
            )}
          >
            <Check className="h-5 w-5" strokeWidth={3} />
          </div>
        </button>
      </div>
    </div>
  );
}

function formatTime12h(time24: string): string {
  if (!time24) return "";
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}
