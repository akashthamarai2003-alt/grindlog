import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const mealType = (body.meal_type || 'lunch').toLowerCase();
    const localDate = await NutritionService.getLocalDateString(user.id);

    // Fetch active food catalog
    const { data: allFoods } = await supabase
      .from('foods')
      .select('*')
      .eq('is_active', true);

    if (!allFoods || allFoods.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_FOODS', message: 'Food catalog is empty.' } },
        { status: 400 }
      );
    }

    // Filter foods matching meal category or diet
    let altFoods = allFoods.filter(f => {
      const cat = (f.category || '').toLowerCase();
      if (mealType === 'breakfast') return cat.includes('breakfast') || cat.includes('dairy') || cat.includes('fruit');
      if (mealType === 'snack') return cat.includes('snack') || cat.includes('fruit');
      return cat.includes('curry') || cat.includes('protein') || cat.includes('staple');
    });

    if (altFoods.length < 2) altFoods = allFoods;

    // Pick 2 random foods for the swapped meal
    const shuffled = [...altFoods].sort(() => 0.5 - Math.random());
    const selectedFoods = shuffled.slice(0, 2);

    // Check if meal_plan row for this mealType/date exists or single daily plan exists
    const { data: existingPlans } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', localDate);

    let targetPlan;
    if (existingPlans && existingPlans.length > 0) {
      targetPlan = existingPlans.find(p => p.meal_type === mealType) || existingPlans[0];
      
      // Delete old items for this plan
      await supabase.from('meal_plan_items').delete().eq('meal_plan_id', targetPlan.id);
    } else {
      // Create a new meal plan row for this specific meal type
      const { data: newPlan } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          date: localDate,
          meal_type: mealType
        })
        .select()
        .single();
        
      targetPlan = newPlan;
    }

    if (targetPlan) {
      // Insert new swapped items
      const newItems = selectedFoods.map(f => ({
        meal_plan_id: targetPlan.id,
        food_id: f.id,
        quantity: 1
      }));

      await supabase.from('meal_plan_items').insert(newItems);
    }

    await NutritionService.updateDailySummary(user.id);

    return NextResponse.json({ 
      success: true, 
      message: `Swapped ${mealType} meal with new foods!`,
      data: null 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/swap-meal:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to swap meal.' } },
      { status: 500 }
    );
  }
}
