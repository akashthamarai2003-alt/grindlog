import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { V2PlanService } from "@/lib/services/nutrition/v2-plan-service";
import { MealSlotType } from "@/lib/fitness/nutrition/domain-types";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { buildNutritionUserContext } from "@/lib/fitness/nutrition/user-context";
import { NutritionValidationEngine } from "@/lib/fitness/nutrition/validation-engine";

const ALLOWED_MEAL_TYPES = new Set([
  "breakfast",
  "lunch",
  "pre_workout",
  "post_workout",
  "snack",
  "dinner",
]);

function normalize(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\beggs\b/g, "egg")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function profileTerms(value: unknown): string[] {
  const values = Array.isArray(value) ? value : String(value || "").split(/[,;|\n]+/);
  return values
    .map((item) => normalize(item))
    .filter((item) => item && !["none", "no", "n a", "na", "nil", "not specified"].includes(item));
}

function matchesTerm(foodText: string, term: string): boolean {
  return foodText.includes(term) || term.includes(foodText.split(" ")[0]);
}

function isFoodAvailable(food: any, available: string[]): boolean {
  if (available.length === 0) return true;
  const foodName = normalize(food.name);
  return available.some((term) => foodName.includes(term) || term.includes(foodName));
}

function isFoodBlocked(food: any, blockedTerms: string[]): boolean {
  const foodText = normalize([
    food.name,
    food.category,
    ...(Array.isArray(food.allergens) ? food.allergens : []),
  ].join(" "));
  return blockedTerms.some((term) => matchesTerm(foodText, term));
}

function isDietCompatible(food: any, diet: string): boolean {
  const foodDiet = normalize(food.diet_type);
  const foodText = normalize(`${food.name} ${food.category} ${foodDiet}`);
  const isVegan = diet.includes("vegan");
  const isNonVegetarian = !isVegan && (diet.includes("non") || diet.includes("meat") || diet.includes("chicken") || diet.includes("fish"));
  const isEggetarian = !isVegan && !isNonVegetarian && (diet.includes("eggetarian") || diet.includes("eggitarian") || diet.includes("egg"));
  const isVegetarian = !isVegan && !isNonVegetarian && !isEggetarian && (diet.includes("vegetarian") || diet === "veg" || diet.includes("veg"));

  if (isVegan) {
    return foodDiet.includes("vegan") && !/(dairy|egg|meat|chicken|fish|non veg)/.test(foodText);
  }
  if (isVegetarian && !isEggetarian) {
    return !/(non veg|nonvegetarian|meat|chicken|fish|egg)/.test(foodText);
  }
  if (isEggetarian) {
    return !/(non veg|nonvegetarian|meat|chicken|fish)/.test(foodText);
  }
  return true;
}

function totalsForFoods(foods: any[]) {
  return foods.reduce((totals, food) => ({
    calories: totals.calories + Number(food.calories || 0),
    protein: totals.protein + Number(food.protein || 0),
    carbs: totals.carbs + Number(food.carbs || 0),
    fat: totals.fat + Number(food.fat || 0),
    estimated_cost: totals.estimated_cost + Number(food.estimated_cost || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, estimated_cost: 0 });
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated." } },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const mealType = String(searchParams.get("meal_type") || "breakfast").toLowerCase().trim();
    const targetDate = String(searchParams.get("date") || "").trim();
    const forceV2 = searchParams.get("v2") === "true";

    const [profileRes, targetsRes, foodCatalogRes] = await Promise.all([
      supabase
        .from("fitness_os_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      NutritionService.getEffectiveTargets(user.id),
      supabase
        .from("foods")
        .select("id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly")
        .eq("is_active", true)
        .limit(300)
    ]);

    const profile: any = (profileRes.data as any) || {};
    const targets = targetsRes || { calories: 2000, protein: 130 };
    const foodCatalog = (foodCatalogRes.data || []) as any[];

    const isV2 = V2PlanService.isNutritionV2Enabled(user.id, profile, { forceV2 });

    if (isV2 && ALLOWED_MEAL_TYPES.has(mealType)) {
      try {
        const localDate = targetDate || await NutritionService.getLocalDateString(user.id);
        const v2Options = await V2PlanService.getV2SwapOptions(user.id, localDate, mealType as MealSlotType);
        return NextResponse.json({
          success: true,
          engine: "v2",
          data: {
            meal_type: mealType,
            options: v2Options,
            profile_diet: profile.diet_preference || profile.food_type || "Balanced",
          }
        });
      } catch (v2Err: any) {
        console.warn("[Swap API] V2 swap options fallback to curated:", v2Err?.message);
      }
    }

    // Fallback to curated swap options for legacy plans
    const options = NutritionService.getCuratedSwapOptions(mealType, profile, targets, foodCatalog);

    return NextResponse.json({
      success: true,
      engine: "v1",
      data: {
        meal_type: mealType,
        options,
        profile_diet: profile.diet_preference || profile.food_type || "Balanced",
      }
    });
  } catch (error: any) {
    console.error("Error in GET /api/nutrition/swap-meal:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to load swap alternatives." } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated." } },
        { status: 401 },
      );
    }

    const plan = await getFitnessPlan(user.id);
    if (plan?.id !== "pro") {
      return NextResponse.json(
        { success: false, error: { code: "PRO_REQUIRED", message: "Meal swapping is available on the Pro plan." } },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const mealType = String(body.meal_type || "").toLowerCase().trim();
    if (!ALLOWED_MEAL_TYPES.has(mealType)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_MEAL_TYPE", message: "Choose a valid meal to swap." } },
        { status: 400 },
      );
    }

    const localDate = body.date || await NutritionService.getLocalDateString(user.id);
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: { code: "PROFILE_NOT_FOUND", message: "Your food preferences could not be loaded." } },
        { status: 404 },
      );
    }

    const forceV2 = body.v2 === true;
    const isV2 = V2PlanService.isNutritionV2Enabled(user.id, profile, { forceV2 });

    // V2 swap path: enforces atomic swap, slot macro matching, and protecting logged meals
    if (isV2 && body.selected_option && Array.isArray(body.selected_option.items) && body.selected_option.items.length > 0) {
      try {
        const swapResult = await V2PlanService.executeV2MealSwap(
          user.id,
          localDate,
          mealType as MealSlotType,
          body.selected_option
        );

        try {
          revalidatePath("/");
          revalidatePath("/nutrition");
          revalidatePath("/grocery");
        } catch {}

        return NextResponse.json({
          success: true,
          engine: "v2",
          message: swapResult.message,
          data: swapResult.updatedMeal,
        });
      } catch (v2SwapErr: any) {
        if (v2SwapErr?.message?.includes("CANNOT_SWAP_LOGGED_MEAL")) {
          return NextResponse.json(
            { success: false, error: { code: "CANNOT_SWAP_LOGGED_MEAL", message: "This meal has already been logged. Past and logged meals cannot be altered." } },
            { status: 400 }
          );
        }
        console.warn("[Swap API] V2 execute swap notice:", v2SwapErr?.message);
        // If V2 failed due to missing daily container, proceed to standard handler
      }
    }

    // Legacy swap path (backward compatibility for existing plans)
    const available = profileTerms(profile.available_foods);
    const blocked = [
      ...profileTerms(profile.food_allergies),
      ...profileTerms(profile.foods_disliked),
      ...profileTerms(profile.foods_avoided),
    ];
    const diet = normalize(`${profile.food_type || ""} ${profile.diet_preference || ""}`);

    const { data: allFoods, error: foodsError } = await supabase
      .from("foods")
      .select("id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
      .eq("is_active", true)
      .limit(300);
    if (foodsError) throw foodsError;

    const compatibleFoods = (allFoods || []).filter((food) => (
      isDietCompatible(food, diet)
      && isFoodAvailable(food, available)
      && !isFoodBlocked(food, blocked)
    ));

    const categoryFoods = compatibleFoods.filter((food) => {
      const category = normalize(food.category);
      if (mealType === "breakfast") return category.includes("breakfast") || category.includes("dairy") || category.includes("fruit");
      if (mealType === "snack" || mealType === "pre_workout" || mealType === "post_workout") {
        return category.includes("snack") || category.includes("fruit") || category.includes("protein");
      }
      return category.includes("curry") || category.includes("protein") || category.includes("staple");
    });
    const candidates = categoryFoods.length >= 2 ? categoryFoods : compatibleFoods;

    const { data: existingPlans, error: plansError } = await supabase
      .from("meal_plans")
      .select("id, meal_type, meal_plan_items(id, food_id, quantity, serving_size)")
      .eq("user_id", user.id)
      .eq("date", localDate);
    if (plansError) throw plansError;

    const existingPlan = (existingPlans || [])[0];

    let optionName = `${mealType.replace("_", " ")} alternative`;
    let selectedFoods: any[] = [];

    if (body.selected_option && Array.isArray(body.selected_option.items) && body.selected_option.items.length > 0) {
      optionName = body.selected_option.name || optionName;
      selectedFoods = body.selected_option.items.map((it: any) => ({
        id: it.food_id || it.id,
        name: it.name,
        serving_size: it.serving_size || '1 serving',
        calories: Number(it.calories) || 0,
        protein: Number(it.protein) || 0,
        carbs: Number(it.carbs) || 0,
        fat: Number(it.fat) || 0,
        estimated_cost: Number(it.estimated_cost) || 0,
        quantity: Number(it.quantity) || 1,
      }));
    } else if (Array.isArray(body.foods) && body.foods.length > 0) {
      selectedFoods = body.foods.map((it: any) => ({
        id: it.food_id || it.id,
        name: it.name,
        serving_size: it.serving_size || '1 serving',
        calories: Number(it.calories) || 0,
        protein: Number(it.protein) || 0,
        carbs: Number(it.carbs) || 0,
        fat: Number(it.fat) || 0,
        estimated_cost: Number(it.estimated_cost) || 0,
        quantity: Number(it.quantity) || 1,
      }));
    } else {
      const slotPrefix = `${mealType}::`;
      const previousItems = (existingPlan?.meal_plan_items || []).filter((it: any) =>
        existingPlan.meal_type === 'daily'
          ? (typeof it.serving_size === 'string' && it.serving_size.startsWith(slotPrefix))
          : true
      );
      const previousFoodIds = new Set(previousItems.map((item: any) => item.food_id));
      const withoutCurrent = candidates.filter((food) => !previousFoodIds.has(food.id));
      const selectionPool = withoutCurrent.length >= 2 ? withoutCurrent : candidates;
      selectedFoods = [...selectionPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((food) => ({
          ...food,
          quantity: 1,
        }));
    }

    const totals = totalsForFoods(selectedFoods);

    const userContext = buildNutritionUserContext(profile, null, user.id);
    const swapValidation = NutritionValidationEngine.validateSwap(
      { calories: totals.calories, protein: totals.protein },
      selectedFoods,
      userContext
    );
    if (!swapValidation.valid) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_FAILED", message: swapValidation.issues[0] || "Selected food does not comply with your dietary preferences." } },
        { status: 400 }
      );
    }

    let swapPlan = existingPlan;
    let createdPlan = false;
    if (!swapPlan) {
      const { data: newPlan, error: createError } = await supabase
        .from("meal_plans")
        .insert({
          user_id: user.id,
          date: localDate,
          meal_type: 'daily',
          name: optionName,
          calories: Math.round(totals.calories),
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          estimated_cost: totals.estimated_cost,
          ai_generated: false,
        })
        .select("id, meal_type, meal_plan_items(id, food_id, quantity, serving_size)")
        .single();
      if (createError || !newPlan) throw createError || new Error("Could not create meal alternative.");
      swapPlan = newPlan;
      createdPlan = true;
    } else {
      if (swapPlan.meal_type === 'daily') {
        const slotPrefix = `${mealType}::`;
        const itemsToDelete = (swapPlan.meal_plan_items || []).filter((it: any) =>
          typeof it.serving_size === 'string' && it.serving_size.startsWith(slotPrefix)
        );
        if (itemsToDelete.length > 0) {
          const deleteIds = itemsToDelete.map((it: any) => it.id).filter(Boolean);
          if (deleteIds.length > 0) {
            const { error: delErr } = await supabase
              .from("meal_plan_items")
              .delete()
              .in("id", deleteIds);
            if (delErr) throw delErr;
          }
        }
      } else {
        const { error: deleteError } = await supabase
          .from("meal_plan_items")
          .delete()
          .eq("meal_plan_id", swapPlan.id);
        if (deleteError) throw deleteError;
      }
    }

    const { error: itemError } = await supabase
      .from("meal_plan_items")
      .insert(selectedFoods.map((food) => ({
        meal_plan_id: swapPlan.id,
        food_id: food.id || food.food_id,
        quantity: food.quantity || 1,
        serving_size: `${mealType}::${optionName}::${food.serving_size || '1 serving'}`,
      })));

    if (itemError) {
      if (createdPlan) {
        await supabase.from("meal_plans").delete().eq("id", swapPlan.id).eq("user_id", user.id);
      }
      throw itemError;
    }

    await NutritionService.updateDailySummary(user.id);

    try {
      await NutritionService.syncGroceryListFromMealPlans(user.id);
    } catch (syncErr: any) {
      console.warn("Background grocery auto-sync notice:", syncErr?.message);
    }

    try {
      revalidatePath("/");
      revalidatePath("/nutrition");
      revalidatePath("/grocery");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `${mealType.replace("_", " ")} meal swapped safely for today.`,
      data: {
        meal_type: mealType,
        foods: selectedFoods.map((food) => ({
          name: food.name,
          serving_size: food.serving_size,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/swap-meal:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "The meal could not be swapped safely. Your saved plan was not changed." } },
      { status: 500 },
    );
  }
}
