import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const profile = {
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

const res = generateUnified7DayPlan(profile, "2026-10-05");
let totalCost = 0;
for (const day of res.dailySummaries) {
  console.log(`\nDate: ${day.date} -> Cost: ₹${day.totalCost}, Cal: ${day.totalCalories}, P: ${day.totalProtein}`);
  totalCost += day.totalCost;
  for (const m of day.meals) {
    console.log(`  [${m.mealSlot}] ${m.sourceType === "RECIPE" ? m.recipeVersionId : "MESS"} -> ₹${m.costSnapshot}`);
    for (const it of (m.items || [])) {
      if (it.costSnapshot > 0) {
        console.log(`     * ${it.foodName}: ₹${it.costSnapshot} (${it.quantity}${it.unit})`);
      }
    }
  }
}
console.log(`\nTOTAL WEEKLY COST: ₹${totalCost}`);
