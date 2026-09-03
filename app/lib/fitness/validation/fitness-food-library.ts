import { GeneratedPlanData } from "@/lib/fitness/ai/schemas";

export type FitnessFoodLibraryItem = {
  name?: string | null;
  serving_size?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
};

function normaliseFoodName(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function foodNameAliases(value: unknown): string[] {
  const name = normaliseFoodName(value);
  const aliases = [name];

  if (/soy|soya/.test(name) && /chunk/.test(name)) aliases.push("soy chunks cooked");
  if (/chickpea|chana/.test(name)) aliases.push("chickpeas chana masala");
  if (/kidney bean|rajma/.test(name)) aliases.push("rajma kidney beans");
  if (/peanut/.test(name)) aliases.push("roasted peanuts");
  if (/oat/.test(name)) aliases.push("oats cooked");
  if (/mixed vegetable/.test(name)) aliases.push("mixed vegetables");
  if (name === "banana" || name === "apple") aliases.push(name);

  return [...new Set(aliases)];
}

function findLibraryFood(
  itemName: unknown,
  foodLibrary: FitnessFoodLibraryItem[],
): FitnessFoodLibraryItem | null {
  const itemNames = foodNameAliases(itemName);
  const exact = foodLibrary.find((food) => {
    const foodNames = foodNameAliases(food.name);
    return itemNames.some((item) => foodNames.includes(item));
  });
  if (exact) return exact;

  // Permit a safe subset match for names such as "Banana (medium)" while
  // avoiding fuzzy matches between unrelated foods.
  const itemNameNormalised = normaliseFoodName(itemName);
  if (!itemNameNormalised) return null;
  return foodLibrary.find((food) => {
    const foodName = normaliseFoodName(food.name);
    return foodName && (foodName.includes(itemNameNormalised) || itemNameNormalised.includes(foodName));
  }) || null;
}

function finiteNonNegative(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

/**
 * Attach canonical nutrition facts to generated grocery items. Luna chooses
 * the item, but never becomes the source of truth for its macros.
 */
export function enrichPlanWithFoodLibrary(
  plan: GeneratedPlanData,
  foodLibrary: FitnessFoodLibraryItem[],
): GeneratedPlanData {
  if (!plan.nutrition || !Array.isArray(plan.nutrition.grocery_list) || foodLibrary.length === 0) {
    return plan;
  }

  const grocery_list = plan.nutrition.grocery_list.map((item) => {
    const food = findLibraryFood(item.name, foodLibrary);
    if (!food) return item;

    const enriched = { ...item } as typeof item & {
      protein_grams_per_serving?: number;
      carbs_grams_per_serving?: number;
      fat_grams_per_serving?: number;
      calories_per_serving?: number;
      food_serving_size?: string;
      nutrition_source?: string;
    };
    const protein = finiteNonNegative(food.protein);
    const carbs = finiteNonNegative(food.carbs);
    const fat = finiteNonNegative(food.fat);
    const calories = finiteNonNegative(food.calories);
    if (protein !== undefined) enriched.protein_grams_per_serving = protein;
    if (carbs !== undefined) enriched.carbs_grams_per_serving = carbs;
    if (fat !== undefined) enriched.fat_grams_per_serving = fat;
    if (calories !== undefined) enriched.calories_per_serving = calories;
    if (typeof food.serving_size === "string" && food.serving_size.trim()) {
      enriched.food_serving_size = food.serving_size.trim();
    }
    if (protein !== undefined || carbs !== undefined || fat !== undefined || calories !== undefined) {
      enriched.nutrition_source = "Verified food library";
    }
    return enriched;
  });

  return { ...plan, nutrition: { ...plan.nutrition, grocery_list } };
}
