import {
  GeneratedNutritionData,
} from "./schemas";
import { getPlanNutritionTargets } from "../validation/fitness-plan-profile";
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from "../nutrition/nutrition-engine";

export function getProfileNutritionContext(profile: any, targets: ReturnType<typeof getPlanNutritionTargets>) {
  return {
    goal: profile.goal || "Not specified",
    target_physique: profile.target_physique || "Not specified",
    age: profile.age ?? null,
    gender: profile.gender || "Not specified",
    weight_kg: profile.weight ?? null,
    target_weight_kg: profile.target_weight ?? null,
    height_cm: profile.height ?? null,
    food_type: profile.food_type || profile.diet_preference || "Balanced",
    food_environment: profile.food_environment || "Home",
    meals_per_day: profile.meals_per_day || "Not specified",
    nutrition_budget: profile.nutrition_budget || "Not specified",
    available_foods: Array.isArray(profile.available_foods) ? profile.available_foods : [],
    allergies: profile.food_allergies || profile.allergies || "None",
    disliked_foods: [profile.foods_disliked, profile.foods_avoided].filter(Boolean),
    routine: {
      wake_time: profile.wake_time || null,
      workout_time: profile.workout_time || profile.preferred_training_time || null,
      sleep_time: profile.sleep_time || null,
    },
    deterministic_targets: {
      calories: targets.calories,
      protein_grams: targets.protein,
      carbs_grams: targets.carbs,
      fat_grams: targets.fat,
    },
  };
}

export async function generateProNutritionLayer({
  profile,
}: {
  profile: any;
  existingWorkouts?: Array<{ title: string; workout_date?: string; duration_minutes?: number }>;
  foodCatalog?: any[];
}): Promise<GeneratedNutritionData> {
  // 100% Deterministic Nutrition Generation — No LLM / AI hallucination
  const nutritionPlan = await generateDeterministicNutritionPlan(profile);
  return convertToAIPlanFormat(nutritionPlan);
}
