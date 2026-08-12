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

    const body = await request.json();
    const { amount_ml } = body;

    if (amount_ml === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'amount_ml is required.' } },
        { status: 400 }
      );
    }

    if (amount_ml <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Water amount must be positive.' } },
        { status: 400 }
      );
    }

    await NutritionService.logWater(user.id, amount_ml);

    // Fetch the updated summary to return the new percentage
    const summary = await NutritionService.getTodaySummaryAndDetails(user.id);

    return NextResponse.json({ 
      success: true, 
      data: {
        total_water: summary.consumed.water_ml,
        target_water: summary.targets.water_ml,
        percentage: summary.progress.water_percent
      } 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/water:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to log water.' } },
      { status: 500 }
    );
  }
}
