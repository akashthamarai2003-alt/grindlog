import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import type { V2NutritionDay } from "../lib/services/nutrition/v2-ui-data";

const folder = path.resolve("artifacts/phase5b");
const personas: { key: string; days: V2NutritionDay[] }[] = JSON.parse(fs.readFileSync(path.join(folder, "persona-plans.json"), "utf8"));
const candidates: { slug: string; name: string; local_file: string; storage_path: string; recipe_version_id: string }[] =
  JSON.parse(fs.readFileSync(path.join(folder, "image-candidates.json"), "utf8"));
const briefs: { recipes: { slug: string; regular_ingredients: { food_id: string; name: string; amount: number; unit: string }[] }[] } =
  JSON.parse(fs.readFileSync(path.join(folder, "recipe-image-manifest.json"), "utf8"));
const variants: { recipe_version_id: string; variant_tier: string; target_calories: number; target_protein: number; target_carbs: number; target_fat: number }[] =
  JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_variants.json", "utf8"));

test.beforeEach(async ({ page }) => {
  await page.route("**/api/nutrition/water/history**", (route) => route.fulfill({
    json: { success: true, data: { waterByDate: {}, week: { days: [] }, month: { days: [] }, threeMonth: { days: [] } } },
  }));
  await page.route("**/images.grindlog.in/**", (route) => route.abort());
  // Serve the exact optimized bytes that the live audit independently hashes
  // against Storage/public URLs. UI tests do not depend on internet reliability.
  await page.route("**/storage/v1/object/public/food-photos/recipe-images/**", (route) => {
    const candidate = candidates.find((image) => route.request().url().endsWith(image.storage_path));
    return candidate ? route.fulfill({ contentType: "image/webp", body: fs.readFileSync(candidate.local_file) }) : route.abort();
  });
});

for (const persona of personas) {
  test(`${persona.key}: all seven planner-generated days have matching images or safe fallback`, async ({ page }, info) => {
    await page.route("**/api/nutrition/v2-day?*", (route) => {
      const selected = new URL(route.request().url()).searchParams.get("date");
      return route.fulfill({ json: { success: true, data: persona.days.find((day) => day.date === selected) } });
    });
    await page.goto("/test-nutrition-v2");
    await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
    await page.getByRole("button", { name: "Next week" }).click();
    for (const day of persona.days) {
      await page.getByRole("region", { name: "Choose plan day" }).getByRole("button", { name: new RegExp(day.date.slice(-2)) }).click();
      const images = page.locator("article img");
      await expect(images).toHaveCount(day.meals.length);
      for (let index = 0; index < day.meals.length; index++) {
        const image = images.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveAttribute("alt", day.meals[index].name);
        await expect(image).toHaveAttribute("src", day.meals[index].imageUrl);
        await expect.poll(() => image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
        const size = await image.boundingBox();
        expect(size).not.toBeNull();
        expect(Math.abs((size?.width || 0) - (size?.height || 0))).toBeLessThan(2);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (day === persona.days[0]) {
        await page.screenshot({ path: path.join(folder, `${persona.key}-${info.project.name.includes("Mobile") ? "mobile" : "desktop"}.png`), fullPage: true });
      }
    }
  });
}

test("reviewed photos survive logging; swap changes image; a failed photo uses fallback", async ({ page }, info) => {
  const reference = structuredClone(personas[0].days[0]);
  const photo = (index: number) => `https://image-fixture.invalid/storage/v1/object/public/food-photos/${candidates[index].storage_path}`;
  const gallery = candidates.map((candidate, index) => {
    const brief = briefs.recipes.find((entry) => entry.slug === candidate.slug);
    const variant = variants.find((entry) => entry.recipe_version_id === candidate.recipe_version_id && entry.variant_tier === "REGULAR");
    if (!brief || !variant) throw new Error("Missing authoritative recipe fixture");
    return { ...reference.meals[0],
      id: `image-${index}`, slot: index === 0 ? "breakfast" : index === 1 ? "lunch" : "dinner",
      sequence: index, name: candidate.name, imageUrl: photo(index), status: "PLANNED" as const, logs: [],
      calories: variant.target_calories, protein: variant.target_protein, carbs: variant.target_carbs, fat: variant.target_fat,
      ingredients: brief.regular_ingredients.map((food) => ({ id: food.food_id, name: food.name,
        quantity: `${food.amount} ${food.unit}`, isProvided: false })),
    };
  });
  reference.meals = gallery;
  await page.route("**/api/nutrition/v2-day?*", (route) => route.fulfill({ json: { success: true, data: reference } }));
  await page.route("**/api/nutrition/log-planned-meal", (route) => {
    reference.meals[0].status = "LOGGED";
    return route.fulfill({ json: { success: true, engine: "v2" } });
  });
  await page.route("**/api/nutrition/swap-meal?*", (route) => route.fulfill({ json: { success: true, engine: "v2", data: {
    options: [{ id: "swap-image", name: candidates[3].name, image_url: photo(3), calories: gallery[3].calories,
      protein: gallery[3].protein, estimated_cost: gallery[3].cost, prep_time_min: 15, items: gallery[3].ingredients }],
  } } }));
  await page.route("**/api/nutrition/swap-meal", (route) => {
    reference.meals[1] = { ...gallery[3], id: reference.meals[1].id, slot: "lunch", sequence: 1 };
    return route.fulfill({ json: { success: true, engine: "v2" } });
  });
  await page.goto("/test-nutrition-v2");
  await expect(page.locator('[data-v2-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Next week" }).click();
  await expect(page.locator("article img")).toHaveCount(candidates.length);
  for (let index = 0; index < candidates.length; index++) {
    const image = page.locator("article img").nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("alt", candidates[index].name);
    await expect.poll(() => image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth === 1024)).toBe(true);
  }
  await page.screenshot({ path: path.join(folder, `reviewed-photos-${info.project.name.includes("Mobile") ? "mobile" : "desktop"}.png`), fullPage: true });
  await page.getByRole("article").first().getByRole("button", { name: "Log Meal" }).click();
  await expect(page.getByRole("article").first().getByText("LOGGED", { exact: true })).toBeVisible();
  await expect(page.locator("article img").first()).toHaveAttribute("src", photo(0));
  await page.getByRole("article").nth(1).getByRole("button", { name: "Swap" }).click();
  await page.getByRole("button", { name: "Choose meal" }).click();
  await expect(page.locator("article img").nth(1)).toHaveAttribute("src", photo(3));
  await expect(page.locator("article img").first()).toHaveAttribute("src", photo(0));
  // Fetch another day to exercise a distinct failed delivery after a valid photo.
  reference.date = "2026-10-06";
  reference.meals[1].imageUrl = "https://images.grindlog.in/now-missing.webp";
  await page.getByRole("region", { name: "Choose plan day" }).getByRole("button", { name: /Tue.*06/ }).click();
  const failedImage = page.locator("article img").nth(1);
  await failedImage.scrollIntoViewIfNeeded();
  await expect(failedImage).toHaveAttribute("src", /^data:image\/svg\+xml/);
  await expect.poll(() => failedImage.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0)).toBe(true);
});
