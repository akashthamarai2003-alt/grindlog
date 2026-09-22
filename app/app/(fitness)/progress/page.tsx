import { Metadata } from "next";
import { Suspense } from "react";
import { getCachedUser } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ProgressView } from "@/components/fitness/progress/progress-view";
import { ProgressAnalyticsService } from "@/lib/services/analytics/progress-service";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import ProgressLoading from "./loading";

export const metadata: Metadata = {
  title: "Progress - Fitness AI OS",
  description: "Track your fitness progress.",
};

async function ProgressContent({ userId, isPro }: { userId: string; isPro: boolean }) {
  const initialData = await ProgressAnalyticsService.getAggregatedProgress(userId, "30D");
  return <ProgressView initialData={initialData} isPro={isPro} />;
}

export default async function ProgressPage() {
  const { data: { user } } = await getCachedUser();

  if (!user) return null;

  const plan = await getFitnessPlan(user.id);
  const isPro = plan?.id === "pro";

  return (
    <FitnessGuard featureName="advanced progress analysis">
      <Suspense fallback={<ProgressLoading />}>
        <ProgressContent userId={user.id} isPro={isPro} />
      </Suspense>
    </FitnessGuard>
  );
}
