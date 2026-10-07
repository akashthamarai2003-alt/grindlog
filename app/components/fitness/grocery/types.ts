export type ShoppingPeriod = "weekly" | "monthly";

export interface GroceryItemData {
  id: string;
  name: string;
  monthlyQuantity: number;
  unit: string;
  estimatedPrice: number;
  category: string;
  isOptional: boolean;
  reason?: string;
  purchased: boolean;
  // Macro / Serving Details (if provided)
  foodServingSize?: string;
  proteinGrams?: number;
  calories?: number;
  carbsGrams?: number;
  fatGrams?: number;
  usedInMeals?: string[];
}

export interface GroceryBudgetSummary {
  monthlyBudget: number;
  weeklyBudget: number;
  tier: string;
}

import {
  getGroceryCategories,
  normalizeCategoryForDiet,
} from "@/lib/fitness/nutrition/canonical-groceries";

export { getGroceryCategories, normalizeCategoryForDiet };

export const GROCERY_CATEGORIES = [
  "All",
  "Dairy & High-Protein",
  "Grains & Staples",
  "Fresh Produce",
  "Pantry & Healthy Fats",
] as const;

export type GroceryCategoryFilter = string;

export function normalizeGroceryCategory(
  category?: string | null,
  itemName?: string | null,
  dietType?: string | null
): string {
  return normalizeCategoryForDiet(category, itemName, dietType);
}

export function getScaledQuantity(
  monthlyQuantity: number,
  unit: string,
  period: ShoppingPeriod
): { displayQuantity: string; unit: string } {
  if (period === "monthly") {
    const formatted =
      monthlyQuantity % 1 === 0
        ? monthlyQuantity.toString()
        : monthlyQuantity.toFixed(1);
    return { displayQuantity: formatted, unit: unit || "unit" };
  }

  // Weekly: divide monthly by 4
  const weekly = monthlyQuantity / 4;
  const lowerUnit = (unit || "").toLowerCase();

  if (lowerUnit === "kg") {
    if (weekly < 1) {
      const grams = Math.round(weekly * 1000);
      return { displayQuantity: grams.toString(), unit: "g" };
    }
    const roundedKg = Math.round(weekly * 4) / 4;
    return {
      displayQuantity:
        roundedKg % 1 === 0 ? roundedKg.toString() : roundedKg.toFixed(2),
      unit: "kg",
    };
  }

  if (lowerUnit === "liters" || lowerUnit === "liter" || lowerUnit === "l") {
    if (weekly < 1) {
      const ml = Math.round(weekly * 1000);
      return { displayQuantity: ml.toString(), unit: "ml" };
    }
    const roundedL = Math.round(weekly * 2) / 2;
    return {
      displayQuantity:
        roundedL % 1 === 0 ? roundedL.toString() : roundedL.toFixed(1),
      unit: "L",
    };
  }

  if (lowerUnit === "g") {
    const grams = Math.round(weekly);
    return { displayQuantity: grams.toString(), unit: "g" };
  }

  if (lowerUnit === "pieces" || lowerUnit === "piece" || lowerUnit === "eggs") {
    const pieces = Math.max(1, Math.round(weekly));
    return { displayQuantity: pieces.toString(), unit: "pcs" };
  }

  // packs, jars, cartons, boxes, bunch
  const packs = Math.max(1, Math.round(weekly * 10) / 10);
  return {
    displayQuantity: packs % 1 === 0 ? packs.toString() : packs.toFixed(1),
    unit: unit || "pack",
  };
}

export function getScaledPrice(monthlyPrice: number, period: ShoppingPeriod): number {
  if (period === "monthly") return Math.round(monthlyPrice);
  return Math.max(10, Math.round(monthlyPrice / 4));
}
