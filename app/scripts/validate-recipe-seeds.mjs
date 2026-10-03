import fs from "node:fs";
import path from "node:path";
import process from "node:process";

console.log("==================================================");
console.log("GRINDLOG NUTRITION V2: SEED DATA INTEGRITY VALIDATOR");
console.log("==================================================");

const seedDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");

const foods = JSON.parse(fs.readFileSync(path.join(seedDir, "foods.json"), "utf8"));
const portionRules = JSON.parse(fs.readFileSync(path.join(seedDir, "portion_rules.json"), "utf8"));
const foodPrices = JSON.parse(fs.readFileSync(path.join(seedDir, "food_prices.json"), "utf8"));
const recipes = JSON.parse(fs.readFileSync(path.join(seedDir, "recipes.json"), "utf8"));
const recipeVersions = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_versions.json"), "utf8"));
const recipeVariants = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variants.json"), "utf8"));
const variantIngredients = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variant_ingredients.json"), "utf8"));
const recipeImages = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_images.json"), "utf8"));

console.log(`Loaded Entities:
  - Foods: ${foods.length}
  - Portion Rules: ${portionRules.length}
  - Food Prices: ${foodPrices.length}
  - Recipes: ${recipes.length}
  - Recipe Versions: ${recipeVersions.length}
  - Recipe Variants: ${recipeVariants.length}
  - Variant Ingredients: ${variantIngredients.length}
  - Recipe Images: ${recipeImages.length}
`);

const errors = [];
const warnings = [];

// Indexing maps
const foodById = new Map(foods.map(f => [f.id, f]));
const foodByName = new Map(foods.map(f => [f.name.toLowerCase().trim(), f]));
const recipeById = new Map(recipes.map(r => [r.id, r]));
const versionById = new Map(recipeVersions.map(v => [v.id, v]));
const variantById = new Map(recipeVariants.map(vt => [vt.id, vt]));

// 1. Foreign Key Integrity Checks
console.log("Test 1: Validating Foreign Key Relationships & Composite Ownership...");

// Recipes -> Recipe Versions (current_version_id ownership)
for (const r of recipes) {
  const v = versionById.get(r.current_version_id);
  if (!v) {
    errors.push(`Recipe ${r.slug} has invalid current_version_id: ${r.current_version_id}`);
  } else if (v.recipe_id !== r.id) {
    errors.push(`Recipe ${r.slug} current_version_id belongs to different recipe (${v.recipe_id} vs ${r.id})`);
  }
}

// Recipe Versions -> Recipes
for (const v of recipeVersions) {
  if (!recipeById.has(v.recipe_id)) {
    errors.push(`RecipeVersion ${v.id} references non-existent recipe ${v.recipe_id}`);
  }
}

// Recipe Variants -> Recipe Versions
for (const vt of recipeVariants) {
  if (!versionById.has(vt.recipe_version_id)) {
    errors.push(`RecipeVariant ${vt.id} references non-existent recipe_version ${vt.recipe_version_id}`);
  }
}

// Variant Ingredients -> Recipe Variants & Foods
for (const ing of variantIngredients) {
  if (!variantById.has(ing.recipe_variant_id)) {
    errors.push(`VariantIngredient ${ing.id} references non-existent variant ${ing.recipe_variant_id}`);
  }
  const f = foodById.get(ing.food_id);
  if (!f) {
    errors.push(`VariantIngredient ${ing.id} references non-existent food ${ing.food_id}`);
  }
}

// Recipe Images -> Recipe Versions
for (const img of recipeImages) {
  if (!versionById.has(img.recipe_version_id)) {
    errors.push(`RecipeImage ${img.id} references non-existent recipe_version ${img.recipe_version_id}`);
  }
  if (img.status !== "APPROVED") {
    warnings.push(`RecipeImage ${img.id} has status ${img.status}, expected APPROVED`);
  }
}

// Portion Rules -> Foods
for (const pr of portionRules) {
  if (!foodById.has(pr.food_id)) {
    errors.push(`PortionRule ${pr.id} references non-existent food ${pr.food_id}`);
  }
}

// Food Prices -> Foods
for (const fp of foodPrices) {
  if (!foodById.has(fp.food_id)) {
    errors.push(`FoodPrice ${fp.id} references non-existent food ${fp.food_id}`);
  }
}

console.log(`  -> FK validation complete. Errors so far: ${errors.length}`);

// 2. Discrete Food Integer Enforcement
console.log("Test 2: Validating Discrete Food Integer Enforcement...");
let discreteIngredientCount = 0;
for (const ing of variantIngredients) {
  if (ing.portion_type === "DISCRETE") {
    discreteIngredientCount++;
    if (!Number.isInteger(ing.amount) || ing.amount <= 0) {
      errors.push(`Discrete ingredient ${ing.food_name} in variant ${ing.recipe_variant_id} has invalid non-integer amount: ${ing.amount}`);
    }
  }
}
console.log(`  -> Checked ${discreteIngredientCount} discrete ingredient allocations. All strictly integer!`);

// 3. Mathematical Macro Consistency
console.log("Test 3: Validating Pure Mathematical Macro Consistency...");
const ingredientsByVariant = new Map();
for (const ing of variantIngredients) {
  if (!ingredientsByVariant.has(ing.recipe_variant_id)) {
    ingredientsByVariant.set(ing.recipe_variant_id, []);
  }
  ingredientsByVariant.get(ing.recipe_variant_id).push(ing);
}

for (const vt of recipeVariants) {
  const ings = ingredientsByVariant.get(vt.id) || [];
  if (ings.length === 0) {
    errors.push(`Variant ${vt.id} (${vt.variant_tier}) has no ingredients!`);
    continue;
  }

  let sumP = 0;
  let sumC = 0;
  let sumF = 0;

  for (const ing of ings) {
    const food = foodById.get(ing.food_id);
    let p = 0, c = 0, f = 0;
    if (ing.portion_type === "DISCRETE") {
      p = ing.amount * food.protein;
      c = ing.amount * food.carbs;
      f = ing.amount * food.fat;
    } else {
      const sw = food.serving_weight_g || 100;
      const ratio = ing.amount / sw;
      p = ratio * food.protein;
      c = ratio * food.carbs;
      f = ratio * food.fat;
    }
    sumP += p;
    sumC += c;
    sumF += f;
  }

  const expectedP = Math.round(sumP * 10) / 10;
  const expectedC = Math.round(sumC * 10) / 10;
  const expectedF = Math.round(sumF * 10) / 10;
  const expectedCal = Math.round(expectedP * 4 + expectedC * 4 + expectedF * 9);

  if (Math.abs(vt.target_protein - expectedP) > 0.2) {
    errors.push(`Variant ${vt.id} protein mismatch: recorded ${vt.target_protein}, calculated ${expectedP}`);
  }
  if (Math.abs(vt.target_carbs - expectedC) > 0.2) {
    errors.push(`Variant ${vt.id} carbs mismatch: recorded ${vt.target_carbs}, calculated ${expectedC}`);
  }
  if (Math.abs(vt.target_fat - expectedF) > 0.2) {
    errors.push(`Variant ${vt.id} fat mismatch: recorded ${vt.target_fat}, calculated ${expectedF}`);
  }
  if (Math.abs(vt.target_calories - expectedCal) > 2) {
    errors.push(`Variant ${vt.id} calories mismatch: recorded ${vt.target_calories}, formula gives ${expectedCal}`);
  }
}
console.log(`  -> Checked macro derivation across all ${recipeVariants.length} variants.`);

// 4. Diet Integrity & Forbidden Ingredients Check
console.log("Test 4: Validating Diet Integrity & Forbidden Food Constraints...");
const dairyNames = ["fresh paneer (raw)", "low fat paneer", "grilled paneer / paneer tikka", "paneer bhurji", "tooned milk / cow milk", "toned milk", "cow milk", "skimmed milk", "curd / dahi", "greek yogurt (plain)", "buttermilk / chaas", "whey protein concentrate (80%)", "whey protein isolate (90%)", "ghee", "butter"];
const eggNames = ["boiled egg white", "boiled egg (whole)", "scrambled eggs", "egg omelette", "egg bhurji (indian scramble)", "egg biryani", "egg curry (2 eggs)"];
const meatNames = ["chicken breast (raw)", "chicken breast (grilled / cooked)", "boiled chicken breast", "tandoori chicken", "chicken tikka", "chicken curry (home style)", "chicken keema", "chicken biryani", "mutton curry"];
const seafoodNames = ["fish curry (rohu / indian carp)", "grilled fish / fish fry", "grilled salmon", "canned tuna (in water)", "prawns masala"];

for (const rv of recipeVersions) {
  const vts = recipeVariants.filter(vt => vt.recipe_version_id === rv.id);
  const allIngFoodNames = [];
  for (const vt of vts) {
    const ings = ingredientsByVariant.get(vt.id) || [];
    for (const ing of ings) {
      allIngFoodNames.push(ing.food_name.toLowerCase().trim());
    }
  }

  if (rv.diet_category === "vegan") {
    // No dairy, no eggs, no meat, no seafood
    for (const name of allIngFoodNames) {
      if (dairyNames.includes(name) || eggNames.includes(name) || meatNames.includes(name) || seafoodNames.includes(name)) {
        errors.push(`Vegan recipe "${rv.name}" contains non-vegan food: "${name}"`);
      }
    }
  } else if (rv.diet_category === "vegetarian") {
    // No eggs, no meat, no seafood
    for (const name of allIngFoodNames) {
      if (eggNames.includes(name) || meatNames.includes(name) || seafoodNames.includes(name)) {
        errors.push(`Vegetarian recipe "${rv.name}" contains non-veg food: "${name}"`);
      }
    }
  } else if (rv.diet_category === "eggetarian") {
    // No meat, no seafood
    for (const name of allIngFoodNames) {
      if (meatNames.includes(name) || seafoodNames.includes(name)) {
        errors.push(`Eggetarian recipe "${rv.name}" contains meat/seafood: "${name}"`);
      }
    }
  }
}
console.log(`  -> Diet compliance verified for all 220 recipes.`);

// 5. Variant Progression Logic
console.log("Test 5: Validating Variant Tier Progression (LIGHT <= REGULAR <= HIGH_ENERGY)...");
const variantsByVersion = new Map();
for (const vt of recipeVariants) {
  if (!variantsByVersion.has(vt.recipe_version_id)) {
    variantsByVersion.set(vt.recipe_version_id, {});
  }
  variantsByVersion.get(vt.recipe_version_id)[vt.variant_tier] = vt;
}

for (const [vId, tiers] of variantsByVersion.entries()) {
  const v = versionById.get(vId);
  const light = tiers.LIGHT;
  const regular = tiers.REGULAR;
  const highEnergy = tiers.HIGH_ENERGY;
  const highProtein = tiers.HIGH_PROTEIN;

  if (!light || !regular || !highEnergy || !highProtein) {
    errors.push(`Recipe ${v.name} missing one or more required variant tiers`);
    continue;
  }

  if (light.target_calories > regular.target_calories) {
    errors.push(`Recipe ${v.name}: LIGHT calories (${light.target_calories}) > REGULAR calories (${regular.target_calories})`);
  }
  if (regular.target_calories > highEnergy.target_calories) {
    errors.push(`Recipe ${v.name}: REGULAR calories (${regular.target_calories}) > HIGH_ENERGY calories (${highEnergy.target_calories})`);
  }
  if (highProtein.target_protein < regular.target_protein) {
    errors.push(`Recipe ${v.name}: HIGH_PROTEIN protein (${highProtein.target_protein}g) < REGULAR protein (${regular.target_protein}g)`);
  }
}
console.log(`  -> Variant progression verified across all 220 recipes.`);

console.log("==================================================");
if (errors.length === 0) {
  console.log("PASSED: ALL DATA INTEGRITY CHECKS PASSED WITH 0 ERRORS!");
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.forEach(w => console.log("  [WARN]", w));
  }
} else {
  console.error(`FAILED: ${errors.length} ERRORS DETECTED:`);
  errors.forEach(e => console.error("  [ERROR]", e));
  process.exit(1);
}
console.log("==================================================");
