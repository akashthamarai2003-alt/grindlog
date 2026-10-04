import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { chromium } from "@playwright/test";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";
import { NutritionService } from "../lib/services/nutrition/nutrition-service.ts";
import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

dotenv.config({ path: ".env.local", quiet: true });
const args = process.argv.slice(2);
const uid = args[args.indexOf("--user-id") + 1];
if (!args.includes("--execute") || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(uid || "")) {
  console.log("Usage: node --import ./scripts/register-ts-loader.mjs scripts/test-phase5-live-ui.mjs --user-id <designated-test-UUID> --execute");
  process.exit(0);
}
assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY, "Supabase credentials are required");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const report = { uid, passed: false, stages: {}, cleanup: {}, errors: [] };
const snapshotFile = path.join(os.tmpdir(), `grindlog-phase5-live-${uid}-${crypto.randomUUID()}.json`);
const profileChanges = {
  food_environment: "Hostel", meals_per_day: "3 meals", mess_available: true,
  goal: "Maintain", weight: 65, height: 172, nutrition_engine_v2: true,
};
const read = (response, label) => {
  if (response.error) throw new Error(`${label}: ${response.error.code || ""} ${response.error.message}`);
  return response.data;
};
const own = async (table, columns = "*") =>
  read(await db.from(table).select(columns).eq("user_id", uid), `read ${table}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = (condition, message) => assert.ok(condition, message);
const omitAudit = (row) => Object.fromEntries(Object.entries(row).filter(([key]) =>
  !["updated_at", "created_at"].includes(key)));
let snapshot;
let profileChanged = false;
let browser;

try {
  const [profile, mealPlans, plannedMeals, foodLogs, groceryItems, workoutPlans, targets] = await Promise.all([
    db.from("fitness_os_profiles").select("*").eq("user_id", uid).single().then((r) => read(r, "test profile")),
    own("meal_plans"), own("planned_meals"), own("food_logs"),
    own("fitness_grocery_items"), own("fitness_os_workout_plans"), own("nutrition_targets"),
  ]);
  check(profile.nutrition_engine_v2 === false, "designated profile must start with V2 disabled");
  check(mealPlans.length === 0 && plannedMeals.length === 0 && foodLogs.length === 0,
    "designated account must start without plan/log fixtures");
  check(workoutPlans.some((plan) => plan.status === "active"), "active workout plan is required");
  snapshot = { uid, profile, mealPlans, plannedMeals, foodLogs, groceryItems, workoutPlans, targets };
  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2), { flag: "wx", mode: 0o600 });
  report.snapshotFile = snapshotFile;
  const timezone = await NutritionService.getUserTimezone(uid);
  const today = await NutritionService.getLocalDateString(uid, timezone);
  const day2 = new Date(`${today}T12:00:00Z`);
  day2.setUTCDate(day2.getUTCDate() + 1);
  const nextDate = day2.toISOString().slice(0, 10);
  const preview = generateUnified7DayPlan(
    V2PlanService.mapProfileToV2Context({ ...profile, ...profileChanges }, null, timezone), today);
  check(preview.metrics.hardConstraintPass && preview.metrics.compositeScore >= 75 &&
    preview.plannedMeals.length === 21, "temporary profile cannot produce a valid 21-meal V2 preview");
  report.stages.preflight = { today, timezone, previewMeals: preview.plannedMeals.length,
    startingPlanRows: mealPlans.length, startingLogRows: foodLogs.length };

  // Authenticate the one designated account with anon credentials and use
  // Supabase SSR's own cookie encoder for the real Next.js middleware/session.
  const authUser = read(await db.auth.admin.getUserById(uid), "designated auth identity").user;
  check(authUser?.id === uid && Boolean(authUser.email), "designated auth identity missing");
  const magicLink = read(await db.auth.admin.generateLink({ type: "magiclink", email: authUser.email }), "test login");
  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const session = read(await anon.auth.verifyOtp({ token_hash: magicLink.properties.hashed_token,
    type: "magiclink" }), "test authentication").session;
  check(session?.user?.id === uid, "test login resolved to another account");
  let cookies = [];
  const ssr = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookies,
      setAll: (updates) => { for (const update of updates) {
        cookies = cookies.filter((cookie) => cookie.name !== update.name);
        cookies.push(update);
      } },
    },
  });
  read(await ssr.auth.setSession({ access_token: session.access_token,
    refresh_token: session.refresh_token }), "encode test browser session");
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addCookies(cookies.map(({ name, value }) => ({ name, value,
    url: "http://localhost:3000" })));
  const page = await context.newPage();
  report.stages.browserErrors = [];
  page.on("pageerror", (error) => report.stages.browserErrors.push(error.message));
  await page.goto("http://localhost:3000/nutrition", { waitUntil: "domcontentloaded", timeout: 90000 });
  report.stages.legacyProbe = { url: page.url(), headings: await page.locator("h1").allTextContents(),
    cookieNames: cookies.map(({ name }) => name) };
  await page.getByRole("heading", { name: "Your Meals" }).waitFor({ timeout: 45000 });
  check(await page.getByRole("heading", { name: "Your Meals" }).isVisible(),
    "unflagged designated account did not use the legacy page");
  report.stages.legacyBefore = "Your Meals rendered while V2=false";

  const changed = read(await db.from("fitness_os_profiles").update(profileChanges)
    .eq("user_id", uid).eq("updated_at", profile.updated_at).select("user_id,nutrition_engine_v2"),
  "temporary designated profile");
  profileChanged = changed.length > 0;
  check(changed.length === 1 && changed[0].nutrition_engine_v2 === true,
    "temporary V2 enable affected no or multiple profiles");
  const generated = await V2PlanService.generateV2MealPlan(uid, { startDate: today });
  check(generated.plannedMeals.length === 21, "live V2 generation did not save 21 meals");
  report.stages.generation = { generatedMeals: generated.plannedMeals.length };

  await page.goto("http://localhost:3000/nutrition", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.getByRole("heading", { name: "Your Nutrition" }).waitFor({ timeout: 30000 });
  await page.locator('[data-v2-ready="true"]').waitFor({ timeout: 45000 });
  await page.locator("article").first().waitFor();
  check(await page.locator("article").count() === 3, "live Day 1 does not show three V2 cards");
  const response = await page.request.get(`http://localhost:3000/api/nutrition/v2-day?date=${today}`);
  const payload = await response.json();
  check(response.ok() && payload.success && payload.data?.meals?.length === 3 &&
    Boolean(payload.data.planId), `real V2 day API failed: ${JSON.stringify(payload.error || {})}`);
  check(payload.data.meals.every((meal) => meal.ingredients.length > 0),
    "V2 read model lacks persisted detailed ingredients");
  check(payload.data.meals.every((meal) => meal.imageUrl?.length > 0),
    "V2 image and fallback resolution failed");
  const screenshot = path.join(process.cwd(), "artifacts", "phase5a", "live-test-account.png");
  fs.mkdirSync(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
  report.stages.liveDay1 = { planId: payload.data.planId, cards: payload.data.meals.length,
    ingredients: payload.data.meals.reduce((sum, meal) => sum + meal.ingredients.length, 0),
    screenshot };

  // Day switching must fetch real persisted rows for the next local date.
  if (new Date(`${today}T12:00:00Z`).getUTCDay() === 0) {
    await page.getByRole("button", { name: "Next week" }).click();
  }
  await page.getByRole("region", { name: "Choose plan day" })
    .getByRole("button", { name: new RegExp(nextDate.slice(-2)) }).click();
  await page.locator("article").first().waitFor();
  const second = read(await db.from("planned_meals").select("id").eq("user_id", uid)
    .eq("local_date", nextDate), "real Day 2 persistence");
  check(second.length === 3 && await page.locator("article").count() === 3,
    "day selector failed to render persisted Day 2 meals");
  report.stages.daySwitch = { selectedDate: nextDate, persistedMeals: second.length };

  if (new Date(`${today}T12:00:00Z`).getUTCDay() === 0) {
    await page.getByRole("button", { name: "Previous week" }).click();
  }
  await page.getByRole("region", { name: "Choose plan day" })
    .getByRole("button", { name: new RegExp(today.slice(-2)) }).click();
  await page.locator("article").first().waitFor();
  const lunchBefore = read(await db.from("planned_meals").select("id,recipe_variant_id,calories_snapshot,cost_snapshot")
    .eq("user_id", uid).eq("local_date", today).eq("meal_slot", "lunch").single(), "lunch before UI swap");
  await page.locator("article").nth(1).getByRole("button", { name: "Swap" }).click();
  const swapDialog = page.getByRole("dialog", { name: "Swap Lunch" });
  await swapDialog.waitFor();
  const chooseOptions = swapDialog.getByRole("button", { name: "Choose meal" });
  await chooseOptions.first().waitFor({ timeout: 45000 });
  const optionCount = await chooseOptions.count();
  check(optionCount >= 3 && optionCount <= 6, "real swap modal lacks 3–6 alternatives");
  await chooseOptions.first().click();
  await swapDialog.waitFor({ state: "hidden", timeout: 60000 });
  const lunchAfter = read(await db.from("planned_meals").select("id,recipe_variant_id,calories_snapshot,cost_snapshot")
    .eq("user_id", uid).eq("local_date", today).eq("meal_slot", "lunch").single(), "lunch after UI swap");
  check(lunchAfter.id === lunchBefore.id && lunchAfter.recipe_variant_id &&
    lunchAfter.recipe_variant_id !== lunchBefore.recipe_variant_id &&
    (lunchAfter.calories_snapshot !== lunchBefore.calories_snapshot ||
      lunchAfter.cost_snapshot !== lunchBefore.cost_snapshot),
  "real UI swap did not persist a different recipe and macros/cost");
  report.stages.swap = { alternativesShown: optionCount,
    caloriesBefore: lunchBefore.calories_snapshot, caloriesAfter: lunchAfter.calories_snapshot,
    costBefore: lunchBefore.cost_snapshot, costAfter: lunchAfter.cost_snapshot };

  await page.locator("article").first().getByRole("button", { name: "Log Meal" }).click();
  await page.locator("article").first().getByText("LOGGED", { exact: true })
    .waitFor({ timeout: 45000 });
  const breakfast = read(await db.from("planned_meals").select("id,status")
    .eq("user_id", uid).eq("local_date", today).eq("meal_slot", "breakfast").single(),
  "breakfast after UI logging");
  const breakfastLogs = read(await db.from("food_logs").select("id,source,planned_meal_id,calories")
    .eq("user_id", uid).eq("planned_meal_id", breakfast.id), "planned breakfast logs");
  check(breakfast.status === "LOGGED" && breakfastLogs.length > 0 &&
    breakfastLogs.every((log) => log.source === "planned_v2"),
  "real UI planned logging did not save V2 snapshots");
  report.stages.plannedLog = { itemLogs: breakfastLogs.length,
    calories: breakfastLogs.reduce((sum, log) => sum + Number(log.calories), 0) };

  await page.locator("article").nth(2).getByRole("button", { name: "View details" }).click();
  await page.locator("article").nth(2).getByRole("button", { name: "I ate different food" }).click();
  await page.getByRole("heading", { name: "Search Food" }).waitFor();
  await page.getByPlaceholder(/Search 100% natural foods/).fill("Banana");
  await page.getByRole("button", { name: /Banana.*[0-9]/i }).first().click();
  await page.getByRole("button", { name: "Log Food" }).click();
  await page.locator("article").nth(2).getByText("Different food logged")
    .waitFor({ timeout: 45000 });
  const actualLogs = read(await db.from("food_logs").select("id,source,planned_meal_id,meal_type,calories")
    .eq("user_id", uid).eq("meal_type", "dinner"), "manual dinner logs");
  const dinner = read(await db.from("planned_meals").select("status").eq("user_id", uid)
    .eq("local_date", today).eq("meal_slot", "dinner").single(), "dinner after manual logging");
  check(actualLogs.length === 1 && actualLogs[0].source === "manual" &&
    actualLogs[0].planned_meal_id === null && dinner.status === "PLANNED",
  "real UI actual-food logging claimed that the planned dinner was eaten");
  const afterLogsResponse = await page.request.get(`http://localhost:3000/api/nutrition/v2-day?date=${today}`);
  const afterLogs = (await afterLogsResponse.json()).data;
  const realIntake = [...breakfastLogs, ...actualLogs]
    .reduce((sum, log) => sum + Number(log.calories), 0);
  check(afterLogsResponse.ok() && Math.abs(afterLogs.consumed.calories - realIntake) < 1,
    "dashboard calories do not equal saved actual food logs");
  const loggedScreenshot = path.join(process.cwd(), "artifacts", "phase5a", "live-after-logging.png");
  await page.screenshot({ path: loggedScreenshot, fullPage: true });
  report.stages.actualLog = { dinnerStatus: dinner.status, manualCalories: actualLogs[0].calories,
    consumedCalories: afterLogs.consumed.calories, screenshot: loggedScreenshot };

  await page.getByRole("link", { name: /Grocery List/i }).first().click();
  await page.waitForURL("**/grocery", { timeout: 30000 });
  await page.getByRole("heading", { name: "Smart Grocery" }).waitFor({ timeout: 45000 });
  check(await page.getByRole("heading", { name: "Smart Grocery" }).isVisible(),
    "grocery page did not render");
  const grocery = await own("fitness_grocery_items");
  check(grocery.length > 0 && await page.getByText(grocery[0].name, { exact: false }).first().isVisible(),
    "grocery page did not render the persisted V2 purchase rows");
  report.stages.grocery = { persistedRows: grocery.length, route: page.url() };
  report.passed = true;
} catch (error) {
  report.errors.push(String(error?.stack || error));
} finally {
  if (browser) await browser.close().catch((error) => report.errors.push(`browser: ${error.message}`));
  if (snapshot && profileChanged) {
    const clean = async (label, task) => { try { await task(); report.cleanup[label] = "ok"; }
      catch (error) { report.errors.push(`${label}: ${error.message}`); report.cleanup[label] = "FAILED"; } };
    await clean("logs", async () => {
      const rows = await own("food_logs", "id");
      const created = rows.filter((row) => !snapshot.foodLogs.some((old) => old.id === row.id));
      if (created.length) read(await db.from("food_logs").delete().eq("user_id", uid)
        .in("id", created.map((row) => row.id)), "delete temporary logs");
    });
    await clean("plans", async () => {
      const rows = await own("meal_plans", "id");
      const created = rows.filter((row) => !snapshot.mealPlans.some((old) => old.id === row.id));
      if (created.length) {
        const ids = created.map((row) => row.id);
        read(await db.from("meal_plan_items").delete().in("meal_plan_id", ids), "delete test items");
        read(await db.from("planned_meals").delete().eq("user_id", uid)
          .in("meal_plan_id", ids), "delete test meals");
        read(await db.from("meal_plans").delete().eq("user_id", uid).in("id", ids), "delete test plans");
      }
      check((await own("meal_plans", "id")).length === snapshot.mealPlans.length &&
        (await own("planned_meals", "id")).length === snapshot.plannedMeals.length,
      "test plans remain after cleanup");
    });
    await clean("grocery_and_workout", async () => {
      for (const workout of snapshot.workoutPlans) {
        read(await db.from("fitness_os_workout_plans").update({ plan_data: workout.plan_data })
          .eq("id", workout.id).eq("user_id", uid), "restore workout nutrition projection");
      }
      const existing = await own("fitness_grocery_items", "id");
      if (existing.length) read(await db.from("fitness_grocery_items").delete()
        .eq("user_id", uid).in("id", existing.map((row) => row.id)), "remove test grocery rows");
      if (snapshot.groceryItems.length) read(await db.from("fitness_grocery_items")
        .insert(snapshot.groceryItems), "restore original grocery rows");
      check(same((await own("fitness_grocery_items")).map(omitAudit).sort((a,b) => a.id.localeCompare(b.id)),
        snapshot.groceryItems.map(omitAudit).sort((a,b) => a.id.localeCompare(b.id))),
      "grocery functional rows were not restored");
    });
    await clean("targets", async () => {
      const current = await own("nutrition_targets");
      const added = current.filter((row) => !snapshot.targets.some((old) => old.id === row.id));
      if (added.length) read(await db.from("nutrition_targets").delete().eq("user_id", uid)
        .in("id", added.map((row) => row.id)), "remove temporary targets");
      for (const row of snapshot.targets) {
        read(await db.from("nutrition_targets").update({ calories: row.calories,
          protein: row.protein, carbs: row.carbs, fat: row.fat, water_ml: row.water_ml,
          effective_date: row.effective_date }).eq("id", row.id).eq("user_id", uid),
        "restore target values");
      }
    });
    await clean("profile", async () => {
      const original = Object.fromEntries(Object.keys(profileChanges).map((key) =>
        [key, snapshot.profile[key]]));
      read(await db.from("fitness_os_profiles").update(original).eq("user_id", uid),
        "restore designated profile");
      const after = read(await db.from("fitness_os_profiles").select("*")
        .eq("user_id", uid).single(), "reloaded restored profile");
      check(Object.keys(original).every((key) => same(after[key], original[key])) &&
        after.nutrition_engine_v2 === false, "functional profile restoration failed");
      const changedFunctional = Object.keys(snapshot.profile).filter((key) =>
        !["updated_at", "created_at"].includes(key) &&
        !same(after[key], snapshot.profile[key]));
      check(changedFunctional.length === 0,
        `unexpected profile field changes: ${changedFunctional.join(", ")}`);
      check(new Date(after.updated_at) > new Date(snapshot.profile.updated_at),
        "profile restoration audit timestamp was not advanced");
      report.stages.profileRestoration = { functionalFieldsRestored: Object.keys(original),
        fullFunctionalProfileMatch: true,
        nutritionEngineV2: after.nutrition_engine_v2,
        updatedAtNotBackdated: new Date(after.updated_at) > new Date(snapshot.profile.updated_at) };
    });
  }
  if (snapshot && profileChanged) {
    try {
      const [plans, meals, logs, groceries, targets, workouts] = await Promise.all([
        own("meal_plans", "id"), own("planned_meals", "id"),
        own("food_logs", "id"), own("fitness_grocery_items", "id"),
        own("nutrition_targets"), own("fitness_os_workout_plans"),
      ]);
      check(plans.length === snapshot.mealPlans.length &&
        meals.length === snapshot.plannedMeals.length &&
        logs.length === snapshot.foodLogs.length &&
        groceries.length === snapshot.groceryItems.length,
      "post-cleanup row counts differ from snapshot");
      check(same(targets.map(omitAudit).sort((a,b) => a.id.localeCompare(b.id)),
        snapshot.targets.map(omitAudit).sort((a,b) => a.id.localeCompare(b.id))),
      "nutrition targets differ after cleanup");
      check(workouts.every((workout) => same(workout.plan_data,
        snapshot.workoutPlans.find((old) => old.id === workout.id)?.plan_data)),
      "workout nutrition projection differs after cleanup");
      report.stages.postCleanup = { planRows: plans.length, plannedMealRows: meals.length,
        foodLogRows: logs.length, groceryRows: groceries.length };
    } catch (error) { report.errors.push(`post-cleanup verification: ${error.message}`); }
  }
  if (report.errors.length) report.passed = false;
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
