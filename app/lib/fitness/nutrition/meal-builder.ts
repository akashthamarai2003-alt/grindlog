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
  AUTHENTIC_INDIAN_RECIPES,
  AuthenticMealRecipe,
  getCoreMealLabel,
  getPrepInstruction,
  getMealTime,
  getEnvironmentLabel,
  DEFAULT_MEAL_STRUCTURE,
  getCompatibleDietTypes,
  parseRestrictions,
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

function findMatchingFood(name: string, allFoods: FoodItem[]): FoodItem | undefined {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    allFoods.find((f) => f.name.toLowerCase().replace(/[^a-z0-9]/g, "") === norm) ||
    allFoods.find((f) => {
      const fn = f.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return fn.includes(norm) || norm.includes(fn);
    })
  );
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

  const rawDiet = profile.food_type || profile.diet_preference || "Vegetarian";
  const compatibleDiets = getCompatibleDietTypes(rawDiet);

  const allergies = parseRestrictions(profile.food_allergies);
  const disliked = parseRestrictions(profile.foods_disliked);
  const avoided = parseRestrictions(profile.foods_avoided);
  const blockedTerms = [...allergies, ...disliked, ...avoided];

  const isFoodSafe = (name: string): boolean => {
    if (blockedTerms.length === 0) return true;
    const lower = name.toLowerCase();
    return !blockedTerms.some((term) => term && (lower.includes(term) || term.includes(lower)));
  };

  let lastUsedRecipeId = "";

  for (const slot of slots) {
    const isCoreMeal = CORE_MEAL_TYPES.includes(slot.type);
    const isProvidedMealSlot = isProvidedEnv && isCoreMeal;
    const slotTargetCalories = Math.round(slot.calorieTarget);

    const items: MealFoodItem[] = [];

    if (isProvidedMealSlot) {
      // PG / Hostel / Home provided core meal + authentic protein add-on
      const coreCalories = Math.min(320, Math.round(slotTargetCalories * 0.65));
      const coreProtein = 10;
      const coreCarbs = Math.round((coreCalories * 0.55) / 4);
      const coreFat = Math.round((coreCalories * 0.25) / 9);

      items.push({
        food: {
          id: `provided-${slot.type}`,
          name: getCoreMealLabel(env),
          category: "Core Meal",
          serving_size: "1 meal",
          calories: coreCalories,
          protein: coreProtein,
          carbs: coreCarbs,
          fat: coreFat,
          estimated_cost: 0,
          diet_type: "veg",
          is_pg_friendly: true,
          allergens: [],
        },
        servings: 1,
        totalCalories: coreCalories,
        totalProtein: coreProtein,
        totalCarbs: coreCarbs,
        totalFat: coreFat,
        totalCost: 0,
        isProvidedMeal: true,
        isAddOn: false,
      });

      // Gap to fill with PG-friendly add-on
      const remainingCal = Math.max(0, slotTargetCalories - coreCalories);
      if (remainingCal > 0) {
        let addOnFood: FoodItem | undefined = foods.proteinSources.find(
          (f) => f.is_pg_friendly && isFoodSafe(f.name)
        );
        if (!addOnFood) {
          addOnFood = foods.all.find((f) => isFoodSafe(f.name)) || foods.all[0];
        }

        if (addOnFood) {
          let rawServings = remainingCal / (addOnFood.calories || 1);
          let servings: number;
          if (addOnFood.serving_size.includes("piece") || addOnFood.serving_size.includes("large")) {
            servings = Math.max(0.5, Math.round(rawServings * 2) / 2);
          } else {
            servings = Math.max(0.2, Number(rawServings.toFixed(2)));
          }

          const addOnCalories = Math.round(addOnFood.calories * servings);
          const totalSlotCals = coreCalories + addOnCalories;
          const delta = slotTargetCalories - totalSlotCals;
          if (Math.abs(delta) > 0 && items.length > 0) {
            items[0].totalCalories += delta;
            items[0].food.calories += delta;
          }

          items.push({
            food: addOnFood,
            servings,
            totalCalories: addOnCalories,
            totalProtein: Number((addOnFood.protein * servings).toFixed(1)),
            totalCarbs: Number((addOnFood.carbs * servings).toFixed(1)),
            totalFat: Number((addOnFood.fat * servings).toFixed(1)),
            totalCost: Number((addOnFood.estimated_cost * servings).toFixed(1)),
            isProvidedMeal: false,
            isAddOn: true,
          });
        }
      }
    } else {
      // Regular / Self-cook authentic Indian recipe
      let candidateRecipes = AUTHENTIC_INDIAN_RECIPES.filter((r) => {
        if (r.type !== slot.type) return false;
        if (!r.dietTypes.some((d) => compatibleDiets.includes(d))) return false;
        return r.items.every((it) => isFoodSafe(it.name));
      });

      if (candidateRecipes.length === 0) {
        candidateRecipes = AUTHENTIC_INDIAN_RECIPES.filter((r) => r.type === slot.type);
      }

      candidateRecipes.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (a.id === lastUsedRecipeId) scoreA -= 5;
        if (b.id === lastUsedRecipeId) scoreB -= 5;

        for (const it of a.items) {
          if (foods.preferred.some((p) => p.name.toLowerCase().includes(it.name.toLowerCase()))) {
            scoreA += 3;
          }
        }
        for (const it of b.items) {
          if (foods.preferred.some((p) => p.name.toLowerCase().includes(it.name.toLowerCase()))) {
            scoreB += 3;
          }
        }
        return scoreB - scoreA;
      });

      const chosenRecipe: AuthenticMealRecipe = candidateRecipes[0] || AUTHENTIC_INDIAN_RECIPES[0];
      lastUsedRecipeId = chosenRecipe.id;

      const resolvedItems = chosenRecipe.items.map((it) => {
        const found = findMatchingFood(it.name, foods.all);
        const foodItem: FoodItem = found || {
          id: `virtual-${it.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
          name: it.name,
          category: "General",
          serving_size: it.servingLabel,
          calories: 150,
          protein: 8,
          carbs: 20,
          fat: 4,
          estimated_cost: 20,
          diet_type: "veg",
          is_pg_friendly: true,
          allergens: [],
        };
        return { ...it, food: foodItem };
      });

      const baseRecipeCalories = resolvedItems.reduce(
        (sum, it) => sum + it.food.calories * it.defaultServing,
        0
      );

      const scaleMultiplier = slotTargetCalories / (baseRecipeCalories || 1);

      for (const it of resolvedItems) {
        let rawServings = it.defaultServing * scaleMultiplier;
        let finalServings: number;

        if (it.servingLabel.includes("piece") || it.servingLabel.includes("medium") || it.servingLabel.includes("large")) {
          finalServings = Math.max(0.5, Math.round(rawServings * 2) / 2);
        } else {
          finalServings = Math.max(0.2, Number(rawServings.toFixed(2)));
        }

        items.push({
          food: it.food,
          servings: finalServings,
          totalCalories: Math.round(it.food.calories * finalServings),
          totalProtein: Number((it.food.protein * finalServings).toFixed(1)),
          totalCarbs: Number((it.food.carbs * finalServings).toFixed(1)),
          totalFat: Number((it.food.fat * finalServings).toFixed(1)),
          totalCost: Number((it.food.estimated_cost * finalServings).toFixed(1)),
          isProvidedMeal: false,
          isAddOn: false,
        });
      }

      // Fine-tune adjustment: balance total calories to within ±5 kcal of slotTargetCalories
      const currentCal = items.reduce((s, i) => s + i.totalCalories, 0);
      const diff = slotTargetCalories - currentCal;
      if (Math.abs(diff) > 5 && items.length > 0) {
        const adjustItem = items.find((i) => i.food.category === "Staple" || i.food.category === "Protein") || items[0];
        if (adjustItem && adjustItem.food.calories > 0) {
          const deltaServings = diff / adjustItem.food.calories;
          adjustItem.servings = Math.max(0.25, Number((adjustItem.servings + deltaServings).toFixed(2)));
          adjustItem.totalCalories = Math.round(adjustItem.food.calories * adjustItem.servings);
          adjustItem.totalProtein = Number((adjustItem.food.protein * adjustItem.servings).toFixed(1));
          adjustItem.totalCarbs = Number((adjustItem.food.carbs * adjustItem.servings).toFixed(1));
          adjustItem.totalFat = Number((adjustItem.food.fat * adjustItem.servings).toFixed(1));
          adjustItem.totalCost = Number((adjustItem.food.estimated_cost * adjustItem.servings).toFixed(1));
        }
      }
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
      totalProtein: Number(mealTotalProtein.toFixed(1)),
      totalCarbs: Number(mealTotalCarbs.toFixed(1)),
      totalFat: Number(mealTotalFat.toFixed(1)),
      totalCost: Math.round(mealTotalCost),
      prepInstructions: getPrepInstruction(env, slot.type),
      sourceLabel: isProvidedMealSlot ? getEnvironmentLabel(env) : "You prepare",
    });
  }

  return assembled;
}
