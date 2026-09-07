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

  // Distinguish raw/dry soya chunks from cooked curry
  if (/soy|soya/.test(name) && /chunk/.test(name)) {
    if (!/raw|dry/i.test(name)) aliases.push("soya chunks curry cooked");
  }
  // Distinguish roasted chana snack from cooked chana curries
  if (/roasted\s+chana/i.test(name)) {
    aliases.push("roasted chana dry chickpeas");
  } else if (/kala\s+chana/i.test(name)) {
    aliases.push("kala chana curry");
  } else if (/chole|chana\s+masala/i.test(name)) {
    aliases.push("chole chana masala");
  } else if (/chana\s+chaat/i.test(name)) {
    aliases.push("chana chaat");
  } else if (/chickpea|chana/.test(name)) {
    aliases.push("chickpeas chana masala");
  }

  if (/kidney bean|rajma/.test(name)) aliases.push("rajma kidney beans");
  if (/peanut\s+butter/.test(name)) aliases.push("natural peanut butter");
  else if (/peanut/.test(name)) aliases.push("roasted peanuts");
  if (/oat/.test(name)) aliases.push("oats with milk", "masala oats");
  if (/mixed vegetable/.test(name)) aliases.push("mixed vegetable sabzi");
  if (name === "banana" || name === "apple") aliases.push(name);

  return [...new Set(aliases)];
}

function findLibraryFood(
  itemName: unknown,
  foodLibrary: FitnessFoodLibraryItem[],
): FitnessFoodLibraryItem | null {
  const itemNameNormalised = normaliseFoodName(itemName);
  if (!itemNameNormalised) return null;

  // 1. Direct exact normalized name match FIRST
  const directExact = foodLibrary.find(
    (food) => normaliseFoodName(food.name) === itemNameNormalised,
  );
  if (directExact) return directExact;

  // 2. Exact match ignoring parenthetical qualifiers e.g. "Natural Peanut Butter (1 kg jar)" -> "Natural Peanut Butter"
  const baseItemName = itemNameNormalised.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  if (baseItemName && baseItemName !== itemNameNormalised) {
    const baseMatch = foodLibrary.find(
      (food) => normaliseFoodName(food.name) === baseItemName,
    );
    if (baseMatch) return baseMatch;
  }

  // 3. Carefully guarded alias match
  const itemNames = foodNameAliases(itemName);
  const aliasMatch = foodLibrary.find((food) => {
    const foodNames = foodNameAliases(food.name);
    return itemNames.some((item) => foodNames.includes(item));
  });
  if (aliasMatch) return aliasMatch;

  // 4. Safe subset match
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

/**
 * Filters and compacts the food catalog strictly according to the user's onboarding
 * diet preference (Vegan, Vegetarian, Eggetarian, Non-Vegetarian), food allergies, and dislikes.
 * Also caps the catalog to the top ~65 most relevant items to keep model prompt tokens minimal
 * while ensuring 100% compliance with user onboarding details.
 */
export function filterFoodCatalogForProfile<T extends {
  name: string;
  diet_type?: string | null;
  allergens?: string[] | null;
  category?: string | null;
  is_pg_friendly?: boolean | null;
}>(
  catalog: T[],
  profile: Record<string, any>,
  maxItems = 65,
): T[] {
  if (!catalog || catalog.length === 0) return [];

  const rawDiet = String(profile?.food_type || profile?.diet_preference || "").trim().toLowerCase();

  // Extract allergies
  const rawAllergies: string[] = Array.isArray(profile?.food_allergies)
    ? profile.food_allergies
    : typeof profile?.food_allergies === "string"
    ? profile.food_allergies.split(",").map((s: string) => s.trim())
    : [];

  // Extract avoided or disliked foods
  const rawAvoided: string[] = [
    ...(Array.isArray(profile?.foods_avoided) ? profile.foods_avoided : typeof profile?.foods_avoided === "string" ? [profile.foods_avoided] : []),
    ...(Array.isArray(profile?.foods_disliked) ? profile.foods_disliked : typeof profile?.foods_disliked === "string" ? [profile.foods_disliked] : []),
  ];

  const blockedWords = [...rawAllergies, ...rawAvoided]
    .map((w) => String(w).toLowerCase().trim())
    .filter((w) => w.length > 2);

  const filtered = catalog.filter((food) => {
    const foodName = String(food.name || "").toLowerCase();
    const foodDiet = String(food.diet_type || "").toLowerCase();

    // 1. Strict Diet Compliance
    if (rawDiet === "vegan") {
      if (foodDiet !== "vegan") return false;
    } else if (rawDiet === "vegetarian" || rawDiet === "veg") {
      if (foodDiet !== "vegan" && foodDiet !== "veg") return false;
    } else if (rawDiet === "eggetarian") {
      if (foodDiet !== "vegan" && foodDiet !== "veg" && foodDiet !== "eggetarian") return false;
    }

    // 2. Strict Allergy & Avoidance Compliance
    if (blockedWords.some((word) => foodName.includes(word))) {
      return false;
    }
    if (Array.isArray(food.allergens)) {
      const hasAllergen = food.allergens.some((a) =>
        blockedWords.some((word) => String(a).toLowerCase().includes(word))
      );
      if (hasAllergen) return false;
    }

    return true;
  });

  const isPgOrHostel = ["pg", "hostel", "office/canteen"].includes(
    String(profile?.food_environment || "").trim().toLowerCase(),
  );

  // Score each food to guarantee high-protein staples and PG-friendly items are prioritized
  const scored = filtered.map((food) => {
    let score = 0;
    const protein = Number((food as any).protein) || 0;
    const calories = Number((food as any).calories) || 1;
    const name = String(food.name || "").toLowerCase();

    // High protein density
    score += (protein / calories) * 50;

    // High absolute protein content
    if (protein >= 20) score += 40;
    else if (protein >= 12) score += 25;
    else if (protein >= 6) score += 12;

    // Anchor supplements and primary protein staples
    if (/protein|tofu|soya|paneer|chicken|egg|fish|tuna|peanut butter|curd|chana|lentil|dal|oat|tempeh|seeds/i.test(name)) {
      score += 35;
    }

    // Boost PG-friendly items when user is in a PG or hostel
    if (isPgOrHostel && (food as any).is_pg_friendly) {
      score += 25;
    }

    return { food, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxItems).map((s) => s.food);
}

