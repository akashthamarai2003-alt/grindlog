import { FitnessPlanConfig } from "./types";

// Pro price is configurable from environment or falls back to default
const PRO_PRICE_IN_PAISE = process.env.FITNESS_PRO_PRICE 
  ? parseInt(process.env.FITNESS_PRO_PRICE, 10) 
  : 99900; // ₹999/month default

export const CORE_PLAN: FitnessPlanConfig = {
  id: "core",
  name: "Core",
  description: "Perfect way to get started with Fitness AI OS.",
  priceInPaise: 1000, // ₹10
  currency: "INR",
  features: [
    "fitness_dashboard",
    "workout_system",
    "ai_plan_generation"
  ],
  aiDailyLimit: 3, // Core user daily use: 3
};

export const STARTER_PLAN: FitnessPlanConfig = {
  ...CORE_PLAN,
  id: "starter",
  name: "Core",
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
    "exercise_library",
    "ai_plan_generation",
    "ai_coach",
    "ai_weekly_review",
    "ai_plan_adjustments",
    "advanced_progress_analysis"
  ],
  aiDailyLimit: 20, // Pro user daily use: 20
};

export const FITNESS_PLANS: Record<string, FitnessPlanConfig> = {
  starter: STARTER_PLAN,
  core: CORE_PLAN,
  pro: PRO_PLAN,
};
