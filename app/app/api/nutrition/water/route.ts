import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { isFitnessPro } from "@/lib/fitness/subscription/access";

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

    if (!(await isFitnessPro(user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'PRO_REQUIRED', message: 'Water tracking is available on the Pro plan.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount_ml } = body;

    const numericAmount = Number(amount_ml);
    if (amount_ml === undefined || isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 5000) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Water amount must be a positive number up to 5000ml.' } },
        { status: 400 }
      );
    }

    const result = await NutritionService.logWater(user.id, amount_ml);

    return NextResponse.json({ 
      success: true, 
      data: {
        amount_ml,
        total_water_ml: result.total_water_ml,
        capped: result.capped
      } 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/water:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to log water.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isReset = searchParams.get('reset') === 'true';

    if (isReset) {
      await NutritionService.resetTodayWater(user.id);
      return NextResponse.json({ success: true, data: { reset: true, total_water_ml: 0 } });
    }

    const rawAmount = searchParams.get('amount');
    const parsedAmount = rawAmount !== null ? Number(rawAmount) : 250;
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Removal amount must be a positive number.' } },
        { status: 400 }
      );
    }
    const amount_ml = Math.min(parsedAmount, 5000);

    const result = await NutritionService.removeWater(user.id, amount_ml);

    return NextResponse.json({ 
      success: true, 
      data: {
        amount_ml,
        total_water_ml: result.total_water_ml
      } 
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/nutrition/water:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to remove water.' } },
      { status: 500 }
    );
  }
}

