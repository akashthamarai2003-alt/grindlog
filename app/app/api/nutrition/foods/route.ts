import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { searchOpenFoodFacts } from "@/lib/services/nutrition/external-nutrition-source";

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
    const search = (searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    // 1. Build database query for verified foods
    let dbQuery = supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, source_name')
      .eq('is_active', true);

    if (category && category.toLowerCase() !== 'all') {
      if (category.toLowerCase() === 'curries' || category.toLowerCase() === 'curry') {
        dbQuery = dbQuery.eq('category', 'Curry');
      } else if (category.toLowerCase() === 'nuts' || category.toLowerCase() === 'snacks') {
        dbQuery = dbQuery.in('category', ['Nuts & Snacks', 'Snack']);
      } else {
        dbQuery = dbQuery.ilike('category', `%${category}%`);
      }
    }

    if (search) {
      dbQuery = dbQuery.ilike('name', `%${search}%`).limit(40);
    } else {
      // Return generous 80 items for initial catalog exploration
      dbQuery = dbQuery.order('protein', { ascending: false }).limit(80);
    }

    // 2. Concurrently fetch local verified foods and external Open Food Facts if search query exists
    const [dbResult, externalResult] = await Promise.all([
      dbQuery,
      search ? searchOpenFoodFacts(search, 8).catch(() => []) : Promise.resolve([])
    ]);

    if (dbResult.error) throw dbResult.error;

    const localFoods = (dbResult.data || []).map((f: any) => ({
      ...f,
      source: 'verified' as const,
      source_name: f.source_name || 'ICMR-NIN / USDA Verified'
    }));

    // 3. Merge & Deduplicate
    const localNames = new Set(localFoods.map((f: any) => f.name.toLowerCase()));
    const externalUnique = externalResult.filter(ext => !localNames.has(ext.name.toLowerCase()));

    const combinedFoods = [...localFoods, ...externalUnique];

    return NextResponse.json({
      success: true,
      data: combinedFoods,
      total_count: combinedFoods.length,
      has_external_results: externalUnique.length > 0
    });
  } catch (error: any) {
    console.error("Error in GET /api/nutrition/foods:", error);
    return NextResponse.json(
      { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to fetch foods.' } },
      { status: 500 }
    );
  }
}
