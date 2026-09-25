import { createServerSupabase, getCachedFitnessProfile } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { calculateTargets } from "@/lib/fitness/nutrition/nutrition-engine";
import { calculateDailyBudget, normalizeDietType, parseStringList, resolveMealSlots } from "@/lib/fitness/nutrition/user-context";
import { NutritionValidationEngine } from "@/lib/fitness/nutrition/validation-engine";
import { cache } from "react";

interface NutritionServerCacheEntry {
  data: any;
  timestamp: number;
}

export function getGlobalNutritionCache(): Map<string, NutritionServerCacheEntry> {
  if (!(globalThis as any).__grindlog_nutrition_server_cache) {
    (globalThis as any).__grindlog_nutrition_server_cache = new Map<string, NutritionServerCacheEntry>();
  }
  return (globalThis as any).__grindlog_nutrition_server_cache;
}

interface TimezoneCacheEntry {
  tz: string;
  expiresAt: number;
}

export function getUserTimezoneCache(): Map<string, TimezoneCacheEntry> {
  if (!(globalThis as any).__grindlog_user_timezone_cache) {
    (globalThis as any).__grindlog_user_timezone_cache = new Map<string, TimezoneCacheEntry>();
  }
  return (globalThis as any).__grindlog_user_timezone_cache;
}

interface MonthlySpentCacheEntry {
  pastSpent: number;
  monthKey: string;
  dateKey: string;
  expiresAt: number;
}

export function getMonthlySpentCache(): Map<string, MonthlySpentCacheEntry> {
  if (!(globalThis as any).__grindlog_monthly_spent_cache) {
    (globalThis as any).__grindlog_monthly_spent_cache = new Map<string, MonthlySpentCacheEntry>();
  }
  return (globalThis as any).__grindlog_monthly_spent_cache;
}

export function invalidateNutritionServerCache(userId?: string) {
  const cache = getGlobalNutritionCache();
  const monthlySpentCache = getMonthlySpentCache();
  const tzCache = getUserTimezoneCache();
  if (userId) {
    for (const key of cache.keys()) {
      if (key.includes(userId)) {
        cache.delete(key);
      }
    }
    monthlySpentCache.delete(userId);
    tzCache.delete(userId);
  } else {
    cache.clear();
    monthlySpentCache.clear();
    tzCache.clear();
  }
}

let globalFoodCatalogCache: { data: any[]; timestamp: number } | null = null;

export type NutritionFoodReference = {
  id?: string;
  name: string;
  category?: string | null;
  serving_size?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  estimated_cost?: number | null;
  diet_type?: string | null;
  is_pg_friendly?: boolean | null;
  allergens?: string[] | null;
  plan_eligible?: boolean | null;
  verification_status?: string | null;
  nutrition_verified?: boolean | null;
  dietary_classification_verified?: boolean | null;
};

export function normalizeFoodName(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\beggs\b/g, "egg")
    .replace(/\bpieces\b/g, "piece")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Determines whether a food item is a standard staple provided for free in the user's food environment
 * (e.g., PG Mess, Hostel Mess, Home Family Kitchen, Canteen) vs. a fitness booster/add-on that requires purchase.
 */
export function isStapleCoreFood(foodName?: string, foodEnv?: string): boolean {
  if (!foodName) return false;
  const env = (foodEnv || '').toLowerCase().trim();

  // "I Cook" / "Self-Cooked": User buys and cooks all ingredients personally.
  if (env === 'i cook' || env === 'self-cooked' || env === 'i_cook') {
    return false;
  }

  // Environments where a base meal is provided (PG, Hostel, Home, Canteen, Mixed):
  const isCoreEnv = env === 'pg' || env === 'hostel' || env === 'home' || env === 'office/canteen' || env === 'canteen' || env === 'mixed' || env === '';
  if (!isCoreEnv) return false;

  const name = foodName.toLowerCase().trim();

  // Explicit protein hacks and fitness add-ons are NEVER free core staples
  if (
    name.includes('boiled egg') ||
    name.includes('egg white') ||
    name.includes('egg bhurji') ||
    name.includes('omelette') ||
    name.includes('paneer tikka') ||
    name.includes('paneer bhurji') ||
    name.includes('raw paneer') ||
    name.includes('soy chunk') ||
    name.includes('soya chunk') ||
    name.includes('whey') ||
    name.includes('protein powder') ||
    name.includes('chicken breast') ||
    name.includes('fish curry') ||
    name.includes('chicken curry') ||
    name.includes('mutton') ||
    name.includes('roasted peanut') ||
    name.includes('roasted chana') ||
    name.includes('almond') ||
    name.includes('walnut')
  ) {
    return false;
  }

  // Standalone eggs (e.g. "Boiled Egg", "Farm Egg", "3 Eggs")
  if (/\b(?:egg|eggs)\b/i.test(name) && !name.includes('egg curry')) {
    return false;
  }

  // Standalone paneer
  if (/\bpaneer\b/i.test(name) && !name.includes('matar paneer')) {
    return false;
  }

  // For Home living: Family curd/dahi and homemade buttermilk (chaas) are provided by family
  if (env === 'home' && (name.includes('curd') || name.includes('dahi') || name.includes('chaas') || name.includes('buttermilk') || name.includes('raita'))) {
    return true;
  }

  // Staples typically provided by PG Mess / Hostel / Family Home Kitchen
  const stapleTerms = [
    'rice', 'chawal', 'jeera rice', 'brown rice', 'pulao', 'biryani',
    'roti', 'chapati', 'phulka', 'paratha', 'naan',
    'dal', 'tadka', 'sambar', 'rasam', 'curry',
    'sabzi', 'vegetable', 'aloo', 'gobi', 'bhindi', 'palak', 'beans', 'matar',
    'poha', 'upma', 'idli', 'dosa', 'pongal', 'khichdi', 'cheela',
    'bread', 'toast', 'tea', 'chai', 'milk',
    'core meal', 'base meal', 'provided core', 'standard base', 'thali'
  ];

  return stapleTerms.some(term => name.includes(term));
}

/**
 * Realistic Indian food cost estimator (₹ INR) for common fitness ingredients.
 * Aligns out-of-pocket budget calculations with real-world kirana / market prices.
 */
export function getRealisticFoodCost(foodName?: string, defaultCost?: number): number {
  if (!foodName) return typeof defaultCost === 'number' && defaultCost > 0 ? defaultCost : 10;
  const lower = foodName.toLowerCase();

  if (lower.includes('egg white')) return 5;
  if (lower.includes('egg')) return 7; // 1 farm egg = ₹7
  if (lower.includes('curd') || lower.includes('dahi')) return 10; // 100g curd = ₹10
  if (lower.includes('paneer')) return 35; // 100g paneer = ₹35
  if (lower.includes('soya chunk') || lower.includes('soy chunk')) return 12; // 50g = ₹12
  if (lower.includes('tofu')) return 25;
  if (lower.includes('chicken breast')) return 45; // 100g = ₹45
  if (lower.includes('chicken curry') || lower.includes('chicken')) return 50;
  if (lower.includes('fish')) return 50;
  if (lower.includes('roasted peanut')) return 8; // 30g = ₹8
  if (lower.includes('roasted chana')) return 8; // 25-30g = ₹8
  if (lower.includes('banana')) return 6; // 1 banana = ₹6
  if (lower.includes('apple')) return 20; // 1 apple = ₹20
  if (lower.includes('milk')) return 12; // 250ml milk = ₹12
  if (lower.includes('whey') || lower.includes('protein powder')) return 65; // 1 scoop = ₹65

  // Home cooking staples & sides (raw pantry cost)
  if (lower.includes('roti') || lower.includes('chapati') || lower.includes('phulka')) return 2; // ₹2/chapati
  if (lower.includes('rice') || lower.includes('chawal')) return 5; // ₹5/bowl cooked rice
  if (lower.includes('idli')) return 4; // ₹4/idli
  if (lower.includes('sambar')) return 8; // ₹8/bowl
  if (lower.includes('dal') || lower.includes('moong') || lower.includes('rajma') || lower.includes('chole')) return 8; // ₹8/bowl
  if (lower.includes('vegetable') || lower.includes('sabzi') || lower.includes('salad')) return 10; // ₹10/bowl
  if (lower.includes('oats')) return 10;
  if (lower.includes('poha')) return 8;
  if (lower.includes('bread')) return 4;

  return typeof defaultCost === 'number' && defaultCost > 0 ? Math.min(defaultCost, 20) : 10;
}

/**
 * Calibrates and scales an array of meals so that the combined daily totals
 * strictly hit the user's onboarding targets (calories +/- 3%, protein, carbs, fat)
 * and remain within the user's daily out-of-pocket budget limit.
 */
export function calibrateMealsToTargets(
  meals: any[],
  targets: { calories: number; protein?: number; carbs?: number; fat?: number; protein_g?: number; carbs_g?: number; fat_g?: number },
  profile: any,
  vettedFoodCatalog?: NutritionFoodReference[]
): any[] {
  if (!meals || !Array.isArray(meals) || meals.length === 0 || !targets) return meals;

  const targetCals = Math.round(Number(targets.calories) || 2000);
  const targetPro = Math.round(Number((targets as any).protein_g ?? targets.protein ?? 120));
  const targetCarbs = Math.round(Number((targets as any).carbs_g ?? targets.carbs ?? 200));
  const targetFat = Math.round(Number((targets as any).fat_g ?? targets.fat ?? 50));

  // 1. Dynamic Daily Budget Cap based on Onboarding Tier / Actual Monthly Budget
  const budgetInfo = calculateDailyBudget(profile?.nutrition_budget, profile);
  const dailyBudgetCap = budgetInfo.dailyBudget;

  // Diet preference flags
  const dietStr = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
  const isVegan = dietStr.includes('vegan');
  const isNonVeg = !isVegan && (dietStr.includes('non') || dietStr.includes('meat') || dietStr.includes('chicken') || dietStr.includes('fish'));
  const isEggetarian = !isVegan && !isNonVeg && (dietStr.includes('egg') || dietStr.includes('eggetarian'));
  const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;
  const normalizedDiet = normalizeDietType(profile?.diet_preference, profile?.food_type);
  const allergies = parseStringList(profile?.food_allergies);
  const disliked = parseStringList(profile?.foods_disliked);
  const avoided = parseStringList(profile?.foods_avoided);
  const isAllowedFoodName = (name: string) =>
    NutritionValidationEngine.validateDiet(name, normalizedDiet).valid &&
    NutritionValidationEngine.validateAllergiesAndDislikes(name, allergies, disliked, avoided).valid;

  // The weekly AI path passes only reviewed, profile-compatible foods. In that
  // path every calibration add-on must use a real catalog ID and its real macros.
  const resolveAddOn = (food: any): any | null => {
    if (!isAllowedFoodName(food.name)) return null;
    if (!vettedFoodCatalog) return food;
    const aliases: Record<string, string[]> = {
      'chicken-breast-addon': ['Chicken Breast (Cooked)', 'Chicken Breast (Grilled / Cooked)', 'Boiled Chicken Breast'],
      'soya-chunks-addon': ['Soy Chunks (Cooked)', 'Soya Chunks Curry (Cooked)'],
      'egg-white-addon': ['Boiled Egg White'],
      'low-fat-paneer-addon': ['Low Fat Paneer'],
      'tofu-addon': ['Tofu (Firm / Cooked)', 'Tofu (Firm)'],
    };
    const names = aliases[String(food.id)] || [food.name];
    const reference = names.map(name => vettedFoodCatalog.find(candidate => candidate.name.toLowerCase() === name.toLowerCase())).find(Boolean);
    if (!reference?.id || !isAllowedFoodName(reference.name) ||
        ![reference.calories, reference.protein, reference.carbs, reference.fat].every(value => Number.isFinite(Number(value)))) {
      return null;
    }
    return { ...reference, id: reference.id };
  };

  const mealsPerDay = profile?.meals_per_day || (meals.length === 3 ? '3 meals' : (meals.length === 2 ? '2 meals' : (meals.length >= 5 ? '5+ meals' : '4 meals')));
  const slotInfo = resolveMealSlots(mealsPerDay);
  const slotRatios: Record<string, number> = slotInfo.slotRatios;

  const getItemInfo = (it: any) => {
    const fName = String(it.foods?.name || it.name || '').trim();
    let q = Number(it.quantity) || 1;
    const unitNutrition = it.unit_food_nutrition || it.foods || {};
    let unitCals = Number(unitNutrition.calories ?? it.calories ?? 0);
    let unitPro = Number(unitNutrition.protein ?? it.protein ?? 0);
    let unitCarbs = Number(unitNutrition.carbs ?? it.carbs ?? 0);
    let unitFat = Number(unitNutrition.fat ?? it.fat ?? 0);
    let unitCost = Number(unitNutrition.estimated_cost ?? it.estimated_cost ?? 0);

    // Flattened plan items store macros for the selected quantity. Recover the
    // per-serving values before changing that quantity during calibration.
    if (!it.foods && !it.unit_food_nutrition && q !== 1 && unitCals > 0) {
      unitCals = Math.round(unitCals / q);
      unitPro = Number((unitPro / q).toFixed(1));
      unitCarbs = Number((unitCarbs / q).toFixed(1));
      unitFat = Number((unitFat / q).toFixed(1));
      unitCost = Math.round(unitCost / q);
    }

    const isCore = it.is_core ?? isStapleCoreFood(fName, profile?.food_environment);
    const realisticCost = isCore ? 0 : getRealisticFoodCost(fName, unitCost);

    return { fName, q, unitCals, unitPro, unitCarbs, unitFat, unitCost: realisticCost, isCore };
  };

  const getTotals = (currMeals: any[]) => {
    let cal = 0, pro = 0, carb = 0, fat = 0, cost = 0;
    currMeals.forEach((m: any) => {
      (m.meal_plan_items || m.items || []).forEach((it: any) => {
        const info = getItemInfo(it);
        const q = Number(it.quantity) || 1;
        cal += Math.round(info.unitCals * q);
        pro += Number((info.unitPro * q).toFixed(1));
        carb += Number((info.unitCarbs * q).toFixed(1));
        fat += Number((info.unitFat * q).toFixed(1));
        cost += info.isCore ? 0 : Math.round(info.unitCost * q);
      });
    });
    return {
      cal: Math.round(cal),
      pro: Number(pro.toFixed(1)),
      carb: Number(carb.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      cost: Math.round(cost)
    };
  };

  // STAGE 1: SLOT-LEVEL INITIAL BALANCING
  let calibratedMeals = meals.map((m: any) => {
    const mType = (m.meal_type || 'lunch').toLowerCase();
    const slotFraction = slotRatios[mType] ?? (1 / meals.length);
    const mealTargetCals = Math.round(targetCals * slotFraction);

    const rawItems = m.meal_plan_items || m.items || [];
    if (rawItems.length === 0) return m;

    const currentMealCals = rawItems.reduce((sum: number, it: any) => {
      const info = getItemInfo(it);
      return sum + info.unitCals * info.q;
    }, 0);

    const mealScale = currentMealCals > 0 ? (mealTargetCals / currentMealCals) : 1;

    const calibratedItems = rawItems.map((it: any) => {
      const info = getItemInfo(it);
      const lowerName = info.fName.toLowerCase();
      let q = info.q;

      // Intelligent portioning based on scale & slot target
      if (lowerName.includes('egg') && !lowerName.includes('white') && !lowerName.includes('curry')) {
        if (mealTargetCals <= 400 || mealScale < 0.75) q = 1;
        else q = 2; // Cap whole eggs at 2 per meal
      } else if (lowerName.includes('rice') || lowerName.includes('chawal')) {
        if (mealScale < 0.7) q = 0.8;
        else if (mealScale < 0.9) q = 1.0;
        else if (mealScale > 1.3) q = 1.6;
        else q = 1.2;
      } else if (lowerName.includes('roti') || lowerName.includes('chapati') || lowerName.includes('phulka')) {
        if (mealScale < 0.65) q = 1;
        else if (mealScale < 0.9) q = 2;
        else if (mealScale > 1.35) q = 3;
        else q = 2;
      } else if (lowerName.includes('banana') || lowerName.includes('apple')) {
        if (mealScale < 0.65 || targetCals < 1500) q = 0.5;
        else q = 1;
      } else if (lowerName.includes('peanut')) {
        if (mealScale < 0.8 || targetFat < 50) q = 0.5;
        else q = 0.8;
      } else if (lowerName.includes('soya chunk') || lowerName.includes('soy chunk')) {
        q = Math.min(1.5, Math.max(0.6, Number((q * mealScale).toFixed(1))));
      } else if (lowerName.includes('paneer')) {
        if (dailyBudgetCap <= 75 || targetFat <= 50 || mealScale < 0.8) q = 0.5;
        else if (mealScale > 1.2) q = 1.0;
        else q = 0.7;
      } else if (lowerName.includes('chicken breast') || lowerName.includes('chicken')) {
        q = Number(Math.min(2.0, Math.max(0.8, q * mealScale)).toFixed(1));
      } else {
        const rawScaled = q * mealScale;
        q = Math.max(0.4, Math.min(2.0, Number(rawScaled.toFixed(1))));
      }

      return {
        ...it,
        quantity: q,
        is_core: info.isCore,
        calories: Math.round(info.unitCals * q),
        protein: Number((info.unitPro * q).toFixed(1)),
        carbs: Number((info.unitCarbs * q).toFixed(1)),
        fat: Number((info.unitFat * q).toFixed(1)),
        estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        foods: it.foods ? { ...it.foods, calories: info.unitCals, protein: info.unitPro, carbs: info.unitCarbs, fat: info.unitFat, estimated_cost: info.unitCost } : undefined
      };
    });

    return { ...m, meal_plan_items: calibratedItems, items: calibratedItems };
  });

  // STAGE 2: PROTEIN CALIBRATION (Target +/- 6g)
  let totals = getTotals(calibratedMeals);
  let proGap = targetPro - totals.pro;

  if (proGap > 6) {
    // 2A. Scale existing lean protein sources in lunch & dinner
    calibratedMeals = calibratedMeals.map((m: any) => {
      const items = (m.meal_plan_items || m.items || []).map((it: any) => {
        const info = getItemInfo(it);
        const lower = info.fName.toLowerCase();
        let q = Number(it.quantity) || 1;

        if (lower.includes('chicken breast') || (lower.includes('chicken') && !lower.includes('biryani'))) {
          const needed = Math.min(1.2, Math.max(0, proGap / 31));
          q = Number((q + needed).toFixed(1));
          proGap -= needed * 31;
        } else if (lower.includes('soya chunk') || lower.includes('soy chunk')) {
          const needed = Math.min(0.8, Math.max(0, proGap / 45));
          q = Number((q + needed).toFixed(1));
          proGap -= needed * 45;
        } else if (lower.includes('egg white')) {
          const needed = Math.min(5, Math.round(proGap / 3.6));
          q = q + needed;
          proGap -= needed * 3.6;
        }

        return {
          ...it,
          quantity: q,
          calories: Math.round(info.unitCals * q),
          protein: Number((info.unitPro * q).toFixed(1)),
          carbs: Number((info.unitCarbs * q).toFixed(1)),
          fat: Number((info.unitFat * q).toFixed(1)),
          estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        };
      });
      return { ...m, meal_plan_items: items, items };
    });

    // 2B. If still short by > 8g, inject lean protein into lunch AND/OR dinner
    totals = getTotals(calibratedMeals);
    proGap = targetPro - totals.pro;

    if (proGap > 8) {
      // Find candidate meals to inject protein (Lunch and Dinner)
      const candidateSlots = ['dinner', 'lunch'];
      const hasSoyChunksInDay = calibratedMeals.some(m =>
        (m.meal_plan_items || m.items || []).some((it: any) => {
          const n = (it.foods?.name || it.name || '').toLowerCase();
          return n.includes('soya chunk') || n.includes('soy chunk');
        })
      );

      for (const slot of candidateSlots) {
        if (proGap <= 6) break;
        const targetMealIdx = calibratedMeals.findIndex(m => (m.meal_type || '').toLowerCase() === slot);
        if (targetMealIdx === -1) continue;

        const targetMeal = calibratedMeals[targetMealIdx];
        let addOnFood: any = null;
        let addOnQty = 1;

        if (isNonVeg) {
          addOnFood = {
            id: 'chicken-breast-addon',
            name: 'Chicken Breast (Cooked)',
            category: 'Non-Vegetarian',
            serving_size: '100g',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            estimated_cost: 45,
          };
          addOnQty = Number(Math.max(0.5, Math.min(1.2, proGap / 31)).toFixed(1));
        } else if (isEggetarian) {
          addOnFood = {
            id: 'egg-white-addon',
            name: 'Boiled Egg White',
            category: 'Protein',
            serving_size: '1 large (33g)',
            calories: 17,
            protein: 3.6,
            carbs: 0.2,
            fat: 0.1,
            estimated_cost: 6,
          };
          addOnQty = Math.max(2, Math.min(5, Math.round(proGap / 3.6)));
        } else if (isVegetarian) {
          // Vegetarian: Rotate between Paneer, Curd, and Soy Chunks (only if not already present today)
          if (!hasSoyChunksInDay && slot === 'dinner') {
            addOnFood = {
              id: 'soya-chunks-addon',
              name: 'Soy Chunks (Cooked)',
              category: 'Protein',
              serving_size: '1 bowl (100g)',
              calories: 345,
              protein: 52,
              carbs: 33,
              fat: 0.5,
              estimated_cost: 20,
            };
            addOnQty = Number(Math.max(0.3, Math.min(0.6, proGap / 52)).toFixed(1));
          } else {
            addOnFood = {
              id: 'low-fat-paneer-addon',
              name: 'Low Fat Paneer',
              category: 'Protein',
              serving_size: '100g',
              calories: 160,
              protein: 28,
              carbs: 4,
              fat: 4,
              estimated_cost: 35,
            };
            addOnQty = Number(Math.max(0.4, Math.min(1.0, proGap / 28)).toFixed(1));
          }
        } else {
          // Vegan: Rotate between Tofu, Moong Sprouts, Chana, and Soy Chunks (only if not already present today)
          if (!hasSoyChunksInDay && slot === 'dinner') {
            addOnFood = {
              id: 'soya-chunks-addon',
              name: 'Soy Chunks (Cooked)',
              category: 'Protein',
              serving_size: '1 bowl (100g)',
              calories: 345,
              protein: 52,
              carbs: 33,
              fat: 0.5,
              estimated_cost: 20,
            };
            addOnQty = Number(Math.max(0.3, Math.min(0.5, proGap / 52)).toFixed(1));
          } else {
            addOnFood = {
              id: 'tofu-addon',
              name: 'Tofu (Firm / Cooked)',
              category: 'Protein',
              serving_size: '100g',
              calories: 120,
              protein: 15,
              carbs: 3,
              fat: 5,
              estimated_cost: 30,
            };
            addOnQty = Number(Math.max(0.5, Math.min(1.2, proGap / 15)).toFixed(1));
          }
        }

        // Macro top-ups must never introduce a food excluded during onboarding.
        addOnFood = resolveAddOn(addOnFood);
        if (!addOnFood) continue;
        proGap -= addOnQty * Number(addOnFood.protein);
        const isCore = isStapleCoreFood(addOnFood.name, profile?.food_environment);
        const unitCost = isCore ? 0 : getRealisticFoodCost(addOnFood.name, addOnFood.estimated_cost);

        const newItems = [
          ...(targetMeal.meal_plan_items || []),
          {
            food_id: addOnFood.id,
            quantity: addOnQty,
            is_core: isCore,
            calories: Math.round(addOnFood.calories * addOnQty),
            protein: Number((addOnFood.protein * addOnQty).toFixed(1)),
            carbs: Number((addOnFood.carbs * addOnQty).toFixed(1)),
            fat: Number((addOnFood.fat * addOnQty).toFixed(1)),
            estimated_cost: Math.round(unitCost * addOnQty),
            foods: addOnFood,
          }
        ];

        // If cutting or low fat, trim full fat paneer when soya is added to prevent calorie & fat surplus
        if (targetFat <= 50) {
          (targetMeal.meal_plan_items || []).forEach((it: any) => {
            if ((it.foods?.name || it.name || '').toLowerCase().includes('paneer')) {
              it.quantity = Math.max(0.2, Number((it.quantity * 0.4).toFixed(1)));
              const pInfo = getItemInfo(it);
              it.calories = Math.round(pInfo.unitCals * it.quantity);
              it.protein = Number((pInfo.unitPro * it.quantity).toFixed(1));
              it.carbs = Number((pInfo.unitCarbs * it.quantity).toFixed(1));
              it.fat = Number((pInfo.unitFat * it.quantity).toFixed(1));
              it.estimated_cost = pInfo.isCore ? 0 : Math.round(pInfo.unitCost * it.quantity);
            }
          });
        }

        calibratedMeals[targetMealIdx] = {
          ...targetMeal,
          meal_plan_items: newItems,
          items: newItems
        };
      }
    }
  } else if (proGap < -8) {
    // 2C. Scale down excessive protein anchors evenly across all meals
    let anchorItems: any[] = [];
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const lower = (it.foods?.name || it.name || '').toLowerCase();
        if (lower.includes('chicken') || lower.includes('soya') || lower.includes('soy chunk') || lower.includes('paneer') || lower.includes('egg white')) {
          anchorItems.push(it);
        }
      });
    });

    if (anchorItems.length > 0) {
      const proExcess = totals.pro - targetPro;
      const trimPerAnchor = proExcess / anchorItems.length;

      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;
          if (lower.includes('chicken') || lower.includes('soya') || lower.includes('soy chunk') || lower.includes('paneer') || lower.includes('egg white')) {
            const deltaQ = info.unitPro > 0 ? (trimPerAnchor / info.unitPro) : 0;
            q = Number(Math.max(0.25, q - deltaQ).toFixed(1));
          }
          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  // STAGE 3: STRICT FAT CAP ENFORCEMENT (totalFat <= targetFat + 2g)
  totals = getTotals(calibratedMeals);
  let fatOverage = totals.fat - targetFat;

  if (fatOverage > 2) {
    // 3A. Check whole eggs: if fat overage > 4, convert 1 whole egg to 2 egg whites
    const eggWhite = resolveAddOn({
      id: 'd6e9d38d-5c35-4dbb-8d20-2c03e32f3a8a',
      name: 'Boiled Egg White',
      category: 'Protein',
      serving_size: '1 large (33g)',
      calories: 17,
      protein: 3.6,
      carbs: 0.2,
      fat: 0.1,
      estimated_cost: 6,
    });
    if (fatOverage > 4 && eggWhite) {
      let convertedEgg = false;
      calibratedMeals = calibratedMeals.map(m => {
        if (convertedEgg) return m;
        const items = (m.meal_plan_items || []).map((it: any) => {
          const fName = (it.foods?.name || it.name || '').toLowerCase();
          if (!convertedEgg && fName.includes('egg') && !fName.includes('white') && !fName.includes('curry') && (Number(it.quantity) || 1) >= 2) {
            convertedEgg = true;
            const newQ = Number(it.quantity) - 1; // 2 -> 1
            const info = getItemInfo(it);
            return {
              ...it,
              quantity: newQ,
              calories: Math.round(info.unitCals * newQ),
              protein: Number((info.unitPro * newQ).toFixed(1)),
              carbs: Number((info.unitCarbs * newQ).toFixed(1)),
              fat: Number((info.unitFat * newQ).toFixed(1)),
              estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * newQ),
            };
          }
          return it;
        });

        if (convertedEgg) {
          // Add 2 egg whites to preserve/increase protein with 0 fat
          items.push({
            food_id: eggWhite.id,
            quantity: 2,
            is_core: isStapleCoreFood(eggWhite.name, profile?.food_environment),
            calories: Math.round(Number(eggWhite.calories) * 2),
            protein: Number((Number(eggWhite.protein) * 2).toFixed(1)),
            carbs: Number((Number(eggWhite.carbs) * 2).toFixed(1)),
            fat: Number((Number(eggWhite.fat) * 2).toFixed(1)),
            estimated_cost: Math.round(Number(eggWhite.estimated_cost) * 2),
            foods: eggWhite,
          });
        }
        return { ...m, meal_plan_items: items, items };
      });
    }

    // 3B. Scale down high fat items (milk, paneer, peanuts, high-fat meats like tandoori chicken/fatty curries)
    totals = getTotals(calibratedMeals);
    fatOverage = totals.fat - targetFat;

    if (fatOverage > 1) {
      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;

          if (lower.includes('peanut')) {
            q = Math.max(0.3, Number((q * 0.5).toFixed(1)));
          } else if (lower.includes('paneer') && fatOverage > 2) {
            q = Math.max(0.3, Number((q * (fatOverage > 8 ? 0.45 : 0.6)).toFixed(1)));
          } else if (lower.includes('ghee') || lower.includes('butter') || /\b(?:oil|oils|cooking oil)\b/i.test(lower)) {
            q = Math.max(0.2, Number((q * 0.4).toFixed(1)));
          } else if (lower.includes('whole milk') && fatOverage > 2) {
            q = Math.max(0.5, Number((q * (fatOverage > 6 ? 0.65 : 0.8)).toFixed(1)));
          } else if ((lower.includes('tandoori chicken') || lower.includes('curry')) && fatOverage > 3 && q > 1.0) {
            q = Math.max(1.0, Number((q * 0.75).toFixed(1)));
          }

          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  // STAGE 4: CALORIE & CARB FINE-TUNING VIA STAPLE FOODS
  totals = getTotals(calibratedMeals);
  const calDelta = targetCals - totals.cal;

  if (Math.abs(calDelta) > 20) {
    const isFatTight = totals.fat >= targetFat - 2;

    let stapleCals = 0;
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const lower = (it.foods?.name || it.name || '').toLowerCase();
        // If fat is tight, only scale low-fat staples (rice, oats) and avoid chapatis/curries with fat
        const isEligibleStaple = isFatTight
          ? (lower.includes('rice') || lower.includes('oat') || lower.includes('daliya'))
          : (lower.includes('rice') || lower.includes('roti') || lower.includes('chapati') || lower.includes('oat') || lower.includes('poha') || lower.includes('upma') || lower.includes('daliya') || lower.includes('cheela'));

        if (isEligibleStaple) {
          stapleCals += Math.round((it.foods?.calories || it.calories || 0) * (Number(it.quantity) || 1));
        }
      });
    });

    if (stapleCals > 0) {
      const carbRatio = Math.max(0.4, Math.min(2.5, 1 + (calDelta / stapleCals)));
      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;

          const isEligibleStaple = isFatTight
            ? (lower.includes('rice') || lower.includes('oat') || lower.includes('daliya'))
            : (lower.includes('rice') || lower.includes('roti') || lower.includes('chapati') || lower.includes('oat') || lower.includes('poha') || lower.includes('upma') || lower.includes('daliya') || lower.includes('cheela'));

          if (isEligibleStaple) {
            q = Math.max(0.4, Number((q * carbRatio).toFixed(1)));
          }

          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  // STAGE 4B: FINAL LEAN PROTEIN TOP-UP (Target +/- 6g)
  totals = getTotals(calibratedMeals);
  const finalProGap = targetPro - totals.pro;
  if (finalProGap > 6 && totals.cal <= targetCals + 50) {
    const candidateSlots = ['dinner', 'lunch'];
    for (const slot of candidateSlots) {
      if (finalProGap <= 4) break;
      const targetMealIdx = calibratedMeals.findIndex(m => (m.meal_type || '').toLowerCase() === slot);
      if (targetMealIdx === -1) continue;

      const targetMeal = calibratedMeals[targetMealIdx];
      let addOnFood: any = null;
      let addOnQty = 1;

      if (isNonVeg || isEggetarian) {
        addOnFood = {
          id: 'd6e9d38d-5c35-4dbb-8d20-2c03e32f3a8a',
          name: 'Boiled Egg White',
          category: 'Protein',
          serving_size: '1 large (33g)',
          calories: 17,
          protein: 3.6,
          carbs: 0.2,
          fat: 0.1,
          estimated_cost: 6,
        };
        addOnQty = Math.max(2, Math.min(6, Math.round(finalProGap / 3.6)));
      } else {
        const hasSoyInDay = calibratedMeals.some(m =>
          (m.meal_plan_items || m.items || []).some((it: any) => {
            const n = (it.foods?.name || it.name || '').toLowerCase();
            return n.includes('soya chunk') || n.includes('soy chunk');
          })
        );
        if (isVegetarian) {
          if (!hasSoyInDay) {
            addOnFood = {
              id: '36afa603-8493-478b-a10e-11b5d5dc8be1',
              name: 'Soy Chunks (Cooked)',
              category: 'Protein',
              serving_size: '1 bowl (100g)',
              calories: 345,
              protein: 52,
              carbs: 33,
              fat: 0.5,
              estimated_cost: 20,
            };
            addOnQty = Number(Math.max(0.2, Math.min(0.4, finalProGap / 52)).toFixed(1));
          } else {
            addOnFood = {
              id: 'low-fat-paneer-addon',
              name: 'Low Fat Paneer',
              category: 'Protein',
              serving_size: '100g',
              calories: 160,
              protein: 28,
              carbs: 4,
              fat: 4,
              estimated_cost: 35,
            };
            addOnQty = Number(Math.max(0.3, Math.min(0.8, finalProGap / 28)).toFixed(1));
          }
        } else {
          // Vegan
          if (!hasSoyInDay) {
            addOnFood = {
              id: '36afa603-8493-478b-a10e-11b5d5dc8be1',
              name: 'Soy Chunks (Cooked)',
              category: 'Protein',
              serving_size: '1 bowl (100g)',
              calories: 345,
              protein: 52,
              carbs: 33,
              fat: 0.5,
              estimated_cost: 20,
            };
            addOnQty = Number(Math.max(0.2, Math.min(0.4, finalProGap / 52)).toFixed(1));
          } else {
            addOnFood = {
              id: 'tofu-addon',
              name: 'Tofu (Firm / Cooked)',
              category: 'Protein',
              serving_size: '100g',
              calories: 120,
              protein: 15,
              carbs: 3,
              fat: 5,
              estimated_cost: 30,
            };
            addOnQty = Number(Math.max(0.4, Math.min(1.0, finalProGap / 15)).toFixed(1));
          }
        }
      }

      addOnFood = resolveAddOn(addOnFood);
      if (!addOnFood) continue;
      const isCore = isStapleCoreFood(addOnFood.name, profile?.food_environment);
      const unitCost = isCore ? 0 : getRealisticFoodCost(addOnFood.name, addOnFood.estimated_cost);

      const existingItems = [...(targetMeal.meal_plan_items || targetMeal.items || [])];
      const dupIdx = existingItems.findIndex((it: any) => (it.foods?.name || it.name || '').toLowerCase().includes(addOnFood.name.toLowerCase()));

      if (dupIdx !== -1) {
        const existing = existingItems[dupIdx];
        const newQ = Number((Number(existing.quantity) + addOnQty).toFixed(1));
        const pInfo = getItemInfo(existing);
        existingItems[dupIdx] = {
          ...existing,
          quantity: newQ,
          calories: Math.round(pInfo.unitCals * newQ),
          protein: Number((pInfo.unitPro * newQ).toFixed(1)),
          carbs: Number((pInfo.unitCarbs * newQ).toFixed(1)),
          fat: Number((pInfo.unitFat * newQ).toFixed(1)),
          estimated_cost: pInfo.isCore ? 0 : Math.round(pInfo.unitCost * newQ),
        };
      } else {
        existingItems.push({
          food_id: addOnFood.id,
          quantity: addOnQty,
          is_core: isCore,
          calories: Math.round(addOnFood.calories * addOnQty),
          protein: Number((addOnFood.protein * addOnQty).toFixed(1)),
          carbs: Number((addOnFood.carbs * addOnQty).toFixed(1)),
          fat: Number((addOnFood.fat * addOnQty).toFixed(1)),
          estimated_cost: Math.round(unitCost * addOnQty),
          foods: addOnFood,
        });
      }

      calibratedMeals[targetMealIdx] = {
        ...targetMeal,
        meal_plan_items: existingItems,
        items: existingItems
      };
      break;
    }
  }

  // STAGE 4C: ABSOLUTE FAT CEILING ENFORCEMENT (GUARANTEE fat <= targetFat + 1.5g)
  totals = getTotals(calibratedMeals);
  let strictFatExcess = totals.fat - targetFat;
  if (strictFatExcess > 1.5) {
    let fatContributors: any[] = [];
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const info = getItemInfo(it);
        const itemTotalFat = Number((info.unitFat * (Number(it.quantity) || 1)).toFixed(1));
        const lower = (it.foods?.name || it.name || '').toLowerCase();
        if (itemTotalFat >= 3 && !lower.includes('white') && !lower.includes('soya') && !lower.includes('soy chunk') && !lower.includes('rice')) {
          fatContributors.push({ meal: m, item: it, totalFat: itemTotalFat, unitFat: info.unitFat, unitCals: info.unitCals, unitPro: info.unitPro });
        }
      });
    });

    fatContributors.sort((a, b) => b.totalFat - a.totalFat);

    for (const entry of fatContributors) {
      if (strictFatExcess <= 1.0) break;
      const it = entry.item;
      const currentQ = Number(it.quantity) || 1;
      const neededCut = strictFatExcess;
      const maxCutQ = currentQ * 0.55; // cut up to 55%
      const cutQ = Number(Math.min(maxCutQ, Math.max(0.1, neededCut / (entry.unitFat || 1))).toFixed(1));
      if (cutQ <= 0) continue;

      const newQ = Number(Math.max(0.2, currentQ - cutQ).toFixed(1));
      const actualDeltaQ = currentQ - newQ;
      const fatSaved = actualDeltaQ * entry.unitFat;

      it.quantity = newQ;
      it.calories = Math.round(entry.unitCals * newQ);
      it.protein = Number((entry.unitPro * newQ).toFixed(1));
      it.fat = Number((entry.unitFat * newQ).toFixed(1));

      strictFatExcess -= fatSaved;
    }

    // Replenish any lost protein via pure lean protein (boiled egg whites or chicken breast)
    totals = getTotals(calibratedMeals);
    const currentProGap = targetPro - totals.pro;
    if (currentProGap > 3) {
      let targetProItem: any = null;
      let targetProUnit = 3.6;
      let isWhite = false;

      if (isNonVeg) {
        for (const m of calibratedMeals) {
          const it = (m.meal_plan_items || []).find((x: any) => (x.foods?.name || x.name || '').toLowerCase().includes('chicken breast'));
          if (it) { targetProItem = it; targetProUnit = 31; break; }
        }
      }
      if (!targetProItem) {
        for (const m of calibratedMeals) {
          const it = (m.meal_plan_items || []).find((x: any) => (x.foods?.name || x.name || '').toLowerCase().includes('egg white'));
          if (it) { targetProItem = it; targetProUnit = 3.6; isWhite = true; break; }
        }
      }
      if (!targetProItem && !isNonVeg && !isEggetarian) {
        for (const m of calibratedMeals) {
          const it = (m.meal_plan_items || []).find((x: any) => {
            const n = (x.foods?.name || x.name || '').toLowerCase();
            return isVegan
              ? (n.includes('tofu') || n.includes('sprout') || n.includes('soya') || n.includes('soy chunk'))
              : (n.includes('paneer') || n.includes('curd') || n.includes('soya') || n.includes('soy chunk'));
          });
          if (it) {
            targetProItem = it;
            const n = (it.foods?.name || it.name || '').toLowerCase();
            targetProUnit = (n.includes('soya') || n.includes('soy chunk')) ? 52 : (n.includes('paneer') ? 20 : (n.includes('tofu') ? 15 : 10));
            break;
          }
        }
      }

      if (targetProItem) {
        const info = getItemInfo(targetProItem);
        if (isWhite) {
          const extraWhites = Math.max(1, Math.round(currentProGap / (info.unitPro || 3.6)));
          targetProItem.quantity = targetProItem.quantity + extraWhites;
          targetProItem.calories = Math.round(info.unitCals * targetProItem.quantity);
          targetProItem.protein = Number((info.unitPro * targetProItem.quantity).toFixed(1));
          targetProItem.fat = Number((info.unitFat * targetProItem.quantity).toFixed(1));
        } else {
          const extraQ = Number((currentProGap / (info.unitPro || targetProUnit)).toFixed(1));
          if (extraQ >= 0.1) {
            targetProItem.quantity = Number((targetProItem.quantity + extraQ).toFixed(1));
            targetProItem.calories = Math.round(info.unitCals * targetProItem.quantity);
            targetProItem.protein = Number((info.unitPro * targetProItem.quantity).toFixed(1));
            targetProItem.fat = Number((info.unitFat * targetProItem.quantity).toFixed(1));
          }
        }
      }
    }

    // Replenish any remaining lost calories via fat-free White Rice to strictly hit target calories
    totals = getTotals(calibratedMeals);
    const finalCalDeficit = targetCals - totals.cal;
    if (finalCalDeficit > 20) {
      const riceMeal = calibratedMeals.find(m => (m.meal_plan_items || []).some((it: any) => (it.foods?.name || it.name || '').toLowerCase().includes('rice')));
      if (riceMeal) {
        const riceItem = riceMeal.meal_plan_items.find((it: any) => (it.foods?.name || it.name || '').toLowerCase().includes('rice'));
        if (riceItem) {
          const info = getItemInfo(riceItem);
          const extraRiceQ = Number((finalCalDeficit / info.unitCals).toFixed(1));
          riceItem.quantity = Number((riceItem.quantity + extraRiceQ).toFixed(1));
          riceItem.calories = Math.round(info.unitCals * riceItem.quantity);
          riceItem.protein = Number((info.unitPro * riceItem.quantity).toFixed(1));
          riceItem.carbs = Number((info.unitCarbs * riceItem.quantity).toFixed(1));
          riceItem.fat = Number((info.unitFat * riceItem.quantity).toFixed(1));
        }
      }
    }
  }

  // STAGE 5: STRICT BUDGET CAP ENFORCEMENT (iterative proportional scaling)
  totals = getTotals(calibratedMeals);
  let budgetIterations = 0;
  const MAX_BUDGET_ITERATIONS = 10;
  const areMacrosWithinTolerance = (value: typeof totals) => NutritionValidationEngine.validateMacros(
    { calories: value.cal, protein: value.pro, carbs: value.carb, fat: value.fat },
    { caloriesTarget: targetCals, proteinTarget: targetPro, carbsTarget: targetCarbs, fatTarget: targetFat }
  ).valid;
  while (totals.cost > dailyBudgetCap && budgetIterations < MAX_BUDGET_ITERATIONS) {
    budgetIterations++;
    // Scale factor: ratio of cap to current cost, with a small margin to converge faster
    const scaleFactor = Math.min(0.85, dailyBudgetCap / totals.cost);
    const budgetAdjustedMeals = calibratedMeals.map((m: any) => {
      const items = (m.meal_plan_items || []).map((it: any) => {
        const info = getItemInfo(it);
        let q = Number(it.quantity) || 1;
        if (!info.isCore && info.unitCost > 0) {
          q = Math.max(0.1, Number((q * scaleFactor).toFixed(1)));
        }
        return {
          ...it,
          quantity: q,
          calories: Math.round(info.unitCals * q),
          protein: Number((info.unitPro * q).toFixed(1)),
          carbs: Number((info.unitCarbs * q).toFixed(1)),
          fat: Number((info.unitFat * q).toFixed(1)),
          estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        };
      });
      return { ...m, meal_plan_items: items, items };
    });

    const adjustedTotals = getTotals(budgetAdjustedMeals);
    // Keep the last set of quantities that still meets the macro targets. The
    // caller will reject the plan if the budget cannot be met at that point.
    if (areMacrosWithinTolerance(adjustedTotals) || !areMacrosWithinTolerance(totals)) {
      calibratedMeals = budgetAdjustedMeals;
      totals = adjustedTotals;
    } else {
      break;
    }
  }

  // Final summary update per meal
  return calibratedMeals.map((m: any) => {
    const items = m.meal_plan_items || m.items || [];
    const publicItems = items.map(({ unit_food_nutrition, ...item }: any) => item);
    const finalCals = Math.round(items.reduce((s: number, it: any) => s + (Number(it.calories) || 0), 0));
    const finalPro = Number(items.reduce((s: number, it: any) => s + (Number(it.protein) || 0), 0).toFixed(1));
    const finalCarbs = Number(items.reduce((s: number, it: any) => s + (Number(it.carbs) || 0), 0).toFixed(1));
    const finalFat = Number(items.reduce((s: number, it: any) => s + (Number(it.fat) || 0), 0).toFixed(1));
    const finalCost = items.reduce((s: number, it: any) => s + (Number(it.estimated_cost) || 0), 0);

    return {
      ...m,
      calories: finalCals,
      protein: finalPro,
      carbs: finalCarbs,
      fat: finalFat,
      estimated_cost: Math.round(finalCost),
      meal_plan_items: publicItems,
      items: publicItems
    };
  });
}

function parseAIItemText(value: unknown): Array<{ name: string; servingSize: string; multiplier: number }> {
  const text = String(value || "").trim();
  if (!text) return [];

  return text
    .split(/\s+\+\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      let name = part;
      let multiplier = 1;
      let servingSize = "";

      // Pattern A: Leading multiplier like '3x Boiled Eggs...' or '3 Boiled Eggs...'
      const leadingMatch = name.match(/^(\d+(?:\.\d+)?)\s*x?\s+(.+)$/i);
      if (leadingMatch && !/^(?:bowl|cup|serving|plate|tbsp|tsp|g|kg|ml|l)\b/i.test(leadingMatch[2])) {
        multiplier = Math.max(Number(leadingMatch[1]) || 1, 0.25);
        name = leadingMatch[2].trim();
        servingSize = `${multiplier} servings`;
      }

      // Pattern B: Dash format like 'Whole Eggs (Boiled) - 3 large eggs' or 'Soya Chunks - 50g dry'
      // Strictly require whitespace around dash to prevent splitting words like 'Hostel-provided' or 'Pre-workout'
      const dashMatch = name.match(/^(.+?)\s+[-—–]\s+(.+)$/);
      if (dashMatch) {
        name = dashMatch[1].trim();
        servingSize = dashMatch[2].trim();
        const numInServing = servingSize.match(/^(\d+(?:\.\d+)?)/);
        if (numInServing && multiplier === 1) {
          const num = Number(numInServing[1]);
          if (/(?:egg|piece|chapati|roti|banana|apple|slice|large|medium|bowl|cup|plate|g|ml)/i.test(servingSize + " " + name)) {
            multiplier = num;
          }
        }
      }

      // Pattern C: Comma format like 'Boiled Eggs, 3 pieces'
      const commaMatch = name.match(/^(.+?),\s*(\d+(?:\.\d+)?)\s*(.+)$/);
      if (commaMatch) {
        name = commaMatch[1].trim();
        multiplier = Math.max(Number(commaMatch[2]) || 1, 0.25);
        servingSize = `${commaMatch[2]} ${commaMatch[3].trim()}`;
      }

      return {
        name,
        servingSize,
        multiplier,
      };
    });
}

export function findFoodReference(name: string, catalog: NutritionFoodReference[], foodEnv?: string): NutritionFoodReference | undefined {
  const normalizedName = normalizeFoodName(name);
  if (!normalizedName) return undefined;

  // Rotating menus use short names for these reviewed cooked servings.
  const reviewedAliases: Record<string, string> = {
    "mixed vegetables": "mixed vegetable sabzi",
    "soy chunks": "soya chunks curry",
    "chickpeas": "chole chana masala",
  };
  const reviewedAlias = reviewedAliases[normalizedName];
  if (reviewedAlias) {
    const match = catalog.find((food) => normalizeFoodName(food.name) === reviewedAlias);
    if (match) return match;
  }

  // 1. Check if it's a provided core meal (PG, Hostel, Mess, Home Core)
  if (/\b(?:pg|hostel|mess|provided core|provided meal|core meal|base meal|standard base)\b/i.test(name)) {
    const coreRef = catalog.find((f) => f.name.includes("Provided Core") || f.name.includes("Core Meal") || f.name.includes("Base Meal") || f.name.includes("Standard Base"));
    if (coreRef) {
      const cleanEnv = (foodEnv || '').trim().toLowerCase();
      const displayName = cleanEnv === 'pg'
        ? 'PG Meal (Rice, Dal & Sabzi)'
        : cleanEnv === 'hostel'
        ? 'Hostel Mess Meal (Rice, Dal & Sabzi)'
        : cleanEnv === 'home' || cleanEnv === 'i cook'
        ? 'Home Meal (Rice, Dal & Sabzi)'
        : cleanEnv.includes('canteen') || cleanEnv.includes('office')
        ? 'Canteen Meal (Rice, Dal & Sabzi)'
        : 'Standard Base Meal (Rice, Dal & Sabzi)';
      return {
        ...coreRef,
        name: displayName,
        serving_size: "1 Plate",
      };
    }
  }

  // 2. Exact match on normalized food name
  const exact = catalog.find((food) => normalizeFoodName(food.name) === normalizedName);
  if (exact) return exact;

  // 3. Substring match
  const sub = catalog.find((food) => {
    const candidate = normalizeFoodName(food.name);
    return candidate.includes(normalizedName) || normalizedName.includes(candidate);
  });
  if (sub) return sub;

  // 4. Keyword token match for common staple foods
  const keywords = [
    'egg', 'soya', 'paneer', 'curd', 'dahi', 'chicken', 'fish', 'tofu',
    'rice', 'dal', 'chana', 'rajma', 'oats', 'poha', 'upma', 'dosa',
    'idli', 'milk', 'peanut', 'banana', 'apple', 'sprouts'
  ];
  for (const kw of keywords) {
    if (normalizedName.includes(kw)) {
      const match = catalog.find((f) => normalizeFoodName(f.name).includes(kw));
      if (match) return match;
    }
  }

  return undefined;
}

export function sanitizeAIItemName(name: string, isVegan?: boolean, isVegetarian?: boolean, isEggetarian?: boolean): string {
  let cleaned = String(name || '').trim();
  if (!cleaned) return cleaned;

  if (/\b(?:whey|casein|pea\s*protein|plant\s*protein|protein\s*powder|protein\s*shake|mass\s*gainer)\b/i.test(cleaned)) {
    if (isVegan) return "Soy Chunks (Cooked)";
    if (isVegetarian) return "Low Fat Paneer";
    return "Boiled Eggs (2 pieces)";
  }

  if (isVegan) {
    if (/\b(?:palak\s*paneer|paneer\s*bhurji|paneer\s*tikka|paneer|cottage\s*cheese)\b/i.test(cleaned)) {
      return "Soy Chunks (Cooked)";
    }
    if (/\b(?:curd|dahi|yogurt|raita)\b/i.test(cleaned)) {
      return "Mixed Vegetables";
    }
    if (/\b(?:whole\s*milk|toned\s*milk|cow\s*milk|buffalo\s*milk|milk|chaas|buttermilk|lassi)\b/i.test(cleaned)) {
      return "Apple";
    }
    if (/\b(?:egg\s*bhurji|boiled\s*egg|egg\s*white|egg|eggs|omelette)\b/i.test(cleaned)) {
      return "Soy Chunks (Cooked)";
    }
    if (/\b(?:chicken\s*breast|chicken\s*curry|chicken|fish\s*curry|fish|mutton|meat|beef|pork|prawn|shrimp)\b/i.test(cleaned)) {
      return "Soy Chunks (Cooked)";
    }
    if (/\b(?:ghee|butter|cheese)\b/i.test(cleaned)) {
      return "Roasted Peanuts";
    }
  } else if (isVegetarian) {
    if (/\b(?:egg\s*bhurji|boiled\s*egg|egg\s*white|egg|eggs|omelette)\b/i.test(cleaned)) {
      return "Paneer Tikka";
    }
    if (/\b(?:chicken|fish|mutton|meat|beef|pork|prawn|seafood)\b/i.test(cleaned)) {
      return "Paneer Tikka";
    }
  } else if (isEggetarian) {
    if (/\b(?:chicken|fish|mutton|meat|beef|pork|prawn|seafood)\b/i.test(cleaned)) {
      return "Boiled Egg";
    }
  }

  return cleaned;
}

export function sanitizeMealTitle(title: string, isVegan?: boolean, isVegetarian?: boolean, isEggetarian?: boolean): string {
  let cleaned = String(title || '').trim();
  if (!cleaned) return cleaned;

  if (isVegan) {
    cleaned = cleaned
      .replace(/\bPalak Paneer\b/gi, 'Light Dal Tadka')
      .replace(/\b(?:Paneer|Egg)\s*Bhurji\b/gi, 'Savory Soya')
      .replace(/\bPaneer Tikka\b/gi, 'Soy Chunks')
      .replace(/\bPaneer\b/gi, 'Soya')
      .replace(/\bBoiled Eggs?\b/gi, 'Roasted Peanuts')
      .replace(/\bEggs?\b/gi, 'Soya')
      .replace(/\bBhurji\b/gi, 'Savory Soya')
      .replace(/\bChicken (?:Curry|Breast)?\b/gi, 'Soya Curry')
      .replace(/\b(?:Rohu\s*)?Fish Curry\b/gi, 'Dal Tadka')
      .replace(/\bWhole Milk\b/gi, 'Peanuts')
      .replace(/\bMilk\b/gi, 'Peanuts')
      .replace(/\bFresh Curd\b/gi, 'Salad')
      .replace(/\bCooling Dahi\b/gi, 'Salad')
      .replace(/\bDahi\b/gi, 'Salad')
      .replace(/\bCurd\b/gi, 'Salad')
      .replace(/&\s*Salad/gi, '& Salad')
      .replace(/with\s*Salad/gi, 'with Salad')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } else if (isVegetarian) {
    cleaned = cleaned
      .replace(/\bChicken (?:Curry|Breast)?\b/gi, 'Paneer Tikka')
      .replace(/\b(?:Rohu\s*)?Fish Curry\b/gi, 'Paneer Tikka')
      .replace(/\bEgg Bhurji\b/gi, 'Paneer Bhurji')
      .replace(/\bBoiled Eggs?\b/gi, 'Paneer Tikka')
      .replace(/\bEggs?\b/gi, 'Paneer')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } else if (isEggetarian) {
    cleaned = cleaned
      .replace(/\bChicken (?:Curry|Breast)?\b/gi, 'Boiled Eggs')
      .replace(/\b(?:Rohu\s*)?Fish Curry\b/gi, 'Egg Curry')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  return cleaned;
}

function findAiMealForSlot(
  mType: string,
  slotIdx: number,
  allSlots: string[],
  meals: any[]
): any | null {
  if (!Array.isArray(meals) || meals.length === 0) return null;

  const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');

  // 1. Keyword match on meal_name or time_of_day
  let match = meals.find((m: any) => {
    const text = `${normalize(m.meal_name)} ${normalize(m.time_of_day)}`;
    if (mType === 'breakfast') {
      return text.includes('breakfast') || text.includes('morning');
    }
    if (mType === 'lunch') {
      return text.includes('lunch') || text.includes('midday') || text.includes('noon');
    }
    if (mType === 'dinner') {
      return text.includes('dinner') || text.includes('night') || text.includes('supper');
    }
    if (mType === 'snack') {
      return text.includes('snack') || text.includes('tea') || text.includes('evening') || text.includes('refuel');
    }
    if (mType === 'pre_workout') {
      return text.includes('pre workout') || text.includes('preworkout') || text.includes('snack') || text.includes('energy');
    }
    if (mType === 'post_workout') {
      return text.includes('post workout') || text.includes('postworkout') || text.includes('recovery');
    }
    return text.includes(mType.replace('_', ' '));
  });

  if (match) return match;

  // 2. Check for "Meal 1", "Meal 2", etc. matching slot index (1-based)
  const slotNum = slotIdx + 1;
  match = meals.find((m: any) => {
    const text = normalize(m.meal_name);
    return text.includes(`meal ${slotNum}`) || text.includes(`meal${slotNum}`);
  });
  if (match) return match;

  // 3. Positional fallback if index within bounds
  if (meals[slotIdx]) {
    return meals[slotIdx];
  }

  return null;
}

export interface LogFoodInput {
  food_id?: string;
  meal_type: string;
  quantity: number;
  custom_food?: {
    name: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    estimated_cost?: number;
  };
}

export interface WeeklyPlanEligibility {
  can_generate: boolean;
  has_active_plan: boolean;
  last_generated_at: string | null;
  next_available_date: string | null;
  next_available_formatted: string | null;
  days_remaining: number;
  plans_used_this_month: number;
  max_plans_per_month: number;
  reason?: 'weekly_cooldown' | 'monthly_limit_reached' | 'eligibility_unavailable' | null;
  message?: string;
}

// Concurrency & debounce locks to prevent duplicate meal logging on rapid clicks
const mealLogInFlight = new Map<string, Promise<any[]>>();

export class NutritionService {
  
  static invalidateServerCache(userId?: string) {
    invalidateNutritionServerCache(userId);
  }

  /**
   * Checks whether the user is eligible to generate a new AI weekly meal plan.
   * Strictly enforces 1 generation per 7 days and max 4 generations per month.
   */
  static async getWeeklyPlanEligibility(userId: string): Promise<WeeklyPlanEligibility> {
    try {
      const supabase = createAdminClient();
      const { data: logs, error } = await supabase
        .from('ai_usage_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('feature', 'meal_generation')
        .eq('status', 'success')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      if (!logs || logs.length === 0) {
        // Fallback check: check if the user already has an active workout plan with upgraded nutrition or meal_plans
        try {
          const [{ data: wp, error: wpError }, { data: mp, error: mpError }] = await Promise.all([
            supabase
              .from('fitness_os_workout_plans')
              .select('plan_data, updated_at')
              .eq('user_id', userId)
              .eq('status', 'active')
              .maybeSingle(),
            supabase
              .from('meal_plans')
              .select('id, created_at')
              .eq('user_id', userId)
              .limit(1)
              .maybeSingle()
          ]);
          if (wpError || mpError) throw wpError || mpError;

          const hasNutrition = (wp?.plan_data as any)?._nutritionUpgrade?.status === 'complete' ||
            (Array.isArray((wp?.plan_data as any)?.nutrition?.meals) && (wp?.plan_data as any)?.nutrition?.meals.length > 0) ||
            Boolean(mp?.id);

          if (hasNutrition) {
            const planTime = wp?.updated_at ? new Date(wp.updated_at).getTime() : (mp?.created_at ? new Date(mp.created_at).getTime() : Date.now());
            const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
            const nextWeeklyAvailTime = planTime + WEEK_MS;
            const now = Date.now();
            const isWeeklyCooldown = now < nextWeeklyAvailTime;
            const daysRemaining = Math.max(1, Math.ceil((nextWeeklyAvailTime - now) / (24 * 60 * 60 * 1000)));
            const nextAvailDate = new Date(nextWeeklyAvailTime);
            const formattedDate = nextAvailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
              can_generate: !isWeeklyCooldown,
              has_active_plan: true,
              last_generated_at: new Date(planTime).toISOString(),
              next_available_date: nextAvailDate.toISOString(),
              next_available_formatted: formattedDate,
              days_remaining: isWeeklyCooldown ? daysRemaining : 0,
              plans_used_this_month: 1,
              max_plans_per_month: 4,
              reason: isWeeklyCooldown ? "weekly_cooldown" : null
            };
          }
        } catch (fbErr) {
          console.warn("[getWeeklyPlanEligibility] Fallback eligibility check failed:", fbErr);
          throw fbErr;
        }

        return {
          can_generate: true,
          has_active_plan: false,
          last_generated_at: null,
          next_available_date: null,
          next_available_formatted: null,
          days_remaining: 0,
          plans_used_this_month: 0,
          max_plans_per_month: 4,
          reason: null
        };
      }

      const now = Date.now();
      const lastLog = logs[0];
      const lastGenTime = new Date(lastLog.created_at).getTime();

      const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

      const nextWeeklyAvailTime = lastGenTime + WEEK_MS;
      const isWeeklyCooldown = now < nextWeeklyAvailTime;

      // Check rolling 30-day count for monthly limit
      const thirtyDaysAgoTime = now - THIRTY_DAYS_MS;
      const logsInLast30Days = logs.filter(l => new Date(l.created_at).getTime() >= thirtyDaysAgoTime);
      const plansUsedThisMonth = logsInLast30Days.length;
      const isMonthlyLimitReached = plansUsedThisMonth >= 4;

      if (isMonthlyLimitReached) {
        const sortedLogs = [...logsInLast30Days].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const oldestLog = sortedLogs[0];
        const nextMonthlyAvailTime = new Date(oldestLog.created_at).getTime() + THIRTY_DAYS_MS;
        const effectiveNextTime = Math.max(nextWeeklyAvailTime, nextMonthlyAvailTime);
        const daysRemaining = Math.max(1, Math.ceil((effectiveNextTime - now) / (24 * 60 * 60 * 1000)));

        const nextDate = new Date(effectiveNextTime);
        const formattedDate = nextDate.toLocaleDateString("en-US", {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        return {
          can_generate: false,
          has_active_plan: true,
          last_generated_at: lastLog.created_at,
          next_available_date: nextDate.toISOString(),
          next_available_formatted: formattedDate,
          days_remaining: daysRemaining,
          plans_used_this_month: plansUsedThisMonth,
          max_plans_per_month: 4,
          reason: 'monthly_limit_reached',
          message: `Monthly limit of 4 AI meal plans reached (${plansUsedThisMonth}/4). Next plan unlocks on ${formattedDate}.`
        };
      }

      if (isWeeklyCooldown) {
        const daysRemaining = Math.max(1, Math.ceil((nextWeeklyAvailTime - now) / (24 * 60 * 60 * 1000)));
        const nextDate = new Date(nextWeeklyAvailTime);
        const formattedDate = nextDate.toLocaleDateString("en-US", {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        return {
          can_generate: false,
          has_active_plan: true,
          last_generated_at: lastLog.created_at,
          next_available_date: nextDate.toISOString(),
          next_available_formatted: formattedDate,
          days_remaining: daysRemaining,
          plans_used_this_month: plansUsedThisMonth,
          max_plans_per_month: 4,
          reason: 'weekly_cooldown',
          message: `Your active 7-day meal plan is currently running. Next weekly plan unlocks on ${formattedDate} (Limit: 1 per week, 4 per month).`
        };
      }

      return {
        can_generate: true,
        has_active_plan: true,
        last_generated_at: lastLog.created_at,
        next_available_date: null,
        next_available_formatted: null,
        days_remaining: 0,
        plans_used_this_month: plansUsedThisMonth,
        max_plans_per_month: 4,
        reason: null
      };
    } catch (eligibilityError) {
      console.error("[getWeeklyPlanEligibility] Could not verify plan quota:", eligibilityError);
      return {
        can_generate: false,
        has_active_plan: false,
        last_generated_at: null,
        next_available_date: null,
        next_available_formatted: null,
        days_remaining: 0,
        plans_used_this_month: 0,
        max_plans_per_month: 4,
        reason: 'eligibility_unavailable',
        message: 'Could not verify your weekly plan allowance right now. Your saved plan is unchanged. Please try again later.'
      };
    }
  }

  /**
   * Retrieves the user's timezone from their profile, defaulting to UTC.
   * Cached in-process with a 10-minute TTL and wrapped in React cache() to prevent duplicate DB calls.
   */
  static getUserTimezone = cache(async (userId: string): Promise<string> => {
    if (!userId) return 'UTC';
    const tzCache = getUserTimezoneCache();
    const now = Date.now();
    const cached = tzCache.get(userId);
    if (cached && cached.expiresAt > now) {
      return cached.tz;
    }
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .maybeSingle();
    const tz = data?.timezone || 'UTC';
    tzCache.set(userId, { tz, expiresAt: now + 10 * 60 * 1000 });
    return tz;
  });

  /**
   * Returns a YYYY-MM-DD string for the current date in the user's timezone.
   */
  static async getLocalDateString(userId: string, preFetchedTz?: string): Promise<string> {
    const tz = preFetchedTz || await this.getUserTimezone(userId);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD
  }

  /**
   * Returns the start and end of the user's current day in UTC as ISO strings.
   * Useful for querying timestamptz columns (like logged_at).
   */
  static async getLocalDateBoundaries(userId: string, preFetchedTz?: string, customDateStr?: string): Promise<{ start: string, end: string }> {
    const tz = preFetchedTz || await this.getUserTimezone(userId);
    const dateStr = customDateStr || await this.getLocalDateString(userId, tz); // YYYY-MM-DD
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'longOffset',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(new Date());
    let offsetStr = parts.find(p => p.type === 'timeZoneName')?.value; // e.g. "GMT+05:30"
    if (!offsetStr || offsetStr === 'GMT') offsetStr = 'GMT+00:00';
    offsetStr = offsetStr.replace('GMT', ''); // "+05:30"
    
    const start = new Date(`${dateStr}T00:00:00.000${offsetStr}`).toISOString();
    const end = new Date(`${dateStr}T23:59:59.999${offsetStr}`).toISOString();
    
    return { start, end };
  }

  /**
   * Recalculates nutrition targets from current fitness profile data,
   * invalidates stale target records, and upserts a fresh target record.
   */
  static async recalculateTargetsForUser(
    userId: string,
    fitProfile?: any,
    localDate?: string
  ): Promise<any> {
    const supabase = createAdminClient();
    const effectiveDate = localDate || await this.getLocalDateString(userId);

    let profile = fitProfile;
    if (!profile) {
      const { data: fetchedProfile } = await supabase
        .from('fitness_os_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      profile = fetchedProfile;
    }

    if (!profile) {
      return {
        user_id: userId,
        calories: 2000,
        protein: 130,
        carbs: 225,
        fat: 55,
        water_ml: 3000,
        effective_date: effectiveDate
      };
    }

    const computed = calculateTargets(profile);
    const calories = computed.calories;
    const protein = computed.protein_g;
    const carbs = computed.carbs_g || Math.round((calories * 0.45) / 4);
    const fat = computed.fat_g || Math.round((calories * 0.25) / 9);
    const water_ml = computed.water_ml || 3000;

    const { data: existing } = await supabase
      .from('nutrition_targets')
      .select('id')
      .eq('user_id', userId)
      .eq('effective_date', effectiveDate)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      const { data: updated } = await supabase
        .from('nutrition_targets')
        .update({
          calories,
          protein,
          carbs,
          fat,
          water_ml,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      invalidateNutritionServerCache(userId);
      if (updated) return updated;
    } else {
      const { data: inserted } = await supabase
        .from('nutrition_targets')
        .insert({
          user_id: userId,
          effective_date: effectiveDate,
          calories,
          protein,
          carbs,
          fat,
          water_ml,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      invalidateNutritionServerCache(userId);
      if (inserted) return inserted;
    }

    return {
      user_id: userId,
      effective_date: effectiveDate,
      calories,
      protein,
      carbs,
      fat,
      water_ml
    };
  }

  static async getTargets(
    userId: string,
    preFetchedDate?: string,
    preFetchedTz?: string,
    preFetchedProfile?: any,
    preFetchedPlanData?: any
  ) {
    return this.getEffectiveTargets(userId, preFetchedDate, preFetchedTz, preFetchedProfile, preFetchedPlanData);
  }

  static async getEffectiveTargets(
    userId: string,
    preFetchedDate?: string,
    preFetchedTz?: string,
    preFetchedProfile?: any,
    preFetchedPlanData?: any
  ) {
    const supabase = createAdminClient();
    const localDate = preFetchedDate || await this.getLocalDateString(userId, preFetchedTz);
    
    // Fetch profile to verify target freshness
    let fitProfile = preFetchedProfile;
    if (!fitProfile) {
      const { data: resProfile } = await supabase
        .from('fitness_os_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      fitProfile = resProfile;
    }

    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .lte('effective_date', localDate)
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    // Freshness & Invalidation Check:
    // If target exists and fitProfile exists, check if profile was updated after target was written
    if (data && fitProfile) {
      const profileUpdatedAt = fitProfile.updated_at ? new Date(fitProfile.updated_at).getTime() : 0;
      const targetUpdatedAt = data.updated_at
        ? new Date(data.updated_at).getTime()
        : (data.created_at ? new Date(data.created_at).getTime() : 0);

      // If profile was updated after this target was written (with 2-second grace period)
      if (profileUpdatedAt > targetUpdatedAt + 2000) {
        return await this.recalculateTargetsForUser(userId, fitProfile, localDate);
      }
      return data;
    }

    if (data) return data;

    // If no target existed in table, calculate and persist immediately
    if (fitProfile) {
      return await this.recalculateTargetsForUser(userId, fitProfile, localDate);
    }

    let planNut = preFetchedPlanData?.nutrition;
    if (!planNut && preFetchedPlanData === undefined) {
      const { data: activePlan } = await supabase
        .from('fitness_os_workout_plans')
        .select('plan_data')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      planNut = activePlan?.plan_data?.nutrition;
    }

    let calories = planNut?.daily_calories;
    let protein = planNut?.protein_grams;
    let carbs = planNut?.carbs_grams;
    let fat = planNut?.fat_grams;
    let water_ml = planNut?.water_ml;

    if (!calories || !protein) {
      if (fitProfile) {
        const computed = calculateTargets(fitProfile as any);
        calories = computed.calories;
        protein = computed.protein_g;
        carbs = carbs || computed.carbs_g;
        fat = fat || computed.fat_g;
        water_ml = water_ml || computed.water_ml;
      } else {
        calories = 2000;
        protein = 130;
        carbs = 225;
        fat = 55;
        water_ml = 3000;
      }
    }

    if (!carbs) carbs = Math.round((calories * 0.45) / 4);
    if (!fat) fat = Math.round((calories * 0.25) / 9);
    if (!water_ml) water_ml = 3000;

    // Compute budget from fitness profile
    let monthlyBudget = 3000;
    let dailyBudget = 100;
    if (fitProfile?.nutrition_budget) {
      const bStr = fitProfile.nutrition_budget;
      if (bStr.includes('5,000+') || bStr === '₹5,000+') monthlyBudget = 6000;
      else if ((bStr.includes('2,000') && bStr.includes('5,000')) || bStr === '₹2,000–5,000' || bStr === '₹2,000-5,000') monthlyBudget = 3500;
      else if ((bStr.includes('1,000') && bStr.includes('2,000')) || bStr === '₹1,000–2,000' || bStr === '₹1,000-2,000') monthlyBudget = 1500;
      else if ((bStr.includes('0') && bStr.includes('1,000')) || bStr === '₹0–1,000' || bStr === '₹0-1,000') monthlyBudget = 800;
      dailyBudget = Math.round(monthlyBudget / 30);
    }

    // Save auto-generated target row into database
    const { data: newTarget } = await supabase
      .from('nutrition_targets')
      .insert({
        user_id: userId,
        calories,
        protein,
        carbs,
        fat,
        water_ml,
        effective_date: localDate
      })
      .select()
      .maybeSingle();

    if (newTarget) return newTarget;

    // Return synthetic target object if database save was skipped
    return {
      user_id: userId,
      calories,
      protein,
      carbs,
      fat,
      water_ml,
      daily_budget: dailyBudget,
      monthly_budget: monthlyBudget,
      effective_date: localDate
    };
  }

  static computeNutritionScore(consumed: any, targets: any, mealsCompleted: number, totalMeals: number = 4): number {
    if (!targets) return 0;
    
    // Weights
    const calWeight = 0.35;
    const proWeight = 0.35;
    const waterWeight = 0.15;
    const mealWeight = 0.15;

    // 1. Calories (Proximity penalty)
    // Optimal is exactly target.
    // Drop score linearly if too low or too high.
    let calScore = 0;
    if (targets.calories > 0) {
      const calRatio = consumed.calories / targets.calories;
      if (calRatio <= 1) {
        calScore = calRatio * 100; // 0 to 100
      } else {
        // Penalty for overeating: lose 1% score for every 1% over
        const overPercent = (calRatio - 1) * 100;
        calScore = Math.max(0, 100 - overPercent);
      }
    }

    // 2. Protein (Reward hitting target, soft cap over)
    let proScore = 0;
    if (targets.protein > 0) {
      const proRatio = consumed.protein / targets.protein;
      if (proRatio <= 1) {
        proScore = proRatio * 100;
      } else {
        // Soft cap for overconsumption (doesn't penalize heavily but caps at 100)
        proScore = 100;
      }
    }

    // 3. Water (Cap at 100)
    let waterScore = 0;
    if (targets.water_ml > 0) {
      waterScore = Math.min(100, (consumed.water_ml / targets.water_ml) * 100);
    }

    // 4. Meals (Don't penalize if no meals planned. If planned, check completion)
    let mealScore = 100;
    if (totalMeals > 0) {
      mealScore = Math.min(100, (mealsCompleted / totalMeals) * 100);
    }

    const total = (calScore * calWeight) + (proScore * proWeight) + (waterScore * waterWeight) + (mealScore * mealWeight);
    return Math.round(total);
  }

  static async logFood(userId: string, input: LogFoodInput) {
    if (input.quantity <= 0) throw new Error("Quantity must be greater than zero");
    if (!input.food_id && !input.custom_food) throw new Error("Must provide food_id or custom_food");
    
    const supabase = await createServerSupabase();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let finalFoodId = input.food_id && UUID_REGEX.test(input.food_id) ? input.food_id : null;
    let food: any = null;

    if (finalFoodId) {
      // 1. Fetch canonical food
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', finalFoodId)
        .eq('is_active', true)
        .single();
      if (!error && data) {
        food = data;
      }
    }

    if (!food && input.food_id && !UUID_REGEX.test(input.food_id)) {
      const adminClient = require('@/lib/services/supabase/admin').createAdminClient();
      const candidateName = input.food_id.replace(/-addon$/i, '').replace(/-/g, ' ').trim();
      const { data: existingByName } = await adminClient
        .from('foods')
        .select('*')
        .ilike('name', candidateName)
        .limit(1)
        .maybeSingle();
      if (existingByName) {
        food = existingByName;
        finalFoodId = existingByName.id;
      }
    }

    if (!food && input.custom_food) {
      // Search for existing custom food by name
      const adminClient = require('@/lib/services/supabase/admin').createAdminClient();
      const foodName = input.custom_food.name.trim();
      const { data: existing } = await adminClient
        .from('foods')
        .select('*')
        .ilike('name', foodName)
        .limit(1)
        .maybeSingle();

      if (existing) {
        food = existing;
        finalFoodId = existing.id;
      } else {
        // Create new food using admin client to bypass RLS restrictions on foods table
        const { data: newFood, error: newFoodErr } = await adminClient
          .from('foods')
          .insert({
            name: foodName,
            category: input.custom_food.category,
            serving_size: (input.custom_food as any).serving_size || '1 serving',
            calories: Number(input.custom_food.calories) || 0,
            protein: Number(input.custom_food.protein) || 0,
            carbs: Number(input.custom_food.carbs) || 0,
            fat: Number(input.custom_food.fat) || 0,
            estimated_cost: Number(input.custom_food.estimated_cost) || 0,
            is_active: false // Critical: Keep custom foods out of the public AI database pool!
          })
          .select()
          .maybeSingle();

        if (newFood) {
          food = newFood;
          finalFoodId = newFood.id;
        } else if (newFoodErr?.code === '23505') {
          const { data: dupFood } = await adminClient
            .from('foods')
            .select('*')
            .ilike('name', foodName)
            .limit(1)
            .maybeSingle();
          if (dupFood) {
            food = dupFood;
            finalFoodId = dupFood.id;
          }
        } else {
          throw new Error("FAILED_TO_CREATE_CUSTOM_FOOD: " + JSON.stringify(newFoodErr));
        }
      }
    }

    if (!food) {
      throw new Error("FOOD_NOT_FOUND");
    }

    // 2. Calculate scaled values
    const { data: fitProfile } = await supabase
      .from('fitness_os_profiles')
      .select('food_environment')
      .eq('user_id', userId)
      .maybeSingle();

    const isCore = isStapleCoreFood(food.name, fitProfile?.food_environment);
    const unitCost = isCore ? 0 : getRealisticFoodCost(food.name, food.estimated_cost);

    const scaledCalories = Math.round(food.calories * input.quantity);
    const scaledProtein = Number((food.protein * input.quantity).toFixed(2));
    const scaledCarbs = Number((food.carbs * input.quantity).toFixed(2));
    const scaledFat = Number((food.fat * input.quantity).toFixed(2));
    const scaledCost = Number((unitCost * input.quantity).toFixed(2));

    // 3. Double-click prevention: check for duplicate log in the last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    const { data: recentDuplicate } = await supabase
      .from('food_logs')
      .select('*, foods(*)')
      .eq('user_id', userId)
      .eq('meal_type', input.meal_type)
      .eq('food_id', finalFoodId)
      .gte('logged_at', fiveSecondsAgo)
      .maybeSingle();

    if (recentDuplicate) {
      return recentDuplicate;
    }

    // Insert log
    const { data: log, error: logErr } = await supabase
      .from('food_logs')
      .insert({
        user_id: userId,
        food_id: finalFoodId,
        meal_type: input.meal_type,
        quantity: input.quantity,
        calories: scaledCalories,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        estimated_cost: scaledCost,
        source: 'manual'
      })
      .select('*, foods(*)')
      .single();

    if (logErr) throw logErr;

    // 4. Trigger background summary update asynchronously without blocking the response
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in logFood:", err);
    });

    return log;
  }

  static async logMultipleFoods(userId: string, items: LogFoodInput[]) {
    if (!items || items.length === 0) return [];

    const mealTypes = Array.from(new Set(items.map(it => it.meal_type || 'meal'))).sort().join(',');
    const lockKey = `${userId}:${mealTypes}`;

    const inFlight = mealLogInFlight.get(lockKey);
    if (inFlight) {
      return inFlight;
    }

    const execLog = async (): Promise<any[]> => {
      // This method is called by the authenticated Pro-only API route. Use the
      // server client for all batch writes so plan items hidden by food RLS can
      // still be resolved and logged as the verified user.
      const adminClient = createAdminClient();

      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // Collect valid food UUIDs
      const validUuids = items
        .map(it => it.food_id)
        .filter((id): id is string => Boolean(id && UUID_REGEX.test(id)));

      // The meal plan can reference inactive custom foods, which the user's RLS
      // catalog query hides. Resolve them in one admin lookup, parallel with
      // timezone and profile, instead of falling back to a query per item.
      const [profileResult, foodsResult, tz] = await Promise.all([
        adminClient.from('fitness_os_profiles')
          .select('food_environment')
          .eq('user_id', userId)
          .maybeSingle(),
        validUuids.length > 0
          ? adminClient.from('foods').select('*').in('id', validUuids)
          : Promise.resolve({ data: [] as any[], error: null }),
        NutritionService.getUserTimezone(userId),
      ]);
      if (foodsResult.error) throw foodsResult.error;
      const fitProfile = profileResult.data;
      const foodsById = new Map<string, any>();
      (foodsResult.data || []).forEach((food: any) => foodsById.set(food.id, food));

      const logsToInsert: any[] = [];

      for (const item of items) {
        const q = Number(item.quantity) || 1;
        if (q <= 0) continue;

        let food: any = null;
        let finalFoodId: string | null = null;

        if (item.food_id && UUID_REGEX.test(item.food_id)) {
          food = foodsById.get(item.food_id);
          if (food) finalFoodId = food.id;
        }

        // Try candidate name lookup if food not yet found by UUID
        const candidateName = (
          item.custom_food?.name ||
          (item as any).name ||
          (item.food_id && !UUID_REGEX.test(item.food_id) ? item.food_id.replace(/-addon$/i, '').replace(/-/g, ' ') : '') ||
          ''
        ).trim();

        if (!food && candidateName) {
          const { data: existingByName } = await adminClient
            .from('foods')
            .select('*')
            .ilike('name', candidateName)
            .limit(1)
            .maybeSingle();

          if (existingByName) {
            food = existingByName;
            finalFoodId = existingByName.id;
          }
        }

        if (!food && item.custom_food) {
          const foodName = (item.custom_food.name || candidateName || 'Custom Food').trim();
          const { data: newFood, error: newFoodErr } = await adminClient
            .from('foods')
            .insert({
              name: foodName,
              category: item.custom_food.category || item.meal_type || 'meal',
              serving_size: (item.custom_food as any).serving_size || '1 serving',
              calories: Number(item.custom_food.calories) || 0,
              protein: Number(item.custom_food.protein) || 0,
              carbs: Number(item.custom_food.carbs) || 0,
              fat: Number(item.custom_food.fat) || 0,
              estimated_cost: Number(item.custom_food.estimated_cost) || 0,
              is_active: false
            })
            .select()
            .maybeSingle();

          if (newFood) {
            food = newFood;
            finalFoodId = newFood.id;
          } else if (newFoodErr?.code === '23505') {
            const { data: dupFood } = await adminClient
              .from('foods')
              .select('*')
              .ilike('name', foodName)
              .limit(1)
              .maybeSingle();
            if (dupFood) {
              food = dupFood;
              finalFoodId = dupFood.id;
            }
          }
        }

        if (!food) {
          // Fallback food to guarantee foreign key validity while preserving macros
          const foodName = (candidateName || (item as any).name || 'Meal Item').trim();
          const fbCals = item.custom_food?.calories ?? (item as any).calories ?? 0;
          const fbPro = item.custom_food?.protein ?? (item as any).protein ?? 0;
          const fbCarbs = item.custom_food?.carbs ?? (item as any).carbs ?? 0;
          const fbFat = item.custom_food?.fat ?? (item as any).fat ?? 0;
          const fbCost = item.custom_food?.estimated_cost ?? (item as any).estimated_cost ?? 0;

          const { data: existingPlaceholder } = await adminClient
            .from('foods')
            .select('*')
            .ilike('name', foodName)
            .limit(1)
            .maybeSingle();

          if (existingPlaceholder) {
            food = existingPlaceholder;
            finalFoodId = existingPlaceholder.id;
          } else {
            const { data: placeholderFood, error: pErr } = await adminClient
              .from('foods')
              .insert({
                name: foodName,
                category: item.meal_type || 'meal',
                serving_size: (item.custom_food as any)?.serving_size || '1 serving',
                calories: Number(fbCals) || 0,
                protein: Number(fbPro) || 0,
                carbs: Number(fbCarbs) || 0,
                fat: Number(fbFat) || 0,
                estimated_cost: Number(fbCost) || 0,
                is_active: false
              })
              .select()
              .maybeSingle();

            if (placeholderFood) {
              food = placeholderFood;
              finalFoodId = placeholderFood.id;
            } else if (pErr?.code === '23505') {
              const { data: dupFood } = await adminClient
                .from('foods')
                .select('*')
                .ilike('name', foodName)
                .limit(1)
                .maybeSingle();
              if (dupFood) {
                food = dupFood;
                finalFoodId = dupFood.id;
              }
            }
          }
        }

        const rawCals = item.custom_food?.calories !== undefined ? item.custom_food.calories : (food?.calories !== undefined ? food.calories : ((item as any).calories || 0));
        const rawPro = item.custom_food?.protein !== undefined ? item.custom_food.protein : (food?.protein !== undefined ? food.protein : ((item as any).protein || 0));
        const rawCarbs = item.custom_food?.carbs !== undefined ? item.custom_food.carbs : (food?.carbs !== undefined ? food.carbs : ((item as any).carbs || 0));
        const rawFat = item.custom_food?.fat !== undefined ? item.custom_food.fat : (food?.fat !== undefined ? food.fat : ((item as any).fat || 0));
        const foodName = food?.name || item.custom_food?.name || (item as any).name || '';
        const isCore = isStapleCoreFood(foodName, fitProfile?.food_environment);
        const rawCost = item.custom_food?.estimated_cost !== undefined ? item.custom_food.estimated_cost : (food?.estimated_cost || 0);
        const unitCost = isCore ? 0 : getRealisticFoodCost(foodName, rawCost);

        const scaledCalories = Math.round(Number(rawCals) * q);
        const scaledProtein = Number((Number(rawPro) * q).toFixed(2));
        const scaledCarbs = Number((Number(rawCarbs) * q).toFixed(2));
        const scaledFat = Number((Number(rawFat) * q).toFixed(2));
        const scaledCost = Number((Number(unitCost) * q).toFixed(2));

        logsToInsert.push({
          user_id: userId,
          food_id: finalFoodId,
          meal_type: item.meal_type,
          quantity: q,
          calories: scaledCalories,
          protein: scaledProtein,
          carbs: scaledCarbs,
          fat: scaledFat,
          estimated_cost: scaledCost,
          source: 'manual'
        });
      }

      if (logsToInsert.length === 0) return [];

      // Idempotency & Deduplication: Check existing food_logs for this user on this local date
      const { start, end } = await NutritionService.getLocalDateBoundaries(userId, tz);

      const { data: existingLogs, error: existingLogsError } = await adminClient
        .from('food_logs')
        .select('*, foods(*)')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end);
      if (existingLogsError) throw existingLogsError;

      const finalLogs: any[] = [];
      const newInserts: any[] = [];

      for (const newLog of logsToInsert) {
        // Check if this food was already logged for this meal today
        const existing = (existingLogs || []).find((el: any) => {
          if (el.meal_type !== newLog.meal_type) return false;
          if (newLog.food_id && el.food_id && el.food_id === newLog.food_id) return true;
          const newName = (foodsById.get(newLog.food_id)?.name || '').toLowerCase().trim();
          const existingName = (el.foods?.name || '').toLowerCase().trim();
          return Boolean(newName && existingName && newName === existingName);
        });

        if (existing) {
          // Update existing row in-place instead of creating a duplicate row!
          const { data: updated, error: updateError } = await adminClient
            .from('food_logs')
            .update({
              quantity: newLog.quantity,
              calories: newLog.calories,
              protein: newLog.protein,
              carbs: newLog.carbs,
              fat: newLog.fat,
              estimated_cost: newLog.estimated_cost
            })
            .eq('id', existing.id)
            .select('*, foods(*)')
            .maybeSingle();
          if (updateError || !updated) throw updateError || new Error('Could not update the logged food.');
          finalLogs.push(updated);
        } else {
          newInserts.push(newLog);
        }
      }

      if (newInserts.length > 0) {
        const { data: insertedLogs, error: logErr } = await adminClient
          .from('food_logs')
          .insert(newInserts)
          .select('*, foods(*)');

        if (logErr) {
          console.error("Error in batch insert food_logs:", logErr);
          throw logErr;
        }

        if (insertedLogs) {
          finalLogs.push(...insertedLogs);
        }
      }

      // Single background update of daily summary
      NutritionService.updateDailySummary(userId).catch(err => {
        console.warn("Background updateDailySummary warning in logMultipleFoods:", err);
      });

      return finalLogs;
    };

    const promise = execLog();
    mealLogInFlight.set(lockKey, promise);
    try {
      const result = await promise;
      return result;
    } finally {
      mealLogInFlight.delete(lockKey);
    }
  }

  static async logWater(userId: string, amountMl: number) {
    if (amountMl <= 0) throw new Error("Water amount must be positive");
    
    const MAX_DAILY_WATER_ML = 8000;
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);

    // Fetch today's current accumulated water
    const { data: todayWaters } = await supabase
      .from('fitness_os_water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    const currentTotal = (todayWaters || []).reduce((sum, w) => sum + (Number(w.amount_ml) || 0), 0);

    if (currentTotal >= MAX_DAILY_WATER_ML) {
      return { total_water_ml: currentTotal, capped: true };
    }

    const effectiveAmount = Math.min(amountMl, MAX_DAILY_WATER_ML - currentTotal);
    if (effectiveAmount <= 0) {
      return { total_water_ml: currentTotal, capped: true };
    }

    const { data, error } = await supabase
      .from('fitness_os_water_logs')
      .insert({
        user_id: userId,
        amount_ml: effectiveAmount
      })
      .select()
      .single();

    if (error) throw error;

    const totalWaterMl = currentTotal + effectiveAmount;
    
    // Non-blocking background summary update
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in logWater:", err);
    });

    return { ...data, total_water_ml: totalWaterMl, capped: totalWaterMl >= MAX_DAILY_WATER_ML };
  }

  static async removeWater(userId: string, amountMl: number = 250) {
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);

    const { data: todayLogs } = await supabase
      .from('fitness_os_water_logs')
      .select('id, amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: false });

    if (todayLogs && todayLogs.length > 0) {
      let remainingToRemove = amountMl;
      for (const log of todayLogs) {
        if (remainingToRemove <= 0) break;
        if (log.amount_ml <= remainingToRemove) {
          remainingToRemove -= log.amount_ml;
          await supabase.from('fitness_os_water_logs').delete().eq('id', log.id);
        } else {
          await supabase
            .from('fitness_os_water_logs')
            .update({ amount_ml: log.amount_ml - remainingToRemove })
            .eq('id', log.id);
          remainingToRemove = 0;
          break;
        }
      }
    }

    // Fetch today's actual remaining water
    const { data: remainingWaters } = await supabase
      .from('fitness_os_water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    const totalWaterMl = (remainingWaters || []).reduce((sum, w) => sum + (Number(w.amount_ml) || 0), 0);

    // Non-blocking background summary update
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in removeWater:", err);
    });

    return { total_water_ml: totalWaterMl };
  }

  static async resetTodayWater(userId: string) {
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);
    await supabase
      .from('fitness_os_water_logs')
      .delete()
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    this.updateDailySummary(userId).catch(() => {});
  }

  static async getWaterHistory(userId: string, days: number = 90) {
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const targets = await this.getEffectiveTargets(userId);
    const targetMl = targets?.water_ml || 2500;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: logs, error } = await supabase
      .from('fitness_os_water_logs')
      .select('amount_ml, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', cutoffDate.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      console.error("Error fetching water history:", error);
    }

    // Map logs to user's local date YYYY-MM-DD
    const waterByDate: Record<string, number> = {};
    (logs || []).forEach(log => {
      const d = new Date(log.logged_at);
      const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
      waterByDate[dateKey] = (waterByDate[dateKey] || 0) + log.amount_ml;
    });

    const generateRangeData = (rangeDays: number) => {
      const dayList = [];
      const now = new Date();
      let totalMl = 0;
      let loggedDaysCount = 0;
      let goalDaysCount = 0;

      for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d);
        const amountMl = waterByDate[dateKey] || 0;
        const percent = Math.min(100, Math.round((amountMl / targetMl) * 100));

        let level = 0;
        if (amountMl > 0) {
          if (percent < 25) level = 1;
          else if (percent < 50) level = 2;
          else if (percent < 75) level = 3;
          else level = 4;
        }

        if (amountMl > 0) {
          totalMl += amountMl;
          loggedDaysCount++;
        }
        if (amountMl >= targetMl) {
          goalDaysCount++;
        }

        dayList.push({
          date: dateKey,
          amount_ml: amountMl,
          target_ml: targetMl,
          percent,
          level
        });
      }

      const dailyAvgL = loggedDaysCount > 0 
        ? `${(totalMl / loggedDaysCount / 1000).toFixed(1)}L` 
        : "0.0L";

      return {
        daily_avg: dailyAvgL,
        goal_days: goalDaysCount,
        logged: loggedDaysCount,
        target_ml: targetMl,
        days: dayList
      };
    };

    return {
      waterByDate,
      week: generateRangeData(7),
      month: generateRangeData(31),
      threeMonth: generateRangeData(90)
    };
  }

  static async updateDailySummary(userId: string) {
    const supabase = await createServerSupabase();
    const localDate = await this.getLocalDateString(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId);

    // Get today's foods
    const { data: foods } = await supabase
      .from('food_logs')
      .select('calories, protein, carbs, fat, meal_type')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    // Get today's water
    const { data: waters } = await supabase
      .from('fitness_os_water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    // Get today's meal plans (to count completion)
    const { data: plans } = await supabase
      .from('meal_plans')
      .select('id, meal_type')
      .eq('user_id', userId)
      .eq('date', localDate);

    let consumed = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water_ml: 0
    };

    const completedMealTypes = new Set<string>();

    if (foods) {
      foods.forEach(f => {
        consumed.calories += f.calories;
        consumed.protein += Number(f.protein);
        consumed.carbs += Number(f.carbs);
        consumed.fat += Number(f.fat);
        if (f.meal_type) completedMealTypes.add(f.meal_type);
      });
    }

    const targets = await this.getEffectiveTargets(userId);
    const targetWater = Number(targets?.water_ml) || 2500;
    if (waters) {
      waters.forEach(w => consumed.water_ml += (Number(w.amount_ml) || 0));
    }
    // For Luna AI plans (meal_type='daily'), count how many distinct meal slots the user has logged food for
    const totalMeals = plans && plans.length > 0
      ? (plans.some(p => p.meal_type === 'daily') ? completedMealTypes.size : plans.length)
      : 0;
    
    let mealsCompleted = 0;
    if (plans) {
      if (plans.some(p => p.meal_type === 'daily')) {
        // For 'daily' type: count distinct logged meal_types (breakfast, lunch, dinner, etc.)
        mealsCompleted = completedMealTypes.size;
      } else {
        mealsCompleted = plans.filter(p => completedMealTypes.has(p.meal_type)).length;
      }
    }

    const score = this.computeNutritionScore(consumed, targets, mealsCompleted, totalMeals);

    const upsertData = {
      user_id: userId,
      date: localDate,
      calories: consumed.calories,
      protein: consumed.protein,
      carbs: consumed.carbs,
      fat: consumed.fat,
      water_ml: consumed.water_ml,
      meals_completed: mealsCompleted,
      nutrition_score: score,
      updated_at: new Date().toISOString()
    };

    // Use Postgres ON CONFLICT via upsert
    await supabase
      .from('nutrition_daily_summary')
      .upsert(upsertData, { onConflict: 'user_id, date' });

    invalidateNutritionServerCache(userId);
  }

  static getPrepInstructionForSlot(
    mealType: string,
    title: string,
    dayOfWeek: number,
    foodEnv?: string,
    dietPref?: string
  ): string {
    const rawEnv = (foodEnv || "PG").trim();
    const envLower = rawEnv.toLowerCase();
    
    // Strictly isolate the environment name without slashes
    let envName = "PG";
    let messLabel = "PG mess";
    let hackLabel = "PG Hack";
    let roomLabel = "PG room";

    if (envLower === "hostel") {
      envName = "Hostel";
      messLabel = "hostel mess";
      hackLabel = "Hostel Hack";
      roomLabel = "hostel room";
    } else if (envLower === "home" || envLower === "i cook" || envLower === "self-cooked") {
      envName = "Home";
      messLabel = "home kitchen";
      hackLabel = "Kitchen Tip";
      roomLabel = "home";
    } else if (envLower === "office/canteen" || envLower === "canteen" || envLower === "office") {
      envName = "Canteen";
      messLabel = "canteen";
      hackLabel = "Canteen Tip";
      roomLabel = "office";
    }

    const rawDiet = (dietPref || '').toLowerCase();
    const isVegan = rawDiet.includes('vegan');
    const isNonVeg = !isVegan && (rawDiet.includes('non') || rawDiet.includes('meat') || rawDiet.includes('chicken') || rawDiet.includes('fish'));
    const isEggetarian = !isVegan && !isNonVeg && (rawDiet.includes('egg') || rawDiet.includes('eggetarian'));
    const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;

    const isRoomLiving = envName === "PG" || envName === "Hostel";
    const tLower = title.toLowerCase();

    if (mealType === "breakfast") {
      if (tLower.includes("idli") || tLower.includes("dosa") || tLower.includes("pongal")) {
        if (isVegan) {
          return isRoomLiving
            ? `${hackLabel}: Enjoy freshly steamed ${messLabel} idli/dosa with hot sambar. Top with crunchy roasted peanuts and a fresh fruit for clean plant energy.`
            : "Enjoy warm steamed idli/dosa with homemade dal sambar. Pair with roasted peanuts or fresh fruit for clean plant-powered energy.";
        }
        if (isVegetarian) {
          return isRoomLiving
            ? `${hackLabel}: Enjoy freshly steamed ${messLabel} idli/dosa with sambar. Pair with fresh curd or paneer for an optimal morning protein anchor.`
            : "Enjoy warm steamed idli/dosa with homemade dal sambar. Pair with fresh curd or paneer for an optimal morning protein anchor.";
        }
        return isRoomLiving
          ? `${hackLabel}: Enjoy freshly steamed ${messLabel} idli/dosa with sambar. Boil 2–3 eggs using an electric kettle in your ${roomLabel} or request hard-boiled eggs from the ${messLabel} kitchen. Season with roasted jeera, black pepper, and rock salt.`
          : "Enjoy warm steamed idli/dosa with homemade dal sambar. Pair with boiled farm eggs or paneer for an optimal 25–30g morning protein anchor.";
      }
      if (tLower.includes("poha") || tLower.includes("upma")) {
        if (isVegan) {
          return isRoomLiving
            ? `${hackLabel}: Request a warm bowl of ${messLabel} poha/upma; top with crunchy roasted peanuts and squeeze fresh lemon juice (vitamin C dramatically boosts non-heme iron absorption).`
            : "Cook homestyle poha/upma with mustard seeds, curry leaves, and crunchy peanuts. Squeeze fresh lemon for vitamin C absorption.";
        }
        if (isVegetarian) {
          return isRoomLiving
            ? `${hackLabel}: Request a warm bowl of ${messLabel} poha/upma; top with crunchy roasted peanuts, squeeze fresh lemon, and pair with fresh curd.`
            : "Cook homestyle poha/upma with mustard seeds, curry leaves, and crunchy peanuts. Squeeze fresh lemon and pair with fresh curd.";
        }
        return isRoomLiving
          ? `${hackLabel}: Request a warm bowl of ${messLabel} poha/upma; top with crunchy roasted peanuts and squeeze fresh lemon juice (vitamin C dramatically boosts non-heme iron absorption). Pair with boiled eggs.`
          : "Cook homestyle poha/upma with mustard seeds, curry leaves, and crunchy peanuts. Squeeze fresh lemon and pair with boiled eggs or curd.";
      }
      if (tLower.includes("oats")) {
        if (isVegan) {
          return isRoomLiving
            ? `${hackLabel}: Soak rolled oats in hot water in your ${roomLabel} for 5 minutes. Fold in sliced banana, roasted peanuts, and a dash of cinnamon.`
            : "Cook rolled oats in hot water or soy milk for 3–5 minutes. Top with fresh banana slices, apple, and roasted peanuts for sustained morning energy.";
        }
        if (isVegetarian) {
          return isRoomLiving
            ? `${hackLabel}: Soak rolled oats in hot water or warm milk in your ${roomLabel} for 5 minutes. Fold in sliced banana, roasted peanuts, and a dash of cinnamon.`
            : "Cook rolled oats in warm toned milk for 3–5 minutes. Top with fresh banana slices and roasted peanuts for steady energy.";
        }
        return isRoomLiving
          ? `${hackLabel}: Soak rolled oats in hot water or warm milk in your ${roomLabel} for 5 minutes. Fold in sliced banana, roasted peanuts, and a dash of cinnamon. Eat with boiled eggs.`
          : "Cook rolled oats in warm toned milk for 3–5 minutes. Top with fresh banana slices and roasted peanuts. Pair with farm eggs for 4 hours of steady energy.";
      }
      if (tLower.includes("cheela") || tLower.includes("bhurji")) {
        if (isVegan) {
          return "High-protein breakfast: Cook besan/moong dal cheela or soya bhurji with minimal oil on a tawa. Serve with fresh mint chutney.";
        }
        if (isVegetarian) {
          return "High-protein breakfast: Cook cheela or paneer bhurji with minimal oil on a tawa. Serve with fresh cooling curd or mint chutney.";
        }
        return "High-protein breakfast: Cook cheela or egg/paneer bhurji with minimal oil on a tawa. Serve with fresh cooling curd or mint chutney.";
      }
      if (isVegan) {
        return isRoomLiving
          ? `${envName} Breakfast: Pair warm phulkas or toast with boiled soya chunks or peanuts and fresh fruit.`
          : "Homestyle whole food breakfast: Enjoy warm phulkas or toast with plant protein and fresh fruit.";
      }
      if (isVegetarian) {
        return isRoomLiving
          ? `${envName} Breakfast: Pair warm phulkas or toast with paneer tikka or curd, accompanied by fresh fruit.`
          : "Homestyle whole food breakfast: Enjoy warm phulkas or toast with fresh paneer tikka, accompanied by fresh fruit.";
      }
      return isRoomLiving
        ? `${envName} Kettle Hack: Hard-boil farm eggs using an electric kettle in your ${roomLabel}. Season with chaat masala, roasted cumin, and black pepper. Pair with whole wheat toast.`
        : "Homestyle whole food breakfast: Enjoy warm phulkas or toast with farm eggs or paneer tikka, accompanied by fresh fruit.";
    }

    if (mealType === "lunch") {
      if (tLower.includes("chicken") || tLower.includes("fish")) {
        return isRoomLiving
          ? `${envName} Protein Anchor: Source pre-cooked grilled or curry chicken/fish from a trusted local vendor or ${messLabel}. Pair with ${messLabel} steamed rice and yellow dal for a complete amino acid profile.`
          : "Lean athletic lunch: Pair homestyle chicken curry or fish with steamed rice, yellow dal, and a fresh kachumber salad.";
      }
      if (tLower.includes("rajma") || tLower.includes("chana")) {
        if (isVegan) {
          return "High-protein comfort thali: Pair slow-cooked kidney beans/chickpeas with steamed rice or phulkas. Eat with fresh lemon and kachumber salad for optimal plant iron absorption.";
        }
        return "High-protein comfort thali: Pair slow-cooked kidney beans/chickpeas with steamed rice or phulkas. Eat with cooling dahi/curd for optimal gut digestion.";
      }
      if (tLower.includes("soya")) {
        if (isVegan) {
          return isRoomLiving
            ? `${envName} Soya Hack: Soak 50g soya chunks in kettle-boiled hot water with salt for 10 minutes. Squeeze out water thoroughly to remove any raw taste, then fold into hot ${messLabel} dal or sabzi.`
            : "High-protein soya lunch: Sauté soaked soya chunks with onion, tomatoes, and garam masala. Serve with phulkas and fresh cucumber salad.";
        }
        return isRoomLiving
          ? `${envName} Soya Hack: Soak 50g soya chunks in kettle-boiled hot water with salt for 10 minutes. Squeeze out water thoroughly to remove any raw taste, then fold into hot ${messLabel} dal or sabzi.`
          : "High-protein soya lunch: Sauté soaked soya chunks with onion, tomatoes, and garam masala. Serve with phulkas and cooling cucumber curd.";
      }
      if (isVegan) {
        return isRoomLiving
          ? `${envName} Lunch: Take your standard ${messLabel} rice, dal tadka, and seasonal sabzi. Top with soaked soya chunks and a crisp fresh salad.`
          : "Balanced vegan lunch: Pair yellow dal tadka, steamed rice, soya chunks or chana, and a crisp fresh cucumber-tomato salad.";
      }
      if (isVegetarian) {
        return isRoomLiving
          ? `${envName} Lunch: Take your standard ${messLabel} rice, dal tadka, and seasonal sabzi. Top with fresh curd and paneer.`
          : "Balanced lunch: Pair yellow dal tadka, steamed rice, paneer, and a crisp fresh cucumber-tomato salad.";
      }
      if (isEggetarian) {
        return isRoomLiving
          ? `${envName} Lunch: Take your standard ${messLabel} rice, dal tadka, and seasonal sabzi. Top with fresh curd and farm boiled eggs.`
          : "Balanced eggetarian lunch: Pair yellow dal tadka, steamed rice, farm boiled eggs, and a crisp fresh cucumber-tomato salad.";
      }
      return isRoomLiving
        ? `${envName} Lunch: Take your standard ${messLabel} rice, dal tadka, and seasonal sabzi. Top with fresh curd and your planned protein anchor.`
        : "Balanced lunch: Pair yellow dal tadka, steamed rice, paneer or eggs, and a crisp fresh cucumber-tomato salad.";
    }

    if (mealType === "pre_workout" || mealType === "snack") {
      return isRoomLiving
        ? `Athletic Fuel (< 3g Fat): Keep shelf-stable in your ${roomLabel}. Eat 45–60 minutes before training with 300ml water for rapid glycogen replenishment with zero digestive sluggishness.`
        : "Athletic Fuel (< 3g Fat): Consume 45–60 minutes before training with 300ml water for rapid glycogen replenishment with zero digestive sluggishness.";
    }

    if (mealType === "post_workout") {
      return "Post-Workout Recovery: Consume within 45 minutes of training to initiate immediate muscle glycogen replenishment and protein synthesis.";
    }

    if (mealType === "dinner") {
      if (tLower.includes("khichdi")) {
        if (isVegan) {
          return "Soothing Recovery Dinner: Light moong dal khichdi paired with a crisp fresh salad, squeeze of lemon, and roasted jeera for easy digestion.";
        }
        return "Soothing Recovery Dinner: Light moong dal khichdi paired with cooling probiotic dahi and a pinch of roasted jeera to aid overnight gut repair.";
      }
      if (tLower.includes("fish")) {
        return "Lean Protein Recovery: Homestyle fish curry paired with steamed rice or phulkas and fresh vegetables for omega-3s and overnight muscle repair.";
      }
      if (tLower.includes("chicken")) {
        return "High-Protein Dinner: Homestyle chicken paired with warm phulkas or rice, yellow dal, and fresh vegetables for optimal overnight muscle repair.";
      }
      if (tLower.includes("egg")) {
        return "High-Protein Dinner: Farm boiled eggs or egg curry paired with warm phulkas or steamed rice and yellow dal for clean overnight muscle recovery.";
      }
      if (tLower.includes("rice") || tLower.includes("chawal") || tLower.includes("sambar")) {
        return isRoomLiving
          ? `${envName} Dinner: Steamed rice paired with yellow dal or sambar, mixed sabzi, and your protein anchor to support overnight muscle recovery.`
          : isNonVeg || isEggetarian
          ? "Restorative Dinner: Steamed rice paired with yellow moong dal, seasonal sabzi, and lean protein to support overnight muscle protein synthesis."
          : "Restorative Dinner: Steamed rice with yellow dal, seasonal sabzi, and cooling curd seasoned with roasted cumin.";
      }
      if (isVegan) {
        return isRoomLiving
          ? `${envName} Dinner: Enjoy 2–3 warm phulkas with ${messLabel} dal and green sabzi. Pair with fresh seasonal fruit or salad to support overnight recovery.`
          : "Restorative Vegan Dinner: Warm whole wheat phulkas with yellow dal tadka, lightly spiced seasonal sabzi, and fresh fruit.";
      }
      if (isVegetarian) {
        return isRoomLiving
          ? `${envName} Dinner: Enjoy 2–3 warm phulkas with ${messLabel} dal and green sabzi. Finish with a bowl of cooling curd to support overnight muscle protein synthesis.`
          : "Restorative Dinner: Warm whole wheat phulkas with yellow dal tadka, lightly spiced sabzi, and cooling curd seasoned with roasted cumin.";
      }
      if (isEggetarian) {
        return isRoomLiving
          ? `${envName} Dinner: Enjoy 2–3 warm phulkas with ${messLabel} dal and green sabzi. Pair with boiled eggs or curd to support overnight muscle recovery.`
          : "Restorative Eggetarian Dinner: Warm whole wheat phulkas with yellow dal tadka, sabzi, and farm boiled eggs or cooling curd.";
      }
      return isRoomLiving
        ? `${envName} Dinner: Enjoy 2–3 warm phulkas with ${messLabel} dal and green sabzi. Finish with your protein anchor to support overnight recovery.`
        : "Restorative Dinner: Warm whole wheat phulkas with yellow dal tadka, lightly spiced sabzi, and lean protein to support overnight recovery.";
    }

    return "Whole-food balanced plate scaled to your exact daily macro targets.";
  }

  /**
   * Builds a deterministic 7-day rotating meal plan tailored strictly to the user's onboarding preferences:
   * - Diet preference (Vegan, Vegetarian, Eggetarian, Non-Vegetarian)
   * - Food environment (PG, Hostel, Home, I Cook)
   * - Allergies and avoided foods
   * - Meals per day
   * - Calorie and macro targets
   */
  static getRotatingMealPlanForDay(
    dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    profile: any,
    targets: any,
    foodCatalog: NutritionFoodReference[],
    weekCycle: number = 0 // 0 = Week A, 1 = Week B (Bi-weekly variety rotation)
  ): Map<string, any> {
    const plansMap = new Map<string, any>();
    const combinedDiet = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isVegan = combinedDiet.includes('vegan');
    const isNonVeg = !isVegan && (combinedDiet.includes('non') || combinedDiet.includes('meat') || combinedDiet.includes('chicken') || combinedDiet.includes('fish'));
    const isEggetarian = !isVegan && !isNonVeg && (combinedDiet.includes('egg') || combinedDiet.includes('eggetarian'));
    const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;

    const foodEnv = (profile?.food_environment || 'Home').toLowerCase();
    const isCoreProvided = foodEnv === 'pg' || foodEnv === 'hostel' || foodEnv === 'home' || foodEnv === 'office/canteen';

    const blockedTerms = [
      profile?.food_allergies,
      profile?.foods_disliked,
      profile?.foods_avoided
    ].filter(Boolean).join(',').toLowerCase().split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean);

    const isFoodSafe = (name: string): boolean => {
      if (blockedTerms.length === 0) return true;
      const fLower = name.toLowerCase();
      return !blockedTerms.some(term => term && fLower.includes(term));
    };

    const buildItems = (itemsDef: Array<{ name: string; quantity: number; servingSize?: string }>, isCore: boolean) => {
      return itemsDef.map((def, index) => {
        let foodName = def.name;
        if (!isFoodSafe(foodName)) {
          if (foodName.toLowerCase().includes('banana')) foodName = 'Apple';
          else if (foodName.toLowerCase().includes('peanut')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Curd (Plain)';
          else if (foodName.toLowerCase().includes('milk')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Curd (Plain)';
          else if (foodName.toLowerCase().includes('egg')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Paneer Tikka';
        }

        // Strict dietary safety filter on every food item
        if (isVegan) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('paneer') || fnLower.includes('curd') || fnLower.includes('dahi') || fnLower.includes('milk') || fnLower.includes('egg') || fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat')) {
            if (fnLower.includes('curd') || fnLower.includes('dahi')) foodName = 'Mixed Vegetables';
            else if (fnLower.includes('milk')) foodName = 'Apple';
            else foodName = 'Soy Chunks (Cooked)';
          }
        } else if (isVegetarian) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('egg') || fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat') || fnLower.includes('mutton') || fnLower.includes('beef') || fnLower.includes('pork')) {
            foodName = 'Paneer Tikka';
          }
        } else if (isEggetarian) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat') || fnLower.includes('mutton') || fnLower.includes('beef') || fnLower.includes('pork')) {
            foodName = 'Boiled Egg';
          }
        }

        const ref = findFoodReference(foodName, foodCatalog, profile?.food_environment);
        const qty = def.quantity || 1;
        const sSize = def.servingSize || (ref ? (qty > 1 ? `${qty} servings` : ref.serving_size || '1 serving') : `${qty} serving`);
        const defaultCals = foodName.toLowerCase().includes('egg') ? 78 : (foodName.toLowerCase().includes('banana') ? 105 : 150);
        const defaultPro = foodName.toLowerCase().includes('egg') ? 6.3 : 5;
        const unitCals = Math.round(Number(ref?.calories || defaultCals));
        const unitPro = Number((Number(ref?.protein || defaultPro)).toFixed(1));
        const unitCarbs = Number((Number(ref?.carbs || 15)).toFixed(1));
        const unitFat = Number((Number(ref?.fat || 3)).toFixed(1));
        const isCoreItem = isStapleCoreFood(foodName, profile?.food_environment);
        const unitCost = isCoreItem ? 0 : getRealisticFoodCost(foodName, Number(ref?.estimated_cost));

        return {
          id: `rotating-item-${index}`,
          quantity: qty,
          is_core: isCoreItem,
          foods: {
            id: ref?.id || `food-${index}`,
            name: ref?.name || foodName,
            category: ref?.category || 'General',
            serving_size: sSize,
            calories: unitCals,
            protein: unitPro,
            carbs: unitCarbs,
            fat: unitFat,
            estimated_cost: unitCost,
          }
        };
      });
    };

    const dayTitles: Record<number, string> = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    const dayName = dayTitles[dayOfWeek] || 'Today';

    // 1. BREAKFAST TEMPLATES BY DAY
    const breakfastDefs: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan // Sunday
        ? [{ name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Chapati', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Boiled Egg', quantity: 3, servingSize: '3 large' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Chapati', quantity: 1, servingSize: '1 medium' }],
      1: isVegan // Monday
        ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }],
      2: isVegan // Tuesday
        ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      3: isVegan // Wednesday
        ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }],
      4: isVegan // Thursday
        ? [{ name: 'Upma', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Upma', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Upma', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }],
      5: isVegan // Friday
        ? [{ name: 'Dosa', quantity: 2, servingSize: '2 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Dosa', quantity: 2, servingSize: '2 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Dosa', quantity: 2, servingSize: '2 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }],
      6: isVegan // Saturday
        ? [{ name: 'Pongal', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Pongal', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Pongal', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }],
    };

    // 2. LUNCH TEMPLATES BY DAY
    const lunchDefs: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan // Sunday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Tofu (Firm)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      1: isVegan // Monday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Moong Sprouts', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan // Tuesday
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Tofu (Firm)', quantity: 0.8, servingSize: '80g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      3: isVegan // Wednesday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 0.8, servingSize: '80g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      4: isVegan // Thursday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      5: isVegan // Friday
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Moong Sprouts', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      6: isVegan // Saturday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Tofu (Firm)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
    };

    // 3. SNACK / PRE-WORKOUT TEMPLATES BY DAY (Clean fast carbs + light protein, low fat < 3g)
    const snackDefs: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }],
      1: [{ name: 'Apple', quantity: 1, servingSize: '1 medium (180g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }],
      2: isVegan
        ? [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }]
        : [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Curd / Dahi (Plain)', quantity: 0.5, servingSize: '75g' }],
      3: [{ name: 'Apple', quantity: 1, servingSize: '1 medium (180g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }],
      4: [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }],
      5: isVegan
        ? [{ name: 'Apple', quantity: 1, servingSize: '1 medium (180g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }]
        : isVegetarian
        ? [{ name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }, { name: 'Curd / Dahi (Plain)', quantity: 0.5, servingSize: '75g' }]
        : [{ name: 'Boiled Egg White', quantity: 2, servingSize: '2 whites' }, { name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }],
      6: [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }],
    };

    // 4. DINNER TEMPLATES BY DAY
    const dinnerDefs: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Tofu (Firm)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      1: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 0.8, servingSize: '80g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Sprouts', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      3: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }],
      4: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Tofu (Firm)', quantity: 1, servingSize: '100g' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      5: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Sprouts', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      6: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Tofu (Firm)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
    };

    const mealsPerDay = profile?.meals_per_day || '4 meals';
    const slotProportions: Record<string, number> = {
      breakfast: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.20 : (mealsPerDay === '2 meals' ? 0.0 : 0.25)),
      lunch: mealsPerDay === '3 meals' ? 0.40 : (mealsPerDay === '5+ meals' ? 0.30 : (mealsPerDay === '2 meals' ? 0.55 : 0.35)),
      pre_workout: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      snack: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      post_workout: 0.13,
      dinner: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.25 : (mealsPerDay === '2 meals' ? 0.45 : 0.25)),
    };

    const buildMealResult = (mealType: string, title: string, defs: Array<{ name: string; quantity: number; servingSize?: string }>, isCore: boolean) => {
      const items = buildItems(defs, isCore);
      const rawCals = items.reduce((acc, it) => acc + it.foods.calories, 0);
      const slotPct = slotProportions[mealType] ?? 0.25;
      const targetCals = Math.round(Number(targets?.calories || 2000) * slotPct);
      const scale = rawCals > 0 ? (targetCals / rawCals) : 1;

      const scaledItems = items.map((it) => {
        const foodNameLower = it.foods.name.toLowerCase();
        const isDiscrete = /(?:egg|banana|apple|fruit|chapati|roti|bread|cheela)/i.test(foodNameLower);

        if (isDiscrete) {
          // Discrete whole foods maintain exact verified per-unit calories and macros (e.g. 3 eggs = 234 kcal)
          return {
            ...it,
            foods: {
              ...it.foods,
              calories: it.foods.calories,
              protein: it.foods.protein,
              carbs: it.foods.carbs,
              fat: it.foods.fat,
              estimated_cost: it.foods.estimated_cost,
            }
          };
        }

        // Scalable items (grains, dals, sambar, curd, milk, sabzi) scale portion smoothly
        const itemScale = Math.min(1.4, Math.max(0.65, scale));
        const scaledCalories = Math.round(it.foods.calories * itemScale);
        const scaledProtein = Number((it.foods.protein * itemScale).toFixed(1));
        const scaledCarbs = Number((it.foods.carbs * itemScale).toFixed(1));
        const scaledFat = Number((it.foods.fat * itemScale).toFixed(1));
        const scaledCost = Math.round(it.foods.estimated_cost * itemScale);

        let sSize = it.foods.serving_size;
        if (Math.abs(itemScale - 1) > 0.15) {
          const scaledQty = Number((it.quantity * itemScale).toFixed(1));
          if (scaledQty > 0) {
            const cleanBase = (it.foods.serving_size || '1 serving').replace(/^\d+(?:\.\d+)?\s*[×xX*]\s*/, '').trim();
            const gMatch = cleanBase.match(/^(\d+)\s*g$/i);
            const bowlMatch = cleanBase.match(/^(?:(\d+(?:\.\d+)?)\s*)?(bowl|cup|plate)s?\s*(?:\(([0-9]+)\s*([a-zA-Z]+)\))?$/i);
            if (gMatch) {
              sSize = `${Math.round(parseInt(gMatch[1], 10) * scaledQty)}g`;
            } else if (bowlMatch) {
              const baseCount = bowlMatch[1] ? parseFloat(bowlMatch[1]) : 1;
              const vessel = bowlMatch[2].toLowerCase();
              const bQty = Number((baseCount * scaledQty).toFixed(1));
              const grams = bowlMatch[3] ? ` (${Math.round(parseInt(bowlMatch[3], 10) * scaledQty)}${bowlMatch[4]})` : '';
              sSize = `${bQty} ${bQty === 1 ? vessel : vessel + 's'}${grams}`;
            } else {
              sSize = `${scaledQty > 1 ? scaledQty + '× ' : ''}${cleanBase}`;
            }
          }
        }

        return {
          ...it,
          foods: {
            ...it.foods,
            serving_size: sSize,
            calories: scaledCalories,
            protein: scaledProtein,
            carbs: scaledCarbs,
            fat: scaledFat,
            estimated_cost: scaledCost,
          }
        };
      });

      const totals = scaledItems.reduce((acc, it) => ({
        calories: acc.calories + it.foods.calories,
        protein: Number((acc.protein + it.foods.protein).toFixed(1)),
        carbs: Number((acc.carbs + it.foods.carbs).toFixed(1)),
        fat: Number((acc.fat + it.foods.fat).toFixed(1)),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        id: `rotating-${mealType}-${dayOfWeek}`,
        meal_type: mealType,
        name: sanitizeMealTitle(title, isVegan, isVegetarian, isEggetarian),
        calories: totals.calories || targetCals,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        prep_instructions: NutritionService.getPrepInstructionForSlot(mealType, title, dayOfWeek, profile?.food_environment, combinedDiet),
        is_natural_whole_food: true,
        has_7day_variety: true,
        meal_plan_items: scaledItems
      };
    };

    const breakfastTitles: Record<number, string> = {
      0: isVegan ? 'Soy Chunks with Warm Phulkas' : (isVegetarian ? 'Paneer Tikka with Warm Phulkas' : 'Farm Boiled Eggs & Whole Wheat Toast'),
      1: isVegan ? 'Warm Rolled Oats with Banana & Peanuts' : (isVegetarian ? 'Creamy Rolled Oats with Milk & Banana' : 'Rolled Oats with Milk, Eggs & Banana'),
      2: 'Homestyle Veggie Poha with Peanuts',
      3: isVegan ? 'Steamed Idlis with Dal Sambar & Peanuts' : (isVegetarian ? 'Steamed Idlis with Dal Sambar & Curd' : 'Steamed Idlis with Dal Sambar & Eggs'),
      4: isVegan ? 'Roasted Veggie Upma with Peanuts & Fruit' : (isVegetarian ? 'Roasted Veggie Upma with Milk & Peanuts' : 'Roasted Veggie Upma with Eggs & Milk'),
      5: isVegan ? 'Crispy Dosa with Dal Sambar & Peanuts' : (isVegetarian ? 'Crispy Dosa with Dal Sambar & Milk' : 'Crispy Dosa with Dal Sambar & Eggs'),
      6: isVegan ? 'Ven Pongal with Dal Sambar & Peanuts' : (isVegetarian ? 'Ven Pongal with Dal Sambar & Curd' : 'Ven Pongal with Dal Sambar & Eggs'),
    };

    const lunchTitles: Record<number, string> = {
      0: isVegan ? 'Comfort Rajma Chawal with Soya & Veggies' : (isNonVeg ? 'Rohu Fish Curry with Steamed Rice' : (isEggetarian ? 'Comfort Rajma Chawal with Eggs & Curd' : 'Comfort Rajma Chawal with Paneer & Curd')),
      1: isVegan ? 'Yellow Dal Tadka with Steamed Rice & Soya' : (isNonVeg ? 'Homestyle Chicken Curry with Steamed Rice' : (isEggetarian ? 'Yellow Dal Tadka with Steamed Rice & Eggs' : 'Yellow Dal Tadka with Steamed Rice & Paneer')),
      2: isVegan ? 'Punjabi Chana Masala with Phulkas & Soya' : (isVegetarian ? 'Punjabi Chana Masala with Phulkas & Curd' : 'Punjabi Chana Masala with Phulkas & Eggs'),
      3: isVegan ? 'Comfort Rajma Chawal with Soya & Salad' : (isNonVeg ? 'Homestyle Chicken Curry with Steamed Rice' : (isEggetarian ? 'Comfort Rajma Chawal with Eggs & Curd' : 'Comfort Rajma Chawal with Paneer & Salad')),
      4: isVegan ? 'Yellow Dal Tadka with Steamed Rice & Chana' : (isNonVeg ? 'Rohu Fish Curry with Steamed Rice' : (isEggetarian ? 'Yellow Dal Tadka with Steamed Rice & Eggs' : 'Yellow Dal Tadka with Steamed Rice & Paneer')),
      5: isVegan ? 'High-Protein Chana Masala with Phulkas & Soya' : (isNonVeg ? 'Homestyle Chicken Curry with Phulkas' : (isEggetarian ? 'High-Protein Chana Masala with Phulkas & Eggs' : 'High-Protein Chana Masala with Phulkas & Paneer')),
      6: isVegan ? 'Yellow Dal Tadka with Steamed Rice & Soya' : (isNonVeg ? 'Homestyle Chicken Curry with Steamed Rice' : (isEggetarian ? 'Yellow Dal Tadka with Steamed Rice & Eggs' : 'Yellow Dal Tadka with Steamed Rice & Paneer')),
    };

    const dinnerTitles: Record<number, string> = {
      0: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Tikka' : (isEggetarian ? 'Phulkas with Dal Tadka & Boiled Eggs' : 'Phulkas with Dal Tadka & Chicken Breast')),
      1: isVegan ? 'Homestyle Dal with Phulkas & Soya' : (isVegetarian ? 'Homestyle Dal with Phulkas & Paneer Bhurji' : 'Homestyle Dal with Phulkas & Boiled Eggs'),
      2: isVegan ? 'Steamed Rice with Sambar & Soya Chunks' : (isVegetarian ? 'Steamed Rice with Sambar & Paneer Tikka' : (isEggetarian ? 'Steamed Rice with Sambar & Boiled Eggs' : 'Steamed Rice with Sambar & Fish Curry')),
      3: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Bhurji' : (isEggetarian ? 'Phulkas with Dal Tadka & Boiled Eggs' : 'Phulkas with Dal Tadka & Chicken Breast')),
      4: isVegan ? 'Phulkas with Dal Sambar & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Sambar & Paneer' : 'Phulkas with Dal Sambar & Boiled Eggs'),
      5: isVegan ? 'Comfort Rajma with Steamed Rice & Soya' : (isVegetarian ? 'Comfort Rajma with Steamed Rice & Paneer' : 'Comfort Rajma with Steamed Rice & Boiled Eggs'),
      6: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Tikka' : (isEggetarian ? 'Phulkas with Dal Tadka & Boiled Eggs' : 'Phulkas with Dal Tadka & Chicken Breast')),
    };

    // ─── WEEK B (Next Week) ROTATING TEMPLATES ───
    const breakfastDefsWeekB: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan
        ? [{ name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Boiled Egg', quantity: 3, servingSize: '3 large' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Whole Wheat Bread', quantity: 2, servingSize: '2 slices' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      1: isVegan
        ? [{ name: 'Besan Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Besan Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Besan Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      2: isVegan
        ? [{ name: 'Moong Dal Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Moong Dal Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Curd (Plain)', quantity: 0.5, servingSize: '75g' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Moong Dal Cheela', quantity: 1.5, servingSize: '2 cheelas (140g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }],
      3: isVegan
        ? [{ name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Paneer Bhurji', quantity: 1, servingSize: '100g' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Egg Bhurji (Indian Scramble)', quantity: 1, servingSize: '2 eggs' }, { name: 'Chapati', quantity: 2, servingSize: '2 medium' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }],
      4: isVegan
        ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Moong Sprouts Salad', quantity: 1, servingSize: '100g' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Moong Sprouts Salad', quantity: 1, servingSize: '100g' }, { name: 'Curd (Plain)', quantity: 0.5, servingSize: '75g' }]
        : [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Moong Sprouts Salad', quantity: 0.5, servingSize: '50g' }],
      5: isVegan
        ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      6: isVegan
        ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }],
    };

    const lunchDefsWeekB: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      1: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soya Chunks Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chole / Chana Masala', quantity: 1, servingSize: '1 bowl (180g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chole / Chana Masala', quantity: 1, servingSize: '1 bowl (180g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chicken Curry (Home Style)', quantity: 1, servingSize: '1 bowl (180g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      3: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Egg Curry (2 Eggs)', quantity: 1, servingSize: '1 bowl (200g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Egg Curry (2 Eggs)', quantity: 1, servingSize: '1 bowl (200g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      4: isVegan
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      5: isVegan
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      6: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
    };

    const dinnerDefsWeekB: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      1: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Egg Bhurji (Indian Scramble)', quantity: 1, servingSize: '2 eggs' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      3: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      4: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      5: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      6: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
    };

    const breakfastTitlesWeekB: Record<number, string> = {
      0: isVegan ? 'Soy Chunks with Warm Phulkas' : (isVegetarian ? 'Paneer Tikka with Warm Phulkas' : 'Farm Boiled Eggs & Whole Wheat Toast'),
      1: isVegan ? 'Besan Cheela with Mint Chutney & Peanuts' : (isVegetarian ? 'Besan Cheela with Fresh Curd & Chutney' : 'Besan Cheela with Boiled Eggs & Chutney'),
      2: isVegan ? 'Moong Dal Cheela with Cucumber Salad & Peanuts' : (isVegetarian ? 'Moong Dal Cheela with Cucumber Salad & Curd' : 'Moong Dal Cheela with Boiled Eggs'),
      3: isVegan ? 'Savory Soya with Warm Phulkas' : (isNonVeg || isEggetarian ? 'Desi Egg Bhurji with Warm Phulkas' : 'Paneer Bhurji with Warm Phulkas'),
      4: isVegan ? 'Homestyle Veggie Poha with Moong Sprouts & Peanuts' : (isVegetarian ? 'Homestyle Veggie Poha with Moong Sprouts & Curd' : 'Homestyle Veggie Poha with Moong Sprouts & Eggs'),
      5: isVegan ? 'Warm Rolled Oats with Apple & Peanuts' : (isVegetarian ? 'Creamy Rolled Oats with Milk & Apple' : 'Rolled Oats with Milk, Eggs & Apple'),
      6: isVegan ? 'Steamed Idlis with Dal Sambar & Peanuts' : (isVegetarian ? 'Steamed Idlis with Dal Sambar & Curd' : 'Steamed Idlis with Dal Sambar & Eggs'),
    };

    const lunchTitlesWeekB: Record<number, string> = {
      0: isVegan ? 'Comfort Rajma Chawal with Soya & Veggies' : (isNonVeg ? 'Rohu Fish Curry with Steamed Rice' : (isEggetarian ? 'Yellow Dal Tadka with Steamed Rice & Eggs' : 'Special Paneer Tikka with Jeera Rice')),
      1: isVegan ? 'High-Protein Soya Matar Curry with Phulkas' : (isNonVeg ? 'Homestyle Chicken with Warm Phulkas' : (isEggetarian ? 'Yellow Dal Tadka with Phulkas & Eggs' : 'High-Protein Soya Matar Curry with Phulkas & Curd')),
      2: isVegan ? 'Punjabi Chana Masala with Jeera Rice & Soya' : (isNonVeg ? 'Homestyle Chicken Curry with Steamed Rice' : (isEggetarian ? 'Punjabi Chana Masala with Jeera Rice & Eggs' : 'Punjabi Chana Masala with Jeera Rice & Dahi')),
      3: isVegan ? 'Yellow Dal Tadka with Phulkas & Soya' : (isNonVeg || isEggetarian ? 'Dhaba Egg Curry with Hot Phulkas' : 'Yellow Dal Tadka with Phulkas & Paneer'),
      4: isVegan ? 'Comfort Dal Rice with Soya & Veggies' : (isNonVeg ? 'Homestyle Chicken with Steamed Rice & Dal' : (isEggetarian ? 'Yellow Dal Tadka with Steamed Rice & Eggs' : 'Yellow Dal Tadka with Steamed Rice & Paneer')),
      5: isVegan ? 'Comfort Rajma Chawal with Soya & Veggies' : (isNonVeg ? 'Rohu Fish Curry with Steamed Rice' : (isEggetarian ? 'Comfort Rajma Chawal with Eggs & Curd' : 'Comfort Rajma Chawal with Curd & Salad')),
      6: isVegan ? 'Punjabi Chana Masala with Phulkas & Soya' : (isNonVeg ? 'Homestyle Chicken with Warm Phulkas' : (isEggetarian ? 'Punjabi Chana Masala with Phulkas & Eggs' : 'Punjabi Chana Masala with Phulkas & Paneer')),
    };

    const dinnerTitlesWeekB: Record<number, string> = {
      0: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Bhurji' : (isEggetarian ? 'Phulkas with Dal Tadka & Boiled Eggs' : 'Phulkas with Dal Tadka & Chicken Breast')),
      1: isVegan ? 'Steamed Rice with Moong Dal & Soya' : (isVegetarian ? 'Steamed Rice with Moong Dal & Paneer Tikka' : 'Steamed Rice with Moong Dal & Boiled Eggs'),
      2: isVegan ? 'Warm Phulkas with Soya & Apple' : (isVegetarian ? 'Paneer Bhurji with Warm Phulkas & Apple' : 'Egg Bhurji with Warm Phulkas & Apple'),
      3: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Tikka' : 'Phulkas with Dal Tadka & Chicken Breast'),
      4: isVegan ? 'Phulkas with Dal Tadka & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Tadka & Paneer Bhurji' : 'Phulkas with Dal Tadka & Boiled Eggs'),
      5: isVegan ? 'Steamed Rice with Sambar & Soya Chunks' : (isVegetarian ? 'Steamed Rice with Sambar & Paneer Tikka' : 'Steamed Rice with Sambar & Fish Curry'),
      6: isVegan ? 'Steamed Rice with Moong Dal & Soya Chunks' : (isVegetarian ? 'Steamed Rice with Moong Dal & Paneer Tikka' : 'Steamed Rice with Moong Dal & Boiled Eggs'),
    };

    const isWeekB = weekCycle === 1;
    const finalBreakfastDefs = isWeekB ? (breakfastDefsWeekB[dayOfWeek] || breakfastDefs[dayOfWeek]) : (breakfastDefs[dayOfWeek] || breakfastDefs[1]);
    const finalLunchDefs = isWeekB ? (lunchDefsWeekB[dayOfWeek] || lunchDefs[dayOfWeek]) : (lunchDefs[dayOfWeek] || lunchDefs[1]);
    const finalDinnerDefs = isWeekB ? (dinnerDefsWeekB[dayOfWeek] || dinnerDefs[dayOfWeek]) : (dinnerDefs[dayOfWeek] || dinnerDefs[1]);

    const finalBreakfastTitle = isWeekB ? (breakfastTitlesWeekB[dayOfWeek] || `${dayName} Breakfast`) : (breakfastTitles[dayOfWeek] || `${dayName} Breakfast`);
    const finalLunchTitle = isWeekB ? (lunchTitlesWeekB[dayOfWeek] || `${dayName} Lunch`) : (lunchTitles[dayOfWeek] || `${dayName} Lunch`);
    const finalDinnerTitle = isWeekB ? (dinnerTitlesWeekB[dayOfWeek] || `${dayName} Dinner`) : (dinnerTitles[dayOfWeek] || `${dayName} Dinner`);

    const mealsPerDayPref = profile?.meals_per_day || '4 meals';
    let userMealTypes: string[];
    if (mealsPerDayPref === '2 meals') {
      userMealTypes = ['lunch', 'dinner'];
    } else if (mealsPerDayPref === '3 meals') {
      userMealTypes = ['breakfast', 'lunch', 'dinner'];
    } else if (mealsPerDayPref === '5+ meals') {
      userMealTypes = ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'];
    } else {
      userMealTypes = ['breakfast', 'lunch', 'pre_workout', 'dinner'];
    }

    if (userMealTypes.includes('breakfast')) {
      plansMap.set('breakfast', buildMealResult('breakfast', finalBreakfastTitle, finalBreakfastDefs, true));
    }
    if (userMealTypes.includes('lunch')) {
      plansMap.set('lunch', buildMealResult('lunch', finalLunchTitle, finalLunchDefs, true));
    }
    if (userMealTypes.includes('pre_workout')) {
      plansMap.set('pre_workout', buildMealResult('pre_workout', 'Pre-Workout Energy Fuel (< 3g Fat)', snackDefs[dayOfWeek] || snackDefs[1], false));
    }
    if (userMealTypes.includes('snack')) {
      plansMap.set('snack', buildMealResult('snack', `${dayName} Natural Snack`, snackDefs[dayOfWeek] || snackDefs[1], false));
    }
    if (userMealTypes.includes('post_workout')) {
      plansMap.set('post_workout', buildMealResult('post_workout', 'Post-Workout Fuel', snackDefs[dayOfWeek] || snackDefs[1], false));
    }
    if (userMealTypes.includes('dinner')) {
      plansMap.set('dinner', buildMealResult('dinner', finalDinnerTitle, finalDinnerDefs, true));
    }

    return plansMap;
  }

  /**
   * Generates 3 curated, diet-compliant meal alternatives for a specific meal slot.
   */
  static getCuratedSwapOptions(
    mealType: string,
    profile: any,
    targets: any,
    foodCatalog: NutritionFoodReference[]
  ) {
    const combinedDiet = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isVegan = combinedDiet.includes('vegan');
    const isNonVeg = !isVegan && (combinedDiet.includes('non') || combinedDiet.includes('meat') || combinedDiet.includes('chicken') || combinedDiet.includes('fish'));
    const isEggetarian = !isVegan && !isNonVeg && (combinedDiet.includes('egg') || combinedDiet.includes('eggetarian'));
    const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;

    const foodEnv = (profile?.food_environment || 'Home').toLowerCase();
    const isCoreProvided = foodEnv === 'pg' || foodEnv === 'hostel' || foodEnv === 'home' || foodEnv === 'office/canteen';
    const isCore = mealType === 'breakfast' || mealType === 'lunch' || mealType === 'dinner';

    const blockedTerms = [
      profile?.food_allergies,
      profile?.foods_disliked,
      profile?.foods_avoided
    ].filter(Boolean).join(',').toLowerCase().split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean);

    const isFoodSafe = (name: string): boolean => {
      if (blockedTerms.length === 0) return true;
      const fLower = name.toLowerCase();
      return !blockedTerms.some(term => term && (fLower.includes(term) || term.includes(fLower)));
    };

    const buildItems = (itemsDef: Array<{ name: string; quantity: number; servingSize?: string }>) => {
      return itemsDef.map((def, index) => {
        let foodName = def.name;
        if (!isFoodSafe(foodName)) {
          if (foodName.toLowerCase().includes('banana')) foodName = 'Apple';
          else if (foodName.toLowerCase().includes('peanut')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Curd (Plain)';
          else if (foodName.toLowerCase().includes('milk')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Curd (Plain)';
          else if (foodName.toLowerCase().includes('egg')) foodName = isVegan ? 'Soy Chunks (Cooked)' : 'Paneer Tikka';
        }

        // Strict dietary safety filter on every food item
        if (isVegan) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('paneer') || fnLower.includes('curd') || fnLower.includes('dahi') || fnLower.includes('milk') || fnLower.includes('egg') || fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat')) {
            if (fnLower.includes('curd') || fnLower.includes('dahi')) foodName = 'Mixed Vegetables';
            else if (fnLower.includes('milk')) foodName = 'Apple';
            else foodName = 'Soy Chunks (Cooked)';
          }
        } else if (isVegetarian) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('egg') || fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat') || fnLower.includes('mutton') || fnLower.includes('beef') || fnLower.includes('pork') || fnLower.includes('prawn') || fnLower.includes('seafood')) {
            foodName = 'Paneer Tikka';
          }
        } else if (isEggetarian) {
          const fnLower = foodName.toLowerCase();
          if (fnLower.includes('chicken') || fnLower.includes('fish') || fnLower.includes('meat') || fnLower.includes('mutton') || fnLower.includes('beef') || fnLower.includes('pork') || fnLower.includes('prawn') || fnLower.includes('seafood')) {
            foodName = 'Boiled Egg';
          }
        }

        const ref = findFoodReference(foodName, foodCatalog, profile?.food_environment);
        const qty = def.quantity || 1;
        const sSize = def.servingSize || (ref ? (qty > 1 ? `${qty} servings` : ref.serving_size || '1 serving') : `${qty} serving`);
        const defaultCals = foodName.toLowerCase().includes('egg') ? 78 : (foodName.toLowerCase().includes('banana') ? 105 : 150);
        const defaultPro = foodName.toLowerCase().includes('egg') ? 6.3 : 5;
        const cals = Math.round(Number(ref?.calories || defaultCals) * qty);
        const pro = Number((Number(ref?.protein || defaultPro) * qty).toFixed(1));
        const carbs = Number((Number(ref?.carbs || 15) * qty).toFixed(1));
        const fat = Number((Number(ref?.fat || 3) * qty).toFixed(1));
        const cost = (isCoreProvided && isCore) ? 0 : Math.round(Number(ref?.estimated_cost || 25) * qty);

        return {
          id: ref?.id || `food-${index}`,
          food_id: ref?.id || `food-${index}`,
          name: ref?.name || foodName,
          category: ref?.category || 'General',
          serving_size: sSize,
          quantity: 1,
          calories: cals,
          protein: pro,
          carbs: carbs,
          fat: fat,
          estimated_cost: cost,
        };
      });
    };

    type RawOption = { title: string; desc: string; items: Array<{ name: string; quantity: number; servingSize?: string }> };
    let rawOptions: RawOption[] = [];

    const mt = mealType.toLowerCase();
    if (mt === 'breakfast') {
      rawOptions = [
        {
          title: 'South Indian Classic',
          desc: 'Light steamed idlis with rich sambar and protein.',
          items: isVegan
            ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : isVegetarian
            ? [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : [{ name: 'Idli', quantity: 2, servingSize: '3 pieces' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        },
        {
          title: 'High-Protein Oats & Fruit',
          desc: 'Warm comforting rolled oats with energy-packed fruit.',
          items: isVegan
            ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
            : isVegetarian
            ? [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
            : [{ name: 'Oats (Cooked)', quantity: 2, servingSize: '2 bowls' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        },
        {
          title: 'Desi Traditional Poha',
          desc: 'Flattened rice tossed with roasted peanuts and fresh fruit.',
          items: isVegan
            ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : isVegetarian
            ? [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
            : [{ name: 'Poha', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        }
      ];
    } else if (mt === 'lunch') {
      rawOptions = [
        {
          title: 'Classic Indian Thali',
          desc: 'Fragrant steamed rice, golden dal tadka, and protein.',
          items: isVegan
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isVegetarian
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isEggetarian
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        },
        {
          title: 'Homestyle Roti & Chana',
          desc: 'Whole wheat chapatis paired with rich chickpeas curry.',
          items: isVegan
            ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isVegetarian
            ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        },
        {
          title: 'Comfort Rajma Rice Bowl',
          desc: 'Slow-cooked kidney beans in savory gravy over white rice.',
          items: isVegan
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isVegetarian
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isEggetarian
            ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
            : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        }
      ];
    } else if (mt === 'dinner') {
      rawOptions = [
        {
          title: 'Light Homestyle Roti & Dal',
          desc: 'Warm chapatis with light yellow dal and mixed greens.',
          items: isVegan
            ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
            : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        },
        {
          title: 'Comfort Rice & Sambar',
          desc: 'Digestible white rice with tangy vegetable sambar.',
          items: isVegan
            ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
            : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        },
        {
          title: 'High-Protein Curry & Chapatis',
          desc: 'Protein-dense dinner for muscle recovery.',
          items: isVegan
            ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
            : isVegetarian
            ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
            : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        }
      ];
    } else {
      // Snack / Pre-workout
      rawOptions = [
        {
          title: 'Energy Banana & Roasted Chana',
          desc: 'Immediate potassium and sustained amino acids with low fat.',
          items: [{ name: 'Banana', quantity: 1, servingSize: '1 medium (118g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }]
        },
        {
          title: 'Crisp Apple & Roasted Chana',
          desc: 'Fresh hydrating energy with light clean crunch.',
          items: [{ name: 'Apple', quantity: 1, servingSize: '1 medium (180g)' }, { name: 'Roasted Chana (Dry Chickpeas)', quantity: 0.8, servingSize: '25g' }]
        },
        {
          title: 'Protein Quick-Charge',
          desc: 'Fast light protein to prime your muscles before training.',
          items: isVegan
            ? [{ name: 'Soy Chunks (Cooked)', quantity: 0.8, servingSize: '1 bowl (80g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : isVegetarian
            ? [{ name: 'Curd / Dahi (Plain)', quantity: 0.5, servingSize: '75g' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : [{ name: 'Boiled Egg White', quantity: 2, servingSize: '2 whites' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        }
      ];
    }

    const mealsPerDay = profile?.meals_per_day || '4 meals';
    const slotProportions: Record<string, number> = {
      breakfast: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.20 : (mealsPerDay === '2 meals' ? 0.0 : 0.25)),
      lunch: mealsPerDay === '3 meals' ? 0.40 : (mealsPerDay === '5+ meals' ? 0.30 : (mealsPerDay === '2 meals' ? 0.55 : 0.35)),
      pre_workout: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      snack: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
      post_workout: 0.13,
      dinner: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.25 : (mealsPerDay === '2 meals' ? 0.45 : 0.25)),
    };
    const slotPct = slotProportions[mt] ?? 0.25;
    const targetCals = Math.round(Number(targets?.calories || 2000) * slotPct);

function scaleServingSize(servingSize: string, scale: number): string {
  if (!servingSize || Math.abs(scale - 1) < 0.02) return servingSize;

  let res = servingSize;

  // 1. Grams: e.g. "(150g)", "100g" -> round to nearest 5g
  res = res.replace(/\b(\d+)\s*g\b/gi, (_, g) => {
    const val = Number(g);
    if (val <= 0) return `${g}g`;
    const scaledG = Math.round(val * scale / 5) * 5;
    return `${Math.max(5, scaledG)}g`;
  });

  // 2. Bowls: e.g. "2 bowls cooked", "1 bowl"
  res = res.replace(/\b(\d+(?:\.\d+)?)\s*bowls?\b/gi, (_, b) => {
    const val = Number(b);
    const scaledB = parseFloat((val * scale).toFixed(1));
    return `${scaledB} ${scaledB === 1 ? 'bowl' : 'bowls'}`;
  });

  // 3. Pieces or medium: e.g. "3 medium", "3 pieces"
  res = res.replace(/\b(\d+(?:\.\d+)?)\s*(medium|pieces?)\b/gi, (_, p, unit) => {
    const val = Number(p);
    const scaledP = parseFloat((val * scale).toFixed(1));
    return `${scaledP} ${unit}`;
  });

  return res;
}

    return rawOptions.map((opt, optIndex) => {
      const items = buildItems(opt.items);
      const rawCals = items.reduce((acc, it) => acc + it.calories, 0);
      const scale = rawCals > 0 ? (targetCals / rawCals) : 1;
      const scaledItems = items.map(it => ({
        ...it,
        serving_size: scaleServingSize(it.serving_size, scale),
        calories: Math.round(it.calories * scale),
        protein: Number((it.protein * scale).toFixed(1)),
        carbs: Number((it.carbs * scale).toFixed(1)),
        fat: Number((it.fat * scale).toFixed(1)),
        estimated_cost: Math.round(it.estimated_cost * scale)
      }));

      const totals = scaledItems.reduce((acc, it) => ({
        calories: acc.calories + it.calories,
        protein: Number((acc.protein + it.protein).toFixed(1)),
        carbs: Number((acc.carbs + it.carbs).toFixed(1)),
        fat: Number((acc.fat + it.fat).toFixed(1)),
        cost: acc.cost + it.estimated_cost
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 });

      return {
        id: `swap-opt-${optIndex}`,
        name: opt.title,
        description: opt.desc,
        calories: totals.calories || targetCals,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        estimated_cost: totals.cost,
        items: scaledItems
      };
    });
  }

  static async getTodaySummaryAndDetails(userId: string, targetDateStr?: string, forceRefresh = false) {
    const cache = getGlobalNutritionCache();
    const cacheKey = `full_${userId}_${targetDateStr || 'today'}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    // 30-second server cache: return in 0ms if visited recently
    if (!forceRefresh && cached && (now - cached.timestamp < 30_000)) {
      return cached.data;
    }

    const supabase = createAdminClient();
    
    // Fetch timezone once to avoid 3 redundant DB calls
    const tz = await this.getUserTimezone(userId);
    const localDate = targetDateStr || await this.getLocalDateString(userId, tz);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz, localDate);

    // Monthly spent calculation
    const firstDayOfMonth = localDate.substring(0, 8) + '01'; // YYYY-MM-01
    const mFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric' });
    let mOffsetStr = mFormatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
    if (!mOffsetStr || mOffsetStr === 'GMT') mOffsetStr = 'GMT+00:00';
    mOffsetStr = mOffsetStr.replace('GMT', '');
    const monthStartISO = new Date(`${firstDayOfMonth}T00:00:00.000${mOffsetStr}`).toISOString();

    // Food catalog: cached for 5 minutes to avoid pulling 300 rows on every cold hit
    const foodCatalogPromise = (globalFoodCatalogCache && (Date.now() - globalFoodCatalogCache.timestamp < 5 * 60 * 1000))
      ? Promise.resolve({ data: globalFoodCatalogCache.data })
      : supabase
          .from('foods')
          .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly')
          .eq('is_active', true)
          .limit(300)
          .then(res => {
            if (res.data && res.data.length > 0) {
              globalFoodCatalogCache = { data: res.data, timestamp: Date.now() };
            }
            return res;
          });

    // Parallelize all data fetching
    const [targets, foodsRes, watersRes, plansRes, monthFoodsRes, fitProfileRes, activePlanRes, foodCatalogRes, weeklyPlanStatus] = await Promise.all([
      this.getEffectiveTargets(userId, localDate, tz),
      supabase
        .from('food_logs')
        .select('*, foods(name, category)')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      supabase
        .from('fitness_os_water_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      supabase
        .from('meal_plans')
        .select('*, meal_plan_items(*, foods(*))')
        .eq('user_id', userId)
        .eq('date', localDate),
      supabase
        .from('food_logs')
        .select('estimated_cost, meal_type, foods(name)')
        .eq('user_id', userId)
        .gte('logged_at', monthStartISO)
        .lte('logged_at', end),
      supabase
        .from('fitness_os_profiles')
        .select('diet_preference, food_type, food_allergies, foods_disliked, foods_avoided, available_foods, nutrition_budget, food_environment, meals_per_day, nutrition_medical_conditions')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('fitness_os_workout_plans')
        .select('plan_data')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle(),
      foodCatalogPromise,
      this.getWeeklyPlanEligibility(userId)
    ]);

    if (!targets) {
      throw new Error("TARGET_NOT_FOUND");
    }

    const foods = foodsRes.data;
    const waters = watersRes.data;
    const plans = plansRes.data;
    const monthFoods = monthFoodsRes.data;
    const fitProfile = fitProfileRes.data;
    const activePlan = activePlanRes.data;
    const foodCatalog = (foodCatalogRes.data || []) as NutritionFoodReference[];
    const aiMeals = activePlan?.plan_data?.nutrition?.meals || [];

    // 3. Compute consumed
    let consumed = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water_ml: 0,
      spent: 0
    };

    const completedMealTypes = new Set<string>();

    if (foods) {
      foods.forEach(f => {
        consumed.calories += f.calories;
        consumed.protein += Number(f.protein);
        consumed.carbs += Number(f.carbs);
        consumed.fat += Number(f.fat);
        
        const isItemCore = isStapleCoreFood(f.foods?.name, fitProfile?.food_environment);
        const cost = isItemCore ? 0 : (Number(f.estimated_cost) || getRealisticFoodCost(f.foods?.name));
        consumed.spent += cost;
        
        if (f.meal_type) completedMealTypes.add(f.meal_type);
      });
    }

    const targetWater = Number(targets.water_ml) || 2500;
    if (waters) {
      waters.forEach(w => consumed.water_ml += (Number(w.amount_ml) || 0));
    }

    let monthSpent = 0;
    if (monthFoods) {
      monthFoods.forEach((f: any) => {
        const isItemCore = isStapleCoreFood(f.foods?.name, fitProfile?.food_environment);
        const cost = isItemCore ? 0 : (Number(f.estimated_cost) || getRealisticFoodCost(f.foods?.name));
        monthSpent += cost;
      });
    }

    let monthlyLimit = 4500;
    if (fitProfile?.nutrition_budget) {
      const bStr = fitProfile.nutrition_budget;
      if (bStr.includes('5,000+') || bStr.includes('5000+')) monthlyLimit = 7500;
      else if (bStr.includes('2,000–5,000') || bStr.includes('2,000-5,000')) monthlyLimit = 4500;
      else if (bStr.includes('1,000–2,000') || bStr.includes('1,000-2,000')) monthlyLimit = 2000;
      else if (bStr.includes('0–1,000') || bStr.includes('0-1,000')) monthlyLimit = 1000;
    }
    // Authentic daily out-of-pocket limit (No fake 150 floor!)
    const dailyLimit = Math.max(25, Math.round(monthlyLimit / 30));

    // 7-day rotating menu calculation strictly adhering to user onboarding profile
    const targetDate = new Date(`${localDate}T12:00:00.000Z`);
    const dayOfWeek = isNaN(targetDate.getTime()) ? new Date().getDay() : targetDate.getUTCDay();
    // 2-week cycle calculation (Week A = 0, Week B = 1) ensuring next week has a brand new fresh rotation
    const epochWeeks = Math.floor((targetDate.getTime() || Date.now()) / (7 * 24 * 60 * 60 * 1000));
    const weekCycle = Math.abs(epochWeeks) % 2;
    const rotatingPlans = NutritionService.getRotatingMealPlanForDay(dayOfWeek, fitProfile, targets, foodCatalog, weekCycle);

    const rawDietStr = `${fitProfile?.diet_preference || ''} ${fitProfile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isProfileVegan = rawDietStr.includes('vegan');
    const isProfileNonVeg = !isProfileVegan && (rawDietStr.includes('non') || rawDietStr.includes('meat') || rawDietStr.includes('chicken') || rawDietStr.includes('fish'));
    const isProfileEggetarian = !isProfileVegan && !isProfileNonVeg && (rawDietStr.includes('egg') || rawDietStr.includes('eggetarian'));
    const isProfileVegetarian = !isProfileVegan && !isProfileNonVeg && !isProfileEggetarian;

    // Determine meal types based on user's meals_per_day preference
    const mealsPerDay = fitProfile?.meals_per_day || '4 meals';
    let ALL_MEAL_TYPES: string[];
    if (mealsPerDay === '2 meals') {
      ALL_MEAL_TYPES = ['lunch', 'dinner'];
    } else if (mealsPerDay === '3 meals') {
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
    } else if (mealsPerDay === '5+ meals') {
      ALL_MEAL_TYPES = ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'];
    } else {
      // 4 meals (default)
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'pre_workout', 'dinner'];
    }
    const plansByMealType = new Map<string, any>();

    if (plans && plans.length > 0) {
      if (plans.length === 1 && plans[0].meal_type === 'daily') {
        const dailyPlan = plans[0];
        const allItems = dailyPlan.meal_plan_items || [];
        
        const itemsByType: Record<string, any[]> = {};
        const titleByType: Record<string, string> = {};
        const optBTitleByType: Record<string, string> = {};
        const optBItemsByType: Record<string, any[]> = {};
        ALL_MEAL_TYPES.forEach(mt => { 
          itemsByType[mt] = []; 
          optBItemsByType[mt] = [];
        });

        allItems.forEach((item: any, idx: number) => {
          const rawServing = String(item.serving_size || '');
          let targetType = '';
          let mealTitle = '';
          let actualServing = rawServing;
          let isOptB = false;

          if (rawServing.includes('::')) {
            const parts = rawServing.split('::');
            targetType = parts[0]?.toLowerCase().trim();
            if (parts[1]?.toLowerCase() === 'optb') {
              isOptB = true;
              mealTitle = parts[2]?.trim() || '';
              actualServing = parts.slice(3).join('::') || parts[2] || '1 serving';
            } else {
              mealTitle = parts[1]?.trim() || '';
              actualServing = parts.slice(2).join('::') || parts[1] || '1 serving';
            }
          }

          const isItemCore = isStapleCoreFood(item.foods?.name, fitProfile?.food_environment);
          const unitCost = isItemCore ? 0 : getRealisticFoodCost(item.foods?.name, item.foods?.estimated_cost);
          const normalizedItem = {
            ...item,
            is_core: isItemCore,
            serving_size: actualServing,
            foods: item.foods ? {
              ...item.foods,
              estimated_cost: unitCost
            } : item.foods
          };

          if (targetType && (itemsByType[targetType] || optBItemsByType[targetType])) {
            if (isOptB) {
              if (mealTitle && !optBTitleByType[targetType]) {
                optBTitleByType[targetType] = mealTitle;
              }
              optBItemsByType[targetType]?.push(normalizedItem);
            } else {
              if (mealTitle && !titleByType[targetType]) {
                titleByType[targetType] = mealTitle;
              }
              itemsByType[targetType]?.push(normalizedItem);
            }
          } else {
            // Fallback: heuristic categorization
            const cat = (item.foods?.category || '').toLowerCase();
            const name = (item.foods?.name || '').toLowerCase();

            if (itemsByType.breakfast && (cat.includes('breakfast') || name.includes('idli') || name.includes('dosa') || name.includes('poha') || name.includes('upma') || name.includes('oats') || name.includes('coffee') || name.includes('milk') || name.includes('egg'))) {
              itemsByType.breakfast.push(normalizedItem);
            } else if ((itemsByType.pre_workout || itemsByType.post_workout || itemsByType.snack) && (cat.includes('fruit') || cat.includes('snack') || name.includes('banana') || name.includes('apple') || name.includes('peanut'))) {
              const bucket = itemsByType.pre_workout || itemsByType.snack || itemsByType.post_workout;
              if (bucket) bucket.push(normalizedItem);
            } else if (itemsByType.lunch && idx % 2 === 0) {
              itemsByType.lunch.push(normalizedItem);
            } else if (itemsByType.dinner) {
              itemsByType.dinner.push(normalizedItem);
            } else {
              const firstType = ALL_MEAL_TYPES[0];
              if (itemsByType[firstType]) itemsByType[firstType].push(normalizedItem);
            }
          }
        });

        ALL_MEAL_TYPES.forEach(mType => {
          const mItems = itemsByType[mType];
          let optBItems = optBItemsByType[mType] || [];
          let optBName = optBTitleByType[mType] || '';

          // If no Option B was stored, synthesize an authentic Option B using swap alternatives
          if (!optBItems || optBItems.length === 0) {
            const swapAlternatives = NutritionService.getCuratedSwapOptions(mType, fitProfile, targets, foodCatalog);
            const altOpt = swapAlternatives[1] || swapAlternatives[0];
            if (altOpt) {
              optBName = altOpt.name;
              optBItems = (altOpt.items || []).map((it: any, optIdx: number) => ({
                id: `optb-${dailyPlan.id}-${mType}-${optIdx}`,
                food_id: it.food_id || it.id,
                quantity: it.quantity || 1,
                serving_size: it.serving_size,
                foods: {
                  id: it.food_id || it.id,
                  name: it.name,
                  category: it.category || 'General',
                  serving_size: it.serving_size,
                  calories: it.calories,
                  protein: it.protein,
                  carbs: it.carbs,
                  fat: it.fat,
                  estimated_cost: it.estimated_cost
                }
              }));
            }
          }

          const mCals = mItems.reduce((acc, it) => acc + Math.round((it.foods?.calories || 0) * it.quantity), 0);
          const mPro = Number(mItems.reduce((acc, it) => acc + Number((it.foods?.protein || 0) * it.quantity), 0).toFixed(1));
          const mCarbs = Number(mItems.reduce((acc, it) => acc + Number((it.foods?.carbs || 0) * it.quantity), 0).toFixed(1));
          const mFat = Number(mItems.reduce((acc, it) => acc + Number((it.foods?.fat || 0) * it.quantity), 0).toFixed(1));
          const mCost = mItems.reduce((acc, it) => {
            const isCore = it.is_core ?? isStapleCoreFood(it.foods?.name, fitProfile?.food_environment);
            const itemUnitCost = isCore ? 0 : getRealisticFoodCost(it.foods?.name, it.foods?.estimated_cost);
            return acc + Math.round(itemUnitCost * it.quantity);
          }, 0);
          const mName = titleByType[mType] || (mType.charAt(0).toUpperCase() + mType.slice(1) + " Plan");
          plansByMealType.set(mType, {
            id: `${dailyPlan.id}-${mType}`,
            meal_type: mType,
            name: sanitizeMealTitle(mName, isProfileVegan, isProfileVegetarian, isProfileEggetarian),
            option_b_name: optBName ? sanitizeMealTitle(optBName, isProfileVegan, isProfileVegetarian, isProfileEggetarian) : undefined,
            calories: mCals,
            protein: mPro,
            carbs: mCarbs,
            fat: mFat,
            estimated_cost: mCost,
            meal_plan_items: mItems,
            option_b_items: optBItems,
            is_ai_generated: Boolean(dailyPlan.ai_generated),
            ai_generated: Boolean(dailyPlan.ai_generated),
            prep_instructions: NutritionService.getPrepInstructionForSlot(mType, mName, dayOfWeek, fitProfile?.food_environment, rawDietStr)
          });
        });
      } else {
        plans.forEach(p => {
          if (p.meal_type) {
            const mItems = p.meal_plan_items || [];
            const mCals = mItems.reduce((acc: number, it: any) => acc + Math.round((it.foods?.calories || 0) * it.quantity), 0);
            const mPro = mItems.reduce((acc: number, it: any) => acc + Number((it.foods?.protein || 0) * it.quantity), 0);
            plansByMealType.set(p.meal_type.toLowerCase(), {
              ...p,
              calories: mCals,
              protein: mPro,
              meal_plan_items: mItems
            });
          }
        });
      }
    }

    const hasExplicitPlanForDate = Boolean(plans && plans.length > 0);
    // Dated meal_plans are the source of truth for a generated 7-day plan.
    // Legacy workout-plan meals are only used when this user has no dated plan at all.
    let hasSavedMealPlans = hasExplicitPlanForDate;
    if (!hasSavedMealPlans && aiMeals.length > 0) {
      const anyPlanRes = await supabase
        .from('meal_plans')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      // If the lookup fails, do not risk showing legacy meals outside a saved plan.
      hasSavedMealPlans = Boolean(anyPlanRes.error || anyPlanRes.data?.length);
    }
    const hasAiMeals = !hasSavedMealPlans && Boolean(aiMeals && aiMeals.length > 0);
    const userHasAnyPlan = Boolean(
      hasExplicitPlanForDate ||
      hasAiMeals
    );

    let formattedMeals: any[] = [];

    if (hasExplicitPlanForDate) {
      formattedMeals = ALL_MEAL_TYPES.map((mType, slotIdx) => {
        // 1. Manually saved/logged meal plan items for this specific date take top priority
        const existing = plansByMealType.get(mType);
        if (existing) {
          if (isProfileVegan || isProfileVegetarian || isProfileEggetarian) {
            const sanitizedItems = (existing.meal_plan_items || []).map((it: any) => {
              const foodName = it.foods?.name || '';
              const sanitizedName = sanitizeAIItemName(foodName, isProfileVegan, isProfileVegetarian, isProfileEggetarian);
              if (sanitizedName !== foodName) {
                const ref = findFoodReference(sanitizedName, foodCatalog, fitProfile?.food_environment);
                return {
                  ...it,
                  foods: ref ? { ...it.foods, ...ref } : { ...it.foods, name: sanitizedName }
                };
              }
              return it;
            });
            return {
              ...existing,
              is_ai_generated: Boolean(existing.ai_generated),
              prep_instructions: existing.prep_instructions || NutritionService.getPrepInstructionForSlot(mType, existing.name, dayOfWeek, fitProfile?.food_environment, rawDietStr),
              name: sanitizeMealTitle(existing.name || '', isProfileVegan, isProfileVegetarian, isProfileEggetarian),
              meal_plan_items: sanitizedItems
            };
          }
          return {
            ...existing,
            is_ai_generated: Boolean(existing.ai_generated),
            prep_instructions: existing.prep_instructions || NutritionService.getPrepInstructionForSlot(mType, existing.name, dayOfWeek, fitProfile?.food_environment, rawDietStr)
          };
        }

        // Slot fallback if individual slot missing in daily plan
        const rotating = rotatingPlans.get(mType);
        return rotating ? {
          ...rotating,
          is_natural_whole_food: true,
          has_7day_variety: true,
        } : null;
      }).filter(Boolean);
    } else if (hasAiMeals) {
      // Use AI plan meals from active plan
      formattedMeals = aiMeals.map((m: any, idx: number, arr: any[]) => {
        let derivedType = m.meal_type;
        if (!derivedType) {
          const ctx = `${m.meal_name || m.name || ''} ${m.time_of_day || ''} ${m.prep_instructions || ''}`.toLowerCase();
          if (ctx.includes('breakfast') || ctx.includes('waking') || ctx.includes('morning')) derivedType = 'breakfast';
          else if (ctx.includes('lunch') || ctx.includes('midday') || ctx.includes('noon')) derivedType = 'lunch';
          else if (ctx.includes('dinner') || ctx.includes('night') || ctx.includes('supper') || ctx.includes('evening')) derivedType = 'dinner';
          else if (ctx.includes('pre')) derivedType = 'pre_workout';
          else if (ctx.includes('post')) derivedType = 'post_workout';
          else if (arr.length === 3) derivedType = idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : 'dinner';
          else derivedType = idx === 0 ? 'breakfast' : idx === arr.length - 1 ? 'dinner' : 'lunch';
        }
        return {
          ...m,
          meal_type: derivedType,
          name: sanitizeMealTitle(m.meal_name || m.name || derivedType, isProfileVegan, isProfileVegetarian, isProfileEggetarian),
          is_ai_generated: true,
          ai_generated: true,
        };
      });
    } else {
      // No saved plan for this date. Do not fabricate meals beyond the seven dated days.
      formattedMeals = [];
    }

    // Calibrate all meals to strictly match the user's calories, protein, carbs, fat, and budget
    formattedMeals = calibrateMealsToTargets(formattedMeals, targets, fitProfile);

    // Round consumed values
    consumed.calories = Math.round(consumed.calories);
    consumed.protein = Math.round(consumed.protein);
    consumed.carbs = Math.round(consumed.carbs);
    consumed.fat = Math.round(consumed.fat);
    consumed.water_ml = Math.round(consumed.water_ml);
    consumed.spent = Math.round(consumed.spent);

    // Remaining
    const remaining = {
      calories: Math.round(Math.max(targets.calories - consumed.calories, 0)),
      protein: Math.round(Math.max(targets.protein - consumed.protein, 0)),
      carbs: Math.round(Math.max(targets.carbs - consumed.carbs, 0)),
      fat: Math.round(Math.max(targets.fat - consumed.fat, 0)),
      water_ml: Math.round(Math.max(targets.water_ml - consumed.water_ml, 0))
    };

    // Progress
    const progress = {
      calories_percent: Math.min(100, (consumed.calories / targets.calories) * 100),
      protein_percent: Math.min(100, (consumed.protein / targets.protein) * 100),
      water_percent: Math.min(100, (consumed.water_ml / targets.water_ml) * 100)
    };

    const totalMeals = formattedMeals.length > 0 ? formattedMeals.length : 4;
    let mealsCompleted = formattedMeals.filter(p => completedMealTypes.has(p.meal_type)).length;

    const score = this.computeNutritionScore(consumed, targets, mealsCompleted, totalMeals);

    const result = {
      user_id: userId,
      date: localDate,
      timezone: tz,
      day_of_week: dayOfWeek,
      targets,
      consumed,
      remaining,
      meals: formattedMeals,
      logged_foods: foods || [],
      budget: {
        daily_limit: dailyLimit,
        spent: consumed.spent,
        remaining: Math.max(dailyLimit - consumed.spent, 0),
        monthly_limit: monthlyLimit,
        monthly_spent: monthSpent
      },
      progress,
      nutrition_score: score,
      has_ai_plan: userHasAnyPlan,
      weekly_plan_status: weeklyPlanStatus,
      is_natural_whole_food: true,
      _freshFromDb: true,
      food_environment: fitProfile?.food_environment || 'Home',
      food_allergies: fitProfile?.food_allergies || '',
      nutrition_medical_conditions: fitProfile?.nutrition_medical_conditions ?? null,
      food_type: isProfileVegan
        ? 'Vegan'
        : isProfileVegetarian
        ? 'Vegetarian'
        : isProfileEggetarian
        ? 'Eggetarian'
        : isProfileNonVeg
        ? 'Non-Vegetarian'
        : (fitProfile?.food_type || fitProfile?.diet_preference || undefined)
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  /**
   * Lightweight version of getTodaySummaryAndDetails for the dashboard.
   * Skips the 300-item food catalog, meal_plans table, and weekly plan eligibility
   * — none of which are needed for dashboard display.
   * Eliminates timezone waterfalls, reuses pre-fetched profile and plan data,
   * and caches monthly spending to minimize database load.
   */
  static async getDashboardSummary(
    userId: string,
    targetDateOrOptions?: string | {
      targetDateStr?: string;
      preFetchedTz?: string;
      preFetchedProfile?: any;
      preFetchedPlanData?: any;
    }
  ) {
    const targetDateStr = typeof targetDateOrOptions === 'string'
      ? targetDateOrOptions
      : targetDateOrOptions?.targetDateStr;
    const preFetchedTz = typeof targetDateOrOptions === 'object' ? targetDateOrOptions.preFetchedTz : undefined;
    const preFetchedProfile = typeof targetDateOrOptions === 'object' ? targetDateOrOptions.preFetchedProfile : undefined;
    const preFetchedPlanData = typeof targetDateOrOptions === 'object' ? targetDateOrOptions.preFetchedPlanData : undefined;

    const cache = getGlobalNutritionCache();
    const cacheKey = `dash_${userId}_${targetDateStr || 'today'}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();

    // 30-second server cache: return in 0ms if visited recently
    if (cached && (now - cached.timestamp < 30_000)) {
      return cached.data;
    }

    const supabase = createAdminClient();

    // 1. Resolve timezone and date boundaries without blocking waterfalls (0ms on warm cache)
    const tz = preFetchedTz || await this.getUserTimezone(userId);
    const localDate = targetDateStr || await this.getLocalDateString(userId, tz);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz, localDate);

    // 2. Resolve Profile (reusing pre-fetched profile or request-memoized getCachedFitnessProfile)
    const fitProfilePromise = preFetchedProfile
      ? Promise.resolve(preFetchedProfile)
      : getCachedFitnessProfile(userId).catch(() => null);

    // 3. Resolve Plan data (reusing pre-fetched plan or querying only if needed)
    const activePlanPromise = (preFetchedPlanData !== undefined)
      ? Promise.resolve({ plan_data: preFetchedPlanData })
      : supabase
          .from('fitness_os_workout_plans')
          .select('plan_data')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(res => res.data);

    // 4. Monthly spent calculation:
    const firstDayOfMonth = localDate.substring(0, 8) + '01';
    const isFirstDayOfMonth = localDate === firstDayOfMonth;
    const monthKey = localDate.substring(0, 7);

    const mFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric' });
    let mOffsetStr = mFormatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
    if (!mOffsetStr || mOffsetStr === 'GMT') mOffsetStr = 'GMT+00:00';
    mOffsetStr = mOffsetStr.replace('GMT', '');
    const monthStartISO = new Date(`${firstDayOfMonth}T00:00:00.000${mOffsetStr}`).toISOString();

    const spentCache = getMonthlySpentCache();
    const cachedSpent = spentCache.get(userId);

    const pastSpentPromise = (async () => {
      if (isFirstDayOfMonth) {
        return 0;
      }
      if (cachedSpent && cachedSpent.monthKey === monthKey && cachedSpent.dateKey === localDate && cachedSpent.expiresAt > now) {
        return cachedSpent.pastSpent;
      }

      const fitProfile = await fitProfilePromise;

      const { data: pastMonthFoods } = await supabase
        .from('food_logs')
        .select('estimated_cost, meal_type, foods(name)')
        .eq('user_id', userId)
        .gte('logged_at', monthStartISO)
        .lt('logged_at', start);

      let pastSpent = 0;
      if (pastMonthFoods) {
        pastMonthFoods.forEach((f: any) => {
          const isItemCore = isStapleCoreFood(f.foods?.name, fitProfile?.food_environment);
          const cost = isItemCore ? 0 : (Number(f.estimated_cost) || getRealisticFoodCost(f.foods?.name));
          pastSpent += cost;
        });
      }

      spentCache.set(userId, {
        pastSpent,
        monthKey,
        dateKey: localDate,
        expiresAt: now + 5 * 60 * 1000,
      });

      return pastSpent;
    })();

    // 5. Parallel execution of independent queries
    const [targets, foodsRes, watersRes, pastMonthSpent, fitProfile, activePlan] = await Promise.all([
      this.getEffectiveTargets(userId, localDate, tz, preFetchedProfile, preFetchedPlanData),
      supabase
        .from('food_logs')
        .select('*, foods(name, category)')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      supabase
        .from('fitness_os_water_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      pastSpentPromise,
      fitProfilePromise,
      activePlanPromise,
    ]);

    if (!targets) {
      throw new Error("TARGET_NOT_FOUND");
    }

    const foods = foodsRes.data;
    const waters = watersRes.data;
    const aiMeals = activePlan?.plan_data?.nutrition?.meals || [];

    // Compute consumed macros
    let consumed = { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0, spent: 0 };
    const completedMealTypes = new Set<string>();

    if (foods) {
      foods.forEach(f => {
        consumed.calories += f.calories;
        consumed.protein += Number(f.protein);
        consumed.carbs += Number(f.carbs);
        consumed.fat += Number(f.fat);
        const isItemCore = isStapleCoreFood(f.foods?.name, fitProfile?.food_environment);
        const cost = isItemCore ? 0 : (Number(f.estimated_cost) || getRealisticFoodCost(f.foods?.name));
        consumed.spent += cost;
        if (f.meal_type) completedMealTypes.add(f.meal_type);
      });
    }

    if (waters) {
      waters.forEach(w => consumed.water_ml += (Number(w.amount_ml) || 0));
    }

    const monthSpent = pastMonthSpent + consumed.spent;

    const userBudgetInfo = calculateDailyBudget(fitProfile?.nutrition_budget, fitProfile);
    const monthlyLimit = userBudgetInfo.monthlyBudget;
    const dailyLimit = userBudgetInfo.dailyBudget;

    const rawDietStr = `${fitProfile?.diet_preference || ''} ${fitProfile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
    const isProfileVegan = rawDietStr.includes('vegan');
    const isProfileNonVeg = !isProfileVegan && (rawDietStr.includes('non') || rawDietStr.includes('meat') || rawDietStr.includes('chicken') || rawDietStr.includes('fish'));
    const isProfileEggetarian = !isProfileVegan && !isProfileNonVeg && (rawDietStr.includes('egg') || rawDietStr.includes('eggetarian'));
    const isProfileVegetarian = !isProfileVegan && !isProfileNonVeg && !isProfileEggetarian;

    // Use AI plan meals for the dashboard meal list (no food catalog needed)
    const mealsPerDay = fitProfile?.meals_per_day || '4 meals';
    let ALL_MEAL_TYPES: string[];
    if (mealsPerDay === '2 meals') {
      ALL_MEAL_TYPES = ['lunch', 'dinner'];
    } else if (mealsPerDay === '3 meals') {
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
    } else if (mealsPerDay === '5+ meals') {
      ALL_MEAL_TYPES = ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'];
    } else {
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'pre_workout', 'dinner'];
    }

    // Build meals from AI plan only (no DB meal_plans lookup needed for dashboard)
    let formattedMeals: any[] = [];
    if (aiMeals && aiMeals.length > 0) {
      formattedMeals = aiMeals.map((m: any, idx: number, arr: any[]) => {
        let derivedType = m.meal_type;
        if (!derivedType) {
          const ctx = `${m.meal_name || m.name || ''} ${m.time_of_day || ''} ${m.prep_instructions || ''}`.toLowerCase();
          if (ctx.includes('breakfast') || ctx.includes('waking') || ctx.includes('morning')) derivedType = 'breakfast';
          else if (ctx.includes('lunch') || ctx.includes('midday') || ctx.includes('noon')) derivedType = 'lunch';
          else if (ctx.includes('dinner') || ctx.includes('night') || ctx.includes('supper') || ctx.includes('evening')) derivedType = 'dinner';
          else if (ctx.includes('pre')) derivedType = 'pre_workout';
          else if (ctx.includes('post')) derivedType = 'post_workout';
          else if (arr.length === 3) derivedType = idx === 0 ? 'breakfast' : idx === 1 ? 'lunch' : 'dinner';
          else derivedType = idx === 0 ? 'breakfast' : idx === arr.length - 1 ? 'dinner' : 'lunch';
        }
        return {
          ...m,
          meal_type: derivedType,
          name: sanitizeMealTitle(m.meal_name || m.name || derivedType, isProfileVegan, isProfileVegetarian, isProfileEggetarian),
        };
      });
    }

    // Calibrate meals to user's macro targets
    formattedMeals = calibrateMealsToTargets(formattedMeals, targets, fitProfile);

    // Round consumed values
    consumed.calories = Math.round(consumed.calories);
    consumed.protein = Math.round(consumed.protein);
    consumed.carbs = Math.round(consumed.carbs);
    consumed.fat = Math.round(consumed.fat);
    consumed.water_ml = Math.round(consumed.water_ml);
    consumed.spent = Math.round(consumed.spent);

    const remaining = {
      calories: Math.round(Math.max(targets.calories - consumed.calories, 0)),
      protein: Math.round(Math.max(targets.protein - consumed.protein, 0)),
      carbs: Math.round(Math.max(targets.carbs - consumed.carbs, 0)),
      fat: Math.round(Math.max(targets.fat - consumed.fat, 0)),
      water_ml: Math.round(Math.max(targets.water_ml - consumed.water_ml, 0)),
    };

    const progress = {
      calories_percent: Math.min(100, (consumed.calories / targets.calories) * 100),
      protein_percent: Math.min(100, (consumed.protein / targets.protein) * 100),
      water_percent: Math.min(100, (consumed.water_ml / targets.water_ml) * 100),
    };

    const totalMeals = formattedMeals.length > 0 ? formattedMeals.length : 4;
    const mealsCompleted = formattedMeals.filter(p => completedMealTypes.has(p.meal_type)).length;
    const score = this.computeNutritionScore(consumed, targets, mealsCompleted, totalMeals);

    const result = {
      user_id: userId,
      date: localDate,
      targets,
      consumed,
      remaining,
      meals: formattedMeals,
      logged_foods: foods || [],
      budget: {
        daily_limit: dailyLimit,
        spent: consumed.spent,
        remaining: Math.max(dailyLimit - consumed.spent, 0),
        monthly_limit: monthlyLimit,
        monthly_spent: monthSpent,
      },
      progress,
      nutrition_score: score,
      has_ai_plan: formattedMeals.some((m: any) => Boolean(m.ai_generated || m.is_ai_generated)),
      weekly_plan_status: null,
      is_natural_whole_food: true,
      _freshFromDb: true,
      food_environment: fitProfile?.food_environment || 'Home',
      food_type: isProfileVegan
        ? 'Vegan'
        : isProfileVegetarian
        ? 'Vegetarian'
        : isProfileEggetarian
        ? 'Eggetarian'
        : isProfileNonVeg
        ? 'Non-Vegetarian'
        : (fitProfile?.food_type || fitProfile?.diet_preference || undefined),
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  /**
   * Derives and synchronizes the smart grocery list from the user's active 7-day meal plan.
   * Updates fitness_grocery_items and the active workout plan's plan_data.nutrition.grocery_list.
   */
  static async syncGroceryListFromMealPlans(userId: string): Promise<any[]> {
    try {
      const supabase = createAdminClient();
      
      const [{ data: profile }, { data: activePlan }, { data: mealPlans }] = await Promise.all([
        supabase
          .from('fitness_os_profiles')
          .select('nutrition_budget, food_environment, diet_preference, food_type')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('fitness_os_workout_plans')
          .select('id, plan_data')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('meal_plans')
          .select('id, date, meal_plan_items(*, foods(*))')
          .eq('user_id', userId)
          .order('date', { ascending: true })
          .limit(7)
      ]);

      if (!mealPlans || mealPlans.length === 0) return [];

      const foodMap = new Map<string, {
        food: any;
        dailyOccurrences: number;
        totalQuantity: number;
        usedInMeals: Set<string>;
      }>();

      const env = profile?.food_environment || 'Home';

      mealPlans.forEach(plan => {
        (plan.meal_plan_items || []).forEach((it: any) => {
          const foodName = it.foods?.name || it.name;
          if (!foodName) return;

          const isCore = it.is_core ?? isStapleCoreFood(foodName, env);
          if (isCore) return;

          let targetType = 'Meal';
          const rawServing = String(it.serving_size || '');
          if (rawServing.includes('::')) {
            targetType = rawServing.split('::')[0] || 'Meal';
          }

          if (!foodMap.has(foodName)) {
            foodMap.set(foodName, {
              food: it.foods || it,
              dailyOccurrences: 0,
              totalQuantity: 0,
              usedInMeals: new Set<string>()
            });
          }

          const entry = foodMap.get(foodName)!;
          entry.dailyOccurrences += 1;
          entry.totalQuantity += Number(it.quantity) || 1;
          entry.usedInMeals.add(targetType.charAt(0).toUpperCase() + targetType.slice(1));
        });
      });

      const numDays = mealPlans.length;
      const groceryList: any[] = [];

      foodMap.forEach((entry, foodName) => {
        const food = entry.food;
        const avgDailyServings = entry.totalQuantity / numDays;

        let unit = 'packs';
        let monthlyQty = Math.ceil(avgDailyServings * 30);
        let estimatedPrice = Math.round(Number(food.estimated_cost || 30) * avgDailyServings * 30);

        const lower = foodName.toLowerCase();
        if (lower.includes('egg')) {
          unit = 'pieces';
          monthlyQty = Math.ceil((avgDailyServings * 30) / 6) * 6;
          estimatedPrice = monthlyQty * 7;
        } else if (lower.includes('milk') || lower.includes('curd') || lower.includes('dahi')) {
          unit = 'liters';
          monthlyQty = Math.max(1, Math.round(avgDailyServings * 30 * 0.25 * 2) / 2);
          estimatedPrice = monthlyQty * 65;
        } else if (lower.includes('paneer') || lower.includes('tofu')) {
          unit = 'kg';
          monthlyQty = Math.max(0.5, Math.round(avgDailyServings * 30 * 0.1 * 2) / 2);
          estimatedPrice = monthlyQty * 400;
        } else if (lower.includes('peanut') || lower.includes('chana') || lower.includes('almond') || lower.includes('sprout')) {
          unit = 'kg';
          monthlyQty = Math.max(0.5, Math.round(avgDailyServings * 30 * 0.03 * 2) / 2);
          estimatedPrice = monthlyQty * 250;
        } else if (lower.includes('banana') || lower.includes('apple')) {
          unit = 'pieces';
          monthlyQty = Math.ceil(avgDailyServings * 30);
          estimatedPrice = monthlyQty * (lower.includes('banana') ? 6 : 25);
        } else if (lower.includes('chicken')) {
          unit = 'kg';
          monthlyQty = Math.max(1, Math.round(avgDailyServings * 30 * 0.15 * 2) / 2);
          estimatedPrice = monthlyQty * 280;
        } else if (lower.includes('soya chunk') || lower.includes('soy chunk')) {
          unit = 'packs';
          monthlyQty = Math.max(1, Math.ceil((avgDailyServings * 30 * 50) / 200));
          estimatedPrice = monthlyQty * 50;
        }

        groceryList.push({
          name: foodName,
          monthly_quantity: monthlyQty,
          unit,
          estimated_price: estimatedPrice,
          category: food.category || 'Protein',
          is_optional: false,
          reason: `Provides protein & nutrition — used in ${Array.from(entry.usedInMeals).join(', ')}`,
          purchased: false,
          food_serving_size: food.serving_size || '1 serving',
          protein_grams_per_serving: Number(food.protein || 0),
          calories_per_serving: Number(food.calories || 0),
          used_in_meals: Array.from(entry.usedInMeals)
        });
      });

      let planContainer: any = activePlan;
      let planIdToUse = planContainer?.id;

      if (!planIdToUse) {
        // Fallback 1: check any existing plan record for this user
        const { data: anyPlan } = await supabase
          .from('fitness_os_workout_plans')
          .select('id, plan_data')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anyPlan?.id) {
          planIdToUse = anyPlan.id;
          planContainer = anyPlan;
        } else {
          // Fallback 2: create an active plan container so grocery items can be persisted to DB cleanly
          const { data: createdPlan } = await supabase
            .from('fitness_os_workout_plans')
            .insert({
              user_id: userId,
              name: 'Personalized Nutrition & Diet Plan',
              description: 'Active nutrition & grocery container',
              goal: 'Healthy Living',
              status: 'active',
              plan_data: {
                nutrition: {
                  grocery_list: groceryList
                }
              }
            })
            .select('id, plan_data')
            .single();

          if (createdPlan?.id) {
            planIdToUse = createdPlan.id;
            planContainer = createdPlan;
          }
        }
      }

      // Also sync grocery list directly into fitness_os_nutrition_plans guidance
      try {
        const { data: existingNutrition } = await supabase
          .from('fitness_os_nutrition_plans')
          .select('id, guidance')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingNutrition?.id) {
          const updatedGuidance = {
            ...((existingNutrition.guidance as any) || {}),
            grocery_list: groceryList
          };
          await supabase
            .from('fitness_os_nutrition_plans')
            .update({ guidance: updatedGuidance, updated_at: new Date().toISOString() })
            .eq('id', existingNutrition.id);
        }
      } catch (nutrErr) {
        console.warn('[NutritionService] Non-blocking fitness_os_nutrition_plans sync notice:', nutrErr);
      }

      if (planIdToUse) {
        if (planContainer?.id) {
          const existingPlanData = planContainer.plan_data || {};
          const updatedPlanData = {
            ...existingPlanData,
            nutrition: {
              ...(existingPlanData.nutrition || {}),
              grocery_list: groceryList
            }
          };

          await supabase
            .from('fitness_os_workout_plans')
            .update({ plan_data: updatedPlanData })
            .eq('id', planIdToUse);
        }

        try {
          await supabase.from('fitness_grocery_items').delete().eq('user_id', userId).eq('plan_id', planIdToUse);
          if (groceryList.length > 0) {
            await supabase.from('fitness_grocery_items').insert(
              groceryList.map(item => ({
                user_id: userId,
                plan_id: planIdToUse,
                name: item.name,
                monthly_quantity: item.monthly_quantity,
                unit: item.unit,
                estimated_price: item.estimated_price,
                category: item.category,
                is_optional: item.is_optional,
                reason: item.reason,
                purchased: false
              }))
            );
          }
        } catch (groceryErr) {
          console.warn('[NutritionService] Non-blocking grocery table sync notice:', groceryErr);
        }
      }

      return groceryList;
    } catch (err: any) {
      console.warn('[NutritionService] syncGroceryListFromMealPlans error:', err?.message);
      return [];
    }
  }
}
