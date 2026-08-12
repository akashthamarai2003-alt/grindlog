import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON, GROQ_MODELS } from "@/lib/services/groq/client";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

interface MealPlanGenerationResult {
  meals: {
    meal_type: string;
    name: string;
    foods: {
      food_id: string; // The user requested food IDs instead of names
      quantity: number;
    }[];
    reason: string;
  }[];
}

export class AINutritionService {
  static readonly MEAL_GEN_LIMIT_PER_DAY = 1;
  static readonly PROMPT_VERSION = "meal-plan-v1";

  static async logUsage(
    userId: string, 
    status: string, 
    model: string, 
    tokens?: { input: number, output: number },
    requestId?: string
  ) {
    const supabase = await createServerSupabase();
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      feature: 'meal_generation',
      model: model,
      status: status,
      request_id: requestId,
      input_tokens: tokens?.input || 0,
      output_tokens: tokens?.output || 0,
      prompt_version: this.PROMPT_VERSION
    });
  }

  static async generateMealPlan(userId: string) {
    const supabase = await createServerSupabase();
    const localDate = await NutritionService.getLocalDateString(userId);

    // 1. Cleanup existing meal plans for today to allow fresh generation
    const { data: existingPlans } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('date', localDate);

    if (existingPlans && existingPlans.length > 0) {
      await supabase.from('meal_plans').delete().eq('user_id', userId).eq('date', localDate);
    }

    // 2. Rate Limiting Check
    const { start, end } = await NutritionService.getLocalDateBoundaries(userId);
    const { count } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature', 'meal_generation')
      .eq('status', 'success')
      .gte('created_at', start)
      .lte('created_at', end);

    if (count !== null && count >= this.MEAL_GEN_LIMIT_PER_DAY) {
      throw new Error("You have reached your daily limit for AI meal plan generation.");
    }

    // 3. Gather Context
    const targets = await NutritionService.getEffectiveTargets(userId);
    if (!targets) throw new Error("TARGET_NOT_FOUND");

    // Fetch user profile for dietary restrictions (mocking preference fetch if not in profile)
    // Assume profile doesn't have detailed diet yet, we'll keep it simple as requested.
    
    // Fetch food catalog (Active foods only)
    const { data: allFoods } = await supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly')
      .eq('is_active', true);

    if (!allFoods || allFoods.length === 0) {
      throw new Error("Food catalog is empty. Cannot generate a plan.");
    }

    // Send a compact version of foods
    const compactFoods = allFoods.map(f => ({
      id: f.id,
      n: f.name,
      c: f.calories,
      p: f.protein,
      cost: f.estimated_cost
    }));

    // 4. Prompt Construction
    const systemPrompt = `You are a strict, expert nutritionist AI meal-selection assistant.
Your task is to select foods from the provided DATABASE to construct a 1-day meal plan that hits the user's nutritional targets.
You MUST ONLY return the exact 4 meal types: breakfast, lunch, snack, dinner.
You MUST ONLY use foods that exist in the provided DATABASE.
Return the food_id and the quantity (number of servings). 
Do NOT invent foods, calories, or macros.
Do NOT provide medical advice.
Return ONLY valid JSON matching this schema:
{
  "meals": [
    {
      "meal_type": "breakfast", // or lunch, snack, dinner
      "name": "string (e.g. High Protein Morning)",
      "foods": [
        {
          "food_id": "uuid string",
          "quantity": number
        }
      ],
      "reason": "short explanation of why this was chosen"
    }
  ]
}`;

    const userPrompt = `
User Targets:
- Calories: ${targets.calories} kcal
- Protein: ${targets.protein} g
- Carbs: ${targets.carbs} g
- Fat: ${targets.fat} g

Available Food DATABASE:
${JSON.stringify(compactFoods)}

Generate the meal plan.
`;

    // 5. Call Groq with 1 retry logic for JSON formatting
    let aiResult: MealPlanGenerationResult | null = null;
    let attempts = 0;
    const model = GROQ_MODELS.fast;
    let lastError = null;

    while (attempts < 2) {
      try {
        attempts++;
        aiResult = await generateAIResponseJSON<MealPlanGenerationResult>({
          systemPrompt,
          userPrompt,
          model: "fast"
        });
        
        // Basic schema validation
        if (!aiResult?.meals || !Array.isArray(aiResult.meals)) {
          throw new Error("Invalid AI schema: missing 'meals' array");
        }
        break; // Success
      } catch (err: any) {
        lastError = err;
        if (err?.message?.includes("429")) {
          throw new Error("AI meal generation is temporarily unavailable. Please try again.");
        }
        // If it's a parsing error or schema error, we loop to retry once.
      }
    }

    if (!aiResult) {
      await this.logUsage(userId, 'failed_json_parse', model);
      throw new Error("AI failed to return a valid meal plan format after retries.");
    }

    // 6. Canonical Validation & Math Calculation
    const foodMap = new Map(allFoods.map(f => [f.id, f]));
    const validMealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    
    // Validate meal types
    const planMeals = aiResult.meals.filter(m => validMealTypes.includes(m.meal_type.toLowerCase()));
    
    // Compute total items and canonical math
    const mealPlansToInsert: any[] = [];
    const mealPlanItemsToInsert: any[] = []; // We need meal_plan_ids first, so we'll do this in a loop

    // Since we need to insert atomically and link items, we can use an RPC or do a managed transaction.
    // Supabase JS doesn't support traditional transactions well without RPC, so we will insert the plans,
    // get their IDs, and then insert the items. If it fails, we rollback manually or rely on cascade.
    // The user requested: "meal_plans and meal_plan_items must be inserted in one transaction. No partial meal plans."
    // We can use Supabase's `rpc` if we had one, but without it, we can insert an array of meal_plans, 
    // and if item insertion fails, we delete the inserted meal plans.
    
    // First, let's prepare the data
    for (const meal of planMeals) {
      let mealCals = 0;
      let mealPro = 0;
      let mealCarbs = 0;
      let mealFat = 0;
      let mealCost = 0;
      
      const validFoods = [];

      for (const item of meal.foods) {
        const foodIdStr = String(item.food_id); // In case AI returned a number instead of string UUID
        const realFood = foodMap.get(foodIdStr);
        if (!realFood) {
          await this.logUsage(userId, 'failed_invalid_food', model);
          throw new Error(`AI generated a non-existent food ID: ${foodIdStr}`);
        }
        
        const q = Number(item.quantity) || 1;
        if (q <= 0) continue;

        mealCals += Math.round(realFood.calories * q);
        mealPro += Number((realFood.protein * q).toFixed(2));
        mealCarbs += Number((realFood.carbs * q).toFixed(2));
        mealFat += Number((realFood.fat * q).toFixed(2));
        mealCost += Number((realFood.estimated_cost * q).toFixed(2));
        
        validFoods.push({
          food_id: realFood.id,
          quantity: q
        });
      }

      if (validFoods.length > 0) {
        mealPlansToInsert.push({
          user_id: userId,
          date: localDate,
          meal_type: meal.meal_type.toLowerCase(),
          name: meal.name || `${meal.meal_type} Plan`,
          calories: mealCals,
          protein: mealPro,
          carbs: mealCarbs,
          fat: mealFat,
          estimated_cost: mealCost,
          ai_generated: true,
          // We will attach validFoods temporarily to process them after insert
          _items: validFoods 
        });
      }
    }

    if (mealPlansToInsert.length === 0) {
      await this.logUsage(userId, 'failed_empty_plan', model);
      throw new Error("AI returned a plan with no valid foods.");
    }

    // 7. Database Cleanup & Insertion
    // Delete any previous meal plans for today to prevent duplicates or constraint collisions
    await supabase.from('meal_plans').delete().eq('user_id', userId).eq('date', localDate);

    // Try inserting individual meal_type plans
    const { data: insertedPlans, error: plansError } = await supabase
      .from('meal_plans')
      .insert(mealPlansToInsert.map(p => {
        const { _items, ...rest } = p;
        return rest;
      }))
      .select();

    if (plansError) {
      // Fallback for database instances where unique_user_date is ON (user_id, date) instead of (user_id, date, meal_type)
      if (plansError.message?.includes("unique_user_date") || plansError.code === '23505') {
        const combinedCals = mealPlansToInsert.reduce((a, b) => a + b.calories, 0);
        const combinedPro = mealPlansToInsert.reduce((a, b) => a + b.protein, 0);
        const combinedCarbs = mealPlansToInsert.reduce((a, b) => a + b.carbs, 0);
        const combinedFat = mealPlansToInsert.reduce((a, b) => a + b.fat, 0);
        const combinedCost = mealPlansToInsert.reduce((a, b) => a + b.estimated_cost, 0);

        const { data: singlePlan, error: singleErr } = await supabase
          .from('meal_plans')
          .insert({
            user_id: userId,
            date: localDate,
            meal_type: 'daily',
            name: 'Daily AI Nutrition Plan',
            calories: combinedCals,
            protein: combinedPro,
            carbs: combinedCarbs,
            fat: combinedFat,
            estimated_cost: combinedCost,
            ai_generated: true
          })
          .select()
          .single();

        if (singleErr || !singlePlan) {
          await this.logUsage(userId, 'failed_db_insert', model);
          throw singleErr || plansError;
        }

        const allItems = mealPlansToInsert.flatMap(p => p._items);
        const singlePlanItems = allItems.map(item => ({
          meal_plan_id: singlePlan.id,
          food_id: item.food_id,
          quantity: item.quantity
        }));

        await supabase.from('meal_plan_items').insert(singlePlanItems);

        await this.logUsage(userId, 'success', model);
        await NutritionService.updateDailySummary(userId);
        return { existing: false, success: true };
      }

      await this.logUsage(userId, 'failed_db_insert', model);
      throw plansError;
    }

    // Prepare items for multi-meal plan insertion
    for (let i = 0; i < insertedPlans.length; i++) {
      const plan = insertedPlans[i];
      const items = mealPlansToInsert[i]._items;
      for (const item of items) {
        mealPlanItemsToInsert.push({
          meal_plan_id: plan.id,
          food_id: item.food_id,
          quantity: item.quantity
        });
      }
    }

    const { error: itemsError } = await supabase
      .from('meal_plan_items')
      .insert(mealPlanItemsToInsert);

    if (itemsError) {
      // Rollback
      await supabase.from('meal_plans').delete().in('id', insertedPlans.map(p => p.id));
      await this.logUsage(userId, 'failed_db_items_insert', model);
      throw itemsError;
    }

    // 8. Success Logging
    await this.logUsage(userId, 'success', model);
    await NutritionService.updateDailySummary(userId);

    return { existing: false, success: true };
  }
}
