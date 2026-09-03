export type FitnessPlanId = "starter" | "pro";

export type FitnessSubscriptionStatus = "created" | "active" | "paused" | "cancelled" | "expired";

export type FitnessFeature = 
  | "fitness_dashboard"
  | "workout_system"
  | "exercise_library"
  | "ai_plan_generation"
  | "ai_coach"
  | "ai_weekly_review"
  | "ai_plan_adjustments"
  | "advanced_progress_analysis";

export interface FitnessPlanConfig {
  id: FitnessPlanId;
  name: string;
  description: string;
  priceInPaise: number;
  currency: string;
  features: FitnessFeature[];
  aiDailyLimit: number;
}

export interface FitnessSubscription {
  id: string;
  user_id: string;
  plan: FitnessPlanId;
  status: FitnessSubscriptionStatus;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
