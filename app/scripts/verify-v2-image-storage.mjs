// Read-only diagnostic: identify whether catalog recipe images exist in Supabase Storage.
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase read credentials are required");
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const images = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_images.json", "utf8"));
const { data: buckets, error: bucketError } = await db.storage.listBuckets();
if (bucketError) throw bucketError;
console.log(JSON.stringify({ imageCount: images.length,
  buckets: buckets.map((bucket) => ({ name: bucket.name, public: bucket.public })) }));
for (const bucket of buckets.filter((entry) => /recipe|image|food/i.test(entry.name))) {
  const first = images[0].storage_path;
  const dirs = [first, first.replace(/^recipe-images\//, "")];
  for (const candidate of dirs) {
    const splitAt = candidate.lastIndexOf("/");
    const folder = splitAt >= 0 ? candidate.slice(0, splitAt) : "";
    const basename = candidate.slice(splitAt + 1);
    const { data, error } = await db.storage.from(bucket.name).list(folder, {
      search: basename, limit: 1,
    });
    console.log(JSON.stringify({ bucket: bucket.name, candidate,
      found: !error && data.some((entry) => entry.name === basename),
      error: error?.message || null }));
  }
}
