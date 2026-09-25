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
  option_b_name?: string;
  option_b_prep_instruction?: string;
  option_b_items?: RawAIMealItem[];
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

    if (!profile || !Number.isFinite(Number(profile.age)) || Number(profile.age) < 1 || Number(profile.age) > 120 ||
        !Number.isFinite(Number(profile.height)) || Number(profile.height) < 50 || Number(profile.height) > 300 ||
        !Number.isFinite(Number(profile.weight)) || Number(profile.weight) < 20 || Number(profile.weight) > 500 ||
        !profile.nutrition_budget ||
        !profile.meals_per_day || !(profile.food_type || profile.diet_preference)) {
      throw new Error('PROFILE_INCOMPLETE: Complete your age, height, weight, diet, meal count, and food budget in Profile before generating a plan.');
    }
    if (Number(profile.age) < 18) {
      throw new Error('CLINICAL_REVIEW_REQUIRED: Automatic adult diet plans are not available for users under 18. Ask a qualified clinician or dietitian to review your nutrition needs.');
    }

    const { data: allFoods, error: catalogError } = await supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, allergens, plan_eligible, verification_status, nutrition_verified, dietary_classification_verified')
      .eq('is_active', true)
      .eq('plan_eligible', true)
      .eq('verification_status', 'approved_for_plans')
      .eq('nutrition_verified', true)
      .eq('dietary_classification_verified', true);

    if (catalogError) {
      throw new Error('Could not load the reviewed food catalog. Your saved plan was left unchanged.');
    }

    const foodCatalog: NutritionFoodReference[] = allFoods || [];

    // 3. Normalized User Context & Classifications
    const userContext = buildNutritionUserContext(profile, targets, userId);
    if (![targets.calories, targets.protein, targets.carbs, targets.fat].every(value => Number.isFinite(Number(value)) && Number(value) > 0)) {
      throw new Error('PROFILE_INCOMPLETE: Your daily nutrition targets are missing or invalid. Update your profile and targets before generating a plan.');
    }
    const unsupportedAllergy = userContext.allergies.find(allergy =>
      !NutritionValidationEngine.validateFoodAllergenTags('catalog food', [], [allergy]).valid
    );
    if (unsupportedAllergy) {
      throw new Error(`The allergy "${unsupportedAllergy}" needs a reviewed food list before a plan can be generated. Your saved plan was left unchanged.`);
    }
    const isAllowedFoodName = (name: string) =>
      NutritionValidationEngine.validateDiet(name, userContext.diet).valid &&
      NutritionValidationEngine.validateAllergiesAndDislikes(
        name, userContext.allergies, userContext.dislikedFoods, userContext.avoidedFoods
      ).valid;
    const isAllowedFoodReference = (food: NutritionFoodReference) => {
      const dietType = String(food.diet_type || '').toLowerCase().trim();
      const knownDietType = ['vegan', 'veg', 'vegetarian', 'eggetarian', 'non-veg', 'non_vegetarian', 'non vegetarian'].includes(dietType);
      const dietCompatible = (userContext.diet === 'non_vegetarian' && knownDietType) ||
        dietType === 'vegan' ||
        (userContext.diet === 'vegetarian' && ['veg', 'vegetarian'].includes(dietType)) ||
        (userContext.diet === 'eggetarian' && ['veg', 'vegetarian', 'eggetarian'].includes(dietType));
      return dietCompatible && isAllowedFoodName(food.name) &&
        NutritionValidationEngine.validateFoodAllergenTags(food.name, food.allergens, userContext.allergies).valid;
    };
    const safeFoodCatalog = foodCatalog.filter(isAllowedFoodReference);
    if (safeFoodCatalog.length === 0) {
      throw new Error("No reviewed catalog foods match your diet and allergy preferences. Your saved plan was left unchanged. Please review your nutrition profile or ask for a reviewed food list.");
    }
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
const systemPrompt = `You are Luna AI, a meal-planning assistant for general adult nutrition. Do not present yourself as a clinician or provide medical diet advice.
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
   - 100% NATURAL WHOLE FOODS ONLY: NEVER recommend or include whey protein, protein powders, mass gainers, creatine, BCAAs, or chemical pills. 100% of macros must come from real whole food (Farm Eggs, Paneer, Curd/Dahi, Dals, Chana, Rajma, Soya Chunks, Chicken, Fish, Tofu, Peanuts, Oats, Bananas).
   - DUAL-CHOICE ARCHITECTURE (OPTION A & OPTION B): Every single meal slot must provide Option A (Quick / Mess Base) and Option B (Variety / Cooked Alternative), matched to the same target calories and protein.

Return ONLY valid JSON matching this schema:
{
  "plan_summary": "7-Day Personalized Luna AI Master Plan",
  "days": [
    {
      "day_number": 1,
      "meals": [
        {
          "meal_type": "breakfast",
          "name": "Option A Title (e.g. Desi Egg Bhurji with Warm Phulkas)",
          "prep_instruction": "Short, practical kitchen or kettle hack tip suited for ${userContext.environment}",
          "items": [
            { "name": "Exact whole food name", "quantity": 1, "serving_size": "portion e.g. 2 large, 2 medium, 1 bowl, 100g" }
          ],
          "option_b_name": "Option B Title (e.g. Besan Paneer Chilla with Mint Chutney)",
          "option_b_prep_instruction": "Short kitchen or kettle tip for Option B",
          "option_b_items": [
            { "name": "Exact whole food name", "quantity": 1, "serving_size": "portion e.g. 2 pieces, 1 bowl, 100g" }
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
          const rotatingMap = NutritionService.getRotatingMealPlanForDay((fallbackStartDate.getUTCDay() + dIdx) % 7, profile, targets, safeFoodCatalog);
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
      return undefined;
    };

    // Safe whole-food substitution helper to ensure allergens and dietary violations are replaced with nutritious equivalents
    const getSafeSubstituteFood = (originalName: string, diet: string, allergies: string[]): string => {
      const orig = (originalName || '').toLowerCase();
      const isVeganDiet = diet === 'vegan';
      const isVegDiet = diet === 'vegetarian';
      const isEggDiet = diet === 'eggetarian';
      const hasEggAllergy = (allergies || []).some(a => a.toLowerCase().includes('egg'));
      const hasDairyAllergy = (allergies || []).some(a => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('milk') || a.toLowerCase().includes('lactose'));

      if (orig.includes('egg')) {
        if (hasEggAllergy || isVeganDiet) return 'Soy Chunks (Cooked)';
        if (isVegDiet) return hasDairyAllergy ? 'Soy Chunks (Cooked)' : 'Paneer Tikka';
        return hasDairyAllergy ? 'Soy Chunks (Cooked)' : 'Paneer Tikka';
      }
      if (orig.includes('paneer') || orig.includes('curd') || orig.includes('milk') || orig.includes('dahi') || orig.includes('cheese')) {
        if (hasDairyAllergy || isVeganDiet) return 'Soy Chunks (Cooked)';
        if (isEggDiet && !hasEggAllergy) return 'Boiled Egg';
        return 'Dal Tadka';
      }
      if (orig.includes('peanut')) {
        return 'Roasted Chana';
      }
      if (orig.includes('banana')) {
        return 'Apple';
      }
      if (orig.includes('chicken') || orig.includes('fish') || orig.includes('meat') || orig.includes('mutton') || orig.includes('prawn')) {
        if (isEggDiet && !hasEggAllergy) return 'Boiled Egg';
        if (!isVeganDiet && !hasDairyAllergy) return 'Paneer Tikka';
        return 'Soy Chunks (Cooked)';
      }
      if (orig.includes('soy') || orig.includes('soya')) {
        if (isEggDiet && !hasEggAllergy) return 'Boiled Egg';
        if (!isVeganDiet && !hasDairyAllergy) return 'Paneer Tikka';
        return 'Moong Dal';
      }
      return isVeganDiet ? 'Soy Chunks (Cooked)' : (isVegDiet ? 'Dal Tadka' : 'Boiled Egg');
    };

    // Reusable item mapper that validates, substitutes, and scales items
    const processItems = (
      rawItems: RawAIMealItem[],
      fallbackTitle: string,
      slotTargetCals: number
    ) => {
      const sourceItems = Array.isArray(rawItems) && rawItems.length > 0 
        ? rawItems 
        : [{ name: fallbackTitle, quantity: 1, serving_size: '1 serving' }];

      const mapped = sourceItems.map(item => {
        let fName = sanitizeAIItemName(item.name, isVegan, isVegetarian, isEggetarian);

        // Pre-calibration safe dietary and allergen check
        const allergyCheck = NutritionValidationEngine.validateAllergiesAndDislikes(
          fName, userContext.allergies, userContext.dislikedFoods, userContext.avoidedFoods
        );
        const dietCheck = NutritionValidationEngine.validateDiet(fName, userContext.diet);

        if (!allergyCheck.valid || !dietCheck.valid) {
          fName = getSafeSubstituteFood(fName, userContext.diet, userContext.allergies);
        }

        let ref = findFoodReference(fName, safeFoodCatalog, profile?.food_environment);
        if (!ref || !isAllowedFoodReference(ref)) {
          const fallback = findFallbackFood(fName);
          ref = fallback && isAllowedFoodReference(fallback)
            ? fallback
            : undefined;
        }
        if (!ref) {
          throw new Error(`No reviewed catalog match was found for "${fName}". Your saved plan was left unchanged.`);
        }

        let qty = Number(item.quantity) || 1;
        const rawServing = String(item.serving_size || '').toLowerCase();
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

        const changedFood = ref.name.toLowerCase() !== String(item.name || '').toLowerCase();
        const sSize = (!changedFood && item.serving_size && !['grams', 'g', 'ml'].includes(rawServing))
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
          unit_food_nutrition: {
            calories: Number(ref?.calories || defCals),
            protein: Number(ref?.protein || defPro),
            carbs: Number(ref?.carbs || 15),
            fat: Number(ref?.fat || 3),
            estimated_cost: unitCost,
          },
          calories: baseCals,
          protein: basePro,
          carbs: baseCarbs,
          fat: baseFat,
          estimated_cost: baseCost,
          isItemCore
        };
      });

      // Deduplicate
      const deduped: typeof mapped = [];
      const seenKeys = new Set<string>();
      mapped.forEach(it => {
        const key = it.food_id || it.name.toLowerCase();
        if (seenKeys.has(key)) {
          const existing = deduped.find(e => (e.food_id || e.name.toLowerCase()) === key);
          if (existing) {
            existing.quantity = Number((existing.quantity + it.quantity).toFixed(2));
            existing.calories += it.calories;
            existing.protein = Number((existing.protein + it.protein).toFixed(1));
            existing.carbs = Number((existing.carbs + it.carbs).toFixed(1));
            existing.fat = Number((existing.fat + it.fat).toFixed(1));
            existing.estimated_cost = Number((existing.estimated_cost + it.estimated_cost).toFixed(2));
          }
        } else {
          seenKeys.add(key);
          deduped.push({ ...it });
        }
      });

      // Scale if deviating from target calories by > 15%
      let mealCals = deduped.reduce((sum, it) => sum + it.calories, 0);
      if (mealCals > 0 && Math.abs(mealCals - slotTargetCals) > (slotTargetCals * 0.15)) {
        const scaleFactor = Math.max(0.4, Math.min(1.8, slotTargetCals / mealCals));
        deduped.forEach(it => {
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

      return deduped;
    };

    // A model can return fewer days or omit a requested meal slot. Fill only
    // those gaps with the profile-aware rotating menu before saving seven dates.
    const startingWeekday = new Date(`${localDate}T12:00:00.000Z`).getUTCDay();
    const normalizedDays: RawAIDay[] = Array.from({ length: 7 }, (_, dIdx) => {
      const sourceDay = aiPlan!.days[dIdx];
      const fallbackMap = NutritionService.getRotatingMealPlanForDay(
        (startingWeekday + dIdx) % 7, profile, targets, safeFoodCatalog
      );
      const meals = mealSlots.map(slot => {
        const supplied = sourceDay?.meals?.find(meal =>
          String(meal.meal_type || "").toLowerCase().replace(/[\s-]+/g, "_") === slot &&
          Array.isArray(meal.items) && meal.items.length > 0
        );
        if (supplied) return { ...supplied, meal_type: slot };
        const fallback = fallbackMap.get(slot) || fallbackMap.get("lunch");
        if (!fallback) {
          throw new Error(`Could not create a ${slot} meal compatible with your nutrition profile.`);
        }
        return {
          meal_type: slot,
          name: fallback.name || `${slot.replace(/_/g, " ")} meal`,
          prep_instruction: fallback.prep_instructions || "",
          items: (fallback.items || fallback.meal_plan_items || []).map((item: any) => ({
            name: String(item.foods?.name || item.name || ""),
            quantity: item.quantity || 1,
            serving_size: item.foods?.serving_size || item.serving_size || "1 serving",
          })).filter((item: RawAIMealItem) => item.name),
        };
      });
      return { day_number: dIdx + 1, meals };
    });

    // 6. Build Master Day Schedules with Verified Nutrition Math
    const daySchedules = normalizedDays.map((d, dIdx) => {
      const meals = d.meals.map(m => {
        const mType = m.meal_type.toLowerCase();
        const slotPct = slotPercentages[mType] ?? (1 / mealSlots.length);
        const slotTargetCals = Math.round(targets.calories * slotPct);
        const slotTargetPro = Number((targets.protein * slotPct).toFixed(1));

        // Sanitize titles
        const rawTitle = sanitizeMealTitle(m.name, isVegan, isVegetarian, isEggetarian);
        const cleanedTitle = isAllowedFoodName(rawTitle) ? rawTitle : `${mType.replace(/_/g, ' ')} meal`;
        const rawOptBTitle = m.option_b_name ? sanitizeMealTitle(m.option_b_name, isVegan, isVegetarian, isEggetarian) : undefined;
        const cleanedOptBTitle = rawOptBTitle && isAllowedFoodName(rawOptBTitle) ? rawOptBTitle : undefined;

        // Process Option A items
        const processedItems = processItems(m.items, cleanedTitle, slotTargetCals);

        // Process Option B items (if missing, generate from swap alternatives)
        let processedOptBItems: typeof processedItems = [];
        let finalOptBTitle = cleanedOptBTitle;

        if (Array.isArray(m.option_b_items) && m.option_b_items.length > 0) {
          processedOptBItems = processItems(m.option_b_items, finalOptBTitle || `${cleanedTitle} Alternative`, slotTargetCals);
        } else {
          const swapAlternatives = NutritionService.getCuratedSwapOptions(mType, profile, targets, foodCatalog);
          const altOpt = swapAlternatives[1] || swapAlternatives[0];
          if (altOpt) {
            finalOptBTitle = isAllowedFoodName(altOpt.name) ? altOpt.name : `${mType.replace(/_/g, ' ')} alternative`;
            processedOptBItems = processItems(
              (altOpt.items || []).map((it: any) => ({
                name: String(it.foods?.name || it.name || ""),
                serving_size: it.serving_size,
                quantity: it.quantity || 1,
              })).filter((it: RawAIMealItem) => it.name),
              finalOptBTitle,
              slotTargetCals
            );
          }
        }

        const finalMealCals = processedItems.reduce((sum, it) => sum + it.calories, 0);
        const finalMealPro = Number(processedItems.reduce((sum, it) => sum + it.protein, 0).toFixed(1));
        const finalMealCarbs = Number(processedItems.reduce((sum, it) => sum + it.carbs, 0).toFixed(1));
        const finalMealFat = Number(processedItems.reduce((sum, it) => sum + it.fat, 0).toFixed(1));
        const finalMealCost = processedItems.reduce((sum, it) => sum + it.estimated_cost, 0);
        const listedMealName = processedItems.slice(0, 3).map(item => item.name).filter(Boolean).join(' + ') || `${mType.replace(/_/g, ' ')} meal`;
        const listedOptionBName = processedOptBItems.slice(0, 3).map(item => item.name).filter(Boolean).join(' + ');
        const allergyPrep = 'Prepare only the listed foods. Check ingredient labels and avoid allergen cross-contact; stop if an ingredient cannot be verified.';
        const standardPrep = 'Prepare the listed foods using your usual cooking method and portions.';

        return {
          meal_type: mType,
          name: userContext.allergies.length ? listedMealName : cleanedTitle,
          option_b_name: userContext.allergies.length ? (listedOptionBName || undefined) : finalOptBTitle,
          prep_instructions: userContext.allergies.length ? allergyPrep :
            (m.prep_instruction && isAllowedFoodName(m.prep_instruction) ? m.prep_instruction : standardPrep),
          option_b_prep_instruction: userContext.allergies.length ? allergyPrep :
            (m.option_b_prep_instruction && isAllowedFoodName(m.option_b_prep_instruction) ? m.option_b_prep_instruction : standardPrep),
          calories: finalMealCals || slotTargetCals,
          protein: finalMealPro || slotTargetPro,
          carbs: finalMealCarbs,
          fat: finalMealFat,
          estimated_cost: finalMealCost,
          items: processedItems,
          option_b_items: processedOptBItems
        };
      });

      // Calibrate meals strictly against user's targets and budget (safe from allergen drops)
      const calibratedDayMeals = calibrateMealsToTargets(meals, targets, profile, safeFoodCatalog);

      return {
        day_number: d.day_number || (dIdx + 1),
        meals: calibratedDayMeals
      };
    });

    const validateDayChoices = (day: RawAIDay, optionBMealIndexes: Set<number>) => {
      const totals = day.meals.reduce((sum: any, meal: any, mealIndex: number) => {
        const useOptionB = optionBMealIndexes.has(mealIndex);
        const items = useOptionB ? meal.option_b_items || [] : meal.items || meal.meal_plan_items || [];
        return items.reduce((mealSum: any, item: any) => ({
          calories: mealSum.calories + (Number(item.calories) || 0),
          protein: mealSum.protein + (Number(item.protein) || 0),
          carbs: mealSum.carbs + (Number(item.carbs) || 0),
          fat: mealSum.fat + (Number(item.fat) || 0),
          cost: mealSum.cost + (Number(item.estimated_cost) || 0),
        }), sum);
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });

      const macrosValid = NutritionValidationEngine.validateMacros(
        totals,
        {
          caloriesTarget: userContext.caloriesTarget,
          proteinTarget: userContext.proteinTarget,
          carbsTarget: userContext.carbsTarget,
          fatTarget: userContext.fatTarget,
        }
      ).valid;

      return macrosValid && totals.cost <= userContext.dailyBudget;
    };

    for (const day of daySchedules) {
      if (!validateDayChoices(day, new Set())) {
        throw new Error("This plan could not meet your nutrition targets within your food budget. Your saved plan was left unchanged. Please review your targets or budget and try again.");
      }

      // Keep alternative meals only when every combination of the available
      // alternatives still fits the user's daily macro and budget targets.
      const usableOptions = new Set<number>();
      for (let mealIndex = 0; mealIndex < day.meals.length; mealIndex++) {
        const meal = day.meals[mealIndex];
        if (!Array.isArray(meal.option_b_items) || meal.option_b_items.length === 0) continue;

        const candidateOptions = new Set(usableOptions);
        candidateOptions.add(mealIndex);
        const optionIndexes = Array.from(candidateOptions);
        let allCombinationsValid = true;

        for (let mask = 0; mask < (1 << optionIndexes.length); mask++) {
          const combination = new Set<number>();
          optionIndexes.forEach((optionIndex, bit) => {
            if (mask & (1 << bit)) combination.add(optionIndex);
          });
          if (!validateDayChoices(day, combination)) {
            allCombinationsValid = false;
            break;
          }
        }

        if (allCombinationsValid) {
          usableOptions.add(mealIndex);
        } else {
          meal.option_b_items = [];
          meal.option_b_name = undefined;
          meal.option_b_prep_instruction = "";
        }
      }
    }

    // Calibration can inject protein foods, so validate every final option before
    // replacing any of the user's existing dated plans.
    for (const day of daySchedules) {
      for (const meal of day.meals) {
        for (const item of [...(meal.items || meal.meal_plan_items || []), ...(meal.option_b_items || [])]) {
          const name = String(item.foods?.name || item.name || "");
          const reference = safeFoodCatalog.find(food => food.id === (item.food_id || item.foods?.id));
          if (!name || !isAllowedFoodName(name) || !reference || !isAllowedFoodReference(reference)) {
            throw new Error("Could not build a plan compatible with your diet or food restrictions. Please review your nutrition profile.");
          }
        }
      }
    }

    // 7. Populate 7 Days of Weekly Meal Plans in Supabase (Starting from localDate)
    const startDate = new Date(`${localDate}T12:00:00.000Z`);
    const numDaysToGenerate = 7;

    const allDates: string[] = [];
    for (let i = 0; i < numDaysToGenerate; i++) {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i);
      allDates.push(d.toISOString().slice(0, 10));
    }

    // Build every date and food before replacing the saved week.
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
        const mItems = m.items || m.meal_plan_items || [];
        mItems.forEach((it: any) => {
          // Calibration changes item quantities; the saved day summary must
          // reflect those final Option A items, not pre-calibration meal totals.
          dayCals += Number(it.calories) || 0;
          dayPro += Number(it.protein) || 0;
          dayCarbs += Number(it.carbs) || 0;
          dayFat += Number(it.fat) || 0;
          dayCost += Number(it.estimated_cost) || 0;
          allDayItems.push({
            ...it,
            meal_type: m.meal_type,
            meal_name: m.name,
            is_option_b: false
          });
        });

        const optBItems = m.option_b_items || [];
        optBItems.forEach((it: any) => {
          allDayItems.push({
            ...it,
            meal_type: m.meal_type,
            meal_name: m.name,
            is_option_b: true,
            option_b_name: m.option_b_name || `${m.name} Alternative`
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

    // The replacement is saved in one database transaction after item validation.

    const planDaysPayload = mealPlansRows.map(plan => {
      const items = itemsByDate.get(plan.date) || [];
      if (items.length === 0) {
        throw new Error(`The generated plan for ${plan.date} has no foods. Your saved plan was left unchanged.`);
      }

      const itemPayload = items.map(it => {
        const rawId = it.food_id || it.foods?.id;
        const food = safeFoodCatalog.find(ref => ref.id === rawId);
        const quantity = Number(it.quantity);
        if (!food || !isAllowedFoodReference(food) || !Number.isFinite(quantity) || quantity <= 0) {
          throw new Error('The generated plan contains an unverified food or serving. Your saved plan was left unchanged.');
        }
        return {
          food_id: food.id,
          quantity,
          serving_size: it.is_option_b
            ? `${it.meal_type}::optb::${it.option_b_name}::${it.serving_size || food.serving_size || '1 serving'}`
            : `${it.meal_type}::${it.meal_name}::${it.serving_size || food.serving_size || '1 serving'}`,
        };
      });
      return {
        date: plan.date,
        plan: {
          name: plan.name,
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs,
          fat: plan.fat,
          estimated_cost: plan.estimated_cost,
        },
        items: itemPayload,
      };
    });

    const { error: saveError } = await supabase.rpc('replace_weekly_meal_plans', { p_days: planDaysPayload });
    if (saveError) {
      console.error('[Luna AI] Error saving weekly meal plan:', saveError);
      await this.logUsage(userId, 'failed_db_insert', 'groq');
      throw new Error(`Failed to save your meal plan. Your previous plan was left unchanged: ${saveError.message}`);
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
        const day1Meals = day1.meals.map((m: any, idx: number) => {
          const items = m.items || m.meal_plan_items || [];
          const totals = items.reduce((sum: any, item: any) => ({
            calories: sum.calories + (Number(item.calories) || 0),
            protein: sum.protein + (Number(item.protein) || 0),
            carbs: sum.carbs + (Number(item.carbs) || 0),
            fat: sum.fat + (Number(item.fat) || 0),
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          return {
            meal_name: m.name,
            meal_type: m.meal_type,
            time_of_day: idx === 0 ? "Morning" : idx === 1 ? "Midday" : idx === 2 ? "Evening" : "Night",
            items: items.map((it: any) => `${it.quantity > 1 ? `${it.quantity}x ` : ""}${it.name}`),
            total_calories: Math.round(totals.calories),
            protein_grams: Number(totals.protein.toFixed(1)),
            carbs_grams: Number(totals.carbs.toFixed(1)),
            fat_grams: Number(totals.fat.toFixed(1)),
            prep_instructions: m.prep_instructions || `Prepare only the listed foods.`,
            meal_plan_items: items
          };
        });

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
