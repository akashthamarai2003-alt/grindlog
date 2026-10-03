import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { V2PlanService } from "@/lib/services/nutrition/v2-plan-service";

export const dynamic = "force-dynamic";

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
    const dateParam = searchParams.get('date');
    const localDate = dateParam || await NutritionService.getLocalDateString(user.id);

    const adaptiveState = await V2PlanService.getV2AdaptiveRemainingDay(user.id, localDate);

    return NextResponse.json({
      success: true,
      data: adaptiveState,
    });
  } catch (error: any) {
    console.error("Error in GET /api/nutrition/adaptive-day:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to calculate adaptive day.' } },
      { status: 500 }
    );
  }
}
