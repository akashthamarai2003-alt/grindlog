import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { requireFitnessSubscription } from "@/lib/fitness/subscription/access";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const targets = await NutritionService.getEffectiveTargets(user.id);

    return NextResponse.json({ success: true, data: targets });
  } catch (error: any) {
    console.error("Error in /api/nutrition/targets GET:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch targets.' } },
      { status: 500 }
    );
  }
}

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

    if (!(await requireFitnessSubscription(user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Setting targets requires an active paid plan.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const localDate = await NutritionService.getLocalDateString(user.id);

    // Validate bounds (Fix #9: prevent negative, extreme, and falsy-zero values)
    const rawCalories = Number(body.calories);
    const rawProtein = Number(body.protein);
    const rawCarbs = Number(body.carbs);
    const rawFat = Number(body.fat);
    const rawWater = Number(body.water_ml);

    if (isNaN(rawCalories) || rawCalories < 800 || rawCalories > 8000) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Calories must be between 800 and 8000.' } },
        { status: 400 }
      );
    }
    if (!isNaN(rawProtein) && (rawProtein < 0 || rawProtein > 500)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Protein must be between 0 and 500g.' } },
        { status: 400 }
      );
    }

    const calories = Math.round(rawCalories);
    const protein = Math.round(rawProtein || 130);
    const carbs = Math.round(rawCarbs || (calories * 0.45) / 4);
    const fat = Math.round(rawFat || (calories * 0.25) / 9);
    const water_ml = Math.round(rawWater || 3000);

    // 1. Check if a target record already exists for this user on this effective_date
    const { data: existing } = await supabase
      .from('nutrition_targets')
      .select('id')
      .eq('user_id', user.id)
      .eq('effective_date', localDate)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let target;
    if (existing?.id) {
      const { data: updated, error: updateErr } = await supabase
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

      if (updateErr) {
        console.error("Update target error:", updateErr);
        return NextResponse.json(
          { success: false, error: { code: 'UPDATE_FAILED', message: updateErr.message || 'Failed to update targets.' } },
          { status: 500 }
        );
      }
      target = updated;
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('nutrition_targets')
        .insert({
          user_id: user.id,
          calories,
          protein,
          carbs,
          fat,
          water_ml,
          effective_date: localDate
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Insert target error:", insertErr);
        return NextResponse.json(
          { success: false, error: { code: 'SAVE_FAILED', message: insertErr.message || 'Failed to save targets.' } },
          { status: 500 }
        );
      }
      target = inserted;
    }

    // 2. Also keep baseline calories and protein in fitness_os_profiles in sync
    await supabase
      .from('fitness_os_profiles')
      .update({
        baseline_calories: calories,
        initial_protein_target: protein,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // 3. Invalidate cache and update daily summary (Fix #10)
    NutritionService.invalidateServerCache(user.id);
    try {
      await NutritionService.updateDailySummary(user.id);
    } catch {}

    return NextResponse.json({ success: true, data: target });
  } catch (error: any) {
    console.error("Error in /api/nutrition/targets POST:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to save targets.' } },
      { status: 500 }
    );
  }
}
