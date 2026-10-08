import test from "node:test";
import assert from "node:assert/strict";
import { parseCompositeServing, cleanServing, cleanFoodName } from "../lib/fitness/nutrition/portion-parser.ts";

test("parseCompositeServing: handles 3-part format (slot::title::portion)", () => {
  const result = parseCompositeServing("breakfast::Mixed Vegetable Sabzi with Phulkas & Moong Sprouts::200g");
  assert.deepEqual(result, {
    slot: "breakfast",
    title: "Mixed Vegetable Sabzi with Phulkas & Moong Sprouts",
    portion: "200g",
  });
});

test("parseCompositeServing: handles optb format (slot::optb::title::portion)", () => {
  const result = parseCompositeServing("breakfast::optb::Moong Sprouts Salad::150g");
  assert.deepEqual(result, {
    slot: "breakfast",
    title: "Moong Sprouts Salad",
    portion: "150g",
  });
});

test("parseCompositeServing: handles 2-part format with slot (slot::portion)", () => {
  const result = parseCompositeServing("breakfast::200g");
  assert.deepEqual(result, {
    slot: "breakfast",
    portion: "200g",
  });
});

test("parseCompositeServing: handles discrete portions (1 piece, 3 pieces)", () => {
  const result = parseCompositeServing("breakfast::Mixed Veg::1 piece");
  assert.deepEqual(result, {
    slot: "breakfast",
    title: "Mixed Veg",
    portion: "1 piece",
  });
});

test("parseCompositeServing: handles plain portions without colons", () => {
  assert.deepEqual(parseCompositeServing("200g"), { portion: "200g" });
  assert.deepEqual(parseCompositeServing("100 g"), { portion: "100 g" });
  assert.deepEqual(parseCompositeServing("3 rotis"), { portion: "3 rotis" });
  assert.deepEqual(parseCompositeServing(""), { portion: "1 serving" });
  assert.deepEqual(parseCompositeServing(null), { portion: "1 serving" });
  assert.deepEqual(parseCompositeServing(undefined), { portion: "1 serving" });
});

test("cleanServing: extracts only portion", () => {
  assert.equal(cleanServing("breakfast::Mixed Vegetable Sabzi with Phulkas & Moong Sprouts::200g"), "200g");
  assert.equal(cleanServing("breakfast::optb::Moong Sprouts Salad::150g"), "150g");
  assert.equal(cleanServing("breakfast::200g"), "200g");
  assert.equal(cleanServing("200g"), "200g");
  assert.equal(cleanServing("1 piece"), "1 piece");
  assert.equal(cleanServing(null), "");
  assert.equal(cleanServing(""), "");
});

test("cleanFoodName: cleans prefixes and handles composite strings", () => {
  assert.equal(cleanFoodName("Mixed Vegetable Sabzi"), "Mixed Vegetable Sabzi");
  assert.equal(cleanFoodName("breakfast::Mixed Vegetable Sabzi"), "Mixed Vegetable Sabzi");
  assert.equal(cleanFoodName("lunch::optb::Paneer Bhurji"), "Paneer Bhurji");
  assert.equal(cleanFoodName("breakfast::Mixed Vegetable Sabzi with Phulkas & Moong Sprouts::200g"), "Mixed Vegetable Sabzi with Phulkas & Moong Sprouts");
  assert.equal(cleanFoodName("breakfast: Mixed Vegetable Sabzi"), "Mixed Vegetable Sabzi");
  assert.equal(cleanFoodName("snack - Almonds"), "Almonds");
  assert.equal(cleanFoodName(null, "Food"), "Food");
  assert.equal(cleanFoodName("", "Actual food"), "Actual food");
});
