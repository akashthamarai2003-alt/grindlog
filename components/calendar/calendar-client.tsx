"use client";

import { useState, useCallback, useTransition, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/services/supabase/client";
import "react-day-picker/dist/style.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Habit = {
  id: string;
  name: string;
  emoji: string;
  target_count: number;
  target_unit: string;
  color: string;
  current_streak: number;
  preferred_time?: string;
  reminder_time?: string | null;
};

type HabitLog = {
  habit_id: string;
  date: string;
  status: "completed" | "skipped" | "failed";
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
    darkColor: "#30D158",
    bg: "bg-[#34C759]/15",
    ring: "ring-[#34C759]/50",
    glow: "shadow-[0_0_12px_rgba(52,199,89,0.4)]",
  },
  skipped: {
    icon: MinusCircle,
    label: "Skip",
    color: "#FF9500",
    darkColor: "#FF9F0A",
    bg: "bg-[#FF9500]/15",
    ring: "ring-[#FF9500]/50",
    glow: "shadow-[0_0_12px_rgba(255,149,0,0.4)]",
  },
  failed: {
    icon: XCircle,
    label: "Miss",
    color: "#FF3B30",
    darkColor: "#FF453A",
    bg: "bg-[#FF3B30]/15",
    ring: "ring-[#FF3B30]/50",
    glow: "shadow-[0_0_12px_rgba(255,59,48,0.4)]",
  },
} as const;

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useState(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return controls.stop;
  });

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
  const completed = dayLogs.filter((l) => l.status === "completed").length;
  const total = habits.length;
  const pct = total > 0 ? completed / total : 0;
  const hasLogs = dayLogs.length > 0;
  const isPerfect = completed === total && total > 0;

  // SVG ring
  const r = 13;
  const circ = 2 * Math.PI * r;
  const ringColor = isPerfect ? "#34C759" : "#007AFF";

  return (
    <td role="gridcell" className="p-0 text-center focus-within:relative focus-within:z-20">
      <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.82 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={cn(
        "relative flex flex-col items-center justify-start w-full aspect-square",
        "rounded-[14px] pt-1.5 pb-1 select-none outline-none",
        "transition-all duration-200",
        isOutside && "opacity-20 pointer-events-none",
        isSelected && !isOutside && [
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
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: pct, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          />
        </svg>
      )}

      {/* Perfect-day glow backdrop */}
      {isPerfect && !isOutside && (
        <motion.div
          className="absolute inset-0 rounded-[14px] bg-[#34C759]/8 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Day number */}
      <motion.span
        className={cn(
          "relative z-10 text-[11px] font-black leading-none",
          isToday ? "text-[#007AFF]" :
          isSelected ? "text-[var(--color-text-primary)]" :
          isOutside ? "text-[var(--color-text-tertiary)]/40" :
          isPerfect ? "text-[#248A3D] dark:text-[#30D158]" :
          !isPerfect && pct > 0 ? "text-[#0055B3] dark:text-[#409CFF]" :
          pct === 0 && dayLogs.some(l => l.status === "skipped") ? "text-[#D07200] dark:text-[#FF9F0A]" :
          pct === 0 && dayLogs.some(l => l.status === "failed") ? "text-[#D1231B] dark:text-[#FF453A]" :
          "text-[var(--color-text-secondary)]",
        )}
        animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {date.getDate()}
      </motion.span>

      {/* Today dot */}
      {isToday && (
        <motion.div
          className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#007AFF]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        />
      )}

      {/* Status dots */}
      {hasLogs && !isToday && !isOutside && (
        <div className="flex gap-[2px] mt-auto mb-0.5">
          {dayLogs.slice(0, 3).map((log, i) => (
            <motion.div
              key={i}
              className="w-[3px] h-[3px] rounded-full"
              style={{
                backgroundColor:
                  log.status === "completed" ? "#34C759" :
                  log.status === "skipped"   ? "#FF9500" : "#FF3B30",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring", stiffness: 600, damping: 20,
                delay: 0.05 + i * 0.04,
              }}
            />
          ))}
        </div>
      )}

      {/* Perfect ⭐ */}
      {isPerfect && !isOutside && (
        <motion.span
          className="absolute -top-1.5 -right-1 text-[9px] z-20 leading-none"
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 15, delay: 0.2 }}
        >
          ⭐
        </motion.span>
      )}
    </motion.button>
    </td>
  );
}

// ─── Habit Row ────────────────────────────────────────────────────────────────

type HabitRowProps = {
  habit: Habit;
  status: HabitLog["status"] | null;
  isEditable: boolean;
  isPending: boolean;
  idx: number;
  onToggle: (s: HabitLog["status"] | null) => void;
};

function HabitRow({ habit, status, isEditable, isPending, idx, onToggle }: HabitRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 14 }}
      transition={{
        type: "spring", stiffness: 300, damping: 28,
        delay: 0.05 + idx * 0.055,
      }}
      className="flex items-center gap-3 px-4 py-3"
    >
      {/* Emoji bubble */}
      <motion.div
        whileTap={{ scale: 0.88, rotate: -8 }}
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border"
        style={{
          backgroundColor: `${habit.color}22`,
          borderColor: `${habit.color}44`,
          boxShadow: status === "completed"
            ? `0 0 0 2px ${habit.color}55`
            : "none",
        }}
      >
        {habit.emoji}
      </motion.div>

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
        <div className="flex items-center gap-1.5">
          {(["completed", "skipped", "failed"] as const).map((s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            const isActive = status === s;

            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.78 }}
                transition={{ type: "spring", stiffness: 600, damping: 20 }}
                disabled={isPending}
                onClick={() => onToggle(isActive ? null : s)}
                title={meta.label}
                className={cn(
                  "w-8 h-8 rounded-[10px] flex items-center justify-center",
                  "transition-all duration-200 ring-1",
                  isActive
                    ? `${meta.bg} ${meta.ring} ${meta.glow}`
                    : "bg-[var(--color-bg-tertiary)] ring-transparent",
                  isPending && "opacity-40 cursor-not-allowed",
                )}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.3, 1], rotate: [0, -10, 0] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className="h-[15px] w-[15px]"
                    style={{ color: isActive ? meta.color : "var(--color-text-tertiary)" }}
                  />
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
          <Lock className="h-3 w-3" />
          <span className="text-[10px] font-bold">Future</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Day Panel ────────────────────────────────────────────────────────────────

type PanelProps = {
  date: Date;
  habits: Habit[];
  logs: HabitLog[];
  todayDateStr: string;
  onLogChange: (habitId: string, date: string, status: HabitLog["status"] | null) => void;
  isPending: boolean;
};

function DayPanel({ date, habits, logs, todayDateStr, onLogChange, isPending }: PanelProps) {
  const dateStr = toDateStr(date);
  const isToday = dateStr === todayDateStr;
  const todayDate = new Date(todayDateStr + "T12:00:00");
  const isFuture = date > todayDate;
  const isEditable = !isFuture;

  const dayLogs = logs.filter((l) => l.date === dateStr);
  const completedCount = dayLogs.filter((l) => l.status === "completed").length;
  const totalHabits = habits.length;
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
            {habits.map((habit, idx) => {
              const log = dayLogs.find((l) => l.habit_id === habit.id);
              const status = log?.status ?? null;
              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  status={status}
                  isEditable={isEditable}
                  isPending={isPending}
                  idx={idx}
                  onToggle={(s) => onLogChange(habit.id, dateStr, s)}
                />
              );
            })}
          </div>
        </AnimatePresence>
      )}

      <div className="h-3" />
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
  const totalPossible = daysInMonth * habits.length;
  const completed = logs.filter((l) => l.status === "completed").length;
  const skipped = logs.filter((l) => l.status === "skipped").length;
  const rate = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

  const perfectDays = (() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dl = logs.filter((l) => l.date === ds);
      if (habits.length > 0 && dl.filter((l) => l.status === "completed").length === habits.length)
        count++;
    }
    return count;
  })();

  const stats = [
    { icon: CheckCircle2, label: "Done",    value: completed,   color: "#34C759", numeral: true },
    { icon: MinusCircle,  label: "Skipped", value: skipped,     color: "#FF9500", numeral: true },
    { icon: Target,       label: "Perfect", value: perfectDays, color: "#007AFF", numeral: true },
    { icon: BarChart2,    label: "Rate",    value: rate,        color: "#AF52DE", suffix: "%" },
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring", stiffness: 320, damping: 26,
              delay: 0.08 + i * 0.07,
            }}
            className="flex flex-col items-center gap-1.5 rounded-[20px] py-3.5 px-1
                       bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)]
                       relative overflow-hidden"
          >
            {/* Subtle color bg */}
            <div
              className="absolute inset-0 opacity-[0.09] pointer-events-none"
              style={{ backgroundColor: s.color }}
            />

            <div
              className="w-7 h-7 rounded-[10px] flex items-center justify-center relative"
              style={{ backgroundColor: `${s.color}2C` }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
            </div>

            <span className="text-[15px] font-black text-[var(--color-text-primary)] leading-none relative">
              {"suffix" in s
                ? `${s.value}%`
                : s.value}
            </span>

            <span className="text-[8px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide text-center leading-none">
              {s.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function CalendarClient({
  initialHabits = [],
  initialLogs = [],
  todayDateStr = new Date().toISOString().split("T")[0],
}: Props) {
  const supabase = createClient();
  const today = new Date(todayDateStr + "T12:00:00");

  const [habits] = useState<Habit[]>(initialHabits);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [month, setMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [isPending, startTransition] = useTransition();
  const [slideDir, setSlideDir] = useState<number>(0);

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
        .select("habit_id, date, status")
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLogs((prev) => {
        const without = prev.filter((l) => !(l.habit_id === habitId && l.date === date));
        return status ? [...without, { habit_id: habitId, date, status }] : without;
      });

      if (status === null) {
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", date)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("habit_logs")
          .upsert(
            { habit_id: habitId, date, status, user_id: user.id } as any,
            { onConflict: "habit_id,date" }
          );
      }
    },
    [supabase]
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
              initial={{ opacity: 0, y: slideDir * 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: slideDir * -10, filter: "blur(4px)" }}
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
            initial={{ opacity: 0, x: slideDir * 30, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: slideDir * -30, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
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
              components={{
                Day: ({ day }: any) => (
                  <DayCell
                    date={day.date}
                    logs={logs}
                    habits={habits}
                    isToday={toDateStr(day.date) === todayDateStr}
                    isSelected={selected ? toDateStr(day.date) === toDateStr(selected) : false}
                    isOutside={day.outside ?? false}
                    onClick={() => setSelected(day.date)}
                  />
                ),
              }}
              classNames={{
                root:          "w-full",
                months:        "w-full",
                month:         "w-full",
                month_caption: "hidden",
                nav:           "hidden",
                month_grid:    "w-full border-collapse",
                weekdays:      "hidden",
                weekday:       "hidden",
                week:          "grid grid-cols-7 gap-1 mb-1",
                day:           "p-0",
                day_button:    "hidden",
                selected:      "",
                today:         "",
                outside:       "",
              }}
            />
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
            isPending={isPending}
          />
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
    </div>
  );
}
