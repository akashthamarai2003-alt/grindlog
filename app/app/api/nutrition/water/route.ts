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

    return NextResponse.json({ 
      success: true, 
      data: {
        amount_ml
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
    const amount_ml = Number(searchParams.get('amount')) || 250;

    await NutritionService.removeWater(user.id, amount_ml);

    return NextResponse.json({ 
      success: true, 
      data: {
        amount_ml
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

