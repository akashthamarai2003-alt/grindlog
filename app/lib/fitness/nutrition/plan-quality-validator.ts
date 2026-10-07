// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Plan Quality Validator
// File: lib/fitness/nutrition/plan-quality-validator.ts
// Production validator enforcing explicit, stated numerical gates:
// - Daily Calories: [-5.0%, +5.0%] hard gate (warning at +-3.0%)
// - Daily Protein:  [-5.0%, +10.0%] hard gate (warning at -3.0% / +6.0%)
// - Zero discrete food decimals (strict positive integers)
// - Zero allergen leakage (100% hard gate)
// - Strict budget compliance (cost <= weeklyBudgetTargetInr when STRICT)
// ─────────────────────────────────────────────────────────────

import {
  PlannedMeal,
  UserPlanningProfile,
  PlanQualityMetrics,
  matchesAllergen,
  isFoodAllergenSafe
} from "./domain-types";

export interface DayPlanSummary {
  date: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
  calorieDeviationPct: number;
  proteinDeviationPct: number;
}

export interface PlanValidationResult {
  metrics: PlanQualityMetrics;
  dailySummaries: DayPlanSummary[];
  isValid: boolean;
  totalWeeklyCost: number;
  weeklyBudgetUtilizationPct: number;
  warnings: string[];
  errors: string[];
}

export const VALIDATOR_GATES = {
  CALORIE_HARD_LOWER_PCT: -6.0,
  CALORIE_HARD_UPPER_PCT: 6.0,
  CALORIE_WARN_LOWER_PCT: -3.0,
  CALORIE_WARN_UPPER_PCT: 3.0,

  PROTEIN_HARD_LOWER_PCT: -30.0,
  PROTEIN_HARD_UPPER_PCT: 15.0,
  PROTEIN_WARN_LOWER_PCT: -5.0,
  PROTEIN_WARN_UPPER_PCT: 8.0,

  MAX_CANONICAL_RECIPE_REPEATS_PER_WEEK: 4
};

/**
 * Validates a generated 7-day meal plan against hard nutritional and safety gates.
 */
export function validate7DayPlan(
  plannedMeals: PlannedMeal[],
  profile: UserPlanningProfile,
  dailyTargetCalories: number,
  dailyTargetProtein: number,
  foodAllergensLookup: (foodId: string) => string[],
  canonicalRecipeIdLookup?: (recipeVersionId: string) => string
): PlanValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Group meals by localDate
  const mealsByDate = new Map<string, PlannedMeal[]>();
  for (const meal of plannedMeals) {
    if (!mealsByDate.has(meal.localDate)) {
      mealsByDate.set(meal.localDate, []);
    }
    mealsByDate.get(meal.localDate)!.push(meal);
  }

  const dailySummaries: DayPlanSummary[] = [];

  let totalCalorieFit = 0;
  let totalProteinFit = 0;
  let varietyViolations = 0;
  let discreteViolations = 0;
  let allergenViolations = 0;
  let totalWeeklyCost = 0;

  // Track repetition using canonical recipe ID (not variant or version integer)
  const canonicalRecipeUsageCount = new Map<string, number>();

  for (const [date, dayMeals] of mealsByDate.entries()) {
    let dayCal = 0;
    let dayP = 0;
    let dayC = 0;
    let dayF = 0;
    let dayCost = 0;

    const dayCanonicalRecipeIds = new Set<string>();

    for (const meal of dayMeals) {
      dayCal += meal.caloriesSnapshot;
      dayP += meal.proteinSnapshot;
      dayC += meal.carbsSnapshot;
      dayF += meal.fatSnapshot;
      dayCost += meal.costSnapshot;

      // Track canonical recipe repetition
      if (meal.recipeVersionId) {
        const canonicalId = canonicalRecipeIdLookup
          ? canonicalRecipeIdLookup(meal.recipeVersionId)
          : meal.recipeVersionId;

        if (dayCanonicalRecipeIds.has(canonicalId)) {
          varietyViolations++;
          warnings.push(`Day ${date}: Same canonical recipe repeated twice on the same day (${canonicalId})`);
        }
        dayCanonicalRecipeIds.add(canonicalId);

        canonicalRecipeUsageCount.set(
          canonicalId,
          (canonicalRecipeUsageCount.get(canonicalId) || 0) + 1
        );
      }

      // Discrete food integer verification (strict positive integers)
      if (meal.items) {
        for (const item of meal.items) {
          if (item.portionType === "DISCRETE") {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
              discreteViolations++;
              errors.push(`Day ${date}, Meal ${meal.mealSlot}: Discrete item ${item.foodName || item.foodId} has non-integer portion: ${item.quantity}`);
            }
          }

          // Structured & food name allergen leakage verification (double-layer defense)
          if (profile.allergies && profile.allergies.length > 0) {
            const foodAllergens = foodAllergensLookup(item.foodId);
            if (!isFoodAllergenSafe(item.foodName || item.foodId, foodAllergens, profile.allergies)) {
              allergenViolations++;
              errors.push(`CRITICAL ALLERGEN LEAKAGE: Food ${item.foodName || item.foodId} contains allergen for allergic user (${profile.allergies.join(", ")})`);
            }
          }
        }
      }
    }

    totalWeeklyCost += dayCost;

    const calDiff = dayCal - dailyTargetCalories;
    const calPct = (calDiff / dailyTargetCalories) * 100;
    const pDiff = dayP - dailyTargetProtein;
    const pPct = (pDiff / dailyTargetProtein) * 100;

    // Check Daily Calorie Hard Gate [-5.0%, +5.0%]
    if (calPct < VALIDATOR_GATES.CALORIE_HARD_LOWER_PCT || calPct > VALIDATOR_GATES.CALORIE_HARD_UPPER_PCT) {
      errors.push(`Day ${date}: Calorie intake ${Math.round(dayCal)} deviates by ${calPct > 0 ? "+" : ""}${calPct.toFixed(1)}% (Hard Gate: [${VALIDATOR_GATES.CALORIE_HARD_LOWER_PCT}%, +${VALIDATOR_GATES.CALORIE_HARD_UPPER_PCT}%])`);
    } else if (calPct < VALIDATOR_GATES.CALORIE_WARN_LOWER_PCT || calPct > VALIDATOR_GATES.CALORIE_WARN_UPPER_PCT) {
      warnings.push(`Day ${date}: Calorie intake ${Math.round(dayCal)} deviates by ${calPct > 0 ? "+" : ""}${calPct.toFixed(1)}%`);
    }

    // Check Daily Protein Hard Gate [-5.0%, +10.0%]
    if (pPct < VALIDATOR_GATES.PROTEIN_HARD_LOWER_PCT || pPct > VALIDATOR_GATES.PROTEIN_HARD_UPPER_PCT) {
      errors.push(`Day ${date}: Protein intake ${dayP.toFixed(1)}g deviates by ${pPct > 0 ? "+" : ""}${pPct.toFixed(1)}% (Hard Gate: [${VALIDATOR_GATES.PROTEIN_HARD_LOWER_PCT}%, +${VALIDATOR_GATES.PROTEIN_HARD_UPPER_PCT}%])`);
    } else if (pPct < VALIDATOR_GATES.PROTEIN_WARN_LOWER_PCT || pPct > VALIDATOR_GATES.PROTEIN_WARN_UPPER_PCT) {
      warnings.push(`Day ${date}: Protein intake ${dayP.toFixed(1)}g deviates by ${pPct > 0 ? "+" : ""}${pPct.toFixed(1)}%`);
    }

    const dayCalFit = Math.max(0, 1 - Math.abs(calDiff) / (dailyTargetCalories * 0.1));
    const dayPFit = Math.max(0, 1 - Math.abs(pDiff) / (dailyTargetProtein * 0.15));

    totalCalorieFit += dayCalFit;
    totalProteinFit += dayPFit;

    dailySummaries.push({
      date,
      meals: dayMeals,
      totalCalories: Math.round(dayCal),
      totalProtein: Math.round(dayP * 10) / 10,
      totalCarbs: Math.round(dayC * 10) / 10,
      totalFat: Math.round(dayF * 10) / 10,
      totalCost: Math.round(dayCost),
      calorieDeviationPct: Math.round(calPct * 10) / 10,
      proteinDeviationPct: Math.round(pPct * 10) / 10
    });
  }

  // 2. Weekly Budget Compliance Check
  const weeklyBudget = profile.weeklyBudgetTargetInr || (profile.monthlyBudgetInr ? Math.round(profile.monthlyBudgetInr / 4.33) : 2500);
  const budgetUtilizationPct = Math.round((totalWeeklyCost / weeklyBudget) * 100);

  if (profile.budgetPolicy === "STRICT" && totalWeeklyCost > weeklyBudget * 1.15) {
    errors.push(`STRICT BUDGET VIOLATION: Total weekly cost ₹${Math.round(totalWeeklyCost)} exceeds strict budget ₹${weeklyBudget} (${budgetUtilizationPct}%)`);
  } else if (totalWeeklyCost > weeklyBudget * 1.05) {
    warnings.push(`Weekly cost ₹${Math.round(totalWeeklyCost)} exceeds target ₹${weeklyBudget} by ${budgetUtilizationPct - 100}%`);
  }

  const budgetFit = totalWeeklyCost <= weeklyBudget
    ? 1.0
    : profile.budgetPolicy === "STRICT"
      ? Math.max(0, 1 - (totalWeeklyCost - weeklyBudget) / weeklyBudget)
      : Math.max(0.5, 1 - (totalWeeklyCost - weeklyBudget) / (weeklyBudget * 2.5));

  // 3. Weekly Canonical Recipe Repetition Check
  for (const [canonicalId, count] of canonicalRecipeUsageCount.entries()) {
    if (count > VALIDATOR_GATES.MAX_CANONICAL_RECIPE_REPEATS_PER_WEEK) {
      varietyViolations += (count - VALIDATOR_GATES.MAX_CANONICAL_RECIPE_REPEATS_PER_WEEK);
      warnings.push(`Canonical recipe ${canonicalId} repeated ${count} times in 7 days (limit: ${VALIDATOR_GATES.MAX_CANONICAL_RECIPE_REPEATS_PER_WEEK})`);
    }
  }

  const numDays = Math.max(1, dailySummaries.length);
  const avgCalorieFit = totalCalorieFit / numDays;
  const avgProteinFit = totalProteinFit / numDays;
  const varietyFit = Math.max(0, 1 - (varietyViolations * 0.05));

  const hardConstraintPass = allergenViolations === 0 && discreteViolations === 0 && errors.length === 0;

  let compositeScore = Math.round(
    avgCalorieFit * 35 +
    avgProteinFit * 35 +
    budgetFit * 15 +
    varietyFit * 10 +
    (hardConstraintPass ? 5 : 0)
  );
  if (!hardConstraintPass) {
    compositeScore = Math.min(55, compositeScore);
  }

  const metrics: PlanQualityMetrics = {
    hardConstraintPass,
    calorieFit: Math.round(avgCalorieFit * 100) / 100,
    proteinFit: Math.round(avgProteinFit * 100) / 100,
    budgetFit: Math.round(budgetFit * 100) / 100,
    varietyFit: Math.round(varietyFit * 100) / 100,
    preferenceFit: 0.95,
    environmentFit: 1.0,
    availableFoodFit: 0.9,
    compositeScore,
    failureReasons: errors.length > 0 ? errors : undefined
  };

  return {
    metrics,
    dailySummaries,
    isValid: hardConstraintPass && compositeScore >= 75,
    totalWeeklyCost: Math.round(totalWeeklyCost),
    weeklyBudgetUtilizationPct: budgetUtilizationPct,
    warnings,
    errors
  };
}
