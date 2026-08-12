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

    const localDate = await NutritionService.getLocalDateString(user.id);

    const { data: plans, error } = await supabase
      .from('meal_plans')
      .select('*, meal_plan_items(*, foods(*))')
      .eq('user_id', user.id)
      .eq('date', localDate);

    if (error) throw error;

    return NextResponse.json({ success: true, data: plans || [] });
  } catch (error: any) {
    console.error("Error in /api/nutrition/meals:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch meals.' } },
      { status: 500 }
    );
  }
}
