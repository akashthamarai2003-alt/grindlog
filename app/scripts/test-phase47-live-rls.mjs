import assert from "node:assert/strict";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// This runner uses one explicitly designated account and one temporary unflagged
// account. All access/mutation assertions use authenticated clients with anon keys.
// Admin access is limited to test-user setup, verifying fixture survival, and
// cleanup by the exact UUIDs allocated in this run. It never changes V2 flags.
dotenv.config({ path: ".env.local", quiet: true });
const argv = process.argv.slice(2);
const userId = argv[argv.indexOf("--user-id") + 1];
if (!argv.includes("--execute") || !argv.includes("--user-id")) {
  console.log("Usage: node scripts/test-phase47-live-rls.mjs --user-id <designated UUID> --execute");
  process.exit(0);
}
assert.match(userId, /^[0-9a-f-]{36}$/i, "An explicit designated user UUID is required");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(url && anonKey && adminKey, "Supabase configuration is required");
const settings = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, adminKey, settings);
const anon = createClient(url, anonKey, settings);
const tracked = new Map(["food_logs", "meal_plan_items", "planned_meals", "meal_plans"].map(t => [t, new Set()]));
const users = [];
let temporaryUserId;
let assertions = 0;
function check(condition, message) {
  assertions++;
  assert.ok(condition, message);
}
function result(response, label) {
  if (response.error) throw new Error(`${label}: ${response.error.code}: ${response.error.message}`);
  return response.data;
}
async function insert(client, table, row) {
  tracked.get(table).add(row.id);
  const saved = result(await client.from(table).insert(row).select("id").single(), `insert ${table}`);
  check(saved.id === row.id, `own ${table} INSERT executes`);
}
async function deniedInsert(client, table, row, label) {
  tracked.get(table).add(row.id);
  const response = await client.from(table).insert(row).select("id");
  check(response.error?.code === "42501", `${label}: expected RLS denial, got ${response.error?.code || "success"}`);
}
const fixtureDate = "2099-10-04";
const runId = crypto.randomUUID();
let failure;
try {
  const designated = result(await admin.auth.admin.getUserById(userId), "designated auth user").user;
  check(designated?.id === userId && Boolean(designated.email), "designated auth identity exists");
  const link = result(await admin.auth.admin.generateLink({ type: "magiclink", email: designated.email }), "generate designated test login");
  check(link.user.id === userId, "generated login belongs to designated user");
  const clientA = createClient(url, anonKey, settings);
  const loginA = result(await clientA.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: "magiclink" }), "authenticate designated user");
  check(loginA.user?.id === userId, "User A has a real authenticated session");
  const password = crypto.randomBytes(32).toString("base64url");
  const email = `phase47-rls-${runId}@example.test`;
  const created = result(await admin.auth.admin.createUser({ email, password, email_confirm: true,
    app_metadata: { purpose: "nutrition_phase47_rls_fixture", run_id: runId } }), "create temporary RLS user");
  temporaryUserId = created.user.id;
  check(temporaryUserId !== userId, "temporary user is distinct from designated account");
  const clientB = createClient(url, anonKey, settings);
  const loginB = result(await clientB.auth.signInWithPassword({ email, password }), "authenticate temporary user");
  check(loginB.user?.id === temporaryUserId, "User B has a real authenticated session");
  const profileB = result(await admin.from("fitness_os_profiles").select("nutrition_engine_v2")
    .eq("user_id", temporaryUserId).maybeSingle(), "temporary rollout flag");
  check(profileB?.nutrition_engine_v2 !== true, "User B remains unflagged");
  const food = result(await clientA.from("foods").select("id").eq("name", "White Rice (Steamed)").single(), "live fixture food");
  const template = result(await clientA.from("meal_templates").select("id").eq("code", "PG_MESS_BREAKFAST").single(), "live fixture template");
  for (const [id, client] of [[userId, clientA], [temporaryUserId, clientB]]) {
    const existing = result(await admin.from("meal_plans").select("id").eq("user_id", id).eq("date", fixtureDate), "fixture date availability");
    check(existing.length === 0, "fixture date contains no existing plan");
    const plan = { id: crypto.randomUUID(), user_id: id, date: fixtureDate, name: `Phase 4.7 RLS fixture ${runId}`,
      meal_type: "daily", status: "READY", calories: 100, protein: 5, carbs: 20, fat: 1, estimated_cost: 0 };
    const meal = { id: crypto.randomUUID(), user_id: id, meal_plan_id: plan.id, local_date: fixtureDate,
      meal_slot: "breakfast", meal_sequence: 1, source_type: "TEMPLATE", meal_template_id: template.id,
      calories_snapshot: 100, protein_snapshot: 5, carbs_snapshot: 20, fat_snapshot: 1, cost_snapshot: 0 };
    const item = { id: crypto.randomUUID(), meal_plan_id: plan.id, planned_meal_id: meal.id,
      food_id: food.id, quantity: 100, serving_size: "100 g", portion_type: "CONTINUOUS", unit: "g" };
    const log = { id: crypto.randomUUID(), user_id: id, planned_meal_id: meal.id, food_id: food.id,
      quantity: 1, meal_type: "breakfast", calories: 100, protein: 5, carbs: 20, fat: 1,
      source: "manual", logged_at: `${fixtureDate}T12:00:00Z` };
    const rows = { meal_plans: plan, planned_meals: meal, meal_plan_items: item, food_logs: log };
    for (const [table, row] of Object.entries(rows)) await insert(client, table, row);
    users.push({ id, client, rows });
  }
  for (const [actor, other] of [[users[0], users[1]], [users[1], users[0]]]) {
    for (const [table, row] of Object.entries(other.rows)) {
      const own = result(await actor.client.from(table).select("id").eq("id", actor.rows[table].id), "own SELECT");
      check(own.length === 1, `${table}: owner can SELECT fixture`);
      const foreign = result(await actor.client.from(table).select("id").eq("id", row.id), "foreign SELECT");
      check(foreign.length === 0, `${table}: other user cannot SELECT fixture`);
      const column = table === "meal_plans" ? "name" : table === "planned_meals" ? "meal_slot" : table === "meal_plan_items" ? "quantity" : "calories";
      const updated = result(await actor.client.from(table).update({ [column]: row[column] }).eq("id", row.id).select("id"), "foreign UPDATE");
      check(updated.length === 0, `${table}: other user cannot UPDATE fixture`);
      const deleted = result(await actor.client.from(table).delete().eq("id", row.id).select("id"), "foreign DELETE");
      check(deleted.length === 0, `${table}: other user cannot DELETE fixture`);
      await deniedInsert(actor.client, table, { ...row, id: crypto.randomUUID(),
        ...(table === "meal_plans" ? { date: "2099-10-05" } : {}),
        ...(table === "planned_meals" ? { local_date: "2099-10-05", meal_sequence: 2 } : {}) }, `foreign ${table} INSERT`);
    }
    await deniedInsert(actor.client, "planned_meals", { ...actor.rows.planned_meals, id: crypto.randomUUID(),
      meal_plan_id: other.rows.meal_plans.id, meal_sequence: 2 }, "cross-owner planned meal parent");
    for (const changes of [
      { meal_plan_id: actor.rows.meal_plans.id, planned_meal_id: other.rows.planned_meals.id },
      { meal_plan_id: other.rows.meal_plans.id, planned_meal_id: actor.rows.planned_meals.id }
    ]) await deniedInsert(actor.client, "meal_plan_items", { ...actor.rows.meal_plan_items, ...changes,
      id: crypto.randomUUID() }, "cross-owner item parents");
    await deniedInsert(actor.client, "food_logs", { ...actor.rows.food_logs, id: crypto.randomUUID(),
      planned_meal_id: other.rows.planned_meals.id }, "cross-owner food log parent");
    const calls = [
      ["persist_v2_meal_plan_atomic", { p_user_id: other.id, p_plan_days: [], p_planned_meals: [] }],
      ["execute_v2_meal_swap_atomic", { p_user_id: other.id, p_date: fixtureDate, p_meal_slot: "breakfast",
        p_day_start: `${fixtureDate}T00:00:00Z`, p_day_end: `${fixtureDate}T23:59:59Z`, p_swap: {} }],
      ["log_v2_planned_meal_atomic", { p_user_id: other.id, p_date: fixtureDate, p_meal_slot: "breakfast", p_food_logs: [] }]
    ];
    for (const [rpc, payload] of calls) {
      const response = await actor.client.rpc(rpc, payload);
      check(response.error?.code === "P0001" && response.error.message.includes("PERMISSION_DENIED"), `${rpc}: rejects another user`);
    }
  }
  const legacyItem = { ...users[0].rows.meal_plan_items, id: crypto.randomUUID(), planned_meal_id: null };
  await insert(users[0].client, "meal_plan_items", legacyItem);
  const legacyRead = result(await users[0].client.from("meal_plan_items").select("id").eq("id", legacyItem.id), "legacy item read");
  check(legacyRead.length === 1, "legacy meal-plan-only item remains accessible to its owner");
  for (const user of users) for (const [table, row] of Object.entries(user.rows)) {
    const saved = result(await admin.from(table).select("id").eq("id", row.id).single(), "fixture survival");
    check(saved.id === row.id, "foreign mutation attempts left the original fixture intact");
  }
  const response = await anon.rpc("persist_v2_meal_plan_atomic", { p_user_id: null, p_plan_days: [], p_planned_meals: [] });
  check(response.error?.code === "42501", "anon cannot execute the V2 persistence function");
} catch (error) {
  failure = error;
} finally {
  const cleanupErrors = [];
  for (const [table, ids] of tracked) if (ids.size > 0) {
    const response = await admin.from(table).delete().in("id", [...ids]);
    if (response.error) cleanupErrors.push(`${table}: ${response.error.message}`);
  }
  if (temporaryUserId && temporaryUserId !== userId) {
    const response = await admin.auth.admin.deleteUser(temporaryUserId);
    if (response.error) cleanupErrors.push(`temporary auth user: ${response.error.message}`);
  }
  if (cleanupErrors.length) failure = new Error(`${failure?.message || ""} Cleanup failed: ${cleanupErrors.join("; ")}`);
}
if (failure) {
  console.error(JSON.stringify({ passed: false, assertionsExecuted: assertions, error: failure.message }));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ passed: true, assertionsExecuted: assertions, fixtureCleanupComplete: true,
    designatedUserId: userId, rlsRequestsUsedServiceRole: false, v2FlagChanged: false }));
}
