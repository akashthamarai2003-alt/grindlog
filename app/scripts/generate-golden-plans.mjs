import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import fs from "node:fs";
import path from "node:path";

const goldenProfiles = [
  {
    code: "Plan A",
    name: "Balanced Vegetarian Moderate Maintenance",
    profile: {
      id: "golden-plan-a",
      age: 26,
      gender: "male",
      heightCm: 172,
      weightKg: 68,
      targetWeightKg: 68,
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
      availableEquipment: ["stove", "refrigerator", "blender"],
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
    code: "Plan B",
    name: "Strict Vegan Bulker (High Calorie / Zero Dairy)",
    profile: {
      id: "golden-plan-b",
      age: 24,
      gender: "male",
      heightCm: 180,
      weightKg: 76,
      targetWeightKg: 82,
      goal: "muscle_gain",
      fitnessLevel: "intermediate",
      activityLevel: "active",
      dietPreference: "vegan",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 4,
      monthlyBudgetInr: 8000,
      weeklyBudgetTargetInr: 2000,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove", "refrigerator", "blender"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "17:30:00",
      wakeTime: "06:30:00",
      sleepTime: "23:00:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    code: "Plan C",
    name: "Vegetarian Jain Fat Loss (Zero Root Vegetables)",
    profile: {
      id: "golden-plan-c",
      age: 28,
      gender: "female",
      heightCm: 160,
      weightKg: 65,
      targetWeightKg: 55,
      goal: "fat_loss",
      fitnessLevel: "beginner",
      activityLevel: "light",
      dietPreference: "jain",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 3,
      monthlyBudgetInr: 6000,
      weeklyBudgetTargetInr: 1500,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove", "refrigerator"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "07:00:00",
      wakeTime: "06:00:00",
      sleepTime: "22:30:00",
      timezone: "Asia/Kolkata"
    }
  },
  {
    code: "Plan D",
    name: "Dairy-Free Non-Veg High-Protein Athlete",
    profile: {
      id: "golden-plan-d",
      age: 24,
      gender: "male",
      heightCm: 182,
      weightKg: 82,
      targetWeightKg: 85,
      goal: "muscle gain",
      fitnessLevel: "advanced",
      activityLevel: "athlete",
      dietPreference: "non-veg",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 4,
      monthlyBudgetInr: 12000,
      weeklyBudgetTargetInr: 3000,
      budgetPolicy: "FLEXIBLE",
      allergies: ["milk"],
      dislikedFoods: [],
      avoidedFoods: ["paneer", "ghee", "curd", "yogurt", "milk", "cheese", "whey"],
      availableEquipment: ["stove", "refrigerator"],
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
    code: "Plan E",
    name: "Hostel Student Kettle-Only STRICT ₹1100 Budget",
    profile: {
      id: "golden-plan-e",
      age: 20,
      gender: "male",
      heightCm: 172,
      weightKg: 65,
      targetWeightKg: 65,
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
  },
  {
    code: "Plan F",
    name: "Eggetarian Muscle Gain High-Protein Cutter",
    profile: {
      id: "golden-plan-f",
      age: 27,
      gender: "male",
      heightCm: 178,
      weightKg: 75,
      targetWeightKg: 71,
      goal: "fat_loss",
      fitnessLevel: "intermediate",
      activityLevel: "moderate",
      dietPreference: "eggetarian",
      foodEnvironment: "Home Cooking",
      mealsPerDay: 4,
      monthlyBudgetInr: 7000,
      weeklyBudgetTargetInr: 1750,
      budgetPolicy: "FLEXIBLE",
      allergies: [],
      dislikedFoods: [],
      avoidedFoods: [],
      availableEquipment: ["stove", "refrigerator"],
      messAvailable: false,
      messMeals: [],
      messIncludedInBudget: false,
      availableFoods: [],
      workoutTime: "18:30:00",
      wakeTime: "07:00:00",
      sleepTime: "23:30:00",
      timezone: "Asia/Kolkata"
    }
  }
];

console.log("==================================================");
console.log("GENERATING GOLDEN PLANS A THROUGH F (PHASE 3.5 AUDIT)");
console.log("==================================================\n");

let mdReport = `# Phase 3.5 Golden Plans Audit Report (Plans A–F)\n\n`;
mdReport += `Generated on: ${new Date().toISOString()}\n\n`;
mdReport += `## Summary of Results\n\n`;
mdReport += `| Plan Code | Persona Description | Target Calories | Target Protein | Composite Score | Weekly Spend | Status |\n`;
mdReport += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

let allPassed = true;

for (const gp of goldenProfiles) {
  process.stdout.write(`Generating ${gp.code}: ${gp.name}... `);
  const plan = generateUnified7DayPlan(gp.profile, "2026-10-05");
  const d1 = plan.dailySummaries[0];
  const weeklySpend = plan.dailySummaries.reduce((sum, d) => sum + d.totalCost, 0);
  const isPass = plan.metrics.hardConstraintPass && plan.metrics.compositeScore >= 70;
  if (!isPass) allPassed = false;

  console.log(`${isPass ? "PASS" : "FAIL"} (Score: ${plan.metrics.compositeScore}/100, Spend: ₹${weeklySpend})`);
  if (!isPass && plan.metrics.failureReasons) {
    console.error(`  Failure reasons:`, plan.metrics.failureReasons);
  }

  mdReport += `| **${gp.code}** | ${gp.name} | ${plan.dailyTargets.calories} kcal | ${plan.dailyTargets.protein}g | **${plan.metrics.compositeScore}/100** | ₹${weeklySpend} | ${isPass ? "✅ PASS" : "❌ FAIL"} |\n`;
}

mdReport += `\n---\n\n## Detailed Daily Breakdown of Golden Plans\n\n`;

for (const gp of goldenProfiles) {
  const plan = generateUnified7DayPlan(gp.profile, "2026-10-05");
  const weeklySpend = plan.dailySummaries.reduce((sum, d) => sum + d.totalCost, 0);

  mdReport += `### ${gp.code}: ${gp.name}\n\n`;
  mdReport += `- **Daily Targets**: ${plan.dailyTargets.calories} kcal | ${plan.dailyTargets.protein}g P | ${plan.dailyTargets.carbs}g C | ${plan.dailyTargets.fat}g F\n`;
  mdReport += `- **Quality Score**: ${plan.metrics.compositeScore}/100 (${plan.metrics.hardConstraintPass ? "Hard Constraints Passed" : "Hard Constraints Failed"})\n`;
  mdReport += `- **Total 7-Day Spend**: ₹${weeklySpend} (Target: ₹${gp.profile.weeklyBudgetTargetInr})\n\n`;

  mdReport += `#### 7-Day Compliance Summary\n\n`;
  mdReport += `| Day | Date | Total Calories | Total Protein | Total Carbs | Total Fat | Day Spend |\n`;
  mdReport += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (let i = 0; i < plan.dailySummaries.length; i++) {
    const d = plan.dailySummaries[i];
    mdReport += `| Day ${i + 1} | ${d.date} | ${d.totalCalories} kcal | ${d.totalProtein}g | ${d.totalCarbs}g | ${d.totalFat}g | ₹${d.totalCost} |\n`;
  }
  mdReport += `\n`;

  mdReport += `#### Sample Day 1 Meal Schedule\n\n`;
  for (const m of plan.dailySummaries[0].meals) {
    mdReport += `- **[${m.mealSlot.toUpperCase()}]** (${m.scheduledTime}):\n`;
    for (const item of (m.items || [])) {
      mdReport += `  - ${item.quantity}${item.unit} ${item.foodName} (${item.caloriesSnapshot} kcal, ${item.proteinSnapshot}g P, ₹${item.costSnapshot})\n`;
    }
    mdReport += `  - *Meal Total*: **${m.caloriesSnapshot} kcal**, **${m.proteinSnapshot}g P**, ₹${m.costSnapshot}\n\n`;
  }
  mdReport += `---\n\n`;
}

const outDir = path.resolve(process.cwd(), "docs");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "golden-plans-audit-report.md");
fs.writeFileSync(outPath, mdReport, "utf8");

console.log(`\nAudit Report written to: ${outPath}`);
if (allPassed) {
  console.log("==================================================");
  console.log("ALL 6 GOLDEN PLANS (A-F) PASSED 100%!");
  console.log("==================================================");
  process.exit(0);
} else {
  console.error("FAIL: One or more golden plans failed!");
  process.exit(1);
}
