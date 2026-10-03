import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const catalog = loadNutritionCatalog();
const item = catalog.recipes.find(r => r.recipeVersion.name.includes("Overnight Oats in Milk"));
console.log("Found item:", item?.recipeVersion.name);
const rv = item.recipeVersion;
console.log("Diet:", rv.dietCategory);
console.log("Supported env:", rv.supportedEnvironments);
console.log("Required eq:", rv.requiredEquipment);
console.log("Variants count:", item.variants.length);
console.log("Variant ingredients count:", item.variantIngredients.length);
