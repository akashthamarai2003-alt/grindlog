import { test, expect } from "@playwright/test";

test.describe("GrindLog Report & Plan Setup Flow Verification", () => {

  // ── 1. REPORT PAGE: CORE STATS & HEADLINES ──
  test("Report: Displays AI Starting Report headline, weight, target, and physique stats", async ({ page }) => {
    await page.goto("/test-report?subscribed=1");

    await expect(page.getByText("AI STARTING REPORT")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your Starting Point" })).toBeVisible();

    // Verify stats cards
    await expect(page.getByRole("paragraph").filter({ hasText: /^76\.5 kg$/ })).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: /^80 kg$/ })).toBeVisible();
    await expect(page.getByText("Build Muscle")).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: /^Muscular$/ })).toBeVisible();
  });

  // ── THE REAL-WORLD SCIENTIFIC TIMEFRAME ──
  test("Report: Displays The Real-World Scientific Timeframe card with mesocycles and milestones", async ({ page }) => {
    await page.goto("/test-report?subscribed=1");

    await expect(page.getByText("The Real-World Scientific Timeframe")).toBeVisible();
    await expect(page.getByText(/Safe lean hypertrophy rate/i)).toBeVisible();
    await expect(page.getByText("Why GrindLog structures your plan in 3-Month Mesocycles")).toBeVisible();
    await expect(page.getByText("MONTH 1", { exact: true })).toBeVisible();
    await expect(page.getByText("MONTH 2", { exact: true })).toBeVisible();
    await expect(page.getByText("MONTH 3", { exact: true })).toBeVisible();
    await expect(page.getByText("Phase 1 End")).toBeVisible();
  });

  // ── BODY SCAN PHOTO INSIGHTS ──
  test("Report: Displays Body Scan Insights card with visible observations, strengths, and priorities", async ({ page }) => {
    await page.goto("/test-report?subscribed=1");

    await expect(page.getByText("Your body scan insights")).toBeVisible();
    await expect(page.getByText("What the uploaded photos show")).toBeVisible();
    await expect(page.getByText("What I notice")).toBeVisible();
    await expect(page.getByText(/Visual physique assessment confirms your starting athletic foundation/i)).toBeVisible();
    await expect(page.getByText("Your first priorities")).toBeVisible();
    await expect(page.getByText("Posture & alignment observation")).toBeVisible();
    await expect(page.getByText("Goal direction & gap")).toBeVisible();
  });

  // ── 2. REPORT PAGE: PERSONAL TARGETS & FITNESS SCORE ──
  test("Report: Displays personal numbers, settings, reality check, and fitness score", async ({ page }) => {
    await page.goto("/test-report?subscribed=1");

    // Settings chips
    await expect(page.getByText("Gym")).toBeVisible();
    await expect(page.getByText("4 Days/Week")).toBeVisible();
    await expect(page.getByText("60 Mins")).toBeVisible();
    await expect(page.getByText("Non-Vegetarian")).toBeVisible();

    // Personal numbers
    await expect(page.getByText("Protein starting target")).toBeVisible();
    await expect(page.getByText("160 g/day")).toBeVisible();
    await expect(page.getByText("2450 kcal/day")).toBeVisible();

    // Reality check
    await expect(page.getByText("Timeframe & Reality Check")).toBeVisible();
    await expect(page.getByText("Realistic", { exact: true })).toBeVisible();

    // Fitness Score
    await expect(page.getByText("82")).toBeVisible();
    await expect(page.getByText("/ 100")).toBeVisible();
  });

  // ── 3. REPORT PAGE: SAFETY PROTOCOL STATES ──
  test("Report: Renders safety protocol for all-clear and active-restrictions", async ({ page }) => {
    // All clear state
    await page.goto("/test-report?safety=0");
    await expect(page.getByText("Safety Protocol")).toBeVisible();
    await expect(page.getByText("All Clear")).toBeVisible();
    await expect(page.getByText(/cleared for standard programming/i)).toBeVisible();

    // Active restrictions state
    await page.goto("/test-report?safety=1");
    await expect(page.getByText("Active Restrictions")).toBeVisible();
    await expect(page.getByText(/Lower back strain reported/i)).toBeVisible();
  });

  // ── 4. REPORT PAGE: EMPTY STATE WITH REGENERATE CTA ──
  test("Report: Renders fallback card and regenerate button when report is pending", async ({ page }) => {
    await page.goto("/test-report?empty=1");

    await expect(page.getByRole("heading", { name: "Your report is not ready yet" })).toBeVisible();
    const createBtn = page.getByRole("button", { name: /Create My Personalised Report/i });
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toBeEnabled();
  });

  // ── 5. REPORT PAGE: GENERATE PLAN BUTTON & REDIRECT FLOW ──
  test("Report: Generate My Plan button triggers animation and respects subscription status", async ({ page }) => {
    // Subscribed user
    await page.goto("/test-report?subscribed=1");
    const generateBtn = page.getByRole("button", { name: /Generate My Plan/i });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled();

    // Click triggers preparing state
    await generateBtn.click();
    await expect(page.getByText(/Preparing your personalized plan/i)).toBeVisible();
  });

  // ── 6. PLAN SETUP: WORKOUT TAB & EXERCISES ──
  test("Plan Setup: Default Workout tab displays training plan and exercise details", async ({ page }) => {
    await page.goto("/test-plan-setup");

    await expect(page.getByRole("heading", { name: "Your Training Plan" })).toBeVisible();
    await expect(page.getByText("Chest & Triceps Hypertrophy")).toBeVisible();
    await expect(page.getByText("60 min")).toBeVisible();

    // Verify exercise cards
    await expect(page.getByText("Incline Barbell Bench Press")).toBeVisible();
    await expect(page.getByText("Flat Dumbbell Press")).toBeVisible();
    await expect(page.getByText("Cable Chest Flyes")).toBeVisible();
    await expect(page.getByText("Overhead Rope Tricep Extension")).toBeVisible();
  });

  // ── 7. PLAN SETUP: WEEK DAY SELECTOR SWITCHING ──
  test("Plan Setup: Week day selector toggles between workouts and rest days", async ({ page }) => {
    await page.goto("/test-plan-setup");

    // Click second day (FRI)
    await page.getByRole("button", { name: /FRI/i }).click();
    await expect(page.getByText("Back & Biceps Power")).toBeVisible();
    await expect(page.getByText("55 min")).toBeVisible();
    await expect(page.getByText("Chest Supported T-Bar Row")).toBeVisible();

    // Click a Rest Day (SAT)
    await page.getByRole("button", { name: /SAT/i }).click();
    await expect(page.getByText("Active Recovery / Rest Day")).toBeVisible();
  });

  // ── 8. PLAN SETUP: DIET TAB & MACRO TARGETS ──
  test("Plan Setup: Diet tab displays Luna AI summary and 4 macro target cards", async ({ page }) => {
    await page.goto("/test-plan-setup");

    // Switch to Diet tab
    await page.getByRole("button", { name: /Diet/i }).click();
    await expect(page.getByRole("heading", { name: "Your Nutrition Plan" })).toBeVisible();
    await expect(page.getByText("Generated by Luna AI")).toBeVisible();
    await expect(page.getByText("100% Natural Foods")).toBeVisible();

    // Macro Cards
    await expect(page.getByText("Calories")).toBeVisible();
    await expect(page.getByText("2600")).toBeVisible();
    await expect(page.getByText("Protein")).toBeVisible();
    await expect(page.getByText("165g")).toBeVisible();
    await expect(page.getByText("Carbs")).toBeVisible();
    await expect(page.getByText("310g")).toBeVisible();
    await expect(page.getByText("Fat")).toBeVisible();
    await expect(page.getByText("75g")).toBeVisible();

    // Notice card
    await expect(page.getByText("Full Diet Plan in Nutrition Page")).toBeVisible();
  });

  // ── 9. PLAN SETUP: GROCERY TAB ──
  test("Plan Setup: Grocery tab displays whole food add-ons and natural foods pledge", async ({ page }) => {
    await page.goto("/test-plan-setup");

    // Switch to Grocery tab
    await page.getByRole("button", { name: /Grocery/i }).click();
    await expect(page.getByRole("heading", { name: "Your Grocery Plan" })).toBeVisible();
    await expect(page.getByText("Your grocery add-ons")).toBeVisible();
    await expect(page.getByText(/Zero artificial powders or chemical supplements/i)).toBeVisible();
    await expect(page.getByText("Full Grocery Plan in Nutrition Page")).toBeVisible();
  });

  // ── 10. PLAN SETUP: ERROR & SAFETY RECOVERY ──
  test("Plan Setup: Shows error state and recovers plan upon clicking Try Again", async ({ page }) => {
    await page.goto("/test-plan-setup?state=error");

    await expect(page.getByRole("heading", { name: "Plan Generation Failed" })).toBeVisible();
    await expect(page.getByText("Unable to connect to AI plan service")).toBeVisible();

    const tryAgainBtn = page.getByRole("button", { name: /Try Again/i });
    await expect(tryAgainBtn).toBeVisible();
    await tryAgainBtn.click();

    // Plan should now be recovered and visible
    await expect(page.getByRole("heading", { name: "Your Training Plan" })).toBeVisible();
    await expect(page.getByText("Chest & Triceps Hypertrophy")).toBeVisible();
  });

  // ── 11. PLAN SETUP: LOCK IN PLAN CTA ──
  test("Plan Setup: Clicking Lock In My Plan triggers saving state", async ({ page }) => {
    await page.goto("/test-plan-setup");

    const lockInBtn = page.getByRole("button", { name: /Lock In My Plan/i });
    await expect(lockInBtn).toBeVisible();
    await expect(lockInBtn).toBeEnabled();

    await lockInBtn.click();
    await expect(page.getByText(/Locking In Your Plan/i)).toBeVisible();
  });

  // ── 12. MOBILE VIEWPORT INTEGRITY ──
  test("Mobile APK Viewport: Zero horizontal overflow and clean CTA positioning", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/test-report?subscribed=1");

    // Check no horizontal scroll on Report page
    const reportOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(reportOverflow).toBe(false);

    // Navigate to Plan Setup
    await page.goto("/test-plan-setup");
    const planOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(planOverflow).toBe(false);

    // Verify floating CTA button is visible
    const saveBtn = page.getByRole("button", { name: /Lock In My Plan/i });
    await expect(saveBtn).toBeVisible();
  });

});
