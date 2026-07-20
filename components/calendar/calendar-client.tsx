"use client";

import { useState, useEffect, useCallback, useTransition, useRef, createContext, useContext, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Flame,
  Target,
  BarChart2,
  Sparkles,
  CalendarDays,
  Lock,
  Maximize,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/services/supabase/client";
import { setHabitLogStatus, updateHabitRemark } from "@/app/actions/habits";
import { isHabitScheduled } from "@/lib/habit-utils";
import "react-day-picker/dist/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Habit = {
  id: string;
  name: string;
  emoji: string;
  frequency?: string;
  custom_days?: number[] | null;
  target_count: number;
  target_unit: string;
  color: string;
  current_streak: number;
  preferred_time?: string;
  reminder_time?: string | null;
  created_at?: string;
};

type HabitLog = {
  habit_id: string;
  date: string;
  status: "completed" | "skipped" | "failed";
  remarks?: string | null;
};

type Props = {
  initialHabits?: Habit[];
  initialLogs?: HabitLog[];
  todayDateStr?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime12h(time24: string) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function toDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { startStr: toDateStr(start), endStr: toDateStr(end) };
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_META = {
  completed: {
    icon: CheckCircle2,
    label: "Done",
    color: "#34C759",
    bg: "bg-[#34C759]/15",
    border: "border-[#34C759]",
    glow: "shadow-md shadow-[#34C759]/30",
  },
  skipped: {
    icon: MinusCircle,
    label: "Skip",
    color: "#FF9500",
    bg: "bg-[#FF9500]/15",
    border: "border-[#FF9500]",
    glow: "shadow-md shadow-[#FF9500]/30",
  },
  failed: {
    icon: XCircle,
    label: "Miss",
    color: "#FF3B30",
    bg: "bg-[#FF3B30]/15",
    border: "border-[#FF3B30]",
    glow: "shadow-md shadow-[#FF3B30]/30",
  },
} as const;

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>0</span>;
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

type DayCellProps = {
  date: Date;
  logs: HabitLog[];
  habits: Habit[];
  isToday: boolean;
  isSelected: boolean;
  isOutside: boolean;
  onClick: () => void;
};

function DayCell({
  date, logs, habits, isToday, isSelected, isOutside, onClick,
}: DayCellProps) {
  const dateStr = toDateStr(date);
  const dayLogs = logs.filter((l) => l.date === dateStr);
  const dayHabits = habits.filter(h => {
    if (h.created_at && h.created_at.split("T")[0] > dateStr) return false;
    return isHabitScheduled(h.frequency, h.custom_days, date);
  });
  const completed = dayLogs.filter((l) => l.status === "completed").length;
  const total = dayHabits.length;
  const pct = total > 0 ? completed / total : 0;
  const hasLogs = dayLogs.length > 0;
  const isPerfect = completed === total && total > 0;

  // SVG ring
  const r = 13;
  const circ = 2 * Math.PI * r;
  const ringColor = isPerfect ? "#34C759" : "#007AFF";

  // Cap the progress ring so the rounded linecaps don't collide when almost complete (e.g., 95%)
  const visualPct = isPerfect ? 1 : Math.min(pct, (circ - 4.5) / circ);

  return (
    <td role="gridcell" className="p-0 text-center focus-within:relative focus-within:z-20">
      <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-full aspect-square max-w-[44px] max-h-[44px] mx-auto",
        "rounded-[14px] select-none outline-none",
        "transition-all duration-200 active:scale-[0.82]",
        isOutside && "opacity-20 pointer-events-none",
        isSelected && [
          "bg-[var(--color-primary)]/15",
          "ring-2 ring-[var(--color-primary)] ring-offset-1",
          "ring-offset-[var(--color-bg-secondary)]",
        ],
        !isSelected && !isOutside && [
          isPerfect && "bg-[#34C759]/12 hover:bg-[#34C759]/20",
          !isPerfect && pct > 0 && "bg-[#007AFF]/8 hover:bg-[#007AFF]/15",
          pct === 0 && dayLogs.some(l => l.status === "skipped") && "bg-[#FF9500]/8 hover:bg-[#FF9500]/15",
          pct === 0 && dayLogs.some(l => l.status === "failed") && "bg-[#FF3B30]/8 hover:bg-[#FF3B30]/15",
          !hasLogs && "hover:bg-[var(--color-bg-tertiary)]/60 active:bg-[var(--color-bg-tertiary)]",
        ],
      )}
    >
      {/* Completion ring */}
      {hasLogs && !isOutside && (
        <svg
          viewBox="0 0 32 32"
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        >
          {/* Track */}
          <circle
            cx="16" cy="16" r={r}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="2"
          />
          {/* Progress */}
          <motion.circle
            cx="16" cy="16" r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - visualPct * circ }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
      )}

      {/* Perfect-day glow backdrop */}
      {isPerfect && !isOutside && (
        <div
          className="absolute inset-0 rounded-[14px] bg-[#34C759]/8 pointer-events-none transition-opacity duration-300"
        />
      )}

      {/* Day number */}
      <span
        className={cn(
          "relative z-10 text-[12px] font-black leading-none transition-transform duration-300",
          isSelected ? "scale-110" : "scale-100",
          isToday ? "text-[#007AFF]" :
          isSelected ? "text-[var(--color-text-primary)]" :
          isOutside ? "text-[var(--color-text-tertiary)]/40" :
          isPerfect ? "text-[#248A3D] dark:text-[#30D158]" :
          !isPerfect && pct > 0 ? "text-[#0055B3] dark:text-[#409CFF]" :
          pct === 0 && dayLogs.some(l => l.status === "skipped") ? "text-[#D07200] dark:text-[#FF9F0A]" :
          pct === 0 && dayLogs.some(l => l.status === "failed") ? "text-[#D1231B] dark:text-[#FF453A]" :
          "text-[var(--color-text-secondary)]",
        )}
      >
        {date.getDate()}
      </span>

      {/* Today dot */}
      {isToday && (
        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#007AFF] animate-in zoom-in duration-300" />
      )}

      {/* Status dots */}
      {hasLogs && !isToday && !isOutside && (
        <div className="absolute bottom-1.5 flex gap-[2px]">
          {dayLogs.slice(0, 3).map((log, i) => (
            <div
              key={i}
              className="w-[3px] h-[3px] rounded-full animate-in zoom-in duration-300"
              style={{
                backgroundColor:
                  log.status === "completed" ? "#34C759" :
                  log.status === "skipped"   ? "#FF9500" : "#FF3B30",
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Perfect ⭐ */}
      {isPerfect && !isOutside && (
        <span
          className="absolute -top-2 -right-1.5 text-[9px] z-20 leading-none animate-in zoom-in duration-500"
        >
          ⭐
        </span>
      )}
    </button>
    </td>
  );
}

// ─── Habit Row ────────────────────────────────────────────────────────────────

type HabitRowProps = {
  habit: Habit;
  status: HabitLog["status"] | null;
  remark: string | null;
  isEditable: boolean;
  isPending: boolean;
  idx: number;
  onToggle: (s: HabitLog["status"] | null) => void;
  onViewRemark: () => void;
};

function HabitRow({ habit, status, remark, isEditable, isPending, idx, onToggle, onViewRemark }: HabitRowProps) {
  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 animate-in fade-in slide-in-from-left-4 duration-300 fill-mode-both"
      style={{ animationDelay: `${50 + idx * 50}ms` }}
    >
      {/* Emoji bubble */}
      <div className="relative flex-shrink-0">
        <div
          className="w-[46px] h-[46px] rounded-[16px] flex items-center justify-center text-[22px] flex-shrink-0 shadow-sm"
          style={{
            backgroundColor: `${habit.color}25`,
            color: habit.color,
          }}
        >
          {habit.emoji}
        </div>
        {remark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewRemark();
            }}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--color-accent-blue)] text-white shadow-sm ring-2 ring-[var(--color-bg-primary)] hover:scale-110 transition-transform"
            title="View Remark"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--color-text-primary)] truncate">
          {habit.name}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Flame className="h-2.5 w-2.5 text-[#FF9500] flex-shrink-0" />
          <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">
            {habit.current_streak}d streak
          </span>
          {(() => {
            let timeLabel = "Anytime";
            if (habit.target_count === 1 && habit.target_unit === "times") {
              if (habit.reminder_time) {
                timeLabel = formatTime12h(habit.reminder_time);
              } else if (habit.preferred_time && habit.preferred_time !== "anytime") {
                timeLabel = habit.preferred_time.charAt(0).toUpperCase() + habit.preferred_time.slice(1);
              }
            } else {
              timeLabel = `${habit.target_count} ${habit.target_unit}`;
            }
            return (
              <>
                <span className="text-[var(--color-text-tertiary)] opacity-40 text-[10px]">·</span>
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">
                  {timeLabel}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Action buttons or lock */}
      {isEditable ? (
        <div className="flex items-center gap-2">
          {(["completed", "skipped", "failed"] as const).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const isActive = status === s;

            return (
              <button
                key={s}
                disabled={isPending}
                onClick={() => onToggle(isActive ? null : s)}
                title={meta.label}
                className={cn(
                  "w-[38px] h-[38px] rounded-[14px] flex items-center justify-center border-2",
                  "transition-transform duration-200 active:scale-90",
                  isActive
                    ? `${meta.bg} ${meta.border} ${meta.glow} scale-[1.03]`
                    : "bg-[var(--color-bg-secondary)] border-transparent hover:bg-[var(--color-bg-tertiary)]",
                  isPending && "opacity-40 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "transition-transform duration-200",
                    isActive ? "scale-105" : "scale-100"
                  )}
                >
                  <Icon
                    className="h-5 w-5 transition-colors duration-200"
                    style={{ color: isActive ? meta.color : "var(--color-text-tertiary)" }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
          <Lock className="h-3 w-3" />
          <span className="text-[10px] font-bold">Future</span>
        </div>
      )}
    </div>
  );
}

// ─── Day Panel ────────────────────────────────────────────────────────────────

type PanelProps = {
  date: Date;
  habits: Habit[];
  logs: HabitLog[];
  todayDateStr: string;
  onLogChange: (habitId: string, date: string, status: HabitLog["status"] | null) => void;
  onAntiCheat: (habitId: string, date: string, status: HabitLog["status"] | null) => void;
  isPending: boolean;
};

function DayPanel({ date, habits, logs, todayDateStr, onLogChange, onAntiCheat, isPending }: PanelProps) {
  const [viewRemark, setViewRemark] = useState<{habitName: string, dateStr: string, text: string} | null>(null);
  const dateStr = toDateStr(date);
  const isToday = dateStr === todayDateStr;
  const todayDate = new Date(todayDateStr + "T12:00:00");
  const isFuture = date > todayDate;
  const isEditable = !isFuture;

  const dayHabits = habits.filter(h => {
    if (h.created_at && h.created_at.split("T")[0] > dateStr) return false;
    return isHabitScheduled(h.frequency, h.custom_days, new Date(dateStr + "T12:00:00Z"));
  });
  const dayLogs = logs.filter((l) => l.date === dateStr);
  const completedCount = dayLogs.filter((l) => l.status === "completed").length;
  const totalHabits = dayHabits.length;
  const pct = totalHabits > 0 ? completedCount / totalHabits : 0;
  const isPerfect = completedCount === totalHabits && totalHabits > 0;

  const label = isToday
    ? "Today"
    : isFuture
    ? date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className={cn(
        "rounded-[28px] bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden transition-all duration-300",
        isPerfect ? "border-t-2 border-[#34C759]/30" :
        pct > 0 ? "border-t-2 border-[#007AFF]/30" :
        "border-t-2 border-transparent"
      )}
    >
      {/* ── Panel Header ── */}
      <div className="relative px-5 pt-5 pb-3">
        {/* Subtle glow for perfect days */}
        <AnimatePresence>
          {isPerfect && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-[#34C759]/8 to-transparent pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-black text-[var(--color-text-primary)]">
                {label}
              </h3>
              {isToday && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#007AFF]/15 text-[#007AFF]"
                >
                  Today
                </motion.span>
              )}
            </div>
            <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-1 uppercase tracking-widest">
              {completedCount}/{totalHabits} completed
            </p>
          </div>

          {/* Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isPerfect ? "perfect" : "pct"}
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black flex-shrink-0",
                isPerfect
                  ? "bg-[#34C759]/20 text-[#34C759]"
                  : isFuture
                  ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
                  : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
              )}
            >
              {isPerfect ? (
                <>
                  <Sparkles className="h-3 w-3" />
                  Perfect!
                </>
              ) : isFuture ? (
                <>
                  <Lock className="h-2.5 w-2.5" />
                  Future
                </>
              ) : (
                `${Math.round(pct * 100)}%`
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        {!isFuture && totalHabits > 0 && (
          <div className="mt-4 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isPerfect
                  ? "linear-gradient(90deg, #34C759, #30D158)"
                  : "linear-gradient(90deg, #007AFF, #0A84FF)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
            />
          </div>
        )}
      </div>

      {/* ── Habit List ── */}
      {totalHabits === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2 py-8 text-center"
        >
          <span className="text-3xl">🌱</span>
          <p className="text-sm font-bold text-[var(--color-text-tertiary)]">
            No habits yet. Add some!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col divide-y divide-[var(--color-bg-tertiary)]/60 mt-1">
            {dayHabits.map((habit, idx) => {
              const log = dayLogs.find((l) => l.habit_id === habit.id);
              const status = log?.status ?? null;
              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  status={status}
                  remark={log?.remarks || null}
                  isEditable={isEditable}
                  isPending={isPending}
                  idx={idx}
                  onToggle={(s) => {
                    if (s === "completed" && dateStr < todayDateStr) {
                      onAntiCheat(habit.id, dateStr, s);
                      return;
                    }
                    onLogChange(habit.id, dateStr, s);
                  }}
                  onViewRemark={() => {
                    if (log?.remarks) {
                      setViewRemark({ habitName: habit.name, dateStr, text: log.remarks });
                    }
                  }}
                />
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <div className="h-3" />

      {/* ── View Remark Modal ── */}
      <AnimatePresence>
        {viewRemark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm touch-none"
            onClick={() => setViewRemark(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col gap-4 border border-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base font-black text-[var(--color-text-primary)] tracking-tight truncate">
                    {viewRemark.habitName}
                  </h2>
                  <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    {new Date(viewRemark.dateStr + "T12:00:00Z").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-[14px] text-[var(--color-text-primary)] leading-relaxed italic break-words break-all">
                "{viewRemark.text}"
              </div>
              
              <button
                onClick={() => setViewRemark(null)}
                className="w-full mt-2 py-3.5 rounded-[16px] font-bold text-[13px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Month Stats ──────────────────────────────────────────────────────────────

function MonthStats({
  logs, habits, year, month,
}: {
  logs: HabitLog[];
  habits: Habit[];
  year: number;
  month: number;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let totalPossible = 0;
  let perfectDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayHabits = habits.filter(h => {
      if (h.created_at && h.created_at.split("T")[0] > ds) return false;
      return isHabitScheduled(h.frequency, h.custom_days, new Date(ds + "T12:00:00Z"));
    });
    totalPossible += dayHabits.length;

    const dl = logs.filter((l) => l.date === ds);
    if (dayHabits.length > 0 && dl.filter((l) => l.status === "completed").length === dayHabits.length) {
      perfectDays++;
    }
  }

  const completed = logs.filter((l) => l.status === "completed").length;
  const skipped = logs.filter((l) => l.status === "skipped").length;
  const missed = logs.filter((l) => l.status === "failed").length;
  const rate = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

  const stats = [
    { icon: CheckCircle2, label: "Done",    value: completed,   color: "#34C759" },
    { icon: MinusCircle,  label: "Skipped", value: skipped,     color: "#FF9500" },
    { icon: XCircle,      label: "Missed",  value: missed,      color: "#FF3B30" },
    { icon: Target,       label: "Perfect", value: perfectDays, color: "#007AFF" },
    { icon: BarChart2,    label: "Rate",    value: rate,        color: "#AF52DE", suffix: "%" },
  ] as const;

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 pt-1 -mx-4 px-4 scroll-pl-4 scroll-pr-4 scrollbar-hide snap-x snap-mandatory">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{
              type: "spring", stiffness: 320, damping: 26,
              delay: 0.08 + i * 0.07,
            }}
            className="flex-shrink-0 min-w-[92px] snap-start flex flex-col items-center gap-1.5 rounded-[20px] py-4 px-2
                       bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)]
                       relative overflow-hidden shadow-sm"
          >
            {/* Subtle color bg */}
            <div
              className="absolute inset-0 opacity-[0.09] pointer-events-none"
              style={{ backgroundColor: s.color }}
            />

            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.15 + i * 0.07 }}
              className="w-8 h-8 rounded-[12px] flex items-center justify-center relative mb-1"
              style={{ backgroundColor: `${s.color}2C` }}
            >
              <Icon className="h-4 w-4" style={{ color: s.color }} />
            </motion.div>

            <span className="text-[17px] font-black text-[var(--color-text-primary)] leading-none relative flex items-baseline">
              <AnimatedNumber value={s.value} />
              {"suffix" in s && <span className="text-[12px] ml-[1px]">{s.suffix}</span>}
            </span>

            <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide text-center leading-none mt-0.5">
              {s.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Weekly Checklist ─────────────────────────────────────────────────────────

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const w = Math.ceil((date.getDate() + firstDay) / 7);
  return `Week ${w}`;
}

function HabitChecklist({
  habits,
  logs,
  selectedDate,
  todayDateStr,
  onLogChange,
  onAntiCheat,
}: {
  habits: Habit[];
  logs: HabitLog[];
  selectedDate: Date;
  todayDateStr: string;
  onLogChange: (habitId: string, dateStr: string, status: HabitLog["status"] | null) => void;
  onAntiCheat?: (habitId: string, dateStr: string, status: HabitLog["status"] | null) => void;
}) {
  const [isPreview, setIsPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [viewRemark, setViewRemark] = useState<{habitName: string, dateStr: string, text: string} | null>(null);
  const [baseDate, setBaseDate] = useState<Date>(selectedDate);

  useEffect(() => {
    setBaseDate(selectedDate);
  }, [selectedDate]);
  const handlePrev = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      if (viewMode === "weekly") {
        d.setDate(d.getDate() - 7);
      } else {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      if (viewMode === "weekly") {
        d.setDate(d.getDate() + 7);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  };

  // Weekly setup
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      date: d,
      dateStr: toDateStr(d),
      label: ["S", "M", "T", "W", "T", "F", "S"][i],
    };
  });

  // Monthly setup
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      date: d,
      dateStr: toDateStr(d),
      label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
    };
  });

  const displayDays = viewMode === "weekly" ? weekDays : monthDays;
  const title = "Habit Checklist";
  const dateRangeStr = viewMode === "weekly" 
    ? `${getWeekOfMonth(baseDate)} • ${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekDays[6].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : `${baseDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;

  const gridContent = (
    <div className="border border-[var(--color-bg-tertiary)] rounded-[20px] mt-1 shadow-sm overflow-x-auto hide-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      <div className={cn("flex flex-col", viewMode === "monthly" ? "min-w-max" : "w-full")}>
        {/* Header Row */}
        <div className="flex items-stretch bg-[var(--color-bg-elevated)] border-b border-[var(--color-bg-tertiary)]">
          <div className={cn(
            "flex items-center px-2 sm:px-3 py-2 text-[10px] sm:text-[11px] font-black text-[var(--color-text-tertiary)] uppercase tracking-wider sticky left-0 z-20 bg-[var(--color-bg-elevated)] border-r border-[var(--color-bg-tertiary)]/30",
            viewMode === "weekly" ? "w-[90px] shrink-0" : "w-[120px] shrink-0"
          )}>
            My Habits
          </div>
          <div className="flex-1 flex items-stretch pr-2 py-2">
            {displayDays.map(day => (
              <div key={day.dateStr} className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                viewMode === "weekly" ? "flex-1" : "w-[40px] shrink-0"
              )}>
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">{day.label}</span>
                <span className="text-[9px] font-bold text-[var(--color-text-tertiary)]">{day.date.getDate()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        {habits.map((habit, i) => (
          <div key={habit.id} className={cn(
            "flex items-stretch border-b border-[var(--color-bg-tertiary)]/50 last:border-0",
            i % 2 === 0 ? "bg-[var(--color-bg-secondary)]" : "bg-[var(--color-bg-primary)]/30"
          )}>
            {/* Habit Name / Left Side */}
            <div 
              className={cn(
                "flex items-center px-2 sm:px-3 py-2 sticky left-0 z-20 border-r border-[var(--color-bg-tertiary)]/30 backdrop-blur-md",
                i % 2 === 0 ? "bg-[var(--color-bg-secondary)]" : "bg-[var(--color-bg-primary)]/80",
                viewMode === "weekly" ? "w-[90px] shrink-0" : "w-[120px] shrink-0"
              )}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[12px] shrink-0">{habit.emoji}</span>
                <span className="text-[11px] font-bold text-[var(--color-text-primary)] truncate" title={habit.name}>
                  {habit.name}
                </span>
              </div>
            </div>
            
            {/* Checkboxes / Right Side */}
            <div className="flex-1 flex items-stretch pr-2 py-2">
              {displayDays.map((day) => {
                const log = logs.find((l) => l.habit_id === habit.id && l.date === day.dateStr);
                const isScheduled = isHabitScheduled(habit.frequency, habit.custom_days, new Date(day.dateStr + "T12:00:00Z"));
                
                const createdStr = habit.created_at ? habit.created_at.split("T")[0] : null;
                const valid = isScheduled && (!createdStr || createdStr <= day.dateStr);
                const isFuture = day.dateStr > todayDateStr;
                const isPast = day.dateStr < todayDateStr;
                const actualStatus = log?.status;
                let status = actualStatus;

                if (valid && isPast && !status) {
                  status = "failed";
                }

                let borderClass = "border border-[var(--color-bg-tertiary)]";
                let bgClass = "bg-[var(--color-bg-tertiary)]/30";
                let icon = null;

                if (!valid) {
                  return (
                    <div key={day.dateStr} className={cn(
                      "flex items-center justify-center",
                      viewMode === "weekly" ? "flex-1" : "w-[40px] shrink-0"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] opacity-30" />
                    </div>
                  );
                }

                if (status === "completed") {
                  bgClass = "bg-[#34C759]";
                  borderClass = "border-[#34C759]";
                  icon = <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
                } else if (status === "skipped") {
                  bgClass = "bg-[#FF9500]";
                  borderClass = "border-[#FF9500]";
                  icon = <MinusCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
                } else if (status === "failed") {
                  bgClass = "bg-[#FF3B30]";
                  borderClass = "border-[#FF3B30]";
                  icon = <XCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />;
                } else if (day.dateStr === todayDateStr) {
                  borderClass = "border-2 border-[#007AFF]/50 ring-2 ring-[#007AFF]/20 ring-offset-1 ring-offset-[var(--color-bg-secondary)]";
                }

                return (
                  <div key={day.dateStr} className={cn(
                    "flex items-center justify-center",
                    viewMode === "weekly" ? "flex-1" : "w-[40px] shrink-0"
                  )}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (!valid || isFuture) return;
                          let nextStatus: HabitLog["status"] | null = "completed";
                          if (actualStatus === "completed") nextStatus = "failed";
                          else if (actualStatus === "failed") nextStatus = null;
                          
                          if (day.dateStr < todayDateStr && nextStatus === "completed") {
                            if (onAntiCheat) {
                              onAntiCheat(habit.id, day.dateStr, nextStatus);
                            } else {
                              onLogChange(habit.id, day.dateStr, nextStatus);
                            }
                          } else {
                            onLogChange(habit.id, day.dateStr, nextStatus);
                          }
                        }}
                        disabled={!valid || isFuture}
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-[6px] transition-transform active:scale-90",
                          bgClass,
                          borderClass,
                          valid && !isFuture && !actualStatus ? "hover:border-[var(--color-text-tertiary)]" : ""
                        )}
                      >
                        {icon}
                      </button>
                      {log?.remarks && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewRemark({ habitName: habit.name, dateStr: day.dateStr, text: log.remarks! });
                          }}
                          className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[var(--color-bg-primary)] rounded-full shadow-sm hover:scale-110 transition-transform"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-accent-blue)] fill-[var(--color-accent-blue)]/20" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[28px] bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)] p-4 shadow-sm border-t-2 border-[var(--color-primary)]/15">
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-black tracking-tight text-[var(--color-text-primary)]">
              {title}
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex p-0.5 bg-[var(--color-bg-tertiary)] rounded-xl">
                <button
                  onClick={() => setViewMode("weekly")}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                    viewMode === "weekly" 
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] shadow-sm" 
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("monthly")}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                    viewMode === "monthly" 
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] shadow-sm" 
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                >
                  Month
                </button>
              </div>
              <button 
                onClick={() => setIsPreview(true)}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-primary)] transition-transform active:scale-90 shadow-sm shrink-0"
              >
                <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handlePrev} 
              className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/50 transition-colors"
            >
              <ChevronLeft size={14} strokeWidth={3} />
            </button>
            <span className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest text-center whitespace-nowrap">
              {dateRangeStr}
            </span>
            <button 
              onClick={handleNext} 
              className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/50 transition-colors"
            >
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
        
        {habits.length === 0 ? (
          <p className="text-sm font-bold text-[var(--color-text-tertiary)] text-center py-4">No habits yet.</p>
        ) : (
          gridContent
        )}
      </div>

      <AnimatePresence>
        {isPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)] flex items-center justify-center overflow-hidden touch-none"
          >
            <div 
              className="relative flex flex-col shrink-0 w-[100dvh] h-[100dvw] bg-[var(--color-bg-primary)] shadow-2xl"
              style={{
                transform: 'rotate(90deg)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-bg-tertiary)] bg-[var(--color-bg-secondary)]">
                <div className="flex flex-col">
                  <h2 className="text-base font-black text-[var(--color-text-primary)] tracking-tight">{title}</h2>
                  <div className="flex items-center gap-1.5 -ml-1 mt-0.5">
                    <button 
                      onClick={handlePrev} 
                      className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/50 transition-colors"
                    >
                      <ChevronLeft size={14} strokeWidth={3} />
                    </button>
                    <span className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest min-w-[110px] text-center whitespace-nowrap">
                      {dateRangeStr}
                    </span>
                    <button 
                      onClick={handleNext} 
                      className="p-1 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/50 transition-colors"
                    >
                      <ChevronRight size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex p-0.5 bg-[var(--color-bg-tertiary)] rounded-xl">
                    <button
                      onClick={() => setViewMode("weekly")}
                      className={cn(
                        "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                        viewMode === "weekly" 
                          ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm" 
                          : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                      )}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setViewMode("monthly")}
                      className={cn(
                        "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors",
                        viewMode === "monthly" 
                          ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm" 
                          : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                      )}
                    >
                      Month
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsPreview(false)}
                    className="w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-primary)] transition-transform active:scale-90 shadow-sm"
                  >
                    <XCircle className="w-7 h-7 text-[var(--color-text-tertiary)]" />
                  </button>
                </div>
              </div>
              
              {/* Grid content wrapping */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--color-bg-primary)]">
                {gridContent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── View Remark Modal ── */}
      <AnimatePresence>
        {viewRemark && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm touch-none"
            onClick={() => setViewRemark(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col gap-4 border border-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base font-black text-[var(--color-text-primary)] tracking-tight truncate">
                    {viewRemark.habitName}
                  </h2>
                  <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    {new Date(viewRemark.dateStr + "T12:00:00Z").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4 text-[14px] text-[var(--color-text-primary)] leading-relaxed italic break-words break-all">
                "{viewRemark.text}"
              </div>
              
              <button
                onClick={() => setViewRemark(null)}
                className="w-full mt-2 py-3.5 rounded-[16px] font-bold text-[13px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

const CalendarContext = createContext<{
  logs: HabitLog[];
  habits: Habit[];
  selected: Date | null;
  todayDateStr: string;
  setSelected: (d: Date) => void;
} | null>(null);

function CustomDay({ day }: any) {
  const ctx = useContext(CalendarContext);
  if (!ctx) return <></>;
  return (
    <DayCell
      date={day.date}
      logs={ctx.logs}
      habits={ctx.habits}
      isToday={toDateStr(day.date) === ctx.todayDateStr}
      isSelected={ctx.selected ? toDateStr(day.date) === toDateStr(ctx.selected) : false}
      isOutside={day.outside ?? false}
      onClick={() => {
        if (!day.outside) ctx.setSelected(day.date);
      }}
    />
  );
}

export function CalendarClient({
  initialHabits = [],
  initialLogs = [],
  todayDateStr = new Date().toISOString().split("T")[0],
}: Props) {
  const supabase = createClient();
  const today = new Date(todayDateStr + "T12:00:00");

  const habits = initialHabits;
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [month, setMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [isPending, startTransition] = useTransition();
  const [slideDir, setSlideDir] = useState<number>(0);
  const [cheatConfirm, setCheatConfirm] = useState<{habitId: string, dateStr: string, status: HabitLog["status"] | null} | null>(null);
  const [remarkPrompt, setRemarkPrompt] = useState<{ habitId: string; dateStr: string } | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fetchMonth = useCallback(
    async (newMonth: Date) => {
      const y = newMonth.getFullYear();
      const m = newMonth.getMonth();
      const { startStr, endStr } = getMonthBounds(y, m);
      const { data } = await supabase
        .from("habit_logs")
        .select("habit_id, date, status, remarks")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .gte("date", startStr)
        .lte("date", endStr);
      if (data) {
        setLogs((prev) => {
          const outside = prev.filter((l) => l.date < startStr || l.date > endStr);
          return [...outside, ...(data as HabitLog[])];
        });
      }
    },
    [supabase]
  );

  const handleMonthChange = (dir: 1 | -1) => {
    setSlideDir(dir);
    const next = new Date(currentYear, currentMonth + dir, 1);
    setMonth(next);
    startTransition(() => { fetchMonth(next); });
  };

  const handleLogChange = useCallback(
    async (habitId: string, date: string, status: HabitLog["status"] | null) => {
      setLogs((prev) => {
        const without = prev.filter((l) => !(l.habit_id === habitId && l.date === date));
        return status ? [...without, { habit_id: habitId, date, status }] : without;
      });

      if (status === "completed") {
        setRemarkPrompt({ habitId, dateStr: date });
        setRemarkText("");
      }

      try {
        await setHabitLogStatus(habitId, date, status);
      } catch (e) {
        console.error("Failed to set log status:", e);
      }
    },
    []
  );

  const handleToday = () => {
    const tMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const diff = (tMonth.getFullYear() - currentYear) * 12 + (tMonth.getMonth() - currentMonth);
    if (diff !== 0) {
      setSlideDir(diff > 0 ? 1 : -1);
      setMonth(tMonth);
      startTransition(() => { fetchMonth(tMonth); });
    }
    setSelected(today);
  };

  const dayLogs = logs.filter((l) => l.date === toDateStr(selected));

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-4 pt-4 pb-14 safe-top gap-5">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#007AFF]/15 flex items-center justify-center">
            <CalendarDays className="h-4.5 w-4.5 text-[#007AFF]" />
          </div>
          <h1 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
            Calendar
          </h1>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          onClick={handleToday}
          className="text-[11px] font-black uppercase tracking-widest text-[#007AFF]
                     px-3.5 py-1.5 rounded-full bg-[#007AFF]/12
                     ring-1 ring-[#007AFF]/20 active:bg-[#007AFF]/20"
        >
          Today
        </motion.button>
      </motion.div>

      {/* ── Month Stats ── */}
      <MonthStats logs={logs} habits={habits} year={currentYear} month={currentMonth} />

      {/* ── Calendar Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.12 }}
        className="rounded-[28px] bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)]
                   px-3 pt-3 pb-3 overflow-hidden shadow-sm border-t-2 border-[var(--color-primary)]/15"
      >
        {/* ── Custom Nav ── */}
        <div className="flex items-center justify-between px-1 mb-3">
          <motion.button
            whileTap={{ scale: 0.84, x: -2 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            onClick={() => handleMonthChange(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl
                       bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
                       ring-1 ring-[var(--color-bg-tertiary)] active:bg-[var(--color-bg-tertiary)]/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.span
              key={monthName}
              initial={{ opacity: 0, y: slideDir * 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: slideDir * -10 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="text-[14px] font-black text-[var(--color-text-primary)]"
            >
              {monthName}
            </motion.span>
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.84, x: 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            onClick={() => handleMonthChange(1)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl
                       bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
                       ring-1 ring-[var(--color-bg-tertiary)] active:bg-[var(--color-bg-tertiary)]/80"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="flex justify-center">
              <span className="text-[9px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest">
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Day grid — AnimatePresence for month slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={monthName}
            initial={{ opacity: 0, x: slideDir * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDir * -30 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <CalendarContext.Provider value={{ logs, habits, selected, todayDateStr, setSelected }}>
              <DayPicker
                mode="single"
                month={month}
                selected={selected}
                onMonthChange={(m) => {
                  const dir = m > month ? 1 : -1;
                  setSlideDir(dir);
                  handleMonthChange(dir);
                }}
                onSelect={(d) => d && setSelected(d)}
                showOutsideDays
                hideNavigation
                components={{ Day: CustomDay }}
              classNames={{
                root:          "w-full",
                months:        "w-full",
                month:         "w-full",
                month_caption: "hidden",
                nav:           "hidden",
                month_grid:    "w-full border-collapse table-fixed",
                weekdays:      "hidden",
                weekday:       "hidden",
                week:          "mb-1",
                day:           "p-0.5",
                day_button:    "hidden",
                selected:      "",
                today:         "",
                outside:       "",
              }}
            />
            </CalendarContext.Provider>
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-[var(--color-bg-tertiary)]"
        >
          {[
            { color: "#34C759", label: "Done" },
            { color: "#FF9500", label: "Skipped" },
            { color: "#FF3B30", label: "Missed" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] font-bold text-[var(--color-text-tertiary)]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Day Panel ── */}
      <AnimatePresence mode="wait">
        {selected && (
          <DayPanel
            key={toDateStr(selected)}
            date={selected}
            habits={habits}
            logs={logs}
            todayDateStr={todayDateStr}
            onLogChange={handleLogChange}
            onAntiCheat={(habitId, date, status) => setCheatConfirm({ habitId, dateStr: date, status })}
            isPending={isPending}
          />
        )}
      </AnimatePresence>

      {/* ── Weekly Checklist ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HabitChecklist 
              habits={habits}
              logs={logs}
              selectedDate={selected}
              todayDateStr={todayDateStr}
              onLogChange={handleLogChange}
              onAntiCheat={(habitId, date, status) => setCheatConfirm({ habitId, dateStr: date, status })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                       bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)]
                       rounded-full px-4 py-2 flex items-center gap-2 shadow-xl"
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-[#007AFF]"
              animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[11px] font-black text-[var(--color-text-secondary)]">
              Syncing…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Anti-Cheat Modal ── */}
      <AnimatePresence>
        {cheatConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col items-center text-center gap-4 border-2 border-[#FF3B30]/20"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mb-1">
                <span className="text-3xl">🛑</span>
              </div>
              <h2 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Don't cheat yourself!</h2>
              <p className="text-[13px] font-bold text-[var(--color-text-secondary)] leading-relaxed">
                If you really completed this habit on this day, then only check in. Did you actually do it?
              </p>
              
              <div className="flex gap-2 w-full mt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCheatConfirm(null)}
                  className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleLogChange(cheatConfirm.habitId, cheatConfirm.dateStr, cheatConfirm.status);
                    setCheatConfirm(null);
                  }}
                  className="flex-1 py-3.5 rounded-[18px] font-black text-[13px] uppercase tracking-wide bg-[#34C759] text-white shadow-[0_0_20px_rgba(52,199,89,0.4)]"
                >
                  Yes, I did it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Remark Prompt Modal ── */}
      <AnimatePresence>
        {remarkPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm touch-none"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="bg-[var(--color-bg-primary)] p-6 rounded-[28px] w-full max-w-[320px] shadow-2xl flex flex-col gap-5 border border-[var(--color-bg-tertiary)]"
            >
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] mb-1">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Add a Remark?</h3>
                <p className="text-[13px] font-bold text-[var(--color-text-tertiary)] leading-snug">
                  Optionally leave a small note for this completion.
                </p>
              </div>
              
              <textarea
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="e.g., Focused and productive session..."
                className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-bg-tertiary)] rounded-2xl p-4 text-[14px] font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-blue)]/50 transition-all"
                autoFocus
                disabled={isSubmittingRemark}
              />
              
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setRemarkPrompt(null)}
                  disabled={isSubmittingRemark}
                  className="flex-1 py-3.5 rounded-[16px] font-bold text-[13px] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={async () => {
                    if (!remarkText.trim()) {
                      setRemarkPrompt(null);
                      return;
                    }
                    setIsSubmittingRemark(true);
                    try {
                      await updateHabitRemark(remarkPrompt.habitId, remarkPrompt.dateStr, remarkText.trim());
                      
                      // Optimistically update the logs state with the remark
                      setLogs(prev => prev.map(l => 
                        (l.habit_id === remarkPrompt.habitId && l.date === remarkPrompt.dateStr)
                          ? { ...l, remarks: remarkText.trim() }
                          : l
                      ));
                    } catch (e) {
                      console.error(e);
                    }
                    setIsSubmittingRemark(false);
                    setRemarkPrompt(null);
                  }}
                  disabled={isSubmittingRemark || !remarkText.trim()}
                  className="flex-1 py-3.5 rounded-[16px] font-bold text-[13px] bg-[var(--color-accent-blue)] text-white shadow-sm ring-1 ring-inset ring-white/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isSubmittingRemark ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
