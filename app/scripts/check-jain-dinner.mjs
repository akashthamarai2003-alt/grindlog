import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { generateMealCandidates } from "../lib/fitness/nutrition/candidate-generator.ts";

const catalog = loadNutritionCatalog();
const foodAllergensLookup = (foodId) => catalog.foodById.get(foodId)?.allergens || [];
const foodCostLookup = (foodId) => catalog.foodById.get(foodId)?.estimated_cost || 15;

const jainProfile = {
  userId: "test-user-jain",
  gender: "female",
  age: 29,
  heightCm: 165,
  weightKg: 68,
  goal: "fat loss",
  fitnessLevel: "beginner",
  activityLevel: "light",
  dietPreference: "vegetarian",
  foodEnvironment: "Home",
  mealsPerDay: 3,
  monthlyBudgetInr: 6000,
  weeklyBudgetTargetInr: 1500,
  budgetPolicy: "FLEXIBLE",
  allergies: [],
  dislikedFoods: [],
  avoidedFoods: ["onion", "garlic", "eggplant", "mushroom"],
  availableEquipment: ["stove"],
  messAvailable: false,
  messMeals: [],
  messIncludedInBudget: false,
  availableFoods: [],
  workoutTime: "07:00:00",
  wakeTime: "06:30:00",
  sleepTime: "22:30:00",
  timezone: "Asia/Kolkata"
};

const dinnerCandidates = generateMealCandidates(jainProfile, "dinner", 474, 41.5, catalog.recipes, foodAllergensLookup, foodCostLookup);
console.log("Jain Dinner Candidates count:", dinnerCandidates.length);
for (const c of dinnerCandidates.slice(0, 15)) {
  console.log(" -", c.catalogItem.recipeVersion.name, "| P:", c.selectedVariant.targetProtein, "cal:", c.selectedVariant.targetCalories, "score:", c.score);
}
