import assert from "node:assert/strict";
import test from "node:test";
import { selectGroceryPlanItems, groceryPortionAmount } from "../lib/services/nutrition/v2-grocery-items.ts";
import { createLiveFoodIdResolver } from "../lib/services/nutrition/live-food-id.ts";
import { selectDisplayPlanItems } from "../lib/services/nutrition/v2-display-items.ts";

test("V2 grocery rows prefer authoritative details over compatibility projections", () => {
  const items = [
    { planned_meal_id: null, quantity: 1, food_id: "food-a" },
    { planned_meal_id: "meal-1", quantity: 150, food_id: "food-a" },
    { planned_meal_id: "meal-1", quantity: 2, food_id: "food-b" },
  ];
  assert.deepEqual(selectGroceryPlanItems(items).map((item) => item.quantity), [150, 2]);
  assert.deepEqual(selectGroceryPlanItems(items.slice(0, 1)), items.slice(0, 1));
});

test("V2 grocery quantities use grams for continuous portions and pieces for discrete portions", () => {
  assert.deepEqual(groceryPortionAmount({ quantity: 150, portion_type: "CONTINUOUS", unit: "g" }, 100),
    { grams: 150, units: 1.5 });
  assert.deepEqual(groceryPortionAmount({ quantity: 2, portion_type: "DISCRETE", unit: "piece" }, 60),
    { grams: 120, units: 2 });
  assert.throws(() => groceryPortionAmount({ quantity: 0 }, 100), /INVALID_GROCERY_PORTION/);
});

test("catalog food IDs resolve to the live UUID by canonical name", () => {
  const resolve = createLiveFoodIdResolver(
    [{ id: "live-id", name: "  White Rice (Steamed) " }],
    new Map([["offline-id", { name: "white rice (steamed)" }]])
  );
  assert.equal(resolve("offline-id"), "live-id");
  assert.throws(() => resolve("unknown-id"), /FOOD_NOT_FOUND/);
  assert.throws(() => createLiveFoodIdResolver(
    [{ id: "a", name: "Rice" }, { id: "b", name: "rice" }], new Map()), /AMBIGUOUS_LIVE_FOOD/);
});

test("Day 1 display uses projection rows and swap details once each", () => {
  const rows = [
    { planned_meal_id: null, serving_size: "breakfast::Oats::1 bowl", quantity: 1,
      foods: { name: "Oats", calories: 200 } },
    { planned_meal_id: "breakfast-id", planned_meals: { meal_slot: "breakfast" },
      serving_size: "150 g", quantity: 150, calories_snapshot: 200,
      foods: { name: "Oats", calories: 100 } },
    { planned_meal_id: "lunch-id", planned_meals: { meal_slot: "lunch" },
      serving_size: "lunch::Paneer Meal::75 g", quantity: 75, calories_snapshot: 180,
      foods: { name: "Paneer", calories: 120 } },
  ];
  const visible = selectDisplayPlanItems(rows);
  assert.equal(visible.length, 2);
  assert.equal(visible[0].foods.calories, 200);
  assert.equal(visible[1].quantity, 1);
  assert.equal(visible[1].foods.calories, 180);
  assert.equal(visible[1].serving_size, "lunch::Paneer Meal::75 g");
});
