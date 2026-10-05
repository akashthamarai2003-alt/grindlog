// Local planner-generated presentation fixtures. No database or account changes.
import fs from "node:fs";
import assert from "node:assert/strict";
import { generateUnified7DayPlan, loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { getFoodSvgAvatar } from "../lib/utils/food-images.ts";

const base = { userId: "local-image-persona", gender: "male", age: 26, heightCm: 172,
  weightKg: 65, goal: "maintenance", fitnessLevel: "beginner", activityLevel: "moderate",
  mealsPerDay: 3, monthlyBudgetInr: 9000, weeklyBudgetTargetInr: 2100, budgetPolicy: "STRICT",
  allergies: [], dislikedFoods: [], avoidedFoods: [], availableEquipment: ["stove"],
  messAvailable: false, messMeals: [], messIncludedInBudget: false, availableFoods: [],
  workoutTime: "18:00:00", wakeTime: "07:00:00", sleepTime: "23:00:00", timezone: "Asia/Kolkata" };
const personas = [
  // Existing passing Phase 3 athlete persona; retain its dairy restrictions.
  { key: "nonveg-cook", dietPreference: "non-veg", foodEnvironment: "I Cook", age: 24,
    heightCm: 182, weightKg: 82, goal: "muscle gain", activityLevel: "athlete", fitnessLevel: "advanced",
    mealsPerDay: 4, monthlyBudgetInr: 12000, weeklyBudgetTargetInr: 3000, budgetPolicy: "FLEXIBLE",
    allergies: ["milk"], avoidedFoods: ["paneer", "ghee", "curd", "yogurt", "milk", "cheese", "whey"] },
  { key: "vegetarian-home", dietPreference: "vegetarian", foodEnvironment: "Home" },
  { key: "eggetarian-pg", dietPreference: "eggetarian", foodEnvironment: "PG", messAvailable: true, availableEquipment: ["kettle"] },
  { key: "vegan-hostel", dietPreference: "vegan", foodEnvironment: "Hostel", allergies: ["milk", "egg"], messAvailable: true, availableEquipment: ["kettle"] },
  { key: "office-canteen", dietPreference: "non-veg", foodEnvironment: "Office/Canteen", messAvailable: true, availableEquipment: [] },
  { key: "low-budget", dietPreference: "vegetarian", foodEnvironment: "Hostel", messAvailable: true,
    availableEquipment: ["kettle"], monthlyBudgetInr: 3000, weeklyBudgetTargetInr: 700 },
];
const catalog = loadNutritionCatalog();
const recipes = new Map(catalog.recipes.map((recipe) => [recipe.recipeVersion.id, recipe]));
const result = [];
for (const persona of personas) {
  const profile = { ...base, ...persona, userId: `local-image-persona-${persona.key}`,
    messMeals: persona.messAvailable ? ["breakfast", "lunch", "dinner"] : [],
    messIncludedInBudget: Boolean(persona.messAvailable) };
  const plan = generateUnified7DayPlan(profile, "2026-10-05");
  assert.equal(plan.dailySummaries.length, 7);
  assert.equal(plan.plannedMeals.length, 7 * profile.mealsPerDay);
  assert.equal(plan.metrics.hardConstraintPass, true, `${persona.key}: planner validator failed`);
  // Scope is image rendering of actual planner output, not a fresh nutrition acceptance gate.
  const days = plan.dailySummaries.map((summary) => ({
    date: summary.date, today: "2026-10-05", timezone: "Asia/Kolkata", planId: plan.planId,
    consumed: { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 },
    targets: { ...plan.dailyTargets, water_ml: 2500 }, logs: [],
    meals: plan.plannedMeals.filter((meal) => meal.localDate === summary.date).map((meal) => {
      const recipe = recipes.get(meal.recipeVersionId);
      const name = recipe?.recipeVersion.name || `${persona.foodEnvironment} ${meal.mealSlot} plate`;
      if (meal.imageAssetId) assert.equal(recipe?.image.status, "APPROVED");
      if (recipe?.image.status !== "APPROVED") {
        assert.equal(meal.imageAssetId, null);
        assert.equal(meal.imageStoragePathSnapshot, null);
        if (recipe) assert.equal(meal.imageUrlSnapshot, null);
      }
      const url = meal.imageUrlSnapshot;
      return { id: meal.id, slot: meal.mealSlot, sequence: meal.mealSequence,
        scheduledTime: meal.scheduledTime, status: meal.status, sourceType: meal.sourceType,
        name, description: recipe?.recipeVersion.description || null,
        whyThisMeal: null, prepInstructions: recipe?.recipeVersion.prepInstructions || null,
        prepTimeMin: recipe?.recipeVersion.cookingTimeMin || null,
        imageUrl: url && !url.startsWith("https://images.grindlog.in/") ? url : getFoodSvgAvatar(name),
        calories: meal.caloriesSnapshot, protein: meal.proteinSnapshot, carbs: meal.carbsSnapshot,
        fat: meal.fatSnapshot, cost: meal.costSnapshot,
        ingredients: (meal.items || []).map((item) => ({ id: item.id, name: item.foodName,
          quantity: `${item.quantity} ${item.unit}`, isProvided: item.isProvided })), logs: [] };
    }),
  }));
  result.push({ key: persona.key, profile, metrics: plan.metrics, days });
  console.log(JSON.stringify({ persona: persona.key, days: days.length, meals: plan.plannedMeals.length,
    realImages: days.flatMap((day) => day.meals).filter((meal) => meal.imageUrl.startsWith("https://")).length,
    hardConstraintPass: plan.metrics.hardConstraintPass }));
}
fs.writeFileSync("artifacts/phase5b/persona-plans.json", JSON.stringify(result, null, 2) + "\n");
