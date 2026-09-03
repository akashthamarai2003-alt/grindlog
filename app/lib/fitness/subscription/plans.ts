import { FitnessPlanConfig } from "./types";

// Pro price is configurable from environment or falls back to default
const PRO_PRICE_IN_PAISE = process.env.FITNESS_PRO_PRICE 
  ? parseInt(process.env.FITNESS_PRO_PRICE, 10) 
  : 99900; // ₹999/month default

export const STARTER_PLAN: FitnessPlanConfig = {
  id: "starter",
  name: "Starter",
  description: "Perfect way to get started with Fitness AI OS.",
  priceInPaise: 1000, // ₹10
  currency: "INR",
  features: [
    "fitness_dashboard",
    "workout_system",
    "ai_plan_generation"
  ],
  aiDailyLimit: 5, // Limited AI usage
};

export const PRO_PLAN: FitnessPlanConfig = {
  id: "pro",
  name: "Pro",
  description: "Unlock advanced AI Coach insights and dynamic plan adjustments.",
  priceInPaise: PRO_PRICE_IN_PAISE,
  currency: "INR",
  features: [
    "fitness_dashboard",
    "workout_system",
    "ai_plan_generation",
    "ai_coach",
    "ai_weekly_review",
    "ai_plan_adjustments",
    "advanced_progress_analysis"
  ],
  aiDailyLimit: 50, // Higher AI limits
};

export const FITNESS_PLANS: Record<string, FitnessPlanConfig> = {
  starter: STARTER_PLAN,
  pro: PRO_PLAN,
};
