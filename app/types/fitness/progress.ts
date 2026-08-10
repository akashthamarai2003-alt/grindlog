export interface ProgressReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  workouts_completed: number;
  workouts_planned: number;
  sets_completed: number;
  total_workout_minutes: number;
  ai_summary: string | null;
  ai_highlights: string[] | null;
  ai_recommendations: string[] | null;
  created_at: string;
}

export interface PlanAdjustment {
  id: string;
  user_id: string;
  plan_id: string;
  adjustment_type: string | null;
  reason: string | null;
  proposed_changes: any;
  status: "pending" | "approved" | "rejected" | "applied" | null;
  created_at: string;
  approved_at: string | null;
}

export interface WeeklyWorkoutStats {
  workoutsPlanned: number;
  workoutsCompleted: number;
  setsCompleted: number;
  totalMinutes: number;
  activeDays: number;
}
