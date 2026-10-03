import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

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

const plan = generateUnified7DayPlan(jainProfile, "2026-10-05");
const d7 = plan.dailySummaries[6];
console.log(`Day 7 (${d7.date}): ${d7.totalCalories} kcal (${d7.calorieDeviationPct}%), ${d7.totalProtein}g P (${d7.proteinDeviationPct}%)`);
for (const m of d7.meals) {
  console.log(` - [${m.mealSlot}] ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P | ${m.items.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
}
