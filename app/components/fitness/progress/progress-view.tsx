"use client";

import { useState } from "react";
import { AnalyticsPeriod, AggregatedProgressPayload } from "@/types/fitness/analytics";
import { ProgressHeader } from "./progress-header";
import { TransformationOverview } from "./transformation-overview";
import { WeeklyConsistency } from "./weekly-consistency";
import { WeightChart } from "./weight-chart";
import { BodyMeasurementsList } from "./body-measurements-list";
import { BodyProgressPhotos } from "./body-progress-photos";
import { WorkoutAnalyticsCard } from "./workout-analytics";
import { NutritionAnalyticsCard } from "./nutrition-analytics";
import { ActivityRecoveryAnalyticsCard } from "./activity-recovery-analytics";
import { AIProgressReviewCard } from "./ai-progress-review";
import { AchievementsShowcase } from "./achievements-showcase";
import { Loader2 } from "lucide-react";

export function ProgressView({ initialData }: { initialData: AggregatedProgressPayload }) {
  const [data, setData] = useState<AggregatedProgressPayload>(initialData);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialData.period);
  const [isLoading, setIsLoading] = useState(false);

  const handlePeriodChange = async (newPeriod: AnalyticsPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fitness-ai/progress-data?period=${newPeriod}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      // In a real app we'd show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0A1108] overflow-y-auto pb-32">
      <div className="px-5">
        <ProgressHeader 
          transformation={data.transformation} 
          period={period} 
          onPeriodChange={handlePeriodChange} 
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#ADFF00] animate-spin mb-4" />
            <p className="text-xs font-black text-white/50 uppercase tracking-widest">Loading Analytics...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-8">
            <TransformationOverview metrics={data.transformation} />
            <WeeklyConsistency metrics={data.consistency} />
            
            <div id="transformation-details" className="flex flex-col gap-8 scroll-mt-6">
              <WeightChart data={data.weightHistory} targetWeight={data.transformation.targetWeight} />
              <BodyMeasurementsList measurements={data.measurements} />
              <BodyProgressPhotos first={data.scans.first} latest={data.scans.latest} />
            </div>
            <WorkoutAnalyticsCard metrics={data.workout} />
            <NutritionAnalyticsCard metrics={data.nutrition} />
            <ActivityRecoveryAnalyticsCard activity={data.activity} recovery={data.recovery} />
            <AIProgressReviewCard initialReview={data.aiReview} period={data.period} />
            <AchievementsShowcase achievements={data.achievements} />
          </div>
        )}
      </div>
    </div>
  );
}
