"use client";

import { TodaysNutritionCard } from "./todays-nutrition-card";
import { DailyActivityCard } from "./daily-activity-card";
import { TodaysGoalsCard } from "./todays-goals-card";

interface FitnessDashboardBottomProps {
  nutrition?: any;
  lifestyle?: any;
  dailyActivity?: any;
  workoutCompleted?: boolean;
  premiumLevel?: string;
  targetDateStr?: string;
}

export function FitnessDashboardBottom({
  nutrition,
  lifestyle,
  dailyActivity,
  workoutCompleted,
  premiumLevel = "core",
  targetDateStr,
}: FitnessDashboardBottomProps) {
  return (
    <>
      {/* Today's Nutrition Card */}
      <TodaysNutritionCard nutrition={nutrition} premiumLevel={premiumLevel} targetDateStr={targetDateStr} />

      {/* Daily Activity Card */}
      <DailyActivityCard
        lifestyle={lifestyle}
        activity={dailyActivity}
        activityDate={targetDateStr}
        workoutCompleted={workoutCompleted}
        premiumLevel={premiumLevel}
      />

      {/* Today's Goals Card */}
      <TodaysGoalsCard
        lifestyle={lifestyle}
        activity={dailyActivity}
        nutrition={nutrition}
        workoutCompleted={workoutCompleted}
        premiumLevel={premiumLevel}
        targetDateStr={targetDateStr}
      />
    </>
  );
}
