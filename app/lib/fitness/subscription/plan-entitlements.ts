import type { GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import type { FitnessPlanId } from "./types";

/**
 * Applies subscription entitlements after AI output has passed safety and
 * profile validation. The browser must never be trusted to decide which plan
 * tier receives premium nutrition data.
 */
export function applyFitnessPlanEntitlements(
  plan: GeneratedPlanData,
  planId: FitnessPlanId,
): GeneratedPlanData {
  if (planId === "pro" || !plan.nutrition) return plan;

  return {
    ...plan,
    nutrition: {
      ...plan.nutrition,
      carbs_grams: null,
      fat_grams: null,
      meals: [],
      grocery_list: [],
      guidance: "Core includes daily calorie and protein targets. Full meal planning and grocery add-ons are available on Pro.",
    },
  };
}
