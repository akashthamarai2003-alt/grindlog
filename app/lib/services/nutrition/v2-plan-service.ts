// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Service Layer & API Integration
// File: lib/services/nutrition/v2-plan-service.ts
//
// Validated against GrindLog deterministic nutrition rules and automated acceptance tests.
// Single source of truth for new nutrition plans, swap optimization,
// pantry-aware grocery aggregation, and adaptive daily macro tracking.
// ─────────────────────────────────────────────────────────────

import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import {
  MealSlotType,
  PlannedMeal,
  PlannedMealItem,
  UserPlanningProfile,
  DietCategory,
  CookingEquipment,
  BudgetPolicy,
  AvailablePantryFood,
  matchesAllergen,
} from "@/lib/fitness/nutrition/domain-types";
import {
  generateUnified7DayPlan,
  calculateDailyTargets,
  calculateSlotAllocations,
  loadNutritionCatalog,
  MacroTargets,
  Unified7DayPlanResult,
} from "@/lib/fitness/nutrition/unified-7day-planner";
import {
  validate7DayPlan,
  DayPlanSummary,
} from "@/lib/fitness/nutrition/plan-quality-validator";
import {
  generateMealCandidates,
  RecipeCatalogItem,
  CandidateMeal,
} from "@/lib/fitness/nutrition/candidate-generator";
import {
  optimizeMealPortions,
  FoodMacroProfile,
} from "@/lib/fitness/nutrition/portion-optimizer";
import {
  NutritionService,
  invalidateNutritionServerCache,
  getRealisticFoodCost,
  isStapleCoreFood,
} from "@/lib/services/nutrition/nutrition-service";
import { NutritionValidationEngine } from "@/lib/fitness/nutrition/validation-engine";

// Concurrency lock to prevent concurrent duplicate generation per user
const v2PlanGenInFlight = new Map<string, Promise<any>>();

export interface V2SwapCandidate {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  prep_instructions: string;
  image_url?: string;
  items: Array<{
    food_id: string;
    name: string;
    quantity: number;
    portion_type: string;
    unit: string;
    serving_size: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    estimated_cost: number;
    is_provided: boolean;
  }>;
}

export interface V2GroceryCategoryGroup {
  category: string;
  items: Array<{
    name: string;
    weekly_quantity: number;
    monthly_quantity: number;
    unit: string;
    estimated_cost_inr: number;
    is_provided: boolean;
    is_pantry: boolean;
    used_in_meals: string[];
    serving_info: string;
  }>;
}

export interface V2GroceryListResult {
  startDate: string;
  endDate: string;
  totalWeeklySpendInr: number;
  needToBuy: V2GroceryCategoryGroup[];
  alreadyHave: Array<{ name: string; note: string }>;
  providedByMess: Array<{ name: string; note: string }>;
}

export class V2PlanService {
  static readonly PLANNER_VERSION = "v2.0-deterministic";

  /**
   * Safe feature flag evaluator for controlled rollout.
   * Checks user profile attribute, environment variable, or explicit override.
   */
  static isNutritionV2Enabled(
    userId: string,
    profile?: any,
    options?: { forceV2?: boolean }
  ): boolean {
    if (options?.forceV2) return true;
    if (profile?.nutrition_engine_v2 === true) return true;
    if (profile?.metadata?.nutrition_engine_v2 === true) return true;
    if (
      process.env.NUTRITION_ENGINE_V2 === "true" ||
      process.env.ENABLE_NUTRITION_V2 === "true"
    ) {
      return true;
    }
    return false;
  }

  /**
   * Maps existing fitness_os_profiles row into a strongly-typed UserPlanningProfile.
   */
  static mapProfileToV2Context(
    profile: any,
    targets?: any,
    timezone = "Asia/Kolkata"
  ): UserPlanningProfile {
    // 1. Diet preference mapping
    const rawDiet = `${profile?.food_type || ""} ${profile?.diet_preference || ""}`
      .toLowerCase()
      .trim();
    let dietPreference: DietCategory = "vegetarian";
    if (rawDiet.includes("vegan")) {
      dietPreference = "vegan";
    } else if (
      rawDiet.includes("non") ||
      rawDiet.includes("meat") ||
      rawDiet.includes("chicken") ||
      rawDiet.includes("fish")
    ) {
      dietPreference = "non-veg";
    } else if (rawDiet.includes("egg")) {
      dietPreference = "eggetarian";
    } else {
      dietPreference = "vegetarian";
    }

    // 2. Food environment mapping
    const rawEnv = String(profile?.food_environment || "").toLowerCase().trim();
    let foodEnvironment: "I Cook" | "Home" | "PG" | "Hostel" | "Office/Canteen" = "Home";
    if (rawEnv.includes("hostel")) foodEnvironment = "Hostel";
    else if (rawEnv.includes("pg")) foodEnvironment = "PG";
    else if (rawEnv.includes("cook")) foodEnvironment = "I Cook";
    else if (rawEnv.includes("office") || rawEnv.includes("canteen")) foodEnvironment = "Office/Canteen";
    else foodEnvironment = "Home";

    // 3. Meals per day
    const rawMpd = String(profile?.meals_per_day || "").toLowerCase();
    let mealsPerDay = 3;
    if (rawMpd.includes("2")) mealsPerDay = 2;
    else if (rawMpd.includes("4")) mealsPerDay = 4;
    else if (rawMpd.includes("5")) mealsPerDay = 5;
    else mealsPerDay = 3;

    // 4. Budget normalization
    let monthlyBudgetInr = 4500;
    let weeklyBudgetTargetInr = 1125;
    let budgetPolicy: BudgetPolicy = "FLEXIBLE";
    const rawBudget = String(profile?.nutrition_budget || "");
    if (
      rawBudget.includes("0–1,000") ||
      rawBudget.includes("0-1,000") ||
      rawBudget.includes("1000")
    ) {
      monthlyBudgetInr = 1100;
      weeklyBudgetTargetInr = Math.round(1100 / 4);
      budgetPolicy = "STRICT";
    } else if (
      rawBudget.includes("1,000–2,000") ||
      rawBudget.includes("1,000-2,000")
    ) {
      monthlyBudgetInr = 2000;
      weeklyBudgetTargetInr = 500;
      budgetPolicy = "STRICT";
    } else if (rawBudget.includes("5,000") || rawBudget.includes("5000")) {
      monthlyBudgetInr = 7500;
      weeklyBudgetTargetInr = 1875;
      budgetPolicy = "FLEXIBLE";
    } else {
      monthlyBudgetInr = 4500;
      weeklyBudgetTargetInr = 1125;
      budgetPolicy = "FLEXIBLE";
    }

    // 5. Equipment parsing
    const rawEq = Array.isArray(profile?.equipment) ? profile.equipment : [];
    const availableEquipment: CookingEquipment[] = rawEq
      .map((eq: string) => {
        const l = String(eq).toLowerCase();
        if (l.includes("kettle")) return "kettle";
        if (l.includes("stove") || l.includes("gas")) return "stove";
        if (l.includes("micro")) return "microwave";
        if (l.includes("blend")) return "blender";
        if (l.includes("toast")) return "toaster";
        if (l.includes("air")) return "air_fryer";
        if (l.includes("oven")) return "oven";
        return "none";
      })
      .filter((eq: CookingEquipment) => eq !== "none");

    if (availableEquipment.length === 0) {
      if (foodEnvironment === "Hostel" || foodEnvironment === "PG") {
        availableEquipment.push("kettle");
      } else {
        availableEquipment.push("stove", "blender");
      }
    }

    // 6. Mess meals resolution
    const messAvailable =
      foodEnvironment === "Hostel" ||
      foodEnvironment === "PG" ||
      foodEnvironment === "Office/Canteen";
    const messMeals: MealSlotType[] = messAvailable
      ? mealsPerDay === 2
        ? ["lunch", "dinner"]
        : ["breakfast", "lunch", "dinner"]
      : [];

    const parseList = (val: any): string[] => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string")
        return val.split(/[,;|\n]+/).map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const allergies = parseList(profile?.food_allergies);
    const dislikedFoods = parseList(profile?.foods_disliked);
    const avoidedFoods = parseList(profile?.foods_avoided);
    const availableFoodsRaw = parseList(profile?.available_foods);
    const availableFoods: AvailablePantryFood[] = availableFoodsRaw.map((name) => ({ name }));

    return {
      userId: profile?.user_id || profile?.id || "user-v2",
      gender: profile?.gender || "Male",
      age: Number(profile?.age) || 25,
      heightCm: Number(profile?.height) || 172,
      weightKg: Number(profile?.weight) || 70,
      targetWeightKg: profile?.target_weight ? Number(profile.target_weight) : null,
      goal: profile?.goal || "Maintain",
      fitnessLevel: profile?.fitness_level || "Intermediate",
      activityLevel: profile?.activity_level || "Moderately active",
      dietPreference,
      foodEnvironment,
      mealsPerDay,
      monthlyBudgetInr,
      weeklyBudgetTargetInr,
      budgetPolicy,
      allergies,
      dislikedFoods,
      avoidedFoods,
      availableEquipment,
      messAvailable,
      messMeals,
      messIncludedInBudget: messAvailable,
      availableFoods,
      workoutTime: profile?.workout_time || "18:00:00",
      wakeTime: profile?.wake_time || "07:00:00",
      sleepTime: profile?.sleep_time || "23:00:00",
      timezone,
    };
  }

  /**
   * Refactored 7-Day Plan Generation API & Service.
   * Execution steps:
   * 1. Authenticate user
   * 2. Load profile
   * 3. Resolve timezone
   * 4. Load catalog
   * 5. Calculate targets
   * 6. Call generateUnified7DayPlan
   * 7. Validate result
   * 8. Persist transactionally
   * 9. Supersede previous active plan
   * 10. Return normalized V2 plan
   */
  static async generateV2MealPlan(
    userId: string,
    options?: { forceV2?: boolean; startDate?: string }
  ): Promise<Unified7DayPlanResult & { message: string; existing?: boolean }> {
    // Concurrency lock: prevent double-clicks
    const lockKey = `${userId}:v2_plan_gen`;
    const inFlight = v2PlanGenInFlight.get(lockKey);
    if (inFlight) {
      return inFlight;
    }

    const execGeneration = async () => {
      const supabase = createAdminClient();

      // 1. Weekly rate limit check
      const eligibility = await NutritionService.getWeeklyPlanEligibility(userId);
      if (!eligibility.can_generate && !options?.forceV2) {
        throw new Error(
          eligibility.message ||
            "Weekly limit reached. You can generate 1 meal plan per week (max 4 per month)."
        );
      }

      // 2. Load profile
      const { data: profile, error: profileErr } = await supabase
        .from("fitness_os_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileErr || !profile) {
        throw new Error("PROFILE_INCOMPLETE: Profile not found. Please complete onboarding.");
      }

      const ageNum = Number(profile.age);
      if (!Number.isFinite(ageNum) || ageNum < 18) {
        throw new Error(
          "CLINICAL_REVIEW_REQUIRED: Automatic adult diet plans are not available for users under 18. Ask a qualified clinician or dietitian to review your nutrition needs."
        );
      }

      if (
        !Number.isFinite(Number(profile.height)) ||
        !Number.isFinite(Number(profile.weight)) ||
        !profile.nutrition_budget ||
        !profile.meals_per_day
      ) {
        throw new Error(
          "PROFILE_INCOMPLETE: Complete your height, weight, diet, meal count, and budget before generating a plan."
        );
      }

      // 3. Resolve timezone
      const tz = await NutritionService.getUserTimezone(userId);
      const localDate = options?.startDate || (await NutritionService.getLocalDateString(userId, tz));

      // 4. Map profile into V2 context
      const v2Profile = this.mapProfileToV2Context(profile, null, tz);
      const dailyTargets = calculateDailyTargets(v2Profile);

      // 5. Generate 7-Day Plan with Unified Planner
      const rawResult = generateUnified7DayPlan(v2Profile, localDate);

      // 6. Validate Plan Quality & Hard Constraints
      const validation = validate7DayPlan(
        rawResult.dailySummaries,
        v2Profile,
        dailyTargets
      );

      if (!validation.metrics.hardConstraintPass || validation.metrics.compositeScore < 75) {
        const failureReason =
          (validation.metrics.failureReasons && validation.metrics.failureReasons.join(", ")) ||
          "Plan did not meet deterministic quality rules.";
        throw new Error(`PLAN_VALIDATION_FAILED: ${failureReason}. Your saved plan was left untouched.`);
      }

      // 7. Catalog lookup to ensure recipe names and variant info are accurately rendered
      const catalog = loadNutritionCatalog();
      const versionById = new Map(
        (catalog.recipes || []).map((r) => [r.recipeVersion.id, r.recipeVersion])
      );

      // 8. Build transactional persistence payload
      // Group planned meals by date
      const mealsByDate = new Map<string, PlannedMeal[]>();
      for (const meal of rawResult.plannedMeals) {
        if (!mealsByDate.has(meal.localDate)) {
          mealsByDate.set(meal.localDate, []);
        }
        mealsByDate.get(meal.localDate)!.push(meal);
      }

      const planDaysPayload: any[] = [];
      const distinctDates = Array.from(mealsByDate.keys()).sort();

      for (const dateStr of distinctDates) {
        const dayMeals = mealsByDate.get(dateStr) || [];

        let dayCal = 0;
        let dayP = 0;
        let dayC = 0;
        let dayF = 0;
        let dayCost = 0;

        const dayItems: any[] = [];

        for (const meal of dayMeals) {
          dayCal += meal.caloriesSnapshot || 0;
          dayP += meal.proteinSnapshot || 0;
          dayC += meal.carbsSnapshot || 0;
          dayF += meal.fatSnapshot || 0;
          dayCost += meal.costSnapshot || 0;

          // Determine title for the meal slot
          let mealTitle = `${meal.mealSlot.charAt(0).toUpperCase() + meal.mealSlot.slice(1)} Meal`;
          if (meal.sourceType === "RECIPE" && meal.recipeVersionId) {
            const rv = versionById.get(meal.recipeVersionId);
            if (rv) mealTitle = rv.name;
          } else if (meal.sourceType === "TEMPLATE") {
            const boosterItem = (meal.items || []).find(
              (it) => it.ingredientRole === "PRIMARY_PROTEIN" && !it.isProvided
            );
            mealTitle = boosterItem
              ? `${v2Profile.foodEnvironment} Mess ${meal.mealSlot} (+ ${boosterItem.foodName.replace(/^Mess\s+/i, "")})`
              : `${v2Profile.foodEnvironment} Mess ${meal.mealSlot}`;
          }

          for (const item of meal.items || []) {
            const rawServing = item.portionType === "DISCRETE"
              ? `${item.quantity} ${item.unit}`
              : `${item.quantity}${item.unit}`;

            dayItems.push({
              food_id: item.foodId,
              quantity: item.portionType === "DISCRETE" ? item.quantity : 1,
              serving_size: `${meal.mealSlot}::${mealTitle}::${rawServing}`,
            });
          }
        }

        planDaysPayload.push({
          date: dateStr,
          plan: {
            name: "7-Day Precision Nutrition Plan",
            calories: Math.round(dayCal),
            protein: Number(dayP.toFixed(1)),
            carbs: Number(dayC.toFixed(1)),
            fat: Number(dayF.toFixed(1)),
            estimated_cost: Math.round(dayCost),
          },
          items: dayItems,
        });
      }

      // 9. Transactional persistence via atomic RPC
      const { error: saveError } = await supabase.rpc("replace_weekly_meal_plans", {
        p_days: planDaysPayload,
      });

      if (saveError) {
        console.error("[V2PlanService] Error saving weekly meal plan:", saveError);
        throw new Error(
          `Failed to persist meal plan. Your previous plan was left untouched: ${saveError.message}`
        );
      }

      // 9b. Also persist into planned_meals / planned_meal_items if available in schema
      try {
        const { error: testErr } = await supabase.from("planned_meals").select("id").limit(1);
        if (!testErr) {
          // Table exists! Insert/replace rows
          const mealRows = rawResult.plannedMeals.map((m) => ({
            id: m.id,
            meal_plan_id: m.mealPlanId,
            user_id: userId,
            local_date: m.localDate,
            meal_slot: m.mealSlot,
            meal_sequence: m.mealSequence,
            scheduled_time: m.scheduledTime,
            source_type: m.sourceType,
            recipe_version_id: m.recipeVersionId,
            recipe_variant_id: m.recipeVariantId,
            meal_template_id: m.mealTemplateId,
            calories_snapshot: m.caloriesSnapshot,
            protein_snapshot: m.proteinSnapshot,
            carbs_snapshot: m.carbsSnapshot,
            fat_snapshot: m.fatSnapshot,
            cost_snapshot: m.costSnapshot,
            status: m.status,
            planner_version: V2PlanService.PLANNER_VERSION,
            timezone_snapshot: tz,
          }));

          const itemRows = rawResult.plannedMeals.flatMap((m) =>
            (m.items || []).map((it) => ({
              id: it.id,
              planned_meal_id: m.id,
              user_id: userId,
              food_id: it.foodId,
              food_name: it.foodName,
              quantity: it.quantity,
              portion_type: it.portionType,
              unit: it.unit,
              ingredient_role: it.ingredientRole,
              is_provided: it.isProvided,
              calories_snapshot: it.caloriesSnapshot,
              protein_snapshot: it.proteinSnapshot,
              carbs_snapshot: it.carbsSnapshot,
              fat_snapshot: it.fatSnapshot,
              cost_snapshot: it.costSnapshot,
            }))
          );

          // Delete existing for these dates
          await supabase
            .from("planned_meals")
            .delete()
            .eq("user_id", userId)
            .in("local_date", distinctDates);

          if (mealRows.length > 0) {
            await supabase.from("planned_meals").insert(mealRows);
          }
          if (itemRows.length > 0) {
            await supabase.from("planned_meal_items").insert(itemRows);
          }
        }
      } catch (pmErr: any) {
        // Non-blocking schema addition notice
        console.warn("[V2PlanService] planned_meals table write notice:", pmErr?.message);
      }

      // 10. Synchronize V2 Smart Grocery List
      try {
        await this.generateV2GroceryList(userId, localDate, 7);
      } catch (gErr: any) {
        console.warn("[V2PlanService] Non-blocking grocery sync notice:", gErr?.message);
      }

      // 10b. Synchronize Day 1 meals to fitness_os_workout_plans so Home Dashboard updates immediately
      try {
        const { data: activeWorkoutPlan } = await supabase
          .from("fitness_os_workout_plans")
          .select("id, plan_data")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (activeWorkoutPlan?.plan_data) {
          const day1Meals = mealsByDate.get(distinctDates[0]) || [];
          const formattedDay1Meals = day1Meals.map((m, idx) => {
            let mName = `${m.mealSlot.charAt(0).toUpperCase() + m.mealSlot.slice(1)} Meal`;
            if (m.sourceType === "RECIPE" && m.recipeVersionId) {
              const rv = versionById.get(m.recipeVersionId);
              if (rv) mName = rv.name;
            }
            return {
              meal_name: mName,
              meal_type: m.mealSlot,
              time_of_day:
                idx === 0 ? "Morning" : idx === 1 ? "Midday" : idx === 2 ? "Evening" : "Night",
              items: (m.items || []).map(
                (it) => `${it.quantity > 1 ? `${it.quantity}x ` : ""}${it.foodName}`
              ),
              total_calories: m.caloriesSnapshot,
              protein_grams: m.proteinSnapshot,
              carbs_grams: m.carbsSnapshot,
              fat_grams: m.fatSnapshot,
              prep_instructions: "Prepare the listed foods using your standard portions.",
              meal_plan_items: m.items,
            };
          });

          const updatedPlanData = {
            ...activeWorkoutPlan.plan_data,
            nutrition: {
              ...(activeWorkoutPlan.plan_data.nutrition || {}),
              meals: formattedDay1Meals,
            },
          };

          await supabase
            .from("fitness_os_workout_plans")
            .update({ plan_data: updatedPlanData })
            .eq("id", activeWorkoutPlan.id);
        }
      } catch (dashErr: any) {
        console.warn("[V2PlanService] Non-blocking dashboard sync notice:", dashErr?.message);
      }

      // 11. Invalidate caches
      NutritionService.invalidateServerCache(userId);
      invalidateNutritionServerCache(userId);

      return {
        ...rawResult,
        message: "7-Day Precision Nutrition Plan generated and verified successfully.",
      };
    };

    const promise = execGeneration();
    v2PlanGenInFlight.set(lockKey, promise);
    try {
      const res = await promise;
      return res;
    } finally {
      v2PlanGenInFlight.delete(lockKey);
    }
  }

  /**
   * Generates 3 to 6 high-quality, constraint-satisfying meal swap options.
   * Excludes the current meal recipe and guarantees slot macro alignment.
   */
  static async getV2SwapOptions(
    userId: string,
    dateStr: string,
    mealSlot: MealSlotType
  ): Promise<V2SwapCandidate[]> {
    const supabase = createAdminClient();

    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) throw new Error("User profile not found.");

    const tz = await NutritionService.getUserTimezone(userId);
    const v2Profile = this.mapProfileToV2Context(profile, null, tz);
    const dailyTargets = calculateDailyTargets(v2Profile);
    const slotAllocations = calculateSlotAllocations(dailyTargets, v2Profile.mealsPerDay);
    const targetSlot = slotAllocations.find((a) => a.slot === mealSlot) || slotAllocations[0];

    // 2. Fetch current planned meal to exclude its recipe
    const { data: todayPlan } = await supabase
      .from("meal_plans")
      .select("id, meal_type, meal_plan_items(*, foods(*))")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .maybeSingle();

    const currentSlotPrefix = `${mealSlot}::`;
    const currentItems = (todayPlan?.meal_plan_items || []).filter(
      (it: any) =>
        typeof it.serving_size === "string" && it.serving_size.startsWith(currentSlotPrefix)
    );
    const currentFoodIds = new Set(currentItems.map((it: any) => it.food_id));

    // 3. Load catalog & filter candidates
    const catalog = loadNutritionCatalog();
    const foodAllergensLookup = (foodId: string) => {
      const f: any = catalog.foodById.get(foodId);
      return f?.allergens || [];
    };
    const foodCostLookup = (foodId: string) => catalog.foodById.get(foodId)?.estimated_cost || 15;
    const foodServingWeightLookup = (foodId: string) =>
      catalog.foodById.get(foodId)?.serving_weight_g || 100;

    const rawCandidates = generateMealCandidates(
      v2Profile,
      mealSlot,
      targetSlot.targetCalories,
      targetSlot.targetProtein,
      catalog.recipes,
      foodAllergensLookup,
      foodCostLookup,
      foodServingWeightLookup
    );

    // Filter out recipes that match current meal's food items
    const filteredCandidates = rawCandidates.filter((c) => {
      const variantIngs = c.selectedVariant
        ? c.catalogItem.recipeVersion ? c.catalogItem.recipe.slug : ""
        : "";
      return !currentItems.some((it: any) =>
        it.serving_size?.toLowerCase().includes(c.catalogItem.recipe.slug.toLowerCase())
      );
    });

    const pool = filteredCandidates.length >= 3 ? filteredCandidates : rawCandidates;
    // Sort by protein match and variety score
    pool.sort((a, b) => b.score - a.score);

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
        incrementStep: pr.increment_step,
      };
    };

    const topCandidates = pool.slice(0, 6);
    const results: V2SwapCandidate[] = [];

    for (const cand of topCandidates) {
      const rv = cand.catalogItem.recipeVersion;
      const variant = cand.selectedVariant;
      const img = cand.catalogItem.image;

      // Optimize portions for this candidate to target slot macros
      const optResult = optimizeMealPortions(
        targetSlot.targetCalories,
        targetSlot.targetProtein,
        variant,
        cand.catalogItem.ingredients,
        catalog.foodById,
        portionRulesLookup
      );

      const items = optResult.optimizedIngredients.map((ing) => {
        const food = catalog.foodById.get(ing.foodId);
        const portionType = ing.portionType || "CONTINUOUS";
        const unit = ing.unit || "g";
        const rawServing =
          portionType === "DISCRETE" ? `${ing.amount} ${unit}` : `${ing.amount}${unit}`;

        return {
          food_id: ing.foodId,
          name: ing.foodName || food?.name || "Whole Food",
          quantity: ing.amount,
          portion_type: portionType,
          unit,
          serving_size: rawServing,
          calories: ing.caloriesSnapshot,
          protein: ing.proteinSnapshot,
          carbs: ing.carbsSnapshot,
          fat: ing.fatSnapshot,
          estimated_cost: ing.costSnapshot,
          is_provided: false,
        };
      });

      results.push({
        id: `v2-swap-${cand.catalogItem.recipe.slug}-${variant.variantTier}`,
        name: rv.name,
        description: rv.description || `Optimized for ${optResult.totalCalories} kcal`,
        calories: optResult.totalCalories,
        protein: optResult.totalProtein,
        carbs: optResult.totalCarbs,
        fat: optResult.totalFat,
        estimated_cost: optResult.totalCost,
        prep_instructions: rv.prepInstructions || "Prepare using recommended portions.",
        image_url: img?.url,
        items,
      });
    }

    return results;
  }

  /**
   * Executes atomic meal swap transaction.
   * Protects LOGGED meals from being mutated.
   */
  static async executeV2MealSwap(
    userId: string,
    dateStr: string,
    mealSlot: MealSlotType,
    chosenOption: V2SwapCandidate
  ): Promise<any> {
    const supabase = createAdminClient();

    // 1. Check if user already logged foods for this slot on this date
    const tz = await NutritionService.getUserTimezone(userId);
    const { start, end } = await NutritionService.getLocalDateBoundaries(userId, tz, dateStr);

    const { data: existingLogs } = await supabase
      .from("food_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("meal_type", mealSlot)
      .gte("logged_at", start)
      .lte("logged_at", end);

    if (existingLogs && existingLogs.length > 0) {
      throw new Error("CANNOT_SWAP_LOGGED_MEAL: This meal has already been logged. Past and logged meals cannot be altered.");
    }

    // 2. Fetch existing daily plan for dateStr
    const { data: existingPlan, error: planErr } = await supabase
      .from("meal_plans")
      .select("*, meal_plan_items(*)")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .maybeSingle();

    if (planErr) throw planErr;
    if (!existingPlan) {
      throw new Error("No active meal plan found for this date to swap.");
    }

    // 3. Remove old items for this specific mealSlot
    const slotPrefix = `${mealSlot}::`;
    const oldSlotItems = (existingPlan.meal_plan_items || []).filter(
      (it: any) =>
        typeof it.serving_size === "string" && it.serving_size.startsWith(slotPrefix)
    );

    if (oldSlotItems.length > 0) {
      const deleteIds = oldSlotItems.map((it: any) => it.id).filter(Boolean);
      if (deleteIds.length > 0) {
        const { error: delErr } = await supabase
          .from("meal_plan_items")
          .delete()
          .in("id", deleteIds);
        if (delErr) throw delErr;
      }
    }

    // 4. Insert new candidate items
    const newItemsPayload = chosenOption.items.map((it) => ({
      meal_plan_id: existingPlan.id,
      food_id: it.food_id,
      quantity: it.portion_type === "DISCRETE" ? it.quantity : 1,
      serving_size: `${mealSlot}::${chosenOption.name}::${it.serving_size}`,
    }));

    const { error: insertErr } = await supabase
      .from("meal_plan_items")
      .insert(newItemsPayload);

    if (insertErr) throw insertErr;

    // 5. Update day macro totals on meal_plans container
    const oldSlotCal = oldSlotItems.reduce((s: number, it: any) => s + (Number(it.calories) || 0), 0);
    const oldSlotPro = oldSlotItems.reduce((s: number, it: any) => s + (Number(it.protein) || 0), 0);
    const oldSlotCarbs = oldSlotItems.reduce((s: number, it: any) => s + (Number(it.carbs) || 0), 0);
    const oldSlotFat = oldSlotItems.reduce((s: number, it: any) => s + (Number(it.fat) || 0), 0);
    const oldSlotCost = oldSlotItems.reduce((s: number, it: any) => s + (Number(it.estimated_cost) || 0), 0);

    const updatedCal = Math.max(0, existingPlan.calories - oldSlotCal + chosenOption.calories);
    const updatedPro = Math.max(0, Number((existingPlan.protein - oldSlotPro + chosenOption.protein).toFixed(1)));
    const updatedCarbs = Math.max(0, Number((existingPlan.carbs - oldSlotCarbs + chosenOption.carbs).toFixed(1)));
    const updatedFat = Math.max(0, Number((existingPlan.fat - oldSlotFat + chosenOption.fat).toFixed(1)));
    const updatedCost = Math.max(0, existingPlan.estimated_cost - oldSlotCost + chosenOption.estimated_cost);

    await supabase
      .from("meal_plans")
      .update({
        calories: updatedCal,
        protein: updatedPro,
        carbs: updatedCarbs,
        fat: updatedFat,
        estimated_cost: updatedCost,
      })
      .eq("id", existingPlan.id);

    // 6. Invalidate server cache & sync grocery list
    NutritionService.invalidateServerCache(userId);
    invalidateNutritionServerCache(userId);

    this.generateV2GroceryList(userId).catch((err) => {
      console.warn("[V2PlanService] Non-blocking grocery resync warning:", err?.message);
    });

    return {
      success: true,
      message: `Swapped to ${chosenOption.name} safely.`,
      updatedMeal: {
        meal_type: mealSlot,
        name: chosenOption.name,
        calories: chosenOption.calories,
        protein: chosenOption.protein,
        carbs: chosenOption.carbs,
        fat: chosenOption.fat,
        estimated_cost: chosenOption.estimated_cost,
      },
    };
  }

  /**
   * Aggregates 7-day grocery list respecting pantry items and mess provisions.
   */
  static async generateV2GroceryList(
    userId: string,
    startDateStr?: string,
    numDays = 7
  ): Promise<V2GroceryListResult> {
    const supabase = createAdminClient();

    // 1. Fetch user profile for pantry & mess settings
    const { data: profile } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const tz = await NutritionService.getUserTimezone(userId);
    const localDate = startDateStr || (await NutritionService.getLocalDateString(userId, tz));

    // 2. Fetch meal plans for the date range
    const start = new Date(`${localDate}T00:00:00.000Z`);
    const dateRange: string[] = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      dateRange.push(d.toISOString().split("T")[0]);
    }

    const { data: plans } = await supabase
      .from("meal_plans")
      .select("*, meal_plan_items(*, foods(*))")
      .eq("user_id", userId)
      .in("date", dateRange);

    const pantryFoods = new Set(
      (Array.isArray(profile?.available_foods) ? profile.available_foods : [])
        .map((s: string) => s.toLowerCase().trim())
        .filter(Boolean)
    );

    const isMessLiving =
      profile?.food_environment === "Hostel" ||
      profile?.food_environment === "PG" ||
      profile?.food_environment === "Office/Canteen";

    // 3. Aggregate items across 7 days
    const itemMap = new Map<
      string,
      {
        name: string;
        food: any;
        totalGrams: number;
        totalUnits: number;
        unit: string;
        isProvided: boolean;
        isPantry: boolean;
        usedInMeals: Set<string>;
        estimatedPrice: number;
      }
    >();

    for (const plan of plans || []) {
      for (const item of plan.meal_plan_items || []) {
        const food = item.foods;
        if (!food) continue;

        const foodName = food.name;
        const lowerName = foodName.toLowerCase();
        const key = lowerName;

        const isCoreMessItem = isMessLiving && isStapleCoreFood(foodName, profile?.food_environment);
        const isProvided = isCoreMessItem;
        const isPantry = Array.from(pantryFoods).some((p) => lowerName.includes(p) || p.includes(lowerName));

        // Parse quantity
        let q = Number(item.quantity) || 1;
        const sSize = String(item.serving_size || "");
        let slotName = "Meal";
        if (sSize.includes("::")) {
          slotName = sSize.split("::")[0];
        }

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: foodName,
            food,
            totalGrams: 0,
            totalUnits: 0,
            unit: food.serving_unit || "piece",
            isProvided,
            isPantry,
            usedInMeals: new Set(),
            estimatedPrice: 0,
          });
        }

        const entry = itemMap.get(key)!;
        entry.usedInMeals.add(slotName);

        const sw = Number(food.serving_weight_g) || 100;
        entry.totalGrams += sw * q;
        entry.totalUnits += q;
      }
    }

    // 4. Categorize items into structured output groups
    const needToBuyByCategory = new Map<string, any[]>();
    const alreadyHave: Array<{ name: string; note: string }> = [];
    const providedByMess: Array<{ name: string; note: string }> = [];
    let totalSpendInr = 0;

    const legacyDbGroceryRows: any[] = [];

    for (const entry of itemMap.values()) {
      const food = entry.food;
      const lower = entry.name.toLowerCase();

      // Check mess provision
      if (entry.isProvided) {
        providedByMess.push({
          name: entry.name,
          note: `Provided ₹0 by ${profile?.food_environment || "Hostel"} mess`,
        });
        continue;
      }

      // Check pantry availability
      if (entry.isPantry) {
        alreadyHave.push({
          name: entry.name,
          note: `Available in personal pantry / kitchen`,
        });
        continue;
      }

      // Normalization of purchase units
      let retailUnit = "pack";
      let weeklyQty = Math.ceil(entry.totalUnits);
      let itemPrice = 0;

      if (lower.includes("egg")) {
        retailUnit = "eggs";
        weeklyQty = Math.max(6, Math.ceil(entry.totalUnits / 6) * 6);
        itemPrice = weeklyQty * 7;
      } else if (lower.includes("paneer") || lower.includes("tofu")) {
        retailUnit = "g";
        weeklyQty = Math.max(200, Math.ceil(entry.totalGrams / 100) * 100);
        itemPrice = Math.round((weeklyQty / 100) * 35);
      } else if (lower.includes("curd") || lower.includes("dahi")) {
        retailUnit = "g";
        weeklyQty = Math.max(400, Math.ceil(entry.totalGrams / 200) * 200);
        itemPrice = Math.round((weeklyQty / 100) * 10);
      } else if (lower.includes("milk")) {
        retailUnit = "liters";
        weeklyQty = Math.max(1, Math.round((entry.totalGrams / 1000) * 2) / 2);
        itemPrice = Math.round(weeklyQty * 65);
      } else if (lower.includes("oats") || lower.includes("chana") || lower.includes("rajma") || lower.includes("dal")) {
        retailUnit = "g";
        weeklyQty = Math.max(250, Math.ceil(entry.totalGrams / 250) * 250);
        itemPrice = Math.round((weeklyQty / 100) * 15);
      } else if (lower.includes("peanut") || lower.includes("almond")) {
        retailUnit = "g";
        weeklyQty = Math.max(100, Math.ceil(entry.totalGrams / 100) * 100);
        itemPrice = Math.round((weeklyQty / 100) * 25);
      } else if (lower.includes("banana") || lower.includes("apple")) {
        retailUnit = "pieces";
        weeklyQty = Math.max(3, Math.ceil(entry.totalUnits));
        itemPrice = weeklyQty * (lower.includes("banana") ? 6 : 25);
      } else if (lower.includes("chicken")) {
        retailUnit = "kg";
        weeklyQty = Math.max(0.5, Math.round((entry.totalGrams / 1000) * 2) / 2);
        itemPrice = Math.round(weeklyQty * 280);
      } else {
        retailUnit = "pack";
        weeklyQty = Math.max(1, Math.ceil(entry.totalUnits));
        itemPrice = weeklyQty * (food.estimated_cost || 20);
      }

      totalSpendInr += itemPrice;

      const cat = food.category || "General";
      if (!needToBuyByCategory.has(cat)) {
        needToBuyByCategory.set(cat, []);
      }

      const itemDetail = {
        name: entry.name,
        weekly_quantity: weeklyQty,
        monthly_quantity: weeklyQty * 4,
        unit: retailUnit,
        estimated_cost_inr: itemPrice,
        is_provided: false,
        is_pantry: false,
        used_in_meals: Array.from(entry.usedInMeals),
        serving_info: food.serving_size || "1 serving",
      };

      needToBuyByCategory.get(cat)!.push(itemDetail);

      legacyDbGroceryRows.push({
        name: entry.name,
        monthly_quantity: weeklyQty * 4,
        unit: retailUnit,
        estimated_price: itemPrice * 4,
        category: cat,
        is_optional: false,
        reason: `7-Day Nutrition Plan ingredient — used in ${Array.from(entry.usedInMeals).join(", ")}`,
        purchased: false,
        food_serving_size: food.serving_size,
        protein_grams_per_serving: food.protein,
        calories_per_serving: food.calories,
        used_in_meals: Array.from(entry.usedInMeals),
      });
    }

    // 5. Sync to fitness_grocery_items and active workout plan for existing /grocery page
    try {
      const { data: activePlan } = await supabase
        .from("fitness_os_workout_plans")
        .select("id, plan_data")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activePlan?.id) {
        const updatedPlanData = {
          ...(activePlan.plan_data || {}),
          nutrition: {
            ...((activePlan.plan_data || {}).nutrition || {}),
            grocery_list: legacyDbGroceryRows,
          },
        };

        await supabase
          .from("fitness_os_workout_plans")
          .update({ plan_data: updatedPlanData })
          .eq("id", activePlan.id);

        await supabase
          .from("fitness_grocery_items")
          .delete()
          .eq("user_id", userId)
          .eq("plan_id", activePlan.id);

        if (legacyDbGroceryRows.length > 0) {
          await supabase.from("fitness_grocery_items").insert(
            legacyDbGroceryRows.map((it) => ({
              user_id: userId,
              plan_id: activePlan.id,
              name: it.name,
              monthly_quantity: it.monthly_quantity,
              unit: it.unit,
              estimated_price: it.estimated_price,
              category: it.category,
              is_optional: it.is_optional,
              reason: it.reason,
              purchased: false,
            }))
          );
        }
      }
    } catch (syncErr: any) {
      console.warn("[V2PlanService] Non-blocking grocery persistence notice:", syncErr?.message);
    }

    const needToBuyResult: V2GroceryCategoryGroup[] = [];
    for (const [category, items] of needToBuyByCategory.entries()) {
      needToBuyResult.push({ category, items });
    }

    return {
      startDate: localDate,
      endDate: dateRange[dateRange.length - 1],
      totalWeeklySpendInr: totalSpendInr,
      needToBuy: needToBuyResult,
      alreadyHave,
      providedByMess,
    };
  }

  /**
   * Logs a planned meal into food_logs with exact frozen snapshots and updates day summary.
   */
  static async logV2PlannedMeal(
    userId: string,
    dateStr: string,
    mealSlot: MealSlotType
  ): Promise<any> {
    const supabase = createAdminClient();

    // 1. Fetch planned meal items for this slot
    const { data: plan } = await supabase
      .from("meal_plans")
      .select("id, meal_plan_items(*, foods(*))")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .maybeSingle();

    if (!plan) throw new Error("No planned meal found for this date.");

    const slotPrefix = `${mealSlot}::`;
    const slotItems = (plan.meal_plan_items || []).filter(
      (it: any) =>
        typeof it.serving_size === "string" && it.serving_size.startsWith(slotPrefix)
    );

    if (slotItems.length === 0) {
      throw new Error(`No planned items found for slot ${mealSlot}.`);
    }

    // 2. Prepare items for batch logging
    const logItems = slotItems.map((it: any) => ({
      food_id: it.food_id,
      meal_type: mealSlot,
      quantity: Number(it.quantity) || 1,
      custom_food: it.foods
        ? {
            name: it.foods.name,
            serving_size: it.serving_size.split("::")[2] || it.foods.serving_size,
            calories: it.foods.calories,
            protein: it.foods.protein,
            carbs: it.foods.carbs,
            fat: it.foods.fat,
            estimated_cost: it.foods.estimated_cost,
          }
        : undefined,
    }));

    // 3. Batch insert using NutritionService.logMultipleFoods
    const inserted = await NutritionService.logMultipleFoods(userId, logItems);

    // 4. Mark planned meal as LOGGED if planned_meals table is active
    try {
      await supabase
        .from("planned_meals")
        .update({ status: "LOGGED" })
        .eq("user_id", userId)
        .eq("local_date", dateStr)
        .eq("meal_slot", mealSlot);
    } catch {}

    // 5. Invalidate server cache & return adaptive day state
    NutritionService.invalidateServerCache(userId);
    invalidateNutritionServerCache(userId);

    const adaptiveDay = await this.getV2AdaptiveRemainingDay(userId, dateStr);

    return {
      success: true,
      loggedItems: inserted,
      adaptiveDay,
    };
  }

  /**
   * Recalculates adaptive remaining daily macros without mutating past or logged meals.
   */
  static async getV2AdaptiveRemainingDay(
    userId: string,
    dateStr: string
  ): Promise<{
    date: string;
    dailyTargets: MacroTargets;
    consumedMacros: { calories: number; protein: number; carbs: number; fat: number };
    remainingMacros: { calories: number; protein: number; carbs: number; fat: number };
    loggedMealSlots: string[];
    remainingMealSlots: string[];
  }> {
    const supabase = createAdminClient();

    // 1. Fetch user targets
    const tz = await NutritionService.getUserTimezone(userId);
    const { start, end } = await NutritionService.getLocalDateBoundaries(userId, tz, dateStr);

    const targets = await NutritionService.getEffectiveTargets(userId, dateStr, tz);
    if (!targets) throw new Error("TARGET_NOT_FOUND");

    // 2. Fetch logged foods
    const { data: foodLogs } = await supabase
      .from("food_logs")
      .select("calories, protein, carbs, fat, meal_type")
      .eq("user_id", userId)
      .gte("logged_at", start)
      .lte("logged_at", end);

    const consumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const loggedSlots = new Set<string>();

    for (const log of foodLogs || []) {
      consumed.calories += Number(log.calories) || 0;
      consumed.protein += Number(log.protein) || 0;
      consumed.carbs += Number(log.carbs) || 0;
      consumed.fat += Number(log.fat) || 0;
      if (log.meal_type) loggedSlots.add(log.meal_type);
    }

    // 3. Fetch planned meal slots for the date
    const { data: plan } = await supabase
      .from("meal_plans")
      .select("*, meal_plan_items(serving_size)")
      .eq("user_id", userId)
      .eq("date", dateStr)
      .maybeSingle();

    const allPlannedSlots = new Set<string>();
    for (const it of plan?.meal_plan_items || []) {
      if (typeof it.serving_size === "string" && it.serving_size.includes("::")) {
        allPlannedSlots.add(it.serving_size.split("::")[0]);
      }
    }

    if (allPlannedSlots.size === 0) {
      allPlannedSlots.add("breakfast").add("lunch").add("snack").add("dinner");
    }

    const remainingSlots = Array.from(allPlannedSlots).filter((s) => !loggedSlots.has(s));

    const remaining = {
      calories: Math.max(0, targets.calories - consumed.calories),
      protein: Math.max(0, Number((targets.protein - consumed.protein).toFixed(1))),
      carbs: Math.max(0, Number((targets.carbs - consumed.carbs).toFixed(1))),
      fat: Math.max(0, Number((targets.fat - consumed.fat).toFixed(1))),
    };

    return {
      date: dateStr,
      dailyTargets: {
        calories: targets.calories,
        protein: targets.protein,
        carbs: targets.carbs,
        fat: targets.fat,
      },
      consumedMacros: {
        calories: Math.round(consumed.calories),
        protein: Number(consumed.protein.toFixed(1)),
        carbs: Number(consumed.carbs.toFixed(1)),
        fat: Number(consumed.fat.toFixed(1)),
      },
      remainingMacros: remaining,
      loggedMealSlots: Array.from(loggedSlots),
      remainingMealSlots: remainingSlots,
    };
  }
}
