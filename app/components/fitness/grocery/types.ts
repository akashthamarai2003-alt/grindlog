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

export const GROCERY_CATEGORIES = [
  "All",
  "Dairy & High-Protein",
  "Grains & Staples",
  "Fresh Produce",
  "Pantry & Healthy Fats",
] as const;

export type GroceryCategoryFilter = typeof GROCERY_CATEGORIES[number];

export function normalizeGroceryCategory(category: string, itemName?: string): string {
  const cat = (category || "").toLowerCase();
  const name = (itemName || "").toLowerCase();

  // Explicit check for protein-rich foods
  if (
    cat.includes("dairy") ||
    cat.includes("protein") ||
    cat.includes("egg") ||
    cat.includes("chicken") ||
    cat.includes("meat") ||
    cat.includes("fish") ||
    name.includes("paneer") ||
    name.includes("tofu") ||
    name.includes("soya") ||
    name.includes("curd") ||
    name.includes("yogurt") ||
    name.includes("milk") ||
    name.includes("egg") ||
    name.includes("chicken")
  ) {
    return "Dairy & High-Protein";
  }

  // Grains & Staples
  if (
    cat.includes("grain") ||
    cat.includes("carb") ||
    cat.includes("pulse") ||
    cat.includes("breakfast") ||
    name.includes("rice") ||
    name.includes("atta") ||
    name.includes("wheat") ||
    name.includes("oat") ||
    name.includes("dal") ||
    name.includes("dhal") ||
    name.includes("chana") ||
    name.includes("rajma") ||
    name.includes("bread") ||
    name.includes("poha") ||
    name.includes("cheela") ||
    name.includes("roti")
  ) {
    return "Grains & Staples";
  }

  // Fresh Produce
  if (
    cat.includes("veg") ||
    cat.includes("fruit") ||
    cat.includes("produce") ||
    cat.includes("salad") ||
    cat.includes("green") ||
    name.includes("banana") ||
    name.includes("apple") ||
    name.includes("spinach") ||
    name.includes("onion") ||
    name.includes("tomato") ||
    name.includes("cucumber") ||
    name.includes("lemon") ||
    name.includes("broccoli")
  ) {
    return "Fresh Produce";
  }

  // Pantry & Healthy Fats
  if (
    cat.includes("fat") ||
    cat.includes("nut") ||
    cat.includes("seed") ||
    cat.includes("oil") ||
    cat.includes("snack") ||
    cat.includes("spice") ||
    name.includes("peanut") ||
    name.includes("almond") ||
    name.includes("chia") ||
    name.includes("flax") ||
    name.includes("oil") ||
    name.includes("ghee") ||
    name.includes("butter")
  ) {
    return "Pantry & Healthy Fats";
  }

  return "Pantry & Healthy Fats";
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

  if (lowerUnit === "pieces" || lowerUnit === "piece" || lowerUnit === "eggs") {
    const pieces = Math.max(1, Math.round(weekly));
    return { displayQuantity: pieces.toString(), unit: "pcs" };
  }

  // packs, jars, cartons, boxes
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
