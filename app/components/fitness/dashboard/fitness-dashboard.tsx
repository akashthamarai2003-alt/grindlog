"use client";

import { User } from "@supabase/supabase-js";
import { OnboardingData } from "@/types/fitness/onboarding";
import { DashboardHeader } from "./dashboard-header";
import { AIMessageCard } from "./ai-message-card";
import { HorizontalCalendar } from "./horizontal-calendar";
import { CategoryPills } from "./category-pills";
import { HorizontalWorkoutList } from "./horizontal-workout-list";
import { TransformationCard } from "./transformation-card";
interface FitnessDashboardProps {
  user: User;
  profile: Partial<OnboardingData>;
  todayWorkout?: any;
  hasPlan?: boolean;
  latestReview?: any;
  nutrition?: any;
  dayNumber?: number;
}

export function FitnessDashboard({ user, profile, todayWorkout, hasPlan, latestReview, nutrition, dayNumber = 1 }: FitnessDashboardProps) {
  // Extract user's first name, defaulting to "User" if missing
  const firstName = profile?.name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || "User";

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1108] text-white overflow-x-hidden">
      
      {/* Background ambient glow matching the dark neon aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-50 z-0" />
      
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 pb-28 px-5 z-10 relative gap-6">
        
        {/* 1. Dashboard Header */}
        <DashboardHeader name={firstName} dayNumber={dayNumber} />

        {/* 2. AI Target / Message Card */}
        <AIMessageCard />

        {/* 3. Transformation Card */}
        <TransformationCard profile={profile} />

        {/* 4. Horizontal Calendar */}
        <HorizontalCalendar />

        {/* 4. Filter Tags / Category Pills */}
        <CategoryPills />

        {/* 5. Horizontal Scrolling Workouts */}
        <HorizontalWorkoutList workout={todayWorkout} />

      </main>

      {/* 6. Custom Neon Bottom Navigation */}

    </div>
  );
}
