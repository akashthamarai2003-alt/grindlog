import type {
  NutritionProfile,
  NutritionTargets,
  MealSlot,
  AssembledMeal,
  FoodItem,
  MealFoodItem,
  MealType,
} from "./types";
import {
  MEAL_STRUCTURES,
  PROVIDED_ENVIRONMENTS,
  CORE_MEAL_TYPES,
  PROVIDED_MEAL_PROTEIN_ESTIMATE,
  PROVIDED_MEAL_CALORIE_ESTIMATE,
  getCoreMealLabel,
  getPrepInstruction,
  getMealTime,
  getEnvironmentLabel,
  DEFAULT_MEAL_STRUCTURE,
} from "./constants";

export function buildMealSlots(
  profile: NutritionProfile,
  targets: NutritionTargets,
): MealSlot[] {
  const structure =
    MEAL_STRUCTURES[profile.meals_per_day || ""] || DEFAULT_MEAL_STRUCTURE;

  return structure.slots.map((slot) => ({
    name: slot.name,
    type: slot.type,
    timeLabel: getMealTime(slot.type, {
      wake: profile.wake_time,
      workout: profile.workout_time || profile.preferred_training_time,
      work: profile.work_time,
      sleep: profile.sleep_time,
    }),
    calorieTarget: targets.calories * slot.caloriePercent,
    proteinTarget: targets.protein_g * slot.caloriePercent,
    caloriePercent: slot.caloriePercent,
  }));
}

export function assembleMeals(
  slots: MealSlot[],
  foods: {
    proteinSources: FoodItem[];
    carbSources: FoodItem[];
    snackFoods: FoodItem[];
    preferred: FoodItem[];
    all: FoodItem[];
  },
  profile: NutritionProfile,
  targets: NutritionTargets,
): AssembledMeal[] {
  const assembled: AssembledMeal[] = [];
  const env = profile.food_environment || "Mixed";
  const isProvidedEnv = PROVIDED_ENVIRONMENTS.has(env);

  let lastMealFoods = new Set<string>();

  for (const slot of slots) {
    const isCoreMeal = CORE_MEAL_TYPES.includes(slot.type);
    const isProvidedMealSlot = isProvidedEnv && isCoreMeal;

    let remainingProtein = slot.proteinTarget;
    let remainingCalories = slot.calorieTarget;
    const items: MealFoodItem[] = [];
    const currentMealFoods = new Set<string>();

    const addItem = (food: FoodItem, servings: number, isAddOn: boolean) => {
      if (items.length >= 4) return;
      const roundedServings = Math.max(0.5, Math.round(servings * 2) / 2);

      items.push({
        food,
        servings: roundedServings,
        totalCalories: food.calories * roundedServings,
        totalProtein: food.protein * roundedServings,
        totalCarbs: food.carbs * roundedServings,
        totalFat: food.fat * roundedServings,
        totalCost: isAddOn ? food.estimated_cost * roundedServings : 0,
        isProvidedMeal: false,
        isAddOn,
      });

      remainingProtein -= food.protein * roundedServings;
      remainingCalories -= food.calories * roundedServings;
      currentMealFoods.add(food.id);
    };

    const fillProteinGap = (sources: FoodItem[], isAddOn: boolean) => {
      // 1. Try preferred sources first
      for (const food of sources) {
        if (remainingProtein <= 0 || items.length >= 4) break;
        if (!foods.preferred.find((p) => p.id === food.id)) continue;
        if (lastMealFoods.has(food.id) || currentMealFoods.has(food.id)) continue;

        const svP = Math.ceil(remainingProtein / (food.protein || 1));
        const svC = Math.floor(remainingCalories / (food.calories || 1));
        let servings = Math.min(svP, svC);
        servings = Math.max(servings, 0.5);

        addItem(food, servings, isAddOn);
      }

      // 2. Fill from all sources
      for (const food of sources) {
        if (remainingProtein <= 0 || items.length >= 4) break;
        if (lastMealFoods.has(food.id) || currentMealFoods.has(food.id)) continue;

        const svP = Math.ceil(remainingProtein / (food.protein || 1));
        const svC = Math.floor(remainingCalories / (food.calories || 1));
        let servings = Math.min(svP, svC);
        servings = Math.max(servings, 0.5);

        addItem(food, servings, isAddOn);
      }
    };

    const fillCalorieGap = (sources: FoodItem[], isAddOn: boolean) => {
      for (const food of sources) {
        if (remainingCalories <= 0 || items.length >= 4) break;
        if (lastMealFoods.has(food.id) || currentMealFoods.has(food.id)) continue;

        let servings = Math.floor(remainingCalories / (food.calories || 1));
        servings = Math.max(servings, 0.5);

        addItem(food, servings, isAddOn);
      }
    };

    if (isProvidedMealSlot) {
      // Add provided core meal
      items.push({
        food: {
          id: `provided-${slot.type}`,
          name: getCoreMealLabel(env),
          category: "Core Meal",
          serving_size: "1 meal",
          calories: PROVIDED_MEAL_CALORIE_ESTIMATE,
          protein: PROVIDED_MEAL_PROTEIN_ESTIMATE,
          carbs: 50,
          fat: 10,
          estimated_cost: 0,
          diet_type: "veg",
          is_pg_friendly: true,
          allergens: [],
        },
        servings: 1,
        totalCalories: PROVIDED_MEAL_CALORIE_ESTIMATE,
        totalProtein: PROVIDED_MEAL_PROTEIN_ESTIMATE,
        totalCarbs: 50,
        totalFat: 10,
        totalCost: 0,
        isProvidedMeal: true,
        isAddOn: false,
      });

      remainingProtein -= PROVIDED_MEAL_PROTEIN_ESTIMATE;
      remainingCalories -= PROVIDED_MEAL_CALORIE_ESTIMATE;

      // Fill gap with protein add-ons
      fillProteinGap(foods.proteinSources, true);
    } else {
      if (slot.type === "snack" || slot.type === "pre_workout") {
        fillProteinGap(foods.snackFoods, true);
        fillCalorieGap(foods.snackFoods, true);
      } else {
        fillProteinGap(foods.proteinSources, true);
        fillCalorieGap(foods.carbSources, true);
      }
    }

    // Ensure at least 1 item per meal if nothing added (fallback)
    if (items.length === 0 && foods.all.length > 0) {
      const fallback = foods.all[0];
      addItem(fallback, 1, true);
    }

    let mealTotalCalories = 0;
    let mealTotalProtein = 0;
    let mealTotalCarbs = 0;
    let mealTotalFat = 0;
    let mealTotalCost = 0;

    for (const item of items) {
      mealTotalCalories += item.totalCalories;
      mealTotalProtein += item.totalProtein;
      mealTotalCarbs += item.totalCarbs;
      mealTotalFat += item.totalFat;
      mealTotalCost += item.totalCost;
    }

    assembled.push({
      slot,
      items,
      totalCalories: mealTotalCalories,
      totalProtein: mealTotalProtein,
      totalCarbs: mealTotalCarbs,
      totalFat: mealTotalFat,
      totalCost: mealTotalCost,
      prepInstructions: getPrepInstruction(env, slot.type),
      sourceLabel: isProvidedMealSlot ? getEnvironmentLabel(env) : "You prepare",
    });

    lastMealFoods = currentMealFoods;
  }

  return assembled;
}
