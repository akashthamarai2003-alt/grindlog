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
    
    // Attempt to fetch first
    let { data: summary, error } = await supabase
      .from('nutrition_daily_summary')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', localDate)
      .maybeSingle();

    // If it doesn't exist, calculate it (lazy creation)
    if (!summary) {
      await NutritionService.updateDailySummary(user.id);
      
      // Fetch it again
      const { data: newSummary, error: newError } = await supabase
        .from('nutrition_daily_summary')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', localDate)
        .maybeSingle();
        
      if (newError) throw newError;
      summary = newSummary;
    }

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error("Error in GET /api/nutrition/summary:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch summary.' } },
      { status: 500 }
    );
  }
}
