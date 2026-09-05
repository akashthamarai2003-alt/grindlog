"use client";

import { User } from "@supabase/supabase-js";
import { OnboardingData } from "@/types/fitness/onboarding";
import Link from "next/link";
import { DashboardHeader } from "./dashboard-header";
import { HorizontalCalendar } from "./horizontal-calendar";
import { TodaysWorkoutCard } from "./todays-workout-card";
import { TransformationCard } from "./transformation-card";
import { TodaysNutritionCard } from "./todays-nutrition-card";
import { DailyActivityCard } from "./daily-activity-card";
import { TodaysGoalsCard } from "./todays-goals-card";
import { ExerciseLibraryCard } from "./exercise-library-card";
import { ProNutritionGenerationCard } from "./pro-nutrition-generation-card";

interface FitnessDashboardProps {
  user: User;
  profile: Partial<OnboardingData>;
  activePlan?: any;
  todayWorkout?: any;
  weekWorkouts?: any[];
  hasPlan?: boolean;
  nutrition?: any;
  lifestyle?: any;
  dailyActivity?: any;
  dayNumber?: number;
  premiumLevel?: string;
  targetDateStr?: string;
}

export function FitnessDashboard({
  user,
  profile,
  activePlan,
  todayWorkout,
  weekWorkouts = [],
  hasPlan,
  nutrition,
  lifestyle,
  dailyActivity,
  dayNumber = 1,
  premiumLevel = "core",
  targetDateStr,
}: FitnessDashboardProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1108] text-white overflow-x-hidden">
      {/* Background ambient glow matching the dark neon aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-50 z-0" />

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 pb-36 sm:pb-40 px-5 z-10 relative gap-6">
        <div className="mb-6 relative z-10">
          <DashboardHeader
            name={profile.name || user.user_metadata?.full_name || "Athlete"}
            dayNumber={dayNumber}
            avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
          />
        </div>

        {premiumLevel === "pro" && hasPlan && activePlan && (!Array.isArray(nutrition?.meals) || nutrition.meals.length === 0) && (
          <ProNutritionGenerationCard />
        )}

        {!hasPlan && (
          <div className="bg-[#121E12] border border-[#ADFF00]/50 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(173,255,0,0.1)]">
            <div>
              <h3 className="font-bold text-[#ADFF00]">No Active Plan</h3>
              <p className="text-xs text-gray-400 mt-1">Generate your AI strategy.</p>
            </div>
            <Link href="/report" prefetch={true} className="px-4 py-2 bg-[#ADFF00] text-black font-bold rounded-xl text-sm whitespace-nowrap shadow-[0_0_10px_rgba(173,255,0,0.3)] hover:bg-[#c4ff33]">
              Generate
            </Link>
          </div>
        )}

        {/* 3. Transformation Card */}
        <TransformationCard profile={profile} premiumLevel={premiumLevel} />

        {/* 4. Horizontal Calendar */}
        <HorizontalCalendar weekWorkouts={weekWorkouts} targetDateStr={targetDateStr} />

        {/* 5. Today's Workout Card */}
        <TodaysWorkoutCard workout={todayWorkout} targetDateStr={targetDateStr} />

        {/* Exercise Library Entry */}
        {premiumLevel === "pro" && <ExerciseLibraryCard />}

        {/* 6. Today's Nutrition Card */}
        <TodaysNutritionCard nutrition={nutrition} premiumLevel={premiumLevel} targetDateStr={targetDateStr} />

        {/* 7. Daily Activity Card */}
        <DailyActivityCard lifestyle={lifestyle} activity={dailyActivity} activityDate={targetDateStr} workoutCompleted={todayWorkout?.status === 'completed'} premiumLevel={premiumLevel} />

        {/* 8. Today's Goals Card */}
        <TodaysGoalsCard lifestyle={lifestyle} activity={dailyActivity} nutrition={nutrition} workoutCompleted={todayWorkout?.status === 'completed'} premiumLevel={premiumLevel} targetDateStr={targetDateStr} />

      </main>

      {/* 6. Custom Neon Bottom Navigation */}

    </div>
  );
}
