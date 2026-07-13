import { createServerSupabase } from "@/lib/services/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitsListClient } from "@/components/habits/habits-list-client";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // For the list, we also need some placeholder or real log data if HabitCard expects it.
  // HabitCard takes HabitWithLog which has `isCompleted` and `currentStreak`.
  // We can fetch today's logs to accurately render the HabitCards.
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", todayDateStr);

  const logsByHabitId = (logs || []).reduce((acc: any, log: any) => {
    acc[log.habit_id] = log;
    return acc;
  }, {});

  const habitsWithLogs = (habits || []).map((habit: any) => {
    const log = logsByHabitId[habit.id];
    return {
      id: habit.id,
      name: habit.name,
      emoji: habit.emoji || "✨",
      targetCount: habit.target_count || 1,
      targetUnit: habit.target_unit || "times",
      color: habit.color || "#34c759",
      currentStreak: habit.current_streak || 0,
      isCompleted: log?.status === "completed",
    };
  });

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-4 safe-top min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">All Habits</h1>
        <Link href="/habits/new">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)]/20 transition-colors">
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </Link>
      </div>

      {/* Habit List */}
      <div className="flex flex-col gap-3">
        {habitsWithLogs.length === 0 ? (
          <div className="text-center p-8 bg-[var(--color-bg-secondary)] rounded-3xl border border-dashed border-[var(--color-bg-tertiary)] mt-10">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">No Habits Yet</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Start your journey by creating your very first habit.
            </p>
            <Link href="/habits/new">
              <button className="rounded-full bg-[var(--color-accent-green)] px-6 py-3 text-sm font-bold text-white shadow-lg">
                Create a Habit
              </button>
            </Link>
          </div>
        ) : (
          <HabitsListClient initialHabits={habitsWithLogs} todayDateStr={todayDateStr} />
        )}
      </div>
    </div>
  );
}
