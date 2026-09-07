import { generateOpenAIResponseJSON, FITNESS_PLAN_MODEL } from "@/lib/services/openai/client";
import {
  NUTRITION_JSON_SCHEMA,
  GeneratedNutritionSchema,
  GeneratedNutritionData,
} from "./schemas";
import { getPlanNutritionTargets } from "../validation/fitness-plan-profile";

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
  existingWorkouts,
  foodCatalog,
}: {
  profile: any;
  existingWorkouts: Array<{ title: string; workout_date?: string; duration_minutes?: number }>;
  foodCatalog?: any[];
}): Promise<GeneratedNutritionData> {
  const targets = getPlanNutritionTargets(profile);
  const profileContext = getProfileNutritionContext(profile, targets);
  const workoutContext = existingWorkouts.map((workout) => ({
    title: workout.title,
    workout_date: workout.workout_date,
    duration_minutes: workout.duration_minutes,
  }));

  const userPrompt = `Create the missing Pro nutrition layer for this user's already-saved workout plan.

Saved profile (source of truth):
${JSON.stringify(profileContext, null, 2)}

Existing workout schedule (DO NOT change it):
${JSON.stringify(workoutContext, null, 2)}

Compatible food library (use these names and nutrition facts where possible):
${JSON.stringify(foodCatalog || [], null, 2)}

Return only the nutrition object. Keep the deterministic daily calorie and protein targets exactly as supplied. Generate the user's requested number of meals and a practical 30-day grocery list. Respect diet, allergies, disliked foods, available foods, food environment, budget, and saved routine.
- Non-Vegetarian: Eggs, chicken, fish, and meat are fully allowed and encouraged.
- Eggetarian: Eggs and dairy are allowed, but do NOT suggest meat or fish.
- Vegetarian: Do NOT suggest any meat, fish, or eggs (use paneer, curd, soy chunks, lentils).
- Vegan: Do NOT suggest any dairy, eggs, whey protein, or meat (use tofu, soy, legumes).
- For PG, Hostel, Home, or Office/Canteen, label breakfast, lunch, and dinner as provided meals and price only the add-ons.
- For Lose Fat or Cut, mention limiting added sugar, sugary drinks, deep-fried foods, and frequent fast food; never demand zero sugar or zero oil.
- Use realistic INR prices and concise instructions.`;

  const aiResponse = await generateOpenAIResponseJSON<unknown>({
    systemPrompt: `You are Grindlog's cautious nutrition coach. Generate only a safe, practical nutrition object for an existing workout plan. Never change workouts. Follow the saved profile exactly. If non-vegetarian, eggs and chicken/meat are fully encouraged. For vegetarian, no meat or eggs. For vegan users, every meal and grocery item must be plant-based. Never include foods that conflict with allergies or restrictions. Return JSON only with daily_calories, protein_grams, carbs_grams, fat_grams, meals_per_day, guidance, meals, and grocery_list. Keep all text concise.`,
    userPrompt,
    model: FITNESS_PLAN_MODEL,
    maxTokens: 5500,
    minimumOutputTokens: 5500,
    reasoningEffort: "medium",
    promptCacheKey: "fitness-pro-nutrition-upgrade-v1",
    temperature: 0.2,
    jsonSchema: {
      name: "fitness_pro_nutrition",
      schema: NUTRITION_JSON_SCHEMA,
      description: "The missing Pro nutrition layer for an existing fitness plan.",
      strict: true,
    },
    verbosity: "low",
  });

  const parsedNutrition = GeneratedNutritionSchema.safeParse(aiResponse);
  if (!parsedNutrition.success) {
    throw new Error("Failed to parse the generated Pro nutrition plan.");
  }

  return parsedNutrition.data;
}
