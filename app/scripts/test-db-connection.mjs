import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("Connecting to Supabase at:", url);
  for (const table of [
    "foods",
    "portion_rules",
    "food_prices",
    "recipes",
    "recipe_versions",
    "recipe_variants",
    "recipe_variant_ingredients",
    "recipe_images",
    "meal_templates",
    "planned_meals",
    "planned_meal_items"
  ]) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table ${table}: error - ${error.message}`);
    } else {
      console.log(`Table ${table}: ${count} rows`);
    }
  }
}

main().catch(console.error);
