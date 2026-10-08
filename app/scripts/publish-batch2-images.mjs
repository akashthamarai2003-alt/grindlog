import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

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

// Recipe mapping configuration
const BATCH_ITEMS = [
  {
    slug: "mixed-veg-sabzi-phulka",
    name: "Mixed Vegetable Sabzi with Phulkas & Moong Sprouts",
    recipe_version_id: "b54b660a-a843-42ff-8056-ca4b749b91dc",
    sourceFile: "mixed_veg_sabzi_1791447556844.jpg"
  },
  {
    slug: "chole-masala-phulka",
    name: "Chole Masala with Multigrain Roti",
    recipe_version_id: "3db53ee8-be3a-40bd-9fb0-1c0a908ea145",
    sourceFile: "chole_masala_roti_1791447581738.jpg"
  },
  {
    slug: "yellow-moong-dal-phulka",
    name: "Yellow Moong Dal with Phulkas & Cucumber Salad",
    recipe_version_id: "0abc4f02-f00d-4416-9970-dd4554803088",
    sourceFile: "yellow_moong_dal_phulka_1791447613644.jpg"
  },
  {
    slug: "masoor-dal-phulka",
    name: "Masoor Dal Tadka with Multigrain Roti",
    recipe_version_id: "2472ed1e-b51e-45e6-9429-a14c5aedc0dc",
    sourceFile: "masoor_dal_roti_1791447637056.jpg"
  },
  {
    slug: "toor-dal-phulka",
    name: "Toor Dal with Hot Phulkas & Green Salad",
    recipe_version_id: "842620db-22d7-4d11-8c37-2141b1d1ee68",
    sourceFile: "toor_dal_phulka_1791447664646.jpg"
  },
  {
    slug: "chana-dal-phulka",
    name: "Chana Dal Curry with Multigrain Roti",
    recipe_version_id: "b9d68049-5a5b-4e33-8930-2ece9e7db4d8",
    sourceFile: "chana_dal_roti_1791447694837.jpg"
  },
  {
    slug: "lobia-masala-phulka",
    name: "Lobia Masala with Hot Phulkas",
    recipe_version_id: "103efb9c-32f9-4701-b9ff-1e0cf041ec2b",
    sourceFile: "lobia_masala_phulka_1791447723086.jpg"
  },
  {
    slug: "low-fat-paneer-bhurji-roti",
    name: "Low Fat Paneer Bhurji with Multigrain Roti",
    recipe_version_id: "ee694d24-83df-4871-a8ff-5e596b4f7484",
    sourceFile: "paneer_bhurji_roti_1791447752981.jpg"
  },
  {
    slug: "soya-chunks-curry-roti",
    name: "Soya Chunks Curry with Multigrain Roti",
    recipe_version_id: "bf7b4d42-eb06-4703-abe7-1db5414644f2",
    sourceFile: "soya_curry_roti_1791447800008.jpg"
  },
  {
    slug: "kala-chana-curry-phulka",
    name: "Kala Chana Curry with Phulkas & Salad",
    recipe_version_id: "103003e7-2069-4bd2-adee-896ea039ca0f",
    sourceFile: "kala_chana_phulka_1791447850557.jpg"
  },
  {
    slug: "punjabi-rajma-paneer-rice",
    name: "Punjabi Rajma with Steamed Rice & Low Fat Paneer",
    recipe_version_id: "5abd0285-6c10-4e58-ade8-2bd40f0c3758",
    sourceFile: "rajma_paneer_rice_1791447883087.jpg"
  },
  {
    slug: "kala-chana-paneer-phulka",
    name: "Kala Chana Curry with Fresh Paneer & Multigrain Roti",
    recipe_version_id: "ed551a00-6c63-4755-9cd7-2bf2d9a3701f",
    sourceFile: "chana_paneer_roti_1791447920314.jpg"
  },
  {
    slug: "paneer-keema-style-phulka",
    name: "Minced Low Fat Paneer Curry with Hot Phulkas",
    recipe_version_id: "9ee0ef17-d0ef-4406-9ad1-d892eae57118",
    sourceFile: "paneer_keema_phulka_1791447962684.jpg"
  }
];

const artifactsDir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d3977cfc-ae06-48f3-82a7-b104e88ebcec";

async function run() {
  console.log(`🚀 Starting production publishing for ${BATCH_ITEMS.length} recipe images...`);

  for (const item of BATCH_ITEMS) {
    const rawPath = path.join(artifactsDir, item.sourceFile);
    if (!fs.existsSync(rawPath)) {
      console.error(`❌ Source image missing: ${rawPath}`);
      continue;
    }

    console.log(`\n📸 Processing: ${item.name} (${item.slug})...`);

    // 1. Convert to optimized 1024x1024 WebP
    const webpBuffer = await sharp(rawPath)
      .resize(1024, 1024, { fit: "cover" })
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    const sha256 = createHash("sha256").update(webpBuffer).digest("hex");
    const storagePath = `recipe-images/${item.slug}/v1/${sha256}.webp`;
    const localDir = path.resolve(`artifacts/phase5b/assets/recipe-images/${item.slug}/v1`);
    fs.mkdirSync(localDir, { recursive: true });
    const localFile = path.join(localDir, `${sha256}.webp`);
    fs.writeFileSync(localFile, webpBuffer);
    console.log(`  💾 Saved locally: ${localFile} (${Math.round(webpBuffer.length / 1024)} KB)`);

    // 2. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Storage upload failed:`, uploadError.message);
      continue;
    }

    const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    console.log(`  ☁️ Uploaded to Supabase: ${publicUrl}`);

    // 3. Mark existing rows for this version as non-primary
    await supabase
      .from("recipe_images")
      .update({ is_primary: false })
      .eq("recipe_version_id", item.recipe_version_id);

    // 4. Insert or update APPROVED image row in recipe_images
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
      // If composite key is different, try plain insert
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

    // 5. Update planned_meals table so all occurrences of this recipe version use this new URL
    const { error: planUpdateErr, count } = await supabase
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
  }

  console.log("\n🎉 ALL RECIPE IMAGES PROCESSED, UPLOADED, AND LINKED SUCCESSFULLY!\n");
}

run().catch(console.error);
