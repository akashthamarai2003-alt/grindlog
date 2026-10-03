import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const catalog = loadNutritionCatalog();

const bread = catalog.foodByName.get("whole wheat bread");
const pb = catalog.foodByName.get("natural peanut butter");
const sm = catalog.foodByName.get("soy milk (unsweetened)");
const ban = catalog.foodByName.get("banana");

console.log("Bread:", bread?.calories, "kcal / piece | P:", bread?.protein, "| unit:", bread?.serving_unit, "sw:", bread?.serving_weight_g);
console.log("PB:", pb?.calories, "kcal /", pb?.serving_weight_g, "g | P:", pb?.protein);
console.log("Soy milk:", sm?.calories, "kcal /", sm?.serving_weight_g, "g | P:", sm?.protein);
console.log("Banana:", ban?.calories, "kcal / piece | P:", ban?.protein);

// Check Moong Dal Cheela for Jain Day 5
const cheela = catalog.foodByName.get("moong dal cheela");
console.log("Cheela:", cheela?.calories, "kcal / piece | P:", cheela?.protein);
