import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const date = "2026-10-04";
const baseMeal = {
  sequence: 1, scheduledTime: "13:00:00", status: "PLANNED", sourceType: "RECIPE",
  description: null, whyThisMeal: null, prepInstructions: "Serve warm.", prepTimeMin: 15,
  imageUrl: "", calories: 744, protein: 39, carbs: 96, fat: 19, cost: 135,
  ingredients: [{ id: "i", name: "Paneer", quantity: "100 g", isProvided: false }], logs: [],
};
function day(meals: Array<Record<string, unknown>>, logs: Array<Record<string, unknown>> = []) {
  return { date, today: date, timezone: "Asia/Kolkata", planId: "fixture-plan",
    consumed: { calories: logs.reduce((sum, log) => sum + Number(log.calories), 0),
      protein: logs.reduce((sum, log) => sum + Number(log.protein), 0),
      carbs: logs.reduce((sum, log) => sum + Number(log.carbs), 0),
      fat: logs.reduce((sum, log) => sum + Number(log.fat), 0), water_ml: 1250 },
    targets: { calories: 2105, protein: 104, carbs: 253, fat: 75, water_ml: 2500 },
    meals, logs };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/images.grindlog.in/**", (route) => route.abort());
  await page.route("**/api/nutrition/water/history**", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: { waterByDate: {}, week: { days: [] }, month: { days: [] }, threeMonth: { days: [] } } }),
  }));
});

test("renders V2 macros, timeline states, details, fallback images, and responsive layout", async ({ page }, testInfo) => {
  await page.goto("/test-nutrition-v2");
  await expect(page.getByRole("heading", { name: "Your Nutrition" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Nutrition dashboard" }).getByText("Meals logged")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(page.getByRole("article").nth(0).getByText("LOGGED", { exact: true })).toBeVisible();
  await expect(page.getByRole("article").nth(1).getByText("NEXT", { exact: true })).toBeVisible();
  await expect(page.getByRole("article").nth(2).getByText("UPCOMING", { exact: true })).toBeVisible();
  await page.getByRole("article").nth(1).getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("article").nth(1).getByText("180 g")).toBeVisible();
  await expect(page.getByRole("article").nth(1).getByText("₹135")).toBeVisible();
  await expect.poll(() => page.locator("article img").evaluateAll((images) => images.every((image) =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  const layout = await page.evaluate(() => {
    const dashboard = document.querySelector<HTMLElement>('[aria-label="Nutrition dashboard"]');
    const metrics = [...(dashboard?.querySelectorAll<HTMLElement>(".grid > div") || [])];
    const water = [...document.querySelectorAll<HTMLElement>('[class="grid gap-4"] > div')].slice(-2);
    return {
      dashboardWidth: dashboard?.getBoundingClientRect().width || 0,
      metricWidths: metrics.map((item) => item.getBoundingClientRect().width),
      waterWidths: water.map((item) => item.getBoundingClientRect().width),
    };
  });
  expect(layout.dashboardWidth).toBeGreaterThan(290);
  expect(Math.min(...layout.metricWidths)).toBeGreaterThan(110);
  expect(layout.waterWidths.every((width) => width > 290)).toBe(true);
  const directory = path.join(process.cwd(), "artifacts", "phase5a");
  fs.mkdirSync(directory, { recursive: true });
  const name = testInfo.project.name.includes("Mobile") ? "mobile" : "desktop";
  await page.screenshot({ path: path.join(directory, `${name}.png`), fullPage: true });
});

test("switching days loads that date's persisted V2 response", async ({ page }) => {
  await page.route("**/api/nutrition/v2-day?date=2026-10-05", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: { ...day([{ ...baseMeal, id: "monday", slot: "lunch", name: "Monday Dal Plate", status: "SKIPPED" }]), date: "2026-10-05" } }),
  }));
  await page.goto("/test-nutrition-v2");
  await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Next week" }).click();
  await page.getByRole("region", { name: "Choose plan day" }).getByRole("button", { name: /Mon.*05/ }).click();
  await expect(page.getByRole("heading", { name: "Monday Dal Plate" })).toBeVisible();
  await expect(page.getByRole("article").getByText("SKIPPED", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Mon.*05/ }).last()).toHaveAttribute("aria-pressed", "true");
});

test("a day switch replaces a missing prior meal image with the new meal or fallback", async ({ page }) => {
  await page.route("**/api/nutrition/v2-day?date=2026-10-05", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: { ...day([{
      ...baseMeal, id: "monday-image", slot: "lunch", name: "Monday Rajma Bowl",
      imageUrl: "https://images.grindlog.in/monday-rajma.webp",
    }]), date: "2026-10-05" } }),
  }));
  await page.goto("/test-nutrition-v2");
  await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Next week" }).click();
  await page.getByRole("region", { name: "Choose plan day" }).getByRole("button", { name: /Mon.*05/ }).click();
  await expect(page.getByRole("heading", { name: "Monday Rajma Bowl" })).toBeVisible();
  const image = page.getByRole("article").locator("img").first();
  await expect(image).not.toHaveAttribute("src", /missing-lunch\.jpg/);
  await expect.poll(() => image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
});

test("client controls hydrate again after a fresh navigation", async ({ page }) => {
  await page.goto("/test-nutrition-v2");
  await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
  await page.getByRole("article").nth(1).getByRole("button", { name: "Swap" }).click();
  await expect(page.getByRole("dialog", { name: "Swap Lunch" })).toBeVisible();
});

test("swap modal shows V2 options and saves through the existing swap API", async ({ page }) => {
  let submittedSlot = "";
  await page.route("**/api/nutrition/swap-meal?*", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, engine: "v2", data: { options: [1, 2, 3].map((index) => ({
      id: `recipe-${index}`, name: `Recipe Alternative ${index}`, calories: 700 + index,
      protein: 38, estimated_cost: 120, prep_time_min: 12, image_url: "",
      items: [{ name: "Paneer" }],
    })) } }),
  }));
  await page.route("**/api/nutrition/swap-meal", async (route) => {
    submittedSlot = JSON.parse(route.request().postData() || "{}").meal_type;
    await route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ success: true, engine: "v2" }) });
  });
  await page.route("**/api/nutrition/v2-day?date=2026-10-04", (route) => route.fulfill({
    status: 200, contentType: "application/json",
    body: JSON.stringify({ success: true, data: day([{ ...baseMeal, id: "lunch", slot: "lunch", name: "Recipe Alternative 1" }]) }),
  }));
  await page.goto("/test-nutrition-v2");
  await page.getByRole("article").nth(1).getByRole("button", { name: "Swap" }).click();
  const dialog = page.getByRole("dialog", { name: "Swap Lunch" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("12 min prep")).toHaveCount(3);
  await expect(dialog.getByText("₹120")).toHaveCount(3);
  await dialog.getByRole("button", { name: "Choose meal" }).first().click();
  await expect(page.getByRole("heading", { name: "Recipe Alternative 1" })).toBeVisible();
  expect(submittedSlot).toBe("lunch");
});

test("planned logging and different actual food remain distinct", async ({ page }) => {
  let plannedLogged = false;
  let manualLogged = false;
  let manualPayload: Record<string, unknown> = {};
  const plannedLog = { id: "planned-log", mealSlot: "lunch", plannedMealId: "lunch", name: "Dal Bowl",
    serving: "1 serving", calories: 744, protein: 39, carbs: 96, fat: 19, loggedAt: "2026-10-04T07:30:00Z" };
  const manualLog = { id: "manual-log", mealSlot: "dinner", plannedMealId: null, name: "Curd",
    serving: "1 bowl", calories: 195, protein: 10, carbs: 14, fat: 9, loggedAt: "2026-10-04T13:30:00Z" };
  await page.route("**/api/nutrition/log-planned-meal", async (route) => {
    plannedLogged = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, engine: "v2", data: {} }) });
  });
  await page.route("**/api/nutrition/foods*", (route) => route.fulfill({ status: 200,
    contentType: "application/json", body: JSON.stringify({ success: true, data: [{
      id: "11111111-1111-4111-8111-111111111111", name: "Curd", category: "Dairy",
      serving_size: "1 bowl", calories: 195, protein: 10, carbs: 14, fat: 9,
      estimated_cost: 20, source: "verified",
    }] }) }));
  await page.route("**/api/nutrition/log-food", async (route) => {
    manualPayload = JSON.parse(route.request().postData() || "{}");
    manualLogged = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { id: "manual-log" } }) });
  });
  await page.route("**/api/nutrition/v2-day?date=2026-10-04", (route) => {
    const logs = [plannedLogged ? plannedLog : null, manualLogged ? manualLog : null]
      .filter((log): log is typeof plannedLog | typeof manualLog => log !== null);
    const meals = [
      { ...baseMeal, id: "lunch", slot: "lunch", name: "Dal Bowl", status: plannedLogged ? "LOGGED" : "PLANNED", logs: plannedLogged ? [plannedLog] : [] },
      { ...baseMeal, id: "dinner", slot: "dinner", sequence: 2, name: "Mess Dinner", status: "PLANNED", logs: manualLogged ? [manualLog] : [] },
    ];
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: day(meals, logs) }) });
  });
  await page.goto("/test-nutrition-v2");
  await page.getByRole("article").nth(1).getByRole("button", { name: "Log Meal" }).click();
  await expect(page.getByRole("heading", { name: "Dal Bowl" })).toBeVisible();
  await expect(page.getByRole("article").first().getByText("LOGGED", { exact: true })).toBeVisible();
  expect(plannedLogged).toBe(true);
  await page.getByRole("article").nth(1).getByRole("button", { name: "View details" }).click();
  await page.getByRole("article").nth(1).getByRole("button", { name: "I ate different food" }).click();
  await expect(page.getByRole("heading", { name: "Search Food" })).toBeVisible();
  await page.getByRole("button", { name: /Curd.*195/i }).first().click();
  await page.getByRole("button", { name: "Log Food" }).click();
  await expect(page.getByRole("article").nth(1).getByText("Different food logged")).toBeVisible();
  expect(manualPayload.meal_type).toBe("dinner");
  expect(manualPayload).not.toHaveProperty("planned_meal_id");
});
