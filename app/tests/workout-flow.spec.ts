import { test, expect } from "@playwright/test";

test.describe("GrindLog Workout Flow & Execution Verification", () => {
  // ── 1. AUTHENTICATION & ACCESS GATING ──
  test("unauthenticated access to /workout redirects to /auth/signin", async ({ page }) => {
    await page.goto("/workout");
    await expect(page).toHaveURL(/\/auth\/signin\?redirect=%2Fworkout/);
  });

  test("unauthenticated access to /workout/mock redirects to /auth/signin", async ({ page }) => {
    await page.goto("/workout/mock");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  // ── 2. FREE PREVIEW MODE ──
  test("Free user preview mode: renders preview split and triggers upgrade modal", async ({ page }) => {
    await page.goto("/test-workout?view=free");

    // Header & badge
    await expect(page.getByText("Your Workouts")).toBeVisible();
    await expect(page.getByText("Preview Split")).toBeVisible();

    // Weekly calendar overview
    await expect(page.getByText("This Week")).toBeVisible();

    // Sample preview workout
    await expect(page.getByText("Pull Day (Preview)")).toBeVisible();
    await expect(page.getByText("Back • Biceps")).toBeVisible();

    // Lock button triggers ProUpgradeModal
    const unlockButton = page.getByRole("button", { name: /start workout.*unlock/i });
    await expect(unlockButton).toBeVisible();
    await unlockButton.click();

    // Verify upgrade modal pops up with plan benefits
    await expect(page.getByText("Unlock Live Workout Sessions")).toBeVisible();
    await expect(page.getByText("Personalized 7-day workout split & exercise guidance")).toBeVisible();
  });

  // ── 3. PRO SCHEDULED WORKOUT VIEW ──
  test("Pro user scheduled workout: renders accurate split badge, stats, and exercises list", async ({ page }) => {
    await page.goto("/test-workout?view=pro");

    // Header & dynamic split badge (MIN-03 fix: 4-Day Split, not hardcoded 7-Day)
    await expect(page.getByText("Your Workouts")).toBeVisible();
    await expect(page.getByText("4-Day Split")).toBeVisible();

    // Today's scheduled workout card
    await expect(page.getByText("Back & Biceps")).toBeVisible();
    await expect(page.getByText("3", { exact: true })).toBeVisible(); // 3 exercises
    await expect(page.getByText("High", { exact: true })).toBeVisible(); // High intensity

    // Start workout button is ready
    const startButton = page.getByRole("button", { name: "START WORKOUT" });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    // Exercises list renders all 3 movements
    await expect(page.getByText("Barbell Deadlift")).toBeVisible();
    await expect(page.getByText("Lat Pulldown")).toBeVisible();
    await expect(page.getByText("Barbell Bicep Curl")).toBeVisible();
  });

  // ── 4. IN-PROGRESS WORKOUT & RESUME CARD ──
  test("In-progress workout: displays ActiveWorkoutResumeCard with progress count", async ({ page }) => {
    await page.goto("/test-workout?view=in_progress");

    // Active resume card
    await expect(page.getByText("Continue workout?")).toBeVisible();
    await expect(page.getByText("1 / 2")).toBeVisible(); // 1 completed out of 2

    // Action buttons
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "End Workout" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Discard" })).toBeVisible();
  });

  // ── 5. REST & RECOVERY DAY + EARLY START ──
  test("Rest day view: displays recovery banner and next scheduled workout with early start", async ({ page }) => {
    await page.goto("/test-workout?view=rest_day");

    // Rest day card
    await expect(page.getByText("Rest & Recovery Day")).toBeVisible();
    await expect(page.getByText(/no workout scheduled for this day/i)).toBeVisible();

    // Next scheduled workout
    await expect(page.getByText("Next saved workout")).toBeVisible();
    await expect(page.getByText("Legs & Core")).toBeVisible();
    await expect(page.getByText(/scheduled for thursday, oct 1/i)).toBeVisible();

    // Start Early button
    await expect(page.getByRole("button", { name: "START EARLY" })).toBeVisible();
  });

  // ── 6. ACTIVE EXECUTION & CRIT-01 BUG FIX ──
  test("CRITICAL: Navigating to next exercise inside ExerciseDetail initializes clean state without crash", async ({ page }) => {
    // Intercept database sync call for set logging
    await page.route("**/api/workouts/sessions/*/sets", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/test-workout?view=execution");

    // 1. Overview shows the workout title and exercises
    await expect(page.locator("h1", { hasText: "Upper Body Hypertrophy" })).toBeVisible();
    await expect(page.locator("h4", { hasText: "Bench Press" })).toBeVisible();
    await expect(page.locator("h4", { hasText: "Incline Dumbbell Press" })).toBeVisible();

    // 2. Select Exercise 1 (Bench Press)
    const benchPressCard = page.locator("h4", { hasText: "Bench Press" });
    await benchPressCard.click();

    // Verify ExerciseDetail loaded
    await expect(page.locator("h2", { hasText: "Bench Press" })).toBeVisible();
    await expect(page.getByText("Set 1")).toBeVisible();

    // Fill reps and weight on Set 1
    const weightInput = page.locator('input[type="number"]').first();
    await weightInput.fill("60");

    const completeSetButton = page.getByRole("button", { name: "Complete Set" }).first();
    await completeSetButton.click();

    // Set 1 marked completed
    await expect(page.getByText("Completed").first()).toBeVisible();

    // Rest timer is triggered
    await expect(page.getByText(/resting/i).first()).toBeVisible();

    // 3. CRIT-01 VERIFICATION: Navigate to Exercise 2
    // Navigate via the "BACK" button to overview or directly to next exercise
    const backButton = page.getByRole("button", { name: "BACK" });
    await backButton.click();

    // Select Exercise 2 (Incline Dumbbell Press)
    const inclineCard = page.locator("h4", { hasText: "Incline Dumbbell Press" });
    await inclineCard.click();

    // Exercise 2 MUST load without any TypeError: Cannot read properties of undefined (reading 'reps')
    await expect(page.locator("h2", { hasText: "Incline Dumbbell Press" })).toBeVisible();
    await expect(page.getByText("Upper Chest").first()).toBeVisible();
    await expect(page.getByText("Set 1")).toBeVisible();

    // Complete Set 1 on Exercise 2
    const ex2CompleteButton = page.getByRole("button", { name: "Complete Set" }).first();
    await expect(ex2CompleteButton).toBeVisible();
    await ex2CompleteButton.click();

    // Verifies Exercise 2 set completes without error
    await expect(page.getByText("Completed").first()).toBeVisible();
  });

  // ── 7. WORKOUT COMPLETE & MAJ-03 BUG FIX ──
  test("MAJ-03: Summary screen displays stats, Back to Workouts button, and allows saving without forced survey", async ({ page }) => {
    await page.goto("/test-workout?view=summary");

    // Header & stats
    await expect(page.getByText("Workout Complete!")).toBeVisible();
    await expect(page.getByText("42 min")).toBeVisible();
    await expect(page.getByText("2 / 2")).toBeVisible(); // MIN-02 fix: 2/2 Exercises
    await expect(page.getByText("1,560 kg")).toBeVisible();
    await expect(page.getByText("310 kcal")).toBeVisible();

    // Verified: User is NOT trapped!
    const backToWorkouts = page.getByRole("link", { name: "Back to Workouts" });
    await expect(backToWorkouts).toBeVisible();
    await expect(backToWorkouts).toHaveAttribute("href", "/workout");

    // Primary action button is enabled even without completing every survey radio button
    const saveButton = page.getByRole("button", { name: /save/i });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });
});
