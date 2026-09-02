import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve("app/.env.local") });

const DEFAULT_JSON_PATH = path.resolve(
  "C:/Users/DELL/AppData/Local/Temp/grindlog-usda-import/expanded/FoodData_Central_foundation_food_json_2026-04-30.json",
);
const USDA_REFERENCE = "https://fdc.nal.usda.gov/";
const USDA_LICENSE = "CC0 1.0";

// Keep the first import deliberately small and auditable. Add another item
// only after its FDC record, name, diet classification, and serving semantics
// have been reviewed by the product owner.
const IMPORT_MAP = [
  { fdcId: 2346396, name: "Oats, whole grain, rolled, old fashioned", category: "Breakfast", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 2512381, name: "Rice, white, long grain, unenriched, raw", category: "Staple", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 2644283, name: "Lentils, dry", category: "Protein", dietType: "vegan", servingSize: "100 g dry", planEligible: false },
  { fdcId: 2644282, name: "Chickpeas, dry", category: "Protein", dietType: "vegan", servingSize: "100 g dry", planEligible: false },
  { fdcId: 1999630, name: "Soy milk, unsweetened, plain", category: "Dairy alternative", dietType: "vegan", servingSize: "100 g", planEligible: false },
  { fdcId: 2515376, name: "Peanuts, raw", category: "Protein", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 1105314, name: "Bananas, raw", category: "Fruit", dietType: "vegan", servingSize: "100 g", planEligible: false },
  { fdcId: 1750341, name: "Apples, gala, with skin, raw", category: "Fruit", dietType: "vegan", servingSize: "100 g", planEligible: false },
  { fdcId: 1999632, name: "Spinach, baby", category: "Vegetables", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 2258586, name: "Carrots, mature, raw", category: "Vegetables", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 2346401, name: "Potatoes, russet, without skin, raw", category: "Staple", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 321360, name: "Tomatoes, grape, raw", category: "Vegetables", dietType: "vegan", servingSize: "100 g raw", planEligible: false },
  { fdcId: 746772, name: "Milk, lowfat, 1% milkfat", category: "Dairy", dietType: "veg", servingSize: "100 g", planEligible: false },
  { fdcId: 323604, name: "Egg, whole, raw, pasteurized", category: "Protein", dietType: "non-veg", servingSize: "100 g", planEligible: false },
  { fdcId: 331960, name: "Chicken breast, skinless, boneless, cooked", category: "Protein", dietType: "non-veg", servingSize: "100 g cooked", planEligible: false },
  { fdcId: 2684441, name: "Salmon, Atlantic, farm raised, raw", category: "Protein", dietType: "non-veg", servingSize: "100 g raw", planEligible: false },
];

function nutrient(record, nutrientNumbers) {
  const numbers = Array.isArray(nutrientNumbers) ? nutrientNumbers : [nutrientNumbers];
  const match = (record.foodNutrients || []).find((item) =>
    numbers.includes(String(item?.nutrient?.number || "")),
  );
  return Number.isFinite(Number(match?.amount)) ? Number(match.amount) : null;
}

function round(value, places = 2) {
  return value == null ? null : Number(Number(value).toFixed(places));
}

function findRecord(records, fdcId) {
  return records.find((record) => Number(record?.fdcId) === fdcId);
}

function buildRow(entry, record) {
  // 957 is Atwater General Factors; 208 is the fallback used by some USDA
  // Foundation records that publish energy only as kcal.
  const calories = nutrient(record, ["957", "208"]);
  const protein = nutrient(record, "203");
  const carbs = nutrient(record, "205");
  const fat = nutrient(record, "204");
  if ([calories, protein, carbs, fat].some((value) => value == null)) {
    throw new Error(`Missing required macronutrient in USDA record ${entry.fdcId}`);
  }

  return {
    name: entry.name,
    category: entry.category,
    serving_size: entry.servingSize,
    calories: Math.round(calories),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    // USDA does not provide Indian retail prices. Keep these rows out of the
    // plan catalog until a local price review supplies a real serving cost.
    estimated_cost: 0,
    diet_type: entry.dietType,
    is_pg_friendly: true,
    allergens: entry.dietType === "vegan" && /peanut|soy/i.test(entry.name) ? ["peanut/soy; verify label"] : [],
    is_active: true,
    source_name: "USDA FoodData Central Foundation Foods",
    source_reference: USDA_REFERENCE,
    source_license: USDA_LICENSE,
    source_record_id: String(entry.fdcId),
    verification_status: "source_verified",
    nutrition_verified: true,
    dietary_classification_verified: true,
    cost_verification_status: "unavailable",
    plan_eligible: entry.planEligible,
  };
}

const jsonPath = process.env.USDA_JSON_PATH || DEFAULT_JSON_PATH;
const dryRun = process.argv.includes("--dry-run");
if (!fs.existsSync(jsonPath)) {
  throw new Error(`USDA JSON file not found: ${jsonPath}`);
}

const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const records = Array.isArray(payload) ? payload : payload.FoundationFoods;
if (!Array.isArray(records)) throw new Error("USDA JSON does not contain FoundationFoods");

const missing = IMPORT_MAP.filter((entry) => !findRecord(records, entry.fdcId));
if (missing.length) throw new Error(`Missing USDA IDs: ${missing.map((entry) => entry.fdcId).join(", ")}`);
const rows = IMPORT_MAP.map((entry) => buildRow(entry, findRecord(records, entry.fdcId)));

console.log(`Prepared ${rows.length} USDA rows from ${path.basename(jsonPath)}.`);
console.table(rows.map((row) => ({ id: row.source_record_id, name: row.name, kcal: row.calories, protein: row.protein, diet: row.diet_type })));

if (dryRun) {
  console.log("Dry run only; no database changes were made.");
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { error } = await supabase
  .from("foods")
  .upsert(rows, { onConflict: "source_record_id" });
if (error) throw error;
console.log("USDA rows imported/upserted safely. Existing non-USDA rows were not changed.");
