import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { optimizeMealPortions, resolveFoodPortionBounds } from "../lib/fitness/nutrition/portion-optimizer.ts";

const catalog = loadNutritionCatalog();
const foodLookup = (nameOrId) => catalog.foodById.get(nameOrId) || catalog.foodByName.get(nameOrId.toLowerCase().trim());

const recipe = catalog.recipes.find(r => r.recipe.slug === "boiled-chicken-breast-with-sweet-potato" || (r.recipeVersion.name.includes("Chicken") && r.recipeVersion.name.includes("Sweet Potato")));
console.log("Found recipe:", recipe?.recipeVersion.name);

const variant = recipe.variants[0];
const varIngs = recipe.variantIngredients.filter(i => i.recipeVariantId === variant.id);

console.log("Variant:", variant.name, "targetCal:", variant.targetCalories, "targetP:", variant.targetProtein);
console.log("Ingredients:", varIngs.map(i => `${i.foodName} (${i.amount}${i.unit}, role=${i.role})`));

const pFood = foodLookup("Boiled Chicken Breast");
const cFood = foodLookup("Boiled Sweet Potato");
console.log("pFood:", pFood.calories, pFood.protein, "sw:", pFood.serving_weight_g);
console.log("cFood:", cFood.calories, cFood.protein, "sw:", cFood.serving_weight_g);

const cp = pFood.calories / (pFood.serving_weight_g || 100);
const pp = pFood.protein / (pFood.serving_weight_g || 100);
const cc = cFood.calories / 1;
const pc = cFood.protein / 1;
const det = pp * cc - cp * pc;

console.log("pBounds resolved:", resolveFoodPortionBounds(pFood, "CONTINUOUS"));
console.log("cBounds resolved:", resolveFoodPortionBounds(cFood, "DISCRETE"));
const neededCal = 1235 - 22; // cucumber = 22
const neededP = 57.4 - 1; // cucumber = 1
const idealP = (neededP * cc - neededCal * pc) / det;
const idealC = (neededCal * pp - neededP * cp) / det;
const pBounds = { minPortion: 50, maxPortion: 250, incrementStep: 10 };
const maxAllowedP = Math.min(pBounds.maxPortion, Math.max(pBounds.minPortion, Math.ceil((57.4 * 1.12) / pp)));
console.log("maxAllowedP:", maxAllowedP);

let idealP_kkt = idealP;
let idealC_kkt = idealC;
if (idealC_kkt > 5) {
  idealC_kkt = 5;
  idealP_kkt = Math.max(pBounds.minPortion, Math.min(maxAllowedP, (neededP - pc * idealC_kkt) / pp));
}
console.log("idealP_kkt:", idealP_kkt, "idealC_kkt:", idealC_kkt);

const pVals = [...new Set([
  Math.max(pBounds.minPortion, Math.min(maxAllowedP, Math.floor(idealP_kkt / 10) * 10)),
  Math.max(pBounds.minPortion, Math.min(maxAllowedP, Math.ceil(idealP_kkt / 10) * 10))
])];
console.log("pVals calculated:", pVals);

const opt = optimizeMealPortions(variant, varIngs, 1235, 57.4, foodLookup);
console.log("\nOptimized Result:");
console.log("Calories:", opt.totalCalories, "Protein:", opt.totalProtein);
for (const ing of opt.ingredients) {
  console.log(` - ${ing.foodName}: ${ing.amount}${ing.unit} -> ${ing.calories} kcal, ${ing.protein}g P`);
}
