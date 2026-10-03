import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const catalog = loadNutritionCatalog();
const r = catalog.recipes.find(r => r.recipeVersion.name.toLowerCase().includes("indian chai with milk"));
console.log("Recipe:", r?.recipeVersion.name);
console.log("Variants:", r?.variants);
for (const ing of r?.variantIngredients || []) {
  console.log(" - ing:", ing.foodName, ing.amount, ing.unit, ing.role, "portionType:", ing.portionType, "variantId:", ing.recipeVariantId);
}
