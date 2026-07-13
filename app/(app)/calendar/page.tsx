// components/calendar/calendar-client.tsx
"use client";

import { useState, useCallback, useTransition } from "react";
import { DayPicker, DayProps } from "react-day-picker";
import { motion, AnimatePresence } from "motion/react";
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
};

type HabitLog = {
  habit_id: string;
  date: string;
  status: "completed" | "skipped" | "failed";
};

type Props = {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
  todayDateStr: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startStr: toDateStr(start),
    endStr: toDateStr(end),
  };
}

const STATUS_META = {
  completed: {
    icon: CheckCircle2,
    label: "Done",
    color: "#34C759",
    bg: "bg-[#34C759]/15",
    text: "text-[#34C759]",
    ring: "ring-[#34C759]/40",
  },
  skipped: {
    icon: MinusCircle,
    label: "Skip",
    color: "#FF9500",
    bg: "bg-[#FF9500]/15",
    text: "text-[#FF9500]",
    ring: "ring-[#FF9500]/40",
  },
  failed: {
    icon: XCircle,
    label: "Miss",
    color: "#FF3B30",
    bg: "bg-[#FF3B30]/15",
    text: "text-[#FF3B30]",
    ring: "ring-[#FF3B30]/40",
  },
} as const;

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

function DayCell({ date, logs, habits, isToday, isSelected, isOutside, onClick }: DayCellProps) {
  const dateStr = toDateStr(date);
  const dayLogs = logs.filter((l) => l.date === dateStr);
  const completed = dayLogs.filter((l) => l.status === "completed").length;
  const total = habits.length;
  const pct = total > 0 ? completed / total : 0;
  const haslogs = dayLogs.length > 0;
  const isPast = date < new Date(new Date().toDateString());
  const isFuture = !isPast && !isToday;

  // Arc for completion ring
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className={cn(
        "relative flex flex-col items-center justify-start w-full aspect-square rounded-2xl pt-1 pb-1 transition-all duration-150 select-none outline-none",
        isOutside && "opacity-30 pointer-events-none",
        isSelected && "ring-2 ring-[var(--color-primary)] ring-offset-1 ring-offset-[var(--color-bg-primary)]",
        !isSelected && "hover:bg-[var(--color-bg-tertiary)]"
      )}
    >
      {/* Completion ring */}
      {haslogs && !isOutside && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18" cy="18" r={r}
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="18" cy="18" r={r}
            fill="none"
            stroke={completed === total ? "#34C759" : "#007AFF"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </svg>
      )}

      {/* Day number */}
      <span
        className={cn(
          "relative z-10 text-[11px] font-black leading-none mt-1",
          isToday
            ? "text-[var(--color-primary)]"
            : isSelected
            ? "text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)]"
        )}
      >
        {date.getDate()}
      </span>

      {/* Dot indicators */}
      {haslogs && !isOutside && (
        <div className="flex gap-[2px] mt-auto mb-0.5">
          {dayLogs.slice(0, 3).map((log, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20, delay: i * 0.04 }}
              className="w-1 h-1 rounded-full"
              style={{
                backgroundColor:
                  log.status === "completed"
                    ? "#34C759"
                    : log.status === "skipped"
                    ? "#FF9500"
                    : "#FF3B30",
              }}
            />
          ))}
          {dayLogs.length > 3 && (
            <div className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
          )}
        </div>
      )}

      {/* Perfect day star */}
      {completed === total && total > 0 && !isOutside && (
        <motion.span
          className="absolute -top-1 -right-1 text-[10px] z-20"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          ⭐
        </motion.span>
      )}
    </motion.button>
  );
}

// ─── Selected Day Panel ───────────────────────────────────────────────────────

type PanelProps = {
  date: Date;
  habits: Habit[];
  logs: HabitLog[];
  todayDateStr: string;
  onLogChange: (habitId: string, date: string, status: HabitLog["status"] | null) => Promise<void>;
  isPending: boolean;
};

function DayPanel({ date, habits, logs, todayDateStr, onLogChange, isPending }: PanelProps) {
  const dateStr = toDateStr(date);
  const isToday = dateStr === todayDateStr;
  const isFuture = date > new Date(todayDateStr);
  const isEditable = !isFuture;

  const dayLogs = logs.filter((l) => l.date === dateStr);
  const completedCount = dayLogs.filter((l) => l.status === "completed").length;

  const label = isToday
    ? "Today"
    : date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div
      key={dateStr}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="rounded-[28px] bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)] overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-black text-[var(--color-text-primary)]">{label}</h3>
          <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] mt-0.5 uppercase tracking-widest">
            {completedCount}/{habits.length} habits done
          </p>
        </div>

        {/* Mini completion badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black",
            completedCount === habits.length && habits.length > 0
              ? "bg-[#34C759]/20 text-[#34C759]"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
          )}
        >
          {completedCount === habits.length && habits.length > 0 ? (
            <>
              <Sparkles className="h-3 w-3" /> Perfect
            </>
          ) : (
            `${Math.round((completedCount / Math.max(habits.length, 1)) * 100)}%`
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#34C759] to-[#30D158]"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / Math.max(habits.length, 1)) * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Habit rows */}
      {habits.length === 0 ? (
        <div className="px-5 pb-5 text-center text-sm text-[var(--color-text-tertiary)] font-bold">
          No habits yet. Add some! 🌱
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-bg-tertiary)]">
          {habits.map((habit, idx) => {
            const log = dayLogs.find((l) => l.habit_id === habit.id);
            const status = log?.status ?? null;

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 28 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                {/* Emoji + name */}
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${habit.color}22` }}
                >
                  {habit.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">
                    {habit.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame className="h-2.5 w-2.5 text-[#FF9500]" />
                    <span className="text-[10px] font-bold text-[var(--color-text-tertiary)]">
                      {habit.current_streak}d streak
                    </span>
                  </div>
                </div>

                {/* Status buttons */}
                {isEditable ? (
                  <div className="flex items-center gap-1.5">
                    {(["completed", "skipped", "failed"] as const).map((s) => {
                      const meta = STATUS_META[s];
                      const Icon = meta.icon;
                      const isActive = status === s;
                      return (
                        <motion.button
                          key={s}
                          whileTap={{ scale: 0.82 }}
                          disabled={isPending}
                          onClick={() => onLogChange(habit.id, dateStr, isActive ? null : s)}
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all ring-1",
                            isActive
                              ? `${meta.bg} ${meta.ring}`
                              : "bg-[var(--color-bg-tertiary)] ring-transparent",
                            isPending && "opacity-50 cursor-not-allowed"
                          )}
                          title={meta.label}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: isActive ? meta.color : "var(--color-text-tertiary)" }}
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] italic">
                    Future
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="h-4" />
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function MonthStats({ logs, habits, year, month }: {
  logs: HabitLog[];
  habits: Habit[];
  year: number;
  month: number;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalPossible = daysInMonth * habits.length;
  const completed = logs.filter((l) => l.status === "completed").length;
  const skipped = logs.filter((l) => l.status === "skipped").length;
  const perfectDays = (() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayLogs = logs.filter((l) => l.date === ds);
      if (
        habits.length > 0 &&
        dayLogs.filter((l) => l.status === "completed").length === habits.length
      ) count++;
    }
    return count;
  })();

  const stats = [
    { icon: CheckCircle2, label: "Done", value: completed, color: "#34C759" },
    { icon: MinusCircle, label: "Skipped", value: skipped, color: "#FF9500" },
    { icon: Target, label: "Perfect days", value: perfectDays, color: "#007AFF" },
    {
      icon: BarChart2,
      label: "Rate",
      value: `${totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0}%`,
      color: "#AF52DE",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 28 }}
            className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--color-bg-secondary)] py-3 px-1 ring-1 ring-[var(--color-bg-tertiary)]"
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${s.color}20` }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
            </div>
            <span className="text-sm font-black text-[var(--color-text-primary)]">{s.value}</span>
            <span className="text-[8px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide text-center leading-tight">
              {s.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export default function CalendarClient({ initialHabits = [], initialLogs = [], todayDateStr = new Date().toISOString().split('T')[0] }: any) {
  const supabase = createClient();
  const today = new Date(todayDateStr + "T12:00:00");

  const [habits] = useState<Habit[]>(initialHabits);
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [month, setMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const [isPending, startTransition] = useTransition();

  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();

  // ── Fetch logs for a new month ──────────────────────────────────────────────
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
          // Remove old month logs, add new
          const outside = prev.filter((l) => l.date < startStr || l.date > endStr);
          return [...outside, ...(data as HabitLog[])];
        });
      }
    },
    [supabase]
  );

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
    startTransition(() => { fetchMonth(newMonth); });
  };

  // ── Upsert / delete log ─────────────────────────────────────────────────────
  const handleLogChange = useCallback(
    async (habitId: string, date: string, status: HabitLog["status"] | null) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Optimistic update
      setLogs((prev) => {
        const without = prev.filter((l) => !(l.habit_id === habitId && l.date === date));
        if (status === null) return without;
        return [...without, { habit_id: habitId, date, status }];
      });

      if (status === null) {
        await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", date)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("habit_logs")
          .upsert({ habit_id: habitId, date, status, user_id: userId }, { onConflict: "habit_id,date" });
      }
    },
    [supabase]
  );

  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)] px-4 pt-4 pb-12 safe-top gap-5">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
          Calendar
        </h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }}
          className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10"
        >
          Today
        </motion.button>
      </motion.div>

      {/* ── Month Stats ── */}
      <MonthStats logs={logs} habits={habits} year={currentYear} month={currentMonth} />

      {/* ── Calendar ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
        className="rounded-[28px] bg-[var(--color-bg-secondary)] ring-1 ring-[var(--color-bg-tertiary)] px-3 pt-4 pb-3 overflow-hidden"
      >
        <DayPicker
          mode="single"
          month={month}
          selected={selected}
          onMonthChange={handleMonthChange}
          onSelect={(d) => d && setSelected(d)}
          showOutsideDays
          components={{
            Day: ({ date, displayMonth }: DayProps) => {
              const isOutside = date.getMonth() !== displayMonth.getMonth();
              return (
                <DayCell
                  date={date}
                  logs={logs}
                  habits={habits}
                  isToday={toDateStr(date) === todayDateStr}
                  isSelected={selected ? toDateStr(date) === toDateStr(selected) : false}
                  isOutside={isOutside}
                  onClick={() => setSelected(date)}
                />
              );
            },
            // Custom nav
            Nav: () => (
              <div className="flex items-center justify-between px-2 mb-3">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleMonthChange(new Date(currentYear, currentMonth - 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={monthName}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="text-sm font-black text-[var(--color-text-primary)]"
                  >
                    {monthName}
                  </motion.span>
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleMonthChange(new Date(currentYear, currentMonth + 1, 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            ),
          }}
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "w-full",
            month_caption: "hidden",
            nav: "hidden", // we render our own Nav via components
            month_grid: "w-full border-collapse",
            weekdays: "flex w-full mb-2",
            weekday: "flex-1 text-center text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest py-1",
            week: "flex w-full gap-1 mb-1",
            day: "flex-1 p-0",
            day_button: "hidden",
            selected: "",
            today: "",
            outside: "",
          }}
        />
      </motion.div>

      {/* ── Day Detail Panel ── */}
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
    </div>
  );
}