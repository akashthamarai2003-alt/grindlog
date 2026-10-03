// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Variant-First Portion Optimizer
// File: lib/fitness/nutrition/portion-optimizer.ts
// Mathematical solver for bounded ingredient calibration using
// food-specific portion rules and strict discrete integer steps.
// ─────────────────────────────────────────────────────────────

import {
  PortionType,
  RecipeVariant,
  RecipeVariantIngredient,
  PortionRule
} from "./domain-types";

export interface OptimizedIngredient {
  foodId: string;
  foodName: string;
  portionType: PortionType;
  amount: number;
  unit: string;
  role: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
}

export interface OptimizedMealResult {
  ingredients: OptimizedIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
  isAdjusted: boolean;
  adjustmentLog?: string[];
}

export interface FoodMacroProfile {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_weight_g?: number;
  serving_unit?: string;
  estimated_cost?: number;
  portion_rule?: {
    portion_type: PortionType;
    unit: string;
    min_portion: number;
    default_portion: number;
    max_sensible_portion: number;
    increment_step: number;
  };
}

function roundTo1(val: number): number {
  return Math.round(val * 10) / 10;
}

/**
 * Resolves the food-specific increment step, min portion, and max portion from portion_rules.
 */
export function resolveFoodPortionBounds(
  food: FoodMacroProfile,
  portionType: PortionType,
  rule?: PortionRule
): { minPortion: number; maxPortion: number; incrementStep: number } {
  if (portionType === "DISCRETE") {
    let min = rule?.minPortion ?? food.portion_rule?.min_portion ?? 1;
    let max = rule?.maxSensiblePortion ?? food.portion_rule?.max_sensible_portion ?? 4;
    const name = food.name.toLowerCase();
    if (name.includes("cheese")) max = Math.min(2, max);
    // If the database rule was specified in grams (e.g. min > 5 or max > 10) but ingredient portion type is DISCRETE, clamp to discrete sensible portion
    if (min > 5) min = 1;
    if (max > 10) {
      if (name.includes("egg white")) max = 10;
      else if (name.includes("egg")) max = 6;
      else if (name.includes("roti") || name.includes("bread") || name.includes("toast") || name.includes("idli")) max = 8;
      else if (name.includes("cheela") || name.includes("paratha")) max = 4;
      else max = 5;
    }
    return {
      minPortion: Math.max(1, min),
      maxPortion: Math.max(min, max),
      incrementStep: 1 // Discrete items scale ONLY in discrete positive integer steps
    };
  }

  // CONTINUOUS: Food-specific increments and sensible maximums
  const name = food.name.toLowerCase();
  let defaultStep = 25;
  let defaultMax = 350;

  if (name.includes("makhana")) {
    defaultStep = 10;
    defaultMax = 60;
  } else if (name.includes("chia") || name.includes("seed")) {
    defaultStep = 5;
    defaultMax = 30;
  } else if (name.includes("peanut butter") || name.includes("almond") || name.includes("peanut") || name.includes("walnut") || name.includes("cashew")) {
    defaultStep = 5;
    defaultMax = 35;
  } else if (/\boil\b/i.test(name) || name.includes("ghee") || (name.includes("butter") && !name.includes("peanut butter"))) {
    defaultStep = 2.5;
    defaultMax = 20;
  } else if (name.includes("sweet corn")) {
    defaultStep = 25;
    defaultMax = 150;
  } else if (name.includes("oat with milk") || name.includes("masala oat") || name.includes("overnight oat")) {
    defaultStep = 25;
    defaultMax = 350; // Cooked porridge
  } else if (name.includes("oat") || name.includes("chicken") || name.includes("paneer") || name.includes("tofu") || name.includes("fish")) {
    defaultStep = 10;
    defaultMax = name.includes("oat") ? 100 : (name.includes("paneer") ? 150 : 250);
  } else if (name.includes("curd") || name.includes("yogurt") || name.includes("milk") || name.includes("chaas")) {
    defaultStep = 50;
    defaultMax = 350;
  } else if (name.includes("rice") || name.includes("dal")) {
    defaultStep = 25;
    defaultMax = 450;
  }

  const isCookingOil = /\boil\b/i.test(name) || name.includes("ghee") || (name.includes("butter") && !name.includes("peanut butter"));
  const minPortion = rule?.minPortion ?? food.portion_rule?.min_portion ?? (isCookingOil ? 2.5 : 20);
  const maxPortion = rule?.maxSensiblePortion ?? food.portion_rule?.max_sensible_portion ?? defaultMax;
  const incrementStep = rule?.incrementStep ?? food.portion_rule?.increment_step ?? defaultStep;

  return { minPortion, maxPortion: Math.max(minPortion, maxPortion), incrementStep };
}

/**
 * Calculates pure mathematical macros for an ingredient based on its portion type.
 * Discrete items require strictly integer amounts.
 */
export function calculateIngredientPortion(
  food: FoodMacroProfile,
  amount: number,
  portionType: PortionType,
  unit: string,
  role: string
): OptimizedIngredient {
  if (portionType === "DISCRETE") {
    const intAmount = Math.max(1, Math.round(amount));
    const cal = Math.round(intAmount * food.calories);
    const p = roundTo1(intAmount * food.protein);
    const c = roundTo1(intAmount * food.carbs);
    const f = roundTo1(intAmount * food.fat);
    const cost = Math.round(intAmount * (food.estimated_cost || 10));

    return {
      foodId: food.id,
      foodName: food.name,
      portionType: "DISCRETE",
      amount: intAmount,
      unit,
      role,
      calories: cal,
      protein: p,
      carbs: c,
      fat: f,
      cost
    };
  }

  // CONTINUOUS
  const sw = food.serving_weight_g && food.serving_weight_g > 0 ? food.serving_weight_g : 100;
  const ratio = amount / sw;
  const cal = Math.round(ratio * food.calories);
  const p = roundTo1(ratio * food.protein);
  const c = roundTo1(ratio * food.carbs);
  const f = roundTo1(ratio * food.fat);
  const cost = Math.round(ratio * (food.estimated_cost || 30));

  return {
    foodId: food.id,
    foodName: food.name,
    portionType: "CONTINUOUS",
    amount: Math.round(amount * 10) / 10,
    unit,
    role,
    calories: cal,
    protein: p,
    carbs: c,
    fat: f,
    cost
  };
}

/**
 * Variant-First Portion Optimizer:
 * 1. Takes the closest pre-validated culinary variant.
 * 2. Calculates residual calorie and protein gap.
 * 3. Adjusts ONLY specific scalable components (primary protein and staple carb).
 * 4. NEVER scales oil, seasoning, or vegetables proportionally.
 * 5. Uses food-specific increment steps (oats 10g, chicken 25g, curd 50g, discrete 1 piece).
 * 6. Guarantees zero macro drift: P * 4 + C * 4 + F * 9 = Total Calories.
 */
export function optimizeMealPortions(
  variant: RecipeVariant,
  ingredients: RecipeVariantIngredient[],
  targetCalories: number,
  targetProtein: number,
  foodLookup: (foodIdOrName: string) => FoodMacroProfile | undefined,
  portionRulesLookup?: (foodId: string) => PortionRule | undefined
): OptimizedMealResult {
  const adjustmentLog: string[] = [];

  // Default to variant targets if invalid
  if (!targetCalories || targetCalories <= 0) targetCalories = variant.targetCalories;
  if (!targetProtein || targetProtein <= 0) targetProtein = variant.targetProtein;

  // 1. Load initial baseline variant ingredients
  let currentIngredients: OptimizedIngredient[] = [];
  for (const ing of ingredients) {
    const food = foodLookup(ing.foodId) || (ing.foodName ? foodLookup(ing.foodName) : undefined);
    if (!food) continue;
    currentIngredients.push(calculateIngredientPortion(food, ing.amount, ing.portionType, ing.unit, ing.role));
  }

  if (currentIngredients.length === 0) {
    return {
      ingredients: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalCost: 0,
      isAdjusted: false
    };
  }

  const sumTotals = (items: OptimizedIngredient[]) => {
    let p = 0, c = 0, f = 0, cost = 0;
    for (const item of items) {
      p += item.protein;
      c += item.carbs;
      f += item.fat;
      cost += item.cost;
    }
    p = roundTo1(p);
    c = roundTo1(c);
    f = roundTo1(f);
    const calories = Math.round(p * 4 + c * 4 + f * 9);
    return { calories, protein: p, carbs: c, fat: f, cost };
  };

  let totals = sumTotals(currentIngredients);

  // Check if initial variant is already within narrow target window
  const calGap = targetCalories - totals.calories;
  const pGap = targetProtein - totals.protein;

  // If already within +-25 kcal and +-3g protein, return baseline variant as is!
  if (Math.abs(calGap) <= 25 && Math.abs(pGap) <= 3) {
    return {
      ingredients: currentIngredients,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalCost: totals.cost,
      isAdjusted: false
    };
  }

  // 2. Locate scalable components
  const proteinIdx = currentIngredients.findIndex(i => i.role === "PRIMARY_PROTEIN");
  let carbIdx = currentIngredients.findIndex(i => i.role === "STAPLE_CARB");
  if (carbIdx === -1) {
    // Only search for genuine carbohydrate staples (grains, bread, oats, sweet potato), NEVER vegetables or seasoning
    carbIdx = currentIngredients.findIndex(
      (i, idx) => idx !== proteinIdx &&
        i.role !== "HEALTHY_FAT" &&
        i.role !== "SEASONING_SAUCE" &&
        i.role !== "VEGETABLE" &&
        i.role !== "PRIMARY_PROTEIN" &&
        i.calories >= 50 &&
        (i.carbs * 4 > i.calories * 0.4)
    );
  }

  let isAdjusted = false;

  // Joint 2-variable exact solver when both primary protein and staple carb exist
  if (proteinIdx !== -1 && carbIdx !== -1) {
    const pItem = currentIngredients[proteinIdx];
    const cItem = currentIngredients[carbIdx];
    const pFood = foodLookup(pItem.foodId);
    const cFood = foodLookup(cItem.foodId);

    if (pFood && cFood && cFood.calories >= 50 && cItem.role !== "VEGETABLE") {
      const pRule = portionRulesLookup ? portionRulesLookup(pItem.foodId) : undefined;
      const cRule = portionRulesLookup ? portionRulesLookup(cItem.foodId) : undefined;

      const pBounds = resolveFoodPortionBounds(pFood, pItem.portionType, pRule);
      const cBounds = resolveFoodPortionBounds(cFood, cItem.portionType, cRule);

      let fixedCal = 0;
      let fixedP = 0;
      for (let i = 0; i < currentIngredients.length; i++) {
        if (i !== proteinIdx && i !== carbIdx) {
          fixedCal += currentIngredients[i].calories;
          fixedP += currentIngredients[i].protein;
        }
      }

      const neededCal = Math.max(0, targetCalories - fixedCal);
      const neededP = Math.max(0, targetProtein - fixedP);

      const pSw = pItem.portionType === "DISCRETE" ? 1 : (pFood.serving_weight_g || 100);
      const cSw = cItem.portionType === "DISCRETE" ? 1 : (cFood.serving_weight_g || 100);

      const cp = pFood.calories / pSw;
      const pp = pFood.protein / pSw;
      const cc = cFood.calories / cSw;
      const pc = cFood.protein / cSw;

      // Solve:
      // cp * p + cc * c = neededCal
      // pp * p + pc * c = neededP
      const det = pp * cc - cp * pc;

      if (Math.abs(det) > 0.05) {
        let idealP = (neededP * cc - neededCal * pc) / det;
        let idealC = (neededCal * pp - neededP * cp) / det;

        // KKT boundary projection when unconstrained solution violates bounds
        const maxAllowedP = Math.min(
          pBounds.maxPortion,
          Math.max(pBounds.minPortion, Math.ceil((targetProtein * 1.12) / pp))
        );

        if (idealP < pBounds.minPortion) {
          idealP = pBounds.minPortion;
          idealC = Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, (neededCal - cp * idealP) / cc));
        } else if (idealP > maxAllowedP) {
          idealP = maxAllowedP;
          idealC = Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, (neededCal - cp * idealP) / cc));
        }

        if (idealC < cBounds.minPortion) {
          idealC = cBounds.minPortion;
          idealP = Math.max(pBounds.minPortion, Math.min(maxAllowedP, (neededP - pc * idealC) / pp));
        } else if (idealC > cBounds.maxPortion) {
          idealC = cBounds.maxPortion;
          // CRITICAL: Size primary protein by PROTEIN target, never carbohydrate calorie deficit!
          idealP = Math.max(pBounds.minPortion, Math.min(maxAllowedP, (neededP - pc * idealC) / pp));
        }

        const stepP = pBounds.incrementStep;
        const stepC = cBounds.incrementStep;

        const pVals = [...new Set([
          Math.max(pBounds.minPortion, Math.min(maxAllowedP, pItem.portionType === "DISCRETE" ? Math.floor(idealP) : Math.floor(idealP / stepP) * stepP)),
          Math.max(pBounds.minPortion, Math.min(maxAllowedP, pItem.portionType === "DISCRETE" ? Math.ceil(idealP) : Math.ceil(idealP / stepP) * stepP))
        ])];

        const cVals = [...new Set([
          Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, cItem.portionType === "DISCRETE" ? Math.floor(idealC) : Math.floor(idealC / stepC) * stepC)),
          Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, cItem.portionType === "DISCRETE" ? Math.ceil(idealC) : Math.ceil(idealC / stepC) * stepC))
        ])];

        let bestScore = Infinity;
        let bestP = pVals[0];
        let bestC = cVals[0];

        for (const p of pVals) {
          for (const c of cVals) {
            const ingP = calculateIngredientPortion(pFood, p, pItem.portionType, pItem.unit, pItem.role);
            const ingC = calculateIngredientPortion(cFood, c, cItem.portionType, cItem.unit, cItem.role);
            const totCal = fixedCal + ingP.calories + ingC.calories;
            const totP = fixedP + ingP.protein + ingC.protein;

            const calErr = (totCal - targetCalories) / (targetCalories || 400);
            const pErr = (totP - targetProtein) / (targetProtein || 30);

            // Penalties for crossing hard gate thresholds
            const pUndershootPenalty = pErr < -0.04 ? 25.0 * Math.abs(pErr + 0.04) : 0;
            const pOvershootPenalty = pErr > 0.06 ? 30.0 * (pErr - 0.06) : 0;
            const calUndershootPenalty = calErr < -0.04 ? 20.0 * Math.abs(calErr + 0.04) : 0;
            const calOvershootPenalty = calErr > 0.04 ? 25.0 * (calErr - 0.04) : 0;

            const score = Math.pow(calErr, 2) + 2.0 * Math.pow(pErr, 2) +
              pUndershootPenalty + pOvershootPenalty + calUndershootPenalty + calOvershootPenalty;
            if (score < bestScore) {
              bestScore = score;
              bestP = p;
              bestC = c;
            }
          }
        }

        currentIngredients[proteinIdx] = calculateIngredientPortion(pFood, bestP, pItem.portionType, pItem.unit, pItem.role);
        currentIngredients[carbIdx] = calculateIngredientPortion(cFood, bestC, cItem.portionType, cItem.unit, cItem.role);
        isAdjusted = true;
        adjustmentLog.push(`Grid-optimized ${pItem.foodName} to ${bestP}${pItem.unit} and ${cItem.foodName} to ${bestC}${cItem.unit}`);
      }
    }
  } else if (proteinIdx !== -1 && carbIdx === -1) {
    // Only protein is scalable
    const pItem = currentIngredients[proteinIdx];
    const pFood = foodLookup(pItem.foodId);
    if (pFood) {
      const pRule = portionRulesLookup ? portionRulesLookup(pItem.foodId) : undefined;
      const pBounds = resolveFoodPortionBounds(pFood, pItem.portionType, pRule);
      let fixedP = 0;
      let fixedCal = 0;
      for (let i = 0; i < currentIngredients.length; i++) {
        if (i !== proteinIdx) {
          fixedCal += currentIngredients[i].calories;
          fixedP += currentIngredients[i].protein;
        }
      }
      const neededP = Math.max(0, targetProtein - fixedP);
      const pSw = pItem.portionType === "DISCRETE" ? 1 : (pFood.serving_weight_g || 100);
      const pp = pFood.protein / pSw;
      const maxAllowedP = Math.min(
        pBounds.maxPortion,
        Math.max(pBounds.minPortion, Math.ceil((targetProtein * 1.12) / pp))
      );
      const idealP = Math.min(maxAllowedP, neededP / pp);
      const stepP = pBounds.incrementStep;

      const pVals = [...new Set([
        Math.max(pBounds.minPortion, Math.min(maxAllowedP, pItem.portionType === "DISCRETE" ? Math.floor(idealP) : Math.floor(idealP / stepP) * stepP)),
        Math.max(pBounds.minPortion, Math.min(maxAllowedP, pItem.portionType === "DISCRETE" ? Math.ceil(idealP) : Math.ceil(idealP / stepP) * stepP))
      ])];

      let bestScore = Infinity;
      let bestP = pVals[0];

      for (const p of pVals) {
        const ingP = calculateIngredientPortion(pFood, p, pItem.portionType, pItem.unit, pItem.role);
        const totCal = fixedCal + ingP.calories;
        const totP = fixedP + ingP.protein;
        const calErr = (totCal - targetCalories) / (targetCalories || 400);
        const pErr = (totP - targetProtein) / (targetProtein || 30);
        const pUndershootPenalty = pErr < -0.04 ? 25.0 * Math.abs(pErr + 0.04) : 0;
        const pOvershootPenalty = pErr > 0.06 ? 30.0 * (pErr - 0.06) : 0;
        const calUndershootPenalty = calErr < -0.04 ? 20.0 * Math.abs(calErr + 0.04) : 0;
        const calOvershootPenalty = calErr > 0.04 ? 25.0 * (calErr - 0.04) : 0;
        const score = Math.pow(calErr, 2) + 2.0 * Math.pow(pErr, 2) +
          pUndershootPenalty + pOvershootPenalty + calUndershootPenalty + calOvershootPenalty;
        if (score < bestScore) {
          bestScore = score;
          bestP = p;
        }
      }

      currentIngredients[proteinIdx] = calculateIngredientPortion(pFood, bestP, pItem.portionType, pItem.unit, pItem.role);
      isAdjusted = true;
      adjustmentLog.push(`Single-scaled ${pItem.foodName} to ${bestP}${pItem.unit}`);
    }
  } else if (carbIdx !== -1 && proteinIdx === -1) {
    // Only carb is scalable
    const cItem = currentIngredients[carbIdx];
    const cFood = foodLookup(cItem.foodId);
    if (cFood) {
      const cRule = portionRulesLookup ? portionRulesLookup(cItem.foodId) : undefined;
      const cBounds = resolveFoodPortionBounds(cFood, cItem.portionType, cRule);
      let fixedCal = 0;
      let fixedP = 0;
      for (let i = 0; i < currentIngredients.length; i++) {
        if (i !== carbIdx) {
          fixedCal += currentIngredients[i].calories;
          fixedP += currentIngredients[i].protein;
        }
      }
      const neededCal = Math.max(0, targetCalories - fixedCal);
      const cSw = cItem.portionType === "DISCRETE" ? 1 : (cFood.serving_weight_g || 100);
      const cc = cFood.calories / cSw;
      const idealC = neededCal / cc;
      const stepC = cBounds.incrementStep;

      const cVals = [...new Set([
        Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, cItem.portionType === "DISCRETE" ? Math.floor(idealC) : Math.floor(idealC / stepC) * stepC)),
        Math.max(cBounds.minPortion, Math.min(cBounds.maxPortion, cItem.portionType === "DISCRETE" ? Math.ceil(idealC) : Math.ceil(idealC / stepC) * stepC))
      ])];

      let bestScore = Infinity;
      let bestC = cVals[0];

      for (const c of cVals) {
        const ingC = calculateIngredientPortion(cFood, c, cItem.portionType, cItem.unit, cItem.role);
        const totCal = fixedCal + ingC.calories;
        const totP = fixedP + ingC.protein;
        const calErr = (totCal - targetCalories) / (targetCalories || 400);
        const pErr = (totP - targetProtein) / (targetProtein || 30);
        const pUndershootPenalty = pErr < -0.04 ? 25.0 * Math.abs(pErr + 0.04) : 0;
        const pOvershootPenalty = pErr > 0.06 ? 30.0 * (pErr - 0.06) : 0;
        const calUndershootPenalty = calErr < -0.04 ? 20.0 * Math.abs(calErr + 0.04) : 0;
        const calOvershootPenalty = calErr > 0.04 ? 25.0 * (calErr - 0.04) : 0;
        const score = Math.pow(calErr, 2) + 2.0 * Math.pow(pErr, 2) +
          pUndershootPenalty + pOvershootPenalty + calUndershootPenalty + calOvershootPenalty;
        if (score < bestScore) {
          bestScore = score;
          bestC = c;
        }
      }

      currentIngredients[carbIdx] = calculateIngredientPortion(cFood, bestC, cItem.portionType, cItem.unit, cItem.role);
      isAdjusted = true;
      adjustmentLog.push(`Single-scaled ${cItem.foodName} to ${bestC}${cItem.unit}`);
    }
  }

  // Ensure discrete items remain strictly integer
  for (const item of currentIngredients) {
    if (item.portionType === "DISCRETE") {
      item.amount = Math.max(1, Math.round(item.amount));
    }
  }

  const finalTotals = sumTotals(currentIngredients);

  return {
    ingredients: currentIngredients,
    totalCalories: finalTotals.calories,
    totalProtein: finalTotals.protein,
    totalCarbs: finalTotals.carbs,
    totalFat: finalTotals.fat,
    totalCost: finalTotals.cost,
    isAdjusted,
    adjustmentLog
  };
}
