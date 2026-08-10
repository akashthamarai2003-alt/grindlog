import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessDashboard } from "@/components/fitness/dashboard/fitness-dashboard";
import { DashboardSkeleton } from "@/components/fitness/dashboard/dashboard-skeleton";
import { Suspense } from "react";

async function DashboardContent() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get today's local date string
  const today = new Date().toISOString().split('T')[0];

  const { data: plan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id, plan_data")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

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

  return <FitnessDashboard user={user} profile={profile || {}} todayWorkout={workout} hasPlan={!!plan} latestReview={latestReview} nutrition={plan?.plan_data?.nutrition} />;
}

export default function FitnessHome() {
  return (
    <FitnessGuard>
      <div className="min-h-screen bg-gray-50/50">
        <Suspense fallback={
          <div className="w-full max-w-md mx-auto px-5 pt-8 pb-28">
            <DashboardSkeleton />
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </FitnessGuard>
  );
}
