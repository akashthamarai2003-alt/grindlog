import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Log ID is required.' } },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    // Delete the log. RLS ensures they can only delete their own.
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    // Trigger recalculation of daily summary in background
    NutritionService.updateDailySummary(user.id).catch(err => {
      console.warn("Background updateDailySummary warning in deleteFood:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/nutrition/log-food/[id]:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to delete log.' } },
      { status: 500 }
    );
  }
}
