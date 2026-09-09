import { createServerSupabase } from "@/lib/services/supabase/server";
import { createClient } from "@supabase/supabase-js";
import {
  getCompatibleDietTypes,
  parseRestrictions,
  PRIORITY_PROTEINS,
  isBannedFood,
} from "./constants";
import type { NutritionProfile, FoodItem, BudgetTier } from "./types";

/**
 * Fetches and filters foods from the database based on the user's profile.
 * Does NOT make AI calls — purely deterministic filtering.
 */
export async function selectFoodsForProfile(
  profile: NutritionProfile,
  customSupabase?: any
): Promise<FoodItem[]> {
  let supabase = customSupabase;
  if (!supabase) {
    try {
      supabase = await createServerSupabase();
    } catch {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      supabase = createClient(url, key);
    }
  }

  const { data, error } = await supabase
    .from("foods")
    .select(
      "id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens"
    )
    .eq("is_active", true);

  if (error || !data) {
    console.error("Error fetching foods:", error);
    return [];
  }

  let foods = data as FoodItem[];

  // 1. Filter by diet compatibility
  const allowedDietTypes = getCompatibleDietTypes(profile.food_type || "");
  foods = foods.filter((f) =>
    allowedDietTypes.includes(f.diet_type.toLowerCase())
  );

  // 2. Filter out banned foods (no supplements, whey, etc. — 100% natural)
  foods = foods.filter((f) => !isBannedFood(f.name));

  // 3. Filter out allergens
  const allergies = parseRestrictions(profile.food_allergies);
  if (allergies.length > 0) {
    foods = foods.filter((f) => {
      const foodName = f.name.toLowerCase();
      const foodAllergens = (f.allergens || []).map((a) => a.toLowerCase());
      const hasAllergy = allergies.some(
        (allergy) =>
          foodName.includes(allergy) ||
          foodAllergens.some((fa) => fa.includes(allergy))
      );
      return !hasAllergy;
    });
  }

  // 4. Filter out disliked foods
  const disliked = parseRestrictions(profile.foods_disliked);
  if (disliked.length > 0) {
    foods = foods.filter((f) => {
      const foodName = f.name.toLowerCase();
      return !disliked.some((d) => foodName.includes(d));
    });
  }

  // 5. Filter out avoided foods
  const avoided = parseRestrictions(profile.foods_avoided);
  if (avoided.length > 0) {
    foods = foods.filter((f) => {
      const foodName = f.name.toLowerCase();
      return !avoided.some((a) => foodName.includes(a));
    });
  }

  // 6. For PG/Hostel environments: prioritize is_pg_friendly = true foods
  // 7. Sort foods by protein-per-rupee (protein / estimated_cost) descending
  const isPgEnv =
    profile.food_environment === "PG" || profile.food_environment === "Hostel";

  foods.sort((a, b) => {
    if (isPgEnv) {
      if (a.is_pg_friendly && !b.is_pg_friendly) return -1;
      if (!a.is_pg_friendly && b.is_pg_friendly) return 1;
    }

    const aRatio = a.estimated_cost > 0 ? a.protein / a.estimated_cost : 0;
    const bRatio = b.estimated_cost > 0 ? b.protein / b.estimated_cost : 0;
    return bRatio - aRatio;
  });

  return foods;
}

/**
 * Sorts foods by protein / estimated_cost ratio descending.
 */
export function rankFoodsByProteinEfficiency(foods: FoodItem[]): FoodItem[] {
  return [...foods].sort((a, b) => {
    const aRatio = a.estimated_cost > 0 ? a.protein / a.estimated_cost : 0;
    const bRatio = b.estimated_cost > 0 ? b.protein / b.estimated_cost : 0;
    return bRatio - aRatio;
  });
}

/**
 * Filters out expensive foods based on budget tier.
 */
export function filterByBudget(
  foods: FoodItem[],
  budgetTier: BudgetTier
): FoodItem[] {
  if (budgetTier === "low") {
    return foods.filter((f) => f.estimated_cost <= 80);
  }
  if (budgetTier === "mid") {
    return foods.filter((f) => f.estimated_cost <= 120);
  }
  return foods;
}

/**
 * Splits foods into those matching user's preferred available foods and the rest.
 */
export function getAvailableFoodMatches(
  foods: FoodItem[],
  availableFoods: string[]
): { preferred: FoodItem[]; others: FoodItem[] } {
  if (!availableFoods || availableFoods.length === 0) {
    return { preferred: [], others: foods };
  }

  const normalizedAvailable = availableFoods.map((af) =>
    af.toLowerCase().trim()
  );
  const preferred: FoodItem[] = [];
  const others: FoodItem[] = [];

  for (const food of foods) {
    const foodName = food.name.toLowerCase();
    const isPreferred = normalizedAvailable.some((af) =>
      foodName.includes(af)
    );

    if (isPreferred) {
      preferred.push(food);
    } else {
      others.push(food);
    }
  }

  return { preferred, others };
}

/**
 * Returns foods with > 10g protein per serving, sorted by priority for the diet type.
 */
export function getProteinSources(
  foods: FoodItem[],
  dietType: string
): FoodItem[] {
  const normalizedDiet = dietType.toLowerCase();
  let dietKey = "Vegetarian";
  
  if (normalizedDiet.includes("non-veg") || normalizedDiet.includes("non veg") || normalizedDiet === "non-vegetarian") {
    dietKey = "Non-Vegetarian";
  } else if (normalizedDiet.includes("eggetarian")) {
    dietKey = "Eggetarian";
  } else if (normalizedDiet.includes("vegan")) {
    dietKey = "Vegan";
  }

  const priorityList = PRIORITY_PROTEINS[dietKey] || [];

  // Protein sources: foods with >= 6.0g protein OR foods explicitly in PRIORITY_PROTEINS
  const highProtein = foods.filter((f) => {
    if (f.protein >= 6) return true;
    const foodName = f.name.toLowerCase();
    return priorityList.some((p) => foodName.includes(p.toLowerCase()));
  });

  return [...highProtein].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    const aIndex = priorityList.findIndex((p) => aName.includes(p.toLowerCase()));
    const bIndex = priorityList.findIndex((p) => bName.includes(p.toLowerCase()));

    const aScore = aIndex === -1 ? 999 : aIndex;
    const bScore = bIndex === -1 ? 999 : bIndex;

    if (aScore !== bScore) {
      return aScore - bScore;
    }
    
    // Protein efficiency fallback
    const aRatio = a.estimated_cost > 0 ? a.protein / a.estimated_cost : 0;
    const bRatio = b.estimated_cost > 0 ? b.protein / b.estimated_cost : 0;
    if (Math.abs(bRatio - aRatio) > 0.05) {
      return bRatio - aRatio;
    }

    return b.protein - a.protein;
  });
}

/**
 * Returns staple/breakfast foods with > 20g carbs.
 */
export function getCarbSources(foods: FoodItem[]): FoodItem[] {
  return foods.filter(
    (f) =>
      f.carbs > 20 &&
      (f.category === "Staple" || f.category === "Breakfast")
  );
}

/**
 * Returns snack/fruit foods.
 */
export function getSnackFoods(foods: FoodItem[]): FoodItem[] {
  return foods.filter(
    (f) =>
      f.category === "Nuts & Snacks" ||
      f.category === "Fruit" ||
      f.category === "Snack"
  );
}
