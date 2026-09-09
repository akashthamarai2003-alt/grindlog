import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import {
  NutritionService,
  findFoodReference,
  sanitizeAIItemName,
  sanitizeMealTitle,
  NutritionFoodReference
} from "@/lib/services/nutrition/nutrition-service";

interface RawAIMealItem {
  name: string;
  quantity?: number;
  serving_size?: string;
}

interface RawAIMeal {
  meal_type: string;
  name: string;
  prep_instruction?: string;
  items: RawAIMealItem[];
}

interface RawAIDay {
  day_number: number;
  meals: RawAIMeal[];
}

interface LunaAIGenerationResult {
  plan_summary: string;
  days: RawAIDay[];
}

export class AINutritionService {
  static readonly MEAL_GEN_LIMIT_PER_DAY = 10;
  static readonly PROMPT_VERSION = "luna-groq-v1";

  static async logUsage(
    userId: string, 
    status: string, 
    model: string, 
    tokens?: { input: number, output: number },
    requestId?: string
  ) {
    try {
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
    } catch {
      // Non-blocking usage logging
    }
  }

  static async generateMealPlan(userId: string) {
    const supabase = await createServerSupabase();
    const localDate = await NutritionService.getLocalDateString(userId);

    // 1. Rate Limiting Check (Allow up to 10 generations per day)
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
      throw new Error("Daily limit for Luna AI meal plan generation reached (max 10/day). Please try again tomorrow.");
    }

    // 2. Gather User Context
    const targets = await NutritionService.getEffectiveTargets(userId);
    if (!targets) throw new Error("TARGET_NOT_FOUND");

    const { data: profile } = await supabase
      .from('fitness_os_profiles')
      .select('diet_preference, food_type, food_allergies, foods_disliked, foods_avoided, nutrition_budget, food_environment, available_foods, meals_per_day')
      .eq('user_id', userId)
      .single();

    const { data: allFoods } = await supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly')
      .eq('is_active', true);

    const foodCatalog: NutritionFoodReference[] = allFoods || [];

    // 3. Dietary & Environmental Classification
    const combinedDiet = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isVegan = combinedDiet.includes('vegan');
    const isNonVeg = !isVegan && (combinedDiet.includes('non') || combinedDiet.includes('meat') || combinedDiet.includes('chicken') || combinedDiet.includes('fish'));
    const isEggetarian = !isVegan && !isNonVeg && (combinedDiet.includes('egg') || combinedDiet.includes('eggetarian'));
    const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;

    const dietLabel = isVegan
      ? 'Vegan (100% Plant-Based: Zero dairy, Zero eggs, Zero meat/fish)'
      : isVegetarian
      ? 'Vegetarian (Lacto-Vegetarian: Plant foods + Paneer/Curd/Milk. Zero eggs, Zero meat/fish)'
      : isEggetarian
      ? 'Eggetarian (Plant foods + Farm Boiled Eggs/Egg Bhurji/Egg Curry + Paneer/Curd. Strictly ZERO chicken, fish, or meat)'
      : 'Non-Vegetarian (Whole foods + Chicken, Fish, Eggs, Paneer, Curd, Grains, Legumes)';

    const rawEnv = (profile?.food_environment || 'PG').toLowerCase();
    const isPG = rawEnv === 'pg' || rawEnv === 'hostel';
    const isCoreProvided = isPG || rawEnv === 'home' || rawEnv === 'office/canteen';
    const budgetStr = profile?.nutrition_budget || '₹1,000–2,000';

    const mealsPerDay = profile?.meals_per_day || '3 meals';
    let mealSlots: string[];
    if (mealsPerDay === '2 meals') {
      mealSlots = ['lunch', 'dinner'];
    } else if (mealsPerDay === '3 meals') {
      mealSlots = ['breakfast', 'lunch', 'dinner'];
    } else if (mealsPerDay === '5+ meals') {
      mealSlots = ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'];
    } else {
      mealSlots = ['breakfast', 'lunch', 'pre_workout', 'dinner'];
    }

    const slotPercentages: Record<string, number> = {
      breakfast: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.20 : (mealsPerDay === '2 meals' ? 0.0 : 0.25)),
      lunch: mealsPerDay === '3 meals' ? 0.40 : (mealsPerDay === '5+ meals' ? 0.30 : (mealsPerDay === '2 meals' ? 0.55 : 0.35)),
      pre_workout: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      snack: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      post_workout: 0.13,
      dinner: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.25 : (mealsPerDay === '2 meals' ? 0.45 : 0.25)),
    };

    // 4. Construct High-Precision Groq Prompt
    const systemPrompt = `You are Luna AI, an elite Indian sports and clinical dietitian.
Your mission is to generate a comprehensive 7-Day Precision Master Meal Plan (Day 1 through Day 7) designed to repeat across a 30-day month.

CRITICAL USER PROFILE & STRICT CONSTRAINTS:
1. DIET CATEGORY: ${dietLabel}
   - You MUST STRICTLY respect this diet.
   ${isEggetarian ? '- For Eggetarian: Include Boiled Eggs, Egg Bhurji, Egg Curry, Curd, Paneer, Dals, Chana, Rajma. NEVER EVER include chicken, fish, mutton, or meat.' : ''}
   ${isVegan ? '- For Vegan: 100% plant foods only (Soy Chunks, Rajma, Chana, Dal Tadka, Roasted Peanuts, Fruits, Phulkas, Rice). NEVER include curd, milk, paneer, butter, ghee, eggs, or meat.' : ''}
   ${isVegetarian ? '- For Vegetarian: Plant foods and dairy (Paneer, Curd, Milk, Dals, Chana, Rajma). NEVER include eggs, chicken, fish, or meat.' : ''}
   ${isNonVeg ? '- For Non-Vegetarian: Include Chicken Breast, Fish Curry, Chicken Curry, Eggs, Paneer, Curd, Dal, Rice.' : ''}

2. LIVING ENVIRONMENT: ${profile?.food_environment || 'PG'}
   ${isPG ? '- In a PG/Hostel, core meals (rice, dal, chapati, seasonal sabzi) are provided by the mess.\n- Add high-protein hacks (boiled eggs via kettle, egg bhurji on tawa, curd, roasted peanuts, soy chunks) that fit within their monthly budget.' : '- Home environment with access to regular home cooking.'}

3. MEALS PER DAY: Exactly these meal slots: ${mealSlots.join(', ')}.

4. TARGET DAILY MACROS TO HIT:
   - Daily Calories: ${targets.calories} kcal
   - Daily Protein: ${targets.protein} g
   - Daily Carbs: ${targets.carbs} g
   - Daily Fat: ${targets.fat} g
   (Distribute proportionally across the ${mealSlots.length} meals so each day totals approximately ${targets.calories} kcal and ${targets.protein}g protein).

5. ALLERGIES & DISLIKES:
   - Allergies: ${profile?.food_allergies || 'None'}
   - Disliked / Avoided: ${[profile?.foods_disliked, profile?.foods_avoided].filter(Boolean).join(', ') || 'None'}

Return ONLY valid JSON matching this schema:
{
  "plan_summary": "7-Day Personalized Luna AI Master Plan",
  "days": [
    {
      "day_number": 1,
      "meals": [
        {
          "meal_type": "breakfast",
          "name": "Title of the meal (e.g. Desi Egg Bhurji with Warm Phulkas)",
          "prep_instruction": "Short, practical kitchen or kettle hack tip suited for ${profile?.food_environment || 'PG'}",
          "items": [
            { "name": "Exact whole food name", "quantity": 1, "serving_size": "portion e.g. 2 large, 2 medium, 1 bowl" }
          ]
        }
      ]
    }
  ]
}`;

    const userPrompt = `Generate the 7-day personalized master plan for:
Diet: ${profile?.diet_preference || profile?.food_type || 'Eggetarian'}
Environment: ${profile?.food_environment || 'PG'}
Budget: ${budgetStr}
Meals per day: ${mealsPerDay} (${mealSlots.join(', ')})
Targets: ${targets.calories} kcal, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fat}g fat.`;

    // 5. Execute AI Generation with Groq
    let aiPlan: LunaAIGenerationResult | null = null;
    try {
      aiPlan = await generateAIResponseJSON<LunaAIGenerationResult>({
        systemPrompt,
        userPrompt,
        model: "primary",
        maxTokens: 3500,
        temperature: 0.3
      });
    } catch (groqErr: any) {
      console.warn("[Luna AI] Primary Groq call failed, attempting fallback to fast model:", groqErr?.message);
      try {
        aiPlan = await generateAIResponseJSON<LunaAIGenerationResult>({
          systemPrompt,
          userPrompt,
          model: "fast",
          maxTokens: 3500,
          temperature: 0.3
        });
      } catch (fallbackErr: any) {
        await this.logUsage(userId, 'failed_groq_generation', 'groq', undefined);
        throw new Error(`Luna AI was unable to generate your plan: ${fallbackErr?.message || groqErr?.message}`);
      }
    }

    if (!aiPlan || !Array.isArray(aiPlan.days) || aiPlan.days.length === 0) {
      await this.logUsage(userId, 'failed_empty_days', 'groq');
      throw new Error("Luna AI returned an incomplete plan format. Please try again.");
    }

    // 6. Build Master Day Schedules with Verified Nutrition Math
    const daySchedules = aiPlan.days.map((d, dIdx) => {
      const meals = d.meals.map(m => {
        const mType = m.meal_type.toLowerCase();
        const slotPct = slotPercentages[mType] ?? (1 / mealSlots.length);
        const slotTargetCals = Math.round(targets.calories * slotPct);
        const slotTargetPro = Number((targets.protein * slotPct).toFixed(1));

        // Sanitize title
        const cleanedTitle = sanitizeMealTitle(m.name, isVegan, isVegetarian, isEggetarian);

        // Map food items
        const rawItems = Array.isArray(m.items) && m.items.length > 0 ? m.items : [{ name: cleanedTitle, quantity: 1, serving_size: '1 serving' }];

        const processedItems = rawItems.map(item => {
          let fName = sanitizeAIItemName(item.name, isVegan, isVegetarian, isEggetarian);
          const ref = findFoodReference(fName, foodCatalog, profile?.food_environment);

          const qty = Number(item.quantity) || 1;
          const sSize = item.serving_size || ref?.serving_size || '1 serving';

          const defCals = fName.toLowerCase().includes('egg') ? 78 : (fName.toLowerCase().includes('banana') ? 105 : 150);
          const defPro = fName.toLowerCase().includes('egg') ? 6.3 : 5;

          const baseCals = Math.round(Number(ref?.calories || defCals) * qty);
          const basePro = Number((Number(ref?.protein || defPro) * qty).toFixed(1));
          const baseCarbs = Number((Number(ref?.carbs || 15) * qty).toFixed(1));
          const baseFat = Number((Number(ref?.fat || 3) * qty).toFixed(1));
          const isItemCore = isCoreProvided && (
            ref?.name?.includes("Provided Core") ||
            ref?.name?.includes("Core Meal") ||
            /\b(?:pg|hostel|mess|provided core|provided meal|core meal)\b/i.test(fName)
          );
          const baseCost = isItemCore ? 0 : Math.round(Number(ref?.estimated_cost || 20) * qty);

          return {
            food_id: ref?.id,
            name: ref?.name || fName,
            serving_size: sSize,
            quantity: qty,
            calories: baseCals,
            protein: basePro,
            carbs: baseCarbs,
            fat: baseFat,
            estimated_cost: baseCost,
            isItemCore
          };
        });

        // Compute total meal macros
        const mealTotals = processedItems.reduce((acc, it) => ({
          calories: acc.calories + it.calories,
          protein: Number((acc.protein + it.protein).toFixed(1)),
          carbs: Number((acc.carbs + it.carbs).toFixed(1)),
          fat: Number((acc.fat + it.fat).toFixed(1)),
          cost: acc.cost + it.estimated_cost
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });

        return {
          meal_type: mType,
          name: cleanedTitle,
          prep_instructions: m.prep_instruction || NutritionService.getPrepInstructionForSlot(mType, cleanedTitle, dIdx, profile?.food_environment, combinedDiet),
          calories: mealTotals.calories || slotTargetCals,
          protein: mealTotals.protein || slotTargetPro,
          carbs: mealTotals.carbs,
          fat: mealTotals.fat,
          estimated_cost: mealTotals.cost,
          items: processedItems
        };
      });

      return {
        day_number: d.day_number || (dIdx + 1),
        meals
      };
    });

    // 7. Populate 30 Days of Meal Plans in Supabase (Starting from localDate)
    const startDate = new Date(`${localDate}T12:00:00.000Z`);
    const numDaysToGenerate = 30;

    const allDates: string[] = [];
    for (let i = 0; i < numDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }

    // Clean up existing meal plans in this 30-day window
    await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', userId)
      .in('date', allDates);

    // Prepare batch rows for meal_plans (1 row per date to respect UNIQUE(user_id, date))
    const mealPlansRows: any[] = [];
    const itemsByDate = new Map<string, any[]>();

    allDates.forEach((dateStr, dateIdx) => {
      const daySchedule = daySchedules[dateIdx % daySchedules.length];

      let dayCals = 0;
      let dayPro = 0;
      let dayCarbs = 0;
      let dayFat = 0;
      let dayCost = 0;
      const allDayItems: any[] = [];

      daySchedule.meals.forEach((m) => {
        dayCals += m.calories;
        dayPro += m.protein;
        dayCarbs += m.carbs;
        dayFat += m.fat;
        dayCost += m.estimated_cost;

        m.items.forEach(it => {
          allDayItems.push({
            ...it,
            meal_type: m.meal_type,
            meal_name: m.name
          });
        });
      });

      mealPlansRows.push({
        user_id: userId,
        date: dateStr,
        meal_type: 'daily',
        name: 'Daily Luna AI Nutrition Plan',
        calories: dayCals,
        protein: Number(dayPro.toFixed(1)),
        carbs: Number(dayCarbs.toFixed(1)),
        fat: Number(dayFat.toFixed(1)),
        estimated_cost: dayCost,
        ai_generated: true
      });

      itemsByDate.set(dateStr, allDayItems);
    });

    // Batch insert meal_plans (exactly 1 row per date = 30 rows total, 0 unique constraint collisions)
    const { data: insertedMealPlans, error: insertPlansError } = await supabase
      .from('meal_plans')
      .insert(mealPlansRows)
      .select('id, date, meal_type');

    if (insertPlansError || !insertedMealPlans) {
      console.error("[Luna AI] Error inserting meal_plans:", insertPlansError);
      await this.logUsage(userId, 'failed_db_insert', 'groq');
      throw new Error(`Failed to save your meal plans to database: ${insertPlansError?.message || 'Database write error'}`);
    }

    // Prepare meal_plan_items linking to the inserted meal plan IDs
    const defaultFoodId = foodCatalog[0]?.id;
    const mealPlanItemsRows: any[] = [];
    insertedMealPlans.forEach(plan => {
      const items = itemsByDate.get(plan.date) || [];

      items.forEach(it => {
        const resolvedFoodId = it.food_id || defaultFoodId;
        if (resolvedFoodId) {
          mealPlanItemsRows.push({
            meal_plan_id: plan.id,
            food_id: resolvedFoodId,
            quantity: it.quantity || 1,
            serving_size: `${it.meal_type}::${it.meal_name}::${it.serving_size || '1 serving'}`
          });
        }
      });
    });

    if (mealPlanItemsRows.length > 0) {
      const chunkSize = 100;
      for (let c = 0; c < mealPlanItemsRows.length; c += chunkSize) {
        const chunk = mealPlanItemsRows.slice(c, c + chunkSize);
        const { error: chunkErr } = await supabase
          .from('meal_plan_items')
          .insert(chunk);

        if (chunkErr) {
          console.warn("[Luna AI] Warning inserting meal_plan_items chunk:", chunkErr.message);
        }
      }
    }

    // 8. Update Daily Summary for Today & Log Success
    await this.logUsage(userId, 'success', 'groq');
    await NutritionService.updateDailySummary(userId);

    return {
      success: true,
      daysGenerated: numDaysToGenerate,
      summary: aiPlan.plan_summary || "Luna AI 30-Day Personalized Master Plan",
      message: `Luna AI has generated a customized 30-day diet plan tailored to your ${profile?.diet_preference || 'Eggetarian'} diet and ${profile?.food_environment || 'PG'} environment.`
    };
  }
}
