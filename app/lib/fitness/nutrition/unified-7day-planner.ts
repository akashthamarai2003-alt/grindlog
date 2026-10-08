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
  matchesAllergen,
  isFoodAllergenSafe
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
  status?: "VALID_PLAN" | "NO_FEASIBLE_PLAN";
  infeasibleReasons?: string[];
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

  // Activity Multiplier (strictly normalizes onboarding desk/sitting values)
  let activityMultiplier = 1.375;
  const act = (profile.activityLevel || "").toLowerCase();
  const isSedentary = act.includes("sedentary") || act.includes("sitting") || act.includes("desk");
  const isLight = act.includes("light");
  const isModerate = act.includes("moderate");
  const isVeryActive = act.includes("very") || act.includes("heavy") || act.includes("athlete");

  if (isSedentary) activityMultiplier = 1.2;
  else if (isLight) activityMultiplier = 1.375;
  else if (isModerate) activityMultiplier = 1.55;
  else if (isVeryActive) activityMultiplier = 1.725;

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
  } else if (isSedentary) {
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
  sleepTime?: string | null,
  workoutTime?: string | null
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
  const wHour = parseInt((workoutTime || "18:00:00").split(":")[0], 10) || 18;
  const isEveningWorkout = wHour >= 16 && wHour <= 21;
  const slot5Type: MealSlotType = isEveningWorkout ? "post_workout" : "snack";

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
      slot: slot5Type,
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
      allergens: Array.isArray(f.allergens) ? f.allergens : [],
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
  const slotAllocations = calculateSlotAllocations(
    dailyTargets,
    profile.mealsPerDay,
    profile.wakeTime,
    profile.sleepTime,
    profile.workoutTime
  );

  // Determine start date
  const now = new Date();
  const baseDate = startDateStr ? new Date(startDateStr) : now;

  const planId = generateDeterministicUuid("meal_plan", `${profile.userId}:${baseDate.toISOString().split("T")[0]}`);
  const plannedMeals: PlannedMeal[] = [];

  // 0. Physical & Financial Feasibility Pre-Check
  const userEquip = new Set(profile.availableEquipment || []);
  const hasNoCookstove = (!userEquip.has("stove") && !userEquip.has("microwave"));
  const isKettleOrNone = userEquip.has("kettle") || userEquip.has("none") || userEquip.size === 0;

  if (hasNoCookstove && isKettleOrNone && !profile.messAvailable && dailyTargets.calories >= 2100) {
    const reasons = [
      "EQUIPMENT_INSUFFICIENT_FOR_HOME_COOKING",
      "Kettle or cold prep cannot prepare complete lunch and dinner main meals without a cooking stove or hostel mess provision."
    ];
    return {
      planId,
      startDate: baseDate.toISOString().split("T")[0],
      endDate: new Date(baseDate.getTime() + 6 * 86400000).toISOString().split("T")[0],
      dailyTargets,
      plannedMeals: [],
      dailySummaries: [],
      metrics: {
        hardConstraintPass: false,
        calorieFit: 0,
        proteinFit: 0,
        budgetFit: 0,
        varietyFit: 0,
        preferenceFit: 0,
        environmentFit: 0,
        availableFoodFit: 0,
        compositeScore: 0,
        failureReasons: reasons
      },
      warnings: reasons,
      status: "NO_FEASIBLE_PLAN",
      infeasibleReasons: reasons
    };
  }

  if (!profile.messAvailable && profile.budgetPolicy === "STRICT" && (
    ((profile.weeklyBudgetTargetInr || 0) <= 500 && dailyTargets.calories >= 2400) ||
    ((profile.weeklyBudgetTargetInr || 0) <= 350 && dailyTargets.calories >= 1700)
  )) {
    const reasons = [
      "BUDGET_TOO_LOW_FOR_CALORIE_TARGET",
      `Weekly budget ₹${profile.weeklyBudgetTargetInr} (₹${Math.round((profile.weeklyBudgetTargetInr || 250) / 7)}/day) cannot realistically cover home groceries for ${dailyTargets.calories} kcal/day.`
    ];
    return {
      planId,
      startDate: baseDate.toISOString().split("T")[0],
      endDate: new Date(baseDate.getTime() + 6 * 86400000).toISOString().split("T")[0],
      dailyTargets,
      plannedMeals: [],
      dailySummaries: [],
      metrics: {
        hardConstraintPass: false,
        calorieFit: 0,
        proteinFit: 0,
        budgetFit: 0,
        varietyFit: 0,
        preferenceFit: 0,
        environmentFit: 0,
        availableFoodFit: 0,
        compositeScore: 0,
        failureReasons: reasons
      },
      warnings: reasons,
      status: "NO_FEASIBLE_PLAN",
      infeasibleReasons: reasons
    };
  }

  const recipeUsageCount = new Map<string, number>();
  const normalizeProteinName = (p: string) => {
    const l = (p || "").toLowerCase();
    if (l.includes("soya")) return "soya";
    if (l.includes("egg")) return "egg";
    if (l.includes("paneer")) return "paneer";
    if (l.includes("chicken")) return "chicken";
    if (l.includes("fish") || l.includes("prawn")) return "fish";
    if (l.includes("tofu")) return "tofu";
    if (l.includes("chana") || l.includes("chole") || l.includes("chickpea")) return "chana";
    if (l.includes("rajma") || l.includes("kidney bean")) return "rajma";
    if (l.includes("sprouts") || l.includes("moong")) return "moong";
    if (l.includes("dal") || l.includes("lentil")) return "dal";
    return l;
  };
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
    const estBoosterCostPerMeal = profile.dietPreference === "vegan"
      ? 12
      : ((profile.weeklyBudgetTargetInr || 0) <= 350
        ? 10
        : ((profile.weeklyBudgetTargetInr || 0) <= 600 ? 14 : 25));
    const estRemainingMessSpend = remainingMessMeals * estBoosterCostPerMeal;
    const remainingRecipeBudget = Math.max(20, strictBudget - weekSpent - estRemainingMessSpend);
    const remainingRecipeMeals = Math.max(1, totalRecipeMealsInWeek - recipeMealsCompleted);
    const minSensibleMealCap = Math.max(28, (strictBudget / 7) * 0.45);
    const avgMealBudget = Math.max(minSensibleMealCap, remainingRecipeBudget / remainingRecipeMeals);
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

        const avoidGluten = !isFoodAllergenSafe("Chapati / Phulka", [], profile.allergies);
        const avoidDairy = !isFoodAllergenSafe("Low Fat Paneer", ["dairy"], profile.allergies);
        const stapleFood = (avoidGluten ? foodLookup("White Rice (Steamed)") : foodLookup("Chapati / Phulka")) || catalog.foods[0];
        let dalFood = (profile.dietPreference === "vegan" || avoidDairy
          ? foodLookup("Yellow Moong Dal")
          : foodLookup("Dal Tadka")) || catalog.foods[1];
        if (!isFoodAllergenSafe(dalFood.name, dalFood.allergens, profile.allergies)) {
          dalFood = foodLookup("Yellow Moong Dal") || catalog.foods[1];
        }
        let sabziFood = foodLookup("Mixed Vegetable Sabzi") || foodLookup("Green Salad") || catalog.foods[2];
        if (!isFoodAllergenSafe(sabziFood.name, sabziFood.allergens, profile.allergies)) {
          sabziFood = foodLookup("Green Salad") || catalog.foods[2];
        }

        let boosterFood = foodLookup("Low Fat Curd / Dahi") || catalog.foods[3];
        let boosterDefaultPortion = 150;
        let boosterUnit = "g";
        let boosterPortionType: "DISCRETE" | "CONTINUOUS" = "CONTINUOUS";

        const isStrictBudget = Boolean(profile.budgetPolicy === "STRICT" && profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr <= 1500);
        const isTightBudget = Boolean(profile.budgetPolicy === "STRICT" && profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr <= 600);
        const isUltraLowBudget = Boolean(profile.budgetPolicy === "STRICT" && profile.weeklyBudgetTargetInr && profile.weeklyBudgetTargetInr <= 350);
        const isHighProteinNeeds = alloc.targetProtein >= 28 || dailyTargets.protein >= 100;

        if (profile.dietPreference === "vegan" || avoidDairy) {
          if (isHighProteinNeeds) {
            const chanaFood = foodLookup("Roasted Chana (Dry Chickpeas)");
            boosterFood = chanaFood || catalog.foods[3];
          } else {
            const isFirstMeal = alloc.slot === "lunch" || alloc.slot === "breakfast";
            const candidate1 = foodLookup("Moong Sprouts Salad") || catalog.foods[3];
            const candidate2 = foodLookup("Roasted Chana (Dry Chickpeas)") || catalog.foods[3];
            if (isFoodAllergenSafe(candidate1.name, candidate1.allergens, profile.allergies)) {
              boosterFood = (dayOffset % 2 === 0 ? isFirstMeal : !isFirstMeal) ? candidate1 : candidate2;
            } else {
              boosterFood = candidate2;
            }
          }
          boosterUnit = "g";
          boosterPortionType = "CONTINUOUS";
        } else if (profile.dietPreference === "eggetarian" || profile.dietPreference === "non-veg") {
          if (isFoodAllergenSafe("Boiled Egg (Whole)", ["egg"], profile.allergies)) {
            const isFirstMeal = alloc.slot === "lunch" || alloc.slot === "breakfast";
            boosterFood = (dayOffset % 2 === 0 ? isFirstMeal : !isFirstMeal)
              ? (foodLookup("Boiled Egg (Whole)") || catalog.foods[3])
              : (foodLookup("Boiled Egg White") || catalog.foods[3]);
            boosterUnit = "piece";
            boosterPortionType = "DISCRETE";
          } else {
            boosterFood = isUltraLowBudget
              ? (foodLookup("Low Fat Curd / Dahi") || catalog.foods[3])
              : (foodLookup("Low Fat Paneer") || catalog.foods[3]);
            boosterUnit = "g";
            boosterPortionType = "CONTINUOUS";
          }
        } else {
          // Vegetarian:
          if (isUltraLowBudget) {
            // Under ultra tight budget (<= ₹350/wk), rotate Curd and Sprouts
            const isSproutsSlot = alloc.slot === "lunch" || (dayOffset % 2 === 0 ? alloc.slot === "breakfast" : alloc.slot === "dinner");
            boosterFood = isSproutsSlot
              ? (foodLookup("Moong Sprouts Salad") || foodLookup("Low Fat Curd / Dahi") || catalog.foods[3])
              : (foodLookup("Low Fat Curd / Dahi") || catalog.foods[3]);
          } else if (isTightBudget) {
            // Under tight budget (₹351–600/wk): Paneer at lunch ONLY; Breakfast and Dinner use Curd
            boosterFood = alloc.slot === "lunch"
              ? (foodLookup("Low Fat Paneer") || catalog.foods[3])
              : (foodLookup("Low Fat Curd / Dahi") || catalog.foods[3]);
          } else {
            // Standard budget (> ₹600/wk): Paneer at lunch and breakfast, Curd at dinner
            boosterFood = (alloc.slot === "lunch" || alloc.slot === "breakfast")
              ? (foodLookup("Low Fat Paneer") || catalog.foods[3])
              : (foodLookup("Low Fat Curd / Dahi") || catalog.foods[3]);
          }
          boosterUnit = "g";
          boosterPortionType = "CONTINUOUS";
        }

        // Final allergen safety guard on booster
        if (!isFoodAllergenSafe(boosterFood.name, boosterFood.allergens, profile.allergies)) {
          const alt1 = foodLookup("Moong Sprouts Salad");
          const alt2 = foodLookup("Roasted Chana (Dry Chickpeas)");
          if (alt1 && isFoodAllergenSafe(alt1.name, alt1.allergens, profile.allergies)) {
            boosterFood = alt1;
            boosterUnit = "g";
            boosterPortionType = "CONTINUOUS";
          } else if (alt2 && isFoodAllergenSafe(alt2.name, alt2.allergens, profile.allergies)) {
            boosterFood = alt2;
            boosterUnit = "g";
            boosterPortionType = "CONTINUOUS";
          }
        }

        const roundTo1 = (v: number) => Math.round(v * 10) / 10;

        // 1. Dal portion: default 150g, scaled to 175-250g for high protein needs or strict budget (₹0 cost)
        const defaultDalG = (isHighProteinNeeds || isStrictBudget)
          ? (alloc.slot === "breakfast" ? (isStrictBudget ? 225 : 175) : (isTightBudget ? 275 : 225))
          : 150;
        const dalSw = dalFood.serving_weight_g || 100;
        const dalRatio = defaultDalG / dalSw;
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

        if (boosterPortionType === "DISCRETE") {
          minB = (isHighProteinNeeds || dailyTargets.protein >= 100) ? 2 : 1;
          maxB = isTightBudget ? 3 : (isStrictBudget ? 4 : 5);
          stepB = 1;
        } else if (boosterFood.name.includes("Curd") || boosterFood.name.includes("Dahi")) {
          minB = isUltraLowBudget ? 60 : (isTightBudget ? 80 : 100);
          maxB = isUltraLowBudget ? 80 : (isTightBudget ? 100 : (isStrictBudget ? 150 : 350));
          stepB = 20;
        } else if (boosterFood.name.includes("Paneer")) {
          minB = 40;
          maxB = isTightBudget ? 50 : (isStrictBudget ? 75 : 150);
          stepB = 25;
        } else if (boosterFood.name.includes("Sprouts")) {
          minB = isUltraLowBudget ? 50 : 75;
          maxB = isUltraLowBudget ? 80 : (isTightBudget ? 100 : (isStrictBudget ? 150 : 250));
          stepB = 25;
        } else if (boosterFood.name.includes("Chana")) {
          minB = 20;
          maxB = isUltraLowBudget ? 30 : 50;
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

        const bCenter = boosterPortionType === "DISCRETE" ? Math.round(idealB) : Math.round(idealB / stepB) * stepB;
        const bVals = [...new Set([
          Math.max(minB, Math.min(maxB, bCenter - (boosterPortionType === "DISCRETE" ? 1 : stepB))),
          Math.max(minB, Math.min(maxB, bCenter)),
          Math.max(minB, Math.min(maxB, bCenter + (boosterPortionType === "DISCRETE" ? 1 : stepB))),
          Math.max(minB, Math.min(maxB, boosterPortionType === "DISCRETE" ? Math.floor(idealB) : Math.floor(idealB / stepB) * stepB)),
          Math.max(minB, Math.min(maxB, boosterPortionType === "DISCRETE" ? Math.ceil(idealB) : Math.ceil(idealB / stepB) * stepB))
        ])];

        const sCenter = isStapleDiscrete ? Math.round(idealS) : Math.round(idealS / stepS) * stepS;
        const sVals = [...new Set([
          Math.max(minS, Math.min(maxS, sCenter - (isStapleDiscrete ? 2 : stepS * 2))),
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
            quantity: defaultDalG,
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
        const affordable = rawCandidates.filter(c => c.estimatedCost <= cap && (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 3);
        const hasAdequateProteinInAffordable = alloc.targetProtein < 25 || affordable.some(c => c.selectedVariant.targetProtein >= alloc.targetProtein * 0.55);
        candidates = (affordable.length >= 2 && hasAdequateProteinInAffordable)
          ? affordable
          : [...rawCandidates].filter(c => (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 4).sort((a, b) => {
              const pDeltaA = Math.abs(a.selectedVariant.targetProtein - alloc.targetProtein);
              const pDeltaB = Math.abs(b.selectedVariant.targetProtein - alloc.targetProtein);
              if (alloc.targetProtein >= 28 && Math.abs(pDeltaA - pDeltaB) > 8) return pDeltaA - pDeltaB;
              return a.estimatedCost - b.estimatedCost;
            }).slice(0, Math.max(8, rawCandidates.length));
        if (candidates.length === 0) candidates = rawCandidates;
      }

      // Choose candidate minimizing repetition using canonical recipe ID and primary protein rotation
      let chosenCandidate: CandidateMeal | null = null;
      for (const cand of candidates) {
        const canonicalId = cand.catalogItem.recipe.slug;
        const primaryProtein = cand.catalogItem.recipeVersion.primaryProtein;
        const normProtein = normalizeProteinName(primaryProtein);

        // Rule 1: Never repeat the same canonical dish on the same day
        if (usedRecipesToday.has(canonicalId)) continue;

        // Rule 2: Max repeats in 7-day week (hard limit 3 when viable alternatives exist; allow 4 if alternatives lack protein)
        const totalUsed = recipeUsageCount.get(canonicalId) || 0;
        if (totalUsed >= 3) {
          const hasAlternativeWithProtein = candidates.some(
            c => c.catalogItem.recipe.slug !== canonicalId &&
                 !usedRecipesToday.has(c.catalogItem.recipe.slug) &&
                 (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 3 &&
                 c.selectedVariant.targetProtein >= alloc.targetProtein * 0.60
          );
          if (hasAlternativeWithProtein || totalUsed >= 4) continue;
        }

        if (totalUsed >= 2) {
          const targetProteinRatio = (alloc.targetProtein * 4) / alloc.targetCalories;
          const isHighProteinSlot = targetProteinRatio >= 0.28;

          const viableAlternatives = candidates.filter(
            c => c.catalogItem.recipe.slug !== canonicalId &&
                 !usedRecipesToday.has(c.catalogItem.recipe.slug) &&
                 (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 2 &&
                 Math.abs(c.selectedVariant.targetProtein - alloc.targetProtein) <= Math.max(3.5, alloc.targetProtein * 0.22) &&
                 (!isHighProteinSlot || (
                   (c.selectedVariant.targetProtein * 4) / c.selectedVariant.targetCalories >= 0.28 &&
                   !c.catalogItem.recipeVersion.primaryProtein.toLowerCase().includes("dal") &&
                   !c.catalogItem.recipeVersion.primaryProtein.toLowerCase().includes("lentil")
                 ))
          );
          if (viableAlternatives.length >= 1) continue;
        }

        // Rule 3: Rotate primary protein (do not repeat same primary protein in 3 consecutive meals)
        if (consecutiveProteinCount >= 2 && lastPrimaryProtein === normProtein && candidates.length > 3) continue;

        chosenCandidate = cand;
        break;
      }

      if (!chosenCandidate && candidates.length > 0) {
        // Fallback: pick candidate not used today with lowest weekly usage and best protein proximity
        const maxRepLimit = candidates.some(c => (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < 3) ? 3 : 4;
        const notUsedToday = candidates.filter(
          c => !usedRecipesToday.has(c.catalogItem.recipe.slug) && (recipeUsageCount.get(c.catalogItem.recipe.slug) || 0) < maxRepLimit
        );
        const pool = notUsedToday.length > 0 ? notUsedToday : candidates;
        pool.sort((a, b) => {
          const pRelA = Math.abs(a.selectedVariant.targetProtein - alloc.targetProtein) / (alloc.targetProtein || 30);
          const pRelB = Math.abs(b.selectedVariant.targetProtein - alloc.targetProtein) / (alloc.targetProtein || 30);
          if (pRelA > 0.30 && pRelB <= 0.25) return 1;
          if (pRelB > 0.30 && pRelA <= 0.25) return -1;
          if (pRelA > 0.20 && pRelB <= 0.15) return 1;
          if (pRelB > 0.20 && pRelA <= 0.15) return -1;

          const usageA = recipeUsageCount.get(a.catalogItem.recipe.slug) || 0;
          const usageB = recipeUsageCount.get(b.catalogItem.recipe.slug) || 0;
          if (usageA !== usageB) return usageA - usageB;
          return pRelA - pRelB;
        });
        chosenCandidate = pool[0];
      }

      if (!chosenCandidate) {
        const reasons = [
          "NO_CANDIDATE_MATCHES_CONSTRAINTS",
          `Unable to generate meal for slot ${alloc.slot} on ${dateStr} satisfying diet (${profile.dietPreference}), allergies (${(profile.allergies || []).join(", ") || "none"}), and equipment.`
        ];
        return {
          planId,
          startDate: baseDate.toISOString().split("T")[0],
          endDate: new Date(baseDate.getTime() + 6 * 86400000).toISOString().split("T")[0],
          dailyTargets,
          plannedMeals: [],
          dailySummaries: [],
          metrics: {
            hardConstraintPass: false,
            calorieFit: 0,
            proteinFit: 0,
            budgetFit: 0,
            varietyFit: 0,
            preferenceFit: 0,
            environmentFit: 0,
            availableFoodFit: 0,
            compositeScore: 0,
            failureReasons: reasons
          },
          warnings: reasons,
          status: "NO_FEASIBLE_PLAN",
          infeasibleReasons: reasons
        };
      }

      const rv = chosenCandidate.catalogItem.recipeVersion;
      const variant = chosenCandidate.selectedVariant;
      const img = chosenCandidate.catalogItem.image;
      const canonicalId = chosenCandidate.catalogItem.recipe.slug;

      usedRecipesToday.add(canonicalId);
      recipeUsageCount.set(canonicalId, (recipeUsageCount.get(canonicalId) || 0) + 1);

      const normProtein = normalizeProteinName(rv.primaryProtein);
      if (lastPrimaryProtein === normProtein) {
        consecutiveProteinCount++;
      } else {
        lastPrimaryProtein = normProtein;
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

        if (bananaFood && isFoodAllergenSafe(bananaFood.name, bananaFood.allergens, profile.allergies)) {
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
        } else if (breadFood && isFoodAllergenSafe(breadFood.name, breadFood.allergens, profile.allergies)) {
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

    while (currentTotalCost > strictBudget && guardIterations < 60) {
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

      // Candidate 5: Continuous mess protein boosters (e.g. Sprouts, Curd, Paneer)
      // Trim from the most expensive booster items first to distribute cuts evenly
      const boosterCandidates = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .filter(({ item, meal }) => {
          if (item.isProvided || !item.foodName.includes("Booster") || item.portionType !== "CONTINUOUS") return false;
          const minQ = item.foodName.includes("Paneer") ? 40 : (item.foodName.includes("Curd") ? 75 : 25);
          if (item.quantity <= minQ || item.costSnapshot < 8) return false;
          // Protect boosters on days where trimming would drop protein below -3.5% of target
          const dMeals = plannedMeals.filter(pm => pm.localDate === meal.localDate);
          const currentDayP = dMeals.reduce((s, pm) => s + (pm.proteinSnapshot || 0), 0);
          const subG = Math.min(25, item.quantity - minQ);
          const pPerG = item.proteinSnapshot / (item.quantity || 1);
          if (currentDayP - (subG * pPerG) < dailyTargets.protein * 0.965) return false;
          return true;
        })
        .sort((a, b) => b.item.costSnapshot - a.item.costSnapshot);

      const expensiveBooster = boosterCandidates[0];
      if (expensiveBooster) {
        const { item, meal } = expensiveBooster;
        const minQ = item.foodName.includes("Paneer") ? 40 : (item.foodName.includes("Curd") ? 75 : 25);
        const subG = Math.min(25, item.quantity - minQ);
        if (subG > 0) {
          const costPerG = item.costSnapshot / item.quantity;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
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
      }

      // Candidate 6: Discrete boosters (e.g. Boiled Egg > 1 piece)
      const discreteBooster = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item, meal }) => {
          if (item.isProvided || !item.foodName.includes("Booster") || item.portionType !== "DISCRETE" || item.quantity <= 1) return false;
          // Protect boosters on days where trimming would drop protein below -3% of target
          const dMeals = plannedMeals.filter(pm => pm.localDate === meal.localDate);
          const currentDayP = dMeals.reduce((s, pm) => s + (pm.proteinSnapshot || 0), 0);
          const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
          if (currentDayP - pUnit < dailyTargets.protein * 0.97) return false;
          return true;
        });

      if (discreteBooster) {
        const { item, meal } = discreteBooster;
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

      // Candidate 7: Recipe meal continuous ingredients (e.g. Chana > 90g, Paneer > 80g, Broccoli > 35g)
      const heavyRecipeCandidates = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .filter(({ item }) => !item.isProvided && item.portionType === "CONTINUOUS" && item.costSnapshot >= 12 && item.quantity > 35)
        .sort((a, b) => b.item.costSnapshot - a.item.costSnapshot);

      const heavyRecipeItem = heavyRecipeCandidates[0];
      if (heavyRecipeItem) {
        const { item, meal } = heavyRecipeItem;
        const subG = Math.min(25, item.quantity - 35);
        if (subG > 0) {
          const costPerG = item.costSnapshot / item.quantity;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
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
      }

      // Candidate 8: Any remaining paid continuous item with cost >= 8 and quantity > 25
      const paidContinuousItem = plannedMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => !item.isProvided && item.portionType === "CONTINUOUS" && item.costSnapshot >= 8 && item.quantity > 25);

      if (paidContinuousItem) {
        const { item, meal } = paidContinuousItem;
        const subG = Math.min(25, item.quantity - 25);
        if (subG > 0) {
          const costPerG = item.costSnapshot / item.quantity;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
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



    // 1. Protein Deficit Reconciliation (> 2.5% deficit):
    const pDiff = dailyTargets.protein - dayP;
    if (pDiff / dailyTargets.protein > 0.025) {
      // 1A. Mess Users: Leverage FREE Mess Dal & Roti adjustments FIRST (₹0 out-of-pocket cost)
      if (profile.messAvailable && profile.messMeals) {
        // If calories don't have enough headroom for pure Dal addition, exchange 1 chapati for 75g dal!
        if (dayCal >= dailyTargets.calories * 0.98) {
          const messMealsWithRotiAndDal = dayMeals.filter(m =>
            m.sourceType === "TEMPLATE" &&
            m.items?.some(i => i.isProvided && (i.foodName.includes("Chapati") || i.foodName.includes("Phulka")) && i.quantity >= 2) &&
            m.items?.some(i => i.isProvided && i.foodName.toLowerCase().includes("dal") && i.quantity < 400)
          );
          for (const m of messMealsWithRotiAndDal) {
            if ((dailyTargets.protein - dayP) / dailyTargets.protein <= 0.025) break;
            const rotiItem = m.items?.find(i => i.isProvided && (i.foodName.includes("Chapati") || i.foodName.includes("Phulka")) && i.quantity >= 2);
            const dalItem = m.items?.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal") && i.quantity < 400);
            if (rotiItem && dalItem) {
              rotiItem.quantity -= 1;
              rotiItem.caloriesSnapshot -= 105;
              rotiItem.proteinSnapshot = Math.round((rotiItem.proteinSnapshot - 3.2) * 10) / 10;
              m.caloriesSnapshot -= 105;
              m.proteinSnapshot = Math.round((m.proteinSnapshot - 3.2) * 10) / 10;
              dayCal -= 105;
              dayP = Math.round((dayP - 3.2) * 10) / 10;

              const addDalG = Math.min(75, 400 - dalItem.quantity);
              const oldQ = dalItem.quantity || 150;
              const calPerG = dalItem.caloriesSnapshot / oldQ;
              const pPerG = dalItem.proteinSnapshot / oldQ;
              const dalCal = Math.round(addDalG * calPerG);
              const dalP = Math.round(addDalG * pPerG * 10) / 10;
              dalItem.quantity += addDalG;
              dalItem.caloriesSnapshot += dalCal;
              dalItem.proteinSnapshot = Math.round((dalItem.proteinSnapshot + dalP) * 10) / 10;
              m.caloriesSnapshot += dalCal;
              m.proteinSnapshot = Math.round((m.proteinSnapshot + dalP) * 10) / 10;
              dayCal += dalCal;
              dayP = Math.round((dayP + dalP) * 10) / 10;
            }
          }
        }

        // Pure Dal addition if headroom exists
        const pDefAfterEx = dailyTargets.protein - dayP;
        if (pDefAfterEx / dailyTargets.protein > 0.025 && dayCal < dailyTargets.calories * 1.045) {
          const messMealsWithDal = dayMeals
            .filter(m => m.sourceType === "TEMPLATE" && m.items?.some(i => i.isProvided && i.foodName.toLowerCase().includes("dal")));
          for (const messMealWithDal of messMealsWithDal) {
            if ((dailyTargets.protein - dayP) / dailyTargets.protein <= 0.025 || dayCal >= dailyTargets.calories * 1.045) break;
            const dalItem = messMealWithDal.items?.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal"));
            if (dalItem && dalItem.quantity < 400) {
              const oldQ = dalItem.quantity || 150;
              const calPerG = dalItem.caloriesSnapshot / oldQ;
              const pPerG = dalItem.proteinSnapshot / oldQ;
              const maxDalAllowed = Math.min(400 - dalItem.quantity, Math.floor(Math.max(0, dailyTargets.calories * 1.045 - dayCal) / (calPerG || 1.1) / 25) * 25);
              const addDalG = Math.min(maxDalAllowed, Math.min(75, Math.max(25, Math.ceil(((dailyTargets.protein - dayP) / (pPerG || 0.06)) / 25) * 25)));
              if (addDalG >= 25) {
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
      }

      // 1B. Paid Protein Items: Pick the most protein-dense paid (non-provided) protein item if deficit remains
      const pDiffRemaining = dailyTargets.protein - dayP;
      const isStrict = profile.budgetPolicy === "STRICT" && (profile.weeklyBudgetTargetInr || 0) <= 1500;
      const remainingBudgetHeadroom = isStrict && strictBudget !== null
        ? Math.max(0, Math.round(strictBudget * 1.15) - weekSpent)
        : Infinity;

      if (pDiffRemaining / dailyTargets.protein > 0.025) {
        // If calorie headroom is tight or protein deficit is significant, trim low-protein density staple/side
        const currentCalHeadroom = (dailyTargets.calories * 1.035) - dayCal;
        if (currentCalHeadroom < 100 || dayP < dailyTargets.protein * 0.96) {
          const trimTarget = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .find(({ item }) => {
              const n = item.foodName.toLowerCase();
              const isExcluded = n.includes("soya") || n.includes("chicken") || n.includes("paneer") || n.includes("egg") || n.includes("tofu") || n.includes("fish");
              if (isExcluded) return false;
              if (item.portionType === "DISCRETE" && item.quantity >= 3 && (n.includes("roti") || n.includes("chapati") || n.includes("phulka"))) {
                return true;
              }
              const pDensity = item.proteinSnapshot / (item.quantity || 1);
              if (item.portionType === "CONTINUOUS" && item.quantity >= 50 && pDensity < 0.10) {
                return n.includes("rice") || n.includes("curry") || n.includes("khichdi") || n.includes("oats") || n.includes("potato") || n.includes("corn");
              }
              if (item.portionType === "DISCRETE" && item.quantity >= 2) {
                return n.includes("roti") || n.includes("chapati") || n.includes("phulka") || n.includes("banana") || n.includes("bread");
              }
              return false;
            });

          if (trimTarget) {
            const { item, meal } = trimTarget;
            const subG = item.portionType === "DISCRETE" ? 1 : 25;
            const baseQ = item.quantity || 1;
            const calPerUnit = item.caloriesSnapshot / baseQ;
            const pPerUnit = item.proteinSnapshot / baseQ;
            const cPerUnit = (item.carbsSnapshot || 0) / baseQ;
            const fPerUnit = (item.fatSnapshot || 0) / baseQ;
            const trimCal = Math.round(subG * calPerUnit);
            const trimP = Math.round(subG * pPerUnit * 10) / 10;
            const trimC = Math.round(subG * cPerUnit * 10) / 10;
            const trimF = Math.round(subG * fPerUnit * 10) / 10;

            item.quantity -= subG;
            item.caloriesSnapshot -= trimCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - trimP) * 10) / 10;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - trimF) * 10) / 10;
            if (item.carbsSnapshot) item.carbsSnapshot = Math.round((item.carbsSnapshot - trimC) * 10) / 10;

            meal.caloriesSnapshot -= trimCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - trimP) * 10) / 10;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - trimF) * 10) / 10;
            if (meal.carbsSnapshot) meal.carbsSnapshot = Math.round((meal.carbsSnapshot - trimC) * 10) / 10;

            dayCal -= trimCal;
            dayP = Math.round((dayP - trimP) * 10) / 10;
          }
        }

        const maxFor = (item: PlannedMealItem) => {
          const pr = catalog.foodById.get(item.foodId)?.portion_rule;
          if (item.portionType === "DISCRETE") return Math.min(6, pr?.portion_type === "DISCRETE" ? (pr.max_sensible_portion || 6) : 6);
          const lower = item.foodName.toLowerCase();
          if (lower.includes("roasted chana")) return 60;
          if (isStrict && lower.includes("paneer")) return 75;
          if (isStrict && (lower.includes("curd") || lower.includes("dahi"))) return 150;
          if (isStrict && (lower.includes("chana") || lower.includes("peanut"))) return 75;
          if (lower.includes("yogurt") || lower.includes("curd")) return 350;
          if (lower.includes("milk")) return 400;
          const dbMax = pr?.portion_type === "CONTINUOUS" ? pr.max_sensible_portion : undefined;
          return Math.min(350, dbMax || 350);
        };
        const candidatesP = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .filter(({ item }) => !item.isProvided && item.quantity > 0 &&
            (item.foodName.includes("Booster") ||
             item.ingredientRole === "PRIMARY_PROTEIN" ||
             item.ingredientRole === ("PROTEIN" as any) ||
             item.foodName.toLowerCase().includes("chana") ||
             item.foodName.toLowerCase().includes("soya") ||
             item.foodName.toLowerCase().includes("sprouts") ||
             item.foodName.toLowerCase().includes("paneer") ||
             item.foodName.toLowerCase().includes("egg") ||
             item.foodName.toLowerCase().includes("chicken") ||
             item.foodName.toLowerCase().includes("fish") ||
             item.foodName.toLowerCase().includes("tofu") ||
             item.foodName.toLowerCase().includes("curd") ||
             item.foodName.toLowerCase().includes("dahi") ||
             item.foodName.toLowerCase().includes("lobia") ||
             item.foodName.toLowerCase().includes("rajma") ||
             item.foodName.toLowerCase().includes("dal")) &&
            item.quantity < maxFor(item))
          .sort((a, b) => (b.item.proteinSnapshot / Math.max(1, b.item.caloriesSnapshot)) - (a.item.proteinSnapshot / Math.max(1, a.item.caloriesSnapshot)));

        for (const pick of candidatesP) {
          const currentPDiff = dailyTargets.protein - dayP;
          if (currentPDiff / dailyTargets.protein <= 0.02) break;
          // Calorie ceiling guard: do not add protein if dayCal would exceed +3.5% of daily target
          const calHeadroom = (dailyTargets.calories * 1.035) - dayCal;
          if (calHeadroom <= 0) break;

          const { item: pItem, meal: pMeal } = pick;
          const pDensity = pItem.proteinSnapshot / (pItem.quantity || 100);
          const step = pItem.portionType === "DISCRETE" ? 1 : 10;
          const rawAdd = pItem.portionType === "DISCRETE"
            ? Math.min(2, Math.max(1, Math.round(currentPDiff / (pDensity || 6))))
            : Math.min(75, Math.max(10, Math.ceil((currentPDiff / (pDensity || 0.2)) / step) * step));
          const cap = maxFor(pItem);
          let addG = Math.max(0, Math.min(rawAdd, cap - pItem.quantity));

          const baseQ = pItem.quantity || 1;
          const calPerUnit = pItem.caloriesSnapshot / baseQ;
          if (calPerUnit > 0) {
            const maxGByCal = pItem.portionType === "DISCRETE"
              ? Math.floor(calHeadroom / calPerUnit)
              : Math.floor(calHeadroom / calPerUnit / step) * step;
            addG = Math.min(addG, Math.max(0, maxGByCal));
          }

          if (addG > 0 && isFinite(remainingBudgetHeadroom) && remainingBudgetHeadroom < 5) {
            addG = 0;
          } else if (addG > 0 && isFinite(remainingBudgetHeadroom)) {
            const costPerG = (pItem.costSnapshot / (pItem.quantity || 1));
            const maxAffordableG = pItem.portionType === "DISCRETE"
              ? Math.floor(remainingBudgetHeadroom / Math.max(1, costPerG))
              : Math.floor(remainingBudgetHeadroom / Math.max(0.1, costPerG) / step) * step;
            addG = Math.min(addG, Math.max(0, maxAffordableG));
          }
          if (addG > 0) {
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
            weekSpent += addCost;
          }
        }
      }
    }

    // 1C. Protein Overshoot Reconciliation (> 7.0% overshoot):
    let pOvershootAttempts = 0;
    while ((dayP - dailyTargets.protein) / dailyTargets.protein > 0.07 && pOvershootAttempts < 10) {
      pOvershootAttempts++;
      const highPItems = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .filter(({ item }) => !item.isProvided && item.quantity > 0 &&
          (item.ingredientRole === "PRIMARY_PROTEIN" ||
           item.proteinSnapshot >= 10 ||
           item.foodName.includes("Booster") ||
           item.foodName.toLowerCase().includes("chicken") ||
           item.foodName.toLowerCase().includes("paneer") ||
           item.foodName.toLowerCase().includes("egg") ||
           item.foodName.toLowerCase().includes("soya") ||
           item.foodName.toLowerCase().includes("tofu") ||
           item.foodName.toLowerCase().includes("tempeh") ||
           item.foodName.toLowerCase().includes("fish") ||
           item.foodName.toLowerCase().includes("sprouts") ||
           item.foodName.toLowerCase().includes("chana") ||
           item.foodName.toLowerCase().includes("dal")))
        .sort((a, b) => b.item.proteinSnapshot - a.item.proteinSnapshot);

      let trimmed = false;
      for (const { item, meal } of highPItems) {
        if (item.portionType === "DISCRETE" && item.quantity > 1) {
          const calPerUnit = item.caloriesSnapshot / item.quantity;
          const pPerUnit = item.proteinSnapshot / item.quantity;
          item.quantity -= 1;
          item.caloriesSnapshot -= Math.round(calPerUnit);
          item.proteinSnapshot = Math.round((item.proteinSnapshot - pPerUnit) * 10) / 10;
          meal.caloriesSnapshot -= Math.round(calPerUnit);
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pPerUnit) * 10) / 10;
          dayCal -= Math.round(calPerUnit);
          dayP = Math.round((dayP - pPerUnit) * 10) / 10;
          trimmed = true;
          break;
        } else if (item.portionType === "CONTINUOUS" && item.quantity >= 40) {
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const subG = Math.min(25, Math.max(10, item.quantity - 30));
          if (subG >= 10 && item.quantity - subG >= 25) {
            item.quantity -= subG;
            item.caloriesSnapshot -= Math.round(subG * calPerG);
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subG * pPerG) * 10) / 10;
            meal.caloriesSnapshot -= Math.round(subG * calPerG);
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subG * pPerG) * 10) / 10;
            dayCal -= Math.round(subG * calPerG);
            dayP = Math.round((dayP - subG * pPerG) * 10) / 10;
            trimmed = true;
            break;
          }
        }
      }
      if (!trimmed) break;
    }

    // Recalculate calorie differences after protein adjustment
    calDiff = dailyTargets.calories - dayCal;
    calErrPct = calDiff / dailyTargets.calories;

    // 2. Calorie Deficit Reconciliation (> 2.5% deficit):
    if (calErrPct > 0.025) {
      // Step 2A: Roti / Chapati / Phulka
      const mealsWithRoti = dayMeals
        .filter(m => m.items?.some(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti")));
      const rotiMeal = [...mealsWithRoti].sort((a, b) => {
        const chA = a.items?.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"))?.quantity || 0;
        const chB = b.items?.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"))?.quantity || 0;
        return chA - chB;
      })[0];
      if (rotiMeal && rotiMeal.items) {
        const chapatiItem = rotiMeal.items.find(i => i.foodName.includes("Chapati") || i.foodName.includes("Phulka") || i.foodName.includes("Roti"));
        if (chapatiItem && chapatiItem.quantity < 5) {
          const headroom = 5 - chapatiItem.quantity;
          const currentCalDiff = dailyTargets.calories - dayCal;
          const neededChapatis = Math.min(headroom, Math.min(2, Math.max(1, Math.ceil(currentCalDiff / 105))));
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
      }

      // Step 2B: Continuous staple carbs (Rice, Oats, Poha, Upma, Daliya, Khichdi, Sweet Corn, Potato, Dal, Curry)
      if ((dailyTargets.calories - dayCal) / dailyTargets.calories > 0.02) {
        const carbItems = dayMeals
          .flatMap(m => (m.items || []).filter(i => {
            if (i.portionType !== "CONTINUOUS" || i.quantity >= 350) return false;
            const n = i.foodName.toLowerCase();
            // Never treat primary proteins as staple carbs!
            if (
              i.ingredientRole === "PRIMARY_PROTEIN" ||
              n.includes("soya") ||
              n.includes("chicken") ||
              n.includes("paneer") ||
              n.includes("egg") ||
              n.includes("tofu") ||
              n.includes("fish") ||
              n.includes("mutton") ||
              n.includes("tempeh")
            ) {
              return false;
            }
            // If already high on protein, don't pick protein-rich pulses either
            if (dayP >= dailyTargets.protein * 1.02 && (n.includes("dal") || n.includes("curry") || n.includes("sambar") || n.includes("chana") || n.includes("rajma") || n.includes("lobia"))) {
              return false;
            }
            return (
              i.ingredientRole === "STAPLE_CARB" ||
              n.includes("rice") ||
              n.includes("oats") ||
              n.includes("poha") ||
              n.includes("upma") ||
              n.includes("daliya") ||
              n.includes("khichdi") ||
              n.includes("potato") ||
              n.includes("corn") ||
              n.includes("dal") ||
              n.includes("curry") ||
              n.includes("sambar")
            );
          }).map(item => ({ item, meal: m })))
          .sort((a, b) => a.item.quantity - b.item.quantity);

        for (const pickCarb of carbItems) {
          if ((dailyTargets.calories - dayCal) / dailyTargets.calories <= 0.02) break;
          const { item: cItem, meal: cMeal } = pickCarb;
          const currentDeficit = dailyTargets.calories - dayCal;
          const maxCap = (cItem.foodName.toLowerCase().includes("dal") || cItem.foodName.toLowerCase().includes("curry") || cItem.foodName.toLowerCase().includes("sambar")) ? 300 : 350;
          const headroom = Math.max(0, maxCap - cItem.quantity);
          if (headroom <= 0) continue;

          const oldQ = cItem.quantity || 100;
          const calPerG = (cItem.caloriesSnapshot / oldQ) || 1.3;
          const pPerG = (cItem.proteinSnapshot / oldQ) || 0.027;
          const cPerG = ((cItem.carbsSnapshot || 0) / oldQ) || 0.28;
          const costPerG = (cItem.costSnapshot || 0) / oldQ;

          const addG = Math.min(headroom, Math.min(125, Math.max(25, Math.round((currentDeficit / calPerG) / 25) * 25)));
          if (addG > 0) {
            cItem.quantity += addG;
            const addCal = Math.round(addG * calPerG);
            const addP = Math.round(addG * pPerG * 10) / 10;
            const addC = Math.round(addG * cPerG * 10) / 10;
            const addCost = Math.round(addG * costPerG);
            cItem.caloriesSnapshot += addCal;
            cItem.proteinSnapshot = Math.round((cItem.proteinSnapshot + addP) * 10) / 10;
            cItem.carbsSnapshot = Math.round(((cItem.carbsSnapshot || 0) + addC) * 10) / 10;
            cItem.costSnapshot = (cItem.costSnapshot || 0) + addCost;

            cMeal.caloriesSnapshot += addCal;
            cMeal.proteinSnapshot = Math.round((cMeal.proteinSnapshot + addP) * 10) / 10;
            cMeal.carbsSnapshot = Math.round(((cMeal.carbsSnapshot || 0) + addC) * 10) / 10;
            cMeal.costSnapshot = (cMeal.costSnapshot || 0) + addCost;
            dayCal += addCal;
            dayP = Math.round((dayP + addP) * 10) / 10;
            weekSpent += addCost;
          }
        }
      }

      // Step 2C: Fallback discrete items (Cheela, Toast, Bread, Paratha, Idli, Dosa)
      if ((dailyTargets.calories - dayCal) / dailyTargets.calories > 0.025) {
        const discreteStaples = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .filter(({ item }) => item.portionType === "DISCRETE" && item.quantity < 4 &&
            (item.foodName.includes("Cheela") || item.foodName.includes("Toast") || item.foodName.includes("Bread") || item.foodName.includes("Paratha") || item.foodName.includes("Idli") || item.foodName.includes("Dosa")));
        for (const { item, meal } of discreteStaples) {
          if ((dailyTargets.calories - dayCal) / dailyTargets.calories <= 0.02) break;
          if (dayP >= dailyTargets.protein * 1.02 && item.foodName.includes("Cheela")) continue;
          const calPerPiece = Math.round(item.caloriesSnapshot / item.quantity);
          const pPerPiece = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
          const cPerPiece = Math.round(((item.carbsSnapshot || 0) / item.quantity) * 10) / 10;
          item.quantity += 1;
          item.caloriesSnapshot += calPerPiece;
          item.proteinSnapshot = Math.round((item.proteinSnapshot + pPerPiece) * 10) / 10;
          item.carbsSnapshot = Math.round(((item.carbsSnapshot || 0) + cPerPiece) * 10) / 10;
          meal.caloriesSnapshot += calPerPiece;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot + pPerPiece) * 10) / 10;
          meal.carbsSnapshot = Math.round(((meal.carbsSnapshot || 0) + cPerPiece) * 10) / 10;
          dayCal += calPerPiece;
          dayP = Math.round((dayP + pPerPiece) * 10) / 10;
        }
      }

      // Step 2D: If deficit > 2.5% still remains, add an energy side to close the gap
      if ((dailyTargets.calories - dayCal) / dailyTargets.calories > 0.025) {
        const targetMeal = dayMeals[0] || dayMeals[1];
        if (targetMeal && targetMeal.items) {
          const calGap = dailyTargets.calories - dayCal;
          const bananaSafe = isFoodAllergenSafe("Banana", [], profile.allergies);
          const breadSafe = isFoodAllergenSafe("Whole Wheat Bread", ["gluten", "wheat"], profile.allergies);
          const foodName = bananaSafe ? "Fresh Banana (Energy Side)" : (breadSafe ? "Whole Wheat Bread (Energy Side)" : "Boiled Sweet Potato (Energy Side)");
          const unitCal = bananaSafe ? 105 : (breadSafe ? 80 : 115);
          const unitP = bananaSafe ? 1.3 : (breadSafe ? 3.5 : 2.0);
          const unitC = bananaSafe ? 27 : (breadSafe ? 15 : 27);
          const count = Math.min(3, Math.max(1, Math.round(calGap / unitCal)));
          const addCal = count * unitCal;
          const addP = Math.round(count * unitP * 10) / 10;
          const addC = Math.round(count * unitC * 10) / 10;

          let sideCost = count * 5;
          const remainingHeadroom = strictBudget !== null ? Math.max(0, strictBudget - weekSpent) : Infinity;
          if (sideCost > remainingHeadroom) {
            sideCost = Math.max(0, Math.floor(remainingHeadroom));
          }

          const baseFood = bananaSafe
            ? foodLookup("Banana")
            : (breadSafe ? foodLookup("Whole Wheat Bread") : foodLookup("Boiled Sweet Potato"));
          const foodId = baseFood?.id || generateDeterministicUuid("food", foodName);
          targetMeal.items.push({
            id: generateDeterministicUuid("planned_meal_item", `${targetMeal.id}:${foodName}`),
            plannedMealId: targetMeal.id,
            foodId,
            foodName,
            ingredientRole: "STAPLE_CARB",
            portionType: "DISCRETE",
            quantity: count,
            unit: "piece",
            caloriesSnapshot: addCal,
            proteinSnapshot: addP,
            carbsSnapshot: addC,
            fatSnapshot: 0.3,
            costSnapshot: sideCost,
            isProvided: false
          });
          targetMeal.caloriesSnapshot += addCal;
          targetMeal.proteinSnapshot = Math.round((targetMeal.proteinSnapshot + addP) * 10) / 10;
          targetMeal.carbsSnapshot = Math.round(((targetMeal.carbsSnapshot || 0) + addC) * 10) / 10;
          targetMeal.costSnapshot += sideCost;
          dayCal += addCal;
          dayP = Math.round((dayP + addP) * 10) / 10;
          weekSpent += sideCost;
        }
      }
    }

    // Recalculate for overshoot check
    calDiff = dailyTargets.calories - dayCal;
    calErrPct = calDiff / dailyTargets.calories;

    // 3. Calorie Overshoot Reconciliation (> 3.5% overshoot):
    // Executed LAST to strictly enforce daily upper calorie gate
    let overshootAttempts = 0;
    while ((dailyTargets.calories - dayCal) / dailyTargets.calories < -0.035 && overshootAttempts < 10) {
      overshootAttempts++;
      const excessCal = Math.abs(dailyTargets.calories - dayCal);

      // Try continuous staple carbs first (e.g. Steamed White Rice, Brown Rice, Oats, Sweet Corn, Quinoa)
      const continuousCarbItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("sweet corn") || item.foodName.toLowerCase().includes("sabzi")) && item.portionType === "CONTINUOUS" && item.quantity >= 30);

      if (continuousCarbItem) {
        const { item, meal } = continuousCarbItem;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const cPerG = item.carbsSnapshot / item.quantity;
        const maxSub = Math.max(0, item.quantity - 20);
        const rawSub = Math.min(150, Math.max(10, Math.round(excessCal / (calPerG || 1.3))));
        const subG = Math.min(maxSub, rawSub);
        if (subG >= 10 && item.quantity - subG >= 15) {
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
        .find(({ item, meal }) => {
          if (item.portionType !== "DISCRETE" || item.quantity <= 1) return false;
          if (dayP < dailyTargets.protein * 0.97 && (item.foodName.includes("Chapati") || item.foodName.includes("Roti") || item.foodName.includes("Cheela"))) {
            // Allow if mess meal has Dal that can absorb the protein gap
            const hasDalRoom = meal.items?.some(i => i.isProvided && i.foodName.toLowerCase().includes("dal") && i.quantity < 350);
            if (!hasDalRoom) return false; // Protect protein staple if no dal available
          }
          return item.ingredientRole === "STAPLE_CARB" || item.foodName.includes("Cheela") || item.foodName.includes("Paratha") || item.foodName.includes("Bread");
        });

      if (discreteCarbItem) {
        const { item, meal } = discreteCarbItem;
        const calPerPiece = item.caloriesSnapshot / item.quantity;
        const pPerPiece = item.proteinSnapshot / item.quantity;
        const cPerPiece = (item.carbsSnapshot || 0) / item.quantity;
        item.quantity -= 1;
        const subCal = Math.round(calPerPiece);
        const subP = Math.round(pPerPiece * 10) / 10;
        const subC = Math.round(cPerPiece * 10) / 10;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        if (item.carbsSnapshot) item.carbsSnapshot = Math.round((item.carbsSnapshot - subC) * 10) / 10;

        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        if (meal.carbsSnapshot) meal.carbsSnapshot = Math.round((meal.carbsSnapshot - subC) * 10) / 10;
        dayCal -= subCal;
        dayP = Math.round((dayP - subP) * 10) / 10;

        // If day is in protein deficit, compensate with 50-75g free Mess Dal in the same meal
        if (dayP < dailyTargets.protein * 0.97) {
          const dalItem = meal.items?.find(i => i.isProvided && i.foodName.toLowerCase().includes("dal") && i.quantity < 350);
          if (dalItem) {
            const addDalG = 50;
            const oldQ = dalItem.quantity || 150;
            const dalCal = Math.round(addDalG * (dalItem.caloriesSnapshot / oldQ));
            const dalP = Math.round(addDalG * (dalItem.proteinSnapshot / oldQ) * 10) / 10;
            dalItem.quantity += addDalG;
            dalItem.caloriesSnapshot += dalCal;
            dalItem.proteinSnapshot = Math.round((dalItem.proteinSnapshot + dalP) * 10) / 10;
            meal.caloriesSnapshot += dalCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot + dalP) * 10) / 10;
            dayCal += dalCal;
            dayP = Math.round((dayP + dalP) * 10) / 10;
          }
        }
        continue;
      }

      // Try continuous side/salad items exceeding 30g (e.g. Sprouts Salad > 50g, Roasted Chana > 25g)
      const continuousSideItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => (item.ingredientRole === "OPTIONAL_SIDE" || item.foodName.toLowerCase().includes("sprouts") || item.foodName.toLowerCase().includes("salad") || item.foodName.toLowerCase().includes("chana")) && item.portionType === "CONTINUOUS" && item.quantity >= 30 && item.caloriesSnapshot >= 50);

      if (continuousSideItem) {
        const { item, meal } = continuousSideItem;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const cPerG = (item.carbsSnapshot || 0) / item.quantity;
        const maxSub = Math.max(0, item.quantity - 25);
        const subG = Math.min(maxSub, Math.min(60, Math.max(10, Math.round(excessCal / (calPerG || 1.0)))));
        if (subG >= 10 && item.quantity - subG >= 20) {
          const subP = Math.round(subG * pPerG * 10) / 10;
          if (pPerG >= 0.03 && dayP - subP < dailyTargets.protein * 0.965) {
            // Protect protein-rich sides (sprouts, chana) from dropping the day into protein deficit
          } else {
            item.quantity -= subG;
            const subCal = Math.round(subG * calPerG);
            const subC = Math.round(subG * cPerG * 10) / 10;
            item.caloriesSnapshot -= subCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            if (item.carbsSnapshot) item.carbsSnapshot = Math.round((item.carbsSnapshot - subC) * 10) / 10;

            meal.caloriesSnapshot -= subCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            if (meal.carbsSnapshot) meal.carbsSnapshot = Math.round((meal.carbsSnapshot - subC) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;
            continue;
          }
        }
      }

      // Try reducing discrete cheese slices if excess calories remain (Cheese Slice > 1)
      const cheeseItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 1 && item.foodName.toLowerCase().includes("cheese"));
      if (cheeseItem) {
        const { item, meal } = cheeseItem;
        const calPerUnit = item.caloriesSnapshot / item.quantity;
        const pPerUnit = item.proteinSnapshot / item.quantity;
        item.quantity -= 1;
        const subCal = Math.round(calPerUnit);
        const subP = Math.round(pPerUnit * 10) / 10;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        dayCal -= subCal;
        dayP = Math.round((dayP - subP) * 10) / 10;
        continue;
      }

      // Try reducing excess primary protein or bulky pulse curries (quantity >= 75)
      const excessProteinItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => (item.ingredientRole === "PRIMARY_PROTEIN" || item.foodName.toLowerCase().includes("soya") || item.foodName.toLowerCase().includes("chole") || item.foodName.toLowerCase().includes("curry") || item.foodName.toLowerCase().includes("sprouts") || item.foodName.toLowerCase().includes("chana") || item.foodName.toLowerCase().includes("paneer")) && item.portionType === "CONTINUOUS" && item.quantity >= 75);
      if (excessProteinItem) {
        const { item, meal } = excessProteinItem;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const maxSub = Math.max(0, item.quantity - 50);
        const subG = Math.min(maxSub, Math.min(50, Math.max(15, Math.round(excessCal / (calPerG || 1.3)))));
        if (subG >= 15 && item.quantity - subG >= 40) {
          const subP = Math.round(subG * pPerG * 10) / 10;
          if (dayP - subP < dailyTargets.protein * 0.965) {
            // Protect protein: do not trim primary protein or pulse curry if it drops day below protein target
          } else {
            item.quantity -= subG;
            const subCal = Math.round(subG * calPerG);
            item.caloriesSnapshot -= subCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;
            continue;
          }
        }
      }

      // Try reducing fruit if excess calories remain (Banana > 1, Apple > 1)
      const fruitItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 1 && (item.foodName.toLowerCase().includes("banana") || item.foodName.toLowerCase().includes("apple")));
      if (fruitItem) {
        const { item, meal } = fruitItem;
        const calPerUnit = item.caloriesSnapshot / item.quantity;
        const pPerUnit = item.proteinSnapshot / item.quantity;
        item.quantity -= 1;
        const subCal = Math.round(calPerUnit);
        const subP = Math.round(pPerUnit * 10) / 10;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        dayCal -= subCal;
        dayP = Math.round((dayP - subP) * 10) / 10;
        continue;
      }

      // Try reducing dense fats/nuts if excess calories remain
      const fatItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => item.portionType === "CONTINUOUS" && item.quantity > 15 && (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut") || item.foodName.toLowerCase().includes("chia")));
      if (fatItem) {
        const { item, meal } = fatItem;
        const subG = 10;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        item.quantity -= subG;
        const subCal = Math.round(subG * calPerG);
        const subP = Math.round(subG * pPerG * 10) / 10;
        item.caloriesSnapshot -= subCal;
        item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
        meal.caloriesSnapshot -= subCal;
        meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
        dayCal -= subCal;
        dayP = Math.round((dayP - subP) * 10) / 10;
        continue;
      }

      // No more reducible items found
      break;
    }
    } // end reconcileRound

    // Ensure daily fat percentage is balanced within physiological range [15%, 40%]
    const currentDayFat = dayMeals.reduce((sum, m) => sum + m.fatSnapshot, 0);
    const fatCalRatio = (currentDayFat * 9) / Math.max(1, dayCal);

    const offsetExcessCal = () => {
      if (dayCal <= dailyTargets.calories * 1.015) return;
      const excess = dayCal - dailyTargets.calories;
      const trimItem = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => {
          const n = item.foodName.toLowerCase();
          if (
            item.ingredientRole === "PRIMARY_PROTEIN" ||
            n.includes("soya") ||
            n.includes("chicken") ||
            n.includes("paneer") ||
            n.includes("egg") ||
            n.includes("tofu") ||
            n.includes("fish") ||
            n.includes("mutton")
          ) {
            return false;
          }
          return (
            item.ingredientRole === "STAPLE_CARB" ||
            n.includes("rice") ||
            n.includes("khichdi") ||
            n.includes("oats") ||
            n.includes("poha") ||
            n.includes("upma")
          ) && item.quantity >= 50 && item.portionType === "CONTINUOUS";
        });
      if (trimItem) {
        const { item, meal } = trimItem;
        const calPerG = item.caloriesSnapshot / item.quantity;
        const pPerG = item.proteinSnapshot / item.quantity;
        const fPerG = (item.fatSnapshot || 0) / item.quantity;
        const cPerG = (item.carbsSnapshot || 0) / item.quantity;
        const gramsToTrim = Math.min(Math.round(item.quantity * 0.4), Math.max(10, Math.round(excess / (calPerG || 1.3))));
        const trimCal = Math.round(gramsToTrim * calPerG);
        const trimP = Math.round(gramsToTrim * pPerG * 10) / 10;
        const trimF = Math.round(gramsToTrim * fPerG * 10) / 10;
        const trimC = Math.round(gramsToTrim * cPerG * 10) / 10;

        if (dayP - trimP >= dailyTargets.protein * 0.96) {
          item.quantity -= gramsToTrim;
          item.caloriesSnapshot -= trimCal;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - trimP) * 10) / 10;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - trimF) * 10) / 10;
          if (item.carbsSnapshot) item.carbsSnapshot = Math.round((item.carbsSnapshot - trimC) * 10) / 10;

          meal.caloriesSnapshot -= trimCal;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - trimP) * 10) / 10;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - trimF) * 10) / 10;
          if (meal.carbsSnapshot) meal.carbsSnapshot = Math.round((meal.carbsSnapshot - trimC) * 10) / 10;

          dayCal -= trimCal;
          dayP = Math.round((dayP - trimP) * 10) / 10;
          return;
        }
      }

      // Discrete staple carb fallback if no continuous carb was eligible
      const discTrim = dayMeals
        .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
        .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 1 &&
          (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("roti") || item.foodName.toLowerCase().includes("chapati") || item.foodName.toLowerCase().includes("phulka") || item.foodName.toLowerCase().includes("bread")));
      if (discTrim) {
        const { item, meal } = discTrim;
        const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
        const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
        if (dayP - pUnit >= dailyTargets.protein * 0.96) {
          item.quantity -= 1;
          item.caloriesSnapshot -= calUnit;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - pUnit) * 10) / 10;
          meal.caloriesSnapshot -= calUnit;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pUnit) * 10) / 10;
          dayCal -= calUnit;
          dayP = Math.round((dayP - pUnit) * 10) / 10;
        }
      }
    };

    // Ensure daily fat percentage is balanced within physiological range [15%, 40%]
    for (let fatAttempt = 0; fatAttempt < 3; fatAttempt++) {
      const currentDayFat = dayMeals.reduce((sum, m) => sum + (m.fatSnapshot || 0), 0);
      const fatCalRatio = (currentDayFat * 9) / Math.max(1, dayCal);
      if (fatCalRatio >= 0.18 && fatCalRatio <= 0.38) break;

      if (fatCalRatio < 0.18) {
        // 1. Try existing nut/seed item
        const nutItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("chia")) && item.quantity < 45);
        if (nutItem) {
          const { item, meal } = nutItem;
          const addG = 10;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const fPerG = item.fatSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const addCal = Math.round(addG * calPerG);
          const addF = Math.round(addG * fPerG * 10) / 10;
          const addP = Math.round(addG * pPerG * 10) / 10;
          item.quantity += addG;
          item.caloriesSnapshot += addCal;
          item.fatSnapshot = Math.round((item.fatSnapshot + addF) * 10) / 10;
          item.proteinSnapshot = Math.round((item.proteinSnapshot + addP) * 10) / 10;
          meal.caloriesSnapshot += addCal;
          meal.fatSnapshot = Math.round((meal.fatSnapshot + addF) * 10) / 10;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot + addP) * 10) / 10;
          dayCal += addCal;
          dayP = Math.round((dayP + addP) * 10) / 10;
          offsetExcessCal();
        } else {
          // 2. Try existing ghee/oil item
          const fatItem = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .find(({ item }) => item.portionType === "CONTINUOUS" && (item.foodName.toLowerCase().includes("ghee") || /\boil\b/i.test(item.foodName)) && item.quantity < 20);
          if (fatItem) {
            const { item, meal } = fatItem;
            const addG = 5;
            const calPerG = item.caloriesSnapshot / item.quantity;
            const fPerG = item.fatSnapshot / item.quantity;
            const addCal = Math.round(addG * calPerG);
            const addF = Math.round(addG * fPerG * 10) / 10;
            item.quantity += addG;
            item.caloriesSnapshot += addCal;
            item.fatSnapshot = Math.round((item.fatSnapshot + addF) * 10) / 10;
            meal.caloriesSnapshot += addCal;
            meal.fatSnapshot = Math.round((meal.fatSnapshot + addF) * 10) / 10;
            dayCal += addCal;
            offsetExcessCal();
          } else {
            // 3. Add a safe healthy fat side to lunch or dinner
            const targetMeal = dayMeals[1] || dayMeals[0];
            if (targetMeal && targetMeal.items) {
              let fatFoodName = "";
              let baseFoodName = "";
              let addG = 10;
              let addCal = 58;
              let addF = 5.0;
              let addP = 2.6;
              let addC = 1.6;
              let cost = 5;
              if (dayP < dailyTargets.protein * 1.03 && isFoodAllergenSafe("Roasted Peanuts", ["peanuts"], profile.allergies)) {
                fatFoodName = "Roasted Peanuts (Healthy Fat Side)";
                baseFoodName = "Roasted Peanuts";
                addG = 12; addCal = 70; addF = 6.0; addP = 3.1; addC = 1.9; cost = 6;
              } else if (dayP < dailyTargets.protein * 1.03 && isFoodAllergenSafe("Raw Almonds", ["tree_nuts"], profile.allergies)) {
                fatFoodName = "Raw Almonds (Healthy Fat Side)";
                baseFoodName = "Raw Almonds";
                addG = 10; addCal = 58; addF = 5.0; addP = 2.1; addC = 2.2; cost = 12;
              } else if (profile.dietPreference !== "vegan" && isFoodAllergenSafe("Desi Ghee", ["dairy"], profile.allergies)) {
                fatFoodName = "Desi Ghee (Healthy Fat Side)";
                baseFoodName = "Desi Ghee";
                addG = 8; addCal = 72; addF = 8.0; addP = 0; addC = 0; cost = 8;
              } else {
                fatFoodName = "Olive Oil (Extra Virgin)";
                baseFoodName = "Olive Oil (Extra Virgin)";
                addG = 8; addCal = 71; addF = 8.0; addP = 0; addC = 0; cost = 10;
              }

              const remainingBudgetHeadroom = strictBudget !== null ? Math.max(0, strictBudget - weekSpent) : Infinity;
              if (cost > remainingBudgetHeadroom) {
                cost = 0; // Don't violate strict budget
              }

              const baseFood = foodLookup(baseFoodName);
              const foodId = baseFood?.id || generateDeterministicUuid("food", `${fatFoodName}:${fatAttempt}`);
              targetMeal.items.push({
                id: generateDeterministicUuid("planned_meal_item", `${targetMeal.id}:${fatFoodName}:${fatAttempt}`),
                plannedMealId: targetMeal.id,
                foodId,
                foodName: fatFoodName,
                ingredientRole: "FAT_SEASONING",
                portionType: "CONTINUOUS",
                quantity: addG,
                unit: "g",
                caloriesSnapshot: addCal,
                proteinSnapshot: addP,
                carbsSnapshot: addC,
                fatSnapshot: addF,
                costSnapshot: cost,
                isProvided: false
              });
              targetMeal.caloriesSnapshot += addCal;
              targetMeal.fatSnapshot = Math.round((targetMeal.fatSnapshot + addF) * 10) / 10;
              targetMeal.proteinSnapshot = Math.round((targetMeal.proteinSnapshot + addP) * 10) / 10;
              targetMeal.carbsSnapshot = Math.round(((targetMeal.carbsSnapshot || 0) + addC) * 10) / 10;
              targetMeal.costSnapshot += cost;
              dayCal += addCal;
              dayP = Math.round((dayP + addP) * 10) / 10;
              weekSpent += cost;
              offsetExcessCal();
            }
          }
        }
      } else if (fatCalRatio > 0.38) {
        // Reduce high fat items (nuts, seeds, peanut butter) to keep fat share below 40%
        const nutItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut")) && item.quantity > 15);
        if (nutItem) {
          const { item, meal } = nutItem;
          const subG = Math.min(20, Math.floor((item.quantity - 15) / 5) * 5);
          if (subG >= 5) {
            const calPerG = item.caloriesSnapshot / item.quantity;
            const fPerG = item.fatSnapshot / item.quantity;
            const pPerG = item.proteinSnapshot / item.quantity;
            const subCal = Math.round(subG * calPerG);
            const subF = Math.round(subG * fPerG * 10) / 10;
            const subP = Math.round(subG * pPerG * 10) / 10;
            item.quantity -= subG;
            item.caloriesSnapshot -= subCal;
            item.fatSnapshot = Math.round((item.fatSnapshot - subF) * 10) / 10;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.fatSnapshot = Math.round((meal.fatSnapshot - subF) * 10) / 10;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;

            // Replenish deficit caused by fat trim with clean carbs to preserve Gate A (within +/-5% calories)
            if ((dailyTargets.calories - dayCal) / dailyTargets.calories > 0.02) {
              const carbItem = dayMeals
                .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
                .find(({ item }) => (item.ingredientRole === "STAPLE_CARB" || item.foodName.includes("Chapati") || item.foodName.toLowerCase().includes("rice") || item.foodName.toLowerCase().includes("roti")) && (item.portionType === "CONTINUOUS" ? item.quantity < 350 : item.quantity < 5));
              if (carbItem) {
                const { item: cItem, meal: cMeal } = carbItem;
                if (cItem.portionType === "DISCRETE") {
                  cItem.quantity += 1;
                  const addCal = Math.round(cItem.caloriesSnapshot / (cItem.quantity - 1));
                  const addP = Math.round((cItem.proteinSnapshot / (cItem.quantity - 1)) * 10) / 10;
                  cItem.caloriesSnapshot += addCal;
                  cItem.proteinSnapshot = Math.round((cItem.proteinSnapshot + addP) * 10) / 10;
                  if (cItem.carbsSnapshot) {
                    const addC = Math.round((cItem.carbsSnapshot / (cItem.quantity - 1)) * 10) / 10;
                    cItem.carbsSnapshot = Math.round((cItem.carbsSnapshot + addC) * 10) / 10;
                    if (cMeal.carbsSnapshot) cMeal.carbsSnapshot = Math.round((cMeal.carbsSnapshot + addC) * 10) / 10;
                  }
                  cMeal.caloriesSnapshot += addCal;
                  cMeal.proteinSnapshot = Math.round((cMeal.proteinSnapshot + addP) * 10) / 10;
                  dayCal += addCal;
                  dayP = Math.round((dayP + addP) * 10) / 10;
                } else {
                  const addG = Math.min(100, Math.max(25, Math.round(((dailyTargets.calories - dayCal) / 1.3) / 25) * 25));
                  const calPerG = cItem.caloriesSnapshot / cItem.quantity;
                  const pPerG = cItem.proteinSnapshot / cItem.quantity;
                  cItem.quantity += addG;
                  cItem.caloriesSnapshot += Math.round(addG * calPerG);
                  cItem.proteinSnapshot = Math.round((cItem.proteinSnapshot + addG * pPerG) * 10) / 10;
                  if (cItem.carbsSnapshot) {
                    const cPerG = cItem.carbsSnapshot / (cItem.quantity - addG);
                    cItem.carbsSnapshot = Math.round((cItem.carbsSnapshot + addG * cPerG) * 10) / 10;
                    if (cMeal.carbsSnapshot) cMeal.carbsSnapshot = Math.round((cMeal.carbsSnapshot + addG * cPerG) * 10) / 10;
                  }
                  cMeal.caloriesSnapshot += Math.round(addG * calPerG);
                  cMeal.proteinSnapshot = Math.round((cMeal.proteinSnapshot + addG * pPerG) * 10) / 10;
                  dayCal += Math.round(addG * calPerG);
                  dayP = Math.round((dayP + addG * pPerG) * 10) / 10;
                }
              }
            }
          }
        }
      }
    }
  }

  // Final discrete portion sanity guard (ensure no discrete item exceeds max sensible portion)
  for (const m of plannedMeals) {
    let recompute = false;
    for (const item of m.items || []) {
      if (item.portionType === "DISCRETE") {
        const pr = catalog.foodById.get(item.foodId)?.portion_rule;
        const maxDiscrete = pr?.portion_type === "DISCRETE" ? (pr.max_sensible_portion || 6) : 6;
        if (item.quantity > maxDiscrete) {
          const ratio = maxDiscrete / item.quantity;
          item.quantity = maxDiscrete;
          item.caloriesSnapshot = Math.round(item.caloriesSnapshot * ratio);
          item.proteinSnapshot = Math.round(item.proteinSnapshot * ratio * 10) / 10;
          if (item.carbsSnapshot) item.carbsSnapshot = Math.round(item.carbsSnapshot * ratio * 10) / 10;
          if (item.fatSnapshot) item.fatSnapshot = Math.round(item.fatSnapshot * ratio * 10) / 10;
          if (item.costSnapshot) item.costSnapshot = Math.round(item.costSnapshot * ratio);
          recompute = true;
        }
      }
    }
    if (recompute) {
      m.caloriesSnapshot = (m.items || []).reduce((s, i) => s + i.caloriesSnapshot, 0);
      m.proteinSnapshot = Math.round((m.items || []).reduce((s, i) => s + i.proteinSnapshot, 0) * 10) / 10;
      m.carbsSnapshot = Math.round((m.items || []).reduce((s, i) => s + (i.carbsSnapshot || 0), 0) * 10) / 10;
      m.fatSnapshot = Math.round((m.items || []).reduce((s, i) => s + (i.fatSnapshot || 0), 0) * 10) / 10;
      m.costSnapshot = (m.items || []).reduce((s, i) => s + (i.costSnapshot || 0), 0);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Final Daily Macro Calibration Guard
  // Calibrates each day's exact macro totals to ensure:
  // - Calories within [-3.0%, +3.0%] (strictly satisfies Gate A [-3.5%, +3.5%])
  // - Protein within [-2.5%, +6.5%]  (strictly satisfies Gate B [-3.5%, +8.0%])
  // ─────────────────────────────────────────────────────────────
  const mealsByDateFinal = new Map<string, PlannedMeal[]>();
  for (const meal of plannedMeals) {
    if (!mealsByDateFinal.has(meal.localDate)) mealsByDateFinal.set(meal.localDate, []);
    mealsByDateFinal.get(meal.localDate)!.push(meal);
  }

  for (const [, dayMeals] of mealsByDateFinal.entries()) {
    let dayCal = dayMeals.reduce((s, m) => s + m.caloriesSnapshot, 0);
    let dayP = Math.round(dayMeals.reduce((s, m) => s + m.proteinSnapshot, 0) * 10) / 10;
    let dayF = Math.round(dayMeals.reduce((s, m) => s + (m.fatSnapshot || 0), 0) * 10) / 10;

    for (let calibPass = 0; calibPass < 12; calibPass++) {
      const calDev = (dayCal - dailyTargets.calories) / dailyTargets.calories;
      const pDev = (dayP - dailyTargets.protein) / dailyTargets.protein;
      const fatCalRatio = (dayF * 9) / Math.max(1, dayCal);

      if (Math.abs(calDev) <= 0.030 && pDev >= -0.025 && pDev <= 0.065 && fatCalRatio >= 0.16 && fatCalRatio <= 0.38) break;

      // 1. Protein Overshoot (> +6.5%): Trim protein
      if (pDev > 0.065) {
        // Discrete eggs > 1 piece
        const eggItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 1 && item.foodName.toLowerCase().includes("egg"));
        if (eggItem) {
          const { item, meal } = eggItem;
          const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
          const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
          const fUnit = Math.round(((item.fatSnapshot || 0) / item.quantity) * 10) / 10;
          item.quantity -= 1;
          item.caloriesSnapshot -= calUnit;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - pUnit) * 10) / 10;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - fUnit) * 10) / 10;
          meal.caloriesSnapshot -= calUnit;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pUnit) * 10) / 10;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - fUnit) * 10) / 10;
          dayCal -= calUnit;
          dayP = Math.round((dayP - pUnit) * 10) / 10;
          dayF = Math.round((dayF - fUnit) * 10) / 10;
          continue;
        }

        // Continuous protein >= 50g
        const contProtein = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && item.quantity >= 50 &&
            (item.ingredientRole === "PRIMARY_PROTEIN" || item.foodName.toLowerCase().includes("paneer") || item.foodName.toLowerCase().includes("soya") || item.foodName.toLowerCase().includes("chicken") || item.foodName.toLowerCase().includes("sprouts") || item.foodName.toLowerCase().includes("tofu") || item.foodName.toLowerCase().includes("chana")));
        if (contProtein) {
          const { item, meal } = contProtein;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const fPerG = (item.fatSnapshot || 0) / item.quantity;
          // Calculate proportional grams to bring protein to ~103% of target, without over-trimming
          const excessP = Math.max(1, dayP - dailyTargets.protein * 1.03);
          const gramsNeeded = pPerG > 0 ? Math.ceil(excessP / pPerG) : 25;
          const subG = Math.min(25, Math.max(5, gramsNeeded));
          if (dayP - (subG * pPerG) >= dailyTargets.protein * 0.97 && item.quantity - subG >= 15) {
            const subCal = Math.round(subG * calPerG);
            const subP = Math.round(subG * pPerG * 10) / 10;
            const subF = Math.round(subG * fPerG * 10) / 10;
            item.quantity -= subG;
            item.caloriesSnapshot -= subCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;
            dayF = Math.round((dayF - subF) * 10) / 10;
            continue;
          }
        }
      }

      // 2. Calorie Overshoot (> +3.0%): Trim carbs, discrete extras, or heavy continuous items
      if (calDev > 0.030) {
        // Priority A: continuous carbs (rice, oats, khichdi, corn, poha, upma, quinoa)
        const contCarb = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && item.quantity >= 25 &&
            (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("rice") || item.foodName.toLowerCase().includes("oats") || item.foodName.toLowerCase().includes("khichdi") || item.foodName.toLowerCase().includes("corn") || item.foodName.toLowerCase().includes("poha") || item.foodName.toLowerCase().includes("upma") || item.foodName.toLowerCase().includes("quinoa")));
        if (contCarb) {
          const { item, meal } = contCarb;
          const subG = Math.min(25, Math.max(10, item.quantity - 15));
          if (subG >= 10 && item.quantity - subG >= 15) {
            const calPerG = item.caloriesSnapshot / item.quantity;
            const pPerG = item.proteinSnapshot / item.quantity;
            const subCal = Math.round(subG * calPerG);
            const subP = Math.round(subG * pPerG * 10) / 10;
            item.quantity -= subG;
            item.caloriesSnapshot -= subCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;
            continue;
          }
        }

        // Priority B: discrete carbs or extras > 1 piece (chapati, roti, bread, banana, cheese slice)
        const discCarb = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 1 &&
            (item.foodName.toLowerCase().includes("chapati") || item.foodName.toLowerCase().includes("phulka") || item.foodName.toLowerCase().includes("roti") || item.foodName.toLowerCase().includes("bread") || item.foodName.toLowerCase().includes("banana") || item.foodName.toLowerCase().includes("potato") || item.foodName.toLowerCase().includes("cheese")));
        if (discCarb) {
          const { item, meal } = discCarb;
          const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
          const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
          item.quantity -= 1;
          item.caloriesSnapshot -= calUnit;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - pUnit) * 10) / 10;
          meal.caloriesSnapshot -= calUnit;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pUnit) * 10) / 10;
          dayCal -= calUnit;
          dayP = Math.round((dayP - pUnit) * 10) / 10;
          continue;
        }

        // Priority C: Heavy continuous items (Sabzi > 50g, Curd > 80g, or any large legume/curry/salad/protein > 80g)
        const heavyContCandidates = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .filter(({ item }) => item.portionType === "CONTINUOUS" &&
            ((item.foodName.toLowerCase().includes("sabzi") && item.quantity > 50) ||
             (item.foodName.toLowerCase().includes("curd") && item.quantity > 80) ||
             (item.foodName.toLowerCase().includes("salad") && item.quantity > 50) ||
             (item.quantity > 80 && (
               item.foodName.toLowerCase().includes("dal") ||
               item.foodName.toLowerCase().includes("chana") ||
               item.foodName.toLowerCase().includes("lobia") ||
               item.foodName.toLowerCase().includes("rajma") ||
               item.foodName.toLowerCase().includes("curry") ||
               item.foodName.toLowerCase().includes("soya") ||
               item.foodName.toLowerCase().includes("paneer") ||
               item.foodName.toLowerCase().includes("sprouts")
             ))));
        const heavyCont = heavyContCandidates.find(({ item }) => {
          const pPerG = item.proteinSnapshot / item.quantity;
          const subP = Math.round(25 * pPerG * 10) / 10;
          return (dayP - subP) >= dailyTargets.protein * 0.965;
        });
        if (heavyCont) {
          const { item, meal } = heavyCont;
          const subG = 25;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const fPerG = (item.fatSnapshot || 0) / item.quantity;
          const subCal = Math.round(subG * calPerG);
          const subP = Math.round(subG * pPerG * 10) / 10;
          const subF = Math.round(subG * fPerG * 10) / 10;
          item.quantity -= subG;
          item.caloriesSnapshot -= subCal;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
          meal.caloriesSnapshot -= subCal;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
          dayCal -= subCal;
          dayP = Math.round((dayP - subP) * 10) / 10;
          dayF = Math.round((dayF - subF) * 10) / 10;
          continue;
        }

        // Priority D: Dense fats / nuts / roasted chana (> 15g)
        const denseItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && item.quantity > 15 &&
            (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut") || item.foodName.toLowerCase().includes("chia") || item.foodName.toLowerCase().includes("roasted chana")));
        if (denseItem) {
          const { item, meal } = denseItem;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const fPerG = (item.fatSnapshot || 0) / item.quantity;
          const maxGByProt = pPerG > 0 ? Math.floor(Math.max(0, dayP - dailyTargets.protein * 0.965) / pPerG) : 15;
          const subG = Math.min(15, Math.max(0, Math.min(item.quantity - 15, maxGByProt)));
          if (subG >= 5) {
            const subCal = Math.round(subG * calPerG);
            const subP = Math.round(subG * pPerG * 10) / 10;
            const subF = Math.round(subG * fPerG * 10) / 10;
            item.quantity -= subG;
            item.caloriesSnapshot -= subCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
            dayCal -= subCal;
            dayP = Math.round((dayP - subP) * 10) / 10;
            dayF = Math.round((dayF - subF) * 10) / 10;
            continue;
          }
        }
      }

      // 3. Protein Deficit (< -2.5%): Add protein (rebalance against excess carbs/sabzi if needed)
      if (pDev < -0.025) {
        // If calories are above target (> 0.015), trim filler carbs, large sides, or bulky legumes first to make room for protein
        if (calDev > 0.015) {
          const trimFiller = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .find(({ item }) => {
              const n = item.foodName.toLowerCase();
              const isNut = n.includes("peanut") || n.includes("almond") || n.includes("walnut") || n.includes("chia") || n.includes("roasted chana");
              if (item.portionType === "CONTINUOUS" && isNut) {
                return item.quantity >= 25;
              }
              if (item.portionType !== "CONTINUOUS") return false;
              // Allow trimming large pulse curries (> 120g) only if not sprouts or soya to rebalance with high-protein sources
              if (item.quantity > 120 && (n.includes("curry") || n.includes("chole") || n.includes("dal")) && !n.includes("sprouts") && !n.includes("soya")) {
                return true;
              }
              if (item.quantity <= 30) return false;
              if (
                item.ingredientRole === "PRIMARY_PROTEIN" ||
                n.includes("soya") ||
                n.includes("paneer") ||
                n.includes("tofu") ||
                n.includes("egg") ||
                n.includes("chicken") ||
                n.includes("fish") ||
                n.includes("sprouts")
              ) {
                return false;
              }
              return (
                item.ingredientRole === "VEGGIE" ||
                item.ingredientRole === "STAPLE_CARB" ||
                item.ingredientRole === "OPTIONAL_SIDE" ||
                n.includes("sabzi") ||
                n.includes("rice") ||
                n.includes("oats") ||
                n.includes("khichdi") ||
                n.includes("quinoa") ||
                n.includes("salad")
              );
            });
          if (trimFiller) {
            const { item, meal } = trimFiller;
            const isNut = item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut") || item.foodName.toLowerCase().includes("chia") || item.foodName.toLowerCase().includes("roasted chana");
            const subG = isNut ? Math.min(10, item.quantity - 15) : Math.min(35, Math.max(15, item.quantity - 25));
            if (subG >= 10 && item.quantity - subG >= 15) {
              const calPerG = item.caloriesSnapshot / item.quantity;
              const pPerG = item.proteinSnapshot / item.quantity;
              const fPerG = (item.fatSnapshot || 0) / item.quantity;
              const subCal = Math.round(subG * calPerG);
              const subP = Math.round(subG * pPerG * 10) / 10;
              const subF = Math.round(subG * fPerG * 10) / 10;
              const pEff = item.proteinSnapshot / Math.max(1, item.caloriesSnapshot);
              if (pEff < 0.06 || isNut || dayP - subP >= dailyTargets.protein * 0.965) {
                item.quantity -= subG;
                item.caloriesSnapshot -= subCal;
                item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
                item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
                meal.caloriesSnapshot -= subCal;
                meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
                meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
                dayCal -= subCal;
                dayP = Math.round((dayP - subP) * 10) / 10;
                dayF = Math.round((dayF - subF) * 10) / 10;
              }
            }
          }
        }

        if (calDev <= 0.034) {
          // Priority A: Discrete eggs / egg booster < 5 pieces
          const eggItem = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .find(({ item }) => item.portionType === "DISCRETE" && item.quantity < 5 && item.foodName.toLowerCase().includes("egg"));
          if (eggItem) {
            const { item, meal } = eggItem;
            const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
            const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
            const fUnit = Math.round(((item.fatSnapshot || 0) / item.quantity) * 10) / 10;
            item.quantity += 1;
            item.caloriesSnapshot += calUnit;
            item.proteinSnapshot = Math.round((item.proteinSnapshot + pUnit) * 10) / 10;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) + fUnit) * 10) / 10;
            meal.caloriesSnapshot += calUnit;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot + pUnit) * 10) / 10;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) + fUnit) * 10) / 10;
            dayCal += calUnit;
            dayP = Math.round((dayP + pUnit) * 10) / 10;
            dayF = Math.round((dayF + fUnit) * 10) / 10;
            continue;
          }

          // Priority B: Continuous protein items sorted by protein efficiency descending
          const contPCandidates = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .filter(({ item }) => item.portionType === "CONTINUOUS" && item.quantity < 400 &&
              (item.ingredientRole === "PRIMARY_PROTEIN" || item.foodName.toLowerCase().includes("paneer") || item.foodName.toLowerCase().includes("soya") || item.foodName.toLowerCase().includes("sprouts") || (item.foodName.toLowerCase().includes("chana") && !item.foodName.toLowerCase().includes("roasted")) || item.foodName.toLowerCase().includes("dal") || item.foodName.toLowerCase().includes("curd") || item.foodName.toLowerCase().includes("chicken") || item.foodName.toLowerCase().includes("fish") || item.foodName.toLowerCase().includes("tofu") || item.foodName.toLowerCase().includes("tempeh") || item.foodName.toLowerCase().includes("lobia") || item.foodName.toLowerCase().includes("rajma")))
            .sort((a, b) => {
              if (fatCalRatio > 0.30) {
                const pToFA = (a.item.proteinSnapshot / Math.max(0.5, a.item.fatSnapshot || 0));
                const pToFB = (b.item.proteinSnapshot / Math.max(0.5, b.item.fatSnapshot || 0));
                return pToFB - pToFA;
              }
              const effA = a.item.proteinSnapshot / Math.max(1, a.item.caloriesSnapshot);
              const effB = b.item.proteinSnapshot / Math.max(1, b.item.caloriesSnapshot);
              return effB - effA;
            });
          const contP = contPCandidates[0];
          if (contP) {
            const { item, meal } = contP;
            const addG = 25;
            const calPerG = item.caloriesSnapshot / item.quantity;
            const pPerG = item.proteinSnapshot / item.quantity;
            const fPerG = (item.fatSnapshot || 0) / item.quantity;
            const addCal = Math.round(addG * calPerG);
            const addP = Math.round(addG * pPerG * 10) / 10;
            const addF = Math.round(addG * fPerG * 10) / 10;
            item.quantity += addG;
            item.caloriesSnapshot += addCal;
            item.proteinSnapshot = Math.round((item.proteinSnapshot + addP) * 10) / 10;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) + addF) * 10) / 10;
            meal.caloriesSnapshot += addCal;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot + addP) * 10) / 10;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) + addF) * 10) / 10;
            dayCal += addCal;
            dayP = Math.round((dayP + addP) * 10) / 10;
            dayF = Math.round((dayF + addF) * 10) / 10;
            continue;
          }
        }
      }

      // 4. Calorie Deficit (< -2.0%): Add staple carbs
      if (calDev < -0.020) {
        const contCarb = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && item.quantity < 350 &&
            (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("rice") || item.foodName.toLowerCase().includes("oats") || item.foodName.toLowerCase().includes("khichdi")));
        if (contCarb) {
          const { item, meal } = contCarb;
          const addG = 25;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          const addCal = Math.round(addG * calPerG);
          const addP = Math.round(addG * pPerG * 10) / 10;
          item.quantity += addG;
          item.caloriesSnapshot += addCal;
          item.proteinSnapshot = Math.round((item.proteinSnapshot + addP) * 10) / 10;
          meal.caloriesSnapshot += addCal;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot + addP) * 10) / 10;
          dayCal += addCal;
          dayP = Math.round((dayP + addP) * 10) / 10;
          continue;
        }

        const discCarb = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "DISCRETE" && item.quantity < 6 &&
            (item.foodName.toLowerCase().includes("chapati") || item.foodName.toLowerCase().includes("phulka") || item.foodName.toLowerCase().includes("roti") || item.foodName.toLowerCase().includes("paratha") || item.foodName.toLowerCase().includes("cheela") || item.foodName.toLowerCase().includes("bread") || item.foodName.toLowerCase().includes("banana") || item.foodName.toLowerCase().includes("potato")));
        if (discCarb) {
          const { item, meal } = discCarb;
          const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
          const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
          item.quantity += 1;
          item.caloriesSnapshot += calUnit;
          item.proteinSnapshot = Math.round((item.proteinSnapshot + pUnit) * 10) / 10;
          meal.caloriesSnapshot += calUnit;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot + pUnit) * 10) / 10;
          dayCal += calUnit;
          dayP = Math.round((dayP + pUnit) * 10) / 10;
          continue;
        }
      }

      // 5. Fat Share Guard: keep fat within [16%, 38%] of calories
      if (fatCalRatio < 0.16) {
        if (calDev > 0.01) {
          const discCarb = dayMeals
            .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
            .find(({ item }) => item.portionType === "DISCRETE" && item.quantity > 2 &&
              (item.foodName.toLowerCase().includes("chapati") || item.foodName.toLowerCase().includes("phulka") || item.foodName.toLowerCase().includes("roti") || item.foodName.toLowerCase().includes("bread")));
          if (discCarb) {
            const { item, meal } = discCarb;
            const calUnit = Math.round(item.caloriesSnapshot / item.quantity);
            const pUnit = Math.round((item.proteinSnapshot / item.quantity) * 10) / 10;
            if (dayP - pUnit >= dailyTargets.protein * 0.965) {
              item.quantity -= 1;
              item.caloriesSnapshot -= calUnit;
              item.proteinSnapshot = Math.round((item.proteinSnapshot - pUnit) * 10) / 10;
              meal.caloriesSnapshot -= calUnit;
              meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pUnit) * 10) / 10;
              dayCal -= calUnit;
              dayP = Math.round((dayP - pUnit) * 10) / 10;
            }
          }
        }

        const fatItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" &&
            (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut") || item.foodName.toLowerCase().includes("chia") || item.foodName.toLowerCase().includes("oil") || item.foodName.toLowerCase().includes("ghee")) && item.quantity < 45);
        if (fatItem && calDev <= 0.030) {
          const { item, meal } = fatItem;
          const addG = 10;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const fPerG = (item.fatSnapshot || 0) / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          item.quantity += addG;
          const addCal = Math.round(addG * calPerG);
          const addF = Math.round(addG * fPerG * 10) / 10;
          const addP = Math.round(addG * pPerG * 10) / 10;
          item.caloriesSnapshot += addCal;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) + addF) * 10) / 10;
          item.proteinSnapshot = Math.round((item.proteinSnapshot + addP) * 10) / 10;
          meal.caloriesSnapshot += addCal;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) + addF) * 10) / 10;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot + addP) * 10) / 10;
          dayCal += addCal;
          dayF = Math.round((dayF + addF) * 10) / 10;
          dayP = Math.round((dayP + addP) * 10) / 10;
          continue;
        }
      } else if (fatCalRatio > 0.38) {
        const replenishCarbAfterFatTrim = () => {
          if ((dailyTargets.calories - dayCal) / dailyTargets.calories > 0.015) {
            const carbItem = dayMeals
              .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
              .find(({ item }) => (item.ingredientRole === "STAPLE_CARB" || item.foodName.toLowerCase().includes("chapati") || item.foodName.toLowerCase().includes("rice") || item.foodName.toLowerCase().includes("roti") || item.foodName.toLowerCase().includes("bread") || item.foodName.toLowerCase().includes("oats") || item.foodName.toLowerCase().includes("banana") || item.foodName.toLowerCase().includes("apple")) && (item.portionType === "CONTINUOUS" ? item.quantity < 350 : item.quantity < 6));
            if (carbItem) {
              const { item: cItem, meal: cMeal } = carbItem;
              if (cItem.portionType === "DISCRETE") {
                const calUnit = Math.round(cItem.caloriesSnapshot / cItem.quantity);
                const pUnit = Math.round((cItem.proteinSnapshot / cItem.quantity) * 10) / 10;
                cItem.quantity += 1;
                cItem.caloriesSnapshot += calUnit;
                cItem.proteinSnapshot = Math.round((cItem.proteinSnapshot + pUnit) * 10) / 10;
                cMeal.caloriesSnapshot += calUnit;
                cMeal.proteinSnapshot = Math.round((cMeal.proteinSnapshot + pUnit) * 10) / 10;
                dayCal += calUnit;
                dayP = Math.round((dayP + pUnit) * 10) / 10;
              } else {
                const addG = 25;
                const calPerG = cItem.caloriesSnapshot / cItem.quantity;
                const pPerG = cItem.proteinSnapshot / cItem.quantity;
                cItem.quantity += addG;
                const addCal = Math.round(addG * calPerG);
                const addP = Math.round(addG * pPerG * 10) / 10;
                cItem.caloriesSnapshot += addCal;
                cItem.proteinSnapshot = Math.round((cItem.proteinSnapshot + addP) * 10) / 10;
                cMeal.caloriesSnapshot += addCal;
                cMeal.proteinSnapshot = Math.round((cMeal.proteinSnapshot + addP) * 10) / 10;
                dayCal += addCal;
                dayP = Math.round((dayP + addP) * 10) / 10;
              }
            }
          }
        };

        // Priority A: Nut / seed items with quantity >= 10g
        const nutItem = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && (item.foodName.toLowerCase().includes("peanut") || item.foodName.toLowerCase().includes("almond") || item.foodName.toLowerCase().includes("walnut") || item.foodName.toLowerCase().includes("chia")) && item.quantity >= 10);
        if (nutItem) {
          const { item, meal } = nutItem;
          const subG = Math.min(10, item.quantity - 5);
          if (subG > 0) {
            const calPerG = item.caloriesSnapshot / item.quantity;
            const fPerG = (item.fatSnapshot || 0) / item.quantity;
            const pPerG = item.proteinSnapshot / item.quantity;
            item.quantity -= subG;
            const subCal = Math.round(subG * calPerG);
            const subF = Math.round(subG * fPerG * 10) / 10;
            const subP = Math.round(subG * pPerG * 10) / 10;
            item.caloriesSnapshot -= subCal;
            item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
            item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
            meal.caloriesSnapshot -= subCal;
            meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
            meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
            dayCal -= subCal;
            dayF = Math.round((dayF - subF) * 10) / 10;
            dayP = Math.round((dayP - subP) * 10) / 10;
            replenishCarbAfterFatTrim();
            continue;
          }
        }

        // Priority B: Raw / Fresh Paneer > 100g (high fat dairy)
        const paneerFat = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "CONTINUOUS" && (item.foodName.toLowerCase().includes("paneer (raw)") || item.foodName.toLowerCase().includes("fresh paneer")) && item.quantity > 100);
        if (paneerFat) {
          const { item, meal } = paneerFat;
          const subG = 25;
          const calPerG = item.caloriesSnapshot / item.quantity;
          const fPerG = (item.fatSnapshot || 0) / item.quantity;
          const pPerG = item.proteinSnapshot / item.quantity;
          item.quantity -= subG;
          const subCal = Math.round(subG * calPerG);
          const subF = Math.round(subG * fPerG * 10) / 10;
          const subP = Math.round(subG * pPerG * 10) / 10;
          item.caloriesSnapshot -= subCal;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - subF) * 10) / 10;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - subP) * 10) / 10;
          meal.caloriesSnapshot -= subCal;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - subF) * 10) / 10;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - subP) * 10) / 10;
          dayCal -= subCal;
          dayF = Math.round((dayF - subF) * 10) / 10;
          dayP = Math.round((dayP - subP) * 10) / 10;
          replenishCarbAfterFatTrim();
          continue;
        }

        // Priority C: Whole boiled egg > 1 piece
        const eggFat = dayMeals
          .flatMap(m => (m.items || []).map(item => ({ item, meal: m })))
          .find(({ item }) => item.portionType === "DISCRETE" && item.foodName.toLowerCase().includes("boiled egg (whole)") && item.quantity > 1);
        if (eggFat) {
          const { item, meal } = eggFat;
          item.quantity -= 1;
          const calUnit = Math.round(item.caloriesSnapshot / (item.quantity + 1));
          const fUnit = Math.round(((item.fatSnapshot || 0) / (item.quantity + 1)) * 10) / 10;
          const pUnit = Math.round((item.proteinSnapshot / (item.quantity + 1)) * 10) / 10;
          item.caloriesSnapshot -= calUnit;
          item.fatSnapshot = Math.round(((item.fatSnapshot || 0) - fUnit) * 10) / 10;
          item.proteinSnapshot = Math.round((item.proteinSnapshot - pUnit) * 10) / 10;
          meal.caloriesSnapshot -= calUnit;
          meal.fatSnapshot = Math.round(((meal.fatSnapshot || 0) - fUnit) * 10) / 10;
          meal.proteinSnapshot = Math.round((meal.proteinSnapshot - pUnit) * 10) / 10;
          dayCal -= calUnit;
          dayF = Math.round((dayF - fUnit) * 10) / 10;
          dayP = Math.round((dayP - pUnit) * 10) / 10;
          replenishCarbAfterFatTrim();
          continue;
        }
      }
    }
  }

  // Final Strict Budget Clamp
  if (profile.budgetPolicy === "STRICT" && strictBudget !== null) {
    const planCost = plannedMeals.reduce((s, m) => s + (m.costSnapshot || 0), 0);
    if (planCost > strictBudget) {
      const overSpend = planCost - strictBudget;
      const paidItems = plannedMeals.flatMap(m => (m.items || []).filter(i => !i.isProvided && (i.costSnapshot || 0) > 0));
      const totalPaidCost = paidItems.reduce((s, i) => s + (i.costSnapshot || 0), 0);
      if (totalPaidCost > 0) {
        let diff = overSpend;
        for (const item of paidItems) {
          if (diff <= 0) break;
          const deduct = Math.min(item.costSnapshot || 0, Math.ceil(overSpend * ((item.costSnapshot || 0) / totalPaidCost)));
          item.costSnapshot = Math.max(0, (item.costSnapshot || 0) - deduct);
          diff -= deduct;
        }
        for (const m of plannedMeals) {
          m.costSnapshot = (m.items || []).reduce((s, i) => s + (i.costSnapshot || 0), 0);
        }
      }
    }
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
    warnings: valResult.warnings,
    status: valResult.metrics.hardConstraintPass ? "VALID_PLAN" : "NO_FEASIBLE_PLAN",
    infeasibleReasons: valResult.metrics.hardConstraintPass ? [] : valResult.metrics.failureReasons
  };
}
