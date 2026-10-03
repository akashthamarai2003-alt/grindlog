export interface GroceryPlanItem {
  planned_meal_id?: string | null;
  portion_type?: string | null;
  unit?: string | null;
  quantity: number | string;
  serving_size?: string | null;
  is_provided?: boolean | null;
  planned_meals?: { meal_slot: string } | null;
  foods?: {
    name: string;
    serving_weight_g?: number | null;
    serving_unit?: string | null;
    estimated_cost?: number | null;
    category?: string | null;
    serving_size?: string | null;
    protein?: number | null;
    calories?: number | null;
  } | null;
}

/** V2 persists projection rows for old readers as well as detailed ingredient rows. */
export function selectGroceryPlanItems<T extends GroceryPlanItem>(items: T[]): T[] {
  return items.some((item) => item.planned_meal_id != null)
    ? items.filter((item) => item.planned_meal_id != null)
    : items;
}

export function groceryPortionAmount(item: GroceryPlanItem, servingWeightG: number) {
  const quantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("INVALID_GROCERY_PORTION");
  }
  const weight = Number.isFinite(servingWeightG) && servingWeightG > 0 ? servingWeightG : 100;
  if (item.portion_type === "CONTINUOUS" && (item.unit === "g" || item.unit === "ml")) {
    return { grams: quantity, units: quantity / weight };
  }
  return { grams: weight * quantity, units: quantity };
}
