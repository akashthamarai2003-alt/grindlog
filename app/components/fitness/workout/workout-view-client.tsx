"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { WorkoutHeader } from "./workout-header";
import { WeeklyWorkoutView } from "./weekly-workout-view";
import { WorkoutSummaryCard } from "./workout-summary-card";
import { ActiveWorkoutResumeCard } from "./active-workout-resume-card";
import { AiCoachNote } from "./ai-coach-note";
import { TodaysExercisesList } from "./todays-exercises-list";

export interface WorkoutViewProps {
  dateStr: string;
  isFree: boolean;
  planBadge?: string;
  effectiveWeekDays: any[];
  effectivePlanDays: any[];
  effectiveWorkout: any | null;
  nextWorkout: any | null;
  nextWorkoutLabel?: string;
  isPro: boolean;
  initialCoachNote: string | null;
  hasPlan: boolean;
}

export function WorkoutViewClient(props: WorkoutViewProps) {
  const {
    dateStr,
    isFree,
    planBadge,
    effectiveWeekDays,
    effectivePlanDays,
    effectiveWorkout,
    nextWorkout,
    nextWorkoutLabel,
    isPro,
    initialCoachNote,
    hasPlan,
  } = props;

  // Save local snapshot to localStorage for 0ms instant tab switching
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "grindlog_workout_snapshot_v1",
          JSON.stringify({
            ...props,
            savedAt: Date.now(),
          })
        );
      } catch {
        // quota or private browsing safely ignored
      }
    }
  }, [props]);

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
                  {hasPlan ? "Your saved AI plan has no workout scheduled for this day." : "Your saved workout plan is not available yet."}
                </p>
                {!hasPlan && <Link href="/report" className="rounded-xl bg-[#ADFF00] px-6 py-3 font-black uppercase tracking-wider text-black">View Plan Setup</Link>}
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
                  completedExercises={effectiveWorkout.completedExercises} 
                  totalExercises={effectiveWorkout.exerciseCount} 
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
              
              <TodaysExercisesList workoutId={effectiveWorkout.id} exercises={effectiveWorkout.fitness_os_exercises || []} readonly={true} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
