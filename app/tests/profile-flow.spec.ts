import { test, expect } from "@playwright/test";

test.describe("GrindLog Profile Flow Verification", () => {
  // ── 1. PRO TIER PROFILE OVERVIEW & BASELINE EDITING ──
  test("Pro tier user: displays avatar hero, pro badge, physical metrics, and opens edit baseline modal", async ({ page }) => {
    await page.goto("/test-profile?tier=pro");

    // Header & Navigation
    await expect(page.getByRole("heading", { name: "Your Profile", exact: true })).toBeVisible();
    await expect(page.getByText("Account", { exact: true })).toBeVisible();

    // User Avatar & Tier Badge
    await expect(page.getByText("Alex Hunter").first()).toBeVisible();
    await expect(page.getByText("alex.hunter@example.com")).toBeVisible();
    await expect(page.getByText(/PRO Member/i).first()).toBeVisible();

    // Saved Plan Card
    await expect(page.getByText("Your Saved AI Plan")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hypertrophy & Conditioning Phase 1" })).toBeVisible();

    // Open Edit Baseline Modal
    const editBtn = page.getByRole("button", { name: "Edit Name & Details" });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal verification
    await expect(page.getByRole("heading", { name: "Edit Physical Baseline" })).toBeVisible();

    // Form inputs prepopulated with current state
    const nameInput = page.getByPlaceholder("Enter your name");
    await expect(nameInput).toHaveValue("Alex Hunter");

    const weightInput = page.getByPlaceholder("e.g. 70");
    await expect(weightInput).toHaveValue("78.5");

    const heightInput = page.getByPlaceholder("e.g. 175");
    await expect(heightInput).toHaveValue("178");

    // Body measurements in modal
    const waistInput = page.getByPlaceholder("80");
    await expect(waistInput).toHaveValue("82");

    const chestInput = page.getByPlaceholder("95");
    await expect(chestInput).toHaveValue("98");

    const armInput = page.getByPlaceholder("35");
    await expect(armInput).toHaveValue("36");

    const thighInput = page.getByPlaceholder("55");
    await expect(thighInput).toHaveValue("58");

    // Verify Goal selector contains "Improve Fitness" option
    const goalSelect = page.locator("select").nth(1); // second select is Primary Goal
    await expect(goalSelect).toBeVisible();
    const improveFitnessOption = goalSelect.locator("option[value='Improve Fitness']");
    await expect(improveFitnessOption).toHaveText("Improve Fitness");

    // Close Modal via close X button in modal header
    const closeBtn = page.locator("button:has(svg.lucide-x)");
    await closeBtn.click();
    await expect(page.getByRole("heading", { name: "Edit Physical Baseline" })).not.toBeVisible();
  });

  // ── 2. CORE, FREE, AND EXPIRED TIER BADGING ──
  test("Core tier user: shows CORE MEMBER badge and restricted AI limits", async ({ page }) => {
    await page.goto("/test-profile?tier=core");

    await expect(page.getByText(/CORE Member/i).first()).toBeVisible();
    await expect(page.getByText("Alex Hunter").first()).toBeVisible();
    // Daily AI coaching quota
    await expect(page.getByText("AI Daily Generations")).toBeVisible();
    await expect(page.getByText(/8 \/ 20 remaining/i)).toBeVisible();
  });

  test("Free tier user: shows Free Account badge and upgrade prompt", async ({ page }) => {
    await page.goto("/test-profile?tier=free");

    await expect(page.getByText(/Free Account/i).first()).toBeVisible();
    // Upgrade link to payment
    const upgradeLink = page.getByRole("link", { name: /Upgrade Pro/i });
    await expect(upgradeLink).toBeVisible();
    await expect(upgradeLink).toHaveAttribute("href", "/payment");
  });

  test("Expired tier user: shows Free Account badge when subscription expires", async ({ page }) => {
    await page.goto("/test-profile?tier=expired");

    // When subscription is expired, safe isProfilePremiumActive evaluates to false
    await expect(page.getByText(/Free Account/i).first()).toBeVisible();
  });

  // ── 3. THEME TOGGLE (PRIMARY VS WHITE) ──
  test("Theme toggle: switches between Primary and White theme", async ({ page }) => {
    await page.goto("/test-profile?tier=pro");

    // Look for theme selector buttons
    const whiteThemeBtn = page.getByRole("button", { name: "White", exact: true });
    const primaryThemeBtn = page.getByRole("button", { name: "Primary", exact: true });

    await expect(whiteThemeBtn).toBeVisible();
    await expect(primaryThemeBtn).toBeVisible();

    // Click White Theme
    await whiteThemeBtn.click();
    const isThemeWhite = await page.evaluate(() => {
      return document.documentElement.classList.contains("theme-white");
    });
    expect(isThemeWhite).toBe(true);

    // Switch back to Primary Dark
    await primaryThemeBtn.click();
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });
    expect(isDark).toBe(true);
  });

  // ── 4. MY DETAILS PAGE FLOW & SAFETY ──
  test("My Details page: displays full baseline, equipment, days, limitations, and handles edge case non-arrays", async ({ page }) => {
    await page.goto("/test-details?scenario=standard");

    // Header & Title
    await expect(page.getByText("My Details", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Physical Baseline" })).toBeVisible();

    // Core Metrics
    await expect(page.getByText("78.5 kg")).toBeVisible();
    await expect(page.getByText("178 cm")).toBeVisible();
    await expect(page.getByText(/BMI 24.8 \(Optimal\)/i)).toBeVisible();

    // Body Measurements
    await expect(page.getByText("82cm")).toBeVisible(); // Waist
    await expect(page.getByText("98cm")).toBeVisible(); // Chest
    await expect(page.getByText("36cm")).toBeVisible(); // Arms
    await expect(page.getByText("58cm")).toBeVisible(); // Thighs

    // Equipment available tags
    await expect(page.getByText(/Dumbbells/i)).toBeVisible();
    await expect(page.getByText(/Barbell/i)).toBeVisible();

    // Workout Days tags
    await expect(page.getByText(/Monday/i)).toBeVisible();

    // Limitations & Injuries
    await expect(page.getByText(/Mild Lower Back Stiffness/i)).toBeVisible();
    await expect(page.getByText(/Left Knee Meniscus/i)).toBeVisible();
  });

  test("My Details page: edge case string/non-array data does not crash page", async ({ page }) => {
    await page.goto("/test-details?scenario=string_arrays");

    await expect(page.getByText("My Details", { exact: true })).toBeVisible();
    await expect(page.getByText("80 kg")).toBeVisible();
    await expect(page.getByText("Full Gym")).toBeVisible();
    await expect(page.getByText("Lower back strain")).toBeVisible();
  });

  test("My Details page: empty profile renders graceful fallbacks without NaN or crashes", async ({ page }) => {
    await page.goto("/test-details?scenario=empty");

    await expect(page.getByText("My Details", { exact: true })).toBeVisible();
    // Unset weight and height should display "--"
    const dashPlaceholders = page.getByText("--");
    await expect(dashPlaceholders.first()).toBeVisible();
    // Check that page does not contain NaN
    const pageContent = await page.content();
    expect(pageContent).not.toContain("NaN");
  });

  // ── 5. BILLING & SUBSCRIPTION FLOW ──
  test("Billing page - Free user: displays Choose Your Plan layout with Core (₹29) and Pro (₹99) options", async ({ page }) => {
    await page.goto("/test-billing?status=free");

    // Title & Header
    await expect(page.getByRole("heading", { name: "Billing & Membership" })).toBeVisible();
    await expect(page.getByText("Free Account")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free Athlete" })).toBeVisible();

    // Choose Your Plan Section
    await expect(page.getByRole("heading", { name: "Choose Your Plan" })).toBeVisible();

    // Action Buttons
    await expect(page.getByRole("button", { name: /Get Pro \(1 Month\) — ₹99\/mo 🚀/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Get Core \(1 Month\) for ₹29/i })).toBeVisible();
  });

  test("Billing page - Active Pro user: shows active subscription details, locked rate, and receipt history", async ({ page }) => {
    await page.goto("/test-billing?status=active_pro");

    await expect(page.getByRole("heading", { name: "Fitness OS Pro" })).toBeVisible();
    await expect(page.getByText("Active Membership")).toBeVisible();
    await expect(page.getByText(/20 Days Left/i)).toBeVisible();

    // Price lock guarantee pill
    await expect(page.getByText(/Lifetime Price Lock Active: Your ₹99\/mo rate is guaranteed/i)).toBeVisible();

    // Payment History receipts
    await expect(page.getByRole("heading", { name: "Payment & Receipt History" })).toBeVisible();
    await expect(page.getByText(/pay_test_pro_7/i)).toBeVisible();
    await expect(page.getByText("₹99").first()).toBeVisible();
    await expect(page.getByText(/captured/i).first()).toBeVisible();
  });

  test("Billing page - Grace Period: shows urgent grace warning with countdown", async ({ page }) => {
    await page.goto("/test-billing?status=grace_period");

    await expect(page.getByText(/Grace Period \(36h left\)/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /⚡ Renew Pro \(1 month\) — ₹99/i })).toBeVisible();
  });

  // ── 6. MOBILE RESPONSIVENESS & NO HORIZONTAL OVERFLOW ──
  test("Mobile responsive check: Profile, Details, and Billing pages fit within viewport without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Profile Page
    await page.goto("/test-profile?tier=pro");
    let isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Details Page
    await page.goto("/test-details?scenario=standard");
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);

    // Billing Page
    await page.goto("/test-billing?status=active_pro");
    isOverflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowing).toBe(false);
  });
});
