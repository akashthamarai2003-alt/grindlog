import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

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

    const body = await request.json();
    const localDate = await NutritionService.getLocalDateString(user.id);

    const calories = Number(body.calories) || 2000;
    const protein = Number(body.protein) || 130;
    const carbs = Number(body.carbs) || Math.round((calories * 0.45) / 4);
    const fat = Number(body.fat) || Math.round((calories * 0.25) / 9);
    const water_ml = Number(body.water_ml) || 3000;

    const { data: target, error: insertErr } = await supabase
      .from('nutrition_targets')
      .upsert({
        user_id: user.id,
        calories,
        protein,
        carbs,
        fat,
        water_ml,
        daily_budget: Number(body.daily_budget) || 300,
        monthly_budget: Number(body.monthly_budget) || 6000,
        effective_date: localDate
      }, { onConflict: 'user_id, effective_date' })
      .select()
      .single();

    if (insertErr) {
      console.error("Insert target error:", insertErr);
      return NextResponse.json(
        { success: false, error: { code: 'SAVE_FAILED', message: 'Failed to save targets.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: target });
  } catch (error: any) {
    console.error("Error in /api/nutrition/targets POST:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Failed to save targets.' } },
      { status: 500 }
    );
  }
}
