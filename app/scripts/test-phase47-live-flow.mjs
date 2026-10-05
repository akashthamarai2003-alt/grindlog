import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";
import { NutritionService } from "../lib/services/nutrition/nutrition-service.ts";
import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";

dotenv.config({ path: ".env.local", quiet: true });
const args = process.argv.slice(2);
const uid = args[args.indexOf("--user-id") + 1];
const backupFile = args[args.indexOf("--backup-file") + 1];
if (!args.includes("--execute") || !uid || !backupFile) {
  console.log("Usage: node --import ./scripts/register-ts-loader.mjs scripts/test-phase47-live-flow.mjs --user-id UUID --backup-file PRIVATE_JSON --execute");
  process.exit(0);
}
assert.match(uid, /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i);
const baseline = JSON.parse(fs.readFileSync(backupFile, "utf8"));
assert.equal(baseline.uid, uid);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const changes = {
  food_environment: "Hostel",
  meals_per_day: "3 meals",
  mess_available: true,
  goal: "Maintain",
  weight: 65,
  height: 172,
  nutrition_engine_v2: true,
};
const restoreFields = Object.fromEntries(Object.keys({ ...changes, available_foods: null, updated_at: null })
  .map(key => [key, baseline.profile[key]]));
const report = { uid, profileSnapshotFile: backupFile, changedFields: Object.keys(restoreFields),
  stages: {}, cleanup: {}, profileRestored: false, passed: false };
const baselinePlanIds = new Set(baseline.mealPlans.map(row => row.id));
const baselineLogIds = new Set(baseline.foodLogs.map(row => row.id));
const baselineTargetIds = new Set(baseline.targets.map(row => row.id));
let dates = [];
let profileChanged = false;
let failure;
const reportFile = `${backupFile}.${crypto.randomUUID()}.report.json`;
function ok(condition, message) { assert.ok(condition, message); }
function data(response, label) {
  if (response.error) throw new Error(`${label}: ${response.error.code || ""} ${response.error.message}`);
  return response.data;
}
async function own(table, columns = "*") {
  return data(await db.from(table).select(columns).eq("user_id", uid), `read ${table}`);
}
function sameValue(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function sum(rows, key) { return rows.reduce((value, row) => value + Number(row[key] || 0), 0); }
const macros = ["calories", "protein", "carbs", "fat"];
function dateSequence(first) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(`${first}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + i);
    return day.toISOString().slice(0, 10);
  });
}
async function mealsForDate(date) {
  return data(await db.from("planned_meals").select("*")
    .eq("user_id", uid).eq("local_date", date).order("meal_sequence"), "reload meals");
}
async function detailedItems(mealId) {
  return data(await db.from("meal_plan_items").select("*")
    .eq("planned_meal_id", mealId).order("id"), "reload detailed items");
}
async function refreshGrocery() {
  const list = await V2PlanService.generateV2GroceryList(uid, dates[0], 7);
  const active = baseline.workoutPlans.find(plan => plan.status === "active");
  const rows = data(await db.from("fitness_grocery_items").select("*")
    .eq("user_id", uid).eq("plan_id", active.id), "reload grocery rows");
  const reloaded = data(await db.from("fitness_os_workout_plans").select("plan_data")
    .eq("id", active.id).single(), "reload workout grocery");
  const purchases = list.needToBuy.flatMap(group => group.items);
  ok(rows.length === purchases.length, "grocery purchase rows match returned list");
  for (const item of purchases) {
    const row = rows.find(entry => entry.name === item.name);
    ok(row && Number(row.monthly_quantity) === Number(item.monthly_quantity), `persisted grocery quantity for ${item.name}`);
    ok(Number(row.estimated_price) === Number(item.estimated_cost_inr) * 4, `persisted grocery cost for ${item.name}`);
    ok(Number(item.weekly_quantity) > 0, `positive grocery quantity for ${item.name}`);
  }
  ok((reloaded.plan_data?.nutrition?.grocery_list || []).length === rows.length,
    "grocery list persisted in workout plan and row table");
  for (const entry of [...list.providedByMess, ...list.alreadyHave]) {
    ok(!rows.some(row => row.name === entry.name), `provided or pantry food ${entry.name} excluded from purchase rows`);
  }
  ok(Math.abs(sum(purchases, "estimated_cost_inr") - list.totalWeeklySpendInr) < 0.01,
    "grocery cost equals its item costs");
  return { list, rows };
}
try {
  const original = data(await db.from("fitness_os_profiles").select("*")
    .eq("user_id", uid).single(), "read designated profile");
  ok(sameValue(original, baseline.profile), "profile changed since exact snapshot; stop before writing");
  ok(baseline.mealPlans.length === 0 && baseline.plannedMeals.length === 0 && baseline.foodLogs.length === 0,
    "test account requires an empty meal plan and food log baseline");
  ok((await own("meal_plans", "id")).length === 0 &&
    (await own("food_logs", "id")).length === 0, "no new plan or log was created after snapshot");
  const tz = await NutritionService.getUserTimezone(uid);
  dates = dateSequence(await NutritionService.getLocalDateString(uid, tz));
  const tempProfile = { ...original, ...changes };
  const context = V2PlanService.mapProfileToV2Context(tempProfile, null, tz);
  const preview = generateUnified7DayPlan(context, dates[0]);
  const projectedCost = sum(preview.plannedMeals, "costSnapshot");
  ok(preview.metrics.hardConstraintPass && preview.metrics.compositeScore >= 75,
    "temporary profile passes unmodified planner quality gates");
  ok(projectedCost <= context.weeklyBudgetTargetInr, "temporary profile fits corrected weekly budget");
  ok(preview.plannedMeals.length === 21, "preview contains exactly three meals per day");
  report.stages.preview = { startDate: dates[0], timezone: tz,
    qualityScore: preview.metrics.compositeScore, projectedCost, weeklyBudget: context.weeklyBudgetTargetInr };

  const updated = data(await db.from("fitness_os_profiles").update(changes)
    .eq("user_id", uid).eq("updated_at", original.updated_at).select("*"), "set designated profile");
  profileChanged = updated.length > 0;
  ok(updated.length === 1, "exactly the designated profile was changed");
  for (const [key, value] of Object.entries(changes)) ok(sameValue(updated[0][key], value), `temporary ${key} persisted`);
  ok(V2PlanService.isNutritionV2Enabled(uid, updated[0]) === true, "designated profile routes to V2");

  const generated = await V2PlanService.generateV2MealPlan(uid, { startDate: dates[0] });
  ok(generated.plannedMeals.length === 21, "service generated 21 V2 planned meals");
  const plans = data(await db.from("meal_plans").select("*")
    .eq("user_id", uid).in("date", dates).order("date"), "reload plan containers");
  const meals = data(await db.from("planned_meals").select("*")
    .eq("user_id", uid).in("local_date", dates), "reload all V2 meals");
  ok(plans.length === 7 && plans.every(p => p.status === "READY" && p.meal_type === "daily"),
    "exactly seven ready daily containers persisted");
  ok(meals.length === 21 && meals.every(m => m.planner_version?.startsWith("v2") && m.status === "PLANNED"),
    "exactly 21 authoritative V2 meals persisted without legacy generation");
  ok(meals.every(m => m.timezone_snapshot === tz), "plan timezone persisted correctly");
  const planIds = plans.map(p => p.id);
  const items = data(await db.from("meal_plan_items").select("*")
    .in("meal_plan_id", planIds), "reload plan items");
  const detailed = items.filter(item => item.planned_meal_id);
  const projections = items.filter(item => !item.planned_meal_id);
  ok(detailed.length >= 21 && projections.length >= 21, "both detailed and compatibility rows persisted");
  const foods = data(await db.from("foods").select("id,name,calories,protein,carbs,fat")
    .in("id", [...new Set(items.map(item => item.food_id))]), "verify live food UUIDs");
  ok(foods.length === new Set(items.map(item => item.food_id)).size, "all item food UUIDs resolve live");
  const versions = data(await db.from("recipe_versions").select("id,recipe_id")
    .in("id", [...new Set(meals.map(m => m.recipe_version_id).filter(Boolean))]), "verify recipe versions");
  const variants = data(await db.from("recipe_variants").select("id,recipe_version_id")
    .in("id", [...new Set(meals.map(m => m.recipe_variant_id).filter(Boolean))]), "verify recipe variants");
  const templates = data(await db.from("meal_templates").select("id")
    .in("id", [...new Set(meals.map(m => m.meal_template_id).filter(Boolean))]), "verify templates");
  const images = data(await db.from("recipe_images").select("id,recipe_version_id,url,status")
    .in("id", [...new Set(meals.map(m => m.image_asset_id).filter(Boolean))]), "verify image identities");
  const versionIds = new Set(versions.map(row => row.id));
  const templateIds = new Set(templates.map(row => row.id));
  const imageIds = new Set(images.map(row => row.id));
  const variantById = new Map(variants.map(row => [row.id, row]));
  ok(meals.every(m => m.source_type === "RECIPE" ?
    versionIds.has(m.recipe_version_id) && variantById.get(m.recipe_variant_id)?.recipe_version_id === m.recipe_version_id :
    m.source_type === "TEMPLATE" && templateIds.has(m.meal_template_id)), "recipe, variant, and template references valid");
  ok(meals.every(m => !m.image_asset_id || imageIds.has(m.image_asset_id)), "image metadata IDs valid");
  ok(meals.every(m => m.image_url_snapshot?.startsWith("data:image/svg+xml;utf8,") ||
    images.some(image => image.id === m.image_asset_id && image.recipe_version_id === m.recipe_version_id &&
      image.status === "APPROVED" && image.url === m.image_url_snapshot)),
    "meals use an owned approved image or resolvable offline fallback");
  for (const date of dates) {
    const daily = meals.filter(m => m.local_date === date);
    const container = plans.find(p => p.date === date);
    ok(daily.length === 3 && sameValue(daily.map(m => m.meal_slot).sort(), ["breakfast", "dinner", "lunch"]),
      `three expected meals persisted on ${date}`);
    ok(Math.abs(sum(daily, "calories_snapshot") - Number(container.calories)) <= 1,
      `daily calories match container on ${date}`);
  }
  ok(sum(meals, "cost_snapshot") <= context.weeklyBudgetTargetInr,
    "persisted weekly meal cost passes budget");
  const day1 = await NutritionService.getTodaySummaryAndDetails(uid, dates[0], true);
  ok(sameValue(day1.meals.map(m => m.meal_type), ["breakfast", "lunch", "dinner"]),
    "Day 1 reload uses V2 meal slots without legacy fallback");
  for (const displayed of day1.meals) {
    const saved = meals.find(m => m.local_date === dates[0] && m.meal_slot === displayed.meal_type);
    ok(Number(displayed.calories) === Number(saved.calories_snapshot), "Day 1 visible macro total equals frozen V2 meal");
  }
  report.stages.plan = { containers: plans.length, meals: meals.length, detailedItems: detailed.length,
    projections: projections.length, foodIds: foods.length, recipeVersions: versions.length,
    recipeVariants: variants.length, templateIds: templates.length, imageIds: images.length,
    weeklyMealCost: sum(meals, "cost_snapshot"), day1Slots: day1.meals.map(m => m.meal_type) };

  const beforeLunch = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "lunch");
  const beforeLunchItems = await detailedItems(beforeLunch.id);
  const swapOptions = await V2PlanService.getV2SwapOptions(uid, dates[0], "lunch");
  const option = swapOptions.find(candidate => candidate.recipe_variant_id !== beforeLunch.recipe_variant_id &&
    sum(meals, "cost_snapshot") - Number(beforeLunch.cost_snapshot) + Number(candidate.estimated_cost) <= context.weeklyBudgetTargetInr);
  ok(option, "different lunch swap option fits remaining weekly budget");
  await V2PlanService.executeV2MealSwap(uid, dates[0], "lunch", option);
  const afterLunch = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "lunch");
  const afterLunchItems = await detailedItems(afterLunch.id);
  ok(afterLunch.id === beforeLunch.id && afterLunch.recipe_variant_id === option.recipe_variant_id &&
    afterLunch.recipe_version_id === option.recipe_version_id, "lunch recipe and variant changed atomically");
  ok(afterLunchItems.length === option.items.length && !sameValue(afterLunchItems, beforeLunchItems),
    "lunch ingredients changed on reload");
  for (const [key, expected] of Object.entries({ calories_snapshot: option.calories,
    protein_snapshot: option.protein, carbs_snapshot: option.carbs, fat_snapshot: option.fat,
    cost_snapshot: option.estimated_cost })) {
    ok(Math.abs(Number(afterLunch[key]) - Number(expected)) < 0.11, `swapped lunch ${key} persisted`);
  }
  report.stages.swap = { beforeRecipeVersion: beforeLunch.recipe_version_id,
    afterRecipeVersion: afterLunch.recipe_version_id, beforeCalories: beforeLunch.calories_snapshot,
    afterCalories: afterLunch.calories_snapshot, beforeCost: beforeLunch.cost_snapshot,
    afterCost: afterLunch.cost_snapshot, ingredientCount: afterLunchItems.length };

  const breakfast = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "breakfast");
  const breakfastItems = await detailedItems(breakfast.id);
  await V2PlanService.logV2PlannedMeal(uid, dates[0], "breakfast");
  const loggedBreakfast = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "breakfast");
  const breakfastLogs = data(await db.from("food_logs").select("*")
    .eq("user_id", uid).eq("planned_meal_id", breakfast.id), "reload planned breakfast logs");
  ok(loggedBreakfast.status === "LOGGED" && breakfastLogs.length === breakfastItems.length,
    "planned breakfast status and item logs persisted");
  for (const item of breakfastItems) {
    const log = breakfastLogs.find(row => row.food_id === item.food_id);
    ok(log && log.source === "planned_v2", "planned log retains the correct food and source");
    for (const key of macros) ok(Math.abs(Number(log[key]) - Number(item[`${key}_snapshot`])) < 0.11,
      `planned log retains ${key} frozen snapshot`);
  }
  const breakfastAfterLog = { ...loggedBreakfast };
  const breakfastLogIds = breakfastLogs.map(log => log.id).sort();
  report.stages.plannedLog = { itemCount: breakfastLogs.length,
    calories: sum(breakfastLogs, "calories"), status: loggedBreakfast.status };

  const dinner = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "dinner");
  const dinnerItems = await detailedItems(dinner.id);
  const different = data(await db.from("foods").select("*")
    .in("name", ["White Rice (Steamed)", "Banana", "Apple"]).eq("is_active", true), "find actual food")
    .find(food => !dinnerItems.some(item => item.food_id === food.id));
  ok(different, "different actual food is available for the dinner slot");
  const actualSaved = await NutritionService.logMultipleFoods(uid,
    [{ food_id: different.id, meal_type: "dinner", quantity: 1 }]);
  ok(actualSaved.length === 1, "different actual food logged through service");
  const actual = data(await db.from("food_logs").select("*")
    .eq("id", actualSaved[0].id).eq("user_id", uid).single(), "reload actual log");
  ok(actual.food_id === different.id && actual.source === "manual" && actual.planned_meal_id == null,
    "actual dinner has distinct live food and no planned-meal claim");
  ok((await mealsForDate(dates[0])).find(meal => meal.meal_slot === "dinner").status === "PLANNED",
    "logging different actual dinner did not mark the planned dinner eaten");
  report.stages.actualLog = { foodId: actual.food_id, calories: actual.calories,
    plannedMealLinked: actual.planned_meal_id != null, dinnerStatus: "PLANNED" };

  const adaptive = await V2PlanService.getV2AdaptiveRemainingDay(uid, dates[0]);
  const allLogs = await own("food_logs");
  for (const key of macros) {
    ok(Math.abs(Number(adaptive.consumedMacros[key]) - sum(allLogs, key)) < 1.1,
      `adaptive consumed ${key} sums actual food logs`);
    ok(Math.abs(Number(adaptive.remainingMacros[key]) -
      Math.max(0, Number(adaptive.dailyTargets[key]) - sum(allLogs, key))) < 1.1,
      `adaptive remaining ${key} follows actual intake`);
  }
  report.stages.adaptive = { targets: adaptive.dailyTargets,
    consumed: adaptive.consumedMacros, remaining: adaptive.remainingMacros };

  const breakfastOptions = await V2PlanService.getV2SwapOptions(uid, dates[0], "breakfast");
  ok(breakfastOptions.length > 0, "breakfast swap option exists for logged-meal denial test");
  let deniedSwap = "";
  try { await V2PlanService.executeV2MealSwap(uid, dates[0], "breakfast", breakfastOptions[0]); }
  catch (error) { deniedSwap = String(error.message); }
  ok(deniedSwap.includes("CANNOT_SWAP_LOGGED_MEAL"), "logged breakfast cannot be swapped");
  let deniedRegeneration = "";
  try { await V2PlanService.generateV2MealPlan(uid, { startDate: dates[0], forceV2: true }); }
  catch (error) { deniedRegeneration = String(error.message); }
  ok(deniedRegeneration.includes("CANNOT_REGENERATE_LOGGED_MEAL"),
    "service refuses plan regeneration over logged breakfast");
  const stableBreakfast = (await mealsForDate(dates[0])).find(meal => meal.meal_slot === "breakfast");
  const stableLogs = data(await db.from("food_logs").select("id")
    .eq("user_id", uid).eq("planned_meal_id", breakfast.id), "reload protected logs");
  ok(sameValue(stableBreakfast, breakfastAfterLog) &&
    sameValue(stableLogs.map(row => row.id).sort(), breakfastLogIds),
    "logged meal and logs remain unchanged after denied swap and regeneration");
  report.stages.history = { loggedMealStable: true, swapDenied: true, regenerationDenied: true };

  const firstGrocery = await refreshGrocery();
  ok(firstGrocery.list.providedByMess.length > 0, "mess-provided foods excluded from purchases");
  const firstPurchase = firstGrocery.list.needToBuy.flatMap(group => group.items)[0];
  ok(firstPurchase, "grocery has a purchasable food to exercise pantry subtraction");
  const pantryUpdate = data(await db.from("fitness_os_profiles").update({ available_foods: [firstPurchase.name] })
    .eq("user_id", uid).select("available_foods"), "temporary pantry fixture");
  ok(pantryUpdate.length === 1, "pantry fixture limited to designated profile");
  const pantryGrocery = await refreshGrocery();
  ok(pantryGrocery.list.alreadyHave.some(entry => entry.name === firstPurchase.name),
    "existing food is subtracted into pantry list");
  ok(!pantryGrocery.rows.some(row => row.name === firstPurchase.name),
    "pantry food removed from persisted purchase rows");
  ok(pantryGrocery.list.totalWeeklySpendInr <= firstGrocery.list.totalWeeklySpendInr,
    "pantry subtraction does not increase purchase cost");
  report.stages.grocery = { beforePantryCost: firstGrocery.list.totalWeeklySpendInr,
    afterPantryCost: pantryGrocery.list.totalWeeklySpendInr,
    beforePurchaseRows: firstGrocery.rows.length, afterPurchaseRows: pantryGrocery.rows.length,
    providedFoodCount: pantryGrocery.list.providedByMess.length,
    pantryFoodCount: pantryGrocery.list.alreadyHave.length };
  report.stages.image = { fallbackRows: meals.filter(meal =>
    meal.image_url_snapshot?.startsWith("data:image/svg+xml;utf8,")).length,
    realAssetCoverageVerified: false };
  report.passed = true;
} catch (error) {
  failure = error;
  report.error = String(error?.stack || error);
} finally {
  const cleanupErrors = [];
  async function clean(label, operation) {
    try { await operation(); report.cleanup[label] = "ok"; }
    catch (error) { cleanupErrors.push(`${label}: ${error.message}`); report.cleanup[label] = String(error.message); }
  }
  if (profileChanged) {
    await clean("test_food_logs", async () => {
      const logs = await own("food_logs", "id");
      const ids = logs.map(row => row.id).filter(id => !baselineLogIds.has(id));
      if (ids.length) data(await db.from("food_logs").delete().eq("user_id", uid).in("id", ids), "remove test logs");
      ok((await own("food_logs", "id")).length === baseline.foodLogs.length, "baseline food log count restored");
    });
    await clean("test_plans", async () => {
      const plans = await own("meal_plans", "id");
      const ids = plans.map(row => row.id).filter(id => !baselinePlanIds.has(id));
      if (ids.length) {
        data(await db.from("meal_plan_items").delete().in("meal_plan_id", ids), "remove test items");
        data(await db.from("planned_meals").delete().eq("user_id", uid).in("meal_plan_id", ids), "remove test meals");
        data(await db.from("meal_plans").delete().eq("user_id", uid).in("id", ids), "remove test containers");
      }
      ok((await own("meal_plans", "id")).length === baseline.mealPlans.length, "baseline meal plan count restored");
      ok((await own("planned_meals", "id")).length === baseline.plannedMeals.length, "baseline planned meal count restored");
    });
    await clean("workout_and_grocery", async () => {
      for (const plan of baseline.workoutPlans) {
        data(await db.from("fitness_os_workout_plans").update({ plan_data: plan.plan_data })
          .eq("id", plan.id).eq("user_id", uid), "restore workout plan data");
      }
      const current = await own("fitness_grocery_items", "id");
      const currentIds = current.map(row => row.id);
      if (currentIds.length) data(await db.from("fitness_grocery_items").delete()
        .eq("user_id", uid).in("id", currentIds), "remove test groceries");
      if (baseline.groceryItems.length) data(await db.from("fitness_grocery_items")
        .insert(baseline.groceryItems), "restore original grocery rows");
      const after = await own("fitness_grocery_items");
      ok(sameValue(after.sort((a,b)=>a.id.localeCompare(b.id)),
        [...baseline.groceryItems].sort((a,b)=>a.id.localeCompare(b.id))), "original grocery rows exactly restored");
      const active = data(await db.from("fitness_os_workout_plans").select("id,plan_data")
        .eq("user_id", uid), "reload workout plan data");
      ok(active.every(row => sameValue(row.plan_data,
        baseline.workoutPlans.find(plan => plan.id === row.id)?.plan_data)), "original workout data restored");
    });
    await clean("nutrition_targets", async () => {
      const current = await own("nutrition_targets", "id");
      const newIds = current.map(row => row.id).filter(id => !baselineTargetIds.has(id));
      if (newIds.length) data(await db.from("nutrition_targets").delete()
        .eq("user_id", uid).in("id", newIds), "remove test targets");
      for (const target of baseline.targets) {
        data(await db.from("nutrition_targets").update({ calories: target.calories, protein: target.protein,
          carbs: target.carbs, fat: target.fat, water_ml: target.water_ml,
          effective_date: target.effective_date, updated_at: target.updated_at })
          .eq("id", target.id).eq("user_id", uid), "restore original target");
      }
      const after = await own("nutrition_targets");
      ok(sameValue(after.sort((a,b)=>a.id.localeCompare(b.id)),
        [...baseline.targets].sort((a,b)=>a.id.localeCompare(b.id))), "original target rows exactly restored");
    });
    await clean("profile", async () => {
      data(await db.from("fitness_os_profiles").update(restoreFields)
        .eq("user_id", uid), "restore designated profile fields");
      const restored = data(await db.from("fitness_os_profiles").select("*")
        .eq("user_id", uid).single(), "reload restored profile");
      const different = Object.entries(restoreFields)
        .filter(([key, value]) => !sameValue(restored[key], value)).map(([key]) => key);
      ok(different.length === 0, `restored profile fields differ: ${different.join(",")}`);
      const fullDifference = Object.keys(baseline.profile)
        .filter(key => !sameValue(restored[key], baseline.profile[key]));
      ok(fullDifference.length === 0, `full profile restoration differs: ${fullDifference.join(",")}`);
      report.profileRestored = true;
      report.cleanup.profileComparedFields = Object.keys(restoreFields).length;
      report.cleanup.profileMetadataUpdatedAtChanged = restored.updated_at !== baseline.profile.updated_at;
    });
  }
  if (cleanupErrors.length) {
    report.passed = false;
    report.cleanupErrors = cleanupErrors;
  }
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), { flag: "wx", mode: 0o600 });
  console.log(JSON.stringify({ passed: report.passed, profileRestored: report.profileRestored,
    stages: report.stages, cleanup: report.cleanup, error: failure?.message || null,
    cleanupErrors: report.cleanupErrors || [], reportFile }));
  if (failure || cleanupErrors.length) process.exitCode = 1;
}
