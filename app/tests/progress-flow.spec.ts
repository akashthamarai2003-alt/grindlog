import { test, expect } from "@playwright/test";

test.describe("GrindLog Progress Flow Verification", () => {
  // ── 1. ACCESS GATING FOR FREE PREVIEW USERS ──
  test("Free tier user is gated with PaidAccessGate on progress flow", async ({ page }) => {
    await page.goto("/test-progress?view=free");

    // Must show Active Plan Required header and messaging
    await expect(page.getByText("Active Plan Required")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unlock progress tracking" })).toBeVisible();
    await expect(
      page.getByText(/You are currently exploring GrindLog in Free Preview Mode/i)
    ).toBeVisible();

    // CTA links
    const unlockBtn = page.getByRole("link", { name: /View Plans & Unlock/i });
    await expect(unlockBtn).toBeVisible();
    await expect(unlockBtn).toHaveAttribute("href", "/payment?returnTo=/&intent=upgrade_plan");

    const backBtn = page.getByRole("link", { name: /Back to dashboard/i });
    await expect(backBtn).toBeVisible();
  });

  // ── 2. CORE TIER EXPERIENCE ──
  test("Core tier user: sees Pro upgrade banner, can track weight & consistency, while AI features show Pro gate", async ({ page }) => {
    await page.goto("/test-progress?view=core");

    // Pro feature preview banner
    await expect(page.getByText("Pro Feature Preview")).toBeVisible();
    await expect(
      page.getByText(/Core tracks your workout completion and weight trends/i)
    ).toBeVisible();
    const unlockProLink = page.getByRole("link", { name: /Unlock Pro ⚡/i });
    await expect(unlockProLink).toBeVisible();
    await expect(unlockProLink).toHaveAttribute("href", "/payment?returnTo=/progress&intent=upgrade_pro");

    // Core user is entitled to log weight
    const logWeightBtn = page.locator("a[href='/progress/log-weight']").first();
    await logWeightBtn.scrollIntoViewIfNeeded();
    await expect(logWeightBtn).toBeVisible();

    // Consistency overview is visible to Core users
    await expect(page.getByText("Consistency Overview")).toBeVisible();
    await expect(page.getByText("Score: 85")).toBeVisible();

    // Pro locked feature: clicking locked Body Measurements triggers ProUpgradeModal
    const measurementsProBtn = page.getByRole("button", { name: /Add \+ PRO/i });
    await measurementsProBtn.scrollIntoViewIfNeeded();
    await expect(measurementsProBtn).toBeVisible();
    await measurementsProBtn.click();
    const proDialog = page.getByRole("dialog");
    await expect(proDialog).toBeVisible();
    await expect(proDialog.getByText("Upgrade to Pro")).toBeVisible();
    // Close modal
    await proDialog.getByRole("button", { name: "Close" }).click();
    await expect(proDialog).not.toBeVisible();
  });

  // ── 3. PRO TIER FULL DASHBOARD ──
  test("Pro tier user: full progress dashboard renders all analytics cards, metrics, and interactive elements", async ({ page }) => {
    await page.goto("/test-progress?view=pro");

    // Header & streak
    await expect(page.getByRole("heading", { name: "Your Progress" })).toBeVisible();
    await expect(page.getByText("Day 28 of your transformation")).toBeVisible();
    await expect(page.getByText("12 Day Streak")).toBeVisible();

    // Period selector tabs (scoped to the period pill container)
    const periodContainer = page.locator(".snap-x");
    const period7D = periodContainer.getByRole("button", { name: "7D", exact: true });
    const period30D = periodContainer.getByRole("button", { name: "30D", exact: true });
    const period3M = periodContainer.getByRole("button", { name: "3M", exact: true });
    await expect(period7D).toBeVisible();
    await expect(period30D).toBeVisible();
    await expect(period3M).toBeVisible();

    // Transformation Overview
    await expect(page.getByText("Transformation Overview")).toBeVisible();
    await expect(page.getByText("75kg", { exact: true })).toBeVisible(); // Start
    await expect(page.getByText("72.4kg", { exact: true })).toBeVisible(); // Current
    await expect(page.getByText("68kg", { exact: true })).toBeVisible(); // Target
    await expect(page.getByText("2.6 kg Changed")).toBeVisible();
    await expect(page.getByText("4.4 kg Left")).toBeVisible();

    // Consistency Overview 6 Rings
    await expect(page.getByText("Consistency Overview")).toBeVisible();
    const consistencyGrid = page.locator(".grid-cols-3");
    await expect(consistencyGrid.getByText("Workout", { exact: true })).toBeVisible();
    await expect(consistencyGrid.getByText("86%", { exact: true })).toBeVisible();
    await expect(consistencyGrid.getByText("Diet", { exact: true })).toBeVisible();
    await expect(consistencyGrid.getByText("90%", { exact: true })).toBeVisible();
    await expect(consistencyGrid.getByText("Protein", { exact: true })).toBeVisible();
    await expect(consistencyGrid.getByText("95%", { exact: true })).toBeVisible();

    // Weight Chart stats & toggles
    await expect(page.getByText("Weight History")).toBeVisible();
    await expect(page.locator("span.text-lg:has-text('72.4')")).toBeVisible();
    await expect(page.getByText("-2.6 kg")).toBeVisible();

    const dailyBtn = page.getByRole("button", { name: "Daily", exact: true });
    const weeklyBtn = page.getByRole("button", { name: "Weekly", exact: true });
    await expect(dailyBtn).toBeVisible();
    await expect(weeklyBtn).toBeVisible();

    // Toggle between Daily and Weekly views
    await weeklyBtn.click();
    await expect(weeklyBtn).toHaveClass(/bg-\[#ADFF00\]/);
    await dailyBtn.click();
    await expect(dailyBtn).toHaveClass(/bg-\[#ADFF00\]/);

    // Goal Target Toggle
    const goalToggleBtn = page.getByRole("button", { name: /Goal 68kg/i });
    await expect(goalToggleBtn).toBeVisible();
    await goalToggleBtn.click();

    // Body Measurements
    await expect(page.getByText("Body Measurements")).toBeVisible();
    await expect(page.getByText("Waist")).toBeVisible();
    await expect(page.getByText("-4 cm")).toBeVisible();
    await expect(page.getByText("Chest")).toBeVisible();
    await expect(page.getByText("+2 cm")).toBeVisible();

    // Body Photos
    await expect(page.getByText("Body Progress")).toBeVisible();

    // Workout Analytics Card
    await expect(page.getByText("Workout Analytics")).toBeVisible();
    await expect(page.getByText("18 / 20 Completed")).toBeVisible();
    await expect(page.getByText("12,450").first()).toBeVisible();

    // Nutrition Analytics Card
    await expect(page.getByText("Nutrition Analytics")).toBeVisible();
    await expect(page.getByText("2,180").first()).toBeVisible();
    await expect(page.getByText(/Today's Macronutrient Breakdown/i)).toBeVisible();

    // Activity & Recovery Analytics
    await expect(page.getByText("Activity & Recovery")).toBeVisible();
    await expect(page.getByText("8,420").first()).toBeVisible();
    await expect(page.getByText("7.5").first()).toBeVisible();

    // AI Progress Review Card
    await expect(page.getByText("AI Progress Review")).toBeVisible();
    await expect(
      page.getByText(/Outstanding 4-week cutting phase/i)
    ).toBeVisible();
    await expect(page.getByText("Groq AI Active")).toBeVisible();
    await expect(page.getByText("GrindLog Coach AI")).toBeVisible();

    // Achievements Showcase
    await expect(page.getByText("Achievements")).toBeVisible();
    await expect(page.getByText("Iron Warrior")).toBeVisible();
    await expect(page.getByText("Century Club")).toBeVisible();
    await expect(page.getByText("Marathon Walker")).toBeVisible();
    await expect(page.getByText("38500/50000")).toBeVisible();
  });

  // ── 4. BULKING GOAL AESTHETICS ──
  test("Bulking goal: weight gain (+3.0 kg) is styled as positive emerald (#ADFF00), not warning amber", async ({ page }) => {
    await page.goto("/test-progress?view=bulking");

    // Transformation numbers: 68kg -> 71kg -> 75kg
    await expect(page.getByText("68kg", { exact: true })).toBeVisible();
    await expect(page.getByText("71kg", { exact: true })).toBeVisible();
    await expect(page.getByText("75kg", { exact: true })).toBeVisible();
    await expect(page.getByText("3 kg Changed")).toBeVisible();
    await expect(page.getByText("4 kg Left")).toBeVisible();

    // In WeightChart, +3 kg must be displayed with positive emerald color
    const deltaBadge = page.locator("span", { hasText: "+3 kg" });
    await expect(deltaBadge).toBeVisible();
    await expect(deltaBadge).toHaveClass(/text-\[#ADFF00\]/);
  });

  // ── 5. EMPTY STATE ROBUSTNESS ──
  test("Empty state: user with 0 logged data renders clean placeholders without crashes or NaN", async ({ page }) => {
    await page.goto("/test-progress?view=empty");

    // Transformation overview shows no weight goal set
    await expect(page.getByText("No weight goal set")).toBeVisible();

    // Consistency score is 0 with 0% rings, no NaN errors
    await expect(page.getByText("Score: 0")).toBeVisible();

    // Weight chart renders clean empty state with log CTA
    await expect(page.getByText("No weight history yet")).toBeVisible();
    const logWeightBtn = page.getByRole("link", { name: "Log Weight" });
    await expect(logWeightBtn).toBeVisible();
    await expect(logWeightBtn).toHaveAttribute("href", "/progress/log-weight");

    // Body measurements clean empty state
    await expect(page.getByText("No measurements yet")).toBeVisible();
  });

  // ── 6. ACTIVITY & SLEEP LOGGING MODAL FLOW ──
  test("Activity & recovery modal opens, switches tabs, and validates form inputs", async ({ page }) => {
    await page.goto("/test-progress?view=pro");

    // Open logging modal
    const logTodayBtn = page.getByRole("button", { name: /Log Today/i }).first();
    await logTodayBtn.scrollIntoViewIfNeeded();
    await expect(logTodayBtn).toBeVisible();
    await logTodayBtn.click();

    // Modal should be open
    await expect(page.getByText("Log Activity & Recovery")).toBeVisible();
    await expect(page.getByRole("button", { name: /Daily Steps/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sleep & Recovery/i })).toBeVisible();

    // Switch to Sleep tab
    const sleepTabBtn = page.getByRole("button", { name: /Sleep & Recovery/i });
    await sleepTabBtn.click();
    await expect(page.getByText("Sleep Duration", { exact: true })).toBeVisible();
    await expect(page.getByText("Sleep Quality", { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. 7.5")).toBeVisible();

    // Switch back to Steps tab
    const stepsTabBtn = page.getByRole("button", { name: /Daily Steps/i });
    await stepsTabBtn.click();
    await expect(page.getByPlaceholder("e.g. 7500")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("div.bg-\\[\\#0D140C\\] button").first();
    await closeBtn.click();
    await expect(page.getByText("Log Activity & Recovery")).not.toBeVisible();
  });

  // ── 7. MOBILE VIEWPORT RESPONSIVENESS ──
  test("Mobile viewport (390x844): layout fits without horizontal page scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/test-progress?view=pro");

    // Check header and transformation card are visible
    await expect(page.getByRole("heading", { name: "Your Progress" })).toBeVisible();
    await expect(page.getByText("Transformation Overview")).toBeVisible();

    // Period pill selector should be fitting smoothly
    const periodPills = page.locator(".snap-x button:has-text('30D')");
    await expect(periodPills).toBeVisible();

    // Verify document does not horizontally overflow viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5);
  });
});
