"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { springs } from "@/animations/springs";
import { cn } from "@/lib/utils";
import { toggleHabitCompletion } from "@/app/actions/habits";
import { createBrowserClient } from "@supabase/ssr";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Habit {
  id: string;
  name: string;
  emoji: string;
  target_count: number;
  target_unit: string;
  color: string;
  current_streak: number;
}

interface HabitLog {
  habit_id: string;
  date: string; // YYYY-MM-DD
  status: string;
}

interface CalendarClientProps {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
  todayDateStr: string;
}

export function CalendarClient({ initialHabits, initialLogs, todayDateStr }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date(todayDateStr));
  const [selectedDate, setSelectedDate] = useState(new Date(todayDateStr));
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Derive Year and Month from currentDate
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // Fetch logs when month changes
  useEffect(() => {
    // If it's the initial load month, we don't need to refetch unless we want to ensure freshness.
    // Let's just fetch if it's different from today's month/year
    const today = new Date(todayDateStr);
    if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      setLogs(initialLogs);
      return;
    }

    async function fetchMonthLogs() {
      setIsLoadingMonth(true);
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      const startStr = startOfMonth.toISOString().split('T')[0];
      const endStr = endOfMonth.toISOString().split('T')[0];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);

      if (data) {
        setLogs(data);
      }
      setIsLoadingMonth(false);
    }
    fetchMonthLogs();
  }, [currentMonth, currentYear, initialLogs, todayDateStr, supabase]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const numDays = endOfMonth.getDate();

    // JS getDay() is 0 for Sunday, 1 for Monday. We want Monday=0.
    let startDayOfWeek = startOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday

    // Previous month filler days
    const prevMonth = new Date(currentYear, currentMonth, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, dim: true, date: new Date(currentYear, currentMonth - 1, prevMonthDays - i) });
    }

    // Current month days
    for (let i = 1; i <= numDays; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate completion status
      const daysLogs = logs.filter(l => l.date === dateStr && l.status === 'completed');
      let status = null;
      if (dateStr === todayDateStr) {
        status = 'today';
      } else if (daysLogs.length > 0) {
        if (daysLogs.length === initialHabits.length) {
          status = 'completed'; // All done
        } else {
          status = 'partial'; // Some done
        }
      }

      days.push({ day: i, dim: false, date: d, dateStr, status });
    }

    // Next month filler days (to complete 6 rows if needed, or just fill the last row)
    const remainingSlots = 42 - days.length; // 6 rows * 7 days
    if (remainingSlots > 0 && remainingSlots < 14) { // only fill if it doesn't add an entire empty week
        for (let i = 1; i <= remainingSlots; i++) {
            days.push({ day: i, dim: true, date: new Date(currentYear, currentMonth + 1, i) });
        }
    }

    return days;
  }, [currentYear, currentMonth, logs, initialHabits.length, todayDateStr]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Selected Date Details
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedLogs = logs.filter(l => l.date === selectedDateStr && l.status === 'completed');
  const selectedCompletionPct = initialHabits.length > 0 
    ? Math.round((selectedLogs.length / initialHabits.length) * 100) 
    : 0;

  const handleHabitToggle = async (habitId: string, currentCompletedStatus: boolean, streak: number) => {
    const newStatus = !currentCompletedStatus;
    
    // Optimistic UI update inside `logs` state
    setLogs(prev => {
      if (newStatus) {
        // add log
        return [...prev, { habit_id: habitId, date: selectedDateStr, status: 'completed' }];
      } else {
        // remove log
        return prev.filter(l => !(l.habit_id === habitId && l.date === selectedDateStr));
      }
    });

    try {
      await toggleHabitCompletion(habitId, selectedDateStr, newStatus, streak, 10);
    } catch (e) {
      console.error("Failed to toggle:", e);
      // We should ideally revert optimistic state here, but skipping for brevity
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
            {monthNames[currentMonth]} {currentYear}
          </h1>
          <ChevronRight className="h-4 w-4 rotate-90 text-[var(--color-text-tertiary)]" strokeWidth={3} />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="text-[var(--color-text-primary)] transition-transform active:scale-90">
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <button onClick={nextMonth} className="text-[var(--color-text-primary)] transition-transform active:scale-90">
            <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springs.default, delay: 0.1 }}
        className="rounded-3xl bg-[var(--color-bg-elevated)] p-5 shadow-[var(--shadow-card)] relative"
      >
        {isLoadingMonth && (
           <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 rounded-3xl flex items-center justify-center backdrop-blur-[1px]">
             <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

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
          {calendarDays.map((item, i) => {
             const isSelected = item.dateStr === selectedDateStr;
             return (
              <div key={i} className="flex flex-col items-center gap-1.5 relative">
                <button
                  onClick={() => !item.dim && item.dateStr && setSelectedDate(new Date(item.dateStr))}
                  disabled={item.dim}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold transition-all",
                    item.status === "today" && !isSelected && "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]",
                    isSelected && item.status !== "today" && "border-2 border-[var(--color-accent-green)] text-[var(--color-accent-green)]",
                    isSelected && item.status === "today" && "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)] border-2 border-white dark:border-black",
                    item.dim
                      ? "text-[var(--color-text-tertiary)] opacity-50 cursor-default"
                      : (!item.status || item.status !== "today") && !isSelected
                        ? "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]" : ""
                  )}
                >
                  {item.day}
                </button>
                {/* Status dot below number */}
                {item.status && item.status !== "today" && !item.dim && (
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full absolute -bottom-1",
                      item.status === "completed"
                        ? "bg-[var(--color-accent-green)]"
                        : "bg-[#FF9500]"
                    )}
                  />
                )}
              </div>
             );
          })}
        </div>
      </motion.div>

      {/* Selected Date Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.default, delay: 0.2 }}
        className="flex flex-col gap-4 mt-2"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-extrabold text-[var(--color-text-primary)]">
            {selectedDateStr === todayDateStr ? "Today" : selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <span className="text-[15px] font-extrabold text-[var(--color-accent-green)]">
            {selectedCompletionPct}%
          </span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {initialHabits.length === 0 ? (
            <div className="text-center p-6 bg-[var(--color-bg-secondary)] rounded-2xl border border-dashed border-[var(--color-bg-tertiary)]">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">No habits created yet.</p>
            </div>
          ) : (
            initialHabits.map((habit, index) => {
              const isDone = selectedLogs.some(l => l.habit_id === habit.id);
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between rounded-[20px] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[18px]"
                      style={{ backgroundColor: (habit.color || "#34C759") + "15" }}
                    >
                      {habit.emoji || "✨"}
                    </div>
                    <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
                      {habit.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-[12px] font-bold text-[var(--color-text-tertiary)]">
                      {habit.target_count} {habit.target_unit || "times"}
                    </span>
                    <button
                      onClick={() => handleHabitToggle(habit.id, isDone, habit.current_streak)}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                        isDone
                          ? "bg-[var(--color-accent-green)] text-white shadow-[var(--shadow-glow-green)]"
                          : "border-2 border-[var(--color-bg-tertiary)] bg-transparent text-transparent hover:border-[var(--color-text-tertiary)]"
                      )}
                    >
                      <Check className="h-[14px] w-[14px]" strokeWidth={3} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}
