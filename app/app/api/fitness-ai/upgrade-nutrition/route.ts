import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import {
  FITNESS_PLAN_MODEL,
  generateOpenAIResponseJSON,
} from "@/lib/services/openai/client";
import {
  GeneratedNutritionSchema,
  GeneratedPlanSchema,
} from "@/lib/fitness/ai/schemas";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import {
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";
import { canUseFitnessFeature, getFitnessPlan } from "@/lib/fitness/subscription/access";
import {
  getPlanNutritionTargets,
  validatePlanAgainstProfile,
} from "@/lib/fitness/validation/fitness-plan-profile";
import { enrichPlanWithFoodLibrary } from "@/lib/fitness/validation/fitness-food-library";
import { runFitnessAISafetyCheck } from "@/lib/fitness/safety/fitness-ai-safety";

export const maxDuration = 120;

const NUTRITION_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "daily_calories",
    "protein_grams",
    "carbs_grams",
    "fat_grams",
    "meals_per_day",
    "guidance",
    "meals",
    "grocery_list",
  ],
  properties: {
    daily_calories: { type: ["number", "null"] },
    protein_grams: { type: ["number", "null"] },
    carbs_grams: { type: ["number", "null"] },
    fat_grams: { type: ["number", "null"] },
    meals_per_day: { type: ["number", "null"] },
    guidance: { type: "string" },
    meals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "meal_name",
          "time_of_day",
          "items",
          "total_calories",
          "protein_grams",
          "prep_instructions",
        ],
        properties: {
          meal_name: { type: "string" },
          time_of_day: { type: "string" },
          items: { type: "array", items: { type: "string" } },
          total_calories: { type: ["number", "null"] },
          protein_grams: { type: ["number", "null"] },
          prep_instructions: { type: "string" },
        },
      },
    },
    grocery_list: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "monthly_quantity",
          "unit",
          "estimated_price",
          "category",
          "is_optional",
          "reason",
        ],
        properties: {
          name: { type: "string" },
          monthly_quantity: { type: "number" },
          unit: { type: "string" },
          estimated_price: { type: "number" },
          category: { type: "string" },
          is_optional: { type: "boolean" },
          reason: { type: "string" },
        },
      },
    },
  },
};

function getProfileContext(profile: any, targets: ReturnType<typeof getPlanNutritionTargets>) {
  return {
    goal: profile.goal || "Not specified",
    target_physique: profile.target_physique || "Not specified",
    age: profile.age ?? null,
    gender: profile.gender || "Not specified",
    weight_kg: profile.weight ?? null,
    target_weight_kg: profile.target_weight ?? null,
    height_cm: profile.height ?? null,
    food_type: profile.food_type || profile.diet_preference || "Balanced",
    food_environment: profile.food_environment || "Home",
    meals_per_day: profile.meals_per_day || "Not specified",
    nutrition_budget: profile.nutrition_budget || "Not specified",
    available_foods: Array.isArray(profile.available_foods) ? profile.available_foods : [],
    allergies: profile.food_allergies || profile.allergies || "None",
    disliked_foods: [profile.foods_disliked, profile.foods_avoided].filter(Boolean),
    routine: {
      wake_time: profile.wake_time || null,
      workout_time: profile.workout_time || profile.preferred_training_time || null,
      sleep_time: profile.sleep_time || null,
    },
    deterministic_targets: {
      calories: targets.calories,
      protein_grams: targets.protein,
      carbs_grams: targets.carbs,
      fat_grams: targets.fat,
    },
  };
}

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionPlan = await getFitnessPlan(user.id);
    if (subscriptionPlan?.id !== "pro" || !(await canUseFitnessFeature(user.id, "ai_plan_adjustments"))) {
      return NextResponse.json(
        { success: false, error: "Full nutrition generation is available on the Pro plan.", errorType: "PRO_REQUIRED" },
        { status: 403 },
      );
    }

    const { data: activePlan, error: planError } = await supabase
      .from("fitness_os_workout_plans")
      .select("id, plan_data")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (planError || !activePlan) {
      return NextResponse.json({ success: false, error: "Your saved workout plan could not be found." }, { status: 404 });
    }

    const existingPlan = GeneratedPlanSchema.safeParse(activePlan.plan_data);
    if (!existingPlan.success) {
      return NextResponse.json({ success: false, error: "Your saved workout plan is not available for Pro nutrition generation." }, { status: 409 });
    }

    const currentNutrition = existingPlan.data.nutrition;
    const upgradeMarker = (activePlan.plan_data as any)?._nutritionUpgrade;
    if (upgradeMarker?.status === "complete" || (currentNutrition?.meals?.length ?? 0) > 0) {
      return NextResponse.json({ success: true, alreadyGenerated: true });
    }

    const retryAfterSeconds = await getGenerationRetryAfterSeconds(
      supabase,
      user.id,
      "plan_nutrition_upgrade_attempt",
    );
    if (retryAfterSeconds > 0) {
      return NextResponse.json(
        { success: false, error: "Nutrition generation is already in progress. Please wait a moment and refresh.", errorType: "IN_PROGRESS" },
        { status: 429 },
      );
    }

    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Your Pro AI generation limit has been reached for today.", errorType: "AI_LIMIT" },
        { status: 429 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Fitness profile not found." }, { status: 404 });
    }

    const { data: foodCatalog } = await supabase
      .from("foods")
      .select("name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens")
      .eq("is_active", true)
      .eq("plan_eligible", true)
      .limit(250);

    const targets = getPlanNutritionTargets(profile);
    const profileContext = getProfileContext(profile, targets);
    const workoutContext = existingPlan.data.workouts.map((workout) => ({
      title: workout.title,
      workout_date: workout.workout_date,
      duration_minutes: workout.duration_minutes,
    }));
    const userPrompt = `Create the missing Pro nutrition layer for this user's already-saved workout plan.

Saved profile (source of truth):
${JSON.stringify(profileContext, null, 2)}

Existing workout schedule (DO NOT change it):
${JSON.stringify(workoutContext, null, 2)}

Compatible food library (use these names and nutrition facts where possible):
${JSON.stringify(foodCatalog || [], null, 2)}

Return only the nutrition object. Keep the deterministic daily calorie and protein targets exactly as supplied. Generate the user's requested number of meals and a practical 30-day grocery list. Respect diet, allergies, disliked foods, available foods, food environment, budget, and saved routine. For PG, Hostel, Home, or Office/Canteen, label breakfast, lunch, and dinner as provided meals and price only the add-ons. For Lose Fat or Cut, mention limiting added sugar, sugary drinks, deep-fried foods, and frequent fast food; never demand zero sugar or zero oil. Use realistic INR prices and concise instructions.`;

    await recordGenerationAttempt(supabase, user.id, "plan_nutrition_upgrade_attempt", FITNESS_PLAN_MODEL);

    const aiResponse = await generateOpenAIResponseJSON<unknown>({
      systemPrompt: `You are Grindlog's cautious nutrition coach. Generate only a safe, practical nutrition object for an existing workout plan. Never change workouts. Follow the saved profile exactly. For vegan users, every meal and grocery item must be plant-based. Never include foods that conflict with allergies, restrictions, or the saved available-food list. Never provide medical advice or extreme calorie restriction. Return JSON only with daily_calories, protein_grams, carbs_grams, fat_grams, meals_per_day, guidance, meals, and grocery_list. Keep all text concise.`,
      userPrompt,
      model: FITNESS_PLAN_MODEL,
      maxTokens: 5500,
      minimumOutputTokens: 5500,
      reasoningEffort: "medium",
      promptCacheKey: "fitness-pro-nutrition-upgrade-v1",
      temperature: 0.2,
      jsonSchema: {
        name: "fitness_pro_nutrition",
        schema: NUTRITION_JSON_SCHEMA,
        description: "The missing Pro nutrition layer for an existing fitness plan.",
        strict: true,
      },
      verbosity: "low",
    });

    const parsedNutrition = GeneratedNutritionSchema.safeParse(aiResponse);
    if (!parsedNutrition.success) {
      return NextResponse.json({ success: false, error: "The Pro nutrition response could not be validated.", errorType: "SYSTEM" }, { status: 400 });
    }

    const mergedPlan = {
      ...existingPlan.data,
      nutrition: parsedNutrition.data,
    };
    const safetyCheck = runFitnessAISafetyCheck(mergedPlan, profile);
    const profileCheck = validatePlanAgainstProfile(mergedPlan, profile, {
      enforceProfileRules: true,
      enforceBudgetUtilisation: true,
      allowCoreNutrition: false,
    });
    if (!safetyCheck.safe || !profileCheck.valid) {
      return NextResponse.json(
        { success: false, error: safetyCheck.reason || profileCheck.issues[0] || "The nutrition plan did not match your saved profile.", errorType: safetyCheck.safe ? "PROFILE" : "SAFETY" },
        { status: 400 },
      );
    }

    const validatedPlan = enrichPlanWithFoodLibrary(profileCheck.plan, foodCatalog || []);
    const planToSave = {
      ...validatedPlan,
      _nutritionUpgrade: {
        status: "complete",
        generated_at: new Date().toISOString(),
      },
    };

    // plan_data is the source used by the dashboard, plan setup, and nutrition
    // views. Update only nutrition; workouts and their schedule are untouched.
    const { error: updateError } = await supabase
      .from("fitness_os_workout_plans")
      .update({ plan_data: planToSave })
      .eq("id", activePlan.id)
      .eq("user_id", user.id)
      .eq("status", "active");
    if (updateError) {
      console.error("Failed to save Pro nutrition upgrade:", updateError);
      return NextResponse.json({ success: false, error: "Your Pro nutrition plan could not be saved safely." }, { status: 500 });
    }

    // Keep the legacy summary tables in sync when they exist. The JSON plan is
    // already saved above and remains the primary source for current screens.
    const nutrition = validatedPlan.nutrition;
    if (nutrition) {
      const { data: nutritionRow } = await supabase
        .from("fitness_os_nutrition_plans")
        .select("id")
        .eq("plan_id", activePlan.id)
        .eq("user_id", user.id)
        .maybeSingle();
      const summary = {
        plan_id: activePlan.id,
        user_id: user.id,
        daily_calories: nutrition.daily_calories,
        protein_grams: nutrition.protein_grams,
        meals_per_day: nutrition.meals_per_day,
        guidance: nutrition.guidance,
      };
      const summaryResult = nutritionRow
        ? await supabase.from("fitness_os_nutrition_plans").update(summary).eq("id", nutritionRow.id).eq("user_id", user.id)
        : await supabase.from("fitness_os_nutrition_plans").insert(summary);
      if (summaryResult.error) console.warn("Legacy nutrition summary sync warning:", summaryResult.error);

      const { error: deleteGroceryError } = await supabase
        .from("fitness_grocery_items")
        .delete()
        .eq("plan_id", activePlan.id)
        .eq("user_id", user.id);
      if (deleteGroceryError) {
        console.warn("Legacy grocery cleanup warning:", deleteGroceryError);
      } else if (nutrition.grocery_list.length > 0) {
        const { error: groceryInsertError } = await supabase
          .from("fitness_grocery_items")
          .insert(nutrition.grocery_list.map((item) => ({
            user_id: user.id,
            plan_id: activePlan.id,
            name: item.name,
            monthly_quantity: item.monthly_quantity,
            unit: item.unit,
            estimated_price: item.estimated_price,
            category: item.category,
            is_optional: item.is_optional,
            reason: item.reason,
          })));
        if (groceryInsertError) console.warn("Legacy grocery summary sync warning:", groceryInsertError);
      }
    }

    await logFitnessAIUsage(
      user.id,
      "plan_generation",
      userPrompt,
      JSON.stringify(planToSave.nutrition),
      FITNESS_PLAN_MODEL,
      0,
    );

    return NextResponse.json({ success: true, data: { nutrition: planToSave.nutrition } });
  } catch (error: any) {
    console.error("Fitness Pro nutrition upgrade error:", error);
    return NextResponse.json(
      { success: false, error: "We could not generate your Pro nutrition plan. Your workout plan is unchanged.", errorType: "SYSTEM" },
      { status: 500 },
    );
  }
}
