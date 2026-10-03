import { loadNutritionCatalog, calculateDailyTargets, calculateSlotAllocations } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { generateMealCandidates } from "../lib/fitness/nutrition/candidate-generator.ts";

const profile = {
  userId: "test-user-hostel", gender: "male", age: 20, heightCm: 172, weightKg: 65, goal: "maintenance",
  fitnessLevel: "beginner", activityLevel: "moderate", dietPreference: "vegetarian", foodEnvironment: "Hostel",
  mealsPerDay: 4, monthlyBudgetInr: 4500, weeklyBudgetTargetInr: 1100, budgetPolicy: "STRICT",
  allergies: [], dislikedFoods: [], avoidedFoods: [], availableEquipment: ["kettle"], messAvailable: true,
  messMeals: ["lunch", "dinner"], messIncludedInBudget: true, availableFoods: [],
  workoutTime: "19:00:00", wakeTime: "07:30:00", sleepTime: "00:00:00", timezone: "Asia/Kolkata"
};

const catalog = loadNutritionCatalog();
const dailyTargets = calculateDailyTargets(profile);
const slotAllocations = calculateSlotAllocations(dailyTargets, profile.mealsPerDay, profile.wakeTime, profile.sleepTime);

console.log("Daily targets:", dailyTargets);
for (const alloc of slotAllocations) {
  console.log(`Slot ${alloc.slot}: targetCal = ${alloc.targetCalories}, targetP = ${alloc.targetProtein}`);
  const isMess = profile.messAvailable && profile.messMeals.includes(alloc.slot);
  if (!isMess) {
    const candidates = generateMealCandidates(
      profile, alloc.slot, alloc.targetCalories, alloc.targetProtein,
      catalog.recipes,
      id => catalog.foodById.get(id)?.allergens || [],
      id => catalog.foodById.get(id)?.estimated_cost || 15,
      id => catalog.foodById.get(id)?.serving_weight_g || 100
    );
    console.log(`  Top 3 candidates for ${alloc.slot}:`);
    for (const c of candidates.slice(0, 3)) {
      console.log(`    - ${c.catalogItem.recipe.name} (${c.selectedVariant.variantType}): score ${c.score}, estCost ₹${c.estimatedCost}, cal ${c.selectedVariant.targetCalories}, P ${c.selectedVariant.targetProtein}`);
    }
  }
}
