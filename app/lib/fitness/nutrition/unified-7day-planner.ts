// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Unified 7-Day Meal Planner
// File: lib/fitness/nutrition/unified-7day-planner.ts
// Production planner orchestrating calibration, candidate selection,
// portion optimization, and 7-day timeline generation.
// ─────────────────────────────────────────────────────────────

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

import {
  MealSlotType,
  PlannedMeal,
  PlannedMealItem,
  UserPlanningProfile,
  PlanQualityMetrics,
  matchesAllergen
} from "./domain-types";

import {
  RecipeCatalogItem,
  CandidateMeal,
  generateMealCandidates
} from "./candidate-generator";

import {
  FoodMacroProfile,
  optimizeMealPortions
} from "./portion-optimizer";

import {
  DayPlanSummary,
  validate7DayPlan
} from "./plan-quality-validator";

function generateDeterministicUuid(namespace: string, key: string): string {
  const hash = crypto.createHash("md5").update(`${namespace}:${key}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + hash.slice(18, 20),
    hash.slice(20, 32)
  ].join("-");
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealSlotAllocation {
  slot: MealSlotType;
  sequence: number;
  scheduledTime: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface Unified7DayPlanResult {
  planId: string;
  startDate: string;
  endDate: string;
  dailyTargets: MacroTargets;
  plannedMeals: PlannedMeal[];
  dailySummaries: DayPlanSummary[];
  metrics: PlanQualityMetrics;
  warnings: string[];
}

/**
 * Calculates scientifically grounded daily calorie and macronutrient targets.
 * Formula: Mifflin-St Jeor BMR * Activity Multiplier + Goal Adjustment.
 */
export function calculateDailyTargets(profile: UserPlanningProfile): MacroTargets {
  const weight = profile.weightKg > 0 ? profile.weightKg : 70;
  const height = profile.heightCm > 0 ? profile.heightCm : 175;
  const age = profile.age > 0 ? profile.age : 25;
  const gender = (profile.gender || "male").toLowerCase();

  // Mifflin-St Jeor
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === "female" ? bmr - 161 : bmr + 5;

  // Activity Multiplier
  let activityMultiplier = 1.375;
  const act = (profile.activityLevel || "").toLowerCase();
  if (act.includes("sedentary")) activityMultiplier = 1.2;
  else if (act.includes("light")) activityMultiplier = 1.375;
  else if (act.includes("moderate")) activityMultiplier = 1.55;
  else if (act.includes("very") || act.includes("heavy") || act.includes("athlete")) activityMultiplier = 1.725;

  const tdee = Math.round(bmr * activityMultiplier);

  // Goal adjustment
  let targetCalories = tdee;
  const goal = (profile.goal || "").toLowerCase();
  if (goal.includes("lose") || goal.includes("cut") || goal.includes("fat")) {
    targetCalories = Math.max(1300, Math.round(tdee - 450));
  } else if (goal.includes("gain") || goal.includes("bulk") || goal.includes("muscle")) {
    targetCalories = Math.round(tdee + 350);
  }

  // Protein calculation (g/kg)
  let proteinPerKg = 1.8;
  if (goal.includes("gain") || goal.includes("bulk") || goal.includes("athlete")) {
    proteinPerKg = 2.0;
  } else if (goal.includes("lose") || goal.includes("cut")) {
    proteinPerKg = 2.0; // Higher protein during cutting to preserve lean tissue
  } else if (act.includes("sedentary")) {
    proteinPerKg = 1.4;
  }

  const targetProtein = Math.round(weight * proteinPerKg);
  // Fat target ~ 25% of calories (9 cal per g)
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  // Carbs target: remaining calories / 4
  const remainingCal = Math.max(0, targetCalories - (targetProtein * 4 + targetFat * 9));
  const targetCarbs = Math.round(remainingCal / 4);

  return {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat
  };
}

/**
 * Distributes daily macro targets across the user's meals per day.
 */
export function calculateSlotAllocations(
  dailyTargets: MacroTargets,
  mealsPerDay: number,
  wakeTime?: string | null,
  sleepTime?: string | null
): MealSlotAllocation[] {
  const m = Math.max(2, Math.min(5, mealsPerDay || 3));

  if (m === 2) {
    return [
      {
        slot: "lunch",
        sequence: 1,
        scheduledTime: "12:30:00",
        targetCalories: Math.round(dailyTargets.calories * 0.5),
        targetProtein: Math.round(dailyTargets.protein * 0.5),
        targetCarbs: Math.round(dailyTargets.carbs * 0.5),
        targetFat: Math.round(dailyTargets.fat * 0.5)
      },
      {
        slot: "dinner",
        sequence: 2,
        scheduledTime: "20:00:00",
        targetCalories: Math.round(dailyTargets.calories * 0.5),
        targetProtein: Math.round(dailyTargets.protein * 0.5),
        targetCarbs: Math.round(dailyTargets.carbs * 0.5),
        targetFat: Math.round(dailyTargets.fat * 0.5)
      }
    ];
  }

  if (m === 3) {
    return [
      {
        slot: "breakfast",
        sequence: 1,
        scheduledTime: "08:30:00",
        targetCalories: Math.round(dailyTargets.calories * 0.3),
        targetProtein: Math.round(dailyTargets.protein * 0.28),
        targetCarbs: Math.round(dailyTargets.carbs * 0.3),
        targetFat: Math.round(dailyTargets.fat * 0.3)
      },
      {
        slot: "lunch",
        sequence: 2,
        scheduledTime: "13:00:00",
        targetCalories: Math.round(dailyTargets.calories * 0.38),
        targetProtein: Math.round(dailyTargets.protein * 0.38),
        targetCarbs: Math.round(dailyTargets.carbs * 0.38),
        targetFat: Math.round(dailyTargets.fat * 0.38)
      },
      {
        slot: "dinner",
        sequence: 3,
        scheduledTime: "20:30:00",
        targetCalories: Math.round(dailyTargets.calories * 0.32),
        targetProtein: Math.round(dailyTargets.protein * 0.34),
        targetCarbs: Math.round(dailyTargets.carbs * 0.32),
        targetFat: Math.round(dailyTargets.fat * 0.32)
      }
    ];
  }

  if (m === 4) {
    return [
      {
        slot: "breakfast",
        sequence: 1,
        scheduledTime: "08:30:00",
        targetCalories: Math.round(dailyTargets.calories * 0.25),
        targetProtein: Math.round(dailyTargets.protein * 0.25),
        targetCarbs: Math.round(dailyTargets.carbs * 0.25),
        targetFat: Math.round(dailyTargets.fat * 0.25)
      },
      {
        slot: "lunch",
        sequence: 2,
        scheduledTime: "13:00:00",
        targetCalories: Math.round(dailyTargets.calories * 0.35),
        targetProtein: Math.round(dailyTargets.protein * 0.35),
        targetCarbs: Math.round(dailyTargets.carbs * 0.35),
        targetFat: Math.round(dailyTargets.fat * 0.35)
      },
      {
        slot: "snack",
        sequence: 3,
        scheduledTime: "17:00:00",
        targetCalories: Math.round(dailyTargets.calories * 0.15),
        targetProtein: Math.round(dailyTargets.protein * 0.15),
        targetCarbs: Math.round(dailyTargets.carbs * 0.15),
        targetFat: Math.round(dailyTargets.fat * 0.15)
      },
      {
        slot: "dinner",
        sequence: 4,
        scheduledTime: "20:30:00",
        targetCalories: Math.round(dailyTargets.calories * 0.25),
        targetProtein: Math.round(dailyTargets.protein * 0.25),
        targetCarbs: Math.round(dailyTargets.carbs * 0.25),
        targetFat: Math.round(dailyTargets.fat * 0.25)
      }
    ];
  }

  // 5 meals
  return [
    {
      slot: "breakfast",
      sequence: 1,
      scheduledTime: "08:00:00",
      targetCalories: Math.round(dailyTargets.calories * 0.22),
      targetProtein: Math.round(dailyTargets.protein * 0.22),
      targetCarbs: Math.round(dailyTargets.carbs * 0.22),
      targetFat: Math.round(dailyTargets.fat * 0.22)
    },
    {
      slot: "lunch",
      sequence: 2,
      scheduledTime: "12:30:00",
      targetCalories: Math.round(dailyTargets.calories * 0.30),
      targetProtein: Math.round(dailyTargets.protein * 0.30),
      targetCarbs: Math.round(dailyTargets.carbs * 0.30),
      targetFat: Math.round(dailyTargets.fat * 0.30)
    },
    {
      slot: "snack",
      sequence: 3,
      scheduledTime: "16:30:00",
      targetCalories: Math.round(dailyTargets.calories * 0.15),
      targetProtein: Math.round(dailyTargets.protein * 0.15),
      targetCarbs: Math.round(dailyTargets.carbs * 0.15),
      targetFat: Math.round(dailyTargets.fat * 0.15)
    },
    {
      slot: "dinner",
      sequence: 4,
      scheduledTime: "20:00:00",
      targetCalories: Math.round(dailyTargets.calories * 0.25),
      targetProtein: Math.round(dailyTargets.protein * 0.25),
      targetCarbs: Math.round(dailyTargets.carbs * 0.25),
      targetFat: Math.round(dailyTargets.fat * 0.25)
    },
    {
      slot: "post_workout",
      sequence: 5,
      scheduledTime: "21:30:00",
      targetCalories: Math.round(dailyTargets.calories * 0.08),
      targetProtein: Math.round(dailyTargets.protein * 0.08),
      targetCarbs: Math.round(dailyTargets.carbs * 0.08),
      targetFat: Math.round(dailyTargets.fat * 0.08)
    }
  ];
}

/**
 * Loads the in-memory or filesystem catalog.
 */
let cachedCatalog: {
  foods: FoodMacroProfile[];
  recipes: RecipeCatalogItem[];
  foodById: Map<string, FoodMacroProfile>;
  foodByName: Map<string, FoodMacroProfile>;
} | null = null;

export function loadNutritionCatalog(): {
  foods: FoodMacroProfile[];
  recipes: RecipeCatalogItem[];
  foodById: Map<string, FoodMacroProfile>;
  foodByName: Map<string, FoodMacroProfile>;
} {
  if (cachedCatalog) return cachedCatalog;

  const seedDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");

  const foodsRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "foods.json"), "utf8"));
  const recipesRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "recipes.json"), "utf8"));
  const versionsRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_versions.json"), "utf8"));
  const variantsRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variants.json"), "utf8"));
  const variantIngsRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variant_ingredients.json"), "utf8"));
  const imagesRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_images.json"), "utf8"));

  const foodById = new Map<string, FoodMacroProfile>();
  const foodByName = new Map<string, FoodMacroProfile>();

  const portionRulesRaw = JSON.parse(fs.readFileSync(path.join(seedDir, "portion_rules.json"), "utf8"));
  const portionRuleByFoodId = new Map<string, any>(portionRulesRaw.map((pr: any) => [pr.food_id, pr]));

  for (const f of foodsRaw) {
    const pr = portionRuleByFoodId.get(f.id);
    const profile: FoodMacroProfile = {
      id: f.id,
      name: f.name,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      serving_weight_g: f.serving_weight_g,
      serving_unit: f.serving_unit,
      estimated_cost: f.estimated_cost,
      portion_rule: pr ? {
        portion_type: pr.portion_type,
        unit: pr.unit,
        min_portion: pr.min_portion,
        default_portion: pr.default_portion,
        max_sensible_portion: pr.max_sensible_portion,
        increment_step: pr.increment_step
      } : undefined
    };
    foodById.set(f.id, profile);
    foodByName.set(f.name.toLowerCase().trim(), profile);
  }

  const versionById = new Map<string, any>(versionsRaw.map((v: any) => [v.id, v]));
  const imageByVersionId = new Map<string, any>(imagesRaw.map((img: any) => [img.recipe_version_id, img]));

  const variantsByVersionId = new Map<string, any[]>();
  for (const vt of variantsRaw) {
    if (!variantsByVersionId.has(vt.recipe_version_id)) {
      variantsByVersionId.set(vt.recipe_version_id, []);
    }
    variantsByVersionId.get(vt.recipe_version_id)!.push({
      id: vt.id,
      recipeVersionId: vt.recipe_version_id,
      variantTier: vt.variant_tier,
      targetCalories: vt.target_calories,
      targetProtein: vt.target_protein,
      targetCarbs: vt.target_carbs,
      targetFat: vt.target_fat,
      createdAt: vt.created_at || new Date().toISOString()
    });
  }

  const ingsByVariantId = new Map<string, any[]>();
  for (const ing of variantIngsRaw) {
    if (!ingsByVariantId.has(ing.recipe_variant_id)) {
      ingsByVariantId.set(ing.recipe_variant_id, []);
    }
    ingsByVariantId.get(ing.recipe_variant_id)!.push({
      id: ing.id,
      recipeVariantId: ing.recipe_variant_id,
      foodId: ing.food_id,
      foodName: ing.food_name,
      portionType: ing.portion_type,
      amount: ing.amount,
      unit: ing.unit,
      minPortion: ing.min_portion,
      maxPortion: ing.max_portion,
      incrementStep: ing.increment_step,
      role: ing.role,
      isRemovable: ing.is_removable
    });
  }

  const catalogItems: RecipeCatalogItem[] = [];

  for (const r of recipesRaw) {
    const v = versionById.get(r.current_version_id);
    if (!v) continue;

    const variants = variantsByVersionId.get(v.id) || [];
    const allVariantIngs: any[] = [];
    for (const vt of variants) {
      const ings = ingsByVariantId.get(vt.id) || [];
      allVariantIngs.push(...ings);
    }

    const img = imageByVersionId.get(v.id) || {
      id: generateDeterministicUuid("recipe_image", `${r.slug}:v1:img`),
      recipe_version_id: v.id,
      storage_path: `recipe-images/${r.slug}-v1.webp`,
      url: `https://images.grindlog.in/recipes/${r.slug}.webp`,
      status: "DRAFT",
      alt_text: v.name,
      dominant_foods: [v.primary_protein],
      is_primary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    catalogItems.push({
      recipe: {
        id: r.id,
        slug: r.slug,
        currentVersionId: r.current_version_id,
        status: r.status,
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString()
      },
      recipeVersion: {
        id: v.id,
        recipeId: v.recipe_id,
        version: v.version,
        name: v.name,
        description: v.description,
        dietCategory: v.diet_category,
        compatibleDiets: v.compatible_diets,
        dietaryTags: v.dietary_tags,
        cuisine: v.cuisine,
        prepInstructions: v.prep_instructions,
        cookingTimeMin: v.cooking_time_min,
        difficulty: v.difficulty,
        requiredEquipment: v.required_equipment,
        supportedEnvironments: v.supported_environments,
        primaryProtein: v.primary_protein,
        isLocked: v.is_locked,
        createdAt: v.created_at || new Date().toISOString()
      },
      variants,
      variantIngredients: allVariantIngs,
      image: {
        id: img.id,
        recipeVersionId: img.recipe_version_id,
        storagePath: img.storage_path,
        url: img.url,
        status: img.status,
        altText: img.alt_text,
        dominantFoods: img.dominant_foods,
        isPrimary: img.is_primary,
        createdAt: img.created_at || new Date().toISOString(),
        updatedAt: img.updated_at || new Date().toISOString()
      }
    });
  }

  cachedCatalog = {
    foods: foodsRaw,
    recipes: catalogItems,
    foodById,
    foodByName
  };

  return cachedCatalog;
}

/**
 * Generates an end-to-end personalized 7-Day Meal Plan for a user.
 */
export function generateUnified7DayPlan(
  profile: UserPlanningProfile,
  startDateStr?: string
): Unified7DayPlanResult {
  const catalog = loadNutritionCatalog();
  const dailyTargets = calculateDailyTargets(profile);
  const slotAllocations = calculateSlotAllocations(dailyTargets, profile.mealsPerDay, profile.wakeTime, profile.sleepTime);

  // Determine start date
  const now = new Date();
  const baseDate = startDateStr ? new Date(startDateStr) : now;

  const planId = generateDeterministicUuid("meal_plan", `${profile.userId}:${baseDate.toISOString().split("T")[0]}`);
  const plannedMeals: PlannedMeal[] = [];

  const recipeUsageCount = new Map<string, number>();
  let lastPrimaryProtein = "";
  let consecutiveProteinCount = 0;

  // STRICT budget tracking: separate recipe meals from mess meals (which only incur booster cost)
  const isMessSlotCheck = (slot: MealSlotType) => Boolean(profile.messAvailable && profile.messMeals && profile.messMeals.includes(slot));
  const recipeSlots = slotAllocations.filter(a => !isMessSlotCheck(a.slot));
  const totalRecipeMealsInWeek = 7 * recipeSlots.length;
  const totalMessMealsInWeek = 7 * (slotAllocations.length - recipeSlots.length);

  const strictBudget = profile.budgetPolicy === "STRICT" && (profile.weeklyBudgetTargetInr || 0) > 0
    ? (profile.weeklyBudgetTargetInr as number)
    : null;

  let weekSpent = 0;
  let recipeMealsCompleted = 0;
  let messMealsCompleted = 0;

  const strictPerMealCap = (slotCalTarget: number) => {
    if (strictBudget === null) return Infinity;
    const remainingMessMeals = Math.max(0, totalMessMealsInWeek - messMealsCompleted);
    const estRemainingMessSpend = remainingMessMeals * 31; // Average booster spend (₹41 paneer + ₹20 curd) / 2 = ~₹31
    const remainingRecipeBudget = Math.max(20, strictBudget - weekSpent - estRemainingMessSpend);
    const remainingRecipeMeals = Math.max(1, totalRecipeMealsInWeek - recipeMealsCompleted);
    const avgMealBudget = remainingRecipeBudget / remainingRecipeMeals;
    const avgRecipeSlotCal = recipeSlots.length > 0
      ? recipeSlots.reduce((s, a) => s + a.targetCalories, 0) / recipeSlots.length
      : dailyTargets.calories / Math.max(1, slotAllocations.length);
    const slotWeight = Math.min(1.5, Math.max(0.6, slotCalTarget / avgRecipeSlotCal));
    return avgMealBudget * slotWeight;
  };

  const foodAllergensLookup = (foodId: string) => {
    const f: any = catalog.foodById.get(foodId);
    return f?.allergens || [];
  };

  const foodLookup = (foodIdOrName: string) => {
    return catalog.foodById.get(foodIdOrName) || catalog.foodByName.get(foodIdOrName.toLowerCase().trim());
  };

  const foodCostLookup = (foodId: string) => {
    return catalog.foodById.get(foodId)?.estimated_cost || 15;
  };

  const foodServingWeightLookup = (foodId: string) => {
    return catalog.foodById.get(foodId)?.serving_weight_g || 100;
  };

  // Generate 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];

    const usedRecipesToday = new Set<string>();

    for (const alloc of slotAllocations) {
      // Check if user eats from mess/canteen for this slot
      const isMessSlot = Boolean(profile.messAvailable && profile.messMeals && profile.messMeals.includes(alloc.slot));

      if (isMessSlot) {
        const templateCode = `${(profile.foodEnvironment || "HOSTEL").toUpperCase().replace(/[^A-Z]/g, "_")}_MESS_${alloc.slot.toUpperCase()}`;
        const templateId = generateDeterministicUuid("meal_template", templateCode);
        const mealId = generateDeterministicUuid("planned_meal", `${planId}:${dateStr}:${alloc.slot}`);

        const avoidGluten = profile.allergies.some((allergy) => matchesAllergen(allergy, "gluten"));
        const avoidDairy = profile.allergies.some((allergy) => matchesAllergen(allergy, "dairy"));
        const stapleFood = (avoidGluten ? foodLookup("White Rice (Steamed)") : foodLookup("Chapati / Phulka")) || catalog.foods[0];
        const dalFood = (profile.dietPreference === "vegan" || avoidDairy
          ? foodLookup("Yellow Moong Dal")
          : foodLookup("Dal Tadka")) || catalog.foods[1];
        const sabziFood = foodLookup("Mixed Vegetable Sabzi") || foodLookup("Green Salad") || catalog.foods[2];

        let boosterFood = foodLookup("Low Fat Curd / Dahi") || catalog.foods[3];
        let boosterDefaultPortion = 150;
        let boosterUnit = "g";
        let boosterPortionType: "DISCRETE" | "CONTINUOUS" = "CONTINUOUS";

        if (profile.dietPreference === "vegan") {
          const isFirstMeal = alloc.slot === "lunch" || alloc.slot === "breakfast";
          boosterFood = (dayOffset % 2 === 0 ? isFirstMeal : !isFirstMeal)
            ? (foodLookup("Moong Sprouts Salad") || catalog.foods[3])
            : (foodLookup("Roasted Chana (Dry Chickpeas)") || catalog.foods[3]);
          boosterUnit = "g";
          boosterPortionType = "CONTINUOUS";
        } else if (profile.dietPreference === "eggetarian" || profile.dietPreference === "non-veg") {
          const isFirstMeal = alloc.slot === "lunch" || alloc.slot === "breakfast";
          boosterFood = (dayOffset % 2 === 0 ? isFirstMeal : !isFirstMeal)
            ? (foodLookup("Boiled Egg (Whole)") || catalog.foods[3])
            : (foodLookup("Boiled Egg White") || catalog.foods[3]);
          boosterUnit = "piece";
          boosterPortionType = "DISCRETE";
        } else {
          // Vegetarian: Low Fat Paneer at Lunch (high-protein anchor) and Low Fat Curd at Dinner (light evening slot)
          boosterFood = (alloc.slot === "lunch" || alloc.slot === "breakfast")
            ? (foodLookup("Low Fat Paneer") || catalog.foods[3])
            : (foodLookup("Low Fat Curd / Dahi") || catalog.foods[3]);
          boosterUnit = "g";
          boosterPortionType = "CONTINUOUS";
        }

        const roundTo1 = (v: number) => Math.round(v * 10) / 10;

        // 1. Dal portion (150g, ₹0 cost)
        const dalSw = dalFood.serving_weight_g || 100;
        const dalRatio = 150 / dalSw;
        const dalCal = Math.round(dalRatio * dalFood.calories);
        const dalP = roundTo1(dalRatio * dalFood.protein);
        const dalC = roundTo1(dalRatio * dalFood.carbs);
        const dalF = roundTo1(dalRatio * dalFood.fat);

        // 2. Sabzi portion (100g, ₹0 cost)
        const sabziSw = sabziFood.serving_weight_g || 100;
        const sabziRatio = 100 / sabziSw;
        const sabziCal = Math.round(sabziRatio * sabziFood.calories);
        const sabziP = roundTo1(sabziRatio * sabziFood.protein);
        const sabziC = roundTo1(sabziRatio * sabziFood.carbs);
        const sabziF = roundTo1(sabziRatio * sabziFood.fat);

        const baseMessCal = dalCal + sabziCal;
        const baseMessP = dalP + sabziP;

        const neededCal = Math.max(0, alloc.targetCalories - baseMessCal);
        const neededP = Math.max(0, alloc.targetProtein - baseMessP);

        const isStapleDiscrete = stapleFood.portion_rule?.portion_type === "DISCRETE" || stapleFood.serving_unit === "piece";
        const stapleSw = isStapleDiscrete ? 1 : (stapleFood.serving_weight_g || 100);
        const boosterSw = boosterPortionType === "DISCRETE" ? 1 : (boosterFood.serving_weight_g || 100);

        const cStaple = stapleFood.calories / stapleSw;
        const pStaple = stapleFood.protein / stapleSw;
        const cBooster = boosterFood.calories / boosterSw;
        const pBooster = boosterFood.protein / boosterSw;

        // Solve 2x2 system:
        // cStaple * s + cBooster * b = neededCal
        // pStaple * s + pBooster * b = neededP
        const det = pBooster * cStaple - cBooster * pStaple;
        let idealB = (neededP * cStaple - neededCal * pStaple) / det;
        let idealS = (neededCal * pBooster - neededP * cBooster) / det;

        let minB = 25;
        let maxB = 250;
        let stepB = 25;

        const isStrictBudget = profile.budgetPolicy === "STRICT" && profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr <= 1500;
        if (boosterPortionType === "DISCRETE") {
          minB = 2;
          maxB = 5;
          stepB = 1;
        } else if (boosterFood.name.includes("Curd") || boosterFood.name.includes("Dahi")) {
          minB = 100;
          maxB = isStrictBudget ? 150 : 350;
          stepB = 50;
        } else if (boosterFood.name.includes("Paneer")) {
          minB = 50;
          maxB = isStrictBudget ? 75 : 150;
          stepB = 25;
        } else if (boosterFood.name.includes("Sprouts")) {
          minB = 75;
          maxB = isStrictBudget ? 150 : 250;
          stepB = 25;
        } else if (boosterFood.name.includes("Chana")) {
          minB = 25;
          maxB = 50;
          stepB = 10;
        }

        const minS = isStapleDiscrete ? 1 : 75;
        const maxS = isStapleDiscrete ? 6 : 350;
        const stepS = isStapleDiscrete ? 1 : 25;

        if (idealB > maxB) {
          idealB = maxB;
          idealS = (neededCal - cBooster * idealB) / cStaple;
        } else if (idealB < minB) {
          idealB = minB;
          idealS = (neededCal - cBooster * idealB) / cStaple;
        }

        if (idealS > maxS) {
          idealS = maxS;
          idealB = Math.max(minB, Math.min(maxB, (neededP - pStaple * idealS) / pBooster));
        } else if (idealS < minS) {
          idealS = minS;
          idealB = Math.max(minB, Math.min(maxB, (neededP - pStaple * idealS) / pBooster));
        }

        const bVals = [...new Set([
          Math.max(minB, Math.min(maxB, boosterPortionType === "DISCRETE" ? Math.floor(idealB) : Math.floor(idealB / stepB) * stepB)),
          Math.max(minB, Math.min(maxB, boosterPortionType === "DISCRETE" ? Math.ceil(idealB) : Math.ceil(idealB / stepB) * stepB))
        ])];

        const sCenter = isStapleDiscrete ? Math.round(idealS) : Math.round(idealS / stepS) * stepS;
        const sVals = [...new Set([
          Math.max(minS, Math.min(maxS, sCenter - (isStapleDiscrete ? 1 : stepS))),
          Math.max(minS, Math.min(maxS, sCenter)),
          Math.max(minS, Math.min(maxS, sCenter + (isStapleDiscrete ? 1 : stepS))),
          Math.max(minS, Math.min(maxS, sCenter + (isStapleDiscrete ? 2 : stepS * 2)))
        ])];

        let bestScore = Infinity;
        let bestB = bVals[0];
        let bestS = sVals[0];

        for (const b of bVals) {
          for (const s of sVals) {
            const bRatio = boosterPortionType === "DISCRETE" ? 1 : b / boosterSw;
            const bCal = Math.round(boosterPortionType === "DISCRETE" ? b * boosterFood.calories : bRatio * boosterFood.calories);
            const bP = roundTo1(boosterPortionType === "DISCRETE" ? b * boosterFood.protein : bRatio * boosterFood.protein);

            const sRatio = isStapleDiscrete ? 1 : s / stapleSw;
            const sCal = Math.round(isStapleDiscrete ? s * stapleFood.calories : sRatio * stapleFood.calories);
            const sP = roundTo1(isStapleDiscrete ? s * stapleFood.protein : sRatio * stapleFood.protein);

            const totCal = baseMessCal + bCal + sCal;
            const totP = baseMessP + bP + sP;

            const calErr = (totCal - alloc.targetCalories) / alloc.targetCalories;
            const pErr = (totP - alloc.targetProtein) / alloc.targetProtein;

            const pUnderPenalty = pErr < -0.03 ? 12.0 * Math.abs(pErr) : 0;
            const pOverPenalty = pErr > 0.08 ? 8.0 * (pErr - 0.08) : 0;
            const calGatePenalty = Math.abs(calErr) > 0.045 ? 10.0 * Math.abs(calErr) : 0;

            const score = Math.pow(calErr, 2) + 2.0 * Math.pow(pErr, 2) + pUnderPenalty + pOverPenalty + calGatePenalty;
            if (score < bestScore) {
              bestScore = score;
              bestB = b;
              bestS = s;
            }
          }
        }

        const boosterAmount = bestB;
        const stapleAmount = bestS;

        const boosterRatio = boosterPortionType === "DISCRETE" ? 1 : boosterAmount / boosterSw;
        const boosterCal = Math.round(boosterPortionType === "DISCRETE" ? boosterAmount * boosterFood.calories : boosterRatio * boosterFood.calories);
        const boosterP = roundTo1(boosterPortionType === "DISCRETE" ? boosterAmount * boosterFood.protein : boosterRatio * boosterFood.protein);
        const boosterC = roundTo1(boosterPortionType === "DISCRETE" ? boosterAmount * boosterFood.carbs : boosterRatio * boosterFood.carbs);
        const boosterF = roundTo1(boosterPortionType === "DISCRETE" ? boosterAmount * boosterFood.fat : boosterRatio * boosterFood.fat);
        const boosterCost = Math.round(boosterPortionType === "DISCRETE" ? boosterAmount * (boosterFood.estimated_cost || 7) : boosterRatio * (boosterFood.estimated_cost || 20));

        const stapleRatio = isStapleDiscrete ? 1 : stapleAmount / stapleSw;
        const stapleCal = Math.round(isStapleDiscrete ? stapleAmount * stapleFood.calories : stapleRatio * stapleFood.calories);
        const stapleP = roundTo1(isStapleDiscrete ? stapleAmount * stapleFood.protein : stapleRatio * stapleFood.protein);
        const stapleC = roundTo1(isStapleDiscrete ? stapleAmount * stapleFood.carbs : stapleRatio * stapleFood.carbs);
        const stapleF = roundTo1(isStapleDiscrete ? stapleAmount * stapleFood.fat : stapleRatio * stapleFood.fat);

        const totalP = roundTo1(dalP + sabziP + boosterP + stapleP);
        const totalC = roundTo1(dalC + sabziC + boosterC + stapleC);
        const totalF = roundTo1(dalF + sabziF + boosterF + stapleF);
        const totalCal = Math.round(totalP * 4 + totalC * 4 + totalF * 9);

        const items: PlannedMealItem[] = [
          {
            id: generateDeterministicUuid("planned_meal_item", `${mealId}:${stapleFood.id}`),
            plannedMealId: mealId,
            foodId: stapleFood.id,
            foodName: `Mess ${stapleFood.name}`,
            quantity: stapleAmount,
            portionType: isStapleDiscrete ? "DISCRETE" : "CONTINUOUS",
            unit: stapleFood.serving_unit || "piece",
            ingredientRole: "STAPLE_CARB",
            isProvided: true,
            caloriesSnapshot: stapleCal,
            proteinSnapshot: stapleP,
            carbsSnapshot: stapleC,
            fatSnapshot: stapleF,
            costSnapshot: 0
          },
          {
            id: generateDeterministicUuid("planned_meal_item", `${mealId}:${dalFood.id}`),
            plannedMealId: mealId,
            foodId: dalFood.id,
            foodName: `Mess ${dalFood.name}`,
            quantity: 150,
            portionType: "CONTINUOUS",
            unit: "g",
            ingredientRole: "PRIMARY_PROTEIN",
            isProvided: true,
            caloriesSnapshot: dalCal,
            proteinSnapshot: dalP,
            carbsSnapshot: dalC,
            fatSnapshot: dalF,
            costSnapshot: 0
          },
          {
            id: generateDeterministicUuid("planned_meal_item", `${mealId}:${sabziFood.id}`),
            plannedMealId: mealId,
            foodId: sabziFood.id,
            foodName: `Mess ${sabziFood.name}`,
            quantity: 100,
            portionType: "CONTINUOUS",
            unit: "g",
            ingredientRole: "VEGGIE",
            isProvided: true,
            caloriesSnapshot: sabziCal,
            proteinSnapshot: sabziP,
            carbsSnapshot: sabziC,
            fatSnapshot: sabziF,
            costSnapshot: 0
          },
          {
            id: generateDeterministicUuid("planned_meal_item", `${mealId}:${boosterFood.id}`),
            plannedMealId: mealId,
            foodId: boosterFood.id,
            foodName: `${boosterFood.name} (Protein Booster)`,
            quantity: boosterAmount,
            portionType: boosterPortionType,
            unit: boosterUnit,
            ingredientRole: "PRIMARY_PROTEIN",
            isProvided: false,
            caloriesSnapshot: boosterCal,
            proteinSnapshot: boosterP,
            carbsSnapshot: boosterC,
            fatSnapshot: boosterF,
            costSnapshot: boosterCost
          }
        ];

        plannedMeals.push({
          id: mealId,
          mealPlanId: planId,
          localDate: dateStr,
          mealSlot: alloc.slot,
          mealSequence: alloc.sequence,
          scheduledTime: alloc.scheduledTime,
          sourceType: "TEMPLATE",
          recipeVersionId: null,
          recipeVariantId: null,
          mealTemplateId: templateId,
          imageAssetId: null,
          imageStoragePathSnapshot: null,
          imageUrlSnapshot: "https://images.grindlog.in/templates/mess-thali.webp",
          caloriesSnapshot: totalCal,
          proteinSnapshot: totalP,
          carbsSnapshot: totalC,
          fatSnapshot: totalF,
          costSnapshot: boosterCost,
          status: "PLANNED",
          createdAt: new Date().toISOString(),
          items
        });

        weekSpent += boosterCost;
        messMealsCompleted++;
        continue;
      }

      // Generate candidates for this slot
      const rawCandidates = generateMealCandidates(
        profile,
        alloc.slot,
        alloc.targetCalories,
        alloc.targetProtein,
        catalog.recipes,
        foodAllergensLookup,
        foodCostLookup,
        foodServingWeightLookup
      );

      let candidates = rawCandidates;
      if (strictBudget !== null && rawCandidates.length > 0) {
        const cap = strictPerMealCap(alloc.targetCalories) * 1.28;
        const affordable = rawCandidates.filter(c => c.estimatedCost <= cap);
        candidates = affordable.length >= 2
          ? affordable
          : [...rawCandidates].sort((a, b) => b.score - a.score).slice(0, Math.max(2, affordable.length));
      }

      // Choose candidate minimizing repetition using canonical recipe ID and primary protein rotation
      let chosenCandidate: CandidateMeal | null = null;
      for (const cand of candidates) {
        const canonicalId = cand.catalogItem.recipe.slug;
        const primaryProtein = cand.catalogItem.recipeVersion.primaryProtein;

        // Rule 1: Never repeat the same canonical dish on the same day
        if (usedRecipesToday.has(canonicalId)) continue;

        // Rule 2: Max 2 repeats of the same canonical dish in a 7-day week, IF viable protein-accurate alternatives exist (hard limit 3)
        const totalUsed = recipeUsageCount.get(canonicalId) || 0;
        if (totalUsed >= 3) continue; // Hard limit 3

        if (totalUsed >= 2) {
          const targetProteinRatio = (alloc.targetProtein * 4) / alloc.targetCalories;
          const isHighProteinSlot = targetProteinRatio >= 0.28;

          const viableAlternatives = candidates.filter(
            c => c.catalogItem.recipe.slug !== canonicalId &&
                 !usedRecipesToday.has(c.catalogItem.recipe.slug) &&
                 (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 2 &&
                 Math.abs(c.selectedVariant.targetProtein - alloc.targetProtein) / alloc.targetProtein <= 0.15 &&
                 (!isHighProteinSlot || (
                   (c.selectedVariant.targetProtein * 4) / c.selectedVariant.targetCalories >= 0.28 &&
                   !c.catalogItem.recipeVersion.primaryProtein.toLowerCase().includes("dal") &&
                   !c.catalogItem.recipeVersion.primaryProtein.toLowerCase().includes("lentil")
                 ))
          );
          if (viableAlternatives.length >= 1) continue;
        }

        // Rule 3: Rotate primary protein (do not repeat same primary protein in 3 consecutive meals)
        if (consecutiveProteinCount >= 2 && lastPrimaryProtein === primaryProtein && candidates.length > 3) continue;

        chosenCandidate = cand;
        break;
      }

      if (!chosenCandidate && candidates.length > 0) {
        // Fallback: pick candidate not used today with lowest weekly usage (<= 3) and best protein proximity
        const notUsedToday = candidates.filter(
          c => !usedRecipesToday.has(c.catalogItem.recipe.slug) && (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 3
        );
        const pool = notUsedToday.length > 0 ? notUsedToday : candidates;
        pool.sort((a, b) => {
          const usageA = recipeUsageCount.get(a.catalogItem.recipe.slug) || 0;
          const usageB = recipeUsageCount.get(b.catalogItem.recipe.slug) || 0;
          if (usageA !== usageB) return usageA - usageB;
          const pDiffA = Math.abs(a.selectedVariant.targetProtein - alloc.targetProtein);
          const pDiffB = Math.abs(b.selectedVariant.targetProtein - alloc.targetProtein);
          return pDiffA - pDiffB;
        });
        chosenCandidate = pool[0];
      }

      if (!chosenCandidate) {
        throw new Error(`Unable to generate meal for slot ${alloc.slot} on ${dateStr} for user diet: ${profile.dietPreference}`);
      }

      const rv = chosenCandidate.catalogItem.recipeVersion;
      const variant = chosenCandidate.selectedVariant;
      const img = chosenCandidate.catalogItem.image;
      const canonicalId = chosenCandidate.catalogItem.recipe.slug;

      usedRecipesToday.add(canonicalId);
      recipeUsageCount.set(canonicalId, (recipeUsageCount.get(canonicalId) || 0) + 1);

      if (lastPrimaryProtein === rv.primaryProtein) {
        consecutiveProteinCount++;
      } else {
        lastPrimaryProtein = rv.primaryProtein;
        consecutiveProteinCount = 1;
      }

      const portionRulesLookup = (foodId: string) => {
        const food = catalog.foodById.get(foodId);
        const pr = food?.portion_rule;
        if (!pr) return undefined;
        return {
          id: foodId,
          foodId,
          portionType: pr.portion_type,
          unit: pr.unit,
          minPortion: pr.min_portion,
          defaultPortion: pr.default_portion,
          maxSensiblePortion: pr.max_sensible_portion,
          incrementStep: pr.increment_step
        };
      };

      // Portion Optimization
      const optResult = optimizeMealPortions(
        variant,
        chosenCandidate.variantIngredients,
        alloc.targetCalories,
        alloc.targetProtein,
        foodLookup,
        portionRulesLookup
      );

      const mealId = generateDeterministicUuid("planned_meal", `${planId}:${dateStr}:${alloc.slot}`);

      // Create planned meal items
      const items: PlannedMealItem[] = optResult.ingredients.map(ing => ({
        id: generateDeterministicUuid("planned_meal_item", `${mealId}:${ing.foodId}`),
        plannedMealId: mealId,
        foodId: ing.foodId,
        foodName: ing.foodName,
        quantity: ing.amount,
        portionType: ing.portionType,
        unit: ing.unit,
        ingredientRole: ing.role as any,
        isProvided: false,
        caloriesSnapshot: ing.calories,
        proteinSnapshot: ing.protein,
        carbsSnapshot: ing.carbs,
        fatSnapshot: ing.fat,
        costSnapshot: ing.cost
      }));

      let mealCal = optResult.totalCalories;
      let mealP = optResult.totalProtein;
      let mealC = optResult.totalCarbs;
      let mealF = optResult.totalFat;
      let mealCost = optResult.totalCost;

      // For high-calorie bulker profiles (daily target >= 2800 kcal):
      // If the meal is short of target calories by >= 80 kcal due to discrete portion ceilings,
      // add a clean, whole-food energy side (e.g. Banana or Bread) that fits user diet and allergies,
      // BUT never allow the addition to cause mealCal to exceed alloc.targetCalories + 30!
      if (dailyTargets.calories >= 2800 && mealCal < alloc.targetCalories - 80) {
        const calGap = alloc.targetCalories - mealCal;
        const bananaFood = foodLookup("Banana");
        const breadFood = foodLookup("Whole Wheat Bread");
        const userAllergies = profile.allergies || [];

        if (bananaFood && !userAllergies.includes("banana")) {
          let numBananas = calGap >= 190 ? 2 : 1;
          if (mealCal + numBananas * bananaFood.calories > alloc.targetCalories + 30) {
            numBananas = 1;
          }
          const addedCal = Math.round(numBananas * bananaFood.calories);
          if (mealCal + addedCal <= alloc.targetCalories + 30) {
            const addedP = Math.round(numBananas * bananaFood.protein * 10) / 10;
            const addedC = Math.round(numBananas * bananaFood.carbs * 10) / 10;
            const addedF = Math.round(numBananas * bananaFood.fat * 10) / 10;
            const addedCost = Math.round(numBananas * (bananaFood.estimated_cost || 7));

            items.push({
              id: generateDeterministicUuid("planned_meal_item", `${mealId}:${bananaFood.id}`),
              plannedMealId: mealId,
              foodId: bananaFood.id,
              foodName: `${bananaFood.name} (Energy Side)`,
              quantity: numBananas,
              portionType: "DISCRETE",
              unit: "piece",
              ingredientRole: "OPTIONAL_SIDE",
              isProvided: false,
              caloriesSnapshot: addedCal,
              proteinSnapshot: addedP,
              carbsSnapshot: addedC,
              fatSnapshot: addedF,
              costSnapshot: addedCost
            });

            mealCal += addedCal;
            mealP = Math.round((mealP + addedP) * 10) / 10;
            mealC = Math.round((mealC + addedC) * 10) / 10;
            mealF = Math.round((mealF + addedF) * 10) / 10;
            mealCost += addedCost;
          }
        } else if (breadFood && !userAllergies.some(a => matchesAllergen(a, "gluten"))) {
          let numSlices = calGap >= 180 ? 2 : 1;
          if (mealCal + numSlices * breadFood.calories > alloc.targetCalories + 30) {
            numSlices = 1;
          }
          const addedCal = Math.round(numSlices * breadFood.calories);
          if (mealCal + addedCal <= alloc.targetCalories + 30) {
            const addedP = Math.round(numSlices * breadFood.protein * 10) / 10;
            const addedC = Math.round(numSlices * breadFood.carbs * 10) / 10;
            const addedF = Math.round(numSlices * breadFood.fat * 10) / 10;
            const addedCost = Math.round(numSlices * (breadFood.estimated_cost || 5));

            items.push({
              id: generateDeterministicUuid("planned_meal_item", `${mealId}:${breadFood.id}`),
              plannedMealId: mealId,
              foodId: breadFood.id,
              foodName: `${breadFood.name} (Energy Side)`,
              quantity: numSlices,
              portionType: "DISCRETE",
              unit: "slice",
              ingredientRole: "OPTIONAL_SIDE",
              isProvided: false,
              caloriesSnapshot: addedCal,
              proteinSnapshot: addedP,
              carbsSnapshot: addedC,
              fatSnapshot: addedF,
              costSnapshot: addedCost
            });

            mealCal += addedCal;
            mealP = Math.round((mealP + addedP) * 10) / 10;
            mealC = Math.round((mealC + addedC) * 10) / 10;
            mealF = Math.round((mealF + addedF) * 10) / 10;
            mealCost += addedCost;
          }
        }
      }

      plannedMeals.push({
        id: mealId,
        mealPlanId: planId,
        localDate: dateStr,
        mealSlot: alloc.slot,
        mealSequence: alloc.sequence,
        scheduledTime: alloc.scheduledTime,
        sourceType: "RECIPE",
        recipeVersionId: rv.id,
        recipeVariantId: variant.id,
        mealTemplateId: null,
        imageAssetId: img.status === "APPROVED" && img.recipeVersionId === rv.id && img.isPrimary ? img.id : null,
        imageStoragePathSnapshot: img.status === "APPROVED" && img.recipeVersionId === rv.id && img.isPrimary ? img.storagePath : null,
        imageUrlSnapshot: img.status === "APPROVED" && img.recipeVersionId === rv.id && img.isPrimary ? img.url : null,
        caloriesSnapshot: mealCal,
        proteinSnapshot: mealP,
        carbsSnapshot: mealC,
        fatSnapshot: mealF,
        costSnapshot: mealCost,
        status: "PLANNED",
        createdAt: new Date().toISOString(),
        items
      });
      weekSpent += mealCost;
      recipeMealsCompleted++;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. STRICT Budget Enforcement Pass:
  // Hard guarantee that strict plans never silently exceed weekly budget.
  // Trims high-cost non-essential sides (extra bananas, sweet potatoes, excess nuts)
  // before daily reconciliation so that any calorie/protein shortfalls can be
  // cleanly replenished by free mess staples or within-headroom additions.
  // ─────────────────────────────────────────────────────────────
  if (profile.budgetPolicy === "STRICT" && strictBudget !== null) {
    let currentTotalCost = plannedMeals.reduce((sum, m) => sum + (m.costSnapshot || 0), 0);
    let guardIterations = 0;

    while (currentTotalCost > strictBudget && guardIterations < 20) {
      guardIterations++;

      // Candidate 1: Meals with multiple discrete fruits or sweet potatoes (e.g. Banana > 1, Sweet Potato > 1)
      const multiFruitItem = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => !item.isProvided && item.costSnapshot > 10 && item.portionType === "DISCRETE" &&
          (item.foodName.toLowerCase().includes("banana") || item.foodName.toLowerCase().includes("sweet potato") || item.foodName.toLowerCase().includes("apple")) &&
          item.quantity > 1);

      if (multiFruitItem) {
        const { item, meal } = multiFruitItem;
        const unitCost = Math.round(item.costSnapshot / item.quantity);
        const unitCal = Math.round(item.caloriesSnapshot / item.quantity);
        const unitP = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
        const unitC = Math.round(((item.carbsSnapshot || 0) / item.quantity) * 10) / 10;
        item.quantity -= 1;
        item.costSnapshot -= unitCost;
        item.caloriesSnapshot -= unitCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - unitP) * 10) / 10;
        if (item.carbsSnapshot) item.carbsSnapshot = Math.round((item.carbsSnapshot - unitC) * 10) / 10;
        meal.costSnapshot -= unitCost;
        meal.caloriesSnapshot -= unitCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - unitP) * 10) / 10;
        if (meal.carbsSnapshot) meal.carbsSnapshot = Math.round((meal.carbsSnapshot - unitC) * 10) / 10;
        currentTotalCost -= unitCost;
        weekSpent -= unitCost;
        continue;
      }

      // Candidate 2: High-cost nuts exceeding 15g (e.g. Almonds > 15g, Peanut Butter > 15g)
      const heavyNutItem = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => !item.isProvided && item.costSnapshot >= 15 && item.portionType === "CONTINUOUS" &&
          (item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("peanut butter") || item.foodName.toLowerCase().includes("walnut")) &&
          item.quantity > 10);

      if (heavyNutItem) {
        const { item, meal } = heavyNutItem;
        const subG = Math.min(10, item.quantity - 10);
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const costPerG = item.costSnapshot / item.quantity;
        const subCost = Math.round(subG * costPerG);
        const subCal = Math.round(subG * calPerG);
        const subP = Math.round(subG * pPerG * 10) / 10;
        item.quantity -= subG;
        item.costSnapshot -= subCost;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        meal.costSnapshot -= subCost;
        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        currentTotalCost -= subCost;
        weekSpent -= subCost;
        continue;
      }

      // Candidate 3: Expensive continuous starchy carbs exceeding 150g (e.g. Sweet Corn > 150g)
      const heavyCorn = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => !item.isProvided && item.foodName.toLowerCase().includes("sweet corn") && item.quantity > 150);

      if (heavyCorn) {
        const { item, meal } = heavyCorn;
        const subG = Math.min(100, item.quantity - 150);
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const costPerG = item.costSnapshot / item.quantity;
        const subCost = Math.round(subG * costPerG);
        const subCal = Math.round(subG * calPerG);
        const subP = Math.round(subG * pPerG * 10) / 10;
        item.quantity -= subG;
        item.costSnapshot -= subCost;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        meal.costSnapshot -= subCost;
        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        currentTotalCost -= subCost;
        weekSpent -= subCost;
        continue;
      }

      // Candidate 4: Excess bread (> 3 slices)
      const excessBread = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => !item.isProvided && item.portionType === "DISCRETE" && item.foodName.toLowerCase().includes("bread") && item.quantity > 3);

      if (excessBread) {
        const { item, meal } = excessBread;
        const unitCost = Math.round(item.costSnapshot / item.quantity);
        const unitCal = Math.round(item.caloriesSnapshot / item.quantity);
        const unitP = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
        item.quantity -= 1;
        item.costSnapshot -= unitCost;
        item.caloriesSnapshot -= unitCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - unitP) * 10) / 10;
        meal.costSnapshot -= unitCost;
        meal.caloriesSnapshot -= unitCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - unitP) * 10) / 10;
        currentTotalCost -= unitCost;
        weekSpent -= unitCost;
        continue;
      }

      break;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Post-Plan Daily Reconciliation Pass:
  // Guarantees that every single day strictly satisfies:
  // - Calorie deviation within [-3.5%, +3.5%]
  // - Protein deviation within [-3.5%, +8%]
  // Uses gentle, single-step staple carbohydrate or primary protein adjustments
  // on flexible dinner/lunch items.
  // ─────────────────────────────────────────────────────────────
  const mealsByDate = new Map<string, PlannedMeal[]>();
  for (const meal of plannedMeals) {
    if (!mealsByDate.has(meal.localDate)) mealsByDate.set(meal.localDate, []);
    mealsByDate.get(meal.localDate)!.push(meal);
  }

  for (const [dateStr, dayMeals] of mealsByDate.entries()) {
    let dayCal = dayMeals.reduce((sum, m) => sum + m.caloriesSnapshot, 0);
    let dayP = Math.round(dayMeals.reduce((sum, m) => sum + m.proteinSnapshot, 0) * 10) / 10;

    let calDiff = dailyTargets.calories - dayCal;
    let calErrPct = calDiff / dailyTargets.calories;

    for (let reconcileRound = 0; reconcileRound < 4; reconcileRound++) {
    calDiff = dailyTargets.calories - dayCal;
    calErrPct = calDiff / dailyTargets.calories;
    const pErrNow = (dayP - dailyTargets.protein) / dailyTargets.protein;
    if (Math.abs(calErrPct) <= 0.035 && pErrNow >= -0.035 && pErrNow <= 0.08) break;

    // 0. Protein Overshoot Reduction (> 8% overshoot):
    // Reduce the Booster item with lowest protein density to bring protein within gate.
    if (pErrNow > 0.08) {
      const boosterItems = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .filter(({ item }) => !item.isProvided && item.quantity > 0 && item.foodName.includes("Booster"))
        .sort((a, b) => (a.item.proteinSnapshot / Math.max(1, a.item.caloriesSnapshot)) - (b.item.proteinSnapshot / Math.max(1, b.item.caloriesSnapshot)));
      const pick = boosterItems[0];
      if (pick) {
        const { item: bItem, meal: bMeal } = pick;
        const excessP = dayP - dailyTargets.protein * 1.08;
        const pPerG = bItem.proteinSnapshot / (bItem.quantity || 1);
        const step = bItem.portionType === "DISCRETE" ? 1 : 25;
        const subG = bItem.portionType === "DISCRETE"
          ? Math.min(bItem.quantity - 1, Math.max(1, Math.round(excessP / (pPerG || 0.1))))
          : Math.min(bItem.quantity - 25, Math.max(25, Math.floor((excessP / (pPerG || 0.1)) / step) * step));
        if (subG > 0 && bItem.quantity - subG >= (bItem.portionType === "DISCRETE" ? 1 : 25)) {
          const calPerUnit = bItem.caloriesSnapshot / bItem.quantity;
          const pPerUnit = bItem.proteinSnapshot / bItem.quantity;
          const cPerUnit = (bItem.carbsSnapshot || 0) / bItem.quantity;
          const subCal = Math.round(subG * calPerUnit);
          const subP = Math.round(subG * pPerUnit * 10) / 10;
          const subC = Math.round(subG * cPerUnit * 10) / 10;
          const subCost = Math.round(subG * (bItem.costSnapshot / bItem.quantity));
          bItem.quantity -= subG;
          bItem.caloriesSnapshot -= subCal;
          bItem.proteinSnapshot = Math.round((bItem.proteinSnapshot - subP) * 10) / 10;
          bItem.carbsSnapshot = Math.round(((bItem.carbsSnapshot || 0) - subC) * 10) / 10;
          bItem.costSnapshot -= subCost;
          bMeal.caloriesSnapshot -= subCal;
          bMeal.proteinSnapshot = Math.round((bMeal.proteinSnapshot - subP) * 10) / 10;
          bMeal.carbsSnapshot = Math.round((bMeal.carbsSnapshot - subC) * 10) / 10;
          bMeal.costSnapshot -= subCost;
          dayCal -= subCal;
          dayP = Math.round((dayP - subP) * 10) / 10;
          weekSpent -= subCost;
        }
      }
    }

    // 1. Protein Deficit Reconciliation (> 2.5% deficit):
    // Pick the most protein-dense paid (non-provided) protein item that is still under its sensible portion cap.
    const pDiff = dailyTargets.protein - dayP;
    const isStrict = profile.budgetPolicy === "STRICT" && (profile.weeklyBudgetTargetInr || 0) <= 1500;
    // Under STRICT budget: compute remaining headroom so top-up can't overrun
    const remainingBudgetHeadroom = isStrict && strictBudget !== null
      ? Math.max(0, strictBudget - weekSpent)
      : Infinity;
    if (pDiff / dailyTargets.protein > 0.025) {
      const maxFor = (item: PlannedMealItem) => {
        const pr = catalog.foodById.get(item.foodId)?.portion_rule;
        if (item.portionType === "DISCRETE") return Math.min(6, pr?.portion_type === "DISCRETE" ? (pr.max_sensible_portion || 6) : 6);
        if (isStrict && item.foodName.includes("Paneer")) return 75; // Strict budget caps Paneer booster to 75g max
        if (isStrict && (item.foodName.includes("Curd") || item.foodName.includes("Dahi"))) return 150;
        if (isStrict && (item.foodName.toLowerCase().includes("chana") || item.foodName.toLowerCase().includes("peanut"))) return 75; // Cheap high-protein: up to 75g, but cost-clamped below
        const dbMax = pr?.portion_type === "CONTINUOUS" ? pr.max_sensible_portion : undefined;
        return Math.min(200, dbMax || 200);
      };
      const candidatesP = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .filter(({ item }) => !item.isProvided && item.quantity > 0 &&
          (item.foodName.includes("Booster") || item.ingredientRole === "PRIMARY_PROTEIN" || item.foodName.toLowerCase().includes("chana") || item.foodName.toLowerCase().includes("soya") || item.foodName.toLowerCase().includes("sprouts")) &&
          item.quantity < maxFor(item))
        .sort((a, b) => (b.item.proteinSnapshot / Math.max(1, b.item.caloriesSnapshot)) - (a.item.proteinSnapshot / Math.max(1, a.item.caloriesSnapshot)));
      const pick = candidatesP[0];
      if (pick) {
        const { item: pItem, meal: pMeal } = pick;
        const pDensity = pItem.proteinSnapshot / (pItem.quantity || 100);
        const step = pItem.portionType === "DISCRETE" ? 1 : 25;
        const rawAdd = pItem.portionType === "DISCRETE"
          ? Math.min(2, Math.max(1, Math.round(pDiff / (pDensity || 6))))
          : Math.min(75, Math.max(25, Math.ceil((pDiff / (pDensity || 0.2)) / step) * step));
        const cap = maxFor(pItem);
        let addG = Math.max(0, Math.min(rawAdd, cap - pItem.quantity));
        // Cost clamp: never exceed remaining budget headroom (for STRICT plans)
        if (addG > 0 && isFinite(remainingBudgetHeadroom) && remainingBudgetHeadroom < 5) {
          addG = 0; // No headroom at all
        } else if (addG > 0 && isFinite(remainingBudgetHeadroom)) {
          const costPerG = (pItem.costSnapshot / (pItem.quantity || 1));
          const maxAffordableG = pItem.portionType === "DISCRETE"
            ? Math.floor(remainingBudgetHeadroom / Math.max(1, costPerG))
            : Math.floor(remainingBudgetHeadroom / Math.max(0.1, costPerG) / step) * step;
          addG = Math.min(addG, Math.max(0, maxAffordableG));
        }
        if (addG > 0) {
          const baseQ = pItem.quantity || 1;
          const calPerUnit = pItem.caloriesSnapshot / baseQ;
          const pPerUnit = pItem.proteinSnapshot / baseQ;
          const cPerUnit = (pItem.carbsSnapshot || 0) / baseQ;
          const fPerUnit = (pItem.fatSnapshot || 0) / baseQ;
          const costPerUnit = pItem.costSnapshot / baseQ;
          const addCal = Math.round(addG * calPerUnit);
          const addP = Math.round(addG * pPerUnit * 10) / 10;
          const addC = Math.round(addG * cPerUnit * 10) / 10;
          const addF = Math.round(addG * fPerUnit * 10) / 10;
          const addCost = Math.round(addG * costPerUnit);
          pItem.quantity += addG;
          pItem.caloriesSnapshot += addCal;
          pItem.proteinSnapshot = Math.round((pItem.proteinSnapshot + addP) * 10) / 10;
          pItem.carbsSnapshot = Math.round(((pItem.carbsSnapshot || 0) + addC) * 10) / 10;
          pItem.fatSnapshot = Math.round(((pItem.fatSnapshot || 0) + addF) * 10) / 10;
          pItem.costSnapshot += addCost;

          pMeal.caloriesSnapshot += addCal;
          pMeal.proteinSnapshot = Math.round((pMeal.proteinSnapshot + addP) * 10) / 10;
          pMeal.carbsSnapshot = Math.round((pMeal.carbsSnapshot + addC) * 10) / 10;
          pMeal.fatSnapshot = Math.round((pMeal.fatSnapshot + addF) * 10) / 10;
          pMeal.costSnapshot += addCost;
          dayCal += addCal;
          dayP = Math.round((dayP + addP) * 10) / 10;
          // Track reconciliation spend so future days' remaining headroom is accurate
          weekSpent += addCost;
        }
      }

      // Free mess dal protein top-up when paid items are budget-capped (₹0 out-of-pocket cost)
      const pDeficitRemaining = dailyTargets.protein - dayP;
      if (pDeficitRemaining / dailyTargets.protein > 0.025 && profile.messAvailable && profile.messMeals) {
        const messMealsWithDal = dayMeals
          .filter(m => m.sourceType === "TEMPLATE" && m.items?.some(i => i.isProvided && i.foodName.toLowerCase().includes("dal")));
        const messMealWithDal = [...messMealsWithDal].sort((a, b) => {
          const dalA = a.items?.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal"))?.quantity || 0;
          const dalB = b.items?.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal"))?.quantity || 0;
          return dalA - dalB;
        })[0];
        if (messMealWithDal && messMealWithDal.items) {
          const dalItem = messMealWithDal.items.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal"));
          if (dalItem && dalItem.quantity < 350) {
            const addDalG = Math.min(150, Math.max(50, Math.ceil((pDeficitRemaining / 0.06) / 25) * 25));
            const oldQ = dalItem.quantity || 150;
            const calPerG = dalItem.caloriesSnapshot / oldQ;
            const pPerG = dalItem.proteinSnapshot / oldQ;
            const dalCal = Math.round(addDalG * calPerG);
            const dalP = Math.round(addDalG * pPerG * 10) / 10;
            dalItem.quantity += addDalG;
            dalItem.caloriesSnapshot += dalCal;
            dalItem.proteinSnapshot = Math.round((dalItem.proteinSnapshot + dalP) * 10) / 10;
            messMealWithDal.caloriesSnapshot += dalCal;
            messMealWithDal.proteinSnapshot = Math.round((messMealWithDal.proteinSnapshot + dalP) * 10) / 10;
            dayCal += dalCal;
            dayP = Math.round((dayP + dalP) * 10) / 10;
          }
        }
      }
    }

    // Recalculate calorie differences after protein adjustment
    calDiff = dailyTargets.calories - dayCal;
    calErrPct = calDiff / dailyTargets.calories;

    // 2. Calorie Deficit Reconciliation (> 2.5% deficit):
    if (calErrPct > 0.025) {
      const mealsWithRoti = dayMeals
        .filter(m => m.items?.some(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti")));
      const rotiMeal = [...mealsWithRoti].sort((a, b) => {
        const chA = a.items?.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"))?.quantity || 0;
        const chB = b.items?.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"))?.quantity || 0;
        return chA - chB;
      })[0];
      if (rotiMeal && rotiMeal.items) {
        const chapatiItem = rotiMeal.items.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"));
        if (chapatiItem && chapatiItem.quantity < 7) {
          const neededChapatis = Math.min(2, Math.max(1, Math.ceil(calDiff / 105)));
          const unitCal = Math.round(chapatiItem.caloriesSnapshot / (chapatiItem.quantity || 1));
          const unitP = Math.round((chapatiItem.proteinSnapshot / (chapatiItem.quantity || 1)) * 10) / 10;
          const unitC = Math.round(((chapatiItem.carbsSnapshot || 0) / (chapatiItem.quantity || 1)) * 10) / 10;
          const unitCost = chapatiItem.isProvided ? 0 : Math.round((chapatiItem.costSnapshot || 0) / (chapatiItem.quantity || 1));
          chapatiItem.quantity += neededChapatis;
          const addCal = neededChapatis * (unitCal || 105);
          const addP = Math.round(neededChapatis * (unitP || 3.2) * 10) / 10;
          const addC = Math.round(neededChapatis * (unitC || 21) * 10) / 10;
          const addCost = neededChapatis * unitCost;
          chapatiItem.caloriesSnapshot += addCal;
          chapatiItem.proteinSnapshot = Math.round((chapatiItem.proteinSnapshot + addP) * 10) / 10;
          chapatiItem.carbsSnapshot = Math.round((chapatiItem.carbsSnapshot + addC) * 10) / 10;
          chapatiItem.costSnapshot = (chapatiItem.costSnapshot || 0) + addCost;

          rotiMeal.caloriesSnapshot += addCal;
          rotiMeal.proteinSnapshot = Math.round((rotiMeal.proteinSnapshot + addP) * 10) / 10;
          rotiMeal.carbsSnapshot = Math.round((rotiMeal.carbsSnapshot + addC) * 10) / 10;
          rotiMeal.costSnapshot = (rotiMeal.costSnapshot || 0) + addCost;
          dayCal += addCal;
          dayP = Math.round((dayP + addP) * 10) / 10;
          weekSpent += addCost;
        }
      } else {
        const riceMeal = dayMeals.find(m => m.items?.some(i => i.foodName.toLowerCase().includes("rice")));
        if (riceMeal && riceMeal.items) {
          const riceItem = riceMeal.items.find(i => i.foodName.toLowerCase().includes("rice"));
          if (riceItem) {
            const addG = Math.min(150, Math.max(25, Math.round((calDiff / 1.3) / 25) * 25));
            riceItem.quantity += addG;
            const addCal = Math.round(addG * 1.3);
            const addP = Math.round(addG * 0.027 * 10) / 10;
            const addC = Math.round(addG * 0.28 * 10) / 10;
            riceItem.caloriesSnapshot += addCal;
            riceItem.proteinSnapshot = Math.round((riceItem.proteinSnapshot + addP) * 10) / 10;
            riceItem.carbsSnapshot = Math.round((riceItem.carbsSnapshot + addC) * 10) / 10;

            riceMeal.caloriesSnapshot += addCal;
            riceMeal.proteinSnapshot = Math.round((riceMeal.proteinSnapshot + addP) * 10) / 10;
            riceMeal.carbsSnapshot = Math.round((riceMeal.carbsSnapshot + addC) * 10) / 10;
            dayCal += addCal;
            dayP = Math.round((dayP + addP) * 10) / 10;
          }
        }
      }
    }

    // Recalculate for overshoot check
    calDiff = dailyTargets.calories - dayCal;
    calErrPct = calDiff / dailyTargets.calories;

    // 3. Calorie Overshoot Reconciliation (> 3.5% overshoot):
    // Executed LAST to strictly enforce daily upper calorie gate
    let overshootAttempts = 0;
    while ((dailyTargets.calories - dayCal) / dailyTargets.calories < -0.035 && overshootAttempts < 5) {
      overshootAttempts++;
      const excessCal = Math.abs(dailyTargets.calories - dayCal);

      // Try continuous staple carbs first (e.g. Steamed White Rice, Brown Rice, Oats, Sweet Corn)
      const continuousCarbItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("sweet corn")) && item.portionType === "CONTINUOUS" && item.quantity >= 60);

      if (continuousCarbItem) {
        const { item, meal } = continuousCarbItem;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const cPerG = item.carbsSnapshot / item.quantity;
        const subG = Math.min(150, Math.max(25, Math.round((excessCal / (calPerG || 1.3)) / 25) * 25));
        if (item.quantity - subG >= 30) {
          item.quantity -= subG;
          const subCal = Math.round(subG * calPerG);
          const subP = Math.round(subG * pPerG * 10) / 10;
          const subC = Math.round(subG * cPerG * 10) / 10;
          item.caloriesSnapshot -= subCal;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
          item.carbsSnapshot = Math.round((item.carbsSnapshot - subC) * 10) / 10;

          meal.caloriesSnapshot -= subCal;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
          meal.carbsSnapshot = Math.round((meal.carbsSnapshot - subC) * 10) / 10;
          dayCal -= subCal;
          dayP = Math.round((dayP - subP) * 10) / 10;
          continue;
        }
      }

      // Try discrete staple carbs next (e.g. Roti > 1, Toast > 1, Cheela > 1, Paratha > 1)
      // Protect protein-rich staples (chapatis/cheela) if the day is already in protein deficit!
      const discreteCarbItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => {
          if (item.portionType !== "DISCRETE" || item.quantity <= 1) return false;
          if (dayP < dailyTargets.protein * 0.97 && (item.foodName.includes("Chapati") || item.foodName.includes("Roti") || item.foodName.includes("Cheela"))) {
            return false; // Protect protein staple!
          }
          return item.ingredientRole === "STAPLE_CARB" || item.foodName.includes("Cheela") || item.foodName.includes("Paratha") || item.foodName.includes("Bread");
        });

      if (discreteCarbItem) {
        const { item, meal } = discreteCarbItem;
        const calPerPiece = item.caloriesSnapshot / item.quantity;
        const pPerPiece = item.proteinSnapshot / item.quantity;
        const cPerPiece = item.carbsSnapshot / item.quantity;
        item.quantity -= 1;
        const subCal = Math.round(calPerPiece);
        const subP = Math.round(pPerPiece * 10) / 10;
        const subC = Math.round(cPerPiece * 10) / 10;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        item.carbsSnapshot = Math.round((item.carbsSnapshot - subC) * 10) / 10;

        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        meal.carbsSnapshot = Math.round((meal.carbsSnapshot - subC) * 10) / 10;
        dayCal -= subCal;
        dayP = Math.round((dayP - subP) * 10) / 10;
        continue;
      }

      // No more reducible carbs found
      break;
    }
    } // end reconcileRound
  }

  const canonicalRecipeIdLookup = (recipeVersionId: string) => {
    const item = catalog.recipes.find(r => r.recipeVersion.id === recipeVersionId);
    return item ? item.recipe.slug : recipeVersionId;
  };

  // Quality Validation
  const valResult = validate7DayPlan(
    plannedMeals,
    profile,
    dailyTargets.calories,
    dailyTargets.protein,
    foodAllergensLookup,
    canonicalRecipeIdLookup
  );

  const startDate = plannedMeals[0]?.localDate || baseDate.toISOString().split("T")[0];
  const endDate = plannedMeals[plannedMeals.length - 1]?.localDate || startDate;

  return {
    planId,
    startDate,
    endDate,
    dailyTargets,
    plannedMeals,
    dailySummaries: valResult.dailySummaries,
    metrics: valResult.metrics,
    warnings: valResult.warnings
  };
}
