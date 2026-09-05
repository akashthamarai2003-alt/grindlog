import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from 'react';
import { differenceInCalendarDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";

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
    { data: workout },
    { data: weekWorkouts },
    { data: activityLog },
    { data: sleepLog },
    { data: waterLogs },
    subscriptionPlan,
  ] = await Promise.all([
    supabase.from("fitness_os_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("fitness_os_workout_plans").select("id, name, description, goal, plan_data, created_at").eq("user_id", user.id).eq("status", "active").maybeSingle(),
    supabase.from("fitness_os_workouts").select(`
      *,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `).eq("user_id", user.id).eq("workout_date", targetDateStr).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("fitness_os_workouts").select("id, workout_date, status, name").eq("user_id", user.id).gte("workout_date", weekStartStr).lte("workout_date", weekEndStr),
    supabase.from("fitness_os_activity_logs").select("steps").eq("user_id", user.id).eq("activity_date", targetDateStr).maybeSingle(),
    supabase.from("fitness_os_sleep_logs").select("duration_hours").eq("user_id", user.id).eq("sleep_date", targetDateStr).maybeSingle(),
    (supabase as any).from("fitness_os_water_logs").select("amount_ml").eq("user_id", user.id).gte("logged_at", targetDateStart.toISOString()).lt("logged_at", nextTargetDate.toISOString()),
    getFitnessPlan(user.id),
  ]);
  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  if (!subscriptionPlan) {
    if (plan) {
      redirect("/payment?returnTo=/");
    } else {
      // Resume the same review draft until onboarding changes. Do not send a
      // user back to report merely because the draft is older than 30 minutes.
      let cachedDraftQuery = supabase
        .from("fitness_os_ai_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_type", "plan_generation")
        .order("created_at", { ascending: false })
        .limit(1);
      if (typeof profile.updated_at === "string" && profile.updated_at) {
        cachedDraftQuery = cachedDraftQuery.gte("created_at", profile.updated_at);
      }
      const { data: cachedDraft } = await cachedDraftQuery.maybeSingle();

      const attemptCutoff = new Date(Date.now() - 3 * 60_000).toISOString();
      const { data: activeAttempt } = await supabase
        .from("fitness_os_ai_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_type", "plan_generation_attempt")
        .gte("created_at", attemptCutoff)
        .limit(1)
        .maybeSingle();

      if (cachedDraft || activeAttempt) {
        redirect("/plan-setup");
      }

      // Keep reopening/back navigation on the completed onboarding report.
      // Plan generation starts only when the user explicitly clicks
      // "Generate My Plan", avoiding duplicate paid AI requests.
      redirect("/report");
    }
  }

  let dayNumber = 1;
  if (plan?.created_at) {
    
    dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(plan.created_at)) + 1);
  }

  const dailyActivity = subscriptionPlan.id === "pro"
    ? {
        steps: Number(activityLog?.steps) || null,
        sleep_hours: Number(sleepLog?.duration_hours) || null,
        water_liters: Array.isArray(waterLogs)
          ? waterLogs.reduce((total: number, entry: any) => total + (Number(entry?.amount_ml) || 0), 0) / 1000
          : null,
      }
    : undefined;

  return (
    <FitnessDashboard
      user={user}
      profile={profile || {}}
      activePlan={plan}
      todayWorkout={workout}
      weekWorkouts={weekWorkouts || []}
      hasPlan={!!plan}
      nutrition={plan?.plan_data?.nutrition}
      lifestyle={plan?.plan_data?.lifestyle}
      dailyActivity={dailyActivity}
      dayNumber={dayNumber}
      premiumLevel={subscriptionPlan.id === "pro" ? "pro" : "core"}
      targetDateStr={targetDateStr}
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
