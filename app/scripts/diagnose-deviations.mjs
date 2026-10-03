import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const veganProfile = {
  userId: "test-user-vegan",
  gender: "male",
  age: 26,
  heightCm: 180,
  weightKg: 75,
  goal: "muscle gain",
  fitnessLevel: "intermediate",
  activityLevel: "moderate",
  dietPreference: "vegan",
  foodEnvironment: "Home",
  mealsPerDay: 4,
  monthlyBudgetInr: 8000,
  weeklyBudgetTargetInr: 2000,
  budgetPolicy: "FLEXIBLE",
  allergies: ["milk", "egg"],
  dislikedFoods: [],
  avoidedFoods: [],
  availableEquipment: ["stove", "blender"],
  messAvailable: false,
  messMeals: [],
  messIncludedInBudget: false,
  availableFoods: [],
  workoutTime: "18:00:00",
  wakeTime: "07:00:00",
  sleepTime: "23:00:00",
  timezone: "Asia/Kolkata"
};

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

console.log("=== VEGAN BULKER DAY 7 ===");
const vPlan = generateUnified7DayPlan(veganProfile, "2026-10-05");
const vd7 = vPlan.dailySummaries[6];
console.log(`Day 7 (${vd7.date}): ${vd7.totalCalories} kcal (${vd7.calorieDeviationPct}%), ${vd7.totalProtein}g P`);
for (const m of vd7.meals) {
  console.log(` - [${m.mealSlot}] ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P | ${m.items.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
}

console.log("\n=== JAIN FAT LOSS DAYS 5 & 6 ===");
const jPlan = generateUnified7DayPlan(jainProfile, "2026-10-05");
const jd5 = jPlan.dailySummaries[4];
console.log(`Day 5 (${jd5.date}): ${jd5.totalCalories} kcal (${jd5.calorieDeviationPct}%), ${jd5.totalProtein}g P`);
for (const m of jd5.meals) {
  console.log(` - [${m.mealSlot}] ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P | ${m.items.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
}
