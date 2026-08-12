import { createServerSupabase } from "@/lib/services/supabase/server";

export interface LogFoodInput {
  food_id: string;
  meal_type: string;
  quantity: number;
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
  static async getLocalDateString(userId: string): Promise<string> {
    const tz = await this.getUserTimezone(userId);
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
  static async getLocalDateBoundaries(userId: string): Promise<{ start: string, end: string }> {
    const tz = await this.getUserTimezone(userId);
    const dateStr = await this.getLocalDateString(userId); // YYYY-MM-DD
    
    // Create dates assuming the string is in the user's timezone.
    // However, JS Date constructor parses YYYY-MM-DD as UTC.
    // Instead, we construct a proper ISO string with timezone offset.
    // A simpler approach for timestamptz queries is to just use PostgreSQL AT TIME ZONE,
    // but since we query from PostgREST, we can convert our bounds here.
    
    // Note: To perfectly handle timezone offsets dynamically without a robust library in pure JS,
    // we can format a given hour in that timezone and compare, but simpler is to use PostgREST filters
    // if possible, OR just parse the local time string into a Date.
    
    // We'll use a hack to get the offset for the given timezone.
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
    if (!data) return null; // TARGET_NOT_FOUND
    return data;
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
    
    const supabase = await createServerSupabase();
    
    // 1. Fetch canonical food
    const { data: food, error: foodErr } = await supabase
      .from('foods')
      .select('*')
      .eq('id', input.food_id)
      .eq('is_active', true)
      .single();
      
    if (foodErr || !food) {
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
        food_id: input.food_id,
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

    // 4. Trigger background summary update (could be done asynchronously in a real system)
    await this.updateDailySummary(userId);

    return log;
  }

  static async logWater(userId: string, amountMl: number) {
    if (amountMl <= 0) throw new Error("Water amount must be positive");
    
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('water_logs')
      .insert({
        user_id: userId,
        amount_ml: amountMl
      })
      .select()
      .single();

    if (error) throw error;
    
    await this.updateDailySummary(userId);
    return data;
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
      .from('water_logs')
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

    if (waters) {
      waters.forEach(w => consumed.water_ml += w.amount_ml);
    }

    const targets = await this.getEffectiveTargets(userId);
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

  static async getTodaySummaryAndDetails(userId: string) {
    const supabase = await createServerSupabase();
    const localDate = await this.getLocalDateString(userId);
    const { start, end } = await this.getLocalDateBoundaries(userId);

    // 1. Targets
    const targets = await this.getEffectiveTargets(userId);
    if (!targets) {
      throw new Error("TARGET_NOT_FOUND");
    }

    // 2. Fetch logged data
    const { data: foods } = await supabase
      .from('food_logs')
      .select('*, foods(name, category)')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    const { data: waters } = await supabase
      .from('water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end);

    const { data: plans } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_items(*, foods(*))')
      .eq('user_id', userId)
      .eq('date', localDate);

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
        consumed.spent += Number(f.estimated_cost);
        if (f.meal_type) completedMealTypes.add(f.meal_type);
      });
    }

    if (waters) {
      waters.forEach(w => consumed.water_ml += w.amount_ml);
    }

    // Monthly spent
    const firstDayOfMonth = localDate.substring(0, 8) + '01'; // YYYY-MM-01
    const tz = await this.getUserTimezone(userId);
    const mFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric' });
    let mOffsetStr = mFormatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
    if (!mOffsetStr || mOffsetStr === 'GMT') mOffsetStr = 'GMT+00:00';
    mOffsetStr = mOffsetStr.replace('GMT', '');
    const monthStartISO = new Date(`${firstDayOfMonth}T00:00:00.000${mOffsetStr}`).toISOString();

    const { data: monthFoods } = await supabase
      .from('food_logs')
      .select('estimated_cost')
      .eq('user_id', userId)
      .gte('logged_at', monthStartISO)
      .lte('logged_at', end);

    const monthSpent = monthFoods ? monthFoods.reduce((acc, f) => acc + Number(f.estimated_cost), 0) : 0;

    // Remaining
    const remaining = {
      calories: Math.max(targets.calories - consumed.calories, 0),
      protein: Math.max(targets.protein - consumed.protein, 0),
      carbs: Math.max(targets.carbs - consumed.carbs, 0),
      fat: Math.max(targets.fat - consumed.fat, 0),
      water_ml: Math.max(targets.water_ml - consumed.water_ml, 0)
    };

    // Progress
    const progress = {
      calories_percent: Math.min(100, (consumed.calories / targets.calories) * 100),
      protein_percent: Math.min(100, (consumed.protein / targets.protein) * 100),
      water_percent: Math.min(100, (consumed.water_ml / targets.water_ml) * 100)
    };

    const totalMeals = plans && plans.length > 0 ? plans.length : 0;
    let mealsCompleted = 0;
    if (plans) {
       mealsCompleted = plans.filter(p => completedMealTypes.has(p.meal_type)).length;
    }

    const score = this.computeNutritionScore(consumed, targets, mealsCompleted, totalMeals);

    return {
      date: localDate,
      targets,
      consumed,
      remaining,
      meals: plans || [],
      logged_foods: foods || [],
      budget: {
        daily_limit: 100, // Hardcoded for now unless specified in targets
        spent: consumed.spent,
        remaining: Math.max(100 - consumed.spent, 0),
        monthly_limit: 3000,
        monthly_spent: monthSpent
      },
      progress,
      nutrition_score: score
    };
  }
}
