import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const catalog = loadNutritionCatalog();
const foodLookup = (id) => catalog.foodById.get(id) || catalog.foodByName.get(id.toLowerCase().trim());

const pFood = foodLookup("Low Fat Paneer");
const cFood = foodLookup("Multigrain Roti");

console.log("pFood:", pFood.calories, "kcal /", pFood.serving_weight_g, "g | protein:", pFood.protein);
console.log("cFood:", cFood.calories, "kcal / piece | protein:", cFood.protein);

const targetCal = 563;
const targetP = 46.4;
const cucumberCal = 22;
const cucumberP = 1.0;

const neededCal = targetCal - cucumberCal; // 541 kcal
const neededP = targetP - cucumberP; // 45.4 g P

const cp = pFood.calories / (pFood.serving_weight_g || 100); // 180 / 100 = 1.8 kcal/g
const pp = pFood.protein / (pFood.serving_weight_g || 100);  // 25 / 100 = 0.25 g P/g

const cc = cFood.calories; // 115 kcal/piece
const pc = cFood.protein;  // 4 g P/piece

const det = pp * cc - cp * pc; // 0.25 * 115 - 1.8 * 4 = 28.75 - 7.2 = 21.55
console.log("det:", det);

const idealP = (neededP * cc - neededCal * pc) / det;
const idealC = (neededCal * pp - neededP * cp) / det;

console.log("idealP (g paneer):", idealP);
console.log("idealC (pieces roti):", idealC);

const roundedP = Math.round(idealP / 25) * 25;
const roundedC = Math.round(idealC);

console.log("roundedP:", roundedP, "roundedC:", roundedC);

const actualCal = cucumberCal + (roundedP / 100 * pFood.calories) + (roundedC * cFood.calories);
const actualP = cucumberP + (roundedP / 100 * pFood.protein) + (roundedC * cFood.protein);

console.log("Analytical Result -> Cal:", actualCal, "(diff:", actualCal - targetCal, ") | P:", actualP, "g (diff:", (actualP - targetP).toFixed(1), ")");
