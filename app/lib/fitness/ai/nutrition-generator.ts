import { generateAIResponseJSON as generateGroqResponseJSON } from "@/lib/services/groq/client";
import {
  GeneratedNutritionSchema,
  GeneratedNutritionData,
} from "./schemas";
import { getPlanNutritionTargets } from "../validation/fitness-plan-profile";
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from "../nutrition/nutrition-engine";
import { buildHybridNutritionPrompt, mergeHybridNutrition } from "../nutrition/hybrid-merger";

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

  const userPrompt = `Create the Pro nutrition and monthly grocery layer for this user's workout plan using Groq AI.

Saved profile (source of truth):
${JSON.stringify(profileContext, null, 2)}

Existing workout schedule (DO NOT change it):
${JSON.stringify(workoutContext, null, 2)}

Compatible food library (use these names and nutrition facts where possible):
${JSON.stringify(foodCatalog || [], null, 2)}

Return only the nutrition object. Keep the deterministic daily calorie and protein targets exactly as supplied. Generate the user's requested number of meals and a practical 30-day grocery list.
- 100% NATURAL WHOLE FOODS MANDATE: Prescribe 100% natural, whole foods ONLY! Absolutely NO whey protein, plant protein powder, casein, or artificial supplements. All protein must come from whole, natural food sources. In guidance, explicitly state that this plan is 100% whole food based.
- Prioritise the user's preferred available_foods, but proactively bridge the protein target using compatible natural staples (Tofu, Soya chunks, Soy milk, Peanut butter, Paneer, Curd, Eggs, Chicken).
- Non-Vegetarian: Eggs, chicken breast, fish, and dairy are fully encouraged.
- Eggetarian: Eggs, egg whites, and dairy are encouraged. No meat or fish.
- Vegetarian: Paneer, curd, low-fat paneer, Greek yogurt, soya chunks, lentils. No meat, fish, or eggs.
- Vegan: 100% plant-based only. Use tofu, soya chunks, soy milk, natural peanut butter, nuts, seeds, legumes. NEVER include dairy, eggs, whey, or meat.
- For PG, Hostel, Home, or Office/Canteen: Pair EVERY core meal (Breakfast, Lunch, Dinner) with a concrete, budget-funded, natural high-protein add-on item so the user actually hits their daily protein target. Give no-cook or kettle-friendly hostel instructions.
- REAL-WORLD 30-DAY GROCERY ADD-ONS:
  * NEVER include cooked curries, sabzis, gravies, chaats, or restaurant preparations in grocery_list (e.g. no "Chana Masala", "Chole", "Kala Chana Curry", "Chana Chaat"). Groceries must be raw, shelf-stable, packaged products bought from a store (Blinkit/Amazon/Kirana).
  * Valid retail packaging units ONLY: "kg", "grams", "liters", "packs", "jars", "cartons", "packets", or "pieces". NEVER use "bowls", "plates", "servings", or "handfuls".
  * NEVER duplicate variations of the same base food (e.g. max 1 chana/chickpea item).
  * For budgets ₹2,000–5,000+, include high-value natural shelf-stable protein anchors: Tofu / Paneer / Eggs / Chicken, Natural peanut butter jar (1kg), Soy/dairy milk cartons, Rolled oats, Soya chunks, Roasted chana, and Nuts/Seeds to reach 80–95% of monthly budget reference INR.
- For Lose Fat or Cut, mention limiting added sugar, sugary drinks, deep-fried foods, and frequent fast food; never demand zero sugar or zero oil.
- Use realistic INR prices and concise instructions.`;

  // Step A: Generate deterministic nutrition plan (60% Math Ground Truth)
  let deterministicNutrition = null;
  try {
    const nutritionPlan = await generateDeterministicNutritionPlan(profile);
    deterministicNutrition = convertToAIPlanFormat(nutritionPlan);
  } catch (nutritionErr) {
    console.warn("Deterministic nutrition generation failed in generateProNutritionLayer:", nutritionErr);
  }

  const hybridPrompt = deterministicNutrition ? buildHybridNutritionPrompt(deterministicNutrition) : "";
  const promptToSend = hybridPrompt ? `${userPrompt}\n\n${hybridPrompt}` : userPrompt;

  const systemPrompt = `You are Grindlog's elite Groq nutrition coach. Generate a safe, practical, 100% natural whole-food nutrition object that hits the user's protein target using realistic natural grocery add-ons and core meals with ZERO artificial protein powders or supplements. Strictly respect vegan/vegetarian/eggetarian boundaries and allergies. Pair PG/Hostel meals with budget-funded natural protein add-ons. Return JSON only with daily_calories, protein_grams, carbs_grams, fat_grams, meals_per_day, guidance, meals, and grocery_list. Keep all text concise. Output schema:
{
  "daily_calories": number,
  "protein_grams": number,
  "carbs_grams": number,
  "fat_grams": number,
  "meals_per_day": number,
  "guidance": string,
  "meals": [{ "meal_name": string, "time_of_day": string, "items": string[], "total_calories": number, "protein_grams": number, "prep_instructions": string }],
  "grocery_list": [{ "name": string, "monthly_quantity": number, "unit": string, "estimated_price": number, "category": string, "is_optional": boolean, "reason": string }]
}`;

  // Execute on Groq AI (qwen/qwen3.8-27b) — sub-second response, zero Luna AI tokens
  const aiResponse = await generateGroqResponseJSON<unknown>({
    systemPrompt,
    userPrompt: promptToSend,
    model: "primary",
    maxTokens: 3500,
    temperature: 0.2,
  });

  const parsedNutrition = GeneratedNutritionSchema.safeParse(aiResponse);
  if (!parsedNutrition.success) {
    throw new Error("Failed to parse the generated Groq nutrition plan.");
  }

  let finalNutrition = parsedNutrition.data;
  if (deterministicNutrition) {
    finalNutrition = mergeHybridNutrition(finalNutrition, deterministicNutrition);
  }

  return finalNutrition;
}
