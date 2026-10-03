import { loadNutritionCatalog } from "../lib/fitness/nutrition/unified-7day-planner.ts";

const catalog = loadNutritionCatalog();
const foodLookup = (id) => catalog.foodById.get(id) || catalog.foodByName.get(id.toLowerCase().trim());

const pFood = foodLookup("Low Fat Paneer");
const cFood = foodLookup("Multigrain Roti");

const targetCal = 563;
const targetP = 46.4;
const fixedCal = 22;
const fixedP = 1.0;

const neededCal = targetCal - fixedCal;
const neededP = targetP - fixedP;

const cp = pFood.calories / 100;
const pp = pFood.protein / 100;
const cc = cFood.calories;
const pc = cFood.protein;

const det = pp * cc - cp * pc;
const idealP = (neededP * cc - neededCal * pc) / det;
const idealC = (neededCal * pp - neededP * cp) / det;

const pStep = 25;
const cStep = 1;

const pVals = [...new Set([
  Math.max(50, Math.floor(idealP / pStep) * pStep),
  Math.max(50, Math.ceil(idealP / pStep) * pStep)
])];

const cVals = [...new Set([
  Math.max(1, Math.floor(idealC / cStep) * cStep),
  Math.max(1, Math.ceil(idealC / cStep) * cStep)
])];

console.log("Candidate P values:", pVals);
console.log("Candidate C values:", cVals);

let bestScore = Infinity;
let bestP = pVals[0];
let bestC = cVals[0];

for (const p of pVals) {
  for (const c of cVals) {
    const totCal = fixedCal + (p / 100 * pFood.calories) + (c * cFood.calories);
    const totP = fixedP + (p / 100 * pFood.protein) + (c * cFood.protein);
    const calErr = (totCal - targetCal) / targetCal;
    const pErr = (totP - targetP) / targetP;
    // We strictly prefer protein not undershooting by more than 3%
    const pUndershootPenalty = pErr < -0.03 ? 5.0 * Math.abs(pErr) : 0;
    const score = Math.pow(calErr, 2) + 2.0 * Math.pow(pErr, 2) + pUndershootPenalty;
    console.log(`Grid (${p}g, ${c}pcs) -> Cal: ${totCal} (${(calErr * 100).toFixed(1)}%), P: ${totP.toFixed(1)}g (${(pErr * 100).toFixed(1)}%) -> score: ${score.toFixed(4)}`);
    if (score < bestScore) {
      bestScore = score;
      bestP = p;
      bestC = c;
    }
  }
}

console.log(`\nWINNER: ${bestP}g Paneer + ${bestC} pieces Roti`);
