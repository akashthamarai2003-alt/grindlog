"use client";

import { useState } from "react";
import { HabitCard } from "./habit-card";
import { toggleHabitCompletion } from "@/app/actions/habits";

interface HabitWithLog {
  id: string;
  name: string;
  emoji: string;
  targetCount: number;
  targetUnit: string;
  color: string;
  currentStreak: number;
  isCompleted: boolean;
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

  return (
    <div className="flex flex-col gap-2.5">
      {optimisticHabits.map((habit) => (
        <HabitCard 
          key={habit.id}
          habit={habit} 
          onComplete={() => handleHabitComplete(habit.id, habit.isCompleted, habit.currentStreak)} 
        />
      ))}
    </div>
  );
}
