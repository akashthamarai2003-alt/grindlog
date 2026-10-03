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
for (const day of res.dailySummaries) {
  console.log(`\n=== Date: ${day.date} (Cal: ${day.totalCalories}, P: ${day.totalProtein}g, Cost: ₹${day.totalCost}) ===`);
  for (const m of day.meals) {
    console.log(`  [${m.mealSlot}] ${m.sourceType === "RECIPE" ? m.recipeVersionId : "MESS"} -> ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P, ₹${m.costSnapshot}`);
    for (const item of (m.items || [])) {
      console.log(`     * ${item.quantity}${item.unit} ${item.foodName} (${item.caloriesSnapshot} kcal, ${item.proteinSnapshot}g P)`);
    }
  }
}
