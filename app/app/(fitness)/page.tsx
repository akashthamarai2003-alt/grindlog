import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from 'react';
import { differenceInCalendarDays, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";
import { SAMPLE_FREE_PLAN, SAMPLE_FREE_WORKOUT, SAMPLE_FREE_WEEK_DAYS } from "@/lib/fitness/sample-free-preview";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

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
    todayNutritionRes,
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
    NutritionService.getTodaySummaryAndDetails(user.id, targetDateStr).catch((err) => {
      console.warn("Could not load today nutrition details for dashboard:", err);
      return null;
    }),
  ]);
  let userProfile = profile;
  let userPlan = plan;

  const subscriptionPlan = subscriptionState?.plan;
  const isFreeUser = !subscriptionPlan || subscriptionPlan.id === "free";

  // Fallback to admin client if user client did not find profile or active plan
  // (guards against session/cookie replication latency after sign-in)
  if (!userProfile?.onboarding_completed || (!userPlan && !isFreeUser)) {
    const admin = createAdminClient();
    const [adminProfileRes, adminPlanRes] = await Promise.all([
      !userProfile?.onboarding_completed
        ? admin.from("fitness_os_profiles").select("*").eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      !userPlan && !isFreeUser
        ? admin.from("fitness_os_workout_plans").select("id, name, description, goal, plan_data, created_at").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (adminProfileRes.data?.onboarding_completed) {
      userProfile = adminProfileRes.data;
    }
    if (adminPlanRes.data) {
      userPlan = adminPlanRes.data;
    }
  }

  if (!userProfile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const workout = Array.isArray(workoutsForDate)
    ? (workoutsForDate.find((w: any) => w.status === "completed") || workoutsForDate[0] || null)
    : workoutsForDate;

  // For paid users who haven't reviewed/locked in their plan yet, direct them to /plan-setup
  if (!isFreeUser && !userPlan) {
    redirect("/plan-setup");
  }

  // Free users: STRICTLY zero AI API requests and zero plan creation in database!
  // Instead, supply static in-memory preview split and nutrition targets.
  const effectivePlan = userPlan || (isFreeUser ? SAMPLE_FREE_PLAN : null);
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

  const effectiveNutrition = todayNutritionRes ? {
    ...effectivePlan?.plan_data?.nutrition,
    daily_calories: todayNutritionRes.targets?.calories || effectivePlan?.plan_data?.nutrition?.daily_calories,
    protein_grams: todayNutritionRes.targets?.protein || effectivePlan?.plan_data?.nutrition?.protein_grams,
    carbs_grams: todayNutritionRes.targets?.carbs || effectivePlan?.plan_data?.nutrition?.carbs_grams,
    fat_grams: todayNutritionRes.targets?.fat || effectivePlan?.plan_data?.nutrition?.fat_grams,
    water_ml: todayNutritionRes.targets?.water_ml,
    consumed: todayNutritionRes.consumed || { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 },
    logged_foods: todayNutritionRes.logged_foods || [],
    progress: todayNutritionRes.progress,
    meals: (todayNutritionRes.meals && todayNutritionRes.meals.length > 0 && todayNutritionRes.meals.some((m: any) => m.meal_plan_items?.length > 0))
      ? todayNutritionRes.meals.map((m: any, idx: number) => ({
          id: m.id || idx,
          meal_type: m.meal_type,
          meal_name: m.name,
          time_of_day: m.meal_type === 'breakfast' ? 'After waking' : m.meal_type === 'lunch' ? 'Midday' : m.meal_type === 'pre_workout' ? 'Pre-workout' : 'Evening',
          total_calories: m.calories,
          protein_grams: m.protein,
          carbs_grams: m.carbs,
          fat_grams: m.fat,
          items: (m.meal_plan_items || []).map((it: any) => {
            const fName = it.foods?.name || it.name;
            const sSize = it.foods?.serving_size || it.serving_size || '1 serving';
            return `${fName} - ${sSize}`;
          }),
          meal_plan_items: m.meal_plan_items,
          prep_instructions: m.prep_instructions,
        }))
      : (effectivePlan?.plan_data?.nutrition?.meals || []).map((m: any, idx: number, arr: any[]) => {
          let derivedType = m.meal_type;
          if (!derivedType) {
            const ctx = `${m.meal_name || m.name || ''} ${m.time_of_day || ''} ${m.prep_instructions || ''}`.toLowerCase();
            if (ctx.includes('breakfast') || ctx.includes('waking') || ctx.includes('morning')) derivedType = 'breakfast';
            else if (ctx.includes('lunch') || ctx.includes('midday') || ctx.includes('noon')) derivedType = 'lunch';
            else if (ctx.includes('dinner') || ctx.includes('night') || ctx.includes('supper') || ctx.includes('evening')) derivedType = 'dinner';
            else if (ctx.includes('pre')) derivedType = 'pre_workout';
            else if (ctx.includes('post')) derivedType = 'post_workout';
            else if (arr.length === 3) derivedType = idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : 'dinner';
            else derivedType = idx === 0 ? 'breakfast' : idx === arr.length - 1 ? 'dinner' : 'lunch';
          }
          return {
            ...m,
            meal_type: derivedType,
          };
        }),
  } : effectivePlan?.plan_data?.nutrition;

  return (
    <FitnessDashboard
      user={user}
      profile={profile || {}}
      activePlan={effectivePlan}
      todayWorkout={effectiveTodayWorkout}
      weekWorkouts={effectiveWeekWorkouts}
      hasPlan={!!effectivePlan}
      nutrition={effectiveNutrition}
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
