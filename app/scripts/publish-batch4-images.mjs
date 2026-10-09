import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { BATCH_4_RECIPES } from "./batch4-config.mjs";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PUBLIC_ASSETS_DIR = path.resolve("public/assets/recipe-images");

// Helper to calculate SHA256 of file buffer
const getSha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

export async function processBatchItem(item, rawImagePath) {
  console.log(`\n📸 Processing: ${item.name} (${item.slug})...`);

  if (!fs.existsSync(rawImagePath)) {
    console.error(`  ❌ Raw image not found: ${rawImagePath}`);
    return;
  }

  const rawBuffer = fs.readFileSync(rawImagePath);

  // 1. Process with Sharp (WebP, 1024x1024, quality 85)
  const webpBuffer = await sharp(rawBuffer)
    .resize(1024, 1024, { fit: "cover", position: "center" })
    .webp({ quality: 85, effort: 6 })
    .toBuffer();

  const sha = getSha256(webpBuffer);
  const versionId = "v1";
  const fileName = `${sha}.webp`;
  
  // 2. Save locally to public/assets/recipe-images/<slug>/v1/<sha>.webp
  const localDir = path.join(PUBLIC_ASSETS_DIR, item.slug, versionId);
  fs.mkdirSync(localDir, { recursive: true });
  const localPath = path.join(localDir, fileName);
  
  fs.writeFileSync(localPath, webpBuffer);
  console.log(`  💾 Saved locally: ${localPath} (${(webpBuffer.length / 1024).toFixed(0)} KB)`);

  // 3. Upload to Supabase Storage
  const storagePath = `recipe-images/${item.slug}/${versionId}/${fileName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("food-photos")
    .upload(storagePath, webpBuffer, {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000",
      upsert: true, // Overwrite if same hash somehow exists
    });

  if (uploadError) {
    console.error(`  ❌ Supabase upload failed:`, uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("food-photos")
    .getPublicUrl(storagePath);
    
  const supabaseUrl = publicUrlData.publicUrl;
  console.log(`  ☁️ Uploaded to Supabase: ${supabaseUrl}`);

  // 4. Update the database (`recipe_images`)
  const { data: dbData, error: dbError } = await supabase.from('recipe_images').insert({
    recipe_version_id: item.recipe_version_id,
    url: supabaseUrl,
    storage_path: storagePath,
    alt_text: item.name,
    status: 'APPROVED',
    is_primary: true
  }).select('id').single();

  if (dbError) {
    console.error(`  ❌ Database insert failed:`, dbError.message);
    return;
  }
  
  console.log(`  ✅ Inserted recipe_images row: ${dbData.id}`);

  // 5. Update snapshot URLs in planned_meals
  const { error: pmError } = await supabase
    .from("planned_meals")
    .update({ image_url_snapshot: supabaseUrl })
    .eq("recipe_version_id", item.recipe_version_id);

  if (pmError) {
    console.error(`  ⚠️ Failed to update planned_meals snapshots:`, pmError.message);
  } else {
    console.log(`  ✨ Updated planned_meals snapshots.`);
  }
}
