import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import {
  CATALOG_FOODS,
  generateDeterministicUuid,
  buildRecipeRecord
} from "./recipe-builder-helpers.mjs";

import { VEGAN_RECIPES } from "./recipe-definitions-vegan.mjs";
import { VEGETARIAN_RECIPES } from "./recipe-definitions-vegetarian.mjs";
import { EGGETARIAN_RECIPES } from "./recipe-definitions-eggetarian.mjs";
import { NONVEG_RECIPES } from "./recipe-definitions-nonveg.mjs";

console.log("==================================================");
console.log("GRINDLOG NUTRITION V2: MASTER SEED BUILDER");
console.log("==================================================");

const allRecipeDefs = [
  ...VEGAN_RECIPES,
  ...VEGETARIAN_RECIPES,
  ...EGGETARIAN_RECIPES,
  ...NONVEG_RECIPES
];

console.log(`Loaded ${CATALOG_FOODS.length} verified catalog foods.`);
console.log(`Loaded ${allRecipeDefs.length} recipe definitions:`);
console.log(`  - Vegan: ${VEGAN_RECIPES.length}`);
console.log(`  - Vegetarian: ${VEGETARIAN_RECIPES.length}`);
console.log(`  - Eggetarian: ${EGGETARIAN_RECIPES.length}`);
console.log(`  - Non-Veg: ${NONVEG_RECIPES.length}`);

// Ensure seed directory exists
const seedOutputDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");
if (!fs.existsSync(seedOutputDir)) {
  fs.mkdirSync(seedOutputDir, { recursive: true });
}

// 1. Prepare Foods, Portion Rules, and Food Prices
const foodsTableRows = [];
const portionRulesRows = [];
const foodPricesRows = [];

for (const f of CATALOG_FOODS) {
  const foodId = generateDeterministicUuid("food", f.name);
  const isDiscreteUnit = f.serving_unit === "piece" || f.serving_unit === "slice";
  const discreteMax = Math.max(4, Math.min(8, (f.unit_normalization_factor || 1) * 2));
  const portionRule = f.portion_rule || {
    portion_type: isDiscreteUnit ? "DISCRETE" : "CONTINUOUS",
    unit: f.serving_unit || "g",
    min_portion: isDiscreteUnit ? 1 : 25,
    default_portion: isDiscreteUnit ? (f.unit_normalization_factor || 1) : (f.serving_weight_g || 100),
    max_sensible_portion: isDiscreteUnit ? discreteMax : 300,
    increment_step: isDiscreteUnit ? 1 : 25
  };

  foodsTableRows.push({
    id: foodId,
    name: f.name,
    category: f.category || "Protein",
    serving_size: f.serving_size || "100g",
    calories: f.calories,
    protein: f.protein,
    carbs: f.carbs,
    fat: f.fat,
    estimated_cost: f.estimated_cost || 30,
    diet_type: f.diet_type || "veg",
    is_pg_friendly: f.is_pg_friendly ?? true,
    serving_unit: f.serving_unit || "g",
    serving_weight_g: f.serving_weight_g || (portionRule.unit === "piece" ? 100 : 100),
    preparation_state: f.preparation_state || "cooked",
    dietary_tags: f.dietary_tags || [],
    allergens: f.allergens || [],
    ...(f.unit_normalization_factor ? { source_serving_size: f.source_serving_size, unit_normalization_factor: f.unit_normalization_factor } : {})
  });

  portionRulesRows.push({
    id: generateDeterministicUuid("portion_rule", foodId),
    food_id: foodId,
    food_name: f.name,
    portion_type: portionRule.portion_type,
    unit: portionRule.unit,
    min_portion: portionRule.min_portion,
    default_portion: portionRule.default_portion,
    max_sensible_portion: portionRule.max_sensible_portion,
    increment_step: portionRule.increment_step
  });

  foodPricesRows.push({
    id: generateDeterministicUuid("food_price", `${foodId}:IN-DEFAULT:2026-10-01`),
    food_id: foodId,
    food_name: f.name,
    price_inr: f.estimated_cost || 30,
    quantity: portionRule.portion_type === "DISCRETE" ? 1 : (f.serving_weight_g || 100),
    quantity_unit: portionRule.unit,
    region_code: "IN-DEFAULT",
    source: "curated_estimate_2026",
    effective_from: "2026-10-01"
  });
}

// 2. Build All Recipes and Related Rows
const recipesRows = [];
const recipeVersionsRows = [];
const recipeVariantsRows = [];
const recipeVariantIngredientsRows = [];
const recipeImagesRows = [];

const seenSlugs = new Set();
// Preserve previously reviewed images when rebuilding recipe metadata. New
// image placeholders remain DRAFT; a matching record alone cannot approve one.
const priorImageFile = path.join(seedOutputDir, "recipe_images.json");
const priorImages = fs.existsSync(priorImageFile) ? JSON.parse(fs.readFileSync(priorImageFile, "utf8")) : [];
const reviewsFile = path.resolve("artifacts/phase5b/image-reviews.json");
const reviews = fs.existsSync(reviewsFile) ? JSON.parse(fs.readFileSync(reviewsFile, "utf8")) : [];

for (const def of allRecipeDefs) {
  if (seenSlugs.has(def.slug)) {
    throw new Error(`Duplicate recipe slug detected: "${def.slug}"`);
  }
  seenSlugs.add(def.slug);

  const built = buildRecipeRecord(def);
  const prior = priorImages.find((image) => image.recipe_version_id === built.recipeVersion.id && image.status === "APPROVED");
  const review = prior && reviews.find((entry) => entry.image_asset_id === prior.id &&
    entry.recipe_version_id === prior.recipe_version_id && entry.storage_path === prior.storage_path && entry.status === "APPROVED");
  const assetFile = prior && path.resolve("artifacts/phase5b/assets", prior.storage_path);
  if (review && fs.existsSync(assetFile) &&
    createHash("sha256").update(fs.readFileSync(assetFile)).digest("hex") === review.sha256) {
    built.recipeImage = prior;
  }
  recipesRows.push(built.recipe);
  recipeVersionsRows.push(built.recipeVersion);
  recipeVariantsRows.push(...built.variants);
  recipeVariantIngredientsRows.push(...built.variantIngredients);
  recipeImagesRows.push(built.recipeImage);
}

console.log("Built all recipe entities:");
console.log(`  - Recipes: ${recipesRows.length}`);
console.log(`  - Recipe Versions: ${recipeVersionsRows.length}`);
console.log(`  - Recipe Variants: ${recipeVariantsRows.length} (${recipeVariantsRows.length / recipesRows.length}x per recipe)`);
console.log(`  - Variant Ingredients: ${recipeVariantIngredientsRows.length}`);
console.log(`  - Recipe Images: ${recipeImagesRows.length}`);

// 3. Write Seed JSON files
fs.writeFileSync(path.join(seedOutputDir, "foods.json"), JSON.stringify(foodsTableRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "portion_rules.json"), JSON.stringify(portionRulesRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "food_prices.json"), JSON.stringify(foodPricesRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "recipes.json"), JSON.stringify(recipesRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "recipe_versions.json"), JSON.stringify(recipeVersionsRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "recipe_variants.json"), JSON.stringify(recipeVariantsRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "recipe_variant_ingredients.json"), JSON.stringify(recipeVariantIngredientsRows, null, 2));
fs.writeFileSync(path.join(seedOutputDir, "recipe_images.json"), JSON.stringify(recipeImagesRows, null, 2));

console.log("Wrote all JSON seed files to supabase/seed/nutrition_v2/");

// 4. Generate Production SQL Migration File
function sqlStr(val) {
  if (val === null || val === undefined) return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

function sqlArray(arr) {
  if (!arr || arr.length === 0) return "'{}'::TEXT[]";
  const elements = arr.map(e => `'${String(e).replace(/'/g, "''")}'`).join(", ");
  return `ARRAY[${elements}]::TEXT[]`;
}

const sqlLines = [];
sqlLines.push(`-- ============================================================================`);
sqlLines.push(`-- GrindLog Nutrition Engine v2.0 - Migration 4: Seed Recipe Catalog & Foods`);
sqlLines.push(`-- File: supabase/migrations/20261002_04_seed_nutrition_catalog.sql`);
sqlLines.push(`-- Total Recipes: ${recipesRows.length} (${recipeVariantsRows.length} variants across 4 diets)`);
sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
sqlLines.push(`-- ============================================================================\n`);

sqlLines.push(`BEGIN;\n`);

// A. Insert/Upsert Foods
sqlLines.push(`-- 1. Upsert Foods Catalog (${foodsTableRows.length} verified items)`);
sqlLines.push(`INSERT INTO public.foods (`);
sqlLines.push(`    id, name, category, serving_size, calories, protein, carbs, fat, estimated_cost,`);
sqlLines.push(`    diet_type, is_pg_friendly, serving_unit, serving_weight_g, preparation_state,`);
sqlLines.push(`    dietary_tags, allergens, is_active, plan_eligible`);
sqlLines.push(`) VALUES`);

const foodSqlTuples = foodsTableRows.map((f, i) => {
  const comma = i === foodsTableRows.length - 1 ? "" : ",";
  return `    (${sqlStr(f.id)}, ${sqlStr(f.name)}, ${sqlStr(f.category)}, ${sqlStr(f.serving_size)}, ${f.calories}, ${f.protein}, ${f.carbs}, ${f.fat}, ${f.estimated_cost}, ${sqlStr(f.diet_type)}, ${f.is_pg_friendly}, ${sqlStr(f.serving_unit)}, ${f.serving_weight_g}, ${sqlStr(f.preparation_state)}, ${sqlArray(f.dietary_tags)}, ${sqlArray(f.allergens)}, true, true)${comma}`;
});
sqlLines.push(foodSqlTuples.join("\n"));
sqlLines.push(`ON CONFLICT (name) DO UPDATE SET`);
sqlLines.push(`    serving_unit = EXCLUDED.serving_unit,`);
sqlLines.push(`    serving_weight_g = EXCLUDED.serving_weight_g,`);
sqlLines.push(`    preparation_state = EXCLUDED.preparation_state,`);
sqlLines.push(`    dietary_tags = EXCLUDED.dietary_tags,`);
sqlLines.push(`    allergens = EXCLUDED.allergens,`);
sqlLines.push(`    calories = EXCLUDED.calories,`);
sqlLines.push(`    protein = EXCLUDED.protein,`);
sqlLines.push(`    carbs = EXCLUDED.carbs,`);
sqlLines.push(`    fat = EXCLUDED.fat,`);
sqlLines.push(`    estimated_cost = EXCLUDED.estimated_cost,\n    plan_eligible = true;\n`);

// B. Upsert Portion Rules
sqlLines.push(`-- 2. Upsert Portion Rules (${portionRulesRows.length} rules)`);
sqlLines.push(`INSERT INTO public.portion_rules (`);
sqlLines.push(`    id, food_id, portion_type, unit, min_portion, default_portion, max_sensible_portion, increment_step`);
sqlLines.push(`) VALUES`);
const portionSqlTuples = portionRulesRows.map((p, i) => {
  const comma = i === portionRulesRows.length - 1 ? "" : ",";
  return `    (${sqlStr(p.id)}, (SELECT id FROM public.foods WHERE name = ${sqlStr(p.food_name)} LIMIT 1), ${sqlStr(p.portion_type)}, ${sqlStr(p.unit)}, ${p.min_portion}, ${p.default_portion}, ${p.max_sensible_portion}, ${p.increment_step})${comma}`;
});
sqlLines.push(portionSqlTuples.join("\n"));
sqlLines.push(`ON CONFLICT (food_id) DO UPDATE SET`);
sqlLines.push(`    portion_type = EXCLUDED.portion_type,`);
sqlLines.push(`    unit = EXCLUDED.unit,`);
sqlLines.push(`    min_portion = EXCLUDED.min_portion,`);
sqlLines.push(`    default_portion = EXCLUDED.default_portion,`);
sqlLines.push(`    max_sensible_portion = EXCLUDED.max_sensible_portion,`);
sqlLines.push(`    increment_step = EXCLUDED.increment_step;\n`);

// C. Upsert Food Prices
sqlLines.push(`-- 3. Upsert Food Prices (${foodPricesRows.length} prices)`);
sqlLines.push(`INSERT INTO public.food_prices (`);
sqlLines.push(`    id, food_id, price_inr, quantity, quantity_unit, region_code, source, effective_from`);
sqlLines.push(`) VALUES`);
const priceSqlTuples = foodPricesRows.map((pr, i) => {
  const comma = i === foodPricesRows.length - 1 ? "" : ",";
  return `    (${sqlStr(pr.id)}, (SELECT id FROM public.foods WHERE name = ${sqlStr(pr.food_name)} LIMIT 1), ${pr.price_inr}, ${pr.quantity}, ${sqlStr(pr.quantity_unit)}, ${sqlStr(pr.region_code)}, ${sqlStr(pr.source)}, ${sqlStr(pr.effective_from)}::DATE)${comma}`;
});
sqlLines.push(priceSqlTuples.join("\n"));
sqlLines.push(`ON CONFLICT (food_id, region_code, effective_from) DO UPDATE SET`);
sqlLines.push(`    price_inr = EXCLUDED.price_inr,`);
sqlLines.push(`    quantity = EXCLUDED.quantity,`);
sqlLines.push(`    quantity_unit = EXCLUDED.quantity_unit;\n`);

// D. Insert Recipes (Step 1: Without current_version_id to respect circular FK)
sqlLines.push(`-- 4. Insert Recipes Base Identifiers (${recipesRows.length} recipes)`);
sqlLines.push(`INSERT INTO public.recipes (id, slug, status) VALUES`);
const recipeBaseTuples = recipesRows.map((r, i) => {
  const comma = i === recipesRows.length - 1 ? "" : ",";
  return `    (${sqlStr(r.id)}, ${sqlStr(r.slug)}, ${sqlStr(r.status)})${comma}`;
});
sqlLines.push(recipeBaseTuples.join("\n"));
sqlLines.push(`ON CONFLICT (slug) DO UPDATE SET status = EXCLUDED.status;\n`);

// E. Insert Recipe Versions
sqlLines.push(`-- 5. Insert Recipe Versions (${recipeVersionsRows.length} versions, initially unlocked)`);
sqlLines.push(`INSERT INTO public.recipe_versions (`);
sqlLines.push(`    id, recipe_id, version, name, description, diet_category, compatible_diets,`);
sqlLines.push(`    dietary_tags, cuisine, prep_instructions, cooking_time_min, difficulty,`);
sqlLines.push(`    required_equipment, supported_environments, primary_protein, is_locked`);
sqlLines.push(`) VALUES`);
const versionTuples = recipeVersionsRows.map((v, i) => {
  const comma = i === recipeVersionsRows.length - 1 ? "" : ",";
  return `    (${sqlStr(v.id)}, ${sqlStr(v.recipe_id)}, ${v.version}, ${sqlStr(v.name)}, ${sqlStr(v.description)}, ${sqlStr(v.diet_category)}, ${sqlArray(v.compatible_diets)}, ${sqlArray(v.dietary_tags)}, ${sqlStr(v.cuisine)}, ${sqlStr(v.prep_instructions)}, ${v.cooking_time_min}, ${sqlStr(v.difficulty)}, ${sqlArray(v.required_equipment)}, ${sqlArray(v.supported_environments)}, ${sqlStr(v.primary_protein)}, false)${comma}`;
});
sqlLines.push(versionTuples.join("\n"));
sqlLines.push(`ON CONFLICT (recipe_id, version) DO NOTHING;\n`);

// F. Update Recipes current_version_id (Enforces current version composite FK)
sqlLines.push(`-- 6. Link Recipes to current_version_id`);
for (const r of recipesRows) {
  sqlLines.push(`UPDATE public.recipes SET current_version_id = ${sqlStr(r.current_version_id)} WHERE id = ${sqlStr(r.id)};`);
}
sqlLines.push(`\n`);

// G. Insert Recipe Variants
sqlLines.push(`-- 7. Insert Recipe Variants (${recipeVariantsRows.length} standardized tiers)`);
sqlLines.push(`INSERT INTO public.recipe_variants (`);
sqlLines.push(`    id, recipe_version_id, variant_tier, target_calories, target_protein, target_carbs, target_fat`);
sqlLines.push(`) VALUES`);
const variantTuples = recipeVariantsRows.map((vt, i) => {
  const comma = i === recipeVariantsRows.length - 1 ? "" : ",";
  return `    (${sqlStr(vt.id)}, ${sqlStr(vt.recipe_version_id)}, ${sqlStr(vt.variant_tier)}, ${vt.target_calories}, ${vt.target_protein}, ${vt.target_carbs}, ${vt.target_fat})${comma}`;
});
sqlLines.push(variantTuples.join("\n"));
sqlLines.push(`ON CONFLICT (recipe_version_id, variant_tier) DO NOTHING;\n`);

// H. Insert Recipe Variant Ingredients
sqlLines.push(`-- 8. Insert Recipe Variant Ingredients (${recipeVariantIngredientsRows.length} ingredient allocations)`);
sqlLines.push(`INSERT INTO public.recipe_variant_ingredients (`);
sqlLines.push(`    id, recipe_variant_id, food_id, portion_type, amount, unit, min_portion, max_portion, increment_step, role, is_removable`);
sqlLines.push(`) VALUES`);
const ingTuples = recipeVariantIngredientsRows.map((ing, i) => {
  const comma = i === recipeVariantIngredientsRows.length - 1 ? "" : ",";
  return `    (${sqlStr(ing.id)}, ${sqlStr(ing.recipe_variant_id)}, (SELECT id FROM public.foods WHERE name = ${sqlStr(ing.food_name)} LIMIT 1), ${sqlStr(ing.portion_type)}, ${ing.amount}, ${sqlStr(ing.unit)}, ${ing.min_portion}, ${ing.max_portion}, ${ing.increment_step}, ${sqlStr(ing.role)}, ${ing.is_removable})${comma}`;
});
sqlLines.push(ingTuples.join("\n"));
sqlLines.push(`ON CONFLICT (recipe_variant_id, food_id) DO NOTHING;\n`);

// I. Insert Recipe Images
sqlLines.push(`-- 9. Insert Recipe Images (${recipeImagesRows.length} verified image assets)`);
sqlLines.push(`INSERT INTO public.recipe_images (`);
sqlLines.push(`    id, recipe_version_id, storage_path, url, status, alt_text, dominant_foods, is_primary`);
sqlLines.push(`) VALUES`);
const imgTuples = recipeImagesRows.map((img, i) => {
  const comma = i === recipeImagesRows.length - 1 ? "" : ",";
  return `    (${sqlStr(img.id)}, ${sqlStr(img.recipe_version_id)}, ${sqlStr(img.storage_path)}, ${sqlStr(img.url)}, ${sqlStr(img.status)}, ${sqlStr(img.alt_text)}, ${sqlArray(img.dominant_foods)}, ${img.is_primary})${comma}`;
});
sqlLines.push(imgTuples.join("\n"));
sqlLines.push(`ON CONFLICT (id) DO NOTHING;\n`);

// J. Lock all recipe versions now that variants and ingredients have been attached
sqlLines.push(`-- 10. Lock all published recipe versions to enforce immutability`);
sqlLines.push(`UPDATE public.recipe_versions SET is_locked = true WHERE is_locked = false;\n`);

sqlLines.push(`COMMIT;\n`);

const migrationSqlPath = path.resolve(process.cwd(), "supabase/migrations/20261002_04_seed_nutrition_catalog.sql");
fs.writeFileSync(migrationSqlPath, sqlLines.join("\n"));
console.log(`Generated SQL migration at: ${migrationSqlPath}`);
console.log(`SQL migration file size: ${(fs.statSync(migrationSqlPath).size / 1024).toFixed(1)} KB`);
console.log("==================================================");
console.log("BUILD COMPLETED SUCCESSFULLY!");
console.log("==================================================");
