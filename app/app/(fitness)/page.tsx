import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from 'react';
import { differenceInCalendarDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";
import { SAMPLE_FREE_PLAN, SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function DashboardContent({ searchParams }: { searchParams?: { date?: string } }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <FitnessLandingPage />;
  }

  const todayDateStr = new Date().toISOString().split('T')[0];
  const requestedDateStr = searchParams?.date;
  const targetDateStr = requestedDateStr
    && /^\d{4}-\d{2}-\d{2}$/.test(requestedDateStr)
    && Number.isFinite(new Date(`${requestedDateStr}T00:00:00.000Z`).getTime())
      ? requestedDateStr
      : todayDateStr;
  const targetDateStart = new Date(`${targetDateStr}T00:00:00.000Z`);
  const nextTargetDate = new Date(targetDateStart.getTime() + 24 * 60 * 60 * 1000);

  // Compute active week range (Monday to Sunday) for weekly consistency & calendar
  const activeDate = parseISO(targetDateStr);
  const weekStart = startOfWeek(activeDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(activeDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const [
    { data: profile },
    { data: plan },
    { data: workoutsForDate },
    { data: weekWorkouts },
    { data: activityLog },
    { data: sleepLog },
    { data: waterLogs },
    subscriptionState,
  ] = await Promise.all([
    supabase.from("fitness_os_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("fitness_os_workout_plans").select("id, name, description, goal, plan_data, created_at").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("fitness_os_workouts").select(`
      *,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `).eq("user_id", user.id).eq("workout_date", targetDateStr).order("created_at", { ascending: false }),
    supabase.from("fitness_os_workouts").select("id, workout_date, status, name").eq("user_id", user.id).gte("workout_date", weekStartStr).lte("workout_date", weekEndStr).order("created_at", { ascending: false }),
    supabase.from("fitness_os_activity_logs").select("steps").eq("user_id", user.id).eq("activity_date", targetDateStr).maybeSingle(),
    supabase.from("fitness_os_sleep_logs").select("duration_hours").eq("user_id", user.id).eq("sleep_date", targetDateStr).maybeSingle(),
    (supabase as any).from("fitness_os_water_logs").select("amount_ml").eq("user_id", user.id).gte("logged_at", targetDateStart.toISOString()).lt("logged_at", nextTargetDate.toISOString()),
    getFitnessSubscriptionState(user.id),
  ]);
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const workout = Array.isArray(workoutsForDate)
    ? (workoutsForDate.find((w: any) => w.status === "completed") || workoutsForDate[0] || null)
    : workoutsForDate;

  const subscriptionPlan = subscriptionState?.plan;
  const isFreeUser = !subscriptionPlan || subscriptionPlan.id === "free";

  // For paid users who haven't reviewed/locked in their plan yet, direct them to /plan-setup
  if (!isFreeUser && !plan) {
    redirect("/plan-setup");
  }

  // Users who finished onboarding but haven't generated/unlocked an active plan belong on /report
  if (!plan) {
    redirect("/report");
  }

  // Free users: STRICTLY zero AI API requests and zero plan creation in database!
  // Instead, supply static in-memory preview split and nutrition targets.
  const effectivePlan = plan || (isFreeUser ? SAMPLE_FREE_PLAN : null);
  const effectiveTodayWorkout = workout || (isFreeUser ? SAMPLE_FREE_WORKOUT : null);
  const effectiveWeekWorkouts = (weekWorkouts && weekWorkouts.length > 0)
    ? weekWorkouts
    : (isFreeUser ? SAMPLE_FREE_WEEK_DAYS : []);

  let dayNumber = 1;
  if (effectivePlan?.created_at) {
    dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(effectivePlan.created_at)) + 1);
  }

  const dailyActivity = subscriptionPlan?.id === "pro"
    ? {
        steps: Number(activityLog?.steps) || null,
        sleep_hours: Number(sleepLog?.duration_hours) || null,
        water_liters: Array.isArray(waterLogs)
          ? waterLogs.reduce((total: number, entry: any) => total + (Number(entry?.amount_ml) || 0), 0) / 1000
          : null,
      }
    : isFreeUser
    ? {
        steps: 4200,
        sleep_hours: 7.5,
        water_liters: 1.8,
      }
    : undefined;

  return (
    <FitnessDashboard
      user={user}
      profile={profile || {}}
      activePlan={effectivePlan}
      todayWorkout={effectiveTodayWorkout}
      weekWorkouts={effectiveWeekWorkouts}
      hasPlan={!!effectivePlan}
      nutrition={effectivePlan?.plan_data?.nutrition}
      lifestyle={effectivePlan?.plan_data?.lifestyle}
      dailyActivity={dailyActivity}
      dayNumber={dayNumber}
      premiumLevel={isFreeUser ? "free" : subscriptionPlan?.id === "pro" ? "pro" : "core"}
      targetDateStr={targetDateStr}
      subscriptionState={subscriptionState}
    />
  );
}

export default async function FitnessHome({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; error?: string; error_code?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  if (params?.error || params?.error_code) {
    const errorMsg = params.error_description || params.error || "Authentication failed. Please sign in again.";
    redirect(`/auth/signin?error=${encodeURIComponent(errorMsg)}`);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <DashboardSkeleton />
        </div>
      }>
        <DashboardContent searchParams={params} />
      </Suspense>
    </div>
  );
}
