// Read-only live catalog/storage audit. Does not change any Supabase records.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(".env.local"), quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase read credentials are required");
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const directory = path.resolve("artifacts/phase5b");
fs.mkdirSync(directory, { recursive: true });
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const reviewsPath = path.join(directory, "image-reviews.json");
const reviews = fs.existsSync(reviewsPath) ? readJson(reviewsPath) : [];
async function all(table, select = "*") {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from(table).select(select).order("id").range(offset, offset + 499);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}
async function listTree(bucket, folder = "") {
  const objects = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await db.storage.from(bucket).list(folder,
      { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`Storage ${bucket}/${folder}: ${error.message}`);
    for (const row of data) {
      const name = folder ? `${folder}/${row.name}` : row.name;
      if (row.id === null) objects.push(...await listTree(bucket, name));
      else objects.push({ bucket, path: name, metadata: row.metadata });
    }
    if (data.length < 100) return objects;
  }
}
async function probeImage(imageUrl) {
  if (!imageUrl) return { ok: false, status: "NO_URL" };
  try {
    // No admin credentials are sent to image hosts. Decode bytes; HEAD alone
    // can incorrectly accept an HTML error page or reject a working GET.
    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) { await response.body?.cancel(); return { ok: false, status: response.status }; }
    const reader = response.body?.getReader();
    if (!reader) return { ok: false, status: "EMPTY_BODY" };
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4 * 1024 * 1024) { await reader.cancel(); return { ok: false, status: "OVER_4_MB" }; }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const metadata = await sharp(bytes, { limitInputPixels: 16_000_000 }).metadata();
    // Fully decode the image to detect truncated files, not just a valid header.
    await sharp(bytes, { limitInputPixels: 16_000_000 }).resize(1, 1).raw().toBuffer();
    const supported = ["webp", "jpeg", "png", "avif"].includes(metadata.format);
    const dimensionsOk = metadata.width >= 512 && metadata.height >= 512 &&
      metadata.width <= 4096 && metadata.height <= 4096;
    return { ok: supported && dimensionsOk, readable: true, status: response.status,
      format: metadata.format, width: metadata.width, height: metadata.height, bytes: size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      dimensions_ok: dimensionsOk, supported_format: supported };
  } catch (error) {
    return { ok: false, status: "FETCH_OR_DECODE_ERROR", error: error.message,
      cause: error.cause?.code || null, error_name: error.name };
  }
}

const [recipes, versions, images, variants, ingredients, foods, bucketResult, rolloutResult] = await Promise.all([
  all("recipes"), all("recipe_versions"), all("recipe_images"), all("recipe_variants"),
  all("recipe_variant_ingredients"), all("foods", "id,name"), db.storage.listBuckets(),
  db.from("fitness_os_profiles").select("user_id", { count: "exact", head: true }).eq("nutrition_engine_v2", true),
]);
if (bucketResult.error) throw bucketResult.error;
if (rolloutResult.error) throw rolloutResult.error;
const buckets = bucketResult.data;
const objects = [];
for (const bucket of buckets) objects.push(...await listTree(bucket.name));
const objectKeys = new Set(objects.map((object) => `${object.bucket}/${object.path}`));
const versionsById = new Map(versions.map((v) => [v.id, v]));
const foodById = new Map(foods.map((food) => [food.id, food]));
const catalog = recipes.filter((recipe) => recipe.status === "PUBLISHED").sort((a, b) => a.slug.localeCompare(b.slug));
if (catalog.length !== 220) throw new Error(`Expected 220 published recipes, found ${catalog.length}. Review catalog scope.`);

function objectReferences(image) {
  const candidates = new Set();
  // Declared paths are relative to the image bucket. Also recognize explicit
  // bucket/path keys and Supabase public delivery URLs without guessing by name.
  for (const bucket of buckets) {
    candidates.add(`${bucket.name}/${image.storage_path}`);
    if (image.storage_path.startsWith(`${bucket.name}/`)) candidates.add(image.storage_path);
  }
  try {
    const parsed = new URL(image.url);
    if (parsed.origin === new URL(url).origin && parsed.pathname.startsWith("/storage/v1/object/public/")) {
      candidates.add(decodeURIComponent(parsed.pathname.slice("/storage/v1/object/public/".length)));
    }
  } catch { /* Invalid URL is recorded by the delivery probe. */ }
  return [...candidates].filter((candidate) => objectKeys.has(candidate));
}
const probes = new Map();
async function probeCached(imageUrl) {
  if (!probes.has(imageUrl)) probes.set(imageUrl, (async () => {
    const transientFailures = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await probeImage(imageUrl);
      const transient = [429, 500, 502, 503, 504].includes(result.status) ||
        ["UND_ERR_CONNECT_TIMEOUT", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(result.cause) ||
        result.error_name === "TimeoutError";
      if (!transient || attempt === 3) return { ...result, attempts: attempt, transient_failures: transientFailures };
      transientFailures.push(result);
    }
  })());
  return probes.get(imageUrl);
}
const assetChecks = [];
for (let offset = 0; offset < images.length; offset += 8) {
  assetChecks.push(...await Promise.all(images.slice(offset, offset + 8).map(async (image) => {
    const matches = objectReferences(image);
    const objectKey = matches.length === 1 ? matches[0] : null;
    const objectUrl = objectKey ? `${url}/storage/v1/object/public/${objectKey.split("/").map(encodeURIComponent).join("/")}` : null;
    const [delivery, object] = await Promise.all([probeCached(image.url), objectUrl ? probeCached(objectUrl) : null]);
    const ownershipOk = versionsById.has(image.recipe_version_id);
    const review = reviews.find((entry) => entry.image_asset_id === image.id &&
      entry.recipe_version_id === image.recipe_version_id && entry.storage_path === image.storage_path &&
      entry.sha256 === object?.sha256 && entry.status === "APPROVED" &&
      entry.reviewer && entry.reviewed_at && entry.ingredients_match === true &&
      entry.no_unrelated_ingredients === true && entry.no_text_or_watermark === true);
    const bytesMatch = Boolean(delivery?.sha256 && delivery.sha256 === object?.sha256);
    return { ...image, asset_exists: matches.length > 0, matching_objects: matches,
      ownership_ok: ownershipOk, object_probe: object, url_probe: delivery,
      visual_review: review || null,
      valid_production_asset: Boolean(image.status === "APPROVED" && image.is_primary && ownershipOk &&
        matches.length === 1 && delivery?.ok && object?.ok && bytesMatch && review),
    };
  })));
}

const visualStyle = {
  aspect_ratio: "1:1", target_dimensions: [1024, 1024], format: "webp", target_max_bytes: 250000,
  direction: "Premium realistic Indian food photography; dark neutral matte surface, natural appetizing side lighting, central food subject with 15% crop-safe margin, consistent ceramic serving ware. No text, logos, watermark, people or hands. No unrelated sides or excessive garnish.",
  approval: "File existence, readable supported bytes, recipe-version ownership, correct ingredients and visual review are all required. Generation or a seed row alone never grants approval.",
};
const manifest = catalog.map((recipe) => {
  const version = versionsById.get(recipe.current_version_id);
  if (!version || version.recipe_id !== recipe.id) throw new Error(`Current version ownership failed: ${recipe.slug}`);
  const tiers = variants.filter((variant) => variant.recipe_version_id === version.id).map((variant) => {
    const rows = ingredients.filter((row) => row.recipe_variant_id === variant.id).map((row) => {
      const food = foodById.get(row.food_id);
      if (!food) throw new Error(`Missing live food ${row.food_id} for ${recipe.slug}`);
      return { food_id: food.id, name: food.name, amount: row.amount, unit: row.unit, role: row.role };
    });
    if (!rows.length) throw new Error(`No ingredients: ${recipe.slug}/${variant.variant_tier}`);
    return { variant_id: variant.id, tier: variant.variant_tier, ingredients: rows };
  });
  const regular = tiers.find((tier) => tier.tier === "REGULAR");
  if (!regular) throw new Error(`No REGULAR recipe variant: ${recipe.slug}`);
  const common = regular.ingredients.filter((food) => tiers.every((tier) => tier.ingredients.some((row) => row.food_id === food.food_id)));
  const visible = common.length ? common.map((food) => food.name) : regular.ingredients.map((food) => food.name);
  const variable = [...new Set(tiers.flatMap((tier) => tier.ingredients.map((food) => food.name)))].filter((name) => !visible.includes(name));
  const related = assetChecks.filter((image) => image.recipe_version_id === version.id);
  const approvedPrimaries = related.filter((image) => image.status === "APPROVED" && image.is_primary);
  const valid = approvedPrimaries.length === 1 && approvedPrimaries[0].valid_production_asset ? approvedPrimaries[0] : null;
  const primary = valid || approvedPrimaries[0] || related.find((image) => image.is_primary) || related[0] || null;
  const dishText = `${version.name} ${visible.join(" ")}`.toLowerCase();
  const forbidden = Object.entries({ rice: /rice/, roti: /roti|phulka|chapati/, naan: /naan/,
    paneer: /paneer/, egg: /egg/, chicken: /chicken/, fish: /fish|rohu|tilapia|salmon|tuna/, salad: /salad/ })
    .filter(([, matches]) => !matches.test(dishText)).map(([food]) => food);
  const localFile = valid?.storage_path ? path.join(directory, "assets", valid.storage_path) : null;
  const localExists = Boolean(localFile && fs.existsSync(localFile));
  return {
    recipe_id: recipe.id, recipe_slug: recipe.slug, recipe_version_id: version.id, slug: recipe.slug, recipe_name: version.name,
    diet_category: version.diet_category, meal_slots: null,
    meal_slots_source: "Not stored on recipe_versions; the existing planner derives eligibility from recipe metadata and profile equipment.",
    primary_protein: version.primary_protein, key_visible_ingredients: visible,
    canonical_photo_scope: common.length ? "SHARED_COMPONENTS_ACROSS_VARIANTS" : "REGULAR_ONLY_REQUIRES_VARIANT_REVIEW",
    regular_ingredients: regular.ingredients, variant_ingredient_sets: tiers,
    variant_specific_ingredients_to_omit_from_shared_photo: variable,
    expected_storage_path: valid?.storage_path || `recipe-images/${recipe.slug}/v1/{sha256}.webp`,
    database_image_row_exists: Boolean(primary),
    primary_status: Boolean(primary?.is_primary),
    approval_status: primary?.status || "NO_ROW",
    local_asset_exists: localExists,
    storage_asset_exists: Boolean(primary?.asset_exists),
    asset_accessible: Boolean(valid && primary?.url_probe?.ok),
    file_format: valid?.url_probe?.format || null,
    file_size: valid?.url_probe?.bytes || null,
    width: valid?.url_probe?.width || null,
    height: valid?.url_probe?.height || null,
    sha256: valid?.url_probe?.sha256 || null,
    semantic_review_status: valid ? "APPROVED" : "SEMANTIC_REVIEW_REQUIRED",
    fallback_required: !valid,
    notes: valid
      ? (valid.visual_review?.notes || "Reviewed and approved real production photo.")
      : "No verified real image object in Storage. GrindLog glassmorphic fallback badge required.",
    image_asset_id: primary?.id || null, storage_path: primary?.storage_path || null,
    status: primary?.status || "MISSING", asset_exists: primary?.asset_exists || false,
    needs_image: !valid, production_delivery: valid ? "APPROVED_ASSET" : "GRINDLOG_FALLBACK",
    image_validation_status: valid ? "VERIFIED" : !primary?.asset_exists ? "MISSING_STORAGE_OBJECT" :
      !primary.object_probe?.ok || !primary.url_probe?.ok ? "UNREADABLE_OR_INVALID_ASSET" : "PENDING_VISUAL_REVIEW",
    proposed_storage_path_pattern: `recipe-images/${recipe.slug}/v1/{sha256}.webp`,
    source_image_url: primary?.url || null, source_url_probe: primary?.url_probe || null,
    image_specification: {
      dish: version.name, must_show: visible, must_not_show: forbidden,
      prompt: `Photograph ${version.name} faithfully. The actual shared recipe components are: ${visible.join(", ")}. Show these foods in their cooked/served form; do not portray raw dry pulses or uncooked meat just because a catalog ingredient names its purchase state. ${variable.length ? `Omit tier-specific extras (${variable.join(", ")}) so the canonical photo remains applicable across variants. ` : ""}Do not add unrelated rice, breads, protein, curries, sides or garnishes. ${visualStyle.direction}`,
    },
  };
});
const counts = {
  canonical_recipes: catalog.length, all_recipe_rows: recipes.length, recipe_versions: versions.length,
  recipe_image_rows: images.length,
  image_rows_by_status: Object.fromEntries(["APPROVED", "DRAFT", "REJECTED"].map((status) => [status, images.filter((image) => image.status === status).length])),
  storage_objects_total: objects.length,
  matched_recipe_storage_objects: new Set(assetChecks.flatMap((image) => image.matching_objects)).size,
  real_image_assets: assetChecks.filter((image) => image.object_probe?.readable).length,
  missing_storage_objects: assetChecks.filter((image) => !image.asset_exists).length,
  broken_or_unreachable_image_urls: assetChecks.filter((image) => !image.url_probe.ok).length,
  approved_images_verified: manifest.filter((recipe) => !recipe.needs_image).length,
  approved_image_load_failures: assetChecks.filter((image) => image.status === "APPROVED" && !image.url_probe.ok).length,
  approved_rows_without_storage: assetChecks.filter((image) => image.status === "APPROVED" && !image.asset_exists).length,
  approved_transient_probe_failures: assetChecks.filter((image) => image.status === "APPROVED")
    .reduce((sum, image) => sum + (image.url_probe.transient_failures?.length || 0), 0),
  fallback_only_recipes: manifest.filter((recipe) => recipe.needs_image).length,
  ownership_mismatch_rows: assetChecks.filter((image) => !image.ownership_ok).length,
  duplicate_approved_primary_versions: versions.filter((version) => images.filter((image) => image.recipe_version_id === version.id && image.status === "APPROVED" && image.is_primary).length > 1).length,
};
const report = { generated_at: new Date().toISOString(), source: "Live Supabase catalog, foods and Storage; read-only GET probes with full image decode. No profile changes.",
  project_url: url, counts, rollout: { enabled_v2_profiles: rolloutResult.count, profile_changes: 0 },
  style: visualStyle, storage_buckets: buckets.map((bucket) => ({ name: bucket.name, public: bucket.public })),
  storage_objects: objects, assets: assetChecks, recipes: manifest };
fs.writeFileSync(path.join(directory, "recipe-image-manifest.json"), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(directory, "recipes-without-images.md"), "# Recipes using the GrindLog fallback\n\n" +
  manifest.filter((recipe) => recipe.needs_image).map((recipe) => `- ${recipe.recipe_name} — \`${recipe.slug}\``).join("\n") + "\n");

const csvRows = [
  "recipe_id,recipe_slug,recipe_name,diet_category,production_category,meal_type_category,primary_protein,visible_ingredients,expected_storage_path"
];
for (const recipe of manifest.filter((r) => r.needs_image)) {
  let prodCat = "Vegetarian";
  if (recipe.diet_category === "vegan") prodCat = "Vegan";
  else if (recipe.diet_category === "eggetarian") prodCat = "Eggetarian";
  else if (recipe.diet_category === "non-veg") {
    const text = (recipe.recipe_name + " " + recipe.slug + " " + recipe.primary_protein).toLowerCase();
    if (text.includes("fish") || text.includes("tuna") || text.includes("prawn") || text.includes("salmon") || text.includes("tilapia") || text.includes("rohu") || text.includes("seafood")) {
      prodCat = "Fish";
    } else if (text.includes("chicken")) {
      prodCat = "Chicken";
    } else {
      prodCat = "Other Non-Veg";
    }
  }

  const nameLower = recipe.recipe_name.toLowerCase();
  let mealType = "Main Course";
  if (/oats|poha|upma|chilla|cheela|toast|omelette|paratha|idli|dosa|boiled egg/.test(nameLower)) {
    mealType = "Breakfast";
  } else if (/sprouts|chaat|roasted chana|peanut|salad/.test(nameLower)) {
    mealType = "Snacks";
  } else if (/chai|coffee|lassi|chaas|milk|smoothie|shake/.test(nameLower)) {
    mealType = "Drinks / Sides";
  }

  const escapeCsv = (val) => `"${String(val || "").replace(/"/g, '""')}"`;
  csvRows.push([
    recipe.recipe_id,
    recipe.slug,
    escapeCsv(recipe.recipe_name),
    recipe.diet_category,
    prodCat,
    mealType,
    escapeCsv(recipe.primary_protein),
    escapeCsv(recipe.key_visible_ingredients.join("; ")),
    recipe.proposed_storage_path_pattern
  ].join(","));
}
fs.writeFileSync(path.join(directory, "missing-recipe-images.csv"), csvRows.join("\n") + "\n");
console.log(JSON.stringify(counts, null, 2));
console.log(JSON.stringify(report.rollout));
if (process.argv.includes("--require-safe") && (assetChecks.some((image) => image.status === "APPROVED" && !image.valid_production_asset) ||
  counts.ownership_mismatch_rows || counts.duplicate_approved_primary_versions)) {
  throw new Error("Production approval checks failed; inspect the saved audit manifest");
}
