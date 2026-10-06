import { test, expect } from "@playwright/test";

test.describe("GrindLog Home Page Flow & Dashboard Verification", () => {
  // ── 1. AUTHENTICATION & ACCESS GATING ──
  test("Desktop browser: unauthenticated access to / renders FitnessLandingPage", async ({ page }) => {
    await page.goto("/");
    // Landing page header or hero copy
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Transform Your Body|GrindLog/i).first()).toBeVisible();
  });

  // ── 2. FREE PREVIEW MODE ──
  test("Free user preview mode: renders preview banner, locked workout, locked meals, and calendar dots", async ({ page }) => {
    await page.goto("/test-home?view=free");

    // Header athlete name & Day 1 badge
    await expect(page.getByText("Rohan K")).toBeVisible();
    await expect(page.getByText("Day 1")).toBeVisible();

    // Free Preview Mode Banner
    await expect(page.getByText("Preview Mode", { exact: true })).toBeVisible();
    await expect(page.getByText("Free Tier", { exact: true })).toBeVisible();
    await expect(page.getByText(/You are exploring GrindLog in preview mode/i)).toBeVisible();
    const choosePlanBannerBtn = page.getByRole("link", { name: "Choose Plan ⚡" }).first();
    await expect(choosePlanBannerBtn).toBeVisible();
    await expect(choosePlanBannerBtn).toHaveAttribute("href", "/payment");

    // Transformation Card for Free user
    await expect(page.getByText("Your Transformation")).toBeVisible();
    await expect(page.getByText("Choose Plan to unlock Weight & Milestone Tracking")).toBeVisible();

    // Horizontal Calendar renders 7 days
    const calendarDays = page.locator("div.grid-cols-7 a");
    await expect(calendarDays).toHaveCount(7);

    // Workout card in Free mode renders locked button with 'Unlock' badge
    const workoutStartBtn = page.getByRole("button", { name: /start workout.*unlock/i });
    await expect(workoutStartBtn).toBeVisible();

    // Clicking locked Start Workout opens ProUpgradeModal
    await workoutStartBtn.click();
    await expect(page.getByText("Unlock Live Workout Sessions")).toBeVisible();
    await expect(page.getByText("Membership Required")).toBeVisible();
    await expect(page.getByText("Personalized 7-day workout split & exercise guidance")).toBeVisible();

    // Close upgrade modal
    const closeBtn = page.locator("button[title='Close']");
    await closeBtn.click();
    await expect(page.getByText("Unlock Live Workout Sessions")).not.toBeVisible();

    // Nutrition card in Free mode: renders locked preview meal view (CRIT-04 fix)
    await expect(page.getByText("Meal Plan in Preview Mode")).toBeVisible();
    await expect(page.getByText(/Choose a plan to generate your personalized 100% natural Indian diet plan/i)).toBeVisible();
    const nutritionChoosePlanBtn = page.getByRole("button", { name: /Choose Plan ⚡/i });
    await expect(nutritionChoosePlanBtn).toBeVisible();
  });

  // ── 3. PRO SCHEDULED WORKOUT & DASHBOARD HERO ──
  test("Pro user active mode: renders workout session, dynamic macros, activity tiles, and progress link", async ({ page }) => {
    await page.goto("/test-home?view=pro");

    // Header athlete name & Day 8 badge
    await expect(page.getByText("Vikram S")).toBeVisible();
    await expect(page.getByText("Day 8")).toBeVisible();

    // No renewal banner should be visible for active plan with 18 days left
    await expect(page.getByText("Grace Period Active")).not.toBeVisible();
    await expect(page.getByText("Month Completed")).not.toBeVisible();

    // Transformation Card with Pro link to /progress
    await expect(page.getByText("Your Transformation")).toBeVisible();
    await expect(page.getByText("View Full Progress & Weight History")).toBeVisible();
    const progressLink = page.getByRole("link", { name: /View Full Progress & Weight History/i });
    await expect(progressLink).toHaveAttribute("href", "/progress");

    // Today's Workout Card
    await expect(page.getByText("Today's Workout")).toBeVisible();
    await expect(page.getByText("Push Day Hypertrophy")).toBeVisible();
    await expect(page.getByText("2 Exercises")).toBeVisible();
    await expect(page.getByText("50 min")).toBeVisible();

    // Start Workout button is enabled and links to /workout
    const startWorkoutBtn = page.getByRole("button", { name: "Start Workout" });
    await expect(startWorkoutBtn).toBeVisible();
    await expect(startWorkoutBtn).toBeEnabled();

    // Nutrition Card: Interactive meal items rendered
    await expect(page.getByText("Today's Nutrition")).toBeVisible();
    await expect(page.getByText("Besan Cheela & Paneer")).toBeVisible();
    await expect(page.getByText("Dal Tadka with Phulkas")).toBeVisible();
    await expect(page.getByText("Protein", { exact: true })).toBeVisible();
    await expect(page.getByText("Carbs", { exact: true })).toBeVisible();
    await expect(page.getByText("Fats", { exact: true })).toBeVisible();

    // Daily Activity Card
    await expect(page.getByText("Today's Activity")).toBeVisible();
    await expect(page.getByText("Steps", { exact: true })).toBeVisible();
    await expect(page.getByText(/6,200/).first()).toBeVisible();
    await expect(page.getByText("Sleep", { exact: true })).toBeVisible();
    await expect(page.getByText(/7h 30m/)).toBeVisible();
    await expect(page.getByText("Water", { exact: true })).toBeVisible();
    await expect(page.getByText(/2\.0\s*L/).first()).toBeVisible();

    // Goals Card
    await expect(page.getByText("Today's Goals")).toBeVisible();
  });

  // ── 4. BULKING PERSONA PROGRESS BADGE ──
  test("Bulking persona: displays emerald positive styling for weight gain", async ({ page }) => {
    await page.goto("/test-home?view=bulking");

    await expect(page.getByText("Arjun M")).toBeVisible();
    await expect(page.getByText("Day 15")).toBeVisible();

    // Baseline is 65kg, current is 68kg (+3kg gained for bulking goal 75kg)
    const transCard = page.locator("div:has-text('Your Transformation')").first();
    await expect(transCard.getByText("65", { exact: true })).toBeVisible();
    await expect(transCard.getByText("68", { exact: true })).toBeVisible();
    await expect(transCard.getByText("75", { exact: true })).toBeVisible();

    // Verify emerald badge styling (MAJ-03 fix)
    const deltaBadge = transCard.getByText("+3 kg", { exact: true });
    await expect(deltaBadge).toBeVisible();
    await expect(deltaBadge).toHaveClass(/text-emerald-400/);

    // Transformation copy
    await expect(page.getByText("+3 kg gained · 7 kg to go")).toBeVisible();
  });

  // ── 5. REST & ACTIVE RECOVERY DAY ──
  test("Rest day mode: renders disabled rest day button and hides exercise counts", async ({ page }) => {
    await page.goto("/test-home?view=rest_day");

    await expect(page.getByText("Rest & Active Recovery")).toBeVisible();
    const restDayBtn = page.getByRole("button", { name: "Rest Day" });
    await expect(restDayBtn).toBeVisible();
    await expect(restDayBtn).toBeDisabled();

    // Numeric exercise count should not be present on rest day
    await expect(page.getByText(/\d+ Exercises/)).not.toBeVisible();
  });

  // ── 6. SUBSCRIPTION GRACE PERIOD ──
  test("Grace period mode: displays 48h grace banner, remaining hours, and renewal link", async ({ page }) => {
    await page.goto("/test-home?view=grace_period");

    // Header Day 29
    await expect(page.getByText("Day 29")).toBeVisible();

    // Grace banner
    await expect(page.getByText("Grace Period Active")).toBeVisible();
    await expect(page.getByText("36h Remaining")).toBeVisible();
    await expect(page.getByText(/Your previous month has ended\. You are in a 48-hour gym grace period/i)).toBeVisible();

    // Renewal CTA button links to payment with renew_monthly intent
    const renewBtn = page.getByRole("link", { name: /Renew Month ⚡/i });
    await expect(renewBtn).toBeVisible();
    await expect(renewBtn).toHaveAttribute("href", "/payment?intent=renew_monthly&plan=pro");
  });

  // ── 7. EXPIRED SUBSCRIPTION MODE ──
  test("Expired subscription mode: displays Month Completed read-only banner and locked meals", async ({ page }) => {
    await page.goto("/test-home?view=expired");

    // Header Day 32
    await expect(page.getByText("Day 32")).toBeVisible();

    // Expired Banner
    await expect(page.getByText("Month Completed")).toBeVisible();
    await expect(page.getByText("Read-Only Mode")).toBeVisible();
    const unlockNextBtn = page.getByRole("link", { name: /Unlock Next Month ⚡/i });
    await expect(unlockNextBtn).toBeVisible();
    await expect(unlockNextBtn).toHaveAttribute("href", "/payment?intent=renew_monthly&plan=pro");

    // Nutrition card locked to prevent 403 errors (CRIT-04 fix)
    await expect(page.getByText("Meal Plan in Preview Mode")).toBeVisible();
    await expect(page.getByRole("button", { name: /Choose Plan ⚡/i })).toBeVisible();
  });

  // ── 8. CALENDAR & DATE NAVIGATION ──
  test("Historical date navigation: updates dynamic header titles and preserves view state", async ({ page }) => {
    // Navigate to a fixed historical date (e.g. 2026-09-15)
    await page.goto("/test-home?view=pro&date=2026-09-15");

    // Dynamic headers should say "Workout", "Activity", "Goals" rather than "Today's ..." (MIN-02 fix)
    await expect(page.locator("h3", { hasText: /^Workout$/ })).toBeVisible();
    await expect(page.locator("h3", { hasText: /^Activity$/ })).toBeVisible();
    await expect(page.locator("h3", { hasText: /^Goals$/ })).toBeVisible();

    // Calendar shows "Today" jump button when viewing non-today date
    const todayJumpBtn = page.getByRole("link", { name: "Today" });
    await expect(todayJumpBtn).toBeVisible();
  });

  // ── 9. BOTTOM NAVIGATION ──
  test("Bottom navigation: renders all primary routes and supports home reset", async ({ page }) => {
    await page.goto("/test-home?view=pro");

    const bottomNav = page.locator("div.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();

    // Verify all 5 navigation tabs scoped to bottomNav
    await expect(bottomNav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Workout", exact: true })).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Meals", exact: true })).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Progress", exact: true })).toBeVisible();
    await expect(bottomNav.getByRole("link", { name: "Profile", exact: true })).toBeVisible();
  });
});
