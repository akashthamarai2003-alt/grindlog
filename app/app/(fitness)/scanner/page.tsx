import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ScannerFlow } from "@/components/fitness/scanner/scanner-flow";

export const dynamic = "force-dynamic";

export default async function ScannerPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; refresh?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin?redirect=/scanner");
  }

  // Prevent users who already have an active plan from re-scanning unless regenerating or at month-end check-in
  const { data: plan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isCheckin = resolvedParams.mode === "checkin" || resolvedParams.mode === "renew" || resolvedParams.mode === "update";
  const planCreatedAt = plan?.created_at ? new Date(plan.created_at) : null;
  const daysOnPlan = planCreatedAt
    ? Math.max(1, Math.floor((Date.now() - planCreatedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isMonthEnd = daysOnPlan >= 28;

  if (plan && !isCheckin && !isMonthEnd) {
    redirect("/");
  }

  return (
    <FitnessGuard requirePro featureName="advanced body-scan analysis">
      <div className="min-h-screen bg-gray-50/50 flex flex-col pt-12 pb-24">
        <ScannerFlow />
      </div>
    </FitnessGuard>
  );
}
