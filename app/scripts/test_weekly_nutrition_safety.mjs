import assert from "node:assert/strict";
import { test } from "node:test";
import { NutritionValidationEngine } from "../lib/fitness/nutrition/validation-engine.ts";
import { buildNutritionUserContext } from "../lib/fitness/nutrition/user-context.ts";

test("allergen tags catch an ingredient that is absent from the food name", () => {
  const result = NutritionValidationEngine.validateFoodAllergenTags("Poha", ["peanuts"], ["Peanut allergy"]);
  assert.equal(result.valid, false);
});

test("unreviewed foods are excluded when a user has an allergy", () => {
  const result = NutritionValidationEngine.validateFoodAllergenTags("Prepared meal", null, ["dairy"]);
  assert.equal(result.valid, false);
});

test("unsupported allergies require review rather than being silently ignored", () => {
  const result = NutritionValidationEngine.validateFoodAllergenTags("Mixed curry", [], ["Mustard"]);
  assert.equal(result.valid, false);
});

test("broad nut allergy covers both peanuts and tree nuts", () => {
  assert.equal(NutritionValidationEngine.validateFoodAllergenTags("Snack", ["peanuts"], ["nuts"]).valid, false);
  assert.equal(NutritionValidationEngine.validateFoodAllergenTags("Snack", ["tree_nuts"], ["nuts"]).valid, false);
});

test("the nutrition context keeps medical diet needs distinct per user", () => {
  const targets = { calories: 1900, protein: 125, carbs: 200, fat: 60 };
  const basic = { age: 30, height: 170, weight: 70, food_type: "Vegetarian", nutrition_medical_conditions: ["None"] };
  const medical = { ...basic, nutrition_medical_conditions: ["Diabetes"] };
  const basicContext = buildNutritionUserContext(basic, targets, "user-1");
  const medicalContext = buildNutritionUserContext(medical, targets, "user-1");
  assert.deepEqual(basicContext.medicalDietConditions, ["None"]);
  assert.deepEqual(medicalContext.medicalDietConditions, ["Diabetes"]);
  assert.notEqual(basicContext.contextFingerprint, medicalContext.contextFingerprint);
});
