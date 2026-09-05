import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

export async function GET(request: Request) {
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
    const dateParam = searchParams.get('date') || undefined;

    const data = await NutritionService.getTodaySummaryAndDetails(user.id, dateParam);
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    if (error.message === "TARGET_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: 'TARGET_NOT_FOUND', message: 'Nutrition target not found.' } },
        { status: 404 }
      );
    }
    console.error("Error in /api/nutrition/today:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'An error occurred while fetching nutrition data.' } },
      { status: 500 }
    );
  }
}
