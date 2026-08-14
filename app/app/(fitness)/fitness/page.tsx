import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from "react";

import { FitnessLandingPage } from "@/components/fitness/landing/fitness-landing-page";

async function DashboardContent() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <FitnessLandingPage />;
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("is_premium, premium_level")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/fitness/onboarding");
  }

  // Get today's local date string
  const today = new Date().toISOString().split('T')[0];

  const { data: plan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id, plan_data, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!mainProfile?.is_premium) {
    if (plan) {
      redirect("/fitness/payment?returnTo=/fitness");
    } else {
      redirect("/fitness/plan-setup");
    }
  }
  // Fetch today's workout
  const { data: workout } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (id)
    `)
    .eq("user_id", user.id)
    .eq("workout_date", today)
    .in("status", ["scheduled", "in_progress"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: latestReview } = await supabase
    .from("fitness_os_progress_reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let dayNumber = 1;
  if (plan?.created_at) {
    const { differenceInCalendarDays } = require("date-fns");
    dayNumber = Math.max(1, differenceInCalendarDays(new Date(), new Date(plan.created_at)) + 1);
  }

  return <FitnessDashboard user={user} profile={profile || {}} todayWorkout={workout} hasPlan={!!plan} latestReview={latestReview} nutrition={plan?.plan_data?.nutrition} lifestyle={plan?.plan_data?.lifestyle} dayNumber={dayNumber} premiumLevel={mainProfile?.premium_level || 'core'} />;
}

export default function FitnessHome() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense fallback={
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
          <DashboardSkeleton />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
