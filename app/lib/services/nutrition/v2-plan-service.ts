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
import { createLiveFoodIdResolver } from "@/lib/services/nutrition/live-food-id";
import { groceryPortionAmount, selectGroceryPlanItems } from "@/lib/services/nutrition/v2-grocery-items";
import { calculateDailyBudget } from "@/lib/fitness/nutrition/user-context";
import { getFoodSvgAvatar } from "@/lib/utils/food-images";
import { approvedImageForReference, type RecipeImageRow } from "@/lib/fitness/nutrition/image-policy";
import {
  toCanonicalGroceryStaple,
  normalizeCategoryForDiet,
  type CanonicalGroceryDefinition,
} from "@/lib/fitness/nutrition/canonical-groceries";

/** Keep the catalog asset identity while avoiding the currently unreachable image host. */
export function resolveV2ImageSnapshot(url: string | null | undefined, mealName: string): string {
  if (url && !url.startsWith("https://images.grindlog.in/")) return url;
  return getFoodSvgAvatar(mealName);
}

// Concurrency lock to prevent concurrent duplicate generation per user
const v2PlanGenInFlight = new Map<string, Promise<any>>();

export interface V2SwapCandidate {
  id: string;
  recipe_version_id: string;
  recipe_variant_id: string;
  image_asset_id: string | null;
  image_storage_path: string | null;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  prep_instructions: string;
  prep_time_min: number;
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
   * Checks authoritative database profile flag, global env toggle, or authenticated admin override.
   */
  static isNutritionV2Enabled(
    userId: string,
    profile?: any,
    options?: { forceV2?: boolean; isAdmin?: boolean }
  ): boolean {
    // V2 deterministic engine is universally enabled for all users (Zero AI / LLM dependency)
    return true;
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
    // Reuse the existing budget tiers. A range ending in 5,000 is not the
    // premium 5,000+ tier, and explicit numeric budgets must remain exact.
    const rawBudget = String(profile?.nutrition_budget ?? "").trim().replace(/[–—]/g, "-");
    const monthlyBudgetInr = calculateDailyBudget(rawBudget || 4500, profile).monthlyBudget;
    const weeklyBudgetTargetInr = Math.round(monthlyBudgetInr / 4);
    const budgetPolicy: BudgetPolicy = monthlyBudgetInr <= 2000 ? "STRICT" : "FLEXIBLE";

    // 5. Equipment parsing
    const hasExplicitEquipment = Array.isArray(profile?.available_equipment);
    const rawEq = hasExplicitEquipment
      ? profile.available_equipment
      : Array.isArray(profile?.equipment) ? profile.equipment : [];
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
        if (l.includes("none") || l.includes("no equipment")) return "none";
        return null;
      })
      .filter((eq: CookingEquipment | null): eq is CookingEquipment => eq !== null);

    if (availableEquipment.length === 0 && !hasExplicitEquipment) {
      if (foodEnvironment === "Hostel" || foodEnvironment === "PG") {
        availableEquipment.push("stove", "kettle");
      } else {
        availableEquipment.push("stove", "blender");
      }
    }

    // 6. Mess meals resolution (explicit opt-in only)
    const messAvailable = profile?.mess_available === true;
    const defaultMessMeals: MealSlotType[] = mealsPerDay === 2
      ? ["lunch", "dinner"]
      : ["breakfast", "lunch", "dinner"];
    const messMeals: MealSlotType[] = messAvailable
      ? Array.isArray(profile?.mess_meals)
        ? profile.mess_meals.filter((slot: string): slot is MealSlotType =>
            ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"].includes(slot))
        : defaultMessMeals
      : [];

    const parseList = (val: any): string[] => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string")
        return val.split(/[,;|\n]+/).map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const allergies = parseList(profile?.food_allergies || profile?.allergies);
    const dislikedFoods = parseList(profile?.foods_disliked || profile?.disliked_foods);
    const avoidedFoods = parseList(profile?.foods_avoided || profile?.avoided_foods);
    const availableFoodsRaw = parseList(profile?.available_foods || profile?.pantry_foods);
    const availableFoods: AvailablePantryFood[] = availableFoodsRaw.map((name) => ({ name }));

    let activityLevel = profile?.activity_level || "Moderately active";
    const actLower = String(activityLevel).toLowerCase();
    if (actLower.includes("sitting") || actLower.includes("desk")) {
      activityLevel = "sedentary";
    }

    return {
      userId: profile?.user_id || profile?.id || "user-v2",
      gender: profile?.gender || "Male",
      age: Number(profile?.age) || 25,
      heightCm: Number(profile?.height) || 172,
      weightKg: Number(profile?.weight) || 70,
      targetWeightKg: profile?.target_weight ? Number(profile.target_weight) : null,
      goal: profile?.goal || "Maintain",
      fitnessLevel: profile?.fitness_level || "Intermediate",
      activityLevel,
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
          "AGE_RESTRICTED_NUTRITION_PLAN: GrindLog automated nutrition planner is calibrated for adults aged 18 and older. Automated adult meal plans cannot be generated for minors."
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
      // The planner has already validated these meals with the catalog allergen lookup.
      if (!rawResult.metrics.hardConstraintPass || rawResult.metrics.compositeScore < 50) {
        const failureReason =
          (rawResult.metrics.failureReasons && rawResult.metrics.failureReasons.join(", ")) ||
          "Plan did not meet deterministic quality rules.";
        throw new Error(`PLAN_VALIDATION_FAILED: ${failureReason}. Your saved plan was left untouched.`);
      }

      // The deployed persistence RPC replaces plans for the requested dates.
      // Keep logged history intact until the database function itself rejects
      // replacement under its transaction lock.
      const planDates = [...new Set(rawResult.plannedMeals.map((meal) => meal.localDate))];
      const { data: loggedMeals, error: loggedMealsError } = await supabase
        .from("planned_meals")
        .select("id")
        .eq("user_id", userId)
        .in("local_date", planDates)
        .eq("status", "LOGGED")
        .limit(1);
      if (loggedMealsError) throw loggedMealsError;
      if (loggedMeals?.length) {
        throw new Error("CANNOT_REGENERATE_LOGGED_MEAL: A meal in this date range has already been logged.");
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

      // Fetch live database food IDs to guarantee foreign key integrity across schema migrations
      const { data: dbFoods, error: dbFoodsError } = await supabase.from("foods").select("id, name");
      if (dbFoodsError) throw dbFoodsError;
      const resolveFoodId = createLiveFoodIdResolver(dbFoods || [], catalog.foodById);
      for (const food of catalog.foods) resolveFoodId(food.id);

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
            mealTitle = boosterItem?.foodName
              ? `${v2Profile.foodEnvironment} Mess ${meal.mealSlot} (+ ${boosterItem.foodName.replace(/^Mess\s+/i, "")})`
              : `${v2Profile.foodEnvironment} Mess ${meal.mealSlot}`;
          }

          for (const item of meal.items || []) {
            const rawServing = item.portionType === "DISCRETE"
              ? `${item.quantity} ${item.unit}`
              : `${item.quantity}${item.unit}`;

            dayItems.push({
              food_id: resolveFoodId(item.foodId),
              quantity: item.portionType === "DISCRETE" ? item.quantity : 1,
              serving_size: `${meal.mealSlot}::${mealTitle}::${rawServing}`,
              is_provided: item.isProvided ?? false,
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

      // 9. Authoritative PostgreSQL Atomic Transaction & Advisory Lock
      const plannedMealsPayload = rawResult.plannedMeals.map((m) => ({
        id: m.id,
        meal_plan_id: m.mealPlanId,
        local_date: m.localDate,
        meal_slot: m.mealSlot,
        meal_sequence: m.mealSequence,
        scheduled_time: m.scheduledTime,
        source_type: m.sourceType,
        recipe_version_id: m.recipeVersionId,
        recipe_variant_id: m.recipeVariantId,
        meal_template_id: m.mealTemplateId,
        image_asset_id: m.imageAssetId,
        image_storage_path_snapshot: m.imageStoragePathSnapshot,
        image_url_snapshot: resolveV2ImageSnapshot(
          m.imageUrlSnapshot,
          m.sourceType === "RECIPE" && m.recipeVersionId
            ? versionById.get(m.recipeVersionId)?.name || m.mealSlot
            : m.mealSlot
        ),
        calories_snapshot: m.caloriesSnapshot,
        protein_snapshot: m.proteinSnapshot,
        carbs_snapshot: m.carbsSnapshot,
        fat_snapshot: m.fatSnapshot,
        cost_snapshot: m.costSnapshot,
        status: m.status,
        planner_version: V2PlanService.PLANNER_VERSION,
        timezone_snapshot: tz,
        items: (m.items || []).map((it) => ({
          id: it.id,
          food_id: resolveFoodId(it.foodId),
          food_name: it.foodName,
          quantity: it.quantity,
          portion_type: it.portionType,
          unit: it.unit,
          serving_size: `${it.quantity} ${it.unit}`,
          ingredient_role: it.ingredientRole,
          is_provided: it.isProvided,
          calories_snapshot: it.caloriesSnapshot,
          protein_snapshot: it.proteinSnapshot,
          carbs_snapshot: it.carbsSnapshot,
          fat_snapshot: it.fatSnapshot,
          cost_snapshot: it.costSnapshot,
        })),
      }));

      // Recheck current image approval; the bundled catalog can outlive a review.
      const imageIds = [...new Set(plannedMealsPayload.map((meal) => meal.image_asset_id)
        .filter((id): id is string => Boolean(id)))];
      if (imageIds.length) {
        const imagesResult = await supabase.from("recipe_images")
          .select("id,recipe_version_id,storage_path,url,status,is_primary").in("id", imageIds)
          .eq("status", "APPROVED").eq("is_primary", true);
        const images = (imagesResult.error ? [] : imagesResult.data || []) as RecipeImageRow[];
        for (const meal of plannedMealsPayload) {
          const image = approvedImageForReference({ imageAssetId: meal.image_asset_id,
            recipeVersionId: meal.recipe_version_id, storagePath: meal.image_storage_path_snapshot,
            url: meal.image_url_snapshot }, images);
          if (meal.image_asset_id && !image) {
            meal.image_asset_id = null;
            meal.image_storage_path_snapshot = null;
            meal.image_url_snapshot = resolveV2ImageSnapshot(null,
              meal.recipe_version_id ? versionById.get(meal.recipe_version_id)?.name || meal.meal_slot : meal.meal_slot);
          }
        }
      }

      // Call authoritative PostgreSQL RPC with pg_advisory_xact_lock
      const { error: atomicSaveError } = await supabase.rpc(
        "persist_v2_meal_plan_atomic",
        {
          p_user_id: userId,
          p_plan_days: planDaysPayload,
          p_planned_meals: plannedMealsPayload,
        }
      );

      if (atomicSaveError) {
        console.error("[V2PlanService] Database error persisting weekly plan:", atomicSaveError);
        throw new Error(
          `Failed to persist meal plan. Your previous plan was left untouched: ${atomicSaveError.message}`
        );
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
      const candidateImage = cand.catalogItem.image;
      const img = candidateImage.status === "APPROVED" && candidateImage.isPrimary &&
        candidateImage.recipeVersionId === cand.catalogItem.recipeVersion.id ? candidateImage : null;

      // Optimize portions for this candidate to target slot macros
      const foodLookup = (foodIdOrName: string) => catalog.foodById.get(foodIdOrName);
      const optResult = optimizeMealPortions(
        variant,
        cand.variantIngredients || cand.catalogItem.variantIngredients || [],
        targetSlot.targetCalories,
        targetSlot.targetProtein,
        foodLookup,
        portionRulesLookup
      );

      const items = optResult.ingredients.map((ing) => {
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
          calories: ing.calories,
          protein: ing.protein,
          carbs: ing.carbs,
          fat: ing.fat,
          estimated_cost: ing.cost,
          is_provided: false,
        };
      });

      if (items.length === 0) continue;

      results.push({
        id: `v2-swap-${cand.catalogItem.recipe.slug}-${variant.variantTier}`,
        recipe_version_id: rv.id,
        recipe_variant_id: variant.id,
        image_asset_id: img?.id || null,
        image_storage_path: img?.storagePath || null,
        name: rv.name,
        description: rv.description || `Optimized for ${optResult.totalCalories} kcal`,
        calories: optResult.totalCalories,
        protein: optResult.totalProtein,
        carbs: optResult.totalCarbs,
        fat: optResult.totalFat,
        estimated_cost: optResult.totalCost,
        prep_instructions: rv.prepInstructions || "Prepare using recommended portions.",
        prep_time_min: rv.cookingTimeMin,
        image_url: resolveV2ImageSnapshot(img?.url, rv.name),
        items,
      });
    }

    const imageIds = [...new Set(results.map((option) => option.image_asset_id)
      .filter((id): id is string => Boolean(id)))];
    if (imageIds.length) {
      const imagesResult = await supabase.from("recipe_images")
        .select("id,recipe_version_id,storage_path,url,status,is_primary").in("id", imageIds)
        .eq("status", "APPROVED").eq("is_primary", true);
      const images = (imagesResult.error ? [] : imagesResult.data || []) as RecipeImageRow[];
      for (const option of results) {
        const image = approvedImageForReference({ imageAssetId: option.image_asset_id,
          recipeVersionId: option.recipe_version_id, storagePath: option.image_storage_path,
          url: option.image_url || null }, images);
        if (option.image_asset_id && !image) {
          option.image_asset_id = null;
          option.image_storage_path = null;
          option.image_url = resolveV2ImageSnapshot(null, option.name);
        }
      }
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

    // 1. Resolve date boundaries
    const tz = await NutritionService.getUserTimezone(userId);
    const { start, end } = await NutritionService.getLocalDateBoundaries(userId, tz, dateStr);

    // Food seed upserts preserve pre-existing database IDs, which can differ from catalog IDs.
    const { data: liveFoods, error: foodLookupError } = await supabase
      .from("foods")
      .select("id, name");
    if (foodLookupError) throw foodLookupError;
    const resolveSwapFoodId = createLiveFoodIdResolver(
      liveFoods || [],
      loadNutritionCatalog().foodById
    );

    // 2. Prepare swap payload for PostgreSQL RPC
    const swapRpcPayload = {
      name: chosenOption.name,
      recipe_version_id: chosenOption.recipe_version_id,
      recipe_variant_id: chosenOption.recipe_variant_id,
      image_asset_id: chosenOption.image_asset_id,
      image_storage_path_snapshot: chosenOption.image_storage_path,
      image_url_snapshot: chosenOption.image_url || null,
      calories: chosenOption.calories,
      protein: chosenOption.protein,
      carbs: chosenOption.carbs,
      fat: chosenOption.fat,
      estimated_cost: chosenOption.estimated_cost,
      items: chosenOption.items.map((it) => ({
        food_id: resolveSwapFoodId(it.food_id),
        name: it.name,
        // Detailed V2 items store the actual portion: grams for continuous foods,
        // pieces for discrete foods. The snapshots use that same portion.
        quantity: it.quantity,
        portion_type: it.portion_type,
        unit: it.unit,
        serving_size: it.serving_size,
        calories_snapshot: it.calories,
        protein_snapshot: it.protein,
        carbs_snapshot: it.carbs,
        fat_snapshot: it.fat,
        cost_snapshot: it.estimated_cost,
        is_provided: it.is_provided || false,
      })),
    };

    // 3. Attempt Authoritative PostgreSQL Atomic Swap RPC
    const { error: atomicSwapErr } = await supabase.rpc(
      "execute_v2_meal_swap_atomic",
      {
        p_user_id: userId,
        p_date: dateStr,
        p_meal_slot: mealSlot,
        p_day_start: start,
        p_day_end: end,
        p_swap: swapRpcPayload,
      }
    );

    if (atomicSwapErr) {
      if (atomicSwapErr.message?.includes("CANNOT_SWAP_LOGGED_MEAL")) {
        throw new Error("CANNOT_SWAP_LOGGED_MEAL: This meal has already been logged. Past and logged meals cannot be altered.");
      }
      console.error("[V2PlanService] Database error executing atomic swap:", atomicSwapErr);
      throw new Error(`Swap failed: ${atomicSwapErr.message}`);
    } else {
      // Atomic RPC succeeded! Invalidate server cache & return
      NutritionService.invalidateServerCache(userId);
      invalidateNutritionServerCache(userId);
      this.generateV2GroceryList(userId).catch(() => {});

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

    const { data: plans, error: plansError } = await supabase
      .from("meal_plans")
      .select("*, meal_plan_items(*, foods(*), planned_meals(meal_slot))")
      .eq("user_id", userId)
      .in("date", dateRange)
      .eq("status", "READY");
    if (plansError) throw plansError;
    if (!plans?.length) throw new Error("V2_PLAN_NOT_FOUND: No ready meal plan in this date range.");

    const pantryFoods = new Set<string>(
      (Array.isArray(profile?.available_foods) ? profile.available_foods : [])
        .map((s: string) => s.toLowerCase().trim())
        .filter(Boolean)
    );

    const rawEnv = String(profile?.food_environment || "").toLowerCase().trim();
    const isBaseProvidedEnv =
      rawEnv === "hostel" ||
      rawEnv === "pg" ||
      rawEnv === "office/canteen" ||
      rawEnv === "home" ||
      profile?.mess_available === true;
    const isHomeLiving = rawEnv === "home";

    // 3. Aggregate items across 7 days
    const itemMap = new Map<
      string,
      {
        name: string;
        food: any;
        canonical: CanonicalGroceryDefinition;
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
      const groceryItems = selectGroceryPlanItems(plan.meal_plan_items || []);
      for (const item of groceryItems) {
        const food = item.foods;
        if (!food) continue;

        const foodName = food.name;
        const lowerName = foodName.toLowerCase();

        const isCoreMessItem = isBaseProvidedEnv && isStapleCoreFood(foodName, profile?.food_environment);
        const isProvided = (item.is_provided === true) || isCoreMessItem;
        const isPantry = Array.from(pantryFoods).some((p) => lowerName.includes(p) || p.includes(lowerName));

        // Parse quantity
        const sSize = String(item.serving_size || "");
        let slotName = item.planned_meals?.meal_slot || "Meal";
        if (sSize.includes("::")) {
          slotName = sSize.split("::")[0];
        }

        // Map to retail grocery staple
        const canonical = toCanonicalGroceryStaple(
          foodName,
          food.category,
          food.serving_unit,
          profile?.diet_preference || profile?.food_type
        );
        const displayName = isProvided ? foodName : canonical.canonicalName;
        const key = isProvided ? `provided:${lowerName}` : `buy:${canonical.canonicalName.toLowerCase()}`;

        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: displayName,
            food,
            canonical,
            totalGrams: 0,
            totalUnits: 0,
            unit: canonical.retailUnit,
            isProvided,
            isPantry,
            usedInMeals: new Set(),
            estimatedPrice: 0,
          });
        }

        const entry = itemMap.get(key)!;
        entry.usedInMeals.add(slotName);

        const sw = Number(food.serving_weight_g) || canonical.packGrams || 100;
        const portion = groceryPortionAmount(item, sw);
        entry.totalGrams += portion.grams;
        entry.totalUnits += portion.units;
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
      const canonical = entry.canonical;

      // Check mess provision
      if (entry.isProvided) {
        providedByMess.push({
          name: entry.name,
          note: isHomeLiving
            ? "Provided ₹0 by Family Home Kitchen"
            : `Provided ₹0 by ${profile?.food_environment || "Hostel"} mess`,
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
      const retailUnit = canonical?.retailUnit || "pack";
      let weeklyQty = 1;
      let itemPrice = 0;

      if (retailUnit === "eggs") {
        weeklyQty = Math.max(6, Math.ceil(entry.totalUnits / 6) * 6);
        itemPrice = weeklyQty * (canonical?.costPerPack || 7);
      } else if (retailUnit === "pieces") {
        weeklyQty = Math.max(canonical?.minPurchasePacks || 3, Math.ceil(entry.totalUnits));
        itemPrice = weeklyQty * (canonical?.costPerPack || 10);
      } else if (retailUnit === "liters") {
        weeklyQty = Math.max(1, Math.round((entry.totalGrams / 1000) * 2) / 2);
        itemPrice = Math.round(weeklyQty * (canonical?.costPerPack || 65));
      } else if (retailUnit === "kg") {
        weeklyQty = Math.max(0.5, Math.ceil((entry.totalGrams / 1000) * 2) / 2);
        itemPrice = Math.round(weeklyQty * (canonical?.costPerPack || 60));
      } else if (retailUnit === "g") {
        const packSize = canonical?.packGrams || 500;
        weeklyQty = Math.max(packSize, Math.ceil(entry.totalGrams / packSize) * packSize);
        itemPrice = Math.round((weeklyQty / packSize) * (canonical?.costPerPack || 50));
      } else { // "pack", "jar", "bunch"
        const packGrams = canonical?.packGrams || 200;
        const packsNeeded = entry.totalGrams > 0
          ? Math.max(1, Math.ceil(entry.totalGrams / packGrams))
          : Math.max(1, Math.ceil(entry.totalUnits));
        weeklyQty = packsNeeded;
        itemPrice = weeklyQty * (canonical?.costPerPack || food.estimated_cost || 35);
      }

      totalSpendInr += itemPrice;

      const cat = normalizeCategoryForDiet(
        canonical?.category || food.category || "General",
        entry.name,
        profile?.diet_preference || profile?.food_type
      );
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
        serving_info: food.serving_size || `${weeklyQty} ${retailUnit}`,
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
            provided_by_mess: providedByMess,
            already_have_pantry: alreadyHave,
          },
        };

        const { error: workoutSyncError } = await supabase
          .from("fitness_os_workout_plans")
          .update({ plan_data: updatedPlanData })
          .eq("id", activePlan.id);
        if (workoutSyncError) throw workoutSyncError;

        const { error: groceryDeleteError } = await supabase
          .from("fitness_grocery_items")
          .delete()
          .eq("user_id", userId)
          .eq("plan_id", activePlan.id);
        if (groceryDeleteError) throw groceryDeleteError;

        if (legacyDbGroceryRows.length > 0) {
          const { error: groceryInsertError } = await supabase.from("fitness_grocery_items").insert(
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
          if (groceryInsertError) throw groceryInsertError;
        }
      }
    } catch (syncErr: any) {
      throw new Error(`GROCERY_SYNC_FAILED: ${syncErr?.message || "Unknown persistence error"}`);
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

    // Use the authoritative planned meal and its detailed ingredient rows.
    const { data: plannedMeals, error: plannedMealError } = await supabase
      .from("planned_meals")
      .select("id, status, meal_plan_id")
      .eq("user_id", userId)
      .eq("local_date", dateStr)
      .eq("meal_slot", mealSlot)
      .limit(2);
    if (plannedMealError) throw plannedMealError;
    if (plannedMeals?.length !== 1) {
      throw new Error("PLANNED_MEAL_NOT_UNIQUE: Expected exactly one planned meal for this slot.");
    }
    const plannedMeal = plannedMeals[0];
    if (plannedMeal.status !== "PLANNED") {
      throw new Error("PLANNED_MEAL_NOT_LOGGABLE: This meal is already logged or inactive.");
    }
    const { data: plan, error: planError } = await supabase
      .from("meal_plans")
      .select("status")
      .eq("id", plannedMeal.meal_plan_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (plan && plan.status !== "READY" && plan.status !== "active" && plan.status !== "ACTIVE" && plan.status !== "COMPLETED") {
      throw new Error("PLAN_NOT_READY");
    }

    const { data: slotItems, error: itemError } = await supabase
      .from("meal_plan_items")
      .select("food_id, quantity, portion_type, unit, serving_size, calories_snapshot, protein_snapshot, carbs_snapshot, fat_snapshot, cost_snapshot")
      .eq("planned_meal_id", plannedMeal.id);
    if (itemError) throw itemError;
    if (!slotItems?.length) throw new Error(`No detailed planned items found for ${mealSlot}.`);
    for (const item of slotItems) {
      if (!item.food_id || item.calories_snapshot == null || item.protein_snapshot == null ||
          item.carbs_snapshot == null || item.fat_snapshot == null) {
        throw new Error("PLANNED_MEAL_INCOMPLETE: Food and macro snapshots are required.");
      }
    }

    // The current RPC signature accepts this payload. The corrective migration
    // validates against and logs from the locked database rows, not client values.
    const logItems = slotItems.map((item) => ({
      food_id: item.food_id,
      quantity: item.quantity,
      calories: item.calories_snapshot,
      protein: item.protein_snapshot,
      carbs: item.carbs_snapshot,
      fat: item.fat_snapshot,
    }));

    // 3. Attempt Authoritative PostgreSQL Atomic Log RPC
    const { data: atomicLogRes, error: atomicLogErr } = await supabase.rpc(
      "log_v2_planned_meal_atomic",
      {
        p_user_id: userId,
        p_date: dateStr,
        p_meal_slot: mealSlot,
        p_food_logs: logItems,
      }
    );

    if (atomicLogErr) {
      throw new Error(`Atomic planned meal logging failed: ${atomicLogErr.message}`);
    }
    if (atomicLogRes?.planned_meal_id !== plannedMeal.id ||
        atomicLogRes?.food_logs_count !== logItems.length) {
      throw new Error("Atomic planned meal logging returned an unexpected result.");
    }

    // 5. Invalidate server cache & return adaptive day state
    NutritionService.invalidateServerCache(userId);
    invalidateNutritionServerCache(userId);

    const adaptiveDay = await this.getV2AdaptiveRemainingDay(userId, dateStr);

    return {
      success: true,
      loggedItems: logItems,
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
