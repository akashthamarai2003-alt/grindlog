import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { BATCH_3_RECIPES } from "./batch3-config.mjs";

dotenv.config({ path: path.resolve(".env.local"), quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const BUCKET = "food-photos";
const artifactsDir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d3977cfc-ae06-48f3-82a7-b104e88ebcec";

export async function processBatchItem(item, rawImagePath) {
  if (!fs.existsSync(rawImagePath)) {
    throw new Error(`Raw image missing at: ${rawImagePath}`);
  }

  console.log(`\n📸 Processing: ${item.name} (${item.slug})...`);

  // 1. Convert to optimized 1024x1024 WebP
  const webpBuffer = await sharp(rawImagePath)
    .resize(1024, 1024, { fit: "cover" })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();

  const sha256 = createHash("sha256").update(webpBuffer).digest("hex");
  const storagePath = `recipe-images/${item.slug}/v1/${sha256}.webp`;

  // 2. Save locally in artifacts directory
  const artifactDir = path.resolve(`artifacts/phase5b/assets/recipe-images/${item.slug}/v1`);
  fs.mkdirSync(artifactDir, { recursive: true });
  const artifactFile = path.join(artifactDir, `${sha256}.webp`);
  fs.writeFileSync(artifactFile, webpBuffer);

  // 3. Save locally in public/assets directory for Vercel deployment
  const publicDir = path.resolve(`public/assets/recipe-images/${item.slug}/v1`);
  fs.mkdirSync(publicDir, { recursive: true });
  const publicFile = path.join(publicDir, `${sha256}.webp`);
  fs.writeFileSync(publicFile, webpBuffer);

  console.log(`  💾 Saved locally: ${publicFile} (${Math.round(webpBuffer.length / 1024)} KB)`);

  // 4. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, webpBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    console.error(`  ❌ Supabase storage upload failed:`, uploadError.message);
    throw uploadError;
  }

  const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  console.log(`  ☁️ Uploaded to Supabase: ${publicUrl}`);

  // 5. Demote older rows
  await supabase
    .from("recipe_images")
    .update({ is_primary: false })
    .eq("recipe_version_id", item.recipe_version_id);

  // 6. Upsert APPROVED row
  const { data: imgRow, error: imgErr } = await supabase
    .from("recipe_images")
    .upsert({
      recipe_version_id: item.recipe_version_id,
      storage_path: storagePath,
      url: publicUrl,
      status: "APPROVED",
      is_primary: true,
      alt_text: item.name,
    }, { onConflict: "recipe_version_id,storage_path" })
    .select()
    .single();

  if (imgErr) {
    const { data: insRow, error: insErr } = await supabase
      .from("recipe_images")
      .insert({
        recipe_version_id: item.recipe_version_id,
        storage_path: storagePath,
        url: publicUrl,
        status: "APPROVED",
        is_primary: true,
        alt_text: item.name,
      })
      .select()
      .single();

    if (insErr) {
      console.error(`  ❌ DB recipe_images insert error:`, insErr.message);
    } else {
      console.log(`  ✅ Inserted recipe_images row: ${insRow?.id}`);
    }
  } else {
    console.log(`  ✅ Upserted recipe_images row: ${imgRow?.id}`);
  }

  // 7. Update planned_meals snapshots
  const { error: planUpdateErr } = await supabase
    .from("planned_meals")
    .update({
      image_url_snapshot: publicUrl,
      image_storage_path_snapshot: storagePath,
    })
    .eq("recipe_version_id", item.recipe_version_id);

  if (planUpdateErr) {
    console.error(`  ❌ Planned meals update error:`, planUpdateErr.message);
  } else {
    console.log(`  ✨ Updated planned_meals snapshots.`);
  }

  return { publicUrl, storagePath, sha256 };
}

async function main() {
  console.log(`Loaded ${BATCH_3_RECIPES.length} recipes for Batch 3.`);
  console.log("Ready for image processing pipeline.");
}

main().catch(console.error);
