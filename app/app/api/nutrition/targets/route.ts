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

    const targets = await NutritionService.getEffectiveTargets(user.id);

    if (!targets) {
      return NextResponse.json(
        { success: false, error: { code: 'TARGET_NOT_FOUND', message: 'No nutrition targets found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: targets });
  } catch (error: any) {
    console.error("Error in /api/nutrition/targets:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch targets.' } },
      { status: 500 }
    );
  }
}
