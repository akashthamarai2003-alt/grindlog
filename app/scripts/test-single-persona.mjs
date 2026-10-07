import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";

const rawProfile = {
  user_id: "p21-nv-2meal",
  gender: "Male",
  age: 35,
  height: 175,
  weight: 78,
  target_weight: 74,
  goal: "Lose Fat",
  activity_level: "Lightly active",
  food_type: "Non-Vegetarian",
  food_environment: "Home",
  meals_per_day: "2 meals",
  nutrition_budget: "₹2,000–5,000",
  available_equipment: ["stove"],
  workout_time: "19:30:00"
};

const v2Context = V2PlanService.mapProfileToV2Context(rawProfile);
console.log("Profile targets:", v2Context.dailyTargets);
try {
  const plan = generateUnified7DayPlan(v2Context, "2026-10-12");
  console.log("Status:", plan.status);
  if (plan.status === "NO_FEASIBLE_PLAN") {
    console.log("Infeasible reasons:", plan.infeasibleReasons);
  }
  console.log("Composite score:", plan.metrics?.compositeScore, "hardConstraintPass:", plan.metrics?.hardConstraintPass);
  for (const d of plan.dailySummaries || []) {
    const calDev = (((d.totalCalories - plan.dailyTargets.calories) / plan.dailyTargets.calories) * 100).toFixed(1);
    const pDev = (((d.totalProtein - plan.dailyTargets.protein) / plan.dailyTargets.protein) * 100).toFixed(1);
    console.log(`${d.date}: Cal=${d.totalCalories} (${calDev}%), P=${d.totalProtein}g (${pDev}%)`);
    for (const m of d.meals) {
      console.log(`   [${m.mealSlot}] ${m.recipeId || m.sourceType} (${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P): ${(m.items||[]).map(i => `${i.foodName} (${i.quantity}${i.unit})`).join(", ")}`);
    }
  }
} catch (err) {
  console.error("Error generating plan:", err);
}
