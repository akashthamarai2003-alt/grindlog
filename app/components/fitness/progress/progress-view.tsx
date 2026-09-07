"use client";

import { useState, useEffect, useRef } from "react";
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
import { WorkoutHeatmap } from "./workout-heatmap";
import { MuscleMap } from "../workout/muscle-map";
import { ProUpgradeModal } from "@/components/fitness/pro-upgrade-modal";
import { Lock } from "lucide-react";
import Link from "next/link";

export function ProgressView({ initialData, isPro = true }: { initialData: AggregatedProgressPayload; isPro?: boolean }) {
  const [data, setData] = useState<AggregatedProgressPayload>(initialData);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialData.period);
  const [isFetching, setIsFetching] = useState(false);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [joinedDate, setJoinedDate] = useState<string | undefined>(undefined);

  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalFeature, setProModalFeature] = useState("This feature");

  const triggerProModal = (feature: string) => {
    setProModalFeature(feature);
    setProModalOpen(true);
  };

  // In-memory cache for instant 0ms switching between periods
  const cacheRef = useRef<Record<string, AggregatedProgressPayload>>({
    [initialData.period]: initialData,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Background pre-fetch for common periods (7D, 30D, 3M, 6M, ALL) so clicks are instant
  useEffect(() => {
    const allPeriods: AnalyticsPeriod[] = ['7D', '30D', '3M', '6M', 'ALL'];
    const toPrefetch = allPeriods.filter(p => p !== initialData.period);

    let isMounted = true;
    let timer: NodeJS.Timeout;

    const prefetchSequence = async (index: number) => {
      if (!isMounted || index >= toPrefetch.length) return;
      const targetPeriod = toPrefetch[index];

      if (!cacheRef.current[targetPeriod]) {
        try {
          const res = await fetch(`/api/fitness-ai/progress-data?period=${targetPeriod}`);
          if (res.ok && isMounted) {
            const json = await res.json();
            cacheRef.current[targetPeriod] = json;
          }
        } catch {}
      }

      if (isMounted) {
        timer = setTimeout(() => prefetchSequence(index + 1), 350);
      }
    };

    timer = setTimeout(() => prefetchSequence(0), 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [initialData.period]);

  // Fetch workout dates for the heatmap (last 365 days)
  useEffect(() => {
    fetch("/api/fitness/workout-dates")
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json) {
          if (json.dates && Array.isArray(json.dates)) {
            setWorkoutDates(json.dates);
          }
          if (json.scheduledDates && Array.isArray(json.scheduledDates)) {
            setScheduledDates(json.scheduledDates);
          }
          if (json.exerciseNames && Array.isArray(json.exerciseNames)) {
            setRecentExercises(json.exerciseNames);
          }
          if (json.joinedDate) {
            setJoinedDate(json.joinedDate);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Keep local state in sync whenever server component provides fresh initialData
  useEffect(() => {
    cacheRef.current[initialData.period] = initialData;
    setData(initialData);
  }, [initialData]);

  // Direct client refresh without needing full page reload
  const refreshData = async () => {
    try {
      const res = await fetch(`/api/fitness-ai/progress-data?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        cacheRef.current[period] = json;
        setData(json);
      }
    } catch (err) {
      console.error("Failed to refresh progress data", err);
    }
  };

  const handlePeriodChange = async (newPeriod: AnalyticsPeriod) => {
    if (newPeriod === period) return;

    // 1. INSTANT CACHE HIT: 0ms switch if already in memory
    if (cacheRef.current[newPeriod]) {
      setPeriod(newPeriod);
      setData(cacheRef.current[newPeriod]);
      setIsFetching(false);
      return;
    }

    // 2. Optimistic UI: update active tab immediately, keep content on screen (no full-page unmounting!)
    setPeriod(newPeriod);
    setIsFetching(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/fitness-ai/progress-data?period=${newPeriod}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      cacheRef.current[newPeriod] = json;
      setData(json);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Failed to fetch progress data:", err);
      }
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#0A1108] pb-32">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5">
        <ProgressHeader 
          transformation={data.transformation} 
          period={period} 
          onPeriodChange={handlePeriodChange} 
          isFetching={isFetching}
          joinedDate={joinedDate}
        />

        {!isPro && (
          <div className="mt-4 mb-2 p-4 rounded-2xl bg-gradient-to-r from-[#ADFF00]/15 via-[#ADFF00]/5 to-transparent border border-[#ADFF00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(173,255,0,0.1)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#ADFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pro Feature Preview
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Core tracks your workout completion and weight trends. Upgrade to Pro for AI progress reviews, body fat scanning, and advanced metabolic analytics.
              </p>
            </div>
            <Link
              href="/payment?returnTo=/progress&intent=upgrade_pro"
              className="shrink-0 px-3.5 py-2 bg-[#ADFF00] hover:bg-[#c4ff33] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-sm"
            >
              Unlock Pro ⚡
            </Link>
          </div>
        )}
        
        <div key={period} className={`flex flex-col gap-8 pb-8 transition-opacity duration-200 ${isFetching ? 'opacity-85' : 'opacity-100'}`}>
            {data.scans.shouldPromptForScan && (
              <div className="w-full bg-gradient-to-br from-[#ADFF00]/20 to-[#ADFF00]/5 border border-[#ADFF00]/30 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-8xl opacity-10 blur-sm pointer-events-none">🔥</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
                  <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">Smart Coach</h3>
                </div>
                <p className="text-sm font-medium text-white/90">
                  You've been highly consistent with your workouts and diet! Your body is actively transforming. It's time to capture your new physique.
                </p>
                {isPro ? (
                  <Link href="/progress/add-scan" className="mt-2 w-full py-3 bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center hover:bg-[#baff22] transition-colors">
                    Take Progress Photo 📸
                  </Link>
                ) : (
                  <button 
                    type="button"
                    onClick={() => triggerProModal("Progress Photo Scans")}
                    className="mt-2 w-full py-3 bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#baff22] transition-colors cursor-pointer"
                  >
                    <Lock size={14} /> Take Progress Photo 📸 <span className="text-[9px] bg-black text-amber-400 px-1.5 py-0.5 rounded font-black ml-1">PRO</span>
                  </button>
                )}
              </div>
            )}
            
            <TransformationOverview metrics={data.transformation} />
            <WeeklyConsistency metrics={data.consistency} />

            {/* Workout Heatmap Calendar */}
            <SmoothSection minHeight="240px">
              <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 sm:p-5">
                <WorkoutHeatmap completedDates={workoutDates} scheduledDates={scheduledDates} joinedDate={joinedDate} />
              </div>
            </SmoothSection>

            {/* Muscle Map */}
            <SmoothSection minHeight="380px">
              <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-5">
                <MuscleMap exerciseNames={recentExercises} showLabel={true} />
              </div>
            </SmoothSection>
            
            <div id="transformation-details" className="flex flex-col gap-8 scroll-mt-6">
              <SmoothSection minHeight="320px">
                <WeightChart 
                  data={data.weightHistory} 
                  targetWeight={data.transformation.targetWeight} 
                  isPro={isPro}
                  onProClick={triggerProModal}
                />
              </SmoothSection>
              <SmoothSection minHeight="200px">
                <BodyMeasurementsList 
                  measurements={data.measurements} 
                  isBulking={(data.transformation.targetWeight || 0) > (data.transformation.startingWeight || 0)} 
                  isPro={isPro}
                  onProClick={triggerProModal}
                />
              </SmoothSection>
              <SmoothSection minHeight="340px">
                <BodyProgressPhotos 
                  first={data.scans.first} 
                  latest={data.scans.latest} 
                  initialGoalUrl={data.scans.goalUrl} 
                  isPro={isPro}
                  onProClick={triggerProModal}
                />
              </SmoothSection>
            </div>
            <SmoothSection minHeight="260px">
              <WorkoutAnalyticsCard metrics={data.workout} />
            </SmoothSection>
            <SmoothSection minHeight="260px">
              <NutritionAnalyticsCard metrics={data.nutrition} />
            </SmoothSection>
            <SmoothSection minHeight="260px">
              <ActivityRecoveryAnalyticsCard 
                activity={data.activity} 
                recovery={data.recovery} 
                onRefresh={refreshData} 
                isPro={isPro}
                onProClick={triggerProModal}
              />
            </SmoothSection>
            <SmoothSection minHeight="280px">
              <AIProgressReviewCard 
                initialReview={data.aiReview} 
                period={data.period} 
                onRefresh={refreshData} 
                isPro={isPro}
                onProClick={triggerProModal}
              />
            </SmoothSection>
            <SmoothSection minHeight="200px">
              <AchievementsShowcase achievements={data.achievements} />
            </SmoothSection>
          </div>
      </div>

      <ProUpgradeModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={proModalFeature}
      />
    </div>
  );
}

/**
 * Progress Section Container Wrapper
 */
function SmoothSection({ children, className = "" }: { children: React.ReactNode; minHeight?: string; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
