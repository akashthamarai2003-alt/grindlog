import { createServerSupabase } from "@/lib/services/supabase/server";

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
};

export function normalizeFoodName(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\beggs\b/g, "egg")
    .replace(/\bpieces\b/g, "piece")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
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

export class NutritionService {
  
  /**
   * Retrieves the user's timezone from their profile, defaulting to UTC.
   */
  static async getUserTimezone(userId: string): Promise<string> {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single();
    return data?.timezone || 'UTC';
  }

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

  static async getEffectiveTargets(userId: string) {
    const supabase = await createServerSupabase();
    const localDate = await this.getLocalDateString(userId);
    
    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .lte('effective_date', localDate)
      .order('effective_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    // Fallback: Check fitness_os_profiles or fitness_os_workout_plans
    const { data: fitProfile } = await supabase
      .from('fitness_os_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: activePlan } = await supabase
      .from('fitness_os_workout_plans')
      .select('plan_data')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    const planNut = activePlan?.plan_data?.nutrition;

    const calories = planNut?.daily_calories || fitProfile?.baseline_calories || 2000;
    const protein = planNut?.protein_grams || fitProfile?.initial_protein_target || 130;
    const carbs = Math.round((calories * 0.45) / 4);
    const fat = Math.round((calories * 0.25) / 9);
    const water_ml = 3000;

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
    const scaledCalories = Math.round(food.calories * input.quantity);
    const scaledProtein = Number((food.protein * input.quantity).toFixed(2));
    const scaledCarbs = Number((food.carbs * input.quantity).toFixed(2));
    const scaledFat = Number((food.fat * input.quantity).toFixed(2));
    const scaledCost = Number((food.estimated_cost * input.quantity).toFixed(2));

    // 3. Insert log
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

    const supabase = await createServerSupabase();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Collect valid food UUIDs
    const validUuids = items
      .map(it => it.food_id)
      .filter((id): id is string => Boolean(id && UUID_REGEX.test(id)));

    let foodsById = new Map<string, any>();
    if (validUuids.length > 0) {
      const { data: dbFoods } = await supabase
        .from('foods')
        .select('*')
        .in('id', validUuids);
      if (dbFoods) {
        dbFoods.forEach(f => foodsById.set(f.id, f));
      }
    }

    let adminClient: any = null;
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

      if (!food && item.custom_food) {
        if (!adminClient) {
          adminClient = require('@/lib/services/supabase/admin').createAdminClient();
        }

        const foodName = item.custom_food.name.trim();
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
          const { data: newFood, error: newFoodErr } = await adminClient
            .from('foods')
            .insert({
              name: foodName,
              category: item.custom_food.category || item.meal_type,
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
      }

      if (!food) {
        // Fallback placeholder food to guarantee foreign key validity
        if (!adminClient) {
          adminClient = require('@/lib/services/supabase/admin').createAdminClient();
        }
        const foodName = ((item as any).name || (item.custom_food as any)?.name || 'Meal Item').trim();
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
              serving_size: '1 serving',
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              estimated_cost: 0,
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

      const rawCals = item.custom_food?.calories !== undefined ? item.custom_food.calories : (food?.calories || 0);
      const rawPro = item.custom_food?.protein !== undefined ? item.custom_food.protein : (food?.protein || 0);
      const rawCarbs = item.custom_food?.carbs !== undefined ? item.custom_food.carbs : (food?.carbs || 0);
      const rawFat = item.custom_food?.fat !== undefined ? item.custom_food.fat : (food?.fat || 0);
      const rawCost = item.custom_food?.estimated_cost !== undefined ? item.custom_food.estimated_cost : (food?.estimated_cost || 0);

      const scaledCalories = Math.round(Number(rawCals) * q);
      const scaledProtein = Number((Number(rawPro) * q).toFixed(2));
      const scaledCarbs = Number((Number(rawCarbs) * q).toFixed(2));
      const scaledFat = Number((Number(rawFat) * q).toFixed(2));
      const scaledCost = Number((Number(rawCost) * q).toFixed(2));

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

    const { data: logs, error: logErr } = await supabase
      .from('food_logs')
      .insert(logsToInsert)
      .select('*, foods(*)');

    if (logErr) {
      console.error("Error in batch insert food_logs:", logErr);
      throw logErr;
    }

    // Single background update of daily summary
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in logMultipleFoods:", err);
    });

    return logs || [];
  }

  static async logWater(userId: string, amountMl: number) {
    if (amountMl <= 0) throw new Error("Water amount must be positive");
    
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);
    const targets = await this.getEffectiveTargets(userId);
    const targetMl = targets?.water_ml || 2500;

    // Check today's current water total to prevent exceeding chosen goal
    const { data: todayWaters } = await supabase
      .from('fitness_os_water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    const currentTotal = (todayWaters || []).reduce((sum, w) => sum + w.amount_ml, 0);
    const allowedAmount = Math.max(0, Math.min(amountMl, targetMl - currentTotal));

    if (allowedAmount <= 0) {
      return { user_id: userId, amount_ml: 0, capped: true };
    }

    const { data, error } = await supabase
      .from('fitness_os_water_logs')
      .insert({
        user_id: userId,
        amount_ml: allowedAmount
      })
      .select()
      .single();

    if (error) throw error;
    
    // Non-blocking background summary update
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in logWater:", err);
    });
    return data;
  }

  static async removeWater(userId: string, amountMl: number = 250) {
    const supabase = await createServerSupabase();
    const tz = await this.getUserTimezone(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);
    const targets = await this.getEffectiveTargets(userId);
    const targetMl = targets?.water_ml || 2500;

    const { data: todayLogs } = await supabase
      .from('fitness_os_water_logs')
      .select('id, amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .order('logged_at', { ascending: false });

    if (todayLogs && todayLogs.length > 0) {
      const totalLogged = todayLogs.reduce((sum, l) => sum + l.amount_ml, 0);

      // If user had bloated test logs (e.g. 8500ml), clean them to target - amountMl immediately
      if (totalLogged > targetMl) {
        const desiredTotal = Math.max(0, targetMl - amountMl);
        await supabase
          .from('fitness_os_water_logs')
          .delete()
          .eq('user_id', userId)
          .gte('logged_at', start)
          .lte('logged_at', end);

        if (desiredTotal > 0) {
          await supabase.from('fitness_os_water_logs').insert({ user_id: userId, amount_ml: desiredTotal });
        }
      } else {
        const latestLog = todayLogs[0];
        if (latestLog.amount_ml <= amountMl) {
          await supabase.from('fitness_os_water_logs').delete().eq('id', latestLog.id);
        } else {
          await supabase
            .from('fitness_os_water_logs')
            .update({ amount_ml: latestLog.amount_ml - amountMl })
            .eq('id', latestLog.id);
        }
      }
    }

    // Non-blocking background summary update
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in removeWater:", err);
    });
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
      waters.forEach(w => consumed.water_ml += w.amount_ml);
    }
    // Strictly cap at user's chosen goal
    consumed.water_ml = Math.min(targetWater, consumed.water_ml);
    const totalMeals = plans && plans.length > 0 ? plans.length : 0;
    
    // We only consider a meal "completed" if it is in the meal plan AND we have logged something for it
    let mealsCompleted = 0;
    if (plans) {
       mealsCompleted = plans.filter(p => completedMealTypes.has(p.meal_type)).length;
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
        ? `${envName} Dinner: Enjoy 2–3 warm phulkas with ${messLabel} dal and green sabzi. Finish with a bowl of cooling curd to support overnight muscle protein synthesis.`
        : "Restorative Dinner: Warm whole wheat phulkas with yellow dal tadka, lightly spiced sabzi, and cooling curd seasoned with roasted cumin.";
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
      return !blockedTerms.some(term => term && (fLower.includes(term) || term.includes(fLower)));
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
        const cals = Math.round(Number(ref?.calories || defaultCals) * qty);
        const pro = Number((Number(ref?.protein || defaultPro) * qty).toFixed(1));
        const carbs = Number((Number(ref?.carbs || 15) * qty).toFixed(1));
        const fat = Number((Number(ref?.fat || 3) * qty).toFixed(1));
        const cost = (isCoreProvided && isCore) ? 0 : Math.round(Number(ref?.estimated_cost || 25) * qty);

        return {
          id: `rotating-item-${index}`,
          quantity: 1,
          foods: {
            id: ref?.id || `food-${index}`,
            name: ref?.name || foodName,
            category: ref?.category || 'General',
            serving_size: sSize,
            calories: cals,
            protein: pro,
            carbs: carbs,
            fat: fat,
            estimated_cost: cost,
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
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Fish Curry', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      1: isVegan // Monday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isEggetarian
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan // Tuesday
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      3: isVegan // Wednesday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
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
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : isEggetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Chicken Breast (Cooked)', quantity: 1, servingSize: '100g' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      6: isVegan // Saturday
        ? [{ name: 'White Rice', quantity: 2, servingSize: '2 bowls cooked' }, { name: 'Chickpeas (Chana Masala)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
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
      0: [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      1: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      2: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      3: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Aloo Sabzi (Potato)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      4: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : isVegetarian
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Paneer Tikka', quantity: 1, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      5: [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Rajma (Kidney Beans)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      6: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
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
            sSize = `${scaledQty > 1 ? scaledQty + '× ' : ''}${it.foods.serving_size.replace(/^\d+(\.\d+)?\s*[×x]?\s*/, '')}`;
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
      0: 'Light Dal Tadka with Warm Phulkas',
      1: 'Homestyle Dal Tadka with Phulkas & Salad',
      2: isVegan ? 'Steamed Rice with Dal Sambar & Veggies' : 'Steamed Rice with Dal Sambar & Curd',
      3: 'Homestyle Dal Tadka with Phulkas & Aloo Sabzi',
      4: isVegan ? 'Phulkas with Dal Sambar & Soya Chunks' : (isVegetarian ? 'Phulkas with Dal Sambar & Paneer' : 'Phulkas with Dal Sambar & Eggs'),
      5: 'Comfort Rajma with Steamed Rice',
      6: 'Light Dal Tadka with Warm Phulkas',
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
      0: [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      1: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      2: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Paneer Bhurji', quantity: 0.7, servingSize: '100g' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      3: isVegan
        ? [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }],
      4: [{ name: 'Chapati', quantity: 3, servingSize: '3 medium' }, { name: 'Dal Tadka', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      5: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Sambar', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
      6: isVegan
        ? [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }]
        : [{ name: 'White Rice', quantity: 1.5, servingSize: '1.5 bowls cooked' }, { name: 'Moong Dal (Cooked)', quantity: 1, servingSize: '1 bowl (150g)' }, { name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Mixed Vegetables', quantity: 1, servingSize: '1 bowl (150g)' }],
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
      0: 'Light Dal Tadka with Warm Phulkas & Apple',
      1: isVegan ? 'Steamed Rice with Moong Dal & Apple' : 'Steamed Rice with Moong Dal & Curd',
      2: isVegan ? 'Savory Soya with Warm Phulkas & Apple' : 'Paneer Bhurji with Warm Phulkas & Apple',
      3: isVegan ? 'Homestyle Dal Tadka with Phulkas & Apple' : 'Homestyle Dal Tadka with Phulkas & Curd',
      4: 'Light Dal Tadka with Warm Phulkas & Apple',
      5: isVegan ? 'Steamed Rice with Dal Sambar & Peanuts' : 'Steamed Rice with Dal Sambar & Curd',
      6: isVegan ? 'Steamed Rice with Moong Dal & Apple' : 'Steamed Rice with Moong Dal & Curd',
    };

    const isWeekB = weekCycle === 1;
    const finalBreakfastDefs = isWeekB ? (breakfastDefsWeekB[dayOfWeek] || breakfastDefs[dayOfWeek]) : (breakfastDefs[dayOfWeek] || breakfastDefs[1]);
    const finalLunchDefs = isWeekB ? (lunchDefsWeekB[dayOfWeek] || lunchDefs[dayOfWeek]) : (lunchDefs[dayOfWeek] || lunchDefs[1]);
    const finalDinnerDefs = isWeekB ? (dinnerDefsWeekB[dayOfWeek] || dinnerDefs[dayOfWeek]) : (dinnerDefs[dayOfWeek] || dinnerDefs[1]);

    const finalBreakfastTitle = isWeekB ? (breakfastTitlesWeekB[dayOfWeek] || `${dayName} Breakfast`) : (breakfastTitles[dayOfWeek] || `${dayName} Breakfast`);
    const finalLunchTitle = isWeekB ? (lunchTitlesWeekB[dayOfWeek] || `${dayName} Lunch`) : (lunchTitles[dayOfWeek] || `${dayName} Lunch`);
    const finalDinnerTitle = isWeekB ? (dinnerTitlesWeekB[dayOfWeek] || `${dayName} Dinner`) : (dinnerTitles[dayOfWeek] || `${dayName} Dinner`);

    plansMap.set('breakfast', buildMealResult('breakfast', finalBreakfastTitle, finalBreakfastDefs, true));
    plansMap.set('lunch', buildMealResult('lunch', finalLunchTitle, finalLunchDefs, true));
    plansMap.set('pre_workout', buildMealResult('pre_workout', 'Pre-Workout Energy Fuel (< 3g Fat)', snackDefs[dayOfWeek] || snackDefs[1], false));
    plansMap.set('snack', buildMealResult('snack', `${dayName} Natural Snack`, snackDefs[dayOfWeek] || snackDefs[1], false));
    plansMap.set('dinner', buildMealResult('dinner', finalDinnerTitle, finalDinnerDefs, true));

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

    return rawOptions.map((opt, optIndex) => {
      const items = buildItems(opt.items);
      const rawCals = items.reduce((acc, it) => acc + it.calories, 0);
      const scale = rawCals > 0 ? (targetCals / rawCals) : 1;
      const scaledItems = items.map(it => ({
        ...it,
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

  static async getTodaySummaryAndDetails(userId: string, targetDateStr?: string) {
    const supabase = await createServerSupabase();
    
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

    // Parallelize all data fetching
    const [targets, foodsRes, watersRes, plansRes, monthFoodsRes, fitProfileRes, activePlanRes, foodCatalogRes] = await Promise.all([
      this.getEffectiveTargets(userId),
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
        .select('diet_preference, food_type, food_allergies, foods_disliked, foods_avoided, available_foods, nutrition_budget, food_environment, meals_per_day')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('fitness_os_workout_plans')
        .select('plan_data')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle(),
      supabase
        .from('foods')
        .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly')
        .eq('is_active', true)
        .limit(300)
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
        
        let cost = Number(f.estimated_cost || 0);
        const env = fitProfile?.food_environment?.toLowerCase() || '';
        const isCoreProvided = env === 'pg' || env === 'hostel' || env === 'home' || env === 'office/canteen';
        const foodNameLower = String(f.foods?.name || '').toLowerCase();
        const isItemCore = isCoreProvided && (
          foodNameLower.includes('core meal') || 
          foodNameLower.includes('base meal') || 
          foodNameLower.includes('provided core') ||
          foodNameLower.includes('standard base')
        );
        if (isItemCore) {
          cost = 0; // core meals are free from PG/Home
        }
        consumed.spent += cost;
        
        if (f.meal_type) completedMealTypes.add(f.meal_type);
      });
    }

    const targetWater = Number(targets.water_ml) || 2500;
    if (waters) {
      waters.forEach(w => consumed.water_ml += w.amount_ml);
    }
    // Strictly cap at user's chosen goal
    consumed.water_ml = Math.min(targetWater, consumed.water_ml);

    const env = fitProfile?.food_environment?.toLowerCase() || '';
    const isCoreProvided = env === 'pg' || env === 'hostel' || env === 'home' || env === 'office/canteen';

    let monthSpent = 0;
    if (monthFoods) {
      monthFoods.forEach((f: any) => {
        let cost = Number(f.estimated_cost || 0);
        const foodNameLower = String(f.foods?.name || '').toLowerCase();
        const isItemCore = isCoreProvided && (
          foodNameLower.includes('core meal') || 
          foodNameLower.includes('base meal') || 
          foodNameLower.includes('provided core') ||
          foodNameLower.includes('standard base')
        );
        if (isItemCore) {
          cost = 0; // core meals are free from PG/Home
        }
        monthSpent += cost;
      });
    }

    let monthlyLimit = 3000;
    if (fitProfile?.nutrition_budget) {
      const bStr = fitProfile.nutrition_budget;
      if (bStr === '₹5,000+') monthlyLimit = 6000;
      else if (bStr === '₹2,000–5,000' || bStr === '₹2,000-5,000') monthlyLimit = 3500;
      else if (bStr === '₹1,000–2,000' || bStr === '₹1,000-2,000') monthlyLimit = 1500;
      else if (bStr === '₹0–1,000' || bStr === '₹0-1,000') monthlyLimit = 800;
    }
    const dailyLimit = Math.round(monthlyLimit / 30);

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
        ALL_MEAL_TYPES.forEach(mt => { itemsByType[mt] = []; });

        allItems.forEach((item: any, idx: number) => {
          const cat = (item.foods?.category || '').toLowerCase();
          const name = (item.foods?.name || '').toLowerCase();

          if (itemsByType.breakfast && (cat.includes('breakfast') || name.includes('idli') || name.includes('dosa') || name.includes('poha') || name.includes('upma') || name.includes('oats') || name.includes('coffee') || name.includes('milk') || name.includes('egg'))) {
            itemsByType.breakfast.push(item);
          } else if ((itemsByType.pre_workout || itemsByType.post_workout || itemsByType.snack) && (cat.includes('fruit') || cat.includes('snack') || name.includes('banana') || name.includes('apple') || name.includes('peanut'))) {
            const bucket = itemsByType.pre_workout || itemsByType.snack || itemsByType.post_workout;
            if (bucket) bucket.push(item);
          } else if (itemsByType.lunch && idx % 2 === 0) {
            itemsByType.lunch.push(item);
          } else if (itemsByType.dinner) {
            itemsByType.dinner.push(item);
          } else {
            // Fallback: push to the first available meal type
            const firstType = ALL_MEAL_TYPES[0];
            if (itemsByType[firstType]) itemsByType[firstType].push(item);
          }
        });

        ALL_MEAL_TYPES.forEach(mType => {
          const mItems = itemsByType[mType];
          const mCals = mItems.reduce((acc, it) => acc + Math.round((it.foods?.calories || 0) * it.quantity), 0);
          const mPro = mItems.reduce((acc, it) => acc + Number((it.foods?.protein || 0) * it.quantity), 0);
          plansByMealType.set(mType, {
            id: `${dailyPlan.id}-${mType}`,
            meal_type: mType,
            name: mType.charAt(0).toUpperCase() + mType.slice(1) + " Plan",
            calories: mCals,
            protein: mPro,
            meal_plan_items: mItems
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

    // Always output Breakfast, Lunch, Snack, Dinner cards
    let formattedMeals = ALL_MEAL_TYPES.map((mType, slotIdx) => {
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
            name: sanitizeMealTitle(existing.name || '', isProfileVegan, isProfileVegetarian, isProfileEggetarian),
            meal_plan_items: sanitizedItems
          };
        }
        return {
          ...existing,
          is_ai_generated: Boolean(existing.ai_generated)
        };
      }

      // 2. Priority: True 7-Day Rotating Menu (Strictly varies by dayOfWeek, ensuring fresh variety every single day)
      const rotating = rotatingPlans.get(mType);
      if (rotating) {
        return {
          ...rotating,
          is_natural_whole_food: true,
          has_7day_variety: true,
        };
      }

      // 3. Fallback: Active AI Hybrid Plan (if slot not covered in rotating menu)
      const aiMeal = findAiMealForSlot(mType, slotIdx, ALL_MEAL_TYPES, aiMeals);

      if (aiMeal) {
        const slotProportions: Record<string, number> = {
          breakfast: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.20 : (mealsPerDay === '2 meals' ? 0.0 : 0.25)),
          lunch: mealsPerDay === '3 meals' ? 0.40 : (mealsPerDay === '5+ meals' ? 0.30 : (mealsPerDay === '2 meals' ? 0.55 : 0.35)),
          pre_workout: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
          snack: mealsPerDay === '5+ meals' ? 0.12 : 0.15,
          post_workout: 0.13,
          dinner: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.25 : (mealsPerDay === '2 meals' ? 0.45 : 0.25)),
        };
        const proportion = slotProportions[mType] ?? 0.25;
        const slotTargetCalories = (aiMeal.total_calories && Number(aiMeal.total_calories) > 0)
          ? Math.round(Number(aiMeal.total_calories))
          : Math.round(targets.calories * proportion);
        const slotTargetProtein = (aiMeal.protein_grams && Number(aiMeal.protein_grams) > 0)
          ? Number((Number(aiMeal.protein_grams)).toFixed(1))
          : Number((targets.protein * proportion).toFixed(1));
        
        // Real-world estimate: ~₹0.15–0.20 per calorie for average Indian whole foods
        let estCost = Math.round(slotTargetCalories * 0.18);
        const envStr = fitProfile?.food_environment?.toLowerCase() || '';

        // AI sometimes returns several foods as one string joined with "+".
        const parsedItems = (Array.isArray(aiMeal.items) ? aiMeal.items : [])
          .flatMap((item: unknown) => parseAIItemText(item));
        const rawParts: Array<{ name: string; servingSize: string; multiplier: number }> = parsedItems.length > 0
          ? parsedItems
          : [{ name: aiMeal.meal_name || `${mType} meal`, servingSize: '', multiplier: 1 }];

        const itemParts = rawParts.map(part => {
          let cleanedName = sanitizeAIItemName(part.name, isProfileVegan, isProfileVegetarian, isProfileEggetarian);
          // Pre-workout low-fat rule: clean carbs & light protein, avoid heavy fats/peanut butter
          if (mType === 'pre_workout' || mType === 'snack') {
            if (/\b(?:peanut\s*butter|peanuts|butter|ghee|oil|fried)\b/i.test(cleanedName)) {
              cleanedName = "Roasted Chana (Dry Chickpeas)";
            }
          }
          return {
            ...part,
            name: cleanedName
          };
        });

        const fallbackCalories = Math.round(slotTargetCalories / itemParts.length);
        const fallbackProtein = Math.round(slotTargetProtein / itemParts.length);
        const fallbackCost = Math.round(estCost / itemParts.length);

        // 1. Resolve each item and calculate its unscaled values
        const isCoreProvided = envStr === 'pg' || envStr === 'hostel' || envStr === 'home' || envStr === 'office/canteen';
        const unscaledItems = itemParts.map((part) => {
          const reference = findFoodReference(part.name, foodCatalog, fitProfile?.food_environment);
          const multiplier = part.multiplier || 1;
          const isItemCore = isCoreProvided && (
            reference?.name?.includes("Provided Core") ||
            reference?.name?.includes("Core Meal") ||
            /\b(?:pg|hostel|mess|provided core|provided meal|core meal)\b/i.test(part.name)
          );

          const cals = Math.round(Number(reference?.calories || fallbackCalories) * (reference ? multiplier : 1));
          const pro = Number((Number(reference?.protein || fallbackProtein) * (reference ? multiplier : 1)).toFixed(1));
          const carbs = Number((Number(reference?.carbs || 0) * (reference ? multiplier : 1)).toFixed(1));
          const fat = Number((Number(reference?.fat || 0) * (reference ? multiplier : 1)).toFixed(1));
          const cost = isItemCore ? 0 : Math.round(Number(reference?.estimated_cost || fallbackCost) * (reference ? multiplier : 1));
          return { part, reference, multiplier, cals, pro, carbs, fat, cost, isItemCore };
        });

        const unscaledTotalCalories = unscaledItems.reduce((sum, it) => sum + it.cals, 0);
        // Proportional scale factor so the meal strictly hits slotTargetCalories
        const scaleFactor = unscaledTotalCalories > 0 ? (slotTargetCalories / unscaledTotalCalories) : 1;

        // 2. Scale each item proportionally (protecting discrete items)
        const mealPlanItems = unscaledItems.map((it, index) => {
          const foodNameLower = (it.reference?.name || it.part.name).toLowerCase();
          const isDiscrete = /(?:egg|banana|apple|fruit|chapati|roti|bread|cheela)/i.test(foodNameLower);

          const scaledCalories = isDiscrete ? it.cals : Math.round(it.cals * scaleFactor);
          const scaledProtein = isDiscrete ? it.pro : Number((it.pro * scaleFactor).toFixed(1));
          const scaledCarbs = isDiscrete ? it.carbs : Number((it.carbs * scaleFactor).toFixed(1));
          const scaledFat = isDiscrete ? it.fat : Number((it.fat * scaleFactor).toFixed(1));
          const scaledCost = it.isItemCore ? 0 : Math.round(it.cost * (isDiscrete ? 1 : scaleFactor));

          let servingDisplay = it.part.servingSize || it.reference?.serving_size || '1 serving';
          if (!isDiscrete && Math.abs(scaleFactor - 1) > 0.15 && it.reference?.serving_size) {
            const scaledMult = Number((it.multiplier * scaleFactor).toFixed(1));
            if (scaledMult > 0) {
              servingDisplay = `${scaledMult > 1 ? scaledMult + '× ' : (scaledMult < 1 ? scaledMult + ' ' : '')}${it.reference.serving_size}`;
            }
          }

          let displayName = it.reference?.name || it.part.name;
          if (it.isItemCore || displayName.includes("Provided Core") || displayName.includes("Core Meal") || displayName.includes("Base Meal") || displayName.includes("Standard Base")) {
            const cleanEnv = (fitProfile?.food_environment || '').trim().toLowerCase();
            displayName = cleanEnv === 'pg'
              ? 'PG Meal (Rice, Dal & Sabzi)'
              : cleanEnv === 'hostel'
              ? 'Hostel Mess Meal (Rice, Dal & Sabzi)'
              : cleanEnv === 'home' || cleanEnv === 'i cook'
              ? 'Home Meal (Rice, Dal & Sabzi)'
              : cleanEnv.includes('canteen') || cleanEnv.includes('office')
              ? 'Canteen Meal (Rice, Dal & Sabzi)'
              : 'Standard Base Meal (Rice, Dal & Sabzi)';
            servingDisplay = "1 Plate";
          }

          return {
            id: `ai-item-${mType}-${index}`,
            quantity: 1,
            foods: {
              name: displayName,
              category: it.reference?.category || mType,
              serving_size: servingDisplay,
              calories: scaledCalories,
              protein: scaledProtein,
              carbs: scaledCarbs,
              fat: scaledFat,
              estimated_cost: scaledCost,
            }
          };
        });

        const mealTotals = mealPlanItems.reduce((totals: { calories: number; protein: number; carbs: number; fat: number }, item: any) => ({
          calories: totals.calories + Number(item.foods.calories || 0),
          protein: Number((totals.protein + Number(item.foods.protein || 0)).toFixed(1)),
          carbs: Number((totals.carbs + Number(item.foods.carbs || 0)).toFixed(1)),
          fat: Number((totals.fat + Number(item.foods.fat || 0)).toFixed(1)),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
          id: `ai-${mType}`,
          meal_type: mType,
          name: sanitizeMealTitle(aiMeal.meal_name || (mType.charAt(0).toUpperCase() + mType.slice(1)), isProfileVegan, isProfileVegetarian, isProfileEggetarian),
          calories: mealTotals.calories || slotTargetCalories,
          protein: mealTotals.protein || slotTargetProtein,
          carbs: mealTotals.carbs,
          fat: mealTotals.fat,
          prep_instructions: aiMeal.prep_instructions || undefined,
          is_ai_generated: true,
          is_natural_whole_food: true,
          meal_plan_items: mealPlanItems
        };
      }

      return {
        id: `empty-${mType}`,
        meal_type: mType,
        name: mType.charAt(0).toUpperCase() + mType.slice(1) + " Plan",
        calories: 0,
        protein: 0,
        is_natural_whole_food: true,
        meal_plan_items: []
      };
    });

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

    return {
      date: localDate,
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
      has_ai_plan: Boolean((aiMeals && aiMeals.length > 0) || formattedMeals.some((m: any) => m.ai_generated || m.is_ai_generated)),
      is_natural_whole_food: true,
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
  }
}
