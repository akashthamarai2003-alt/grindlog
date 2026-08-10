import { createClient } from "@/lib/services/supabase/server";
import { FitnessSubscription, FitnessFeature, FitnessPlanConfig } from "./types";
import { FITNESS_PLANS } from "./plans";

/**
 * Gets the raw subscription record for a user.
 */
export async function getFitnessSubscription(userId: string): Promise<FitnessSubscription | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fitness_os_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  return data || null;
}

/**
 * Gets the active plan config for a user, if they have an active subscription.
 */
export async function getFitnessPlan(userId: string): Promise<FitnessPlanConfig | null> {
  const sub = await getFitnessSubscription(userId);
  if (!sub || sub.status !== "active") return null;
  return FITNESS_PLANS[sub.plan] || null;
}

export async function isFitnessStarter(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return plan?.id === "starter";
}

export async function isFitnessPro(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return plan?.id === "pro";
}

/**
 * Helper to ensure user has ANY active subscription.
 */
export async function requireFitnessSubscription(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return !!plan;
}

/**
 * Helper to ensure user has PRO subscription.
 */
export async function requireFitnessPro(userId: string): Promise<boolean> {
  return isFitnessPro(userId);
}

/**
 * Check if the user's current plan allows a specific feature.
 */
export async function canUseFitnessFeature(userId: string, feature: FitnessFeature): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  if (!plan) return false;
  return plan.features.includes(feature);
}

/**
 * Get the AI limit for the user based on their current plan.
 * Returns 0 if they don't have an active subscription.
 */
export async function getFitnessAILimit(userId: string): Promise<number> {
  const plan = await getFitnessPlan(userId);
  return plan ? plan.aiDailyLimit : 0;
}
