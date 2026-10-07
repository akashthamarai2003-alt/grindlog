import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";

const rawProfile = {
  user_id: "p35-multi-gluten-soy",
  gender: "Male",
  age: 31,
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
  food_allergies: "gluten, soy",
  workout_time: "18:30:00"
};

const v2Context = V2PlanService.mapProfileToV2Context(rawProfile);
const plan = generateUnified7DayPlan(v2Context, "2026-10-12");
console.log("Plan status:", plan.status);
for (const d of plan.dailySummaries) {
  const cPct = (((d.totalCalories - plan.dailyTargets.calories)/plan.dailyTargets.calories)*100).toFixed(1);
  const pPct = (((d.totalProtein - plan.dailyTargets.protein)/plan.dailyTargets.protein)*100).toFixed(1);
  console.log(`${d.date}: Cal=${d.totalCalories} (${cPct}%), P=${d.totalProtein}g (${pPct}%)`);
}
