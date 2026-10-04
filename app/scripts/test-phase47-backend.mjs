import assert from "node:assert/strict";
import test from "node:test";
import { selectGroceryPlanItems, groceryPortionAmount } from "../lib/services/nutrition/v2-grocery-items.ts";
import { createLiveFoodIdResolver } from "../lib/services/nutrition/live-food-id.ts";
import { persistedV2MealSlots, selectDisplayPlanItems } from "../lib/services/nutrition/v2-display-items.ts";
import { V2PlanService, resolveV2ImageSnapshot } from "../lib/services/nutrition/v2-plan-service.ts";

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

test("Day 1 display uses frozen details before and after swaps, preserving titles", () => {
  const rows = [
    { planned_meal_id: null, serving_size: "breakfast::Oats::1 bowl", quantity: 1,
      foods: { name: "Oats", calories: 200 } },
    { planned_meal_id: "breakfast-id", planned_meals: { meal_slot: "breakfast", calories_snapshot: 298 },
      serving_size: "150 g", quantity: 150, calories_snapshot: 300, cost_snapshot: 0,
      foods: { name: "Oats", calories: 100 } },
    { planned_meal_id: "lunch-id", planned_meals: { meal_slot: "lunch" },
      serving_size: "lunch::Paneer Meal::75 g", quantity: 75, calories_snapshot: 180,
      foods: { name: "Paneer", calories: 120 } },
  ];
  const visible = selectDisplayPlanItems(rows);
  assert.equal(visible.length, 2);
  assert.equal(visible[0].foods.calories, 300);
  assert.equal(visible[0].quantity, 1);
  assert.equal(visible[0].foods.estimated_cost, 0);
  assert.equal(visible[0].serving_size, "breakfast::Oats::150 g");
  assert.equal(visible[0].planned_meals.calories_snapshot, 298);
  assert.equal(visible[1].quantity, 1);
  assert.equal(visible[1].foods.calories, 180);
  assert.equal(visible[1].serving_size, "lunch::Paneer Meal::75 g");
});

test("V2 reload preserves persisted snack and meal sequence instead of legacy workout slots", () => {
  const rows = [
    { planned_meal_id: "snack-id", quantity: 40,
      planned_meals: { meal_slot: "snack", meal_sequence: 3 } },
    { planned_meal_id: "breakfast-id", quantity: 100,
      planned_meals: { meal_slot: "breakfast", meal_sequence: 1 } },
    { planned_meal_id: "dinner-id", quantity: 150,
      planned_meals: { meal_slot: "dinner", meal_sequence: 4 } },
    { planned_meal_id: "lunch-id", quantity: 200,
      planned_meals: { meal_slot: "lunch", meal_sequence: 2 } },
    { planned_meal_id: "lunch-id", quantity: 50,
      planned_meals: { meal_slot: "lunch", meal_sequence: 2 } },
  ];
  assert.deepEqual(persistedV2MealSlots(rows), ["breakfast", "lunch", "snack", "dinner"]);
  assert.deepEqual(persistedV2MealSlots([{ quantity: 1, serving_size: "lunch::Legacy::1 bowl" }]), []);
});

test("legacy display rows stay unchanged when no V2 details exist", () => {
  const rows = [{ quantity: 2, serving_size: "lunch::Legacy::1 bowl", foods: { calories: 120 } }];
  assert.deepEqual(selectDisplayPlanItems(rows), rows);
});

test("V2 budget mapping uses established tiers and preserves exact custom budgets", () => {
  for (const [input, monthly, weekly, policy] of [
    ["₹0–1,000", 1000, 250, "STRICT"],
    ["₹1,000–2,000", 2000, 500, "STRICT"],
    ["₹2,000–5,000", 4500, 1125, "FLEXIBLE"],
    ["2000-5000", 4500, 1125, "FLEXIBLE"],
    ["₹5,000+", 7500, 1875, "FLEXIBLE"],
    ["₹1,500", 1500, 375, "STRICT"],
    ["₹2,000–3,000", 3000, 750, "FLEXIBLE"],
    [6000, 6000, 1500, "FLEXIBLE"],
    [null, 4500, 1125, "FLEXIBLE"],
  ]) {
    const mapped = V2PlanService.mapProfileToV2Context({ nutrition_budget: input });
    assert.deepEqual([mapped.monthlyBudgetInr, mapped.weeklyBudgetTargetInr, mapped.budgetPolicy],
      [monthly, weekly, policy]);
  }
});

test("missing catalog assets use the existing offline image badge", () => {
  const fallback = resolveV2ImageSnapshot("https://images.grindlog.in/recipes/missing.webp", "Moong Dal Cheela");
  assert.match(fallback, /^data:image\/svg\+xml;utf8,/);
  assert.equal(resolveV2ImageSnapshot("https://cdn.example.test/approved.webp", "Approved"),
    "https://cdn.example.test/approved.webp");
});
