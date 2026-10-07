import fs from "node:fs";
import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";

const personas = [
  {
    id: "P01",
    rawProfile: {
      user_id: "p01-veg-maint",
      gender: "Male",
      age: 25,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender", "refrigerator"],
      workout_time: "18:00:00"
    }
  }
];

const v2 = V2PlanService.mapProfileToV2Context(personas[0].rawProfile);
const plan = generateUnified7DayPlan(v2, "2026-10-12");

for (const m of plan.plannedMeals) {
  for (const it of m.items || []) {
    if (it.portionType === "CONTINUOUS" && it.quantity > 300) {
      console.log(`P01 Large portion: ${it.foodName} = ${it.quantity}${it.unit} in ${m.mealSlot} on ${m.localDate}`);
    }
  }
}
