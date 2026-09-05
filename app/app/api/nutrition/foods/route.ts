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
    const dietParam = (searchParams.get('diet') || '').trim().toLowerCase();

    // 0. Fetch user's onboarding profile to strictly enforce dietary classification
    const { data: profile } = await supabase
      .from('fitness_os_profiles')
      .select('diet_preference, food_type, food_allergies')
      .eq('user_id', user.id)
      .maybeSingle();

    const rawDiet = (profile?.diet_preference || profile?.food_type || '').toLowerCase();
    const isVegan = rawDiet.includes('vegan');
    const isEggetarian = rawDiet.includes('egg') && !rawDiet.includes('non');
    const isPureVeg = (rawDiet.includes('veg') || rawDiet.includes('vegetarian')) && !rawDiet.includes('non') && !rawDiet.includes('egg') && !isVegan;
    const isNonVeg = rawDiet.includes('non') || rawDiet.includes('meat');

    // 1. Build database query for verified foods
    let dbQuery = supabase
      .from('foods')
      .select('id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost, diet_type, is_pg_friendly, source_name')
      .eq('is_active', true);

    // Apply strict onboarding dietary filter unless explicitly overridden with diet=all
    if (dietParam !== 'all') {
      if (isVegan || dietParam === 'vegan') {
        dbQuery = dbQuery.eq('diet_type', 'vegan');
      } else if (isPureVeg || dietParam === 'veg') {
        dbQuery = dbQuery.in('diet_type', ['veg', 'vegan']);
      } else if (isEggetarian || dietParam === 'eggetarian') {
        dbQuery = dbQuery.in('diet_type', ['veg', 'vegan', 'eggetarian']);
      }
    }

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

    // 3. Filter external Open Food Facts by user's diet if active
    let filteredExternal = externalResult;
    if (dietParam !== 'all') {
      if (isVegan || dietParam === 'vegan') {
        filteredExternal = externalResult.filter(item => 
          !/\b(milk|whey|curd|cheese|paneer|egg|chicken|meat|fish|beef|pork|mutton)\b/i.test(item.name)
        );
      } else if (isPureVeg || dietParam === 'veg') {
        filteredExternal = externalResult.filter(item => 
          !/\b(chicken|meat|fish|egg|beef|pork|mutton|salmon|tuna|prawn)\b/i.test(item.name)
        );
      } else if (isEggetarian || dietParam === 'eggetarian') {
        filteredExternal = externalResult.filter(item => 
          !/\b(chicken|meat|fish|beef|pork|mutton|salmon|tuna|prawn)\b/i.test(item.name)
        );
      }
    }

    // 4. Merge & Deduplicate
    const localNames = new Set(localFoods.map((f: any) => f.name.toLowerCase()));
    const externalUnique = filteredExternal.filter(ext => !localNames.has(ext.name.toLowerCase()));

    const combinedFoods = [...localFoods, ...externalUnique];

    const detectedDietLabel = isVegan ? 'Vegan' : (isPureVeg ? 'Vegetarian' : (isEggetarian ? 'Eggetarian' : (isNonVeg ? 'Non-Vegetarian' : 'Balanced')));

    return NextResponse.json({
      success: true,
      data: combinedFoods,
      user_diet: detectedDietLabel,
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
