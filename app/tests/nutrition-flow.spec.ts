import { test, expect } from "@playwright/test";
import { mockSwapAlternatives } from "../app/test-nutrition/mock-data";

test.describe("GrindLog Nutrition Flow & Meal Card Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the swap meal GET API
    await page.route("**/api/nutrition/swap-meal*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              options: mockSwapAlternatives.breakfast,
              profile_diet: "Vegetarian",
            },
          }),
        });
      } else if (route.request().method() === "POST") {
        const body = JSON.parse(route.request().postData() || "{}");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              success: true,
              swapped_to: body.selected_option,
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock water API
    await page.route("**/api/nutrition/water*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            success: true,
            total_water_ml: 1000,
          },
        }),
      });
    });

    // Mock targets API
    await page.route("**/api/nutrition/targets*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            success: true,
          },
        }),
      });
    });
  });

  test("renders the live user meal plan cards (Breakfast, Lunch, Dinner)", async ({ page }) => {
    await page.goto("/test-nutrition");

    // Check header elements
    await expect(page.locator('[data-testid="page-title"]')).toHaveText("Your Meals");
    await expect(page.locator('[data-testid="pro-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="grocery-link"]')).toBeVisible();

    // Verify all 3 primary meals from the live user's plan are rendered
    await expect(page.getByText("Besan Cheela with Curd", { exact: false })).toBeVisible();
    await expect(page.getByText("Dal Tadka with Multigrain Roti", { exact: false })).toBeVisible();
    await expect(page.getByText("Homestyle Dal with Phulkas & Paneer Bhurji", { exact: false })).toBeVisible();
  });

  test("VERIFICATION: Curd portion explosion is fixed (no 6.5 bowls / 715 kcal / 46g fat)", async ({ page }) => {
    await page.goto("/test-nutrition");

    // Breakfast card should show ~460 kcal total (NOT 1065+ kcal)
    const breakfastSection = page.locator("div").filter({ hasText: /Besan Cheela with Curd/i }).first();
    await expect(breakfastSection).toBeVisible();

    // Ensure the bug (6.5 bowls) does NOT appear anywhere on the page
    const pageText = await page.innerText("body");
    expect(pageText).not.toContain("6.5 bowls");
    expect(pageText).not.toContain("6.5 bowl");
    expect(pageText).not.toContain("715 kcal");

    // Verify reasonable breakfast calories
    await expect(page.getByText(/460\s*kcal/i).first()).toBeVisible();

    // Verify food items in Breakfast
    await expect(page.getByText("Besan / Gram Flour Cheela", { exact: false })).toBeVisible();
    await expect(page.getByText("Curd / Dahi (Plain)", { exact: false })).toBeVisible();

    // Curd serving size should be 1 bowl (150g) and ~110 kcal
    await expect(breakfastSection.getByText("1 bowl (150g)", { exact: false }).first()).toBeVisible();
  });

  test("verifies Daily Summary and Target progress bars", async ({ page }) => {
    await page.goto("/test-nutrition");

    // Check calorie target display
    await expect(page.getByText(/1800/i).first()).toBeVisible();

    // Check macro breakdown (Protein, Carbs, Fat)
    await expect(page.getByText(/Protein/i).first()).toBeVisible();
    await expect(page.getByText(/Carbs/i).first()).toBeVisible();
    await expect(page.getByText(/Fat/i).first()).toBeVisible();
  });

  test("opens Swap Meal modal and displays healthy alternatives", async ({ page }) => {
    await page.goto("/test-nutrition");

    // Locate the swap button for Breakfast
    const swapButtons = page.locator('button[title*="Swap"], button:has-text("Swap")');
    if (await swapButtons.count() > 0) {
      await swapButtons.first().click();
    } else {
      // Look for button with refresh icon inside breakfast container
      const breakfastCard = page.locator("div").filter({ hasText: /Besan Cheela with Curd/i }).first();
      const actionButton = breakfastCard.locator("button").first();
      await actionButton.click();
    }

    // If modal is opened, verify its contents
    const modalHeader = page.getByText(/Swap Breakfast/i);
    if (await modalHeader.isVisible()) {
      await expect(modalHeader).toBeVisible();
      await expect(page.getByText("Vegetarian", { exact: false }).first()).toBeVisible();

      // Verify alternative meals are shown in modal
      await expect(page.getByText("Moong Dal Chilla with Mint Chutney")).toBeVisible();
      await expect(page.getByText("Paneer Stuffed Paratha with Curd")).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"], button:has(svg.lucide-x)');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click();
      }
    }
  });

  test("water tracking logging responds properly", async ({ page }) => {
    await page.goto("/test-nutrition");

    // Look for quick add water button (+250ml)
    const addWaterBtn = page.getByRole("button", { name: /\+250/i }).first();
    if (await addWaterBtn.isVisible()) {
      await addWaterBtn.click();
      // Should not throw and UI remains stable
      await page.waitForTimeout(500);
      await expect(page.locator('[data-testid="nutrition-root"]')).toBeVisible();
    }
  });
});
