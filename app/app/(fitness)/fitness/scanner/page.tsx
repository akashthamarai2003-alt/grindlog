import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ScannerFlow } from "@/components/fitness/scanner/scanner-flow";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Prevent users who already have an active plan from re-scanning unless regenerating
  const { data: plan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (plan) {
    redirect("/fitness");
  }

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-gray-50/50 flex flex-col pt-12 pb-24">
        <ScannerFlow />
      </div>
    </FitnessGuard>
  );
}
