// Offline verification of live-audited evidence, optimized files and seed approvals.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { buildRecipeRecord } from "./recipe-builder-helpers.mjs";
import { VEGAN_RECIPES } from "./recipe-definitions-vegan.mjs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const audit = read("artifacts/phase5b/recipe-image-manifest.json");
const seeds = read("supabase/seed/nutrition_v2/recipe_images.json");
const candidates = read("artifacts/phase5b/image-candidates.json");

test("all 220 canonical recipes have live food-backed production briefs and explicit delivery", () => {
  assert.equal(audit.recipes.length, 220);
  assert.equal(new Set(audit.recipes.map((recipe) => recipe.recipe_id)).size, 220);
  for (const recipe of audit.recipes) {
    assert.ok(recipe.recipe_version_id && recipe.slug && recipe.recipe_name && recipe.primary_protein);
    assert.ok(recipe.key_visible_ingredients.length > 0);
    assert.ok(recipe.key_visible_ingredients.every((name) => typeof name === "string" && name.length > 0));
    assert.ok(recipe.regular_ingredients.every((food) => food.food_id && food.name));
    assert.equal(recipe.needs_image, recipe.production_delivery === "GRINDLOG_FALLBACK");
    assert.ok(recipe.image_specification.prompt.length > 0);
    if (recipe.key_visible_ingredients.some((name) => /phulka|chapati|roti/i.test(name))) {
      assert.ok(!recipe.image_specification.must_not_show.includes("roti"));
    }
  }
});

test("every seed image matches actual live ownership and approval; no guessed approved placeholders", () => {
  assert.equal(seeds.length, 220);
  const live = new Map(audit.assets.map((asset) => [asset.id, asset]));
  for (const seed of seeds) {
    const row = live.get(seed.id);
    assert.ok(row);
    assert.equal(row.recipe_version_id, seed.recipe_version_id);
    assert.equal(row.status, seed.status);
    assert.equal(row.storage_path, seed.storage_path);
    assert.equal(row.url, seed.url);
    if (seed.status === "APPROVED") assert.equal(row.valid_production_asset, true);
  }
  assert.equal(buildRecipeRecord(VEGAN_RECIPES[0]).recipeImage.status, "DRAFT");
});

test("approved image bytes are immutable, reviewed, readable WebP with valid dimensions", async () => {
  for (const candidate of candidates) {
    const bytes = fs.readFileSync(candidate.local_file);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    assert.equal(checksum, candidate.sha256);
    assert.equal(candidate.storage_path, `recipe-images/${candidate.slug}/v1/${checksum}.webp`);
    const metadata = await sharp(bytes).metadata();
    await sharp(bytes).resize(1, 1).raw().toBuffer();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 1024);
    assert.equal(metadata.height, 1024);
    assert.ok(bytes.length <= 250000);
    const live = audit.assets.find((asset) => asset.id === candidate.id);
    assert.equal(live?.object_probe.sha256, checksum);
    assert.equal(live?.url_probe.sha256, checksum);
    assert.equal(live?.visual_review.ingredients_match, true);
    assert.equal(live?.visual_review.no_unrelated_ingredients, true);
    assert.equal(live?.visual_review.no_text_or_watermark, true);
    assert.equal(live?.valid_production_asset, true);
  }
});

test("all six personas cover seven days and only approved assets or fallback", () => {
  const personas = read("artifacts/phase5b/persona-plans.json");
  const approvedUrls = new Set(audit.assets.filter((asset) => asset.valid_production_asset).map((asset) => asset.url));
  assert.equal(personas.length, 6);
  for (const persona of personas) {
    assert.equal(persona.days.length, 7);
    assert.equal(persona.metrics.hardConstraintPass, true);
    for (const day of persona.days) {
      assert.ok(day.meals.length >= 3);
      for (const meal of day.meals) {
        assert.ok(meal.imageUrl.startsWith("data:image/svg+xml") || approvedUrls.has(meal.imageUrl));
      }
    }
  }
});
