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

Return only the nutrition object. Keep the deterministic daily calorie and protein targets exactly as supplied. Generate the user's requested number of meals and a practical 30-day grocery list.
- Prioritise the user's preferred available_foods, but proactively bridge the protein target using compatible staples (Protein powder, Tofu, Soya chunks, Soy milk, Paneer, Eggs, Chicken).
- Non-Vegetarian: Eggs, chicken breast, fish, and dairy are fully encouraged.
- Eggetarian: Eggs, egg whites, and dairy are encouraged. No meat or fish.
- Vegetarian: Paneer, curd, whey protein, soya chunks, lentils. No meat, fish, or eggs.
- Vegan: 100% plant-based only. Use plant protein powder, tofu, soya chunks, soy milk, peanut butter, nuts, legumes. NEVER include dairy, eggs, whey, or meat.
- For PG, Hostel, Home, or Office/Canteen: Pair EVERY core meal (Breakfast, Lunch, Dinner) with a concrete, budget-funded, high-protein add-on item so the user actually hits their daily protein target. Give no-cook or kettle-friendly hostel instructions.
- REAL-WORLD 30-DAY GROCERY ADD-ONS:
  * NEVER include cooked curries, sabzis, gravies, chaats, or restaurant preparations in grocery_list (e.g. no "Chana Masala", "Chole", "Kala Chana Curry", "Chana Chaat"). Groceries must be raw, shelf-stable, packaged products bought from a store (Blinkit/Amazon/Kirana).
  * Valid retail packaging units ONLY: "kg", "grams", "liters", "packs", "tubs", "jars", "cartons", "packets", or "pieces". NEVER use "bowls", "plates", "servings", or "handfuls".
  * NEVER duplicate variations of the same base food (e.g. max 1 chana/chickpea item).
  * For budgets ₹2,000–5,000+, include high-value shelf-stable protein anchors: Protein powder tub (1kg), Peanut butter jar (1kg), Soy/dairy milk cartons, Rolled oats, and Soya chunks to reach 80–95% of monthly budget reference INR.
- For Lose Fat or Cut, mention limiting added sugar, sugary drinks, deep-fried foods, and frequent fast food; never demand zero sugar or zero oil.
- Use realistic INR prices and concise instructions.`;

  const aiResponse = await generateOpenAIResponseJSON<unknown>({
    systemPrompt: `You are Grindlog's elite nutrition coach. Generate a safe, practical, high-protein nutrition object that hits the user's protein target using realistic grocery add-ons and core meals. Strictly respect vegan/vegetarian/eggetarian boundaries and allergies. Pair PG/Hostel meals with budget-funded protein add-ons. Return JSON only with daily_calories, protein_grams, carbs_grams, fat_grams, meals_per_day, guidance, meals, and grocery_list. Keep all text concise.`,
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
