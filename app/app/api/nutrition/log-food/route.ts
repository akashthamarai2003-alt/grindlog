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
    const { food_id, meal_type, quantity } = body;

    if (!food_id || !meal_type || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields.' } },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Quantity must be positive.' } },
        { status: 400 }
      );
    }

    // Validate meal_type strictly
    const validMealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    if (!validMealTypes.includes(meal_type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Invalid meal_type.' } },
        { status: 400 }
      );
    }

    const log = await NutritionService.logFood(user.id, { food_id, meal_type, quantity });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    if (error.message === 'FOOD_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'FOOD_NOT_FOUND', message: 'The selected food was not found or is inactive.' } },
        { status: 404 }
      );
    }
    console.error("Error in POST /api/nutrition/log-food:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to log food.' } },
      { status: 500 }
    );
  }
}
