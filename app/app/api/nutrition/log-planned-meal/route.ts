import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { isFitnessPro } from "@/lib/fitness/subscription/access";
import { V2PlanService } from "@/lib/services/nutrition/v2-plan-service";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import type { MealSlotType } from "@/lib/fitness/nutrition/domain-types";

const PLANNED_SLOTS = new Set<MealSlotType>([
  "breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout",
]);

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (!(await isFitnessPro(user.id))) {
      return NextResponse.json({ success: false, error: "PRO_REQUIRED" }, { status: 403 });
    }
    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("nutrition_engine_v2")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!V2PlanService.isNutritionV2Enabled(user.id, profile)) {
      return NextResponse.json({ success: false, error: "V2_NOT_ENABLED" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const mealSlot = body.meal_slot as MealSlotType;
    if (!PLANNED_SLOTS.has(mealSlot)) {
      return NextResponse.json({ success: false, error: "INVALID_MEAL_SLOT" }, { status: 400 });
    }
    const date = typeof body.date === "string"
      ? body.date : await NutritionService.getLocalDateString(user.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      return NextResponse.json({ success: false, error: "INVALID_DATE" }, { status: 400 });
    }

    const result = await V2PlanService.logV2PlannedMeal(user.id, date, mealSlot);
    revalidatePath("/nutrition");
    revalidatePath("/");
    return NextResponse.json({ success: true, engine: "v2", data: result });
  } catch (error) {
    console.error("Error in POST /api/nutrition/log-planned-meal:", error);
    const message = error instanceof Error ? error.message : "Planned meal logging failed.";
    const isConflict = /ALREADY_LOGGED|NOT_LOGGABLE|NOT_UNIQUE|PLAN_NOT_READY|MEAL_SLOT_ALREADY_LOGGED/.test(message);
    return NextResponse.json(
      { success: false, error: { code: isConflict ? "MEAL_CONFLICT" : "LOG_FAILED", message } },
      { status: isConflict ? 409 : 500 }
    );
  }
}
