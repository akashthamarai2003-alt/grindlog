import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createLiveFoodIdResolver } from "../lib/services/nutrition/live-food-id.ts";
import { templates, slots, options } from "./build-meal-template-seed.mjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase read credentials are required");
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function all(table, columns) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from(table).select(columns).range(offset, offset + 499);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}

let assertions = 0;
function check(value, message) {
  assertions++;
  assert.ok(value, message);
}

const localFoods = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/foods.json", "utf8"));
const liveFoods = await all("foods", "id,name,is_active");
const { error: groceryJoinError } = await db.from("meal_plans")
  .select("id, meal_plan_items(id, foods(id), planned_meals(meal_slot))")
  .limit(1);
check(!groceryJoinError, `grocery relation is queryable: ${groceryJoinError?.message || "ok"}`);
const localById = new Map(localFoods.map((food) => [food.id, food]));
const liveById = new Set(liveFoods.map((food) => food.id));
const resolveFoodId = createLiveFoodIdResolver(liveFoods, localById);
check(localFoods.length === 147, "expected local catalog size");
for (const food of localFoods) {
  check(liveById.has(resolveFoodId(food.id)), `live food mapping for ${food.name}`);
}

for (const table of ["recipe_variant_ingredients", "portion_rules", "food_prices"]) {
  const rows = await all(table, "id,food_id");
  const orphanCount = rows.filter((row) => !liveById.has(row.food_id)).length;
  check(orphanCount === 0, `${table} has no food FK orphans`);
  const localRows = JSON.parse(fs.readFileSync(`supabase/seed/nutrition_v2/${table}.json`, "utf8"));
  const liveByRowId = new Map(rows.map((row) => [row.id, row]));
  for (const local of localRows) {
    const localFood = local.food_id
      ? localById.get(local.food_id)
      : localFoods.find((food) => food.name === local.food_name);
    check(Boolean(localFood && liveByRowId.get(local.id)?.food_id === resolveFoodId(localFood.id)),
      `${table} maps ${local.id} to its canonical live food`);
  }
  console.log(JSON.stringify({ table, rows: rows.length, orphanCount }));
}

for (const table of ["recipe_versions", "recipe_variants"]) {
  const localRows = JSON.parse(fs.readFileSync(`supabase/seed/nutrition_v2/${table}.json`, "utf8"));
  const liveRows = await all(table, table === "recipe_versions" ? "id,recipe_id" : "id,recipe_version_id");
  const liveByRowId = new Map(liveRows.map((row) => [row.id, row]));
  const ownershipKey = table === "recipe_versions" ? "recipe_id" : "recipe_version_id";
  for (const row of localRows) {
    check(liveByRowId.get(row.id)?.[ownershipKey] === row[ownershipKey],
      `${table} identity and ownership for ${row.id}`);
  }
}

const localImages = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_images.json", "utf8"));
const liveImages = await all("recipe_images", "id,recipe_version_id,storage_path,url");
const liveImageById = new Map(liveImages.map((image) => [image.id, image]));
for (const image of localImages) {
  const live = liveImageById.get(image.id);
  check(Boolean(live && live.recipe_version_id === image.recipe_version_id &&
    live.storage_path === image.storage_path && live.url === image.url),
    `live image identity and URL for ${image.id}`);
}

const templateIds = new Set(templates.map((template) => template.id));
const slotIds = new Set(slots.map((slot) => slot.id));
check(templates.length === 15, "five environments with three meal slots each");
check(slots.every((slot) => templateIds.has(slot.templateId)), "template slots resolve to template IDs");
check(options.every((option) => slotIds.has(option.slotId)), "template options resolve to slot IDs");
for (const option of options) {
  const local = localFoods.find((food) => food.name === option.foodName);
  const live = local && liveFoods.find((food) => food.id === resolveFoodId(local.id));
  check(Boolean(live?.is_active), `active live template food ${option.foodName}`);
}
for (const slot of slots) {
  for (const diet of ["vegan", "vegetarian", "eggetarian", "non-veg"]) {
    check(options.some((option) => option.slotId === slot.id && option.compatible.includes(diet)),
      `template slot ${slot.name} supports ${diet}`);
  }
}
const deployedTemplates = await all("meal_templates", "id,code,environment,meal_slot");
const deployedSlots = await all("meal_template_slots", "id,template_id,slot_name,role,is_provided,is_mandatory");
const deployedOptions = await all("meal_template_slot_options", "id,template_slot_id,food_id,default_portion,unit,priority,diet_category,compatible_diets,required_equipment,is_active");
const deployedTemplateById = new Map(deployedTemplates.map((row) => [row.id, row]));
const deployedSlotById = new Map(deployedSlots.map((row) => [row.id, row]));
const deployedOptionById = new Map(deployedOptions.map((row) => [row.id, row]));
check(deployedTemplates.length === templates.length, "deployed template count matches the seed");
check(deployedSlots.length === slots.length, "deployed template slot count matches the seed");
check(deployedOptions.length === options.length, "deployed template option count matches the seed");
for (const template of templates) {
  const live = deployedTemplateById.get(template.id);
  check(Boolean(live && live.code === template.code && live.environment === template.environment &&
    live.meal_slot === template.mealSlot), `deployed template identity ${template.code}`);
}
for (const slot of slots) {
  const live = deployedSlotById.get(slot.id);
  check(Boolean(live && live.template_id === slot.templateId && live.slot_name === slot.name &&
    live.role === slot.role && live.is_provided === slot.provided && live.is_mandatory === true),
    `deployed template slot identity ${slot.id}`);
}
for (const option of options) {
  const live = deployedOptionById.get(option.id);
  const localFood = localFoods.find((food) => food.name === option.foodName);
  check(Boolean(live && localFood && live.template_slot_id === option.slotId &&
    live.food_id === resolveFoodId(localFood.id) && Number(live.default_portion) === option.portion &&
    live.unit === option.unit && live.priority === option.priority &&
    live.diet_category === option.diet &&
    JSON.stringify(live.compatible_diets) === JSON.stringify(option.compatible) &&
    Array.isArray(live.required_equipment) && live.required_equipment.length === 0 &&
    live.is_active === true), `deployed template option and live food ${option.id}`);
}
console.log(JSON.stringify({ localFoods: localFoods.length, liveFoods: liveFoods.length,
  imagesVerified: localImages.length,
  templatesPrepared: templates.length, templateOptionsPrepared: options.length,
  templatesDeployed: deployedTemplates.length, templateSlotsDeployed: deployedSlots.length,
  templateOptionsDeployed: deployedOptions.length, assertionsPassed: assertions }));
