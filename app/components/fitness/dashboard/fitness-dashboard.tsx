"use client";

import { User } from "@supabase/supabase-js";
import { OnboardingData } from "@/types/fitness/onboarding";
import { FitnessHeader } from "./fitness-header";
import { TodayPlanCard } from "./today-plan-card";
import { DailyProgress } from "./daily-progress";
import { StreakCard } from "./streak-card";
import { TransformationCard } from "./transformation-card";
import { QuickActions } from "./quick-actions";
import { WeeklyProgress } from "./weekly-progress";

interface FitnessDashboardProps {
  user: User;
  profile: Partial<OnboardingData>;
  todayWorkout?: any;
  hasPlan?: boolean;
}

export function FitnessDashboard({ user, profile, todayWorkout, hasPlan }: FitnessDashboardProps) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto px-5 pt-8 pb-28">
      <FitnessHeader user={user} />
      <TodayPlanCard workout={todayWorkout} hasPlan={hasPlan} />
      <DailyProgress />
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StreakCard />
        <TransformationCard profile={profile} />
      </div>
      
      <QuickActions />
      <WeeklyProgress />
    </div>
  );
}
