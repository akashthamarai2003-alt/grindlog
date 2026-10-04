import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// One-account production diagnostic. It creates four rows on an unused future
// date, calls the real persistence RPC, and deletes its allocated fixture.
dotenv.config({ path: ".env.local", quiet: true });
const args = process.argv.slice(2);
const uid = args[args.indexOf("--user-id") + 1];
const backupFile = args[args.indexOf("--backup-file") + 1];
if (!args.includes("--execute") || !uid || !backupFile) {
  console.log("Usage: node scripts/test-phase47-live-persist-guard.mjs --user-id DESIGNATED_UUID --backup-file PRIVATE_SNAPSHOT --execute");
  process.exit(0);
}
assert.equal(uid, "f6a90349-5e29-4c8d-9fb8-ac3aeb6993f2", "only the designated V2 test account is allowed");
const baseline = JSON.parse(fs.readFileSync(backupFile, "utf8"));
assert.equal(baseline.uid, uid, "snapshot must belong to the designated account");
assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  "Supabase URL and service key are required");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const date = "2099-10-04";
const ids = Object.fromEntries(["meal_plans", "planned_meals", "meal_plan_items", "food_logs"]
  .map(table => [table, crypto.randomUUID()]));
let assertions = 0;
let failure;
let originalProfile;
let fixtureInsertStarted = false;

function check(condition, message) {
  assertions++;
  assert.ok(condition, message);
}
function value(response, label) {
  if (response.error) throw new Error(`${label}: ${response.error.code || ""} ${response.error.message}`);
  return response.data;
}
async function own(table, columns = "*") {
  return value(await db.from(table).select(columns).eq("user_id", uid), `read ${table}`);
}
async function fixtureRows(table, columns = "*") {
  const dateColumn = table === "meal_plans" ? "date" : "local_date";
  return value(await db.from(table).select(columns).eq("user_id", uid).eq(dateColumn, date),
    `read ${table} fixture date`);
}
async function one(table, id) {
  return value(await db.from(table).select("*").eq("id", id).single(), `read ${table} fixture`);
}
async function insert(table, row) {
  const saved = value(await db.from(table).insert(row).select("id").single(), `insert ${table}`);
  check(saved.id === row.id, `${table} fixture inserted with its allocated ID`);
}
function withoutTimestamp(profile) {
  const { updated_at: _timestamp, ...rest } = profile;
  return rest;
}
async function expectRpcDenied(label) {
  const before = await Promise.all([
    one("meal_plans", ids.meal_plans),
    one("planned_meals", ids.planned_meals),
    one("meal_plan_items", ids.meal_plan_items),
    one("food_logs", ids.food_logs),
  ]);
  const response = await db.rpc("persist_v2_meal_plan_atomic", {
    p_user_id: uid,
    p_plan_days: [{ date, plan: { name: "Guard replacement probe", calories: 200,
      protein: 8, carbs: 30, fat: 2, estimated_cost: 0 }, items: [] }],
    p_planned_meals: [],
  });
  check(response.error?.code === "P0001" &&
    response.error.message.includes("CANNOT_REGENERATE_LOGGED_MEAL"),
  `${label}: deployed RPC rejects replacement before deleting history`);
  const after = await Promise.all([
    one("meal_plans", ids.meal_plans),
    one("planned_meals", ids.planned_meals),
    one("meal_plan_items", ids.meal_plan_items),
    one("food_logs", ids.food_logs),
  ]);
  check(JSON.stringify(after) === JSON.stringify(before), `${label}: all four fixture rows remain unchanged`);
  check((await fixtureRows("meal_plans", "id")).length === 1 &&
    (await fixtureRows("planned_meals", "id")).length === 1,
  `${label}: no replacement plan or meal was created`);
}

try {
  originalProfile = value(await db.from("fitness_os_profiles").select("*")
    .eq("user_id", uid).single(), "read designated profile");
  check(originalProfile.nutrition_engine_v2 === false, "V2 remains disabled for the designated account");
  check(JSON.stringify(withoutTimestamp(originalProfile)) ===
    JSON.stringify(withoutTimestamp(baseline.profile)),
  "every saved profile field except the pending timestamp matches the private snapshot");
  check(baseline.mealPlans.length === 0 && baseline.plannedMeals.length === 0 &&
    baseline.foodLogs.length === 0, "private snapshot has empty plan and log baseline");
  check((await own("meal_plans", "id")).length === 0 &&
    (await own("planned_meals", "id")).length === 0 &&
    (await own("food_logs", "id")).length === 0,
  "the account has no plan, meal, or log rows before the fixture");
  check((await fixtureRows("meal_plans", "id")).length === 0 &&
    (await fixtureRows("planned_meals", "id")).length === 0,
  "the isolated fixture date is empty");
  const food = value(await db.from("foods")
    .select("id,name,serving_size,calories,protein,carbs,fat,estimated_cost")
    .eq("name", "White Rice (Steamed)").single(), "read live fixture food");
  const template = value(await db.from("meal_templates").select("id")
    .eq("code", "PG_MESS_BREAKFAST").single(), "read live fixture template");
  check(Boolean(food.id && template.id), "fixture food and template IDs resolve in the live catalog");

  fixtureInsertStarted = true;
  await insert("meal_plans", { id: ids.meal_plans, user_id: uid, date,
    meal_type: "daily", name: "Phase 4.7 logged-history guard fixture", status: "READY",
    calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat,
    estimated_cost: food.estimated_cost || 0, ai_generated: false });
  await insert("planned_meals", { id: ids.planned_meals, meal_plan_id: ids.meal_plans,
    user_id: uid, local_date: date, meal_slot: "breakfast", meal_sequence: 1,
    scheduled_time: "08:00:00", source_type: "TEMPLATE", meal_template_id: template.id,
    calories_snapshot: food.calories, protein_snapshot: food.protein,
    carbs_snapshot: food.carbs, fat_snapshot: food.fat,
    cost_snapshot: food.estimated_cost || 0, status: "LOGGED",
    planner_version: "v2.0-guard-fixture", timezone_snapshot: "UTC" });
  await insert("meal_plan_items", { id: ids.meal_plan_items, meal_plan_id: ids.meal_plans,
    planned_meal_id: ids.planned_meals, food_id: food.id, quantity: 1,
    serving_size: food.serving_size || "1 serving", portion_type: "DISCRETE", unit: "serving",
    calories_snapshot: food.calories, protein_snapshot: food.protein,
    carbs_snapshot: food.carbs, fat_snapshot: food.fat,
    cost_snapshot: food.estimated_cost || 0 });
  await insert("food_logs", { id: ids.food_logs, user_id: uid, planned_meal_id: ids.planned_meals,
    food_id: food.id, quantity: 1, meal_type: "breakfast", source: "planned_v2",
    logged_at: `${date}T08:00:00Z`, calories: food.calories, protein: food.protein,
    carbs: food.carbs, fat: food.fat, estimated_cost: food.estimated_cost || 0,
    serving_snapshot: food.serving_size || "1 serving",
    ingredients_snapshot: [{ food_id: food.id, name: food.name }] });

  await expectRpcDenied("LOGGED status with linked log");
  const pending = value(await db.from("planned_meals").update({ status: "PLANNED" })
    .eq("id", ids.planned_meals).eq("user_id", uid).select("id,status").single(),
  "switch fixture to linked-log-only guard branch");
  check(pending.status === "PLANNED", "linked-log-only branch has PLANNED status");
  await expectRpcDenied("PLANNED status with linked food log");
  const after = value(await db.from("fitness_os_profiles").select("*")
    .eq("user_id", uid).single(), "reload designated profile");
  check(JSON.stringify(after) === JSON.stringify(originalProfile), "RPC probe never changed the profile or V2 flag");
} catch (error) {
  failure = error;
} finally {
  const errors = [];
  if (fixtureInsertStarted) {
    // If an old RPC unexpectedly replaces the plan, include only its named
    // replacement; never delete an unrelated row on this date.
    let planIds = [ids.meal_plans];
    try {
      const plans = await fixtureRows("meal_plans", "id,name");
      planIds = [...new Set([...planIds, ...plans
        .filter(plan => plan.name === "Guard replacement probe").map(plan => plan.id)])];
    } catch (error) { errors.push(`read replacement plans: ${error.message}`); }
    for (const [table, query] of [
      ["food_logs", () => db.from("food_logs").delete().eq("id", ids.food_logs).eq("user_id", uid)],
      ["meal_plan_items", () => db.from("meal_plan_items").delete().eq("id", ids.meal_plan_items)],
      ["planned_meals", () => db.from("planned_meals").delete().eq("id", ids.planned_meals).eq("user_id", uid)],
      ["meal_plans", () => db.from("meal_plans").delete().in("id", planIds).eq("user_id", uid)],
    ]) {
      try {
        const response = await query();
        if (response.error) errors.push(`${table}: ${response.error.message}`);
      } catch (error) { errors.push(`${table}: ${error.message}`); }
    }
  }
  try {
    check((await own("meal_plans", "id")).length === baseline.mealPlans.length &&
      (await own("planned_meals", "id")).length === baseline.plannedMeals.length &&
      (await own("food_logs", "id")).length === baseline.foodLogs.length,
    "plan, meal, and log account counts returned to their private snapshot");
    const profile = value(await db.from("fitness_os_profiles").select("*")
      .eq("user_id", uid).single(), "reload profile after cleanup");
    if (originalProfile) check(JSON.stringify(profile) === JSON.stringify(originalProfile),
      "profile and V2 flag unchanged after cleanup");
    check((await fixtureRows("meal_plans", "id")).length === 0 &&
      (await fixtureRows("planned_meals", "id")).length === 0,
    "isolated fixture date is empty after cleanup");
  } catch (error) { errors.push(`verification: ${error.message}`); }
  if (errors.length) failure = new Error(`${failure?.message || ""} Cleanup failed: ${errors.join("; ")}`);
}
if (failure) {
  console.error(JSON.stringify({ passed: false, assertionsExecuted: assertions,
    error: failure.message, v2FlagChanged: false }));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ passed: true, assertionsExecuted: assertions,
    directRpcGuardBranches: 2, fixtureCleanupComplete: true, v2FlagChanged: false }));
}
