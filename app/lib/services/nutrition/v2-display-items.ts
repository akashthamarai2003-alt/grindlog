interface DisplayPlanItem {
  planned_meal_id?: string | null;
  planned_meals?: { meal_slot: string } | null;
  serving_size?: string | null;
  quantity: number | string;
  calories_snapshot?: number | null;
  protein_snapshot?: number | null;
  carbs_snapshot?: number | null;
  fat_snapshot?: number | null;
  cost_snapshot?: number | null;
  foods?: Record<string, unknown> | null;
}

/** Keep legacy projection rows; use detailed rows only where a swap removed a projection. */
export function selectDisplayPlanItems<T extends DisplayPlanItem>(items: T[]): T[] {
  const projectedSlots = new Set(items
    .filter((item) => item.planned_meal_id == null)
    .map((item) => String(item.serving_size || "").split("::")[0])
    .filter(Boolean));

  return items.flatMap((item) => {
    if (item.planned_meal_id == null) return [item];
    const slot = item.planned_meals?.meal_slot ||
      (String(item.serving_size || "").includes("::")
        ? String(item.serving_size).split("::")[0] : "");
    if (!slot || projectedSlots.has(slot)) return [];
    const rawServing = String(item.serving_size || "1 serving");
    const servingSize = rawServing.includes("::")
      ? rawServing : `${slot}::${slot[0].toUpperCase()}${slot.slice(1)} Meal::${rawServing}`;
    // Legacy summary multiplies per-serving food macros by quantity. Detailed V2
    // rows already carry frozen totals for their whole portion (including grams).
    return [{
      ...item,
      quantity: 1,
      serving_size: servingSize,
      foods: item.foods ? {
        ...item.foods,
        calories: item.calories_snapshot ?? item.foods.calories,
        protein: item.protein_snapshot ?? item.foods.protein,
        carbs: item.carbs_snapshot ?? item.foods.carbs,
        fat: item.fat_snapshot ?? item.foods.fat,
        estimated_cost: item.cost_snapshot ?? item.foods.estimated_cost,
      } : item.foods,
    } as T];
  });
}
