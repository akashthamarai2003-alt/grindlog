import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const testProfiles = [
  {
    name: "1. Strict Vegan Bulker (4 meals/day)",
    profile: {
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
    }
  },
  {
    name: "2. Vegetarian Jain Fat Loss (3 meals/day)",
    profile: {
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
    }
  },
  {
    name: "3. Dairy-Free Non-Veg High-Protein Athlete (4 meals/day)",
    profile: {
      userId: "test-user-athlete",
      gender: "male",
      age: 24,
      heightCm: 182,
      weightKg: 82,
      goal: "muscle gain",
      fitnessLevel: "advanced",
      activityLevel: "athlete",
      dietPreference: "non-veg",
      foodEnvironment: "I Cook",
      mealsPerDay: 4,
      monthlyBudgetInr: 12000,
      weeklyBudgetTargetInr: 3000,
      budgetPolicy: "FLEXIBLE",
      allergies: ["milk"],
      dislikedFoods: [],
      avoidedFoods: ["paneer", "ghee", "curd", "yogurt", "milk", "cheese", "whey"],
      availableEquipment: ["stove"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "17:30:00",
      wakeTime: "06:00:00",
      sleepTime: "22:30:00",
      timezone: "Asia/Kolkata"
    }
  }
];

for (const t of testProfiles) {
  console.log(`\n==================================================`);
  console.log(`PROFILE: ${t.name}`);
  const plan = generateUnified7DayPlan(t.profile, "2026-10-05");
  console.log(`Targets: Cal ${plan.dailyTargets.calories} | P ${plan.dailyTargets.protein}g`);
  for (const d of plan.dailySummaries) {
    console.log(`Day ${d.date}: ${d.totalCalories} kcal (${d.calorieDeviationPct}%), ${d.totalProtein}g P (${d.proteinDeviationPct}%)`);
    for (const m of d.meals) {
      console.log(`   [${m.mealSlot}] ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P | ${m.items.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
    }
  }
  console.log("Failures:", plan.metrics.failureReasons);
}
