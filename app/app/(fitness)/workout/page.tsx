import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { TodaysExercisesList } from "@/components/fitness/workout/todays-exercises-list";
import { ActiveWorkoutResumeCard } from "@/components/fitness/workout/active-workout-resume-card";
import { AiCoachNote } from "@/components/fitness/workout/ai-coach-note";
import { WeeklyWorkoutView } from "@/components/fitness/workout/weekly-workout-view";
import { WorkoutSummaryCard } from "@/components/fitness/workout/workout-summary-card";
import { WorkoutSkeleton } from "@/components/fitness/workout/workout-skeleton";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { CalendarClock } from "lucide-react";
import { SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function WorkoutContent() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();
  
  if (!user) {
    redirect("/auth/signin?redirect=/workout");
  }

  const now = new Date();

  // Fetch all core user state in a SINGLE parallel batch
  const [
    { data: profile },
    { data: activePlan },
    subscriptionPlan,
    { data: workouts },
    { data: aiNotes },
  ] = await Promise.all([
    supabase
      .from("fitness_os_profiles")
      .select("onboarding_completed, timezone")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("fitness_os_workout_plans")
      .select("id, name, description, plan_data")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getFitnessPlan(user.id),
    supabase
      .from("fitness_os_workouts")
      .select(`
        id,
        name,
        workout_date,
        status,
        duration_minutes,
        plan_id,
        fitness_os_exercises (
          id, name, target_sets, target_reps, rest_seconds,
          fitness_os_sets (completed)
        )
      `)
      .eq("user_id", user.id)
      .order("workout_date", { ascending: true })
      .limit(35),
    supabase
      .from("workout_ai_notes")
      .select("workout_id, note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const tz = profile?.timezone || "UTC";
  const userLocalDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const formatter = new Intl.DateTimeFormat("en-US", { 
    timeZone: tz, weekday: "short", month: "short", day: "numeric" 
  });
  const dateStr = formatter.format(now);

  const isFree = subscriptionPlan?.id === "free";

  // Process workouts in memory with zero database latency
  const workoutList = (workouts || []).map((w: any) => {
    const exerciseCount = w.fitness_os_exercises?.length || 0;
    const completedExercises = w.fitness_os_exercises?.filter((e: any) =>
      e.fitness_os_sets && e.fitness_os_sets.length > 0 && e.fitness_os_sets.every((s: any) => s.completed)
    ).length || 0;
    return {
      ...w,
      exerciseCount,
      completedExercises,
    };
  });

  // Today workout: in-progress first, then matching local date
  const inProgress = workoutList.find((w: any) => w.status === "in_progress");
  const scheduledToday = workoutList.find((w: any) => w.workout_date === userLocalDate);
  const workout = inProgress || scheduledToday || null;

  // Next workout: if no workout today, find next upcoming scheduled
  const nextWorkout = !workout
    ? workoutList.find((w: any) => w.workout_date >= userLocalDate && w.status === "scheduled")
      || workoutList.find((w: any) => w.status === "scheduled")
      || null
    : null;

  // Build weekly calendar (Monday to Sunday)
  const activeDate = new Date(`${userLocalDate}T12:00:00Z`);
  const dayOfWeek = activeDate.getUTCDay(); // 0 is Sunday, 1 is Monday
  const distToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(activeDate);
  startOfWeek.setDate(activeDate.getDate() - distToMonday);

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const weekDays = dayNames.map((dayName, i) => {
    const iterDate = new Date(startOfWeek);
    iterDate.setDate(startOfWeek.getDate() + i);
    const iterStr = iterDate.toISOString().split("T")[0];
    const dayWorkout = workoutList.find((w: any) => w.workout_date === iterStr);
    const isToday = iterStr === userLocalDate;
    let status = "rest";
    let name = dayWorkout ? dayWorkout.name : "Rest";
    const isRestDay = name.toLowerCase().includes("rest");

    if (isToday) {
      status = dayWorkout?.status === "completed" ? "completed" : "today";
    } else if (dayWorkout && !isRestDay) {
      if (dayWorkout.status === "completed") {
        status = "completed";
      } else if (iterStr < userLocalDate) {
        status = "rest";
      } else {
        status = "upcoming";
      }
    }

    return {
      day: dayName,
      status,
      name,
      date: iterStr,
      isToday,
    };
  });

  // Build standard 7-day plan split
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];
  const planDays = dayNames.map((dayName, idx) => {
    const targetDayOfWeek = dayIndices[idx];
    const isToday = targetDayOfWeek === dayOfWeek;
    const matchingWorkout = workoutList.find((w: any) => {
      const d = new Date(`${w.workout_date}T12:00:00Z`);
      return d.getUTCDay() === targetDayOfWeek;
    });

    if (matchingWorkout) {
      return {
        day: dayName,
        status: matchingWorkout.status === "completed" ? "completed" : isToday ? "today" : "upcoming",
        name: matchingWorkout.name,
        date: matchingWorkout.workout_date,
        isToday,
      };
    }

    return {
      day: dayName,
      status: "rest",
      name: "Rest",
      date: undefined,
      isToday,
    };
  });

  const effectiveWorkout = isFree ? (SAMPLE_FREE_WORKOUT as any) : workout;
  const effectiveWeekDays = isFree ? (SAMPLE_FREE_WEEK_DAYS as any) : weekDays;
  const effectivePlanDays = isFree ? (SAMPLE_FREE_WEEK_DAYS as any) : planDays;

  const nextWorkoutLabel = nextWorkout?.workout_date
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(new Date(`${nextWorkout.workout_date}T12:00:00Z`))
    : undefined;

  // Fast AI coach note lookup from the parallel batch
  const targetWorkoutId = workout?.id || nextWorkout?.id;
  const initialCoachNote = targetWorkoutId && subscriptionPlan?.id === "pro"
    ? aiNotes?.find((n: any) => n.workout_id === targetWorkoutId)?.note || null
    : null;

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
        <WorkoutHeader 
          title="Your Workouts" 
          dateStr={dateStr}
          isMainPage={true}
          planBadge={isFree ? "Preview Split" : planDays && planDays.length > 0 ? `${planDays.length}-Day Split` : activePlan ? "Active Plan" : undefined}
        />
        
        <div className="mt-2">
          <WeeklyWorkoutView weekDays={effectiveWeekDays} planDays={effectivePlanDays} />

          {!effectiveWorkout && !nextWorkout ? (
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
              {subscriptionPlan?.id === "pro" && (
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
              
              {subscriptionPlan?.id === "pro" && (
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

export default function WorkoutIndexPage() {
  return (
    <Suspense fallback={<WorkoutSkeleton />}>
      <WorkoutContent />
    </Suspense>
  );
}
