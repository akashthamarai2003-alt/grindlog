import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import {
  NutritionService,
  findFoodReference,
  sanitizeAIItemName,
  sanitizeMealTitle,
  isStapleCoreFood,
  getRealisticFoodCost,
  calibrateMealsToTargets,
  NutritionFoodReference,
  invalidateNutritionServerCache
} from "@/lib/services/nutrition/nutrition-service";
import { buildNutritionUserContext } from "@/lib/fitness/nutrition/user-context";
import { NutritionValidationEngine } from "@/lib/fitness/nutrition/validation-engine";

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

    // 1. Weekly Rate Limiting Check (1 per week, max 4 per month)
    const eligibility = await NutritionService.getWeeklyPlanEligibility(userId);
    if (!eligibility.can_generate) {
      throw new Error(eligibility.message || "Weekly limit reached. You can generate 1 meal plan per week (max 4 per month).");
    }

    // 2. Gather User Context & Catalog
    const targets = await NutritionService.getEffectiveTargets(userId);
    if (!targets) throw new Error("TARGET_NOT_FOUND");

    const { data: profile } = await supabase
      .from('fitness_os_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: allFoods } = await supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly')
      .eq('is_active', true);

    const foodCatalog: NutritionFoodReference[] = allFoods || [];

    // 3. Normalized User Context & Classifications
    const userContext = buildNutritionUserContext(profile, targets, userId);
    const combinedDiet = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isVegan = userContext.diet === 'vegan';
    const isNonVeg = userContext.diet === 'non_vegetarian';
    const isEggetarian = userContext.diet === 'eggetarian';
    const isVegetarian = userContext.diet === 'vegetarian';

    const mealSlots = userContext.mealSlots;
    const mealsPerDay = userContext.mealsPerDay;
    const slotPercentages = userContext.slotRatios;

    const availableFoodsStr = userContext.availableFoods.length > 0
      ? userContext.availableFoods.join(', ')
      : 'Standard local Indian whole foods (Eggs, Paneer, Curd, Dals, Chana, Rajma, Tofu, Peanuts, Rice, Roti, Oats, Bananas)';

    // 4. Construct High-Precision Groq Prompt
    const systemPrompt = `You are Luna AI, an elite Indian sports and clinical dietitian.
Your mission is to generate a comprehensive 7-Day Precision Weekly Meal Plan (Day 1 through Day 7) specifically tailored to the user's macros, budget, and lifestyle.

CRITICAL USER PROFILE & STRICT CONSTRAINTS:
1. DIET CATEGORY: ${userContext.dietLabel}
   - You MUST STRICTLY respect this diet.
   ${isEggetarian ? '- For Eggetarian: Include Boiled Eggs, Egg Bhurji, Egg Curry, Curd, Paneer, Dals, Chana, Rajma. NEVER EVER include chicken, fish, mutton, or meat.' : ''}
   ${isVegan ? '- For Vegan: 100% plant foods only (Tofu, Rajma, Chana, Dal Tadka, Roasted Peanuts, Fruits, Phulkas, Rice, Soya Chunks). NEVER include curd, milk, paneer, butter, ghee, eggs, or meat.' : ''}
   ${isVegetarian ? '- For Vegetarian: Plant foods and dairy (Paneer, Curd, Milk, Dals, Chana, Rajma). NEVER include eggs, chicken, fish, or meat.' : ''}
   ${isNonVeg ? '- For Non-Vegetarian: Include Chicken Breast, Fish Curry, Chicken Curry, Eggs, Paneer, Curd, Dal, Rice.' : ''}

2. LIVING ENVIRONMENT & REAL-WORLD FLOW: ${userContext.environment.toUpperCase()}
   ${
     userContext.environment === 'pg' || userContext.environment === 'hostel'
       ? '- PG / HOSTEL LIVING: The mess provides core meals (Breakfast: Poha, Upma, Idli & Sambar, Dosa, Bread; Lunch & Dinner: White Rice, Dal Tadka, Seasonal Sabzi, Chapatis) for free (₹0).\n' +
         '- The user CANNOT cook elaborate curries from scratch. You MUST pair the standard mess meal with practical high-protein add-ons (e.g. 2–3 boiled eggs cooked in electric kettle, fresh curd, roasted peanuts, soy chunks boiled in kettle, paneer).\n' +
         '- Example Breakfast: "Poha (1 bowl, Mess Base) + 3 Boiled Eggs (Kettle Add-on)".\n' +
         '- Example Lunch: "White Rice (2 bowls) + Dal Tadka (1 bowl) + Mixed Veggies (1 bowl) + 2 Boiled Eggs or Paneer (Add-on)".'
       : userContext.environment === 'i_cook'
       ? '- SELF-COOKED / I COOK: The user personally buys groceries and cooks all meals from scratch in their kitchen.\n' +
         '- Plan complete, delicious, easy-to-cook whole-food recipes with simple ingredients and step-by-step cooking instructions (e.g., "10 min prep: Sauté onions, scramble 3 eggs, toast bread").'
       : '- HOME LIVING: Family kitchen prepares everyday meals (phulkas, dal, steamed rice, seasonal sabzi). Pair family meals with simple fitness protein boosters (e.g., 3 boiled eggs or egg scramble on stove, paneer bowl, fresh curd).'
   }

3. USER'S ACCESSIBLE FOODS:
   - Foods available to user: ${availableFoodsStr}
   - Prioritize these accessible foods when building meals.

4. PROTEIN ROTATION & VARIETY (STRICT RULES):
   - Soya Chunks MUST NEVER appear more than 1 time per day. NEVER include Soya Chunks in both lunch and dinner on the same day.
   - Cycle diverse protein sources across meals and days:
     * Vegetarians: Paneer, Curd/Dahi, Moong Dal, Chana/Chole, Rajma, Sprouts, Milk.
     * Vegans: Tofu, Moong Sprouts, Kala Chana, Rajma, Soya Chunks (max 1 serving/day), Roasted Peanuts, Dal.
     * Eggetarians: Farm Boiled Eggs, Egg Whites, Egg Bhurji, Egg Curry, Paneer, Curd, Dals, Sprouts.
     * Non-Vegetarians: Chicken Breast, Fish, Eggs, Paneer, Curd, Dals.
   - Every single day must feature protein variety, never repetitive meals.

5. MEALS PER DAY: Exactly these meal slots: ${mealSlots.join(', ')}.

6. TARGET DAILY MACROS TO HIT:
   - Daily Calories: ${targets.calories} kcal
   - Daily Protein: ${targets.protein} g
   - Daily Carbs: ${targets.carbs} g
   - Daily Fat: ${targets.fat} g
   (Distribute proportionally across the ${mealSlots.length} meals so each day totals approximately ${targets.calories} kcal and ${targets.protein}g protein).

7. ALLERGIES & DISLIKES:
   - Allergies: ${userContext.allergies.join(', ') || 'None'}
   - Disliked / Avoided: ${[...userContext.dislikedFoods, ...userContext.avoidedFoods].join(', ') || 'None'}

8. BUDGET GUIDANCE:
   - Daily out-of-pocket target: ~₹${userContext.dailyBudget}/day for fitness add-ons (Staples like mess rice/dal are ₹0).

9. STRICT SERVING QUANTITY & CALORIE RULES:
   - "quantity" MUST be a small portion count (e.g. 1, 2, or 3). NEVER output grams, milliliters, or numbers >= 5 as "quantity"! (e.g. for 100g paneer, quantity is 1 and serving_size is "100g". For 250ml milk, quantity is 1 and serving_size is "1 glass (250ml)").
   - "serving_size": Describe the single unit cleanly (e.g. "large", "piece", "bowl (150g)", "cup (200ml)"). NEVER prefix with "1 " if quantity > 1 (e.g., for 3 eggs: quantity: 3, serving_size: "large (50g)" or "large eggs").
   - TARGET CALORIES PER MEAL: Distribute total daily calories (${targets.calories} kcal) realistically:
     * Breakfast: ~${Math.round(targets.calories * (slotPercentages['breakfast'] || 0.28))} kcal, ~${Math.round(targets.protein * (slotPercentages['breakfast'] || 0.28))}g protein
     * Lunch: ~${Math.round(targets.calories * (slotPercentages['lunch'] || 0.38))} kcal, ~${Math.round(targets.protein * (slotPercentages['lunch'] || 0.38))}g protein
     * Dinner: ~${Math.round(targets.calories * (slotPercentages['dinner'] || 0.34))} kcal, ~${Math.round(targets.protein * (slotPercentages['dinner'] || 0.34))}g protein
   - Items in each meal MUST sum up to approximately that meal's target calories. Do NOT over-pack meals.
   - Do NOT repeat the exact same food item multiple times in one meal.

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
          "prep_instruction": "Short, practical kitchen or kettle hack tip suited for ${userContext.environment}",
          "items": [
            { "name": "Exact whole food name", "quantity": 1, "serving_size": "portion e.g. 2 large, 2 medium, 1 bowl, 100g" }
          ]
        }
      ]
    }
  ]
}`;

    const userPrompt = `Generate the 7-day personalized master plan for:
Diet: ${userContext.dietLabel}
Environment: ${userContext.environment}
Available Foods: ${availableFoodsStr}
Budget: ${userContext.budgetStr} (~₹${userContext.dailyBudget}/day)
Meals per day: ${mealsPerDay} (${mealSlots.join(', ')})
Targets: ${targets.calories} kcal, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fat}g fat.`;

    // 5. Execute AI Generation with Groq (with graceful deterministic fallback)
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
        console.warn("[Luna AI] Groq fallback also failed, activating deterministic 7-day plan fallback:", fallbackErr?.message);
        await this.logUsage(userId, 'fallback_deterministic_generation', 'deterministic', undefined);
      }
    }

    if (!aiPlan || !Array.isArray(aiPlan.days) || aiPlan.days.length === 0) {
      console.info("[Luna AI] Generating high-precision deterministic 7-day plan fallback for user:", userId);
      aiPlan = {
        plan_summary: "7-Day Precision Personalized Plan",
        days: Array.from({ length: 7 }, (_, dIdx) => {
          const fallbackStartDate = new Date(`${localDate}T12:00:00.000Z`);
          const rotatingMap = NutritionService.getRotatingMealPlanForDay((fallbackStartDate.getDay() + dIdx) % 7, profile, targets, foodCatalog);
          const dayMeals = mealSlots.map(slot => rotatingMap.get(slot) || rotatingMap.get('lunch')).filter(Boolean);
          return {
            day_number: dIdx + 1,
            meals: dayMeals.map(m => ({
              meal_type: m.meal_type || 'meal',
              name: m.name || 'Personalized Meal',
              prep_instruction: m.prep_instructions || '',
              items: (m.items || m.meal_plan_items || []).map((it: any) => ({
                name: it.foods?.name || it.name,
                quantity: it.quantity || 1,
                serving_size: it.foods?.serving_size || it.serving_size || '1 serving'
              }))
            }))
          };
        })
      };
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
          const isItemCore = isStapleCoreFood(fName, profile?.food_environment);
          const unitCost = isItemCore ? 0 : getRealisticFoodCost(fName, Number(ref?.estimated_cost));
          const baseCost = isItemCore ? 0 : Math.round(unitCost * qty);

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
              it.quantity = Math.max(0.2, Number(((it.quantity || 1) * scaleFactor).toFixed(1)));
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

      // Calibrate meals strictly against the user's targets and budget before saving
      const calibratedDayMeals = calibrateMealsToTargets(meals, targets, profile);

      // Validate each meal item against diet, allergens, and dislikes (Fix #2: was imported but never called)
      for (const meal of calibratedDayMeals) {
        const itemsArr = meal.meal_plan_items || meal.items || [];
        const validItems = itemsArr.filter((item: any) => {
          const foodName = item.foods?.name || item.name || '';
          // Diet check
          const dietResult = NutritionValidationEngine.validateDiet(foodName, userContext.diet);
          if (!dietResult.valid) return false;
          // Allergen/dislike check
          const allergyResult = NutritionValidationEngine.validateAllergiesAndDislikes(
            foodName, userContext.allergies, userContext.dislikedFoods, userContext.avoidedFoods
          );
          if (!allergyResult.valid) return false;
          return true;
        });
        meal.meal_plan_items = validItems;
        meal.items = validItems;
      }

      return {
        day_number: d.day_number || (dIdx + 1),
        meals: calibratedDayMeals
      };
    });

    // 7. Populate 7 Days of Weekly Meal Plans in Supabase (Starting from localDate)
    const startDate = new Date(`${localDate}T12:00:00.000Z`);
    const numDaysToGenerate = 7;

    const allDates: string[] = [];
    for (let i = 0; i < numDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }

    // Clean up existing meal plans in this 7-day window
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

        const mItems = m.items || m.meal_plan_items || [];
        mItems.forEach((it: any) => {
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
        const isValidUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
        const rawId = it.food_id || it.foods?.id;
        const resolvedFoodId = (rawId && isValidUUID(rawId))
          ? rawId
          : (findFallbackFood(it.name)?.id || foodCatalog.find(f => f.name.toLowerCase().includes((it.name || '').toLowerCase().split(' ')[0]))?.id || foodCatalog[0]?.id);
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

    // 8. Synchronize Smart Grocery List from Active Meal Plans
    try {
      await NutritionService.syncGroceryListFromMealPlans(userId);
    } catch (gErr: any) {
      console.warn("[Luna AI] Non-blocking grocery sync notice:", gErr?.message);
    }

    // 8b. Synchronize Day 1 meals to fitness_os_workout_plans so Home Dashboard updates immediately
    try {
      const { data: activeWorkoutPlan } = await supabase
        .from('fitness_os_workout_plans')
        .select('id, plan_data')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeWorkoutPlan?.plan_data) {
        const day1 = daySchedules[0];
        const day1Meals = day1.meals.map((m: any, idx: number) => ({
          meal_name: m.name,
          meal_type: m.meal_type,
          time_of_day: idx === 0 ? "Morning" : idx === 1 ? "Midday" : idx === 2 ? "Evening" : "Night",
          items: m.items.map((it: any) => `${it.quantity > 1 ? `${it.quantity}x ` : ""}${it.name}`),
          total_calories: m.calories,
          protein_grams: m.protein,
          carbs_grams: m.carbs,
          fat_grams: m.fat,
          prep_instructions: m.prep_instructions || `Prepared fresh according to your ${profile?.diet_preference || 'diet'} targets.`,
          meal_plan_items: m.items
        }));

        const currentPlanData = activeWorkoutPlan.plan_data as any;
        const updatedPlanData = {
          ...currentPlanData,
          nutrition: {
            ...(currentPlanData.nutrition || {}),
            daily_calories: targets.calories,
            protein_grams: targets.protein,
            carbs_grams: targets.carbs,
            fat_grams: targets.fat,
            meals: day1Meals,
          },
          _nutritionUpgrade: {
            status: "complete",
            generated_at: new Date().toISOString(),
          }
        };

        await supabase
          .from('fitness_os_workout_plans')
          .update({ plan_data: updatedPlanData })
          .eq('id', activeWorkoutPlan.id);
      }
    } catch (wpErr) {
      console.warn("[Luna AI] Notice updating workout plan nutrition meals:", wpErr);
    }

    // Invalidate server cache so Home Dashboard and Nutrition screens reload immediately
    invalidateNutritionServerCache(userId);

    // 9. Update Daily Summary for Today & Log Success
    await this.logUsage(userId, 'success', 'groq');
    await NutritionService.updateDailySummary(userId);

    return {
      success: true,
      daysGenerated: numDaysToGenerate,
      summary: aiPlan.plan_summary || "Luna AI 7-Day Personalized Weekly Plan",
      message: `Luna AI has generated your customized 7-day weekly diet plan tailored to your ${profile?.diet_preference || 'Eggetarian'} diet and ${profile?.food_environment || 'PG'} environment.`
    };
  }
}
