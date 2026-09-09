import type {
  AssembledMeal,
  GroceryListItem,
  ParsedBudget,
  FoodItem,
} from "./types";
import {
  getRetailUnit,
  parseServingGrams,
} from "./constants";

export function calculateGroceryList(
  meals: AssembledMeal[],
  budget: ParsedBudget,
  environment: string,
): GroceryListItem[] {
  if (!meals || meals.length === 0) return [];

  // Group by food name to combine same foods used across multiple meals
  const foodGroups = new Map<
    string,
    { food: FoodItem; dailyServings: number; usedInMeals: Set<string> }
  >();

  for (const meal of meals) {
    for (const item of meal.items) {
      if (item.isProvidedMeal) continue;

      const key = item.food.name;
      if (!foodGroups.has(key)) {
        foodGroups.set(key, {
          food: item.food,
          dailyServings: 0,
          usedInMeals: new Set<string>(),
        });
      }

      const group = foodGroups.get(key)!;
      group.dailyServings += item.servings;
      group.usedInMeals.add(meal.slot.name);
    }
  }

  const groceryList: GroceryListItem[] = [];

  for (const group of foodGroups.values()) {
    const { food, dailyServings, usedInMeals } = group;

    const dailyGrams = parseServingGrams(food.serving_size) * dailyServings;
    const monthlyGrams = dailyGrams * 30;

    const retailUnit = getRetailUnit(food.name, food.category);

    let monthlyQuantity = Math.ceil(monthlyGrams / retailUnit.gramsPerUnit);
    monthlyQuantity = Math.max(monthlyQuantity, retailUnit.minPurchase);

    // Round to practical retail sizes
    if (retailUnit.unit === "kg" || retailUnit.unit === "liters") {
      monthlyQuantity = Math.ceil(monthlyQuantity * 2) / 2; // nearest 0.5
    } else if (retailUnit.unit === "pieces") {
      monthlyQuantity = Math.ceil(monthlyQuantity / 6) * 6; // nearest half-dozen
    } else if (retailUnit.unit === "packs" || retailUnit.unit === "jars" || retailUnit.unit === "cartons") {
      monthlyQuantity = Math.ceil(monthlyQuantity); // nearest integer
    }

    const pricePerGram = food.estimated_cost / parseServingGrams(food.serving_size);
    let monthlyPrice = pricePerGram * monthlyGrams;
    monthlyPrice = Math.round(monthlyPrice / 10) * 10;

    const usedInMealsArray = Array.from(usedInMeals);
    const isCoreMeal = usedInMealsArray.some((m) =>
      ["Breakfast", "Lunch", "Dinner"].includes(m)
    );
    const isOptional = !isCoreMeal;

    const reason = `${food.protein}g protein per ${
      food.serving_size
    } — used in ${usedInMealsArray.join(", ")}`;

    groceryList.push({
      name: food.name,
      food,
      dailyServings,
      dailyGrams,
      monthlyQuantity,
      unit: retailUnit.unit,
      estimatedPrice: monthlyPrice,
      category: food.category,
      isOptional,
      reason,
      usedInMeals: usedInMealsArray,
      proteinPerServing: food.protein,
      caloriesPerServing: food.calories,
    });
  }

  return groceryList;
}

export function optimizeBudget(
  grocery: GroceryListItem[],
  budget: ParsedBudget,
): GroceryListItem[] {
  if (!grocery || grocery.length === 0) return [];
  if (budget.isOpenEnded || budget.max <= 0) return grocery;

  let totalCost = grocery.reduce((sum, item) => sum + item.estimatedPrice, 0);

  if (totalCost > budget.max) {
    // 1. Sort by protein-per-rupee ratio (ascending — least efficient first)
    const items = [...grocery].map((item) => {
      const monthlyProtein = item.dailyServings * item.proteinPerServing * 30;
      const efficiency =
        item.estimatedPrice > 0 ? monthlyProtein / item.estimatedPrice : 0;
      return { ...item, _efficiency: efficiency };
    });

    items.sort((a, b) => a._efficiency - b._efficiency);

    // 2. Remove optional items first
    let i = 0;
    while (totalCost > budget.max && i < items.length) {
      if (items[i].isOptional) {
        totalCost -= items[i].estimatedPrice;
        items.splice(i, 1);
      } else {
        i++;
      }
    }

    // 3. Reduce quantities of least efficient items by 25%
    if (totalCost > budget.max) {
      for (let j = 0; j < items.length; j++) {
        if (totalCost <= budget.max) break;
        const reduction = items[j].estimatedPrice * 0.25;
        items[j].estimatedPrice -= reduction;
        items[j].monthlyQuantity *= 0.75;
        items[j].dailyGrams *= 0.75;
        items[j].dailyServings *= 0.75;
        totalCost -= reduction;
      }
    }

    // 4. Swap expensive proteins
    if (totalCost > budget.max) {
      for (let j = 0; j < items.length; j++) {
        if (totalCost <= budget.max) break;

        const name = items[j].name.toLowerCase();
        let savings = 0;
        let newName = "";

        if (name.includes("chicken")) {
          savings = 600;
          newName = "Soya Chunks";
        } else if (name.includes("paneer")) {
          savings = 200;
          newName = "Tofu";
        } else if (name.includes("fish")) {
          savings = 400;
          newName = "Eggs";
        } else if (name.includes("greek yogurt")) {
          savings = 300;
          newName = "Regular Curd";
        }

        if (savings > 0) {
          totalCost -= savings;
          items[j].name = newName;
          items[j].estimatedPrice = Math.max(
            0,
            items[j].estimatedPrice - savings
          );
          items[j].reason += " (Swapped to fit budget)";
        }
      }
    }

    // 5. Hard ceiling guarantee: proportionally scale all items down if still exceeding budget
    if (totalCost > budget.max && totalCost > 0) {
      const scaleFactor = (budget.max * 0.95) / totalCost;
      for (const item of items) {
        item.estimatedPrice = Math.round((item.estimatedPrice * scaleFactor) / 10) * 10;
        item.dailyServings = Number((item.dailyServings * scaleFactor).toFixed(2));
        item.dailyGrams = Math.round(item.dailyGrams * scaleFactor);
        item.monthlyQuantity = Number((item.monthlyQuantity * scaleFactor).toFixed(1));

        // Re-align with packaging minimums
        if (item.unit === "kg" || item.unit === "liters") {
          item.monthlyQuantity = Math.max(0.5, Math.ceil(item.monthlyQuantity * 2) / 2);
        } else if (item.unit === "pieces") {
          item.monthlyQuantity = Math.max(6, Math.ceil(item.monthlyQuantity / 6) * 6);
        } else if (item.unit === "packs" || item.unit === "jars" || item.unit === "cartons") {
          item.monthlyQuantity = Math.max(1, Math.ceil(item.monthlyQuantity));
        }

        if (!item.reason.includes("Optimized")) {
          item.reason += ` (Portion adjusted to fit ₹${budget.max} budget)`;
        }
      }

      totalCost = items.reduce((s, it) => s + it.estimatedPrice, 0);

      // Final strict trim if any packaging rounding slightly exceeded budget.max
      if (totalCost > budget.max && items.length > 0) {
        const excess = totalCost - budget.max;
        const highestPriced = items.reduce((max, it) => it.estimatedPrice > max.estimatedPrice ? it : max, items[0]);
        highestPriced.estimatedPrice = Math.max(0, highestPriced.estimatedPrice - excess);
      }
    }

    // Clean up temporary property and guarantee rounded prices
    return items.map((item) => {
      const { _efficiency, ...rest } = item as any;
      return {
        ...rest,
        estimatedPrice: Math.round(rest.estimatedPrice),
      };
    });
  }

  // Under budget (< 60% utilization) and budget >= 2000
  if (totalCost < budget.max * 0.6 && budget.max >= 2000) {
    const items = [...grocery];
    for (const item of items) {
      const name = item.name.toLowerCase();
      if (name.includes("rice") && !name.includes("brown")) {
        item.reason += " (Tip: Upgrade to brown rice for better fiber)";
      }
    }
    if (items.length > 0) {
      items[0].reason +=
        " (Tip: Add mixed nuts/seeds or fruits for micronutrients and fiber)";
    }
    return items;
  }

  return grocery;
}

export function getGrocerySummary(
  grocery: GroceryListItem[],
  budget: ParsedBudget,
): {
  totalCost: number;
  budgetUtilization: number;
  itemCount: number;
  proteinItems: number;
  isOverBudget: boolean;
  savingsTips: string[];
} {
  const totalCost = grocery.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const budgetUtilization = budget.max > 0 ? totalCost / budget.max : 0;
  const isOverBudget =
    budget.max > 0 && totalCost > budget.max && !budget.isOpenEnded;

  const proteinItems = grocery.filter(
    (i) =>
      i.category.toLowerCase().includes("protein") || i.proteinPerServing >= 10
  ).length;

  const savingsTips: string[] = [];
  if (isOverBudget) {
    savingsTips.push("Swap Chicken for Soya Chunks to save ~₹600/month.");
    savingsTips.push("Replace Paneer with Tofu to save ~₹200/month.");
    savingsTips.push("Swap Greek Yogurt for regular Curd to save ~₹300/month.");
  }

  return {
    totalCost,
    budgetUtilization,
    itemCount: grocery.length,
    proteinItems,
    isOverBudget,
    savingsTips,
  };
}
