import { test, expect } from "@playwright/test";
import { calibrateMealsToTargets } from "../lib/services/nutrition/nutrition-service";

test.describe("Nutrition Engine Calibration & Portion Sanity Unit/Integration", () => {
  const baseVegetarianProfile = {
    user_id: "test-veg-user",
    diet_preference: "Vegetarian",
    food_type: "Vegetarian",
    food_environment: "Home",
  };

  test("CRITICAL: Curd portion never explodes to 6.5 bowls even under large protein deficits", () => {
    // Uncalibrated meals with a low protein count
    const initialMeals = [
      {
        id: "m-breakfast",
        meal_type: "breakfast",
        name: "Besan Cheela with Curd",
        calories: 320,
        protein: 14,
        carbs: 45,
        fat: 8,
        estimated_cost: 25,
        meal_plan_items: [
          {
            id: "i-cheela",
            quantity: 1,
            calories: 210,
            protein: 8.5,
            carbs: 38.5,
            fat: 2,
            foods: {
              name: "Besan / Gram Flour Cheela",
              calories: 210,
              protein: 8.5,
              carbs: 38.5,
              fat: 2,
              estimated_cost: 15,
            },
          },
          {
            id: "i-curd",
            quantity: 1,
            calories: 110,
            protein: 5.5,
            carbs: 6.5,
            fat: 6,
            foods: {
              name: "Curd / Dahi (Plain)",
              calories: 110,
              protein: 5.5,
              carbs: 6.5,
              fat: 6,
              estimated_cost: 10,
            },
          },
        ],
      },
      {
        id: "m-lunch",
        meal_type: "lunch",
        name: "Dal Tadka with Rice",
        calories: 450,
        protein: 15,
        carbs: 70,
        fat: 10,
        estimated_cost: 30,
        meal_plan_items: [
          {
            id: "i-dal",
            quantity: 1,
            calories: 200,
            protein: 11,
            carbs: 30,
            fat: 4,
            foods: {
              name: "Yellow Dal Tadka",
              calories: 200,
              protein: 11,
              carbs: 30,
              fat: 4,
              estimated_cost: 15,
            },
          },
          {
            id: "i-rice",
            quantity: 1,
            calories: 250,
            protein: 4,
            carbs: 40,
            fat: 6,
            foods: {
              name: "Steamed Rice",
              calories: 250,
              protein: 4,
              carbs: 40,
              fat: 6,
              estimated_cost: 15,
            },
          },
        ],
      },
    ];

    // High protein target: 130g protein, 1800 calories
    const targets = {
      calories: 1800,
      protein: 130,
      carbs: 220,
      fat: 50,
    };

    const calibrated = calibrateMealsToTargets(initialMeals, targets, baseVegetarianProfile);

    // Find breakfast meal
    const breakfast = calibrated.find((m: any) => m.meal_type === "breakfast");
    expect(breakfast).toBeDefined();

    // Check Curd quantity
    const curdItem = (breakfast.meal_plan_items || []).find((it: any) =>
      (it.foods?.name || it.name || "").toLowerCase().includes("curd")
    );

    expect(curdItem).toBeDefined();
    // Curd quantity MUST be <= 1.0 bowl (NEVER 6.5 bowls!)
    expect(curdItem.quantity).toBeLessThanOrEqual(1.0);
    expect(curdItem.calories).toBeLessThanOrEqual(120);
    expect(curdItem.fat).toBeLessThanOrEqual(7);

    // Verify breakfast total calories is not artificially inflated to 1000+
    expect(breakfast.calories).toBeLessThan(750);
  });

  test("Universal Portion Sanity: Enforces strict limits across Indian staples", () => {
    const rawMeals = [
      {
        meal_type: "lunch",
        name: "High Protein Feast",
        meal_plan_items: [
          { quantity: 4, foods: { name: "Curd / Dahi (Plain)", calories: 110, protein: 5.5, carbs: 6.5, fat: 6 } },
          { quantity: 3, foods: { name: "Soya Chunks Curry", calories: 180, protein: 26, carbs: 12, fat: 1 } },
          { quantity: 4, foods: { name: "Multigrain Roti", calories: 100, protein: 3, carbs: 20, fat: 1 } },
          { quantity: 3, foods: { name: "Steamed White Rice", calories: 200, protein: 4, carbs: 44, fat: 0.5 } },
          { quantity: 4, foods: { name: "Whole Boiled Egg", calories: 75, protein: 6, carbs: 0.5, fat: 5 } },
        ],
      },
    ];

    const targets = { calories: 2200, protein: 140, carbs: 250, fat: 65 };
    const calibrated = calibrateMealsToTargets(rawMeals, targets, { food_type: "Eggetarian" });

    const items = calibrated[0].meal_plan_items;
    const findItem = (name: string) => items.find((x: any) => (x.foods?.name || "").toLowerCase().includes(name));

    // Curd max 1.0 bowl
    expect(findItem("curd").quantity).toBeLessThanOrEqual(1.0);
    // Soya chunks max 1.0 bowl
    expect(findItem("soya").quantity).toBeLessThanOrEqual(1.0);
    // Roti max 3 chapatis
    expect(findItem("roti").quantity).toBeLessThanOrEqual(3.0);
    // Rice max 2 bowls
    expect(findItem("rice").quantity).toBeLessThanOrEqual(2.0);
    // Whole eggs max 2
    expect(findItem("whole boiled egg").quantity).toBeLessThanOrEqual(2.0);
  });

  test("Macro consistency: Sum of item macros equals total meal macros", () => {
    const rawMeals = [
      {
        meal_type: "dinner",
        name: "Paneer & Phulka",
        meal_plan_items: [
          { quantity: 1, foods: { name: "Paneer Bhurji", calories: 220, protein: 12, carbs: 3, fat: 18, estimated_cost: 35 } },
          { quantity: 2, foods: { name: "Phulka / Roti", calories: 80, protein: 3, carbs: 16, fat: 0.5, estimated_cost: 5 } },
        ],
      },
    ];

    const targets = { calories: 1900, protein: 120, carbs: 220, fat: 55 };
    const calibrated = calibrateMealsToTargets(rawMeals, targets, baseVegetarianProfile);
    const dinner = calibrated[0];

    const sumCalories = dinner.meal_plan_items.reduce((acc: number, it: any) => acc + (it.calories || 0), 0);
    const sumProtein = Number(dinner.meal_plan_items.reduce((acc: number, it: any) => acc + (it.protein || 0), 0).toFixed(1));

    expect(Math.abs(dinner.calories - sumCalories)).toBeLessThanOrEqual(2);
    expect(Math.abs(dinner.protein - sumProtein)).toBeLessThanOrEqual(1);
  });
});
