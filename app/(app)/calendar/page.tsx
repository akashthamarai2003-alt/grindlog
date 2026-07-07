"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const JULY_DAYS = [
  { day: 30, dim: true }, { day: 1, status: "partial" }, { day: 2, status: "today" }, { day: 3, status: "completed" },
  { day: 4, status: "completed" }, { day: 5, status: "completed" }, { day: 6, status: "completed" }, { day: 7, status: "completed" },
  { day: 8, status: "completed" }, { day: 9, status: "completed" }, { day: 10, status: "completed" }, { day: 11, status: "completed" },
  { day: 12, status: "completed" }, { day: 13, status: "completed" }, { day: 14, status: "completed" }, { day: 15, status: "completed" },
  { day: 16, status: "completed" }, { day: 17, status: "completed" }, { day: 18, status: "completed" }, { day: 19, status: "completed" },
  { day: 20, status: "completed" }, { day: 21, status: "completed" }, { day: 22, status: "completed" }, { day: 23, status: "completed" },
  { day: 24, status: "completed" }, { day: 25, status: "completed" }, { day: 26, status: "completed" }, { day: 27, status: "completed" },
  { day: 28, status: "completed" }, { day: 29, status: "completed" }, { day: 30, status: "completed" }, { day: 31, status: "completed" },
  { day: 1, dim: true }, { day: 2, dim: true }, { day: 3, dim: true }
];

const TODAY_DETAILS = [
  { emoji: "☀️", name: "Wake Up Early", time: "5:00 AM", done: true, color: "#34C759" },
  { emoji: "🏋️", name: "Workout", time: "45 min", done: true, color: "#007AFF" },
  { emoji: "📖", name: "Reading", time: "20 min", done: true, color: "#FF9500" },
  { emoji: "🧘", name: "Meditation", time: "15 min", done: false, color: "#5856D6" },
  { emoji: "🚿", name: "Cold Shower", time: "2 min", done: true, color: "#5AC8FA" },
];

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-8 safe-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.default}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-1.5 cursor-pointer">
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-primary)]">
            July 2026
          </h1>
          <ChevronRight className="h-4 w-4 rotate-90 text-[var(--color-text-tertiary)]" strokeWidth={3} />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[var(--color-text-primary)] transition-transform active:scale-90">
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <button className="text-[var(--color-text-primary)] transition-transform active:scale-90">
            <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-card)]"
      >
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-4">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-4">
          {JULY_DAYS.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 relative">
              <button
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold transition-all",
                  item.status === "today" &&
                    "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]",
                  item.dim
                    ? "text-[var(--color-text-tertiary)] opacity-50"
                    : !item.status || item.status !== "today"
                      ? "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]" : ""
                )}
              >
                {item.day}
              </button>
              {/* Status dot below number */}
              {item.status && item.status !== "today" && !item.dim && (
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    item.status === "completed"
                      ? "bg-[var(--color-accent-green)]"
                      : "bg-[#FF9500]"
                  )}
                />
              )}
              {/* Keep spacing for days without dots */}
              {(!item.status || item.status === "today" || item.dim) && (
                <div className="h-1.5 w-1.5" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="flex flex-col gap-4 mt-2"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-extrabold text-[var(--color-text-primary)]">
            Today • 2 July 2026
          </h3>
          <span className="text-[15px] font-extrabold text-[var(--color-accent-green)]">
            96%
          </span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {TODAY_DETAILS.map((habit, index) => (
            <motion.div
              key={habit.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[18px]"
                  style={{ backgroundColor: habit.color + "15" }}
                >
                  {habit.emoji}
                </div>
                <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
                  {habit.name}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[12px] font-bold text-[var(--color-text-tertiary)]">
                  {habit.time}
                </span>
                <button
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                    habit.done
                      ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                      : "border-2 border-[var(--color-bg-tertiary)] bg-transparent text-transparent"
                  )}
                >
                  <Check className="h-[14px] w-[14px]" strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
