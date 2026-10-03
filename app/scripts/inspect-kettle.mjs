import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const profile = {
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
};

const res = generateUnified7DayPlan(profile, "2026-10-05");
const day3 = res.dailySummaries[2];
console.log("Day 3 total cal:", day3.totalCalories, "P:", day3.totalProtein);
