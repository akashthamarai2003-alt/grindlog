import { Metadata } from "next";
import { createClient } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ProgressView } from "@/components/fitness/progress/progress-view";
import { ProgressAnalyticsService } from "@/lib/services/analytics/progress-service";

export const metadata: Metadata = {
  title: "Progress - Fitness AI OS",
  description: "Track your fitness progress.",
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch initial data (default to 30D)
  const initialData = await ProgressAnalyticsService.getAggregatedProgress(user.id, '30D');

  return (
    <FitnessGuard featureName="advanced progress analysis">
      <ProgressView initialData={initialData} />
    </FitnessGuard>
  );
}
