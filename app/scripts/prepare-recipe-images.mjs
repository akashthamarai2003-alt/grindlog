// Local only. Usage: node scripts/prepare-recipe-images.mjs <slug> <file> [<slug> <file> ...]
import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";

const directory = path.resolve("artifacts/phase5b");
const manifest = JSON.parse(fs.readFileSync(path.join(directory, "recipe-image-manifest.json"), "utf8"));
const candidatesPath = path.join(directory, "image-candidates.json");
const candidates = fs.existsSync(candidatesPath) ? JSON.parse(fs.readFileSync(candidatesPath, "utf8")) : [];
const args = process.argv.slice(2);
if (!args.length || args.length % 2 !== 0) throw new Error("Supply pairs of recipe slug and source image file");
for (let index = 0; index < args.length; index += 2) {
  const [slug, input] = args.slice(index, index + 2);
  const recipe = manifest.recipes.find((entry) => entry.slug === slug);
  if (!recipe) throw new Error(`Recipe is absent from live catalog manifest: ${slug}`);
  const source = fs.readFileSync(input);
  const metadata = await sharp(source, { limitInputPixels: 16_000_000 }).metadata();
  if (!metadata.width || !metadata.height || metadata.width < 1024 || metadata.height < 1024) {
    throw new Error(`${slug}: source must be at least 1024x1024`);
  }
  if (Math.abs(metadata.width / metadata.height - 1) > 0.01) throw new Error(`${slug}: use a square source; do not silently crop food`);
  const optimized = await sharp(source).rotate().resize(1024, 1024).webp({ quality: 84, effort: 6 }).toBuffer();
  const decoded = await sharp(optimized).metadata();
  if (decoded.format !== "webp" || decoded.width !== 1024 || decoded.height !== 1024) throw new Error("Invalid optimized file");
  if (optimized.length > 300000) throw new Error(`${slug}: exceeds 300 KB card download limit; review optimization`);
  const sha256 = createHash("sha256").update(optimized).digest("hex");
  const storagePath = `recipe-images/${slug}/v1/${sha256}.webp`;
  const localFile = path.join(directory, "assets", storagePath);
  fs.mkdirSync(path.dirname(localFile), { recursive: true });
  if (fs.existsSync(localFile)) {
    if (!fs.readFileSync(localFile).equals(optimized)) throw new Error("Immutable asset path already contains different bytes");
  } else fs.writeFileSync(localFile, optimized, { flag: "wx" });
  if (!candidates.some((entry) => entry.storage_path === storagePath)) candidates.push({
    id: randomUUID(), recipe_id: recipe.recipe_id, recipe_version_id: recipe.recipe_version_id,
    slug, name: recipe.recipe_name, status: "DRAFT", provenance: "AI_GENERATED_IMAGEGEN",
    source_sha256: createHash("sha256").update(source).digest("hex"), sha256,
    storage_path: storagePath, local_file: `artifacts/phase5b/assets/${storagePath}`,
    format: "webp", width: 1024, height: 1024, bytes: optimized.length,
    alt_text: recipe.recipe_name, dominant_foods: recipe.key_visible_ingredients,
    visual_review: { status: "PENDING", reviewer: null, reviewed_at: null },
  });
  console.log(JSON.stringify({ slug, bytes: optimized.length, storagePath }));
}
fs.writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2) + "\n");
