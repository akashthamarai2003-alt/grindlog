import { createServerSupabase } from "@/lib/services/supabase/server";
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
import { GenerateWorkoutButton } from "@/components/fitness/workout/generate-workout-button";

export default async function WorkoutIndexPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const workout = await WorkoutService.getTodayWorkout(user.id);
  const weekDays = await WorkoutService.getWeeklyWorkout(user.id);

  const tz = await WorkoutService.getUserTimezone(user.id);
  const formatter = new Intl.DateTimeFormat('en-US', { 
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' 
  });
  const dateStr = formatter.format(new Date());

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <WorkoutHeader 
            title="Workout" 
            dateStr={dateStr}
            avatarUrl={user.user_metadata?.avatar_url}
            backUrl="/fitness"
          />
          
          <div className="mt-2">
            <WeeklyWorkoutView weekDays={weekDays} />

            {!workout ? (
              <div className="w-full relative p-[1px] rounded-[24px] overflow-hidden mt-6 mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1A2619] to-transparent rounded-[24px]" />
                <div className="relative bg-[#0A1108] border border-white/10 rounded-[24px] p-6 shadow-2xl flex flex-col items-center justify-center gap-6 text-center py-12">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">No Workout Scheduled</h3>
                  <p className="text-sm font-medium text-white/60">Generate an AI-optimized workout for today.</p>
                  <GenerateWorkoutButton />
                </div>
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
                
                <AiCoachNote workoutId={workout.id} />
                
                <TodaysExercisesList workoutId={workout.id} exercises={workout.fitness_os_exercises || []} readonly={true} />
              </>
            )}
          </div>
        </div>
      </div>
    </FitnessGuard>
  );
}
