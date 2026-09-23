import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { isFitnessPro } from "@/lib/fitness/subscription/access";

const VALID_MEAL_TYPES = [
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

function normalizeMealType(mealType: string): string {
  const normalizedMealType = String(mealType || "")
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, "_");

  if (VALID_MEAL_TYPES.includes(normalizedMealType)) return normalizedMealType;
  if (normalizedMealType.includes("pre")) return "pre_workout";
  if (normalizedMealType.includes("post")) return "post_workout";
  if (normalizedMealType.includes("break")) return "breakfast";
  if (normalizedMealType.includes("lunch")) return "lunch";
  if (normalizedMealType.includes("din")) return "dinner";
  if (/^[a-z0-9_]+$/.test(normalizedMealType) && normalizedMealType.length > 0) {
    return normalizedMealType;
  }
  return "snack";
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

    if (!(await isFitnessPro(user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'PRO_REQUIRED', message: 'Food logging is available on the Pro plan.' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 1. Batch logging support: { items: [...] }
    if (body.items && Array.isArray(body.items)) {
      if (body.items.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_INPUT', message: 'Items array cannot be empty.' } },
          { status: 400 }
        );
      }

      const normalizedItems = body.items.map((it: any) => ({
        ...it,
        meal_type: normalizeMealType(it.meal_type),
        quantity: Math.max(0.1, Number(it.quantity) || 1)
      })).filter((it: any) => it.quantity > 0);

      const logs = await NutritionService.logMultipleFoods(user.id, normalizedItems);
      NutritionService.invalidateServerCache(user.id);
      try {
        revalidatePath("/");
        revalidatePath("/nutrition");
      } catch {}
      return NextResponse.json({ success: true, data: logs });
    }

    // 2. Single food logging fallback
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

    const finalMealType = normalizeMealType(meal_type);

    const log = await NutritionService.logFood(user.id, { 
      food_id, 
      meal_type: finalMealType, 
      quantity, 
      custom_food 
    });

    NutritionService.invalidateServerCache(user.id);

    try {
      revalidatePath("/");
      revalidatePath("/nutrition");
    } catch {}

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
    const mealType = searchParams.get('meal_type');
    const date = searchParams.get('date');

    if (!mealType) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'meal_type is required.' } },
        { status: 400 }
      );
    }

    const normalizedMealType = normalizeMealType(mealType);

    // Get user timezone and local boundaries
    const tz = await NutritionService.getUserTimezone(user.id);
    const targetDate = date || await NutritionService.getLocalDateString(user.id, tz);
    const { start, end } = await NutritionService.getLocalDateBoundaries(user.id, tz, targetDate);

    // Delete all food logs for this meal_type within the date boundaries
    const admin = createAdminClient();
    const { error: deleteError } = await admin
      .from('food_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_type', normalizedMealType)
      .gte('logged_at', start)
      .lte('logged_at', end);

    if (deleteError) throw deleteError;

    NutritionService.invalidateServerCache(user.id);

    // Trigger background update of daily summary
    NutritionService.updateDailySummary(user.id).catch(err => {
      console.warn("Background updateDailySummary warning in deleteMeal:", err);
    });

    try {
      revalidatePath("/");
      revalidatePath("/nutrition");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/nutrition/log-food:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: error?.message || 'Failed to delete meal.' } },
      { status: 500 }
    );
  }
}
