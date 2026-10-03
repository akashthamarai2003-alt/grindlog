import { generateMealCandidates } from "../lib/fitness/nutrition/candidate-generator.ts";
import { loadNutritionCatalog, calculateDailyTargets, calculateSlotAllocations } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const profile = {
  userId: "dbg", gender: "male", age: 20, heightCm: 172, weightKg: 65, goal: "maintenance",
  fitnessLevel: "beginner", activityLevel: "moderate", dietPreference: "vegetarian", foodEnvironment: "Hostel",
  mealsPerDay: 4, monthlyBudgetInr: 4500, weeklyBudgetTargetInr: 1100, budgetPolicy: "STRICT",
  allergies: [], dislikedFoods: [], avoidedFoods: [], availableEquipment: ["kettle"], messAvailable: true,
  messMeals: ["lunch", "dinner"], messIncludedInBudget: true, availableFoods: [],
  workoutTime: "19:00:00", wakeTime: "07:30:00", sleepTime: "00:00:00", timezone: "Asia/Kolkata"
};
const cat = loadNutritionCatalog();
const t = calculateDailyTargets(profile);
const allocs = calculateSlotAllocations(t, 4, profile.wakeTime, profile.sleepTime);
for (const a of allocs.filter(a => !profile.messMeals.includes(a.slot))) {
  const c = generateMealCandidates(profile, a.slot, a.targetCalories, a.targetProtein, cat.recipes,
    id => cat.foodById.get(id)?.allergens || [], id => cat.foodById.get(id)?.estimated_cost || 15,
    id => cat.foodById.get(id)?.serving_weight_g || 100);
  console.log(`\n${a.slot} target ${a.targetCalories} kcal / ${a.targetProtein}g P -> ${c.length} candidates`);
  for (const x of c.slice(0, 40)) {
    const scale = a.targetCalories / Math.max(1, x.selectedVariant.targetCalories);
    const pPerRs = x.selectedVariant.targetProtein / Math.max(1, x.estimatedCost);
    console.log(`  ${x.catalogItem.recipe.slug.padEnd(40)} ${String(x.selectedVariant.variantType ?? x.selectedVariant.variant_type ?? x.selectedVariant.tier ?? "?").padEnd(13)} ${String(x.selectedVariant.targetCalories).padStart(4)}kcal ${String(x.selectedVariant.targetProtein).padStart(5)}gP est₹${x.estimatedCost} scaled₹${Math.round(x.estimatedCost*scale)} P/₹${pPerRs.toFixed(2)}`);
  }
}
