import type {
  NutritionProfile,
  NutritionTargets,
  DeterministicNutritionPlan,
  MealSlot,
} from "./types";
import {
  GOAL_CONFIGS,
  DEFAULT_GOAL_CONFIG,
  ACTIVITY_MULTIPLIERS,
  DEFAULT_ACTIVITY_MULTIPLIER,
  MIN_CALORIES_FEMALE,
  MIN_CALORIES_MALE,
  MAX_CALORIES,
  parseBudget,
  calculateWaterTarget,
  generateGuidance,
  getEnvironmentLabel,
} from "./constants";
import { selectFoodsForProfile, rankFoodsByProteinEfficiency, filterByBudget, getAvailableFoodMatches, getProteinSources, getCarbSources, getSnackFoods } from "./food-selector";
import { buildMealSlots, assembleMeals } from "./meal-builder";
import { calculateGroceryList, optimizeBudget, getGrocerySummary } from "./grocery-calculator";

// ─────────────────────────────────────────────────────────
// Main Entry Point — Generates a complete nutrition plan
// with ZERO AI tokens. Pure code + database queries.
// ─────────────────────────────────────────────────────────

export async function generateDeterministicNutritionPlan(
  profile: NutritionProfile,
): Promise<DeterministicNutritionPlan> {
  // 1. Calculate macro targets
  const targets = calculateTargets(profile);

  // 2. Get compatible foods from database
  const allFoods = await selectFoodsForProfile(profile);
  const rankedFoods = rankFoodsByProteinEfficiency(allFoods);

  // 3. Parse budget and filter foods
  const budget = parseBudget(profile.nutrition_budget);
  const budgetFiltered = filterByBudget(rankedFoods, budget.tier);

  // 4. Split into preference groups
  const { preferred, others } = getAvailableFoodMatches(
    budgetFiltered,
    profile.available_foods || [],
  );

  // 5. Categorize foods
  const dietType = profile.food_type || profile.diet_preference || "Vegetarian";
  const proteinSources = getProteinSources(budgetFiltered, dietType);
  const carbSources = getCarbSources(budgetFiltered);
  const snackFoods = getSnackFoods(budgetFiltered);

  // 6. Build meal structure from profile
  const mealSlots = buildMealSlots(profile, targets);

  // 7. Assemble complete meals
  const meals = assembleMeals(
    mealSlots,
    { proteinSources, carbSources, snackFoods, preferred, all: budgetFiltered },
    profile,
    targets,
  );

  // 8. Calculate 30-day grocery list
  const env = profile.food_environment || "Home";
  const rawGrocery = calculateGroceryList(meals, budget, env);
  const optimizedGrocery = optimizeBudget(rawGrocery, budget);

  // 9. Compute totals
  const dailyCost = meals.reduce((sum, m) => sum + m.totalCost, 0);
  const monthlyCost = optimizedGrocery.reduce((sum, g) => sum + g.estimatedPrice, 0);
  const { budgetUtilization } = getGrocerySummary(optimizedGrocery, budget);

  // 10. Generate deterministic guidance
  const guidance = generateGuidance(
    profile.goal || "Maintain",
    dietType,
    env,
    targets.protein_g,
    targets.calories,
    budget.tier,
  );

  return {
    targets,
    meals,
    grocery: optimizedGrocery,
    dailyCost: Math.round(dailyCost),
    monthlyCost: Math.round(monthlyCost),
    budgetUtilization,
    budgetTier: budget.tier,
    guidance,
    environmentLabel: getEnvironmentLabel(env),
    naturalFoodsOnly: true,
  };
}

// ─────────────────────────────────────────────────────────
// Calorie & Macro Target Calculation
// ─────────────────────────────────────────────────────────

export function calculateTargets(profile: NutritionProfile): NutritionTargets {
  const bmr = calculateBMR(profile);
  const activityMultiplier =
    ACTIVITY_MULTIPLIERS[profile.activity_level || ""] || DEFAULT_ACTIVITY_MULTIPLIER;
  const tdee = Math.round(bmr * activityMultiplier);

  const goalConfig = GOAL_CONFIGS[profile.goal || ""] || DEFAULT_GOAL_CONFIG;
  let calories = tdee + goalConfig.calorieAdjustment;

  // Safety clamps
  const isFemale =
    profile.gender?.toLowerCase() === "female" ||
    profile.gender?.toLowerCase() === "other";
  const minCal = isFemale ? MIN_CALORIES_FEMALE : MIN_CALORIES_MALE;
  calories = Math.max(minCal, Math.min(MAX_CALORIES, calories));
  calories = Math.round(calories);

  // Protein (non-negotiable)
  const weightKg = profile.weight || 70;
  const proteinG = Math.round(weightKg * goalConfig.proteinMultiplier);
  const proteinCalories = proteinG * 4;

  // Remaining calories split between carbs and fat
  const remainingCalories = Math.max(0, calories - proteinCalories);
  const carbCalories = Math.round(remainingCalories * goalConfig.carbPercent);
  const fatCalories = Math.round(remainingCalories * goalConfig.fatPercent);

  const carbsG = Math.round(carbCalories / 4);
  const fatG = Math.round(fatCalories / 9);
  const fiberG = Math.round(calories / 100); // ~1g fiber per 100 calories

  const waterMl = calculateWaterTarget(
    weightKg,
    profile.activity_level || "Lightly active",
    profile.goal || "Maintain",
  );

  return {
    calories,
    protein_g: proteinG,
    carbs_g: carbsG,
    fat_g: fatG,
    fiber_g: fiberG,
    water_ml: waterMl,
  };
}

function calculateBMR(profile: NutritionProfile): number {
  // If baseline_calories already computed during onboarding, use it as BMR base
  if (profile.baseline_calories && profile.baseline_calories > 0) {
    // baseline_calories from onboarding is TDEE (already multiplied by activity)
    // We need to reverse-engineer BMR: BMR = baseline / activity_multiplier
    const activityMultiplier =
      ACTIVITY_MULTIPLIERS[profile.activity_level || ""] || DEFAULT_ACTIVITY_MULTIPLIER;
    return Math.round(profile.baseline_calories / activityMultiplier);
  }

  // Mifflin-St Jeor Formula
  const weight = profile.weight || 70;
  const height = profile.height || 170;
  const age = profile.age || 25;

  const isFemale =
    profile.gender?.toLowerCase() === "female" ||
    profile.gender?.toLowerCase() === "other";

  if (isFemale) {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

// ─────────────────────────────────────────────────────────
// Convert DeterministicNutritionPlan → AI plan format
// for compatibility with existing plan-setup page
// ─────────────────────────────────────────────────────────

export function convertToAIPlanFormat(plan: DeterministicNutritionPlan): {
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  meals_per_day: number;
  guidance: string;
  meals: Array<{
    meal_name: string;
    time_of_day: string;
    items: string[];
    total_calories: number | null;
    protein_grams: number | null;
    prep_instructions: string;
  }>;
  grocery_list: Array<{
    name: string;
    monthly_quantity: number;
    unit: string;
    estimated_price: number;
    category: string;
    is_optional: boolean;
    reason: string;
    protein_grams_per_serving?: number;
    carbs_grams_per_serving?: number;
    fat_grams_per_serving?: number;
    calories_per_serving?: number;
    food_serving_size?: string;
    nutrition_source?: string;
  }>;
} {
  return {
    daily_calories: plan.targets.calories,
    protein_grams: plan.targets.protein_g,
    carbs_grams: plan.targets.carbs_g,
    fat_grams: plan.targets.fat_g,
    meals_per_day: plan.meals.length,
    guidance: plan.guidance,
    meals: plan.meals.map((meal) => ({
      meal_name: meal.slot.name,
      time_of_day: meal.slot.timeLabel,
      items: meal.items.map((item) => {
        const servingLabel =
          item.servings === 1
            ? item.food.serving_size
            : `${item.servings}× ${item.food.serving_size}`;
        if (item.isProvidedMeal) {
          return item.food.name;
        }
        return `${item.food.name} - ${servingLabel}`;
      }),
      total_calories: Math.round(meal.totalCalories),
      protein_grams: Math.round(meal.totalProtein),
      prep_instructions: meal.prepInstructions,
    })),
    grocery_list: plan.grocery.map((g) => ({
      name: g.name,
      monthly_quantity: g.monthlyQuantity,
      unit: g.unit,
      estimated_price: g.estimatedPrice,
      category: g.category,
      is_optional: g.isOptional,
      reason: g.reason,
      protein_grams_per_serving: g.proteinPerServing,
      carbs_grams_per_serving: g.food.carbs,
      fat_grams_per_serving: g.food.fat,
      calories_per_serving: g.caloriesPerServing,
      food_serving_size: g.food.serving_size,
      nutrition_source: "GrindLog Verified Food Library (ICMR-NIN / USDA)",
    })),
  };
}
