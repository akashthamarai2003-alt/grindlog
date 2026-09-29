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
    cycleSummary,
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

          {/* Month-End 4-Week Milestone Banner (Paid Active User) */}
          {cycleSummary?.isMonthEnd && isPro && (
            <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-4 mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ADFF00]/20 via-[#ADFF00]/10 to-transparent rounded-[24px]" />
              <div className="relative bg-[#111A10] border border-[#ADFF00]/30 rounded-[24px] p-5 shadow-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#ADFF00] text-black">
                    4-Week Meso-Cycle Complete
                  </span>
                  <span className="text-xs font-bold text-white/50">Day {cycleSummary.daysOnPlan}</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Month-End Transformation Check-In
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed mt-1">
                    You have trained through 4 weeks of your split! Capture an updated body scan or review your progress to adapt your plan for Month 2.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <Link
                    href="/scanner?mode=checkin"
                    className="py-2.5 px-3 bg-[#ADFF00] text-black text-center font-black uppercase tracking-wider text-xs rounded-xl hover:bg-[#bfff33] transition-colors"
                  >
                    Photo Body Scan
                  </Link>
                  <Link
                    href="/report?renew=true"
                    className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white text-center font-black uppercase tracking-wider text-xs rounded-xl transition-colors border border-white/10"
                  >
                    Month 2 Plan Setup
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Month-End Renewal Banner (Unpaid / Expired Subscription) */}
          {cycleSummary?.isMonthEnd && !isPro && (
            <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-4 mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent rounded-[24px]" />
              <div className="relative bg-[#1a1205] border border-amber-500/40 rounded-[24px] p-5 shadow-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500 text-black">
                    4-Week Cycle Complete
                  </span>
                  <span className="text-xs font-bold text-amber-300">Renewal Required</span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Renew to Unlock Month 2
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed mt-1">
                    Your previous month's subscription has concluded. Renew your membership to recalibrate your weights, body scan, and generate your Month 2 meso-cycle.
                  </p>
                </div>
                <Link
                  href="/payment?intent=renew_monthly&plan=pro"
                  className="py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-center font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  Renew Subscription to Continue ⚡
                </Link>
              </div>
            </div>
          )}

          {!effectiveWorkout ? (
            <>
              <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-6 mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A2619] to-transparent rounded-[24px]" />
                <div className="relative bg-[#0A1108] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col items-center justify-center gap-4 text-center py-10">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Rest & Recovery Day</h3>
                  <p className="text-sm font-medium text-white/60">
                    {hasActivePlan ? "Your saved AI plan has no workout scheduled for this day." : "Your saved workout plan is not available yet."}
                  </p>
                  {!hasActivePlan && <Link href="/report" className="rounded-xl bg-[#ADFF00] px-6 py-3 font-black uppercase tracking-wider text-black">View Plan Setup</Link>}
                </div>
              </div>

              {nextWorkout && (
                <div className="mt-4 mb-6">
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
              )}
            </>
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
