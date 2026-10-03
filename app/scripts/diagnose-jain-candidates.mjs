import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { generateMealCandidates } from "../lib/fitness/nutrition/candidate-generator.ts";
import { RECIPE_SEEDS, RECIPE_VARIANT_SEEDS, FOOD_SEEDS } from "./test-seeds-data.mjs";

// Build catalog
const foodMap = new Map();
for (const f of FOOD_SEEDS) foodMap.set(f.id, f);

const catalog = [];
for (const r of RECIPE_SEEDS) {
  const rv = r.versions ? r.versions[0] : null;
  if (!rv) continue;
  const variants = RECIPE_VARIANT_SEEDS.filter(v => v.recipeVersionId === rv.id);
  const variantIngs = []; // mock
  catalog.push({
    recipe: r,
    recipeVersion: rv,
    variants,
    variantIngredients: variantIngs,
    image: null
  });
}

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

const candsLunch = generateMealCandidates(
  jainProfile,
  "lunch",
  563,
  46.4,
  catalog,
  () => [],
  () => 20
);

console.log(`Jain Lunch Candidates count: ${candsLunch.length}`);
for (const c of candsLunch.slice(0, 10)) {
  console.log(` - ${c.catalogItem.recipeVersion.name} (${c.selectedVariant.name}): ${c.selectedVariant.targetCalories} kcal, ${c.selectedVariant.targetProtein}g P, score=${c.score}`);
}

const candsDinner = generateMealCandidates(
  jainProfile,
  "dinner",
  474,
  41.5,
  catalog,
  () => [],
  () => 20
);

console.log(`\nJain Dinner Candidates count: ${candsDinner.length}`);
for (const c of candsDinner.slice(0, 10)) {
  console.log(` - ${c.catalogItem.recipeVersion.name} (${c.selectedVariant.name}): ${c.selectedVariant.targetCalories} kcal, ${c.selectedVariant.targetProtein}g P, score=${c.score}`);
}
