import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { FitnessDashboardBottom } from "@/components/fitness/dashboard/fitness-dashboard-bottom";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from 'react';
import { differenceInCalendarDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";
import { SAMPLE_FREE_PLAN, SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { hasGeneratedStartingReport } from "@/lib/services/fitness/starting-report-service";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Above-fold: profile, plan, workouts, subscription — fast queries (~400-600ms)
// ─────────────────────────────────────────────────────────────────────────────
async function DashboardAboveFold({ searchParams }: { searchParams?: { date?: string } }) {
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

  const activeDate = parseISO(targetDateStr);
  const weekStart = startOfWeek(activeDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(activeDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const admin = createAdminClient();

  // Only fast queries here — no nutrition (moved to DashboardBelow)
  const [
    profile,
    { data: plan },
    { data: workoutsForDate },
    { data: weekWorkouts },
    { data: activityLog },
    { data: sleepLog },
    subscriptionState,
  ] = await Promise.all([
    getCachedFitnessProfile(user.id),
    admin.from("fitness_os_workout_plans").select("id, name, description, goal, plan_data, created_at").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("fitness_os_workouts").select(`
      id,
      name,
      workout_date,
      duration_minutes,
      status,
      created_at,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `).eq("user_id", user.id).eq("workout_date", targetDateStr).order("created_at", { ascending: false }),
    admin.from("fitness_os_workouts").select("id, workout_date, status, name").eq("user_id", user.id).gte("workout_date", weekStartStr).lte("workout_date", weekEndStr).order("created_at", { ascending: false }),
    admin.from("fitness_os_activity_logs").select("steps").eq("user_id", user.id).eq("activity_date", targetDateStr).maybeSingle(),
    admin.from("fitness_os_sleep_logs").select("duration_hours").eq("user_id", user.id).eq("sleep_date", targetDateStr).maybeSingle(),
    getFitnessSubscriptionState(user.id),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const aiStrategy = profile?.ai_strategy && typeof profile.ai_strategy === "object" ? profile.ai_strategy : {};
  const hasSeenReport = Boolean((aiStrategy as Record<string, unknown>).starting_report_viewed);
  const hasAcceptedFreePreview = Boolean((aiStrategy as Record<string, unknown>).free_preview_accepted);

  const subscriptionPlan = subscriptionState?.plan;
  const isPaidUser =
    subscriptionState?.status === "active" ||
    subscriptionState?.status === "grace_period" ||
    Boolean(subscriptionPlan && subscriptionPlan.id !== "free");

  const hasActivePlan = Boolean(plan);

  // STRICT ACCESS RULE:
  // User can ONLY access the dashboard if:
  // 1. Payment was successful (isPaidUser is true)
  // 2. OR user explicitly clicked "Continue Free" (hasAcceptedFreePreview is true)
  // 3. OR user already has an active workout plan from a previous session
  if (!isPaidUser && !hasAcceptedFreePreview && !hasActivePlan) {
    if (!hasSeenReport) {
      redirect("/report");
    }
    redirect("/payment?returnTo=/&intent=generate_plan");
  }

  const isFreeUser = !isPaidUser;

  if (!isFreeUser && !plan) {
    redirect("/plan-setup");
  }

  const workout = Array.isArray(workoutsForDate)
    ? (workoutsForDate.find((w: any) => w.status === "completed") || workoutsForDate[0] || null)
    : workoutsForDate;

  const effectivePlan = plan || (isFreeUser ? SAMPLE_FREE_PLAN : null);
  const effectiveTodayWorkout = workout || (isFreeUser ? SAMPLE_FREE_WORKOUT : null);
  const effectiveWeekWorkouts = (weekWorkouts && weekWorkouts.length > 0)
    ? weekWorkouts
    : (isFreeUser ? SAMPLE_FREE_WEEK_DAYS : []);

  let dayNumber = 1;
  if (effectivePlan?.created_at) {
    dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(effectivePlan.created_at)) + 1);
  }

  const premiumLevel = isFreeUser ? "free" : subscriptionPlan?.id === "pro" ? "pro" : "core";

  const dailyActivity = subscriptionPlan?.id === "pro"
    ? {
        steps: Number(activityLog?.steps) || null,
        sleep_hours: Number(sleepLog?.duration_hours) || null,
        water_liters: null, // will be filled in by bottom section via client cache
      }
    : isFreeUser
    ? { steps: 4200, sleep_hours: 7.5, water_liters: 1.8 }
    : undefined;

  return (
    <FitnessDashboard
      user={user}
      profile={profile || {}}
      activePlan={effectivePlan}
      todayWorkout={effectiveTodayWorkout}
      weekWorkouts={effectiveWeekWorkouts}
      hasPlan={!!effectivePlan}
      nutrition={effectivePlan?.plan_data?.nutrition || null}
      lifestyle={effectivePlan?.plan_data?.lifestyle}
      dailyActivity={dailyActivity}
      dayNumber={dayNumber}
      premiumLevel={premiumLevel}
      targetDateStr={targetDateStr}
      subscriptionState={subscriptionState}
      bottomSlot={
        // Nutrition, activity, goals stream in below — wrapped in its own Suspense
        <Suspense fallback={<NutritionSkeleton />}>
          <DashboardBelow
            userId={user.id}
            targetDateStr={targetDateStr}
            lifestyle={effectivePlan?.plan_data?.lifestyle}
            workoutCompleted={effectiveTodayWorkout?.status === "completed"}
            premiumLevel={premiumLevel}
            isFreeUser={isFreeUser}
            subscriptionPlanId={subscriptionPlan?.id}
            activityLog={activityLog}
            sleepLog={sleepLog}
            profile={profile}
            preFetchedPlanData={effectivePlan?.plan_data}
          />
        </Suspense>
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Nutrition skeleton — shown while DashboardBelow is loading
// ─────────────────────────────────────────────────────────────────────────────
function NutritionSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      {/* Nutrition card skeleton */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-3 w-16 rounded bg-white/5" />
            <div className="h-5 w-32 rounded-lg bg-white/10" />
          </div>
          <div className="h-9 w-20 rounded-full bg-white/5 border border-white/10" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 rounded-2xl p-3 space-y-2">
              <div className="h-3 w-12 rounded bg-white/5 mx-auto" />
              <div className="h-5 w-10 rounded-lg bg-white/10 mx-auto" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
      {/* Activity + Goals card skeletons */}
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 h-32 bg-white/5" />
      <div className="bg-[#121E12] border border-[#1A2619] rounded-3xl p-5 h-40 bg-white/5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Below-fold: nutrition data only — uses lightweight getDashboardSummary
// Streams in ~600-1200ms after the above-fold is already visible
// ─────────────────────────────────────────────────────────────────────────────
async function DashboardBelow({
  userId,
  targetDateStr,
  lifestyle,
  workoutCompleted,
  premiumLevel,
  isFreeUser,
  subscriptionPlanId,
  activityLog,
  sleepLog,
  profile,
  preFetchedPlanData,
}: {
  userId: string;
  targetDateStr: string;
  lifestyle?: any;
  workoutCompleted?: boolean;
  premiumLevel: string;
  isFreeUser: boolean;
  subscriptionPlanId?: string;
  activityLog?: { steps: number } | null;
  sleepLog?: { duration_hours: number } | null;
  profile?: any;
  preFetchedPlanData?: any;
}) {
  const todayNutrition = await NutritionService.getDashboardSummary(userId, {
    targetDateStr,
    preFetchedProfile: profile,
    preFetchedPlanData,
  }).catch((err) => {
    console.warn("Failed to fetch dashboard nutrition summary:", err?.message || err);
    return null;
  });

  const dailyActivity = subscriptionPlanId === "pro"
    ? {
        steps: Number(activityLog?.steps) || null,
        sleep_hours: Number(sleepLog?.duration_hours) || null,
        water_liters: todayNutrition?.consumed?.water_ml != null
          ? Number(todayNutrition.consumed.water_ml) / 1000
          : null,
      }
    : isFreeUser
    ? { steps: 4200, sleep_hours: 7.5, water_liters: 1.8 }
    : undefined;

  const effectiveNutrition = todayNutrition
    ? todayNutrition
    : null;

  return (
    <FitnessDashboardBottom
      nutrition={effectiveNutrition}
      lifestyle={lifestyle}
      dailyActivity={dailyActivity}
      workoutCompleted={workoutCompleted}
      premiumLevel={premiumLevel}
      targetDateStr={targetDateStr}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root page — outer skeleton shown only until above-fold is ready (~400ms)
// ─────────────────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-[#0A1108]">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <DashboardSkeleton />
        </div>
      }>
        <DashboardAboveFold searchParams={params} />
      </Suspense>
    </div>
  );
}
