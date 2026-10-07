import fs from "node:fs";
import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";

const raw = JSON.parse(fs.readFileSync("artifacts/nutrition-v2-audit/persona-results.json", "utf8"));
console.log("Total personas:", raw.length);

// Analyze failure categories
const gateCounts = {};
for (const p of raw) {
  for (const g of p.failedGates) {
    gateCounts[g] = (gateCounts[g] || 0) + 1;
  }
}
console.log("\nFailure Frequency across all 61 Personas:");
console.table(gateCounts);

// Let's inspect P27 (Dairy Allergy) specifically
console.log("\nDiagnosing P27 (Dairy Allergy):");
const p27Raw = {
  user_id: "p27-allergy-dairy",
  gender: "Male",
  age: 26,
  height: 172,
  weight: 68,
  target_weight: 68,
  goal: "Maintain",
  activity_level: "Moderately active",
  food_type: "Vegetarian",
  food_environment: "Home",
  meals_per_day: "3 meals",
  nutrition_budget: "₹2,000–5,000",
  available_equipment: ["stove"],
  food_allergies: "dairy",
  workout_time: "18:00:00"
};
const v2_27 = V2PlanService.mapProfileToV2Context(p27Raw);
console.log("P27 mapped allergies:", v2_27.allergies);
const plan27 = generateUnified7DayPlan(v2_27, "2026-10-12");
const foods27 = new Set(plan27.plannedMeals.flatMap(m => (m.items || []).map(i => i.foodName)));
console.log("P27 Unique Foods in 7 days:", Array.from(foods27));

// Let's inspect P38 (Kettle Only)
console.log("\nDiagnosing P38 (Kettle Only):");
const p38Raw = {
  user_id: "p38-kettle-only",
  gender: "Male",
  age: 20,
  height: 170,
  weight: 62,
  target_weight: 62,
  goal: "Maintain",
  activity_level: "Moderately active",
  food_type: "Vegetarian",
  food_environment: "Hostel",
  meals_per_day: "3 meals",
  nutrition_budget: "₹1,000–2,000",
  available_equipment: ["kettle"],
  mess_available: false,
  workout_time: "17:30:00"
};
const v2_38 = V2PlanService.mapProfileToV2Context(p38Raw);
console.log("P38 mapped context:", {
  env: v2_38.foodEnvironment,
  equip: v2_38.availableEquipment,
  mess: v2_38.messAvailable,
  budget: v2_38.weeklyBudgetTargetInr,
  policy: v2_38.budgetPolicy
});
const plan38 = generateUnified7DayPlan(v2_38, "2026-10-12");
console.log("P38 Metric compositeScore:", plan38.metrics.compositeScore, "Warnings:", plan38.warnings, "Errors:", plan38.metrics.failureReasons);

// Let's inspect P42 (Hostel Student Mess)
console.log("\nDiagnosing P42 (Hostel Student Mess):");
const p42Raw = {
  user_id: "p42-hostel-3mess",
  gender: "Male",
  age: 20,
  height: 172,
  weight: 64,
  target_weight: 64,
  goal: "Maintain",
  activity_level: "Moderately active",
  food_type: "Vegetarian",
  food_environment: "Hostel",
  meals_per_day: "3 meals",
  nutrition_budget: "₹1,000–2,000",
  mess_available: true,
  mess_meals: ["breakfast", "lunch", "dinner"],
  available_equipment: ["kettle"],
  workout_time: "17:30:00"
};
const v2_42 = V2PlanService.mapProfileToV2Context(p42Raw);
console.log("P42 mapped budget:", v2_42.monthlyBudgetInr, "weekly:", v2_42.weeklyBudgetTargetInr, "policy:", v2_42.budgetPolicy);
const plan42 = generateUnified7DayPlan(v2_42, "2026-10-12");
console.log("P42 validation:", plan42.metrics);

