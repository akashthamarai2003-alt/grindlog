"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function ProgressView({ initialData }: { initialData: AggregatedProgressPayload }) {
  const [data, setData] = useState<AggregatedProgressPayload>(initialData);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialData.period);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [scheduledDates, setScheduledDates] = useState<string[]>([]);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [joinedDate, setJoinedDate] = useState<string | undefined>(undefined);

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
                <Link href="/progress/add-scan" className="mt-2 w-full py-3 bg-[#ADFF00] text-black font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center hover:bg-[#baff22] transition-colors">
                  Take Progress Photo 📸
                </Link>
              </div>
            )}
            
            <TransformationOverview metrics={data.transformation} />
            <WeeklyConsistency metrics={data.consistency} />

            {/* Workout Heatmap Calendar */}
            <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-5">
              <WorkoutHeatmap completedDates={workoutDates} scheduledDates={scheduledDates} joinedDate={joinedDate} />
            </div>

            {/* Muscle Map */}
            <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-5">
              <MuscleMap exerciseNames={recentExercises} showLabel={true} />
            </div>
            
            <div id="transformation-details" className="flex flex-col gap-8 scroll-mt-6">
              <WeightChart data={data.weightHistory} targetWeight={data.transformation.targetWeight} />
              <BodyMeasurementsList 
                measurements={data.measurements} 
                isBulking={(data.transformation.targetWeight || 0) > (data.transformation.startingWeight || 0)} 
              />
              <BodyProgressPhotos 
                first={data.scans.first} 
                latest={data.scans.latest} 
                initialGoalUrl={data.scans.goalUrl} 
              />
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
