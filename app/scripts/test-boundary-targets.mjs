import { calculateDailyTargets } from "../lib/fitness/nutrition/unified-7day-planner.ts";

console.log("================================================================================");
console.log("NUTRITION V2 BOUNDARY PROFILE TARGET CALCULATIONS AUDIT");
console.log("================================================================================\n");

const boundaryProfiles = [
  {
    name: "1. Small Female - Maintenance (150cm, 45kg, 22yo, Light)",
    profile: {
      userId: "bf-1",
      gender: "female",
      age: 22,
      heightCm: 150,
      weightKg: 45,
      goal: "Maintain",
      activityLevel: "Lightly active",
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
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
      workoutTime: "18:00:00",
      wakeTime: "07:00:00",
      sleepTime: "23:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    name: "2. Small Female - Cut with 1300 kcal Floor (150cm, 45kg, 22yo, Sedentary)",
    profile: {
      userId: "bf-2",
      gender: "female",
      age: 22,
      heightCm: 150,
      weightKg: 45,
      goal: "Lose Fat",
      activityLevel: "Mostly sitting",
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
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
      workoutTime: "18:00:00",
      wakeTime: "07:00:00",
      sleepTime: "23:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    name: "3. Large Male - Athlete Bulker (195cm, 110kg, 26yo, Very Active)",
    profile: {
      userId: "bf-3",
      gender: "male",
      age: 26,
      heightCm: 195,
      weightKg: 110,
      goal: "Build Muscle",
      activityLevel: "Very active",
      dietPreference: "non-veg",
      foodEnvironment: "Home",
      mealsPerDay: 5,
      monthlyBudgetInr: 10000,
      weeklyBudgetTargetInr: 2500,
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
      sleepTime: "23:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    name: "4. High Weight Cutter - Heavy Deficit (180cm, 120kg, 32yo, Sedentary)",
    profile: {
      userId: "bf-4",
      gender: "male",
      age: 32,
      heightCm: 180,
      weightKg: 120,
      goal: "Lose Fat",
      activityLevel: "Mostly sitting",
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
      mealsPerDay: 3,
      monthlyBudgetInr: 6000,
      weeklyBudgetTargetInr: 1500,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "19:00:00",
      wakeTime: "07:00:00",
      sleepTime: "23:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    name: "5. Desk Worker 'Mostly sitting' String Mismatch Test (175cm, 75kg, 28yo)",
    profile: {
      userId: "bf-5",
      gender: "male",
      age: 28,
      heightCm: 175,
      weightKg: 75,
      goal: "Maintain",
      activityLevel: "Mostly sitting", // Onboarding string
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
      mealsPerDay: 3,
      monthlyBudgetInr: 5000,
      weeklyBudgetTargetInr: 1250,
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
  {
    name: "6. Desk Worker 'sedentary' Canonical String Test (175cm, 75kg, 28yo)",
    profile: {
      userId: "bf-6",
      gender: "male",
      age: 28,
      heightCm: 175,
      weightKg: 75,
      goal: "Maintain",
      activityLevel: "sedentary", // Planner enum
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
      mealsPerDay: 3,
      monthlyBudgetInr: 5000,
      weeklyBudgetTargetInr: 1250,
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
  {
    name: "7. Gender 'Other' / Non-Binary Profile (165cm, 60kg, 25yo)",
    profile: {
      userId: "bf-7",
      gender: "Other",
      age: 25,
      heightCm: 165,
      weightKg: 60,
      goal: "Maintain",
      activityLevel: "Lightly active",
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
      mealsPerDay: 3,
      monthlyBudgetInr: 5000,
      weeklyBudgetTargetInr: 1250,
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
  {
    name: "8. Elderly Profile (168cm, 65kg, 78yo, Light)",
    profile: {
      userId: "bf-8",
      gender: "male",
      age: 78,
      heightCm: 168,
      weightKg: 65,
      goal: "Maintain",
      activityLevel: "Lightly active",
      dietPreference: "vegetarian",
      foodEnvironment: "Home",
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
      wakeTime: "06:00:00",
      sleepTime: "22:00:00",
      timezone: "Asia/Kolkata"
    }
  }
];

const targetAuditRows = [];

for (const bp of boundaryProfiles) {
  const targets = calculateDailyTargets(bp.profile);
  const pCal = targets.protein * 4;
  const fCal = targets.fat * 9;
  const cCal = targets.carbs * 4;
  const sumCal = pCal + fCal + cCal;
  const calDiff = targets.calories - sumCal;

  console.log(`=== ${bp.name} ===`);
  console.log(`  Weight: ${bp.profile.weightKg} kg, Height: ${bp.profile.heightCm} cm, Age: ${bp.profile.age}, Gender: ${bp.profile.gender}`);
  console.log(`  Activity: "${bp.profile.activityLevel}", Goal: "${bp.profile.goal}"`);
  console.log(`  Calculated Targets: ${targets.calories} kcal | ${targets.protein}g P | ${targets.carbs}g C | ${targets.fat}g F`);
  console.log(`  Macro Cal Breakdown: Protein: ${pCal} kcal (${((pCal/targets.calories)*100).toFixed(1)}%) | Fat: ${fCal} kcal (${((fCal/targets.calories)*100).toFixed(1)}%) | Carbs: ${cCal} kcal (${((cCal/targets.calories)*100).toFixed(1)}%)`);
  console.log(`  Calorie Reconciliation: ${sumCal} vs Target ${targets.calories} (delta: ${calDiff} kcal)\n`);

  targetAuditRows.push({
    name: bp.name,
    calories: targets.calories,
    protein: targets.protein,
    carbs: targets.carbs,
    fat: targets.fat,
    calSum: sumCal,
    delta: calDiff
  });
}
