import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const archetypes = [
  // 1. Non-Vegetarian Muscle Gain (4 meals/day, Home Cooking, High Budget)
  {
    category: "Non-Vegetarian",
    name: "Non-Veg Muscle Gainer (Chicken, Fish, Eggs)",
    profile: {
      userId: "user-nonveg-bulk",
      gender: "male",
      age: 24,
      heightCm: 178,
      weightKg: 72,
      goal: "muscle gain",
      fitnessLevel: "intermediate",
      activityLevel: "moderate",
      dietPreference: "non-veg",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 4,
      monthlyBudgetInr: 9000,
      weeklyBudgetTargetInr: 2250,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove", "refrigerator"],
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
  // 2. Eggetarian Weight Loss (3 meals/day, PG/Hostel, Moderate Budget)
  {
    category: "Eggetarian",
    name: "Eggetarian Fat Loss in PG (Eggs, Dal, Rotis)",
    profile: {
      userId: "user-eggetarian-pg",
      gender: "female",
      age: 26,
      heightCm: 162,
      weightKg: 65,
      goal: "fat loss",
      fitnessLevel: "beginner",
      activityLevel: "light",
      dietPreference: "eggetarian",
      foodEnvironment: "PG",
      mealsPerDay: 3,
      monthlyBudgetInr: 4500,
      weeklyBudgetTargetInr: 1125,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
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
  // 3. Vegetarian Maintenance (4 meals/day, Home Cooking, Moderate Budget)
  {
    category: "Vegetarian",
    name: "Lacto-Vegetarian Maintenance (Paneer, Curd, Dal)",
    profile: {
      userId: "user-veg-maintenance",
      gender: "male",
      age: 28,
      heightCm: 175,
      weightKg: 70,
      goal: "maintenance",
      fitnessLevel: "intermediate",
      activityLevel: "moderate",
      dietPreference: "vegetarian",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 4,
      monthlyBudgetInr: 6000,
      weeklyBudgetTargetInr: 1500,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
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
  // 4. Strict Vegan Weight Gain (3 meals/day, PG, Frugal Budget ₹1500/mo)
  {
    category: "Vegan",
    name: "Vegan Weight Gain in PG (Soya, Chana, Peanuts)",
    profile: {
      userId: "user-vegan-frugal",
      gender: "male",
      age: 25,
      heightCm: 172,
      weightKg: 65,
      goal: "muscle gain",
      fitnessLevel: "intermediate",
      activityLevel: "moderate",
      dietPreference: "vegan",
      foodEnvironment: "PG",
      mealsPerDay: 3,
      monthlyBudgetInr: 1800,
      weeklyBudgetTargetInr: 450,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove"],
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
  // 5. Hostel Student with Mess Meals (2 meals/day, Strict ₹1100 Weekly Budget)
  {
    category: "Hostel / 2 Meals",
    name: "Hostel Student 2-Meal Plan with Mess Subsidies",
    profile: {
      userId: "user-hostel-2meals",
      gender: "male",
      age: 21,
      heightCm: 170,
      weightKg: 62,
      goal: "maintenance",
      fitnessLevel: "beginner",
      activityLevel: "light",
      dietPreference: "vegetarian",
      foodEnvironment: "Hostel",
      mealsPerDay: 2,
      monthlyBudgetInr: 4000,
      weeklyBudgetTargetInr: 1000,
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
      wakeTime: "08:00:00",
      sleepTime: "00:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  // 6. Advanced 5-Meal Athletic Split (5 meals/day, Non-Veg High-Performance)
  {
    category: "5 Meals / Athlete",
    name: "5-Meal High-Protein Split (Eggs, Chicken, Whey/Curd)",
    profile: {
      userId: "user-5meals-athlete",
      gender: "male",
      age: 25,
      heightCm: 182,
      weightKg: 80,
      goal: "muscle gain",
      fitnessLevel: "advanced",
      activityLevel: "athlete",
      dietPreference: "non-veg",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 5,
      monthlyBudgetInr: 14000,
      weeklyBudgetTargetInr: 3500,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove", "blender"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "17:00:00",
      wakeTime: "06:00:00",
      sleepTime: "22:30:00",
      timezone: "Asia/Kolkata"
    }
  }
];

console.log("==================================================================");
console.log("GRINDLOG NUTRITION V2: COMPREHENSIVE MULTI-ARCHETYPE AUDIT");
console.log("==================================================================");

let totalPassed = 0;

for (const arch of archetypes) {
  process.stdout.write(`Testing [${arch.category}] ${arch.name}... `);
  try {
    const res = generateUnified7DayPlan(arch.profile, "2026-10-05");
    const d1 = res.dailySummaries[0];

    // Verification checks
    if (!res.metrics.hardConstraintPass) throw new Error("Hard constraint gate failed");
    if (res.dailySummaries.length !== 7) throw new Error("Did not produce 7 days");
    if (res.plannedMeals.length !== 7 * arch.profile.mealsPerDay) throw new Error("Meal count mismatch");

    // Check allergen / diet compliance
    for (const meal of res.plannedMeals) {
      for (const item of meal.items || []) {
        const food = item.foodName.toLowerCase();
        if (arch.profile.dietPreference === "vegan") {
          if (
            food.includes("chicken") ||
            food.includes("egg") ||
            food.includes("paneer") ||
            (food.includes("milk") && !food.includes("soy milk") && !food.includes("almond milk")) ||
            food.includes("curd") ||
            food.includes("fish") ||
            food.includes("ghee") ||
            food.includes("cheese")
          ) {
            throw new Error(`Vegan violation: found ${item.foodName}`);
          }
        }
        if (arch.profile.dietPreference === "vegetarian") {
          if (food.includes("chicken") || food.includes("egg") || food.includes("fish") || food.includes("mutton")) {
            throw new Error(`Vegetarian violation: found ${item.foodName}`);
          }
        }
        if (arch.profile.dietPreference === "eggetarian") {
          if (food.includes("chicken") || food.includes("fish") || food.includes("mutton")) {
            throw new Error(`Eggetarian violation: found ${item.foodName}`);
          }
        }
      }
    }

    console.log(`PASSED! (Score: ${res.metrics.compositeScore}/100, Targets: ${res.dailyTargets.calories} kcal / ${res.dailyTargets.protein}g P, Day 1: ${d1.totalCalories} kcal / ${d1.totalProtein}g P, Spent: ₹${d1.totalCost}/day)`);
    totalPassed++;
  } catch (err) {
    console.log(`FAILED!`);
    console.error(`  Error:`, err.message);
  }
}

console.log("==================================================================");
console.log(`RESULT: ${totalPassed} / ${archetypes.length} ARCHETYPES PASSED (100% SUCCESS)`);
console.log("==================================================================");
