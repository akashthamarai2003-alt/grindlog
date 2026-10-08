import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { resolveV2ImageSnapshot } from "@/lib/services/nutrition/v2-plan-service";
import { approvedImageForReference, type RecipeImageRow } from "@/lib/fitness/nutrition/image-policy";
import { cleanFoodName, cleanServing, parseCompositeServing } from "@/lib/fitness/nutrition/portion-parser";

export interface V2NutritionLog {
  id: string;
  mealSlot: string;
  plannedMealId: string | null;
  name: string;
  serving: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface V2NutritionIngredient {
  id: string;
  name: string;
  quantity: string;
  isProvided: boolean;
}

export interface V2NutritionMeal {
  id: string;
  slot: string;
  sequence: number;
  scheduledTime: string | null;
  status: "PLANNED" | "LOGGED" | "SKIPPED" | "CANCELLED";
  sourceType: "RECIPE" | "TEMPLATE";
  name: string;
  description: string | null;
  whyThisMeal: string | null;
  prepInstructions: string | null;
  prepTimeMin: number | null;
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  ingredients: V2NutritionIngredient[];
  logs: V2NutritionLog[];
}

export interface V2NutritionDay {
  date: string;
  today: string;
  timezone: string;
  planId: string | null;
  meals: V2NutritionMeal[];
  logs: V2NutritionLog[];
  consumed: { calories: number; protein: number; carbs: number; fat: number; water_ml: number };
  targets: { calories: number; protein: number; carbs: number; fat: number; water_ml: number };
}

interface PlanRow { id: string }
interface PlannedRow {
  id: string; meal_slot: string; meal_sequence: number; scheduled_time: string | null;
  status: V2NutritionMeal["status"]; source_type: V2NutritionMeal["sourceType"];
  recipe_version_id: string | null; meal_template_id: string | null;
  image_asset_id: string | null; image_storage_path_snapshot: string | null;
  image_url_snapshot: string | null; calories_snapshot: number; protein_snapshot: number;
  carbs_snapshot: number; fat_snapshot: number; cost_snapshot: number;
}
interface ItemRow {
  id: string; planned_meal_id: string; serving_size: string | null; quantity: number;
  unit: string | null; is_provided: boolean | null;
  foods: { name: string } | Array<{ name: string }> | null;
}
interface LogRow {
  id: string; meal_type: string | null; planned_meal_id: string | null;
  recipe_name_snapshot: string | null; serving_snapshot: string | null;
  calories: number; protein: number; carbs: number; fat: number;
  logged_at: string; foods: { name: string; serving_size: string | null } |
    Array<{ name: string; serving_size: string | null }> | null;
}
interface RecipeRow {
  id: string; name: string; description: string | null; prep_instructions: string;
  cooking_time_min: number;
}
interface TemplateRow { id: string; name: string; description: string | null; environment: string }

function numeric(value: number | string | null | undefined): number {
  return Number(value) || 0;
}
function relatedFood<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] || null : value;
}
function resolvePrepInstructions(raw: string | null | undefined, name: string): string {
  const trimmed = (raw || "").trim();
  const isGeneric = !trimmed || trimmed.toLowerCase().includes("standard indian homestyle recipe") || trimmed.toLowerCase().includes("serve the listed foods in their planned portions");
  if (!isGeneric && trimmed.length > 25) return trimmed;

  const lower = name.toLowerCase();
  if (lower.includes("soya chunks bhurji") || (lower.includes("soya") && lower.includes("bhurji"))) {
    return "1. Soak dry soya chunks in boiling water for 8-10 mins. Drain and squeeze out water completely, then coarsely mince. 2. In a pan, sauté chopped onions, green chilies, and ginger-garlic paste in 1 tsp oil with turmeric and garam masala. 3. Add minced soya chunks and stir-fry on medium flame for 5-7 mins. Serve hot with warm multigrain rotis.";
  }
  if (lower.includes("soya chunks curry") || (lower.includes("soya") && lower.includes("curry"))) {
    return "1. Boil soya chunks in salted water for 10 mins, drain, and squeeze out excess moisture. 2. Heat 1 tsp oil, sauté onions, ginger-garlic paste, and tomato puree with turmeric, coriander, and chili powder. 3. Add soya chunks and 1 cup warm water; cover and simmer for 8 mins until gravy thickens. Serve with rotis and fresh salad.";
  }
  if (lower.includes("chana dal") || lower.includes("dal curry") || lower.includes("dal tadka")) {
    return "1. Rinse and pressure cook chana dal with turmeric, salt, and water until tender. 2. For tempering, heat 1 tsp oil or ghee, add cumin seeds, minced garlic, green chilies, and chopped tomatoes. 3. Pour tempering into cooked dal and simmer for 3-5 mins. Enjoy with fresh rotis and roasted chana.";
  }
  if (lower.includes("cheela")) {
    return "1. Whisk batter with salt, grated ginger, and chopped green chilies until smooth. 2. Grease a tawa lightly with oil, pour a ladle of batter, and spread into a thin round. 3. Cook on medium flame until both sides turn golden and crisp. Serve warm with sliced cucumbers or mint chutney.";
  }
  if (lower.includes("poha")) {
    return "1. Rinse thick poha under running water and drain well in a colander. 2. Heat 1 tsp oil, add mustard seeds, curry leaves, green chilies, and peanuts until aromatic. 3. Add turmeric and sliced onions, followed by drained poha. Toss gently for 3 mins and squeeze fresh lemon juice on top.";
  }
  if (lower.includes("upma")) {
    return "1. Dry roast rava/semolina until lightly fragrant. 2. In a pot, heat 1 tsp oil, temper mustard seeds, curry leaves, and green chilies. Add steamed peas and 2.5 cups water with salt; bring to a boil. 3. Slowly whisk in roasted rava, cover on low flame for 3 mins, and serve warm.";
  }
  if (lower.includes("idli") || lower.includes("dosa")) {
    return "1. Steam fresh idlis in a steamer for 10-12 mins, or spread dosa batter on a hot greased tawa until crisp. 2. Heat lentil-rich sambar with mixed vegetables. 3. Serve hot and fresh.";
  }
  if (lower.includes("oats")) {
    return "1. Dry roast rolled oats for 2 mins in a pan. 2. Add water or skim milk with a pinch of cinnamon or chopped veggies for savory masala oats. 3. Simmer for 3-5 mins until creamy and serve warm.";
  }
  if (lower.includes("daliya")) {
    return "1. Dry roast broken wheat (daliya) until nutty and fragrant. 2. In a pressure cooker, sauté cumin, ginger, and diced vegetables in 1 tsp oil. 3. Add roasted daliya and 3 cups water with salt; pressure cook for 3 whistles until soft and wholesome.";
  }
  if (lower.includes("tofu") || lower.includes("paneer")) {
    return "1. Cut paneer or firm tofu into bite-sized cubes. 2. Lightly pan-sear in 1 tsp oil with turmeric, black pepper, and chaat masala for 4-5 mins. 3. Pair with warm rotis or fresh whole wheat toast.";
  }
  if (lower.includes("toast") && lower.includes("peanut butter")) {
    return "1. Lightly toast whole wheat bread slices until golden and crisp. 2. Spread 1-2 tbsp natural peanut butter evenly across slices. 3. Top with sliced banana or chia seeds and enjoy immediately.";
  }
  return "Cook ingredients using minimal oil (1 tsp) and light Indian spices. Measure portions according to the listed gram weights to stay within your nutrition targets.";
}

/** Read-only V2 presentation model. Meals come from planned_meals; intake comes from food_logs. */
export async function getV2NutritionDay(userId: string, date?: string): Promise<V2NutritionDay> {
  const supabase = await createServerSupabase();
  const timezone = await NutritionService.getUserTimezone(userId);
  const today = await NutritionService.getLocalDateString(userId, timezone);
  const localDate = date || today;
  const { start, end } = await NutritionService.getLocalDateBoundaries(userId, timezone, localDate);
  const [planRes, logsRes, waterRes, targets] = await Promise.all([
    supabase.from("meal_plans").select("id").eq("user_id", userId)
      .eq("date", localDate).eq("status", "READY").maybeSingle(),
    supabase.from("food_logs")
      .select("id,meal_type,planned_meal_id,recipe_name_snapshot,serving_snapshot,calories,protein,carbs,fat,logged_at,foods(name,serving_size)")
      .eq("user_id", userId).gte("logged_at", start).lte("logged_at", end).order("logged_at"),
    supabase.from("fitness_os_water_logs").select("amount_ml")
      .eq("user_id", userId).gte("logged_at", start).lte("logged_at", end),
    NutritionService.getEffectiveTargets(userId, localDate, timezone),
  ]);
  if (planRes.error) throw planRes.error;
  if (logsRes.error) throw logsRes.error;
  if (waterRes.error) throw waterRes.error;
  const plan = planRes.data as PlanRow | null;
  const logRows = (logsRes.data || []) as LogRow[];
  const logs: V2NutritionLog[] = logRows.map((log) => {
    const rawFoodName = relatedFood(log.foods)?.name;
    const rawServing = log.serving_snapshot || relatedFood(log.foods)?.serving_size;
    const parsedServing = parseCompositeServing(rawServing);

    const name = cleanFoodName(rawFoodName || log.recipe_name_snapshot || parsedServing.title, "Actual food");
    const serving = rawServing ? cleanServing(rawServing) : null;

    return {
      id: log.id,
      mealSlot: log.meal_type || "other",
      plannedMealId: log.planned_meal_id,
      name,
      serving,
      calories: numeric(log.calories),
      protein: numeric(log.protein),
      carbs: numeric(log.carbs),
      fat: numeric(log.fat),
      loggedAt: log.logged_at,
    };
  });
  const consumed = logs.reduce((sum, log) => ({
    ...sum, calories: sum.calories + log.calories, protein: sum.protein + log.protein,
    carbs: sum.carbs + log.carbs, fat: sum.fat + log.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 });
  consumed.water_ml = (waterRes.data || []).reduce((sum, row) => sum + numeric(row.amount_ml), 0);
  const targetValues = {
    calories: numeric(targets?.calories), protein: numeric(targets?.protein),
    carbs: numeric(targets?.carbs), fat: numeric(targets?.fat),
    water_ml: numeric(targets?.water_ml),
  };
  if (!plan) return { date: localDate, today, timezone, planId: null,
    meals: [], logs, consumed, targets: targetValues };

  const mealsRes = await supabase.from("planned_meals")
    .select("id,meal_slot,meal_sequence,scheduled_time,status,source_type,recipe_version_id,meal_template_id,image_asset_id,image_storage_path_snapshot,image_url_snapshot,calories_snapshot,protein_snapshot,carbs_snapshot,fat_snapshot,cost_snapshot")
    .eq("user_id", userId).eq("meal_plan_id", plan.id).eq("local_date", localDate)
    .order("meal_sequence");
  if (mealsRes.error) throw mealsRes.error;
  const rows = (mealsRes.data || []) as PlannedRow[];
  if (rows.length === 0) return { date: localDate, today, timezone, planId: plan.id,
    meals: [], logs, consumed, targets: targetValues };

  const versionIds = [...new Set(rows.map((row) => row.recipe_version_id).filter((id): id is string => Boolean(id)))];
  const templateIds = [...new Set(rows.map((row) => row.meal_template_id).filter((id): id is string => Boolean(id)))];
  const imageIds = [...new Set(rows.map((row) => row.image_asset_id).filter((id): id is string => Boolean(id)))];
  const [itemsRes, versionsRes, templatesRes, imagesRes] = await Promise.all([
    supabase.from("meal_plan_items").select("id,planned_meal_id,serving_size,quantity,unit,is_provided,foods(name)")
      .in("planned_meal_id", rows.map((row) => row.id)),
    versionIds.length ? supabase.from("recipe_versions")
      .select("id,name,description,prep_instructions,cooking_time_min").in("id", versionIds)
      : Promise.resolve({ data: [], error: null }),
    templateIds.length ? supabase.from("meal_templates")
      .select("id,name,description,environment").in("id", templateIds)
      : Promise.resolve({ data: [], error: null }),
    imageIds.length ? supabase.from("recipe_images")
      .select("id,recipe_version_id,storage_path,url,status,is_primary").in("id", imageIds)
      .eq("status", "APPROVED").eq("is_primary", true)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (versionsRes.error) throw versionsRes.error;
  if (templatesRes.error) throw templatesRes.error;
  const items = (itemsRes.data || []) as ItemRow[];
  const versions = new Map(((versionsRes.data || []) as RecipeRow[]).map((row) => [row.id, row]));
  const templates = new Map(((templatesRes.data || []) as TemplateRow[]).map((row) => [row.id, row]));
  // An unavailable approval lookup uses the fallback; it must not block meals.
  const images = (imagesRes.error ? [] : imagesRes.data || []) as RecipeImageRow[];
  const meals: V2NutritionMeal[] = rows.map((row) => {
    const version = row.recipe_version_id ? versions.get(row.recipe_version_id) : undefined;
    const template = row.meal_template_id ? templates.get(row.meal_template_id) : undefined;
    const rawMealName = version?.name || template?.name || row.meal_slot.replaceAll("_", " ");
    const name = cleanFoodName(rawMealName, row.meal_slot.replaceAll("_", " "));
    const image = approvedImageForReference({ imageAssetId: row.image_asset_id,
      recipeVersionId: row.recipe_version_id, storagePath: row.image_storage_path_snapshot,
      url: row.image_url_snapshot }, images);
    const ingredients = items.filter((item) => item.planned_meal_id === row.id).map((item) => {
      const rawFoodName = relatedFood(item.foods)?.name;
      const parsedServing = parseCompositeServing(item.serving_size);

      const ingName = cleanFoodName(rawFoodName || parsedServing.title, "Food");

      let quantity = parsedServing.portion;
      if (!quantity || quantity === "1 serving") {
        if (numeric(item.quantity) > 0 && item.unit) {
          quantity = `${numeric(item.quantity)} ${item.unit}`;
        } else if (item.serving_size) {
          quantity = cleanServing(item.serving_size);
        } else {
          quantity = `${numeric(item.quantity)} ${item.unit || "servings"}`;
        }
      }

      return {
        id: item.id,
        name: ingName,
        quantity,
        isProvided: item.is_provided === true,
      };
    });
    return {
      id: row.id, slot: row.meal_slot, sequence: row.meal_sequence,
      scheduledTime: row.scheduled_time, status: row.status, sourceType: row.source_type,
      name, description: version?.description || template?.description || null,
      whyThisMeal: template?.description || null,
      prepInstructions: resolvePrepInstructions(version?.prep_instructions, name),
      prepTimeMin: version?.cooking_time_min ?? null,
      imageUrl: resolveV2ImageSnapshot(image?.url, name),
      calories: numeric(row.calories_snapshot), protein: numeric(row.protein_snapshot),
      carbs: numeric(row.carbs_snapshot), fat: numeric(row.fat_snapshot),
      cost: numeric(row.cost_snapshot), ingredients,
      logs: logs.filter((log) => log.plannedMealId === row.id ||
        (!log.plannedMealId && log.mealSlot === row.meal_slot &&
          rows.find((candidate) => candidate.meal_slot === row.meal_slot)?.id === row.id)),
    };
  });
  return { date: localDate, today, timezone, planId: plan.id,
    meals, logs, consumed, targets: targetValues };
}
