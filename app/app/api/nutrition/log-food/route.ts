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
        { success: false, error: { code: 'PRO_REQUIRED', message: 'Food logging is available on the Pro plan.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { food_id, meal_type, quantity, custom_food } = body;

    if ((!food_id && !custom_food) || !meal_type || quantity === undefined) {
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

    // Normalize and validate meal_type
    const normalizedMealType = String(meal_type || "")
      .toLowerCase()
      .trim()
      .replace(/[-\s]+/g, "_");

    const validMealTypes = [
      "breakfast",
      "lunch",
      "dinner",
      "snack",
      "pre_workout",
      "post_workout",
      "morning_snack",
      "evening_snack",
      "late_snack",
    ];

    let finalMealType = normalizedMealType;
    if (!validMealTypes.includes(finalMealType)) {
      if (finalMealType.includes("pre")) finalMealType = "pre_workout";
      else if (finalMealType.includes("post")) finalMealType = "post_workout";
      else if (finalMealType.includes("break")) finalMealType = "breakfast";
      else if (finalMealType.includes("lunch")) finalMealType = "lunch";
      else if (finalMealType.includes("din")) finalMealType = "dinner";
      else if (/^[a-z0-9_]+$/.test(finalMealType) && finalMealType.length > 0) {
        // Accept valid custom meal type
      } else {
        finalMealType = "snack";
      }
    }

    const log = await NutritionService.logFood(user.id, { 
      food_id, 
      meal_type: finalMealType, 
      quantity, 
      custom_food 
    });

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
      { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to log food.' } },
      { status: 500 }
    );
  }
}
