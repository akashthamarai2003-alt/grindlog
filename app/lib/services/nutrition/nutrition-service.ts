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

function normalizeFoodName(value: unknown): string {
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
      const match = part.match(/^(.+?),\s*(\d+(?:\.\d+)?)\s+(.+)$/);
      if (!match) {
        return { name: part, servingSize: "", multiplier: 1 };
      }
      return {
        name: match[1].trim(),
        multiplier: Math.max(Number(match[2]) || 1, 0.25),
        servingSize: `${match[2]} ${match[3].trim()}`,
      };
    });
}

function findFoodReference(name: string, catalog: NutritionFoodReference[]): NutritionFoodReference | undefined {
  const normalizedName = normalizeFoodName(name);
  if (!normalizedName) return undefined;

  return catalog.find((food) => normalizeFoodName(food.name) === normalizedName)
    || catalog.find((food) => {
      const candidate = normalizeFoodName(food.name);
      return candidate.includes(normalizedName) || normalizedName.includes(candidate);
    });
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
    let finalFoodId = input.food_id;
    let food: any = null;

    if (finalFoodId) {
      // 1. Fetch canonical food
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', finalFoodId)
        .eq('is_active', true)
        .single();
      if (error || !data) throw new Error("FOOD_NOT_FOUND");
      food = data;
    } else if (input.custom_food) {
      // Search for existing custom food by exact name
      const adminClient = require('@/lib/services/supabase/admin').createAdminClient();
      const { data: existing } = await adminClient
        .from('foods')
        .select('*')
        .eq('name', input.custom_food.name)
        .eq('is_active', true)
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
            name: input.custom_food.name,
            category: input.custom_food.category,
            serving_size: (input.custom_food as any).serving_size || '1 serving',
            calories: input.custom_food.calories,
            protein: input.custom_food.protein,
            carbs: input.custom_food.carbs,
            fat: input.custom_food.fat,
            estimated_cost: input.custom_food.estimated_cost || 0,
            is_active: false // Critical: Keep custom foods out of the public AI database pool!

          })
          .select()
          .single();
        if (newFoodErr || !newFood) throw new Error("FAILED_TO_CREATE_CUSTOM_FOOD: " + JSON.stringify(newFoodErr));
        food = newFood;
        finalFoodId = newFood.id;
      }
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
      .select()
      .single();

    if (logErr) throw logErr;

    // 4. Trigger background summary update asynchronously without blocking the response
    this.updateDailySummary(userId).catch(err => {
      console.warn("Background updateDailySummary warning in logFood:", err);
    });

    return log;
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
    foodCatalog: NutritionFoodReference[]
  ): Map<string, any> {
    const plansMap = new Map<string, any>();
    const rawDiet = (profile?.diet_preference || profile?.food_type || 'balanced').toLowerCase();
    const isVegan = rawDiet.includes('vegan');
    const isNonVeg = !isVegan && (rawDiet.includes('non-veg') || rawDiet.includes('nonveg') || rawDiet.includes('non veg') || rawDiet.includes('meat') || rawDiet.includes('chicken'));
    const isEggetarian = !isVegan && !isNonVeg && (rawDiet.includes('egg') || rawDiet.includes('eggetarian'));
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
          else if (foodName.toLowerCase().includes('egg')) foodName = 'Paneer Tikka';
        }

        const ref = findFoodReference(foodName, foodCatalog);
        const qty = def.quantity || 1;
        const sSize = def.servingSize || (ref ? (qty > 1 ? `${qty} servings` : ref.serving_size || '1 serving') : `${qty} serving`);
        const cals = Math.round(Number(ref?.calories || 150) * qty);
        const pro = Number((Number(ref?.protein || 5) * qty).toFixed(1));
        const carbs = Number((Number(ref?.carbs || 15) * qty).toFixed(1));
        const fat = Number((Number(ref?.fat || 3) * qty).toFixed(1));
        const cost = (isCoreProvided && isCore) ? 0 : Math.round(Number(ref?.estimated_cost || 25) * qty);

        return {
          id: `rotating-item-${index}`,
          quantity: qty,
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

    // 3. SNACK / PRE-WORKOUT TEMPLATES BY DAY
    const snackDefs: Record<number, Array<{ name: string; quantity: number; servingSize?: string }>> = {
      0: [{ name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }],
      1: [{ name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }],
      2: isVegan
        ? [{ name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }],
      3: isVegan
        ? [{ name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Apple', quantity: 1, servingSize: '1 medium' }],
      4: [{ name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }],
      5: isVegan
        ? [{ name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : isVegetarian
        ? [{ name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        : [{ name: 'Boiled Egg', quantity: 1, servingSize: '1 large' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }],
      6: [{ name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }],
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

    const buildMealResult = (mealType: string, title: string, defs: Array<{ name: string; quantity: number; servingSize?: string }>, isCore: boolean) => {
      const items = buildItems(defs, isCore);
      const totals = items.reduce((acc, it) => ({
        calories: acc.calories + it.foods.calories,
        protein: Number((acc.protein + it.foods.protein).toFixed(1)),
        carbs: Number((acc.carbs + it.foods.carbs).toFixed(1)),
        fat: Number((acc.fat + it.foods.fat).toFixed(1)),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      return {
        id: `rotating-${mealType}-${dayOfWeek}`,
        meal_type: mealType,
        name: title,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        meal_plan_items: items
      };
    };

    plansMap.set('breakfast', buildMealResult('breakfast', `${dayName} Breakfast`, breakfastDefs[dayOfWeek] || breakfastDefs[1], true));
    plansMap.set('lunch', buildMealResult('lunch', `${dayName} Lunch`, lunchDefs[dayOfWeek] || lunchDefs[1], true));
    plansMap.set('pre_workout', buildMealResult('pre_workout', `${dayName} Fuel`, snackDefs[dayOfWeek] || snackDefs[1], false));
    plansMap.set('snack', buildMealResult('snack', `${dayName} Snack`, snackDefs[dayOfWeek] || snackDefs[1], false));
    plansMap.set('dinner', buildMealResult('dinner', `${dayName} Dinner`, dinnerDefs[dayOfWeek] || dinnerDefs[1], true));

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
    const rawDiet = (profile?.diet_preference || profile?.food_type || 'balanced').toLowerCase();
    const isVegan = rawDiet.includes('vegan');
    const isNonVeg = !isVegan && (rawDiet.includes('non-veg') || rawDiet.includes('nonveg') || rawDiet.includes('non veg') || rawDiet.includes('meat') || rawDiet.includes('chicken'));
    const isEggetarian = !isVegan && !isNonVeg && (rawDiet.includes('egg') || rawDiet.includes('eggetarian'));
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
          else if (foodName.toLowerCase().includes('egg')) foodName = 'Paneer Tikka';
        }

        const ref = findFoodReference(foodName, foodCatalog);
        const qty = def.quantity || 1;
        const sSize = def.servingSize || (ref ? (qty > 1 ? `${qty} servings` : ref.serving_size || '1 serving') : `${qty} serving`);
        const cals = Math.round(Number(ref?.calories || 150) * qty);
        const pro = Number((Number(ref?.protein || 5) * qty).toFixed(1));
        const carbs = Number((Number(ref?.carbs || 15) * qty).toFixed(1));
        const fat = Number((Number(ref?.fat || 3) * qty).toFixed(1));
        const cost = (isCoreProvided && isCore) ? 0 : Math.round(Number(ref?.estimated_cost || 25) * qty);

        return {
          id: ref?.id || `food-${index}`,
          food_id: ref?.id || `food-${index}`,
          name: ref?.name || foodName,
          category: ref?.category || 'General',
          serving_size: sSize,
          quantity: qty,
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
          title: 'Energy Banana & Peanuts',
          desc: 'Immediate potassium and sustained healthy fats.',
          items: [{ name: 'Banana', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
        },
        {
          title: 'Power Fruit & Dairy',
          desc: 'Fresh apple with refreshing curd or milk.',
          items: isVegan
            ? [{ name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Roasted Peanuts', quantity: 1, servingSize: '1 handful (30g)' }]
            : [{ name: 'Apple', quantity: 1, servingSize: '1 medium' }, { name: 'Whole Milk', quantity: 1, servingSize: '1 glass (250ml)' }]
        },
        {
          title: 'Protein Quick-Charge',
          desc: 'Fast protein to prime your muscles.',
          items: isVegan
            ? [{ name: 'Soy Chunks (Cooked)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : isVegetarian
            ? [{ name: 'Curd (Plain)', quantity: 1, servingSize: '1 bowl (100g)' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
            : [{ name: 'Boiled Egg', quantity: 2, servingSize: '2 large' }, { name: 'Banana', quantity: 1, servingSize: '1 medium' }]
        }
      ];
    }

    return rawOptions.map((opt, optIndex) => {
      const items = buildItems(opt.items);
      const totals = items.reduce((acc, it) => ({
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
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        estimated_cost: totals.cost,
        items
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
        .select('estimated_cost, meal_type')
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
        if (isCoreProvided && f.meal_type && f.meal_type !== 'snack' && f.meal_type !== 'daily') {
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
      monthFoods.forEach(f => {
        let cost = Number(f.estimated_cost || 0);
        if (isCoreProvided && f.meal_type && f.meal_type !== 'snack' && f.meal_type !== 'daily') {
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
    const rotatingPlans = NutritionService.getRotatingMealPlanForDay(dayOfWeek, fitProfile, targets, foodCatalog);

    // Always output Breakfast, Lunch, Snack, Dinner cards
    let formattedMeals = ALL_MEAL_TYPES.map(mType => {
      const existing = plansByMealType.get(mType);
      if (existing) return existing;

      const rotating = rotatingPlans.get(mType);
      if (rotating) return rotating;

      // Fallback to AI generated meals from fitness_os_workout_plans
      const aiMeal = aiMeals.find((m: any) => {
        const name = (m.meal_name || '').toLowerCase();
        return name.includes(mType) || name.includes(mType.replace('_', '-')) || name.includes(mType.replace('_', ' ')) || (mType === 'snack' && name.includes('snack'));
      });

      if (aiMeal) {
        const proportion = mType === 'lunch' || mType === 'dinner' ? 0.35 : 0.15;
        const estCals = Math.round(targets.calories * proportion);
        const estPro = Math.round(targets.protein * proportion);
        
        // Real-world estimate: ~₹0.20 per calorie for average Indian meals
        let estCost = Math.round(estCals * 0.20);
        const envStr = fitProfile?.food_environment?.toLowerCase() || '';
        if ((envStr === 'pg' || envStr === 'hostel' || envStr === 'home' || envStr === 'office/canteen') && (mType === 'breakfast' || mType === 'lunch' || mType === 'dinner')) {
          estCost = 0; // Core meals are provided
        }

        // AI sometimes returns several foods as one string joined with "+".
        // Normalize those foods into separate rows and use the verified food
        // library for per-item nutrition whenever a match is available.
        const parsedItems = (Array.isArray(aiMeal.items) ? aiMeal.items : [])
          .flatMap((item: unknown) => parseAIItemText(item));
        const itemParts: Array<{ name: string; servingSize: string; multiplier: number }> = parsedItems.length > 0
          ? parsedItems
          : [{ name: aiMeal.meal_name || `${mType} meal`, servingSize: '', multiplier: 1 }];
        const fallbackCalories = Math.round((Number(aiMeal.total_calories) > 0 ? Number(aiMeal.total_calories) : estCals) / itemParts.length);
        const fallbackProtein = Math.round((Number(aiMeal.protein_grams) > 0 ? Number(aiMeal.protein_grams) : estPro) / itemParts.length);
        const fallbackCost = Math.round(estCost / itemParts.length);
        const mealPlanItems = itemParts.map((part: { name: string; servingSize: string; multiplier: number }, index: number) => {
          const reference = findFoodReference(part.name, foodCatalog);
          const multiplier = part.multiplier;
          const servingSize = part.servingSize || reference?.serving_size || '1 serving';

          return {
            id: `ai-item-${mType}-${index}`,
            // The parsed quantity is represented in the serving label so the
            // UI reads "2 bowls" while all nutrition values remain accurate.
            quantity: 1,
            foods: {
              name: reference?.name || part.name,
              category: reference?.category || mType,
              serving_size: servingSize,
              calories: Math.round(Number(reference?.calories || fallbackCalories) * (reference ? multiplier : 1)),
              protein: Number((Number(reference?.protein || fallbackProtein) * (reference ? multiplier : 1)).toFixed(1)),
              carbs: Number((Number(reference?.carbs || 0) * (reference ? multiplier : 1)).toFixed(1)),
              fat: Number((Number(reference?.fat || 0) * (reference ? multiplier : 1)).toFixed(1)),
              estimated_cost: Math.round(Number(reference?.estimated_cost || fallbackCost) * (reference ? multiplier : 1)),
            }
          };
        });
        const mealTotals = mealPlanItems.reduce((totals: { calories: number; protein: number; carbs: number; fat: number }, item: any) => ({
          calories: totals.calories + Number(item.foods.calories || 0),
          protein: totals.protein + Number(item.foods.protein || 0),
          carbs: totals.carbs + Number(item.foods.carbs || 0),
          fat: totals.fat + Number(item.foods.fat || 0),
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

        return {
          id: `ai-${mType}`,
          meal_type: mType,
          name: mType.charAt(0).toUpperCase() + mType.slice(1),
          calories: mealTotals.calories,
          protein: mealTotals.protein,
          carbs: mealTotals.carbs,
          fat: mealTotals.fat,
          meal_plan_items: mealPlanItems
        };
      }

      return {
        id: `empty-${mType}`,
        meal_type: mType,
        name: mType.charAt(0).toUpperCase() + mType.slice(1) + " Plan",
        calories: 0,
        protein: 0,
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
      nutrition_score: score
    };
  }
}
