import { cache } from "react";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { FitnessSubscription, FitnessFeature, FitnessPlanConfig } from "./types";
import { FITNESS_PLANS } from "./plans";

export const GRACE_PERIOD_HOURS = 48;
export const GRACE_PERIOD_MS = GRACE_PERIOD_HOURS * 60 * 60 * 1000;

export type FitnessSubscriptionStatus = "active" | "grace_period" | "expired" | "free";

export interface FitnessSubscriptionState {
  status: FitnessSubscriptionStatus;
  plan: FitnessPlanConfig;
  daysRemaining: number;
  hoursRemaining: number;
  graceHoursRemaining: number;
  isGracePeriod: boolean;
  isExpired: boolean;
  expiresAt: string | null;
}

/**
 * Gets the raw subscription record for a user (memoized per request).
 */
export const getFitnessSubscription = cache(async (userId: string): Promise<FitnessSubscription | null> => {
  const admin = createAdminClient();
  const { data } = await admin
    .from("fitness_os_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
    
  return data || null;
});

/**
 * Gets full subscription state including 48-hour grace period calculations (memoized per request).
 */
export const getFitnessSubscriptionState = cache(async (userId: string): Promise<FitnessSubscriptionState> => {
  const sub = await getFitnessSubscription(userId);
  const now = Date.now();

  let candidatePlanKey: string | null = null;
  let expiresAt: string | null = null;

  if (sub && sub.status === "active") {
    candidatePlanKey = sub.plan;
    expiresAt = sub.current_period_end || null;
  }

  if (!candidatePlanKey) {
    const admin = createAdminClient();
    const { data: fitnessProfile } = await admin
      .from("fitness_os_profiles")
      .select("fitness_is_premium, fitness_premium_level, fitness_premium_expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (fitnessProfile?.fitness_is_premium) {
      candidatePlanKey = fitnessProfile.fitness_premium_level === "pro" ? "pro" : "core";
      expiresAt = fitnessProfile.fitness_premium_expires_at || null;
    }
  }

  if (!candidatePlanKey) {
    const admin = createAdminClient();
    const { data: mainProfile } = await admin
      .from("profiles")
      .select("is_premium, premium_level, premium_expires_at")
      .eq("id", userId)
      .maybeSingle();

    if (mainProfile?.is_premium) {
      candidatePlanKey = mainProfile.premium_level === "pro" ? "pro" : "core";
      expiresAt = mainProfile.premium_expires_at || null;
    }
  }

  // Free user with no past paid subscriptions
  if (!candidatePlanKey) {
    return {
      status: "free",
      plan: FITNESS_PLANS.free,
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  // Lifetime plan
  if (!expiresAt) {
    const planConfig = FITNESS_PLANS[candidatePlanKey] || FITNESS_PLANS.pro;
    return {
      status: "active",
      plan: planConfig,
      daysRemaining: 9999,
      hoursRemaining: 99999,
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt: null,
    };
  }

  const expiryTime = new Date(expiresAt).getTime();
  const planConfig = FITNESS_PLANS[candidatePlanKey] || FITNESS_PLANS.pro;

  // Active status: current period end is in the future
  if (expiryTime > now) {
    const msRemaining = expiryTime - now;
    return {
      status: "active",
      plan: planConfig,
      daysRemaining: Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
      hoursRemaining: Math.ceil(msRemaining / (1000 * 60 * 60)),
      graceHoursRemaining: 0,
      isGracePeriod: false,
      isExpired: false,
      expiresAt,
    };
  }

  // 48-Hour Grace Period status: expired but within 48-hour buffer window
  if (expiryTime + GRACE_PERIOD_MS > now) {
    const graceMsRemaining = (expiryTime + GRACE_PERIOD_MS) - now;
    return {
      status: "grace_period",
      plan: planConfig, // Keeps paid features open during gym session
      daysRemaining: 0,
      hoursRemaining: 0,
      graceHoursRemaining: Math.max(1, Math.ceil(graceMsRemaining / (1000 * 60 * 60))),
      isGracePeriod: true,
      isExpired: false,
      expiresAt,
    };
  }

  // Expired beyond 48-hour grace period
  return {
    status: "expired",
    plan: FITNESS_PLANS.free,
    daysRemaining: 0,
    hoursRemaining: 0,
    graceHoursRemaining: 0,
    isGracePeriod: false,
    isExpired: true,
    expiresAt,
  };
});

/**
 * Gets the active plan config for a user (memoized per request).
 */
export const getFitnessPlan = cache(async (userId: string): Promise<FitnessPlanConfig | null> => {
  const state = await getFitnessSubscriptionState(userId);
  return state.plan;
});

export async function isFitnessFree(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return !plan || plan.id === "free";
}

export async function isFitnessStarter(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return plan?.id === "starter" || plan?.id === "core";
}

export async function isFitnessPro(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return plan?.id === "pro";
}

/**
 * Helper to ensure user has ANY active paid subscription (Core or Pro).
 */
export async function requireFitnessSubscription(userId: string): Promise<boolean> {
  const plan = await getFitnessPlan(userId);
  return !!plan && plan.id !== "free";
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
  if (!plan || plan.id === "free") return false;
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
