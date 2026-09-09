import type { DeterministicNutritionPlan } from "./types";
import { convertToAIPlanFormat } from "./nutrition-engine";

export type AIPlanNutrition = ReturnType<typeof convertToAIPlanFormat>;

/**
 * Builds the AI prompt section incorporating the 60% deterministic mathematical
 * baseline as an immutable nutritional anchor, while giving the AI a clear 40%
 * mandate for Indian culinary creativity, PG living hacks, and empathetic coaching.
 */
export function buildHybridNutritionPrompt(det: AIPlanNutrition): string {
  const mealsList = det.meals
    .map(
      (m, i) =>
        `  Meal ${i + 1} (${m.meal_name} at ${m.time_of_day}): Target ~${m.total_calories} kcal, ~${m.protein_grams}g Protein. Base foods: ${m.items.join(" + ")}`
    )
    .join("\n");

  const groceryList = det.grocery_list
    .map(
      (g) =>
        `  * ${g.name}: ${g.monthly_quantity} ${g.unit} (₹${g.estimated_price}) — ${g.reason}`
    )
    .join("\n");

  return `
=== 60% MATHEMATICAL NUTRITION BASELINE (STRICT SCIENTIFIC GROUND TRUTH) ===
The user's nutrition plan has been pre-computed by our clinical algorithm with exact ICMR-NIN science, safe daily food caps, and strict budget optimization:
- Exact Daily Targets: ${det.daily_calories} kcal | ${det.protein_grams}g Protein | ${det.carbs_grams}g Carbs | ${det.fat_grams}g Fat | ${det.meals_per_day} meals
- Vetted Meal Slots & Base Foods:
${mealsList}
- Budget-Optimized 30-Day Grocery Add-on List (Strictly guaranteed within user budget):
${groceryList}

=== 40% AI CULINARY & COACHING MANDATE ===
Act as GrindLog's elite Indian sports nutritionist, culinary chef, and lifestyle mentor. Elevate this mathematically vetted plan into an exciting, practical culinary experience:
1. MEAL CREATIVITY & DISH NAMES: Keep the exact base foods and servings from the math baseline, but craft appetizing, realistic Indian meal dish names and combinations (e.g., instead of plain 'Boiled Egg', suggest '3 Boiled Eggs seasoned with roasted jeera & chaat masala + PG Mess Poha').
2. REAL-WORLD PREP HACKS: In meals[].prep_instructions, provide specific, clever PG/Hostel/Home cooking hacks (e.g., electric kettle egg boiling, hot water soaking for soya chunks to eliminate raw taste, microwave tips, local mess coordination).
3. FLAVOR & SEASONING ENHANCEMENT: Highlight zero-calorie spices, herbs, and condiments (lemon juice, chaat masala, black pepper, mint chutney, green chillies) that make the daily protein routine delicious.
4. SMART SHOPPING & KIRANA HACKS: In grocery_list[].reason, add practical buying hacks (e.g., buying 30-egg wholesale trays to save money, best value brands like Nutrela or Fortune).
5. PERSONALIZED ATHLETE GUIDANCE: In nutrition.guidance, write an inspiring, warm, and highly personalized coaching paragraph for the user that directly addresses their specific living environment, daily routine, and physique goal.
CRITICAL MANDATE:
- Maintain the exact numerical targets: daily_calories (${det.daily_calories}), protein_grams (${det.protein_grams}), carbs_grams (${det.carbs_grams}), fat_grams (${det.fat_grams}).
- Maintain the grocery items and pricing. The 60% math baseline is locked.`;
}

/**
 * Merges the 40% AI culinary creativity (dish names, items, prep instructions,
 * grocery shopping hacks, and personalized coaching guidance) with the 60%
 * deterministic mathematical baseline (exact calories, macros, portions, and budget limit).
 */
export function mergeHybridNutrition(
  aiNutrition: any,
  det: AIPlanNutrition
): AIPlanNutrition {
  if (!aiNutrition) return det;

  // 1. Merge meals: Lock exact calories & protein numbers from code,
  // while taking the AI's enhanced culinary dish names, items, and prep instructions
  const mergedMeals = det.meals.map((detMeal, idx) => {
    const aiMeal =
      aiNutrition?.meals?.[idx] ||
      (Array.isArray(aiNutrition?.meals)
        ? aiNutrition.meals.find(
            (m: any) =>
              m.meal_name &&
              detMeal.meal_name &&
              (m.meal_name.toLowerCase().includes(detMeal.meal_name.toLowerCase()) ||
                detMeal.meal_name.toLowerCase().includes(m.meal_name.toLowerCase()))
          )
        : undefined);

    const mealName =
      aiMeal?.meal_name && aiMeal.meal_name.length > 2
        ? aiMeal.meal_name
        : detMeal.meal_name;

    const items =
      Array.isArray(aiMeal?.items) && aiMeal.items.length > 0
        ? aiMeal.items
        : detMeal.items;

    const prepInstructions =
      aiMeal?.prep_instructions && aiMeal.prep_instructions.length > 15
        ? aiMeal.prep_instructions
        : detMeal.prep_instructions;

    return {
      meal_name: mealName,
      time_of_day: detMeal.time_of_day,
      items,
      total_calories: detMeal.total_calories, // 60% locked math
      protein_grams: detMeal.protein_grams,   // 60% locked math
      prep_instructions: prepInstructions,    // 40% AI culinary hack
    };
  });

  // 2. Merge grocery list: Lock exact packaging units, quantities, and price ceiling from code,
  // while incorporating AI kirana tips into the reason
  const mergedGrocery = det.grocery_list.map((detGrocery) => {
    const aiGrocery = Array.isArray(aiNutrition?.grocery_list)
      ? aiNutrition.grocery_list.find((g: any) => {
          if (!g?.name) return false;
          const detKey = detGrocery.name.toLowerCase().split(" ")[0];
          return g.name.toLowerCase().includes(detKey);
        })
      : undefined;

    let reason = detGrocery.reason;
    if (aiGrocery?.reason && aiGrocery.reason.length > 10 && !reason.includes(aiGrocery.reason)) {
      // If AI provided additional practical shopping hacks, append them nicely
      reason = `${detGrocery.reason} (Tip: ${aiGrocery.reason})`;
    }

    return {
      ...detGrocery,
      reason,
    };
  });

  // 3. Guidance: Prefer AI's personalized coaching note if available
  const guidance =
    aiNutrition?.guidance && aiNutrition.guidance.length > 30
      ? aiNutrition.guidance
      : det.guidance;

  return {
    daily_calories: det.daily_calories, // 60% locked math
    protein_grams: det.protein_grams,   // 60% locked math
    carbs_grams: det.carbs_grams,       // 60% locked math
    fat_grams: det.fat_grams,           // 60% locked math
    meals_per_day: det.meals_per_day,
    meals: mergedMeals,
    grocery_list: mergedGrocery,
    guidance,                           // 40% AI personalized coaching
  };
}
