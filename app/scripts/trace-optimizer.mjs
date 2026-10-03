import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { optimizeMealPortions } from "../lib/fitness/nutrition/portion-optimizer.ts";

const catalog = loadNutritionCatalog();
const foodLookup = (id) => catalog.foodById.get(id) || catalog.foodByName.get(id.toLowerCase().trim());
const portionRulesLookup = (id) => {
  const pr = catalog.foodById.get(id)?.portion_rule;
  if (!pr) return undefined;
  return {
    id,
    foodId: id,
    portionType: pr.portion_type,
    unit: pr.unit,
    minPortion: pr.min_portion,
    defaultPortion: pr.default_portion,
    maxSensiblePortion: pr.max_sensible_portion,
    incrementStep: pr.increment_step
  };
};

const paneerRecipe = catalog.recipes.find(r => r.recipeVersion.name.toLowerCase().includes("paneer") && r.recipeVersion.name.toLowerCase().includes("roti"));
// pick BALANCED variant
const variant = paneerRecipe.variants.find(v => v.variantTier === "BALANCED") || paneerRecipe.variants[0];
const variantIngs = paneerRecipe.variantIngredients.filter(vi => vi.recipeVariantId === variant.id);

const targetCal = Math.round(1482 * 0.38); // 563 kcal
const targetP = Math.round(122 * 0.38); // 46.4g P

console.log("Variant:", variant.variantTier, "targetCal:", variant.targetCalories, "targetP:", variant.targetProtein);
console.log("Requested targetCal:", targetCal, "targetP:", targetP);

const res = optimizeMealPortions(variant, variantIngs, targetCal, targetP, foodLookup, portionRulesLookup);
console.log("Optimized Result:", res.totalCalories, "kcal,", res.totalProtein, "g P");
for (const ing of res.ingredients) {
  console.log(" -", ing.amount, ing.unit, ing.foodName, "->", ing.calories, "kcal,", ing.protein, "g P (role:", ing.role, "type:", ing.portionType, ")");
}
console.log("Log:", res.adjustmentLog);
