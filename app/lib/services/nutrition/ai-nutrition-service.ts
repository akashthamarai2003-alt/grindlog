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

6. STRICT SERVING QUANTITY & CALORIE RULES:
   - "quantity" MUST be a small portion count (e.g. 1, 2, or 3). NEVER output grams, milliliters, or numbers >= 5 as "quantity"! (e.g. for 100g paneer, quantity is 1 and serving_size is "100g". For 250ml milk, quantity is 1 and serving_size is "1 glass (250ml)").
   - TARGET CALORIES PER MEAL: Distribute total daily calories (${targets.calories} kcal) realistically:
     * Breakfast: ~${Math.round(targets.calories * (slotPercentages['breakfast'] || 0.30))} kcal, ~${Math.round(targets.protein * (slotPercentages['breakfast'] || 0.30))}g protein
     * Lunch: ~${Math.round(targets.calories * (slotPercentages['lunch'] || 0.40))} kcal, ~${Math.round(targets.protein * (slotPercentages['lunch'] || 0.40))}g protein
     * Dinner: ~${Math.round(targets.calories * (slotPercentages['dinner'] || 0.30))} kcal, ~${Math.round(targets.protein * (slotPercentages['dinner'] || 0.30))}g protein
   - Items in each meal MUST sum up to approximately that meal's target calories. Do NOT over-pack meals.
   - Do NOT repeat the exact same food item multiple times in one meal (e.g. never list milk twice in one meal).

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
            { "name": "Exact whole food name", "quantity": 1, "serving_size": "portion e.g. 2 large, 2 medium, 1 bowl, 100g" }
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

    // Helper: Category-aware fallback food resolution
    const findFallbackFood = (fName: string): NutritionFoodReference | undefined => {
      const lower = (fName || '').toLowerCase();
      if (lower.includes('egg') || lower.includes('omelette') || lower.includes('bhurji')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('boiled egg') || f.name.toLowerCase().includes('egg'));
      }
      if (lower.includes('paneer') || lower.includes('cottage cheese')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('paneer'));
      }
      if (lower.includes('bread') || lower.includes('toast')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('bread'));
      }
      if (lower.includes('roti') || lower.includes('chapati') || lower.includes('phulka')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('chapati'));
      }
      if (lower.includes('rice') || lower.includes('pulao') || lower.includes('biryani')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('white rice') || f.name.toLowerCase().includes('rice'));
      }
      if (lower.includes('dal') || lower.includes('sambar') || lower.includes('curry') || lower.includes('chana') || lower.includes('rajma') || lower.includes('lentil')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('dal') || f.name.toLowerCase().includes('curry'));
      }
      if (lower.includes('curd') || lower.includes('dahi') || lower.includes('yogurt') || lower.includes('raita')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('curd') || f.name.toLowerCase().includes('dahi'));
      }
      if (lower.includes('soya') || lower.includes('soy')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('soya') || f.name.toLowerCase().includes('soy'));
      }
      if (lower.includes('milk') || lower.includes('chaas') || lower.includes('lassi')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('milk'));
      }
      if (lower.includes('banana') || lower.includes('apple') || lower.includes('fruit')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('banana') || f.name.toLowerCase().includes('apple'));
      }
      if (lower.includes('peanut') || lower.includes('almond') || lower.includes('nut')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('peanut'));
      }
      if (lower.includes('chicken')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('chicken'));
      }
      if (lower.includes('fish')) {
        return foodCatalog.find(f => f.name.toLowerCase().includes('fish'));
      }
      return foodCatalog.find(f => f.name.toLowerCase().includes('chapati') || f.name.toLowerCase().includes('rice')) || foodCatalog[0];
    };

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
          let ref = findFoodReference(fName, foodCatalog, profile?.food_environment);
          if (!ref) {
            ref = findFallbackFood(fName);
          }

          let qty = Number(item.quantity) || 1;
          const rawServing = String(item.serving_size || '').toLowerCase();
          // Guard against AI returning grams/ml as quantity (e.g. quantity: 100, serving_size: "grams")
          if (qty >= 10 || rawServing.includes('gram') || rawServing === 'g' || rawServing.includes('ml')) {
            if (ref?.serving_size) {
              const numInRef = Number(ref.serving_size.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)/i)?.[1]);
              if (numInRef && numInRef > 0 && qty >= 10) {
                qty = Math.max(0.5, Math.min(3, Number((qty / numInRef).toFixed(1))));
              } else {
                qty = 1;
              }
            } else {
              qty = 1;
            }
          }
          qty = Math.min(4, Math.max(0.25, qty));

          const sSize = (item.serving_size && !['grams', 'g', 'ml'].includes(rawServing))
            ? item.serving_size
            : (ref?.serving_size || '1 serving');

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

        // Deduplicate any repeated food references in the same meal
        const dedupedItems: typeof processedItems = [];
        const seenFoodKeys = new Set<string>();
        processedItems.forEach(it => {
          const key = it.food_id || it.name.toLowerCase();
          if (seenFoodKeys.has(key)) {
            const existing = dedupedItems.find(e => (e.food_id || e.name.toLowerCase()) === key);
            if (existing) {
              existing.quantity = Math.min(3, existing.quantity + it.quantity);
              existing.calories += it.calories;
              existing.protein = Number((existing.protein + it.protein).toFixed(1));
              existing.carbs = Number((existing.carbs + it.carbs).toFixed(1));
              existing.fat = Number((existing.fat + it.fat).toFixed(1));
            }
          } else {
            seenFoodKeys.add(key);
            dedupedItems.push({ ...it });
          }
        });

        // Compute total meal macros
        let mealCals = dedupedItems.reduce((sum, it) => sum + it.calories, 0);

        // Scale non-discrete items proportionally if meal calories deviate from slot target by > 15%
        if (mealCals > 0 && Math.abs(mealCals - slotTargetCals) > (slotTargetCals * 0.15)) {
          const scaleFactor = Math.max(0.4, Math.min(1.8, slotTargetCals / mealCals));
          dedupedItems.forEach(it => {
            const isDiscrete = /(?:egg|banana|apple)/i.test(it.name);
            if (!isDiscrete) {
              it.calories = Math.round(it.calories * scaleFactor);
              it.protein = Number((it.protein * scaleFactor).toFixed(1));
              it.carbs = Number((it.carbs * scaleFactor).toFixed(1));
              it.fat = Number((it.fat * scaleFactor).toFixed(1));
              it.estimated_cost = Math.round(it.estimated_cost * scaleFactor);
            }
          });
        }

        const finalMealCals = dedupedItems.reduce((sum, it) => sum + it.calories, 0);
        const finalMealPro = Number(dedupedItems.reduce((sum, it) => sum + it.protein, 0).toFixed(1));
        const finalMealCarbs = Number(dedupedItems.reduce((sum, it) => sum + it.carbs, 0).toFixed(1));
        const finalMealFat = Number(dedupedItems.reduce((sum, it) => sum + it.fat, 0).toFixed(1));
        const finalMealCost = dedupedItems.reduce((sum, it) => sum + it.estimated_cost, 0);

        return {
          meal_type: mType,
          name: cleanedTitle,
          prep_instructions: m.prep_instruction || NutritionService.getPrepInstructionForSlot(mType, cleanedTitle, dIdx, profile?.food_environment, combinedDiet),
          calories: finalMealCals || slotTargetCals,
          protein: finalMealPro || slotTargetPro,
          carbs: finalMealCarbs,
          fat: finalMealFat,
          estimated_cost: finalMealCost,
          items: dedupedItems
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
    const mealPlanItemsRows: any[] = [];
    insertedMealPlans.forEach(plan => {
      const items = itemsByDate.get(plan.date) || [];

      items.forEach(it => {
        const resolvedFoodId = it.food_id || findFallbackFood(it.name)?.id || foodCatalog[0]?.id;
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
