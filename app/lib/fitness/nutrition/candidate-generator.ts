// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Candidate Generator
// File: lib/fitness/nutrition/candidate-generator.ts
// Multi-stage filtering, slot matching, and scoring engine
// ─────────────────────────────────────────────────────────────

import {
  MealSlotType,
  UserPlanningProfile,
  Recipe,
  RecipeVersion,
  RecipeVariant,
  RecipeVariantIngredient,
  RecipeImage,
  matchesAllergen,
  isFoodAllergenSafe
} from "./domain-types";

export interface RecipeCatalogItem {
  recipe: Recipe;
  recipeVersion: RecipeVersion;
  variants: RecipeVariant[];
  variantIngredients: RecipeVariantIngredient[];
  image: RecipeImage;
}

export interface CandidateMeal {
  catalogItem: RecipeCatalogItem;
  selectedVariant: RecipeVariant;
  variantIngredients: RecipeVariantIngredient[];
  score: number;
  calorieDelta: number;
  proteinDelta: number;
  estimatedCost: number;
}

/**
 * Checks whether a recipe is appropriate for a specific meal slot.
 */
function isSlotAppropriate(
  slot: MealSlotType,
  recipeVersion: RecipeVersion,
  profile?: UserPlanningProfile
): boolean {
  const name = recipeVersion.name.toLowerCase();
  const cuisine = (recipeVersion.cuisine || "").toLowerCase();
  const tags = (recipeVersion.dietaryTags || []).map(t => t.toLowerCase());

  const isBreakfastItem =
    name.includes("cheela") ||
    name.includes("poha") ||
    name.includes("upma") ||
    name.includes("idli") ||
    name.includes("dosa") ||
    name.includes("oats") ||
    name.includes("toast") ||
    name.includes("scramble") ||
    name.includes("omelette") ||
    name.includes("pongal") ||
    name.includes("yogurt") ||
    name.includes("curd") ||
    name.includes("sprouts") ||
    name.includes("smoothie") ||
    name.includes("fruit") ||
    cuisine.includes("breakfast") ||
    tags.includes("breakfast");

  const isTeaDrink = /\btea\b/i.test(name) || name.includes("chai");
  const isCoffeeDrink = /\bcoffee\b/i.test(name);

  const isSnackItem =
    name.includes("makhana") ||
    name.includes("snack") ||
    name.includes("chaat") ||
    isCoffeeDrink ||
    isTeaDrink ||
    name.includes("fruit") ||
    name.includes("smoothie") ||
    name.includes("curd") ||
    name.includes("yogurt") ||
    name.includes("chaas") ||
    name.includes("lassi") ||
    name.includes("sprouts") ||
    name.includes("toast") ||
    name.includes("chana") ||
    tags.includes("snack") ||
    tags.includes("pre-workout") ||
    tags.includes("post-workout");

  const isMainMealItem =
    !name.includes("cheela") &&
    !name.includes("poha") &&
    !name.includes("upma") &&
    !name.includes("idli") &&
    !name.includes("dosa") &&
    !name.includes("oats") &&
    !name.includes("snack") &&
    !isTeaDrink &&
    !isCoffeeDrink &&
    !tags.includes("snack") &&
    (
      name.includes("rice") ||
      name.includes("phulka") ||
      name.includes("roti") ||
      name.includes("curry") ||
      name.includes("dal") ||
      name.includes("rajma") ||
      name.includes("chole") ||
      name.includes("tofu") ||
      name.includes("soya") ||
      name.includes("stir fry") ||
      name.includes("tempeh") ||
      (name.includes("paneer") && !name.includes("raw paneer")) ||
      name.includes("chicken") ||
      name.includes("fish") ||
      name.includes("mutton") ||
      name.includes("prawns") ||
      name.includes("biryani") ||
      name.includes("sabzi") ||
      name.includes("bhurji")
    );

  switch (slot) {
    case "breakfast":
      return (
        (isBreakfastItem || name.includes("egg") || (isSnackItem && !name.includes("makhana") && !isCoffeeDrink && !isTeaDrink && !name.includes("fitness snack"))) &&
        !name.includes("biryani") &&
        !name.includes("mutton") &&
        !name.includes("fish curry")
      );

    case "snack":
    case "pre_workout":
    case "post_workout":
      return isSnackItem || (isBreakfastItem && recipeVersion.cookingTimeMin <= 15);

    case "lunch":
    case "dinner": {
      // If user has no stove (e.g. kettle only in hostel/PG), allow high-protein cold/kettle dishes
      const isRestrictedEquipment = profile?.availableEquipment && !profile.availableEquipment.includes("stove");
      const isRestrictedMainMeal = Boolean(
        isRestrictedEquipment &&
        (name.includes("paneer") || name.includes("curd") || name.includes("oats") || name.includes("yogurt") || name.includes("chana") || name.includes("salad"))
      );

      return (
        (isMainMealItem || isRestrictedMainMeal || (name.includes("oats") && name.includes("savory"))) &&
        !isCoffeeDrink &&
        !isTeaDrink
      );
    }

    default:
      return true;
  }
}

/**
 * Multi-stage candidate generator filtering across diet, allergens, environment, and slot appropriateness.
 */
export function generateMealCandidates(
  profile: UserPlanningProfile,
  slot: MealSlotType,
  slotTargetCalories: number,
  slotTargetProtein: number,
  catalog: RecipeCatalogItem[],
  foodAllergensLookup: (foodId: string) => string[],
  foodCostLookup?: (foodId: string) => number,
  foodServingWeightLookup?: (foodId: string) => number
): CandidateMeal[] {
  const candidates: CandidateMeal[] = [];

  for (const item of catalog) {
    const rv = item.recipeVersion;

    // Stage 1: Diet Category Hard Filter
    if (profile.dietPreference === "vegan" && rv.dietCategory !== "vegan") continue;
    if (profile.dietPreference === "vegetarian" && !["vegan", "vegetarian"].includes(rv.dietCategory)) continue;
    if (profile.dietPreference === "eggetarian" && !["vegan", "vegetarian", "eggetarian"].includes(rv.dietCategory)) continue;

    // Check specific excluded protein types
    const primaryProtein = rv.primaryProtein.toLowerCase();
    if (profile.avoidedFoods && profile.avoidedFoods.length > 0) {
      const avoidsPrimary = profile.avoidedFoods.some(av => primaryProtein.includes(av.toLowerCase()));
      if (avoidsPrimary) continue;
    }

    // Stage 2: Structured & Name Allergen Hard Filter (double-layer defense)
    if (profile.allergies && profile.allergies.length > 0) {
      if (!isFoodAllergenSafe(rv.name, [], profile.allergies) ||
          !isFoodAllergenSafe(rv.primaryProtein, [], profile.allergies)) {
        continue;
      }
      let containsAllergen = false;
      for (const ing of item.variantIngredients) {
        const foodAllergens = foodAllergensLookup(ing.foodId);
        if (!isFoodAllergenSafe(ing.foodName || "", foodAllergens, profile.allergies)) {
          containsAllergen = true;
          break;
        }
      }
      if (containsAllergen) continue;
    }

    // Stage 3: Avoided Foods Hard Filter (checked across ALL ingredients, title, and protein)
    const avoidedList = (profile.avoidedFoods || []).map(f => f.toLowerCase().trim()).filter(Boolean);
    if (avoidedList.length > 0) {
      let containsAvoided = false;
      const rName = rv.name.toLowerCase();
      const pProt = rv.primaryProtein.toLowerCase();
      for (const avoided of avoidedList) {
        if (rName.includes(avoided) || pProt.includes(avoided)) {
          containsAvoided = true;
          break;
        }
      }
      if (!containsAvoided) {
        for (const ing of item.variantIngredients) {
          const ingName = (ing.foodName || "").toLowerCase();
          for (const avoided of avoidedList) {
            if (ingName.includes(avoided)) {
              containsAvoided = true;
              break;
            }
          }
          if (containsAvoided) break;
        }
      }
      if (containsAvoided) continue;
    }

    // Stage 4: Environment & Equipment Filter
    if (profile.foodEnvironment) {
      if (rv.supportedEnvironments && rv.supportedEnvironments.length > 0) {
        if (!rv.supportedEnvironments.includes(profile.foodEnvironment)) {
          // If user is in Hostel/PG, strictly enforce environment support
          if (["Hostel", "PG", "Office/Canteen"].includes(profile.foodEnvironment)) {
            continue;
          }
        }
      }
    }

    if (profile.availableEquipment && profile.availableEquipment.length > 0) {
      const userEquip = new Set(profile.availableEquipment);
      const reqEquip = rv.requiredEquipment || [];

      if (userEquip.has("none") && userEquip.size === 1) {
        // User has NO equipment at all (cold prep only)
        const isColdPrep = reqEquip.length === 0 || reqEquip.includes("none");
        if (!isColdPrep) continue;
      } else {
        const isNoneOnly = reqEquip.length === 1 && reqEquip[0] === "none";
        if (!isNoneOnly && reqEquip.length > 0) {
          const hasMatch = reqEquip.some(eq => eq === "none" || userEquip.has(eq as any));
          if (!hasMatch) continue;

          // Check if user has only kettle (no stove, no microwave)
          if (!userEquip.has("stove") && !userEquip.has("microwave")) {
            const lowerName = rv.name.toLowerCase();
            if (
              lowerName.includes("roti") ||
              lowerName.includes("phulka") ||
              lowerName.includes("paratha") ||
              lowerName.includes("biryani") ||
              lowerName.includes("curry") ||
              lowerName.includes("tikka") ||
              lowerName.includes("cheela") ||
              lowerName.includes("poha") ||
              lowerName.includes("upma") ||
              lowerName.includes("dal") ||
              lowerName.includes("rice") ||
              (lowerName.includes("masala") && !lowerName.includes("masala oats")) ||
              lowerName.includes("sabzi") ||
              lowerName.includes("khichdi") ||
              lowerName.includes("dosa") ||
              lowerName.includes("idli") ||
              lowerName.includes("bhurji")
            ) {
              continue;
            }
          }
        }
      }
    }

    // Stage 5: Meal Slot Appropriateness
    if (!isSlotAppropriate(slot, rv, profile)) {
      continue;
    }

    // Stage 5b: Strict Low-Budget Protection
    // For STRICT budget users with tight weekly budget (<= ₹1500), exclude luxury seed/nut bowls (chia, makhana, walnut)
    // which have low protein density and cause cost blowups when scaled.
    if (profile.budgetPolicy === "STRICT" && profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr <= 1500) {
      const lowerName = (rv.name || "").toLowerCase();
      if ((lowerName.includes("chia") && !lowerName.includes("oats")) || lowerName.includes("makhana") || lowerName.includes("walnut")) {
        continue;
      }
    }

    // Stage 6: Variant Selection & Scoring
    // Choose the variant that minimizes composite normalized deviation (both calories, protein, and budget compatibility)
    let bestVariant: RecipeVariant = item.variants[0];
    let bestVariantIngs = item.variantIngredients.filter(vi => vi.recipeVariantId === bestVariant.id);
    let minCompositeDelta = Infinity;

    const isStrictBudgetProfile = profile.budgetPolicy === "STRICT" && (profile.weeklyBudgetTargetInr || 0) > 0;
    const paidMealsPerDay = profile.messAvailable && profile.messMeals
      ? Math.max(1, (profile.mealsPerDay || 3) - profile.messMeals.length)
      : (profile.mealsPerDay || 3);
    const dailyOutPocketBudget = profile.weeklyBudgetTargetInr ? (profile.weeklyBudgetTargetInr / 7) : 400;
    const approxMealBudget = Math.max(25, (dailyOutPocketBudget - (profile.messAvailable ? 60 : 0)) / paidMealsPerDay);

    for (const v of item.variants) {
      const calRatio = Math.abs(v.targetCalories - slotTargetCalories) / (slotTargetCalories || 400);
      const pRatio = Math.abs(v.targetProtein - slotTargetProtein) / (slotTargetProtein || 30);

      let costPenalty = 0;
      if (isStrictBudgetProfile) {
        const vIngs = item.variantIngredients.filter(vi => vi.recipeVariantId === v.id);
        let vCost = 0;
        for (const vi of vIngs) {
          const itemCostRate = foodCostLookup ? foodCostLookup(vi.foodId) : (vi.portionType === "DISCRETE" ? 10 : 25);
          const sw = foodServingWeightLookup ? (foodServingWeightLookup(vi.foodId) || 100) : 100;
          vCost += vi.portionType === "DISCRETE" ? (vi.amount * itemCostRate) : ((vi.amount / sw) * itemCostRate);
        }
        if (vCost > approxMealBudget * 1.35) {
          costPenalty = Math.min(1.2, 1.5 * ((vCost - approxMealBudget * 1.35) / approxMealBudget));
        }
      }

      const pWeight = slotTargetProtein >= 28 ? 2.5 : 1.4;
      const severeProteinShortfall = slotTargetProtein >= 28 && v.targetProtein < slotTargetProtein * 0.65 ? 2.5 : 0;
      const compositeDelta = calRatio + pWeight * pRatio + costPenalty + severeProteinShortfall;
      if (compositeDelta < minCompositeDelta) {
        minCompositeDelta = compositeDelta;
        bestVariant = v;
        bestVariantIngs = item.variantIngredients.filter(vi => vi.recipeVariantId === v.id);
      }
    }

    const variantIngs = bestVariantIngs;

    const calDelta = Math.abs(bestVariant.targetCalories - slotTargetCalories);
    const pDelta = Math.abs(bestVariant.targetProtein - slotTargetProtein);

    // Scoring formula (0 to 100):
    // - Proximity to target protein (up to 45 pts)
    // - Proximity to target calories (up to 35 pts)
    // - Budget compliance (up to 25 pts)
    // - Pantry food match bonus (up to 15 pts)
    // - Quick prep bonus (up to 5 pts)
    let score = 100;
    score -= Math.min(35, (calDelta / (slotTargetCalories || 400)) * 35);
    score -= Math.min(45, (pDelta / (slotTargetProtein || 30)) * 45);

    // Large protein deficit penalty: meals lacking protein for the slot must not outscore nutritious meals
    const pErrorPct = pDelta / (slotTargetProtein || 30);
    if (pErrorPct > 0.15) {
      score -= Math.min(45, (pErrorPct - 0.15) * 85);
    }

    // If slot requires high protein density (>= 24% calories from protein) on a vegetarian/vegan diet,
    // plain dal/lentils cannot hit the target without calorie bloat:
    const isVegDiet = profile.dietPreference === "vegetarian" || profile.dietPreference === "vegan";
    const isLentilPrimary = (rv.primaryProtein || "").toLowerCase().includes("dal") || (rv.primaryProtein || "").toLowerCase().includes("lentil");
    const slotProteinCalRatio = (slotTargetProtein * 4) / Math.max(1, slotTargetCalories);
    if ((slotTargetProtein >= 35 || slotProteinCalRatio >= 0.24) && isVegDiet && isLentilPrimary) {
      score -= 35;
    }

    // Ingredient cost of the selected variant (food prices are per serving_weight_g for continuous, per unit for discrete)
    let estCost = 0;
    for (const vi of variantIngs) {
      const itemCostRate = foodCostLookup ? foodCostLookup(vi.foodId) : (vi.portionType === "DISCRETE" ? 10 : 25);
      const sw = foodServingWeightLookup ? (foodServingWeightLookup(vi.foodId) || 100) : 100;
      estCost += vi.portionType === "DISCRETE" ? (vi.amount * itemCostRate) : ((vi.amount / sw) * itemCostRate);
    }
    // Projected cost after portion optimization toward the slot calorie target (bounded to avoid extreme projections)
    const calScale = Math.min(1.6, Math.max(0.6, slotTargetCalories / Math.max(1, bestVariant.targetCalories)));
    const projectedCost = Math.round(estCost * calScale);

    // Budget-aware scoring: consider mess meals and booster costs when calculating out-of-pocket meal budget
    if (profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr > 0) {
      const paidMealsPerDay = profile.messAvailable && profile.messMeals
        ? Math.max(1, profile.mealsPerDay - profile.messMeals.length)
        : (profile.mealsPerDay || 3);
      const dailyBoosterCost = (profile.messAvailable && profile.messMeals) ? profile.messMeals.length * 20 : 0;
      const dailyBudgetTotal = profile.weeklyBudgetTargetInr / 7;
      const availableDailyBudget = Math.max(30, dailyBudgetTotal - dailyBoosterCost);
      const perMealBudget = availableDailyBudget / paidMealsPerDay;

      if (profile.budgetPolicy === "STRICT") {
        const strictMealLimit = Math.max(85, perMealBudget * 1.8);
        if (profile.weeklyBudgetTargetInr <= 1500 && projectedCost > strictMealLimit) {
          continue;
        }
        if (projectedCost > perMealBudget * 1.05) {
          const excessRatio = (projectedCost - perMealBudget) / perMealBudget;
          score -= Math.min(30, excessRatio * 30);
        } else if (projectedCost <= perMealBudget && pErrorPct <= 0.25) {
          score += 15;
        }
      } else {
        if (projectedCost > perMealBudget * 1.5) {
          const excessRatio = (projectedCost - perMealBudget) / perMealBudget;
          score -= Math.min(15, excessRatio * 15);
        }
      }
    }

    // Disliked foods soft penalty (soft deprioritization, not hard exclusion)
    if (profile.dislikedFoods && profile.dislikedFoods.length > 0) {
      const dislikes = profile.dislikedFoods.map(f => f.toLowerCase().trim()).filter(Boolean);
      const rName = rv.name.toLowerCase();
      let dislikeCount = 0;
      for (const d of dislikes) {
        if (rName.includes(d)) dislikeCount++;
      }
      for (const ing of variantIngs) {
        const ingName = (ing.foodName || "").toLowerCase();
        for (const d of dislikes) {
          if (ingName.includes(d)) dislikeCount++;
        }
      }
      if (dislikeCount > 0) {
        score -= Math.min(50, dislikeCount * 30);
      }
    }

    // Available pantry foods match
    if (profile.availableFoods && profile.availableFoods.length > 0) {
      const availableNames = profile.availableFoods.map(af => af.name.toLowerCase());
      for (const ing of variantIngs) {
        if (availableNames.some(an => (ing.foodName || "").toLowerCase().includes(an))) {
          score += 5; // bonus per matching pantry food
        }
      }
    }

    // Quick prep bonus for busy users
    if (rv.cookingTimeMin <= 15) {
      score += 5;
    }

    candidates.push({
      catalogItem: item,
      selectedVariant: bestVariant,
      variantIngredients: variantIngs,
      score: Math.max(1, Math.round(score)),
      calorieDelta: calDelta,
      proteinDelta: pDelta,
      estimatedCost: projectedCost
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}
