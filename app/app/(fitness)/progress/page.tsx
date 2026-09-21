import { Metadata } from "next";
import { getCachedUser } from "@/lib/services/supabase/server";
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

  return <ProgressView initialData={initialData} isPro={isPro} />;
}
