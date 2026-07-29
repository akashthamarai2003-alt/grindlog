"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/services/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useHabitStore } from "@/store/habit-store";
import type { Habit, HabitLog } from "@/types";

export function useHabits() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const userId = useAuthStore((s) => s.user?.id);
  const { habits, todayLogs, isLoading, setHabits, setTodayLogs, setLoading } =
    useHabitStore();
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (err) setError(err.message);
    if (data) setHabits(data as Habit[]);
    setLoading(false);
  }, [userId, supabase, setHabits, setLoading]);

  const fetchTodayLogs = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    const { data, error: err } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);

    if (err) setError(err.message);
    if (data) setTodayLogs(data as HabitLog[]);
  }, [userId, supabase, setTodayLogs]);

  useEffect(() => {
    fetchHabits();
    fetchTodayLogs();
  }, [fetchHabits, fetchTodayLogs]);

  const createHabit = async (habit: Omit<Habit, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!userId) return null;
    const { data, error: err } = await supabase
      .from("habits")
      .insert({ ...habit, user_id: userId })
      .select()
      .single();

    if (err) { setError(err.message); return null; }
    if (data) {
      setHabits([...habits, data as Habit]);
      return data as Habit;
    }
    return null;
  };

  const completeHabit = async (habitId: string) => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const xpEarned = 50;
    const coinsEarned = 10;
    const newStreak = habit.current_streak + 1;
    const newLongest = Math.max(newStreak, habit.longest_streak);

    const { error: err } = await supabase.from("habit_logs").upsert({
      habit_id: habitId,
      user_id: userId,
      date: today,
      status: "completed",
      completed_at: new Date().toISOString(),
      streak_before: habit.current_streak,
      streak_after: newStreak,
      xp_earned: xpEarned,
      coins_earned: coinsEarned,
    });

    if (err) { setError(err.message); return; }

    await supabase
      .from("habits")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        total_completions: habit.total_completions + 1,
        completion_rate:
          ((habit.total_completions + 1) /
            (habit.total_completions + habit.total_skips + 1)) *
          100,
      } as any)
      .eq("id", habitId);

    await supabase.rpc("add_xp", { xp_amount: xpEarned } as any);
    await supabase.rpc("water_tree");

    await fetchHabits();
    await fetchTodayLogs();
  };

  const skipHabit = async (habitId: string) => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    await supabase.from("habit_logs").upsert({
      habit_id: habitId,
      user_id: userId,
      date: today,
      status: "skipped",
      streak_before: habit.current_streak,
      streak_after: 0,
      xp_earned: 0,
      coins_earned: 0,
    } as any);

    await supabase
      .from("habits")
      .update({
        current_streak: 0,
        total_skips: habit.total_skips + 1,
        completion_rate:
          (habit.total_completions /
            (habit.total_completions + habit.total_skips + 1)) *
          100,
      } as any)
      .eq("id", habitId);

    await fetchHabits();
    await fetchTodayLogs();
  };

  return {
    habits,
    todayLogs,
    isLoading,
    error,
    createHabit,
    completeHabit,
    skipHabit,
    refetch: () => {
      fetchHabits();
      fetchTodayLogs();
    },
  };
}
