import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

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

const plan = generateUnified7DayPlan(hostelProfile, "2026-10-05");
console.log("Daily targets:", plan.dailyTargets);
for (const day of plan.dailySummaries) {
  console.log(`\nDay ${day.date} Cal: ${day.totalCalories} (${day.calorieDeviationPct}%) | P: ${day.totalProtein}g (${day.proteinDeviationPct}%) | Cost: ₹${day.totalCost}`);
  for (const m of day.meals) {
    console.log(`  [${m.mealSlot.toUpperCase()}] ${m.sourceType} -> ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P, ₹${m.costSnapshot} | ${m.items?.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
  }
}
console.log("\nWarnings:", plan.warnings);
console.log("Failure Reasons:", plan.metrics.failureReasons);
