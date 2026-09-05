import { cache } from "react";
import { createClient } from "@/lib/services/supabase/server";
import { FitnessSubscription, FitnessFeature, FitnessPlanConfig } from "./types";
import { FITNESS_PLANS } from "./plans";

/**
 * Gets the raw subscription record for a user (memoized per request).
 */
export const getFitnessSubscription = cache(async (userId: string): Promise<FitnessSubscription | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fitness_os_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  return data || null;
});

/**
 * Gets the active plan config for a user, if they have an active subscription (memoized per request).
 */
export const getFitnessPlan = cache(async (userId: string): Promise<FitnessPlanConfig | null> => {
  const sub = await getFitnessSubscription(userId);
  if (sub && sub.status === "active") {
    if (!sub.current_period_end || new Date(sub.current_period_end) > new Date()) {
      return FITNESS_PLANS[sub.plan] || null;
    }
  }

  // Fallback to fitness_os_profiles in case user upgraded via direct payment or legacy fields
  const supabase = await createClient();
  const { data: fitnessProfile } = await supabase
    .from("fitness_os_profiles")
    .select("fitness_is_premium, fitness_premium_level, fitness_premium_expires_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (fitnessProfile?.fitness_is_premium) {
    if (!fitnessProfile.fitness_premium_expires_at || new Date(fitnessProfile.fitness_premium_expires_at) > new Date()) {
      const level = fitnessProfile.fitness_premium_level === "pro" ? "pro" : "core";
      return FITNESS_PLANS[level] || null;
    }
  }

  // Fallback to main profile
  const { data: mainProfile } = await supabase
    .from("profiles")
    .select("is_premium, premium_level, premium_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (mainProfile?.is_premium) {
    if (!mainProfile.premium_expires_at || new Date(mainProfile.premium_expires_at) > new Date()) {
      const level = mainProfile.premium_level === "pro" ? "pro" : "core";
      return FITNESS_PLANS[level] || null;
    }
  }

  return null;
});

export async function isFitnessStarter(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return plan?.id === "starter" || plan?.id === "core";
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
 * Pro users get 20 daily generations, Core users get 3, and users without an active subscription get 0.
 */
export async function getFitnessAILimit(userId: string): Promise<number> {
  const plan = await getFitnessPlan(userId);
  return plan ? plan.aiDailyLimit : 0;
}
