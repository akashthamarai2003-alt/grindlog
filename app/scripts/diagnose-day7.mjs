import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const testProfiles = [
  {
    name: "1. Vegan Bulker",
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
    name: "2. Jain Fat Loss",
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
    name: "3. Athlete",
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
    name: "4. Hostel Student",
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

for (const t of testProfiles) {
  console.log(`\n================ ${t.name} ================`);
  const plan = generateUnified7DayPlan(t.profile, "2026-10-05");
  const d7 = plan.dailySummaries[6];
  console.log(`Day 7 (${d7.date}): ${d7.totalCalories} kcal (${d7.calorieDeviationPct}%), ${d7.totalProtein}g P (${d7.proteinDeviationPct}%)`);
  if (t.name.includes("Jain") || t.name.includes("Hostel") || t.name.includes("Athlete")) {
    console.log(`\n--- All 7 Days for ${t.name} ---`);
    for (let d = 0; d < 7; d++) {
      const day = plan.dailySummaries[d];
      console.log(`Day ${d + 1} (${day.date}): ${day.totalCalories} kcal (${day.calorieDeviationPct}%), ${day.totalProtein}g P (${day.proteinDeviationPct}%), Cost: ₹${day.totalCost}:`);
      for (const m of day.meals) {
        console.log(`  [${m.mealSlot}] ${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P, ₹${m.costSnapshot} | ${m.items?.map(i => `${i.quantity}${i.unit} ${i.foodName}`).join(", ")}`);
      }
    }
  }
}
