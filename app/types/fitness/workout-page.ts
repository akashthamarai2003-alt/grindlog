export interface WorkoutPageData {
  dateStr: string;
  isFree: boolean;
  planBadge?: string;
  effectiveWeekDays: any[];
  effectivePlanDays: any[];
  effectiveWorkout: any | null;
  nextWorkout: any | null;
  nextWorkoutLabel?: string;
  hasActivePlan: boolean;
  isPro: boolean;
  initialCoachNote: string | null;
}
