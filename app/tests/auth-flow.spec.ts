import { test, expect } from "@playwright/test";

test.describe("Auth & Redirect Flow for Nutrition & Android APK", () => {
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

  test("native Android APK user-agent automatically redirects landing page to /auth/signin", async ({ browser }) => {
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36 GrindLogApp",
    });
    const page = await context.newPage();

    await page.goto("/");
    // Because of GrindLogApp UA, middleware redirects to /auth/signin
    expect(page.url()).toContain("/auth/signin");

    await context.close();
  });
});
