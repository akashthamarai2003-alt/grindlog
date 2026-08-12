import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

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
    const search = searchParams.get('search');

    let query = supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost')
      .eq('is_active', true)
      .limit(20);

    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: foods, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: foods || [] });
  } catch (error: any) {
    console.error("Error in GET /api/nutrition/foods:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch foods.' } },
      { status: 500 }
    );
  }
}
