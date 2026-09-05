/**
 * External Nutrition Data Source Integration.
 * Connects to Open Food Facts API (over 3 million foods, packaged items, and verified barcodes).
 * Includes timeout guards, input sanitization, and macro normalization.
 */

export interface ExternalFoodItem {
  id?: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  image_url?: string;
  source: 'open_food_facts' | 'verified_database';
  source_name?: string;
  brand?: string;
}

export async function searchOpenFoodFacts(query: string, limit: number = 8): Promise<ExternalFoodItem[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second hard timeout guard

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=${limit}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GrindlogApp/1.0 (fitness-nutrition@grindlog.in)',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) return [];

    const json = await res.json();
    const products = Array.isArray(json?.products) ? json.products : [];

    const items: ExternalFoodItem[] = [];

    for (const prod of products) {
      const rawName = prod.product_name || prod.product_name_en || prod.generic_name;
      if (!rawName || typeof rawName !== 'string') continue;

      const nut = prod.nutriments || {};
      
      // Extract kcal (check 100g first, fallback to serving)
      const rawCals = nut['energy-kcal_100g'] ?? nut['energy-kcal_serving'] ?? nut['energy-kcal'] ?? 
                      (nut['energy_100g'] ? Math.round(Number(nut['energy_100g']) / 4.184) : 0);
      const calories = Math.round(Number(rawCals) || 0);

      // We only want items that have legitimate calorie data
      if (calories <= 0 || isNaN(calories) || calories > 1200) continue;

      const protein = Number(Number(nut['proteins_100g'] ?? nut['proteins_serving'] ?? nut['proteins'] ?? 0).toFixed(1));
      const carbs = Number(Number(nut['carbohydrates_100g'] ?? nut['carbohydrates_serving'] ?? nut['carbohydrates'] ?? 0).toFixed(1));
      const fat = Number(Number(nut['fat_100g'] ?? nut['fat_serving'] ?? nut['fat'] ?? 0).toFixed(1));

      const brand = (prod.brands || '').split(',')[0]?.trim();
      const serving = prod.serving_size || '100g';
      const cleanName = brand && !rawName.toLowerCase().includes(brand.toLowerCase())
        ? `${rawName.trim()} (${brand})`
        : rawName.trim();

      const image = prod.image_front_small_url || prod.image_front_url || prod.image_url || undefined;

      // Classify category
      let category = 'Packaged Food';
      if (protein >= 15) category = 'Protein';
      else if (/milk|curd|yogurt|cheese|paneer|dahi/i.test(cleanName)) category = 'Dairy';
      else if (/oat|cereal|muesli|granola|bread/i.test(cleanName)) category = 'Breakfast';
      else if (/peanut|almond|walnut|cashew|nut|seed/i.test(cleanName)) category = 'Nuts & Snacks';
      else if (/juice|tea|coffee|shake|drink|water/i.test(cleanName)) category = 'Beverage';

      items.push({
        id: `off-${prod.code || Math.random().toString(36).slice(2, 9)}`,
        name: cleanName,
        category,
        serving_size: serving,
        calories,
        protein,
        carbs,
        fat,
        estimated_cost: 40, // standard default packaging estimate in INR
        image_url: image,
        source: 'open_food_facts',
        source_name: 'Open Food Facts',
        brand
      });
    }

    return items;
  } catch (err: any) {
    // Network aborted or failed; gracefully return empty array
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
