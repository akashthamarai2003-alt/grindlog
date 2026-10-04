import { createServerSupabase } from "@/lib/services/supabase/server";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { resolveV2ImageSnapshot } from "@/lib/services/nutrition/v2-plan-service";

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
  const logs: V2NutritionLog[] = logRows.map((log) => ({
    id: log.id,
    mealSlot: log.meal_type || "other",
    plannedMealId: log.planned_meal_id,
    name: relatedFood(log.foods)?.name || log.recipe_name_snapshot || "Actual food",
    serving: log.serving_snapshot || relatedFood(log.foods)?.serving_size || null,
    calories: numeric(log.calories), protein: numeric(log.protein),
    carbs: numeric(log.carbs), fat: numeric(log.fat), loggedAt: log.logged_at,
  }));
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
    .select("id,meal_slot,meal_sequence,scheduled_time,status,source_type,recipe_version_id,meal_template_id,image_url_snapshot,calories_snapshot,protein_snapshot,carbs_snapshot,fat_snapshot,cost_snapshot")
    .eq("user_id", userId).eq("meal_plan_id", plan.id).eq("local_date", localDate)
    .order("meal_sequence");
  if (mealsRes.error) throw mealsRes.error;
  const rows = (mealsRes.data || []) as PlannedRow[];
  if (rows.length === 0) return { date: localDate, today, timezone, planId: plan.id,
    meals: [], logs, consumed, targets: targetValues };

  const versionIds = [...new Set(rows.map((row) => row.recipe_version_id).filter((id): id is string => Boolean(id)))];
  const templateIds = [...new Set(rows.map((row) => row.meal_template_id).filter((id): id is string => Boolean(id)))];
  const [itemsRes, versionsRes, templatesRes] = await Promise.all([
    supabase.from("meal_plan_items").select("id,planned_meal_id,serving_size,quantity,unit,is_provided,foods(name)")
      .in("planned_meal_id", rows.map((row) => row.id)),
    versionIds.length ? supabase.from("recipe_versions")
      .select("id,name,description,prep_instructions,cooking_time_min").in("id", versionIds)
      : Promise.resolve({ data: [], error: null }),
    templateIds.length ? supabase.from("meal_templates")
      .select("id,name,description,environment").in("id", templateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (versionsRes.error) throw versionsRes.error;
  if (templatesRes.error) throw templatesRes.error;
  const items = (itemsRes.data || []) as ItemRow[];
  const versions = new Map(((versionsRes.data || []) as RecipeRow[]).map((row) => [row.id, row]));
  const templates = new Map(((templatesRes.data || []) as TemplateRow[]).map((row) => [row.id, row]));
  const meals: V2NutritionMeal[] = rows.map((row) => {
    const version = row.recipe_version_id ? versions.get(row.recipe_version_id) : undefined;
    const template = row.meal_template_id ? templates.get(row.meal_template_id) : undefined;
    const name = version?.name || template?.name || row.meal_slot.replaceAll("_", " ");
    const ingredients = items.filter((item) => item.planned_meal_id === row.id).map((item) => ({
      id: item.id, name: relatedFood(item.foods)?.name || "Food", quantity: item.serving_size ||
        `${numeric(item.quantity)} ${item.unit || "servings"}`, isProvided: item.is_provided === true,
    }));
    return {
      id: row.id, slot: row.meal_slot, sequence: row.meal_sequence,
      scheduledTime: row.scheduled_time, status: row.status, sourceType: row.source_type,
      name, description: version?.description || template?.description || null,
      whyThisMeal: template?.description || null,
      prepInstructions: version?.prep_instructions || (template ?
        "Serve the listed foods in their planned portions. Add any optional sides separately." : null),
      prepTimeMin: version?.cooking_time_min ?? null,
      imageUrl: resolveV2ImageSnapshot(row.image_url_snapshot, name),
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
