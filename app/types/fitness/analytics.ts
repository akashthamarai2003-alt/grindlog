export type AnalyticsPeriod = '7D' | '30D' | '3M' | '6M' | 'ALL';

export interface TransformationMetrics {
  startingWeight: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  totalChange: number;
  remainingChange: number;
  completionPercentage: number;
  transformationDay: number;
  streak: number;
}

export interface ConsistencyMetrics {
  workout: number;
  nutrition: number;
  protein: number;
  water: number;
  steps: number;
  sleep: number;
  overallScore: number;
}

export interface WeightPoint {
  date: string;
  weight: number;
}

export interface BodyMeasurement {
  id: string;
  name: string;
  startValue: number | null;
  currentValue: number | null;
  change: number;
  unit: string;
}

export interface BodyPhotoScan {
  id: string;
  date: string;
  frontUrl: string | null;
  leftUrl: string | null;
  rightUrl: string | null;
  backUrl: string | null;
  goalUrl?: string | null;
}

export interface WorkoutAnalytics {
  totalWorkouts: number;
  completedWorkouts: number;
  completionRate: number;
  totalTrainingTimeMinutes: number;
  totalSets: number;
  totalReps: number;
  trainingVolumeKg: number;
  personalRecords: number;
  weeklyChart: { day: string; volume: number; completed: boolean }[];
}

export interface NutritionAnalytics {
  averageCalories: number;
  calorieTarget: number;
  averageProtein: number;
  proteinTarget: number;
  nutritionConsistency: number;
  calorieChart: { 
    day: string; 
    calories: number; 
    target: number; 
    date?: string; 
    fullDay?: string; 
    isToday?: boolean; 
    logged?: boolean; 
  }[];
  proteinChart: { 
    day: string; 
    protein: number; 
    target: number; 
    date?: string; 
    fullDay?: string; 
    isToday?: boolean; 
    logged?: boolean; 
  }[];
  todayCalories?: number;
  todayProtein?: number;
  todayCarbs?: number;
  carbsTarget?: number;
  todayFat?: number;
  fatTarget?: number;
}

export interface ActivityAnalytics {
  averageDailySteps: number;
  stepTarget: number;
  averageActiveMinutes: number;
  weeklyDistanceKm: number;
  stepsChart: { day: string; steps: number; target: number }[];
}

export interface RecoveryAnalytics {
  averageSleepHours: number;
  sleepTargetHours: number;
  averageSleepQuality: number; // 0-100
  restDays: number;
}

export interface AIProgressReview {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}

export interface AggregatedProgressPayload {
  period: AnalyticsPeriod;
  transformation: TransformationMetrics;
  consistency: ConsistencyMetrics;
  weightHistory: WeightPoint[];
  measurements: BodyMeasurement[];
  scans: { first: BodyPhotoScan | null; latest: BodyPhotoScan | null; goalUrl?: string | null; shouldPromptForScan?: boolean };
  workout: WorkoutAnalytics;
  nutrition: NutritionAnalytics;
  activity: ActivityAnalytics;
  recovery: RecoveryAnalytics;
  aiReview: AIProgressReview | null;
  achievements: Achievement[];
}
