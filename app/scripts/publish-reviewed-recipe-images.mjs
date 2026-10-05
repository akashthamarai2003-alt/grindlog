// Image catalog maintenance only. Dry-run by default. --apply uploads immutable
// files and reconciles exact audited image rows; never touches users or plans.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(".env.local"), quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase credentials required");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const directory = path.resolve("artifacts/phase5b");
const read = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(directory, name), JSON.stringify(value, null, 2) + "\n");
const manifest = read("recipe-image-manifest.json");
const candidates = read("image-candidates.json");
const apply = process.argv.includes("--apply");
const bucket = "food-photos";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
function data(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}
if (Date.now() - Date.parse(manifest.generated_at) > 60 * 60 * 1000) throw new Error("Refresh the read-only audit before publication");
if (manifest.project_url !== url) throw new Error("Manifest does not match the target project");
if (!data(await db.storage.getBucket(bucket), "image bucket").public) throw new Error("Image bucket must be public");
const prepared = [];
for (const candidate of candidates) {
  const review = candidate.visual_review;
  if (review.status !== "REVIEWED" || !review.reviewer || !review.reviewed_at ||
    !review.ingredients_match || !review.no_unrelated_ingredients || !review.no_text_or_watermark) {
    throw new Error(`Visual review incomplete: ${candidate.slug}`);
  }
  const recipe = data(await db.from("recipes").select("id,slug,current_version_id,status")
    .eq("id", candidate.recipe_id).single(), "recipe ownership");
  const version = data(await db.from("recipe_versions").select("id,recipe_id")
    .eq("id", candidate.recipe_version_id).single(), "version ownership");
  if (recipe.slug !== candidate.slug || recipe.status !== "PUBLISHED" || recipe.current_version_id !== version.id ||
    version.recipe_id !== recipe.id) throw new Error(`Recipe version changed: ${candidate.slug}`);
  const bytes = fs.readFileSync(path.resolve(candidate.local_file));
  const metadata = await sharp(bytes).metadata();
  await sharp(bytes).resize(1, 1).raw().toBuffer();
  if (hash(bytes) !== candidate.sha256 || metadata.format !== "webp" || metadata.width !== 1024 ||
    metadata.height !== 1024 || bytes.length > 300000 ||
    candidate.storage_path !== `recipe-images/${candidate.slug}/v1/${candidate.sha256}.webp`) throw new Error(`Invalid immutable file: ${candidate.slug}`);
  prepared.push({ candidate, bytes });
}
const unbacked = manifest.assets.filter((asset) => asset.status === "APPROVED" && !asset.asset_exists &&
  !asset.url_probe.ok && asset.url.startsWith("https://images.grindlog.in/recipes/"));
const folders = new Map();
const before = [];
for (const asset of unbacked) {
  const current = data(await db.from("recipe_images").select("*").eq("id", asset.id).single(), "current image");
  if (current.status === "DRAFT") continue; // Safe resume of a partial reconciliation.
  if (current.status !== "APPROVED" || current.recipe_version_id !== asset.recipe_version_id ||
    current.storage_path !== asset.storage_path || current.url !== asset.url || current.updated_at !== asset.updated_at) throw new Error(`Image changed since audit: ${asset.id}`);
  const split = current.storage_path.lastIndexOf("/");
  const folder = current.storage_path.slice(0, split);
  const filename = current.storage_path.slice(split + 1);
  if (!folders.has(folder)) {
    const objects = [];
    for (let offset = 0; ; offset += 100) {
      const rows = data(await db.storage.from(bucket).list(folder, { offset, limit: 100 }), "storage recheck");
      objects.push(...rows);
      if (rows.length < 100) break;
    }
    folders.set(folder, objects);
  }
  if (folders.get(folder).some((object) => object.name === filename && object.id)) throw new Error(`Object now exists: ${asset.storage_path}; refresh audit`);
  before.push(current);
}
console.log(JSON.stringify({ apply, project: new URL(url).hostname,
  unbacked_approvals_to_downgrade: before.length, immutable_images_to_publish: prepared.length, profile_changes: 0 }));
if (!apply) process.exit(0);
const runId = new Date().toISOString().replaceAll(":", "-");
fs.writeFileSync(path.join(directory, `image-rows-before-${runId}.json`), JSON.stringify(before, null, 2) + "\n", { flag: "wx" });
for (const current of before) {
  const changed = data(await db.from("recipe_images").update({ status: "DRAFT", updated_at: new Date().toISOString() })
    .eq("id", current.id).eq("status", "APPROVED").eq("recipe_version_id", current.recipe_version_id)
    .eq("storage_path", current.storage_path).eq("url", current.url).eq("updated_at", current.updated_at)
    .select("id"), "retire unbacked approval");
  if (changed.length !== 1) throw new Error(`Concurrent image update: ${current.id}`);
}
const published = [];
const reviewsPath = path.join(directory, "image-reviews.json");
const reviews = fs.existsSync(reviewsPath) ? read("image-reviews.json") : [];
const seedPath = path.resolve("supabase/seed/nutrition_v2/recipe_images.json");
const seeds = JSON.parse(fs.readFileSync(seedPath, "utf8"));
for (const { candidate, bytes } of prepared) {
  const upload = await db.storage.from(bucket).upload(candidate.storage_path, bytes,
    { upsert: false, contentType: "image/webp", cacheControl: "31536000" });
  if (upload.error) {
    const existing = data(await db.storage.from(bucket).download(candidate.storage_path), "existing immutable object");
    if (hash(Buffer.from(await existing.arrayBuffer())) !== candidate.sha256) throw new Error("Refusing to overwrite an immutable object");
  }
  const imageUrl = db.storage.from(bucket).getPublicUrl(candidate.storage_path).data.publicUrl;
  const response = await fetch(imageUrl, { signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok) throw new Error(`Public image delivery failed: ${candidate.slug}`);
  const delivered = Buffer.from(await response.arrayBuffer());
  if (hash(delivered) !== candidate.sha256) throw new Error(`Delivery bytes differ: ${candidate.slug}`);
  await sharp(delivered).resize(1, 1).raw().toBuffer();
  const existing = data(await db.from("recipe_images").select("*").eq("id", candidate.id).maybeSingle(), "image identity");
  const row = { id: candidate.id, recipe_version_id: candidate.recipe_version_id,
    storage_path: candidate.storage_path, url: imageUrl, status: "DRAFT", alt_text: candidate.alt_text,
    dominant_foods: candidate.dominant_foods, is_primary: true };
  if (existing && (existing.storage_path !== row.storage_path || existing.recipe_version_id !== row.recipe_version_id || existing.url !== row.url)) throw new Error("Image UUID has different ownership or storage identity");
  if (!existing) data(await db.from("recipe_images").insert(row), "register DRAFT image");
  // The existing partial unique index also enforces one APPROVED primary.
  const approved = data(await db.from("recipe_images").update({ status: "APPROVED", updated_at: new Date().toISOString() })
    .eq("id", candidate.id).eq("recipe_version_id", candidate.recipe_version_id).eq("storage_path", candidate.storage_path)
    .select("id"), "approve stored reviewed image");
  if (approved.length !== 1) throw new Error("Approval did not affect exactly one image");
  const review = { image_asset_id: candidate.id, recipe_version_id: candidate.recipe_version_id,
    storage_path: candidate.storage_path, sha256: candidate.sha256, ...candidate.visual_review, status: "APPROVED" };
  const reviewIndex = reviews.findIndex((entry) => entry.image_asset_id === candidate.id);
  if (reviewIndex < 0) reviews.push(review); else reviews[reviewIndex] = review;
  write("image-reviews.json", reviews);
  const seedIndex = seeds.findIndex((entry) => entry.recipe_version_id === candidate.recipe_version_id);
  if (seedIndex < 0) throw new Error("Seed ownership absent");
  seeds[seedIndex] = { ...row, status: "APPROVED" };
  candidate.status = "APPROVED";
  candidate.url = imageUrl;
  write("image-candidates.json", candidates);
  fs.writeFileSync(seedPath, JSON.stringify(seeds, null, 2) + "\n");
  published.push({ id: candidate.id, slug: candidate.slug, storage_path: candidate.storage_path, url: imageUrl, sha256: candidate.sha256 });
  write("publication.json", { project: new URL(url).hostname, applied_at: new Date().toISOString(),
    downgraded_unbacked_rows: before.length, published, profile_changes: 0 });
  console.log(JSON.stringify({ published: candidate.slug, bytes: bytes.length }));
}
