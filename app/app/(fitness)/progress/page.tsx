import { Metadata } from "next";
import { createClient, getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ProgressView } from "@/components/fitness/progress/progress-view";
import { ProgressAnalyticsService } from "@/lib/services/analytics/progress-service";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";

export const metadata: Metadata = {
  title: "Progress - Fitness AI OS",
  description: "Track your fitness progress.",
};

export default async function ProgressPage() {
  const { data: { user } } = await getCachedUser();

  if (!user) return null;

  const [plan, initialData] = await Promise.all([
    getFitnessPlan(user.id),
    ProgressAnalyticsService.getAggregatedProgress(user.id, '30D'),
  ]);
  const isPro = plan?.id === "pro";

  return (
    <FitnessGuard featureName="advanced progress analysis">
      <ProgressView initialData={initialData} isPro={isPro} />
    </FitnessGuard>
  );
}
