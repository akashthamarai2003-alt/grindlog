import { ProgressView } from "@/components/fitness/progress/progress-view";
import { PaidAccessGate } from "@/components/fitness/fitness-guard";
import { AggregatedProgressPayload } from "@/types/fitness/analytics";

export const dynamic = "force-dynamic";

export default async function TestProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string }>;
}) {
  const { view = "pro", period = "30D" } = await searchParams;

  if (view === "free") {
    return <PaidAccessGate featureName="progress tracking" />;
  }

  const isPro = view !== "core";
  const isBulking = view === "bulking";
  const isEmpty = view === "empty";

  const defaultMockPayload: AggregatedProgressPayload = {
    period: (period as any) || "30D",
    transformation: isEmpty
      ? {
          startingWeight: null,
          currentWeight: null,
          targetWeight: null,
          totalChange: 0,
          remainingChange: 0,
          completionPercentage: 0,
          transformationDay: 1,
          streak: 0,
        }
      : isBulking
      ? {
          startingWeight: 68.0,
          currentWeight: 71.0,
          targetWeight: 75.0,
          totalChange: 3.0,
          remainingChange: 4.0,
          completionPercentage: 43,
          transformationDay: 35,
          streak: 14,
        }
      : {
          startingWeight: 75.0,
          currentWeight: 72.4,
          targetWeight: 68.0,
          totalChange: 2.6,
          remainingChange: 4.4,
          completionPercentage: 37,
          transformationDay: 28,
          streak: 12,
        },
    consistency: isEmpty
      ? {
          workout: 0,
          nutrition: 0,
          protein: 0,
          water: 0,
          steps: 0,
          sleep: 0,
          overallScore: 0,
        }
      : {
          workout: 86,
          nutrition: 90,
          protein: 95,
          water: 80,
          steps: 75,
          sleep: 85,
          overallScore: 85,
        },
    weightHistory: isEmpty
      ? []
      : isBulking
      ? [
          { date: "2026-09-01", weight: 68.0 },
          { date: "2026-09-08", weight: 68.8 },
          { date: "2026-09-15", weight: 69.7 },
          { date: "2026-09-22", weight: 70.4 },
          { date: "2026-09-29", weight: 71.0 },
        ]
      : [
          { date: "2026-09-01", weight: 75.0 },
          { date: "2026-09-07", weight: 74.3 },
          { date: "2026-09-14", weight: 73.8 },
          { date: "2026-09-21", weight: 73.0 },
          { date: "2026-09-28", weight: 72.4 },
        ],
    measurements: isEmpty
      ? []
      : [
          { id: "waist", name: "Waist", startValue: 86, currentValue: 82, change: -4, unit: "cm" },
          { id: "chest", name: "Chest", startValue: 102, currentValue: 104, change: 2, unit: "cm" },
          { id: "left_arm", name: "Left Arm", startValue: 34, currentValue: 35.5, change: 1.5, unit: "cm" },
          { id: "right_arm", name: "Right Arm", startValue: 34, currentValue: 35.5, change: 1.5, unit: "cm" },
        ],
    scans: isEmpty
      ? { first: null, latest: null, goalUrl: null, shouldPromptForScan: false }
      : {
          first: {
            id: "scan-1",
            date: "2026-09-01",
            frontUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600",
            leftUrl: null,
            rightUrl: null,
            backUrl: null,
          },
          latest: {
            id: "scan-2",
            date: "2026-09-28",
            frontUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",
            leftUrl: null,
            rightUrl: null,
            backUrl: null,
          },
          goalUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600",
          shouldPromptForScan: true,
        },
    workout: {
      totalWorkouts: isEmpty ? 0 : 20,
      completedWorkouts: isEmpty ? 0 : 18,
      completionRate: isEmpty ? 0 : 90,
      totalTrainingTimeMinutes: isEmpty ? 0 : 980,
      totalSets: isEmpty ? 0 : 145,
      totalReps: isEmpty ? 0 : 1450,
      trainingVolumeKg: isEmpty ? 0 : 12450,
      personalRecords: isEmpty ? 0 : 5,
      weeklyChart: [
        { day: "Mon", volume: 1850, completed: true },
        { day: "Tue", volume: 2100, completed: true },
        { day: "Wed", volume: 0, completed: false },
        { day: "Thu", volume: 1950, completed: true },
        { day: "Fri", volume: 2200, completed: true },
        { day: "Sat", volume: 1600, completed: true },
        { day: "Sun", volume: 0, completed: false },
      ],
    },
    nutrition: {
      averageCalories: isEmpty ? 0 : 2150,
      calorieTarget: 2200,
      averageProtein: isEmpty ? 0 : 145,
      proteinTarget: 150,
      nutritionConsistency: isEmpty ? 0 : 92,
      todayCalories: isEmpty ? 0 : 2180,
      todayProtein: isEmpty ? 0 : 148,
      todayCarbs: isEmpty ? 0 : 230,
      carbsTarget: 240,
      todayFat: isEmpty ? 0 : 58,
      fatTarget: 60,
      calorieChart: [
        { day: "M", fullDay: "Mon", calories: 2100, target: 2200, isToday: false, logged: true },
        { day: "T", fullDay: "Tue", calories: 2250, target: 2200, isToday: false, logged: true },
        { day: "W", fullDay: "Wed", calories: 2050, target: 2200, isToday: false, logged: true },
        { day: "T", fullDay: "Thu", calories: 2200, target: 2200, isToday: false, logged: true },
        { day: "F", fullDay: "Fri", calories: 2180, target: 2200, isToday: true, logged: true },
        { day: "S", fullDay: "Sat", calories: 0, target: 2200, isToday: false, logged: false },
        { day: "S", fullDay: "Sun", calories: 0, target: 2200, isToday: false, logged: false },
      ],
      proteinChart: [
        { day: "M", fullDay: "Mon", protein: 145, target: 150, isToday: false, logged: true },
        { day: "T", fullDay: "Tue", protein: 152, target: 150, isToday: false, logged: true },
        { day: "W", fullDay: "Wed", protein: 140, target: 150, isToday: false, logged: true },
        { day: "T", fullDay: "Thu", protein: 150, target: 150, isToday: false, logged: true },
        { day: "F", fullDay: "Fri", protein: 148, target: 150, isToday: true, logged: true },
        { day: "S", fullDay: "Sat", protein: 0, target: 150, isToday: false, logged: false },
        { day: "S", fullDay: "Sun", protein: 0, target: 150, isToday: false, logged: false },
      ],
    },
    activity: {
      todaySteps: isEmpty ? 0 : 8420,
      averageDailySteps: isEmpty ? 0 : 8900,
      stepTarget: 10000,
      averageActiveMinutes: isEmpty ? 0 : 45,
      weeklyDistanceKm: isEmpty ? 0 : 42.5,
      stepsChart: [
        { day: "M", fullDay: "Mon", steps: 9200, target: 10000, isToday: false, logged: true },
        { day: "T", fullDay: "Tue", steps: 10500, target: 10000, isToday: false, logged: true },
        { day: "W", fullDay: "Wed", steps: 8100, target: 10000, isToday: false, logged: true },
        { day: "T", fullDay: "Thu", steps: 9400, target: 10000, isToday: false, logged: true },
        { day: "F", fullDay: "Fri", steps: 8420, target: 10000, isToday: true, logged: true },
        { day: "S", fullDay: "Sat", steps: 0, target: 10000, isToday: false, logged: false },
        { day: "S", fullDay: "Sun", steps: 0, target: 10000, isToday: false, logged: false },
      ],
    },
    recovery: {
      todaySleepHours: isEmpty ? 0 : 7.5,
      todaySleepQuality: isEmpty ? 0 : 85,
      averageSleepHours: isEmpty ? 0 : 7.8,
      sleepTargetHours: 8.0,
      averageSleepQuality: isEmpty ? 0 : 82,
      restDays: 2,
      sleepChart: [
        { day: "M", fullDay: "Mon", hours: 7.8, target: 8.0, isToday: false, logged: true },
        { day: "T", fullDay: "Tue", hours: 8.1, target: 8.0, isToday: false, logged: true },
        { day: "W", fullDay: "Wed", hours: 7.2, target: 8.0, isToday: false, logged: true },
        { day: "T", fullDay: "Thu", hours: 7.9, target: 8.0, isToday: false, logged: true },
        { day: "F", fullDay: "Fri", hours: 7.5, target: 8.0, isToday: true, logged: true },
        { day: "S", fullDay: "Sat", hours: 0, target: 8.0, isToday: false, logged: false },
        { day: "S", fullDay: "Sun", hours: 0, target: 8.0, isToday: false, logged: false },
      ],
    },
    aiReview: isEmpty
      ? null
      : {
          summary: isBulking
            ? "Strong hypercaloric bulk! Lean body mass is up 3.0kg over 35 days with solid squat and bench progression."
            : "Outstanding 4-week cutting phase! Weight down 2.6kg to 72.4kg with clean upper body muscle retention.",
          strengths: [
            "90% workout consistency maintained",
            "Protein goal hit on 6 out of 7 days",
            "Consistent sleeping schedule averaging 7.8 hours",
          ],
          weaknesses: [
            "Weekend step counts dropped slightly below target",
            "Hydration missed the 3.5L goal on Wednesday",
          ],
          recommendations: [
            "Add a 15-minute recovery walk on rest days",
            "Keep daily protein intake above 140g during heavy volume weeks",
          ],
          generatedAt: "2026-09-28T10:00:00Z",
          canGenerateToday: true,
          dailyQuotaRemaining: 18,
          dailyQuotaTotal: 20,
          dailyUsedCount: 2,
        },
    achievements: isEmpty
      ? []
      : [
          {
            id: "ach-1",
            title: "Iron Warrior",
            description: "Complete 15 workouts in a month",
            icon: "⚔️",
            unlocked: true,
            progress: 18,
            target: 15,
          },
          {
            id: "ach-2",
            title: "Century Club",
            description: "Log 100 completed sets",
            icon: "💯",
            unlocked: true,
            progress: 145,
            target: 100,
          },
          {
            id: "ach-3",
            title: "Marathon Walker",
            description: "Reach 50,000 steps in a week",
            icon: "👟",
            unlocked: false,
            progress: 38500,
            target: 50000,
          },
        ],
  };

  return <ProgressView initialData={defaultMockPayload} isPro={isPro} />;
}
