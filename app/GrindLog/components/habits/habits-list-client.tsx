"use client";

import { useState } from "react";
import { HabitCard } from "./habit-card";
import { toggleHabitCompletion, deleteHabit } from "@/app/actions/habits";

interface HabitWithLog {
  id: string;
  name: string;
  emoji: string;
  targetCount: number;
  targetUnit: string;
  color: string;
  currentStreak: number;
  isCompleted: boolean;
  preferredTime?: string;
  reminderTime?: string | null;
}

interface HabitsListClientProps {
  initialHabits: HabitWithLog[];
  todayDateStr: string;
}

export function HabitsListClient({ initialHabits, todayDateStr }: HabitsListClientProps) {
  const [optimisticHabits, setOptimisticHabits] = useState(initialHabits);

  const handleHabitComplete = async (habitId: string, currentCompletedStatus: boolean, streak: number) => {
    const newStatus = !currentCompletedStatus;
    
    // Optimistic UI update
    setOptimisticHabits(prev => 
      prev.map(h => h.id === habitId ? { ...h, isCompleted: newStatus } : h)
    );

    // Call server action
    try {
      await toggleHabitCompletion(habitId, todayDateStr, newStatus, streak, 10);
    } catch (e) {
      // Revert on failure
      setOptimisticHabits(initialHabits);
      console.error(e);
    }
  };

  const handleHabitDelete = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    const previousHabits = optimisticHabits;
    setOptimisticHabits((prev) => prev.filter((h) => h.id !== habitId));

    try {
      const res = await deleteHabit(habitId);
      if (!res.success) {
        throw new Error(res.error || "Failed to delete");
      }
    } catch (e) {
      setOptimisticHabits(previousHabits);
      console.error(e);
      alert("Failed to delete habit. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {optimisticHabits.map((habit) => (
        <HabitCard 
          key={habit.id}
          habit={habit} 
          onComplete={() => handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak)} 
          onDelete={() => handleHabitDelete(habit.id)}
        />
      ))}
    </div>
  );
}
