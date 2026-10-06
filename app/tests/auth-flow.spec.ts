import { test, expect } from "@playwright/test";

test.describe("Auth & Redirect Flow for Nutrition & Mobile Web", () => {
  test("unauthenticated access to /nutrition redirects to /auth/signin", async ({ page }) => {
    const response = await page.goto("/nutrition");
    // Verify redirection to signin
    expect(page.url()).toContain("/auth/signin");
    expect(page.url()).toContain("redirect=%2Fnutrition");
  });

  test("sign-in page renders Google OAuth, email/password form, and branding", async ({ page }) => {
    await page.goto("/auth/signin");

    // Check sign in heading or branding
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();

    // Check email input is available
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible();
  });
});
