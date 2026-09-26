"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { WorkoutHeader } from "./workout-header";
import { WeeklyWorkoutView } from "./weekly-workout-view";
import { ActiveWorkoutResumeCard } from "./active-workout-resume-card";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { AiCoachNote } from "./ai-coach-note";
import { TodaysExercisesList } from "./todays-exercises-list";
import { WorkoutPageData } from "@/types/fitness/workout-page";
import { workoutClientCache } from "@/lib/api/workout-cache";

interface WorkoutViewProps {
  initialData: WorkoutPageData;
}

export function WorkoutView({ initialData }: WorkoutViewProps) {
  // Server data includes the current local date and complete exercise details.
  const [data, setData] = useState<WorkoutPageData>(initialData);

  // Reconcile with fresh server data when it arrives
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      workoutClientCache.set(initialData);
    }
  }, [initialData]);

  // Listen for local mutations (session discarded, completed, etc.)
  useEffect(() => {
    const handleUpdate = () => {
      const cached = workoutClientCache.get();
      if (cached) {
        setData({ ...cached });
      }
    };

    window.addEventListener("grindlog_workout_updated", handleUpdate);
    return () => window.removeEventListener("grindlog_workout_updated", handleUpdate);
  }, []);

  const handleWorkoutDiscard = () => {
    setData(prev => {
      if (!prev?.effectiveWorkout) return prev;
      const updatedEffectiveWorkout = {
        ...prev.effectiveWorkout,
        status: "scheduled",
        started_at: null,
        completed_at: null,
        duration_minutes: null,
        completedExercises: 0,
        fitness_os_exercises: prev.effectiveWorkout.fitness_os_exercises?.map((exercise: any) => ({
          ...exercise,
          fitness_os_sets: exercise.fitness_os_sets?.map((set: any) => ({
            ...set,
            completed: false,
            actual_reps: null,
            weight_kg: null,
            duration_seconds: null,
            completed_at: null,
          })),
        })),
      };

      const nextData: WorkoutPageData = {
        ...prev,
        effectiveWorkout: updatedEffectiveWorkout,
      };

      workoutClientCache.set(nextData);
      return nextData;
    });
  };

  const {
    dateStr,
    isFree,
    planBadge,
    effectiveWeekDays,
    effectivePlanDays,
    effectiveWorkout,
    nextWorkout,
    nextWorkoutLabel,
    hasActivePlan,
    isPro,
    initialCoachNote,
  } = data;

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
        <WorkoutHeader 
          title="Your Workouts" 
          dateStr={dateStr}
          isMainPage={true}
          planBadge={planBadge}
        />
        
        <div className="mt-2">
          <WeeklyWorkoutView weekDays={effectiveWeekDays} planDays={effectivePlanDays} />

          {!effectiveWorkout && !nextWorkout ? (
            <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-6 mb-6">
              <div className="absolute inset-0 bg-gradient-to-b from-[#1A2619] to-transparent rounded-[24px]" />
              <div className="relative bg-[#0A1108] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col items-center justify-center gap-6 text-center py-12">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Rest & Recovery Day</h3>
                <p className="text-sm font-medium text-white/60">
                  {hasActivePlan ? "Your saved AI plan has no workout scheduled for this day." : "Your saved workout plan is not available yet."}
                </p>
                {!hasActivePlan && <Link href="/report" className="rounded-xl bg-[#ADFF00] px-6 py-3 font-black uppercase tracking-wider text-black">View Plan Setup</Link>}
              </div>
            </div>
          ) : !effectiveWorkout && nextWorkout ? (
            <div className="mt-6 mb-6">
              <div className="mb-3 flex items-center gap-2 px-2 text-[#ADFF00]">
                <CalendarClock className="h-4 w-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Next saved workout</span>
              </div>
              <WorkoutSummaryCard
                workout={nextWorkout}
                exerciseCount={nextWorkout.exerciseCount}
                eyebrow="Next Workout"
                scheduledLabel={nextWorkoutLabel}
                isUpcoming
              />
              {isPro && (
                <AiCoachNote workoutId={nextWorkout.id} isEarlyStart initialNote={initialCoachNote} />
              )}
            </div>
          ) : (
            <>
              {effectiveWorkout.status === "in_progress" && !isFree ? (
                <ActiveWorkoutResumeCard 
                  workoutId={effectiveWorkout.id} 
                  completedExercises={effectiveWorkout.completedExercises || 0} 
                  totalExercises={effectiveWorkout.exerciseCount || (effectiveWorkout.fitness_os_exercises?.length || 0)} 
                  onDiscard={handleWorkoutDiscard}
                />
              ) : (
                <WorkoutSummaryCard 
                  workout={effectiveWorkout} 
                  exerciseCount={effectiveWorkout.exerciseCount || (effectiveWorkout.fitness_os_exercises?.length || 0)} 
                  isFree={isFree}
                />
              )}
              
              {isPro && (
                <AiCoachNote workoutId={effectiveWorkout.id} initialNote={initialCoachNote} />
              )}
              
              <TodaysExercisesList 
                workoutId={effectiveWorkout.id} 
                exercises={effectiveWorkout.fitness_os_exercises || []} 
                readonly={true} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
