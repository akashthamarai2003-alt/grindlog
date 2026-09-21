import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const userId = '20c6e41e-97d1-483b-bfcd-9c3464129e58';
  console.log(`Checking user: ${userId}`);

  // 1. Get user profile and timezone
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: fitProfile } = await supabase
    .from('fitness_os_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  console.log("Profile:", profile?.email, profile?.name);
  console.log("Fitness Profile:", {
    diet_preference: fitProfile?.diet_preference,
    food_environment: fitProfile?.food_environment,
    primary_goal: fitProfile?.primary_goal,
    meals_per_day: fitProfile?.meals_per_day,
    nutrition_budget: fitProfile?.nutrition_budget
  });

  // Calculate local date for user (Asia/Kolkata / UTC+5:30)
  const now = new Date();
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: profile?.timezone || 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);

  console.log(`User local date: ${todayStr}`);

  // Check meal_plans
  const { data: mPlans } = await supabase
    .from('meal_plans')
    .select('*, meal_plan_items(*, foods(*))')
    .eq('user_id', userId)
    .eq('date', todayStr);
  console.log("Today meal plan raw items:", mPlans?.[0]?.meal_plan_items?.map((it: any) => ({
    name: it.foods?.name,
    serving_size: it.serving_size,
    quantity: it.quantity,
    cals: it.foods?.calories,
    p: it.foods?.protein,
    f: it.foods?.fat,
    c: it.foods?.carbs,
    cost: it.foods?.estimated_cost
  })));

  // 2. Fetch food_logs
  const { data: logs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', userId);

  console.log(`Total food_logs found: ${logs?.length || 0}`);
  if (logs && logs.length > 0) {
    console.log("Logs sample:", logs.map(l => ({
      id: l.id,
      meal_type: l.meal_type,
      food_id: l.food_id,
      calories: l.calories,
      logged_at: l.logged_at
    })));

    // Clean up phantom food logs for this user
    const { error: delErr, count } = await supabase
      .from('food_logs')
      .delete()
      .eq('user_id', userId);

    if (delErr) {
      console.error("Error deleting food_logs:", delErr);
    } else {
      console.log(`Cleaned up food_logs for user: ${count ?? logs.length} removed.`);
    }
  }

  // 3. Reset daily_nutrition_summaries
  const { data: summaries } = await supabase
    .from('daily_nutrition_summaries')
    .select('*')
    .eq('user_id', userId);

  console.log("Existing summaries:", summaries?.map(s => ({
    date: s.date,
    calories_consumed: s.calories_consumed,
    protein_consumed: s.protein_consumed,
    target_calories: s.target_calories
  })));

  if (summaries && summaries.length > 0) {
    const { error: sumErr } = await supabase
      .from('daily_nutrition_summaries')
      .update({
        calories_consumed: 0,
        protein_consumed: 0,
        carbs_consumed: 0,
        fat_consumed: 0,
        meals_logged: 0
      })
      .eq('user_id', userId);

    if (sumErr) {
      console.error("Error resetting daily_nutrition_summaries:", sumErr);
    } else {
      console.log("Successfully reset daily_nutrition_summaries to 0 consumed.");
    }
  }

  console.log("Cleanup and sync completed successfully.");

  // 4. Test NutritionService.getTodaySummaryAndDetails for Akash
  const { NutritionService } = await import('../lib/services/nutrition/nutrition-service');
  const todayData = await NutritionService.getTodaySummaryAndDetails(userId);

  console.log("\n=== VERIFYING TODAY SUMMARY FOR AKASH ===");
  console.log("Date:", todayData.date);
  console.log("Targets:", todayData.targets);
  console.log("Consumed:", todayData.consumed);
  console.log("Meals Count:", todayData.meals?.length);
  todayData.meals?.forEach((m: any) => {
    console.log(`\nMeal [${m.meal_type}] "${m.name}"`);
    console.log(`Calories: ${m.calories} kcal, Protein: ${m.protein}g, Carbs: ${m.carbs}g, Fat: ${m.fat}g, Cost: ₹${m.estimated_cost}`);
    console.log("Items:", m.meal_plan_items?.map((it: any) => `${it.foods?.name} (${it.quantity}x) - ${Math.round((it.foods?.calories || 0) * it.quantity)} kcal, ${((it.foods?.protein || 0) * it.quantity).toFixed(1)}g P, ${((it.foods?.fat || 0) * it.quantity).toFixed(1)}g F, ₹${Math.round((it.foods?.estimated_cost || 0) * it.quantity)}`));
  });

  const totalPlannedCals = todayData.meals?.reduce((acc: number, m: any) => acc + (m.calories || 0), 0);
  const totalPlannedPro = todayData.meals?.reduce((acc: number, m: any) => acc + (m.protein || 0), 0);
  const totalPlannedCarbs = todayData.meals?.reduce((acc: number, m: any) => acc + (m.carbs || 0), 0);
  const totalPlannedFat = todayData.meals?.reduce((acc: number, m: any) => acc + (m.fat || 0), 0);
  const totalPlannedCost = todayData.meals?.reduce((acc: number, m: any) => acc + (m.estimated_cost || 0), 0);

  console.log("\n=== TOTAL PLANNED MEAL MACROS ===");
  console.log(`Calories: ${totalPlannedCals} / ${todayData.targets.calories} kcal (Diff: ${totalPlannedCals - todayData.targets.calories})`);
  console.log(`Protein: ${totalPlannedPro.toFixed(1)} / ${todayData.targets.protein}g (Diff: ${(totalPlannedPro - todayData.targets.protein).toFixed(1)}g)`);
  console.log(`Carbs: ${totalPlannedCarbs.toFixed(1)} / ${todayData.targets.carbs}g (Diff: ${(totalPlannedCarbs - todayData.targets.carbs).toFixed(1)}g)`);
  console.log(`Fat: ${totalPlannedFat.toFixed(1)} / ${todayData.targets.fat}g (Diff: ${(totalPlannedFat - todayData.targets.fat).toFixed(1)}g)`);
  console.log(`Cost: ₹${totalPlannedCost} (Budget limit: ₹${todayData.budget.daily_limit})`);
}

main().catch(console.error);
