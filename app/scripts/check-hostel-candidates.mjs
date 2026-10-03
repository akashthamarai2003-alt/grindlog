import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { generateMealCandidates } from "../lib/fitness/nutrition/candidate-generator.ts";

const catalog = loadNutritionCatalog();
const foodAllergensLookup = (foodId) => catalog.foodById.get(foodId)?.allergens || [];

const hostelProfile = {
  userId: "test-user-hostel",
  gender: "male",
  age: 20,
  heightCm: 172,
  weightKg: 65,
  goal: "maintenance",
  fitnessLevel: "beginner",
  activityLevel: "moderate",
  dietPreference: "vegetarian",
  foodEnvironment: "Hostel",
  mealsPerDay: 4,
  monthlyBudgetInr: 4500,
  weeklyBudgetTargetInr: 1100,
  budgetPolicy: "STRICT",
  allergies: [],
  dislikedFoods: [],
  avoidedFoods: [],
  availableEquipment: ["kettle"],
  messAvailable: true,
  messMeals: ["lunch", "dinner"],
  messIncludedInBudget: true,
  availableFoods: [],
  workoutTime: "19:00:00",
  wakeTime: "07:30:00",
  sleepTime: "00:00:00",
  timezone: "Asia/Kolkata"
};

console.log("Breakfast candidates count:");
const bkCandidates = generateMealCandidates(hostelProfile, "breakfast", 632, 29, catalog.recipes, foodAllergensLookup);
console.log("Count:", bkCandidates.length);
for (const c of bkCandidates) {
  console.log(" -", c.catalogItem.recipeVersion.name, "| cal:", c.selectedVariant.targetCalories, "P:", c.selectedVariant.targetProtein, "cost:", c.catalogItem.recipe.slug);
}

console.log("\nSnack candidates count:");
const snCandidates = generateMealCandidates(hostelProfile, "snack", 379, 17, catalog.recipes, foodAllergensLookup);
console.log("Count:", snCandidates.length);
for (const c of snCandidates) {
  console.log(" -", c.catalogItem.recipeVersion.name, "| cal:", c.selectedVariant.targetCalories, "P:", c.selectedVariant.targetProtein);
}
