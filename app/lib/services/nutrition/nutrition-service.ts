import { createServerSupabase } from "@/lib/services/supabase/server";

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
  static async getLocalDateBoundaries(userId: string, preFetchedTz?: string): Promise<{ start: string, end: string }> {
    const tz = preFetchedTz || await this.getUserTimezone(userId);
    const dateStr = await this.getLocalDateString(userId, tz); // YYYY-MM-DD
    
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
            serving_size: '1 serving',
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
    
    // Fetch timezone once to avoid 3 redundant DB calls
    const tz = await this.getUserTimezone(userId);
    const localDate = await this.getLocalDateString(userId, tz);
    const { start, end } = await this.getLocalDateBoundaries(userId, tz);

    // Monthly spent calculation
    const firstDayOfMonth = localDate.substring(0, 8) + '01'; // YYYY-MM-01
    const mFormatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', year: 'numeric' });
    let mOffsetStr = mFormatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;
    if (!mOffsetStr || mOffsetStr === 'GMT') mOffsetStr = 'GMT+00:00';
    mOffsetStr = mOffsetStr.replace('GMT', '');
    const monthStartISO = new Date(`${firstDayOfMonth}T00:00:00.000${mOffsetStr}`).toISOString();

    // Parallelize all data fetching
    const [targets, foodsRes, watersRes, plansRes, monthFoodsRes, fitProfileRes, activePlanRes] = await Promise.all([
      this.getEffectiveTargets(userId),
      supabase
        .from('food_logs')
        .select('*, foods(name, category)')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end),
      supabase
        .from('water_logs')
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
        .select('nutrition_budget, food_environment, meals_per_day')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('fitness_os_workout_plans')
        .select('plan_data')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle()
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

    if (waters) {
      waters.forEach(w => consumed.water_ml += w.amount_ml);
    }

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

    // Always output Breakfast, Lunch, Snack, Dinner cards
    let formattedMeals = ALL_MEAL_TYPES.map(mType => {
      const existing = plansByMealType.get(mType);
      if (existing) return existing;

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

        return {
          id: `ai-${mType}`,
          meal_type: mType,
          name: mType.charAt(0).toUpperCase() + mType.slice(1),
          calories: estCals,
          protein: estPro,
          meal_plan_items: [
            {
              id: `ai-item-${mType}`,
              quantity: 1,
              foods: {
                name: aiMeal.items?.join(" + ") || aiMeal.meal_name,
                category: mType,
                calories: estCals,
                protein: estPro,
                carbs: 0,
                fat: 0,
                estimated_cost: estCost
              }
            }
          ]
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

    const totalMeals = formattedMeals.length > 0 ? formattedMeals.length : 4;
    let mealsCompleted = formattedMeals.filter(p => completedMealTypes.has(p.meal_type)).length;

    const score = this.computeNutritionScore(consumed, targets, mealsCompleted, totalMeals);

    return {
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
        monthly_spent: monthSpent
      },
      progress,
      nutrition_score: score
    };
  }
}
