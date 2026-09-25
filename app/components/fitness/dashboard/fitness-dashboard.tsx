"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { OnboardingData } from "@/types/fitness/onboarding";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { DashboardHeader } from "./dashboard-header";
import { HorizontalCalendar } from "./horizontal-calendar";
import { TodaysWorkoutCard } from "./todays-workout-card";
import { TransformationCard } from "./transformation-card";
import { ExerciseLibraryCard } from "./exercise-library-card";
import { ProUpgradeModal } from "@/components/fitness/pro-upgrade-modal";
import { RenewalBanner } from "@/components/fitness/subscription/renewal-banner";
import { FitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { dashboardClientCache } from "@/lib/api/dashboard-cache";

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
  subscriptionState?: FitnessSubscriptionState;
  /** Streaming bottom section (nutrition, activity, goals cards) injected from server */
  bottomSlot?: React.ReactNode;
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
  subscriptionState,
  bottomSlot,
}: FitnessDashboardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalFeature, setModalFeature] = useState("Workout Sessions");
  const isFree = premiumLevel === "free";

  useEffect(() => {
    dashboardClientCache.set({
      user,
      profile,
      activePlan,
      todayWorkout,
      weekWorkouts,
      hasPlan,
      nutrition,
      lifestyle,
      dailyActivity,
      dayNumber,
      premiumLevel,
      targetDateStr,
      subscriptionState,
    });
  }, [
    user,
    profile,
    activePlan,
    todayWorkout,
    weekWorkouts,
    hasPlan,
    nutrition,
    lifestyle,
    dailyActivity,
    dayNumber,
    premiumLevel,
    targetDateStr,
    subscriptionState,
  ]);

  const openUpgradeModal = (feature: string) => {
    setModalFeature(feature);
    setShowUpgradeModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1108] text-white overflow-x-hidden">
      {/* Background ambient glow matching the dark neon aesthetic */}
      <div className="dark-ambient-glow absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_top,#1A2619_0%,transparent_70%)] pointer-events-none opacity-50 z-0" />

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 pb-36 sm:pb-40 px-5 z-10 relative gap-6">
        <div className="mb-6 relative z-10">
          <DashboardHeader
            name={profile.name || user.user_metadata?.full_name || "Athlete"}
            dayNumber={dayNumber}
            avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
          />
        </div>

        {/* Subscription Renewal / Grace Period / Expiration Alert Banner */}
        {subscriptionState && <RenewalBanner state={subscriptionState} />}

        {/* Free Preview Mode Banner (Only shown if pure free preview and not expired) */}
        {isFree && !subscriptionState?.isExpired && !subscriptionState?.isGracePeriod && (
          <div className="bg-gradient-to-r from-[#1A2619] via-[#121E12] to-[#1A2619] border border-[#ADFF00]/40 p-4 rounded-2xl shadow-[0_0_20px_rgba(173,255,0,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#ADFF00] text-black px-2 py-0.5 rounded-full">
                    Preview Mode
                  </span>
                  <span className="text-xs font-bold text-[#ADFF00]">Free Tier</span>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  You are exploring GrindLog in preview mode. Choose a plan to unlock live tracking, workout sessions, and AI coach.
                </p>
              </div>
            </div>
            <Link
              href="/payment"
              className="px-4 py-2.5 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black uppercase tracking-wider text-xs rounded-xl text-center shadow-[0_0_15px_rgba(173,255,0,0.3)] shrink-0 active:scale-95 transition-all"
            >
              Choose Plan ⚡
            </Link>
          </div>
        )}

        {!hasPlan && !isFree && (
          <div className="bg-[#121E12] border border-[#ADFF00]/50 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(173,255,0,0.1)]">
            <div>
              <h3 className="font-bold text-[#ADFF00]">Plan Ready for Review</h3>
              <p className="text-xs text-gray-400 mt-1">Review and activate your customized plan.</p>
            </div>
            <Link href="/plan-setup" prefetch={true} className="px-4 py-2 bg-[#ADFF00] text-black font-bold rounded-xl text-sm whitespace-nowrap shadow-[0_0_10px_rgba(173,255,0,0.3)] hover:bg-[#c4ff33]">
              Review Plan
            </Link>
          </div>
        )}

        {/* 3. Transformation Card */}
        <TransformationCard profile={profile} premiumLevel={premiumLevel} />

        {/* 4. Horizontal Calendar */}
        <HorizontalCalendar weekWorkouts={weekWorkouts} targetDateStr={targetDateStr} />

        {/* 5. Today's Workout Card */}
        <TodaysWorkoutCard
          workout={todayWorkout}
          targetDateStr={targetDateStr}
          isFree={isFree}
          onFreeClick={() => openUpgradeModal("Live Workout Sessions")}
        />

        {/* Exercise Library Entry */}
        <ExerciseLibraryCard />

        {/* Below-fold: Nutrition, Activity, Goals — streamed in separately for fast initial paint */}
        {bottomSlot}

      </main>

      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={modalFeature}
        planRequired="any"
      />

    </div>
  );
}

