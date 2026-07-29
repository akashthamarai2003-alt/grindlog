import { create } from "zustand";
import type { Habit, HabitLog } from "@/types";

interface HabitState {
  habits: Habit[];
  todayLogs: Map<string, HabitLog>;
  isLoading: boolean;
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  setTodayLogs: (logs: HabitLog[]) => void;
  addLog: (log: HabitLog) => void;
  setLoading: (loading: boolean) => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  todayLogs: new Map(),
  isLoading: false,
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
  updateHabit: (id, updates) =>
    set((s) => ({
      habits: s.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),
  removeHabit: (id) =>
    set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
  setTodayLogs: (logs) => {
    const map = new Map<string, HabitLog>();
    logs.forEach((log) => map.set(log.habit_id, log));
    set({ todayLogs: map });
  },
  addLog: (log) =>
    set((s) => {
      const map = new Map(s.todayLogs);
      map.set(log.habit_id, log);
      return { todayLogs: map };
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
