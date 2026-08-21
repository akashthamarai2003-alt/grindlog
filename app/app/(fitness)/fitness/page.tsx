import { redirect } from "next/navigation";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from "react";

import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";

async function DashboardContent({ searchParams }: { searchParams?: { date?: string } }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await getCachedUser();

  if (!user) {
    return <FitnessLandingPage />;
  }

  const targetDateStr = searchParams?.date || new Date().toISOString().split('T')[0];

  const [
    { data: profile },
    { data: mainProfile },
    { data: plan },
    { data: workout },
    { data: latestReview }
  ] = await Promise.all([
    supabase.from("fitness_os_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("fitness_os_profiles").select("fitness_is_premium, fitness_premium_level").eq("user_id", user.id).maybeSingle(),
    supabase.from("fitness_os_workout_plans").select("id, plan_data, created_at").eq("user_id", user.id).eq("status", "active").maybeSingle(),
    supabase.from("fitness_os_workouts").select(`
      *,
      fitness_os_exercises (
        id,
        fitness_os_sets (completed)
      )
    `).eq("user_id", user.id).eq("workout_date", targetDateStr).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("fitness_os_progress_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/fitness/onboarding");
  }

  if (!mainProfile?.fitness_is_premium) {
    if (plan) {
      redirect("/fitness/payment?returnTo=/fitness");
    } else {
      redirect("/fitness/plan-setup");
    }
  }

  let dayNumber = 1;
  if (plan?.created_at) {
    const { differenceInCalendarDays } = require("date-fns");
    dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(plan.created_at)) + 1);
  }

  return <FitnessDashboard user={user} profile={profile || {}} todayWorkout={workout} hasPlan={!!plan} latestReview={latestReview} nutrition={plan?.plan_data?.nutrition} lifestyle={plan?.plan_data?.lifestyle} dayNumber={dayNumber} premiumLevel={mainProfile?.fitness_premium_level || 'core'} targetDateStr={targetDateStr} />;
}

export default async function FitnessHome({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
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

