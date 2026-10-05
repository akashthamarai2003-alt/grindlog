import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

const catalogFoodsPath = path.resolve(process.cwd(), "supabase/seed/catalog-foods.json");
const RAW_CATALOG_FOODS = JSON.parse(fs.readFileSync(catalogFoodsPath, "utf8"));

/**
 * Discrete foods (piece/slice) are consumed by the planner as "1 row = 1 unit".
 * Some source rows describe a multi-unit serving (e.g. "2 slices (60g)", "6 pieces (150g)").
 * Without normalization, "2 slice bread" would be computed as 4 slices of nutrition and cost.
 * We divide macros, weight and cost by the unit count and keep the original serving for provenance.
 */
function normalizeDiscreteServing(food) {
  const isDiscrete = food.serving_unit === "piece" || food.serving_unit === "slice";
  const m = typeof food.serving_size === "string" ? food.serving_size.match(/^\s*(\d+)\s+([a-zA-Z]+)/) : null;
  const n = m ? parseInt(m[1], 10) : 1;
  if (!isDiscrete || !(n > 1)) return food;
  const r1 = (v) => Math.round(v * 10) / 10;
  const unitWeight = food.serving_weight_g ? Math.round(food.serving_weight_g / n) : undefined;
  const unitWord = food.serving_unit === "slice" ? "slice" : "piece";
  return {
    ...food,
    serving_size: unitWeight ? `1 ${unitWord} (${unitWeight}g)` : `1 ${unitWord}`,
    calories: Math.round(food.calories / n),
    protein: r1(food.protein / n),
    carbs: r1(food.carbs / n),
    fat: r1(food.fat / n),
    estimated_cost: Math.max(1, Math.round((food.estimated_cost || 30) / n)),
    serving_weight_g: unitWeight ?? food.serving_weight_g,
    source_serving_size: food.serving_size,
    unit_normalization_factor: n
  };
}

export const CATALOG_FOODS = RAW_CATALOG_FOODS.map(normalizeDiscreteServing);

// Build lookup map by lowercase food name
export const FOODS_BY_NAME = new Map();
for (const food of CATALOG_FOODS) {
  FOODS_BY_NAME.set(food.name.toLowerCase().trim(), food);
}

export function generateDeterministicUuid(namespace, key) {
  const hash = crypto.createHash("md5").update(`${namespace}:${key}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + hash.slice(18, 20),
    hash.slice(20, 32)
  ].join("-");
}

export function getFood(name) {
  const found = FOODS_BY_NAME.get(name.toLowerCase().trim());
  if (!found) {
    throw new Error(`Food not found in catalog-foods.json: "${name}"`);
  }
  return found;
}

export function roundTo1(val) {
  return Math.round(val * 10) / 10;
}

export function calculateIngredientMacros(food, amount, unit, portionType) {
  if (portionType === "DISCRETE") {
    if (!Number.isInteger(amount)) {
      throw new Error(`Discrete food "${food.name}" requires integer amount, got: ${amount}`);
    }
    const cal = amount * food.calories;
    const p = amount * food.protein;
    const c = amount * food.carbs;
    const f = amount * food.fat;
    return {
      calories: Math.round(cal),
      protein: roundTo1(p),
      carbs: roundTo1(c),
      fat: roundTo1(f)
    };
  }

  // CONTINUOUS
  const servingWeight = food.serving_weight_g || 100;
  const ratio = amount / servingWeight;
  const cal = ratio * food.calories;
  const p = ratio * food.protein;
  const c = ratio * food.carbs;
  const f = ratio * food.fat;
  return {
    calories: Math.round(cal),
    protein: roundTo1(p),
    carbs: roundTo1(c),
    fat: roundTo1(f)
  };
}

export function buildRecipeRecord(def) {
  const recipeId = generateDeterministicUuid("recipe", def.slug);
  const versionId = generateDeterministicUuid("recipe_version", `${def.slug}:v1`);
  const imageId = generateDeterministicUuid("recipe_image", `${def.slug}:v1:img`);

  // Validate primary protein exists
  const primaryFood = getFood(def.primary_protein);

  // Validate diet compatibility
  const dietCategory = def.diet_category;
  let compatibleDiets = [];
  if (dietCategory === "vegan") compatibleDiets = ["vegan", "vegetarian", "eggetarian", "non-veg"];
  else if (dietCategory === "vegetarian") compatibleDiets = ["vegetarian", "eggetarian", "non-veg"];
  else if (dietCategory === "eggetarian") compatibleDiets = ["eggetarian", "non-veg"];
  else if (dietCategory === "non-veg") compatibleDiets = ["non-veg"];

  const variants = [];
  const variantIngredients = [];

  const requiredTiers = ["LIGHT", "REGULAR", "HIGH_ENERGY", "HIGH_PROTEIN"];

  for (const tier of requiredTiers) {
    const tierDef = def.variants[tier];
    if (!tierDef || !tierDef.ingredients || tierDef.ingredients.length === 0) {
      throw new Error(`Recipe "${def.slug}" missing required variant tier: ${tier}`);
    }

    const variantId = generateDeterministicUuid("recipe_variant", `${def.slug}:v1:${tier}`);

    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    const ingRows = [];

    for (const ing of tierDef.ingredients) {
      const food = getFood(ing.name);
      const foodId = generateDeterministicUuid("food", food.name);
      const portionType = ing.portion_type || food.portion_rule.portion_type;
      const unit = ing.unit || food.portion_rule.unit;
      const amount = ing.amount;

      const macros = calculateIngredientMacros(food, amount, unit, portionType);
      totalP += macros.protein;
      totalC += macros.carbs;
      totalF += macros.fat;

      const ingId = generateDeterministicUuid("variant_ingredient", `${variantId}:${food.name}`);

      ingRows.push({
        id: ingId,
        recipe_variant_id: variantId,
        food_id: foodId,
        food_name: food.name,
        portion_type: portionType,
        amount: amount,
        unit: unit,
        min_portion: ing.min_portion ?? (portionType === "DISCRETE" ? 1 : Math.round(amount * 0.5)),
        max_portion: ing.max_portion ?? (portionType === "DISCRETE" ? amount + 2 : Math.round(amount * 2)),
        increment_step: ing.increment_step ?? (portionType === "DISCRETE" ? 1 : 25),
        role: ing.role || "STAPLE_CARB",
        is_removable: ing.is_removable ?? false,
        macros
      });
    }

    const roundedP = roundTo1(totalP);
    const roundedC = roundTo1(totalC);
    const roundedF = roundTo1(totalF);
    const targetCalories = Math.round(roundedP * 4 + roundedC * 4 + roundedF * 9);

    variants.push({
      id: variantId,
      recipe_version_id: versionId,
      variant_tier: tier,
      target_calories: targetCalories,
      target_protein: roundedP,
      target_carbs: roundedC,
      target_fat: roundedF
    });

    variantIngredients.push(...ingRows);
  }

  const recipe = {
    id: recipeId,
    slug: def.slug,
    current_version_id: versionId,
    status: "PUBLISHED"
  };

  const recipeVersion = {
    id: versionId,
    recipe_id: recipeId,
    version: 1,
    name: def.name,
    description: def.description || `Authentic ${def.cuisine || 'Homestyle Indian'} ${def.name}.`,
    diet_category: dietCategory,
    compatible_diets: compatibleDiets,
    dietary_tags: def.dietary_tags || [],
    cuisine: def.cuisine || "Homestyle Indian",
    prep_instructions: def.prep_instructions || "Cook ingredients according to standard Indian homestyle recipe.",
    cooking_time_min: def.cooking_time_min || 20,
    difficulty: def.difficulty || "easy",
    required_equipment: def.required_equipment || ["stove"],
    supported_environments: def.supported_environments || ["I Cook", "Home"],
    primary_protein: primaryFood.name,
    is_locked: true
  };

  const recipeImage = {
    id: imageId,
    recipe_version_id: versionId,
    storage_path: `recipe-images/${def.slug}-v1.webp`,
    url: `https://images.grindlog.in/recipes/${def.slug}.webp`,
    // A seed record is a production brief, not proof of a reviewed image file.
    status: "DRAFT",
    alt_text: `Plate of ${def.name}`,
    dominant_foods: def.dominant_foods || [primaryFood.name],
    is_primary: true
  };

  return {
    recipe,
    recipeVersion,
    variants,
    variantIngredients,
    recipeImage
  };
}
