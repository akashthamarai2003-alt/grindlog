import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

console.log("==================================================");
console.log("GRINDLOG NUTRITION V2: 7-DAY PLANNER SIMULATION");
console.log("==================================================");

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
  },
  {
    name: "4. Hostel Student Kettle-Only (4 meals/day)",
    profile: {
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
    }
  }
];

let allPassed = true;

for (const t of testProfiles) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing: ${t.name}`);
  try {
    const res = generateUnified7DayPlan(t.profile, "2026-10-05");
    console.log(`  Plan ID: ${res.planId}`);
    console.log(`  Date Range: ${res.startDate} to ${res.endDate}`);
    console.log(`  Daily Targets: ${res.dailyTargets.calories} kcal | ${res.dailyTargets.protein}g P | ${res.dailyTargets.carbs}g C | ${res.dailyTargets.fat}g F`);
    console.log(`  Total Planned Meals: ${res.plannedMeals.length} (7 days x ${t.profile.mealsPerDay} meals)`);
    console.log(`  Composite Quality Score: ${res.metrics.compositeScore}/100 (Pass: ${res.metrics.hardConstraintPass})`);

    // Show day 1 summary
    const d1 = res.dailySummaries[0];
    console.log(`  Day 1 Summary (${d1.date}):`);
    console.log(`    Total: ${d1.totalCalories} kcal, ${d1.totalProtein}g P, ${d1.totalCarbs}g C, ${d1.totalFat}g F (Est. Cost: ₹${d1.totalCost})`);
    for (const m of d1.meals) {
      console.log(`    - [${m.mealSlot.toUpperCase()}] ${m.items?.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")} -> ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P`);
    }

    if (!res.metrics.hardConstraintPass || res.metrics.compositeScore < 70) {
      console.error(`  FAIL: Quality checks failed!`);
      if (res.metrics.failureReasons) {
        console.error(`  Failure reasons:`, res.metrics.failureReasons);
      }
      if (res.warnings && res.warnings.length > 0) {
        console.warn(`  Warnings (first 3):`, res.warnings.slice(0, 3));
      }
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ERROR during plan generation:`, err);
    allPassed = false;
  }
}

console.log("\n==================================================");
if (allPassed) {
  console.log("ALL 7-DAY PLANNER SIMULATION TESTS PASSED PERFECTLY!");
} else {
  console.error("FAIL: One or more simulation tests failed!");
  process.exit(1);
}
console.log("==================================================");
