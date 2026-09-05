import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { TodaysExercisesList } from "@/components/fitness/workout/todays-exercises-list";
import { ActiveWorkoutResumeCard } from "@/components/fitness/workout/active-workout-resume-card";
import { AiCoachNote } from "@/components/fitness/workout/ai-coach-note";
import { WeeklyWorkoutView } from "@/components/fitness/workout/weekly-workout-view";
import { WorkoutSummaryCard } from "@/components/fitness/workout/workout-summary-card";
import { redirect } from "next/navigation";
import { WorkoutService } from "@/lib/services/fitness/workout-service";
import Link from "next/link";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { CalendarClock } from "lucide-react";
import { AiWorkoutCoachService } from "@/lib/services/ai/ai-workout-coach-service";

export default async function WorkoutIndexPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();
  
  if (!user) {
    redirect("/auth/signin?redirect=/workout");
  }

  const [{ data: activePlan }, workout, subscriptionPlan] = await Promise.all([
    supabase
      .from("fitness_os_workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    WorkoutService.getTodayWorkout(user.id),
    getFitnessPlan(user.id),
  ]);
  const nextWorkout = !workout && activePlan
    ? await WorkoutService.getNextWorkout(user.id, activePlan.id)
    : null;
  const weekDays = await WorkoutService.getWeeklyWorkout(user.id);
  const planDays = activePlan ? await WorkoutService.getPlanSchedule(user.id, activePlan.id) : null;

  const tz = await WorkoutService.getUserTimezone(user.id);
  const formatter = new Intl.DateTimeFormat('en-US', { 
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' 
  });
  const dateStr = formatter.format(new Date());
  const nextWorkoutLabel = nextWorkout?.workout_date
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date(`${nextWorkout.workout_date}T12:00:00Z`))
    : undefined;

  // Resolve cached AI coach note on the server so client never refetches on refresh
  const targetWorkoutId = workout?.id || nextWorkout?.id;
  const initialCoachNote = targetWorkoutId && subscriptionPlan?.id === "pro"
    ? await AiWorkoutCoachService.getOrGenerateCoachNote(user.id, targetWorkoutId).catch(() => null)
    : null;

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="Your Workouts" 
            dateStr={dateStr}
            isMainPage={true}
            planBadge={planDays && planDays.length > 0 ? `${planDays.length}-Day Split` : activePlan ? "Active Plan" : undefined}
          />
          
          <div className="mt-2">
            <WeeklyWorkoutView weekDays={weekDays} planDays={planDays} />

            {!workout && !nextWorkout ? (
              <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-6 mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A2619] to-transparent rounded-[24px]" />
                <div className="relative bg-[#0A1108] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col items-center justify-center gap-6 text-center py-12">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Rest & Recovery Day</h3>
                  <p className="text-sm font-medium text-white/60">
                    {activePlan ? "Your saved AI plan has no workout scheduled for this day." : "Your saved workout plan is not available yet."}
                  </p>
                  {!activePlan && <Link href="/report" className="rounded-xl bg-[#ADFF00] px-6 py-3 font-black uppercase tracking-wider text-black">View Plan Setup</Link>}
                </div>
              </div>
            ) : !workout && nextWorkout ? (
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
                {subscriptionPlan?.id === "pro" && (
                  <AiCoachNote workoutId={nextWorkout.id} isEarlyStart initialNote={initialCoachNote} />
                )}
              </div>
            ) : (
              <>
                {workout.status === "in_progress" ? (
                  <ActiveWorkoutResumeCard 
                    workoutId={workout.id} 
                    completedExercises={workout.completedExercises} 
                    totalExercises={workout.exerciseCount} 
                  />
                ) : (
                  <WorkoutSummaryCard 
                    workout={workout} 
                    exerciseCount={workout.exerciseCount} 
                  />
                )}
                
                {subscriptionPlan?.id === "pro" && (
                  <AiCoachNote workoutId={workout.id} initialNote={initialCoachNote} />
                )}
                
                <TodaysExercisesList workoutId={workout.id} exercises={workout.fitness_os_exercises || []} readonly={true} />
              </>
            )}
          </div>
        </div>
      </div>
    </FitnessGuard>
  );
}
