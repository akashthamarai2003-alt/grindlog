import { test, expect } from "@playwright/test";

test.describe("GrindLog Onboarding Flow Deep Verification", () => {
  // Clear localStorage before every page load via addInitScript
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
  });

  // ── 1. WELCOME SCREEN & STEP NAVIGATION ──
  test("Step 1: Displays welcome headline and advances to Step 2 upon clicking GET STARTED", async ({ page }) => {
    await page.goto("/test-onboarding");

    // Welcome screen copy
    await expect(page.getByRole("heading", { name: /PUSH/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /YOURSELF/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /HARDER/i })).toBeVisible();
    await expect(page.getByText(/Achieve your fitness goals/i)).toBeVisible();

    // Start button
    const startBtn = page.getByRole("button", { name: /GET STARTED/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // In case initial click arrived during React hydration window, retry click
    try {
      await expect(page.getByRole("heading", { name: "PERSONAL PROFILE" })).toBeVisible({ timeout: 4000 });
    } catch {
      await startBtn.click();
      await expect(page.getByRole("heading", { name: "PERSONAL PROFILE" })).toBeVisible({ timeout: 10000 });
    }
    await expect(page.getByPlaceholder("Your Name")).toBeVisible();
  });

  // ── 2. STEP 2 VALIDATIONS & BOTTOM SHEETS ──
  test("Step 2: Validates name, age minimum (16), gender sheet, and language selection", async ({ page }) => {
    await page.goto("/test-onboarding?step=2");

    const nameInput = page.getByPlaceholder("Your Name");
    const ageInput = page.getByPlaceholder("25");
    const continueBtn = page.getByRole("button", { name: /Continue/i });

    // Initially continue button is disabled
    await expect(continueBtn).toBeDisabled();

    // Test age below 16
    await nameInput.fill("John Doe");
    await ageInput.fill("14");
    await expect(page.getByText(/Age must be between 16 and 120/i)).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    // Enter valid age
    await ageInput.fill("24");
    await expect(page.getByText(/Age must be between 16 and 120/i)).not.toBeVisible();

    // Select Gender via bottom sheet
    await page.getByRole("button", { name: "Select", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Select Gender" })).toBeVisible();
    await page.getByRole("button", { name: "Male", exact: true }).click();
    await expect(page.getByRole("button", { name: "Male" }).first()).toBeVisible();

    // Fill Country
    await page.getByPlaceholder("e.g. United States").fill("India");

    // Select Language via sheet
    await page.getByRole("button", { name: "e.g. English" }).click();
    await expect(page.getByRole("heading", { name: "Preferred Language" })).toBeVisible();
    await page.getByRole("button", { name: "English", exact: true }).click();

    // Continue should now be enabled
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Advances to Step 3 (Body Details)
    await expect(page.getByRole("heading", { name: "BODY DETAILS" })).toBeVisible();
  });

  // ── 3. STEP 3 BIOMETRIC BOUNDS & METRICS ──
  test("Step 3: Validates height and weight ranges and advances to Step 4", async ({ page }) => {
    await page.goto("/test-onboarding?step=3");

    const heightInput = page.getByPlaceholder("173", { exact: true });
    const weightInput = page.getByPlaceholder("73", { exact: true });
    const continueBtn = page.getByRole("button", { name: /Continue/i });

    // Invalid height (too low)
    await heightInput.fill("30");
    await weightInput.fill("70");
    await expect(page.getByText(/Height must be between 50 and 250 cm/i)).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    // Valid height & weight
    await heightInput.fill("180");
    await weightInput.fill("78");
    await expect(continueBtn).toBeEnabled();

    await continueBtn.click();

    // Advances to Step 4 (Goals)
    await expect(page.getByRole("heading", { name: /What do you want to achieve\?/i })).toBeVisible();
  });

  // ── 4. STEP 4 GOALS & TARGETS ──
  test("Step 4: Selects primary fitness goal and enters target weight", async ({ page }) => {
    await page.goto("/test-onboarding?step=4");

    // Select goal
    await expect(page.getByText("Build Muscle", { exact: false }).first()).toBeVisible();
    await page.getByRole("button", { name: /Build Muscle/i }).first().click();

    const targetWeightInput = page.getByPlaceholder("68", { exact: true });
    await targetWeightInput.fill("82");

    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Advances to Step 5 (Fitness Experience)
    await expect(page.getByRole("heading", { name: /EXPERIENCE/i })).toBeVisible();
  });

  // ── 5. STEP 12 HEALTH CONSTRAINTS & 'OTHER' VALIDATION FIX ([MAJ-04]) ──
  test("Step 12: Prevents bypass when 'Other' physical problem is selected without description", async ({ page }) => {
    // Jump straight to filled test page (lands on Step 15 Review)
    await page.goto("/test-onboarding?filled=1");

    // Click Edit on Health & Safety from Step 15 Review
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
    const healthCard = page.locator("div").filter({ hasText: /^Health & Safety/ }).first();
    await healthCard.getByRole("button", { name: "Edit" }).click();

    // Now on Step 12 (Physical Concerns)
    await expect(page.getByRole("heading", { name: "Physical Concerns" })).toBeVisible();

    // Select "Other" under physical problems
    const otherProblemBtn = page.getByRole("button", { name: "Other", exact: true }).first();
    await otherProblemBtn.click();

    // The text input for Other appears
    const otherInput = page.getByPlaceholder("Please specify your physical problem...");
    await expect(otherInput).toBeVisible();

    // Empty Other input must not allow proceeding
    await otherInput.fill("");
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await expect(continueBtn).toBeDisabled();

    // Only typing whitespace must not allow proceeding
    await otherInput.fill("   ");
    await expect(continueBtn).toBeDisabled();

    // Typing real condition enables proceeding
    await otherInput.fill("Mild lower lumbar strain");
    // Also requires pain triggers and severity since problem is not None
    await page.getByRole("button", { name: "3", exact: true }).click();
    await page.getByRole("button", { name: "During exercise" }).click();
    await expect(continueBtn).toBeEnabled();

    // Switch back to "None"
    await page.getByRole("button", { name: "None", exact: true }).first().click();
    await expect(continueBtn).toBeEnabled();

    // Clicking continue returns straight to Step 15 Review
    await continueBtn.click();
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
  });

  // ── 6. STEP 14 PHOTO SKIPPING & REVIEW TRANSITION ([MIN-02]) ──
  test("Step 14: Bottom bar says 'Review Profile' and Skip Photos transitions cleanly to Step 15", async ({ page }) => {
    await page.goto("/test-onboarding?filled=1");

    // Edit Step 14 (Target Physique & Scan)
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
    const physiqueCard = page.locator("div").filter({ hasText: /^Target Physique & Scan/ }).first();
    await physiqueCard.getByRole("button", { name: "Edit" }).click();

    // Verify button label is "Review Profile" (not "Analyze & Generate Plan")
    const reviewBtn = page.getByRole("button", { name: "Review Profile" });
    await expect(reviewBtn).toBeVisible();

    // Verify "Skip photos and analyze profile →" button
    const skipPhotosBtn = page.getByRole("button", { name: /Skip photos and analyze profile/i });
    await expect(skipPhotosBtn).toBeVisible();
    await skipPhotosBtn.click();

    // Directly transitions to Step 15 Review
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
  });

  // ── 7. STEP 15 REVIEW CARDS & JUMP-TO-EDIT RETURN FLOW ──
  test("Step 15: Displays all 11 summary cards and allows jumping to edit with return-to-review", async ({ page }) => {
    await page.goto("/test-onboarding?filled=1");

    // Verify Step 15 Review Cards
    await expect(page.getByText("Personal Profile")).toBeVisible();
    await expect(page.getByText("Body Details")).toBeVisible();
    await expect(page.getByText("Goal & Target")).toBeVisible();
    await expect(page.getByText("Experience")).toBeVisible();
    await expect(page.getByText("Environment")).toBeVisible();
    await expect(page.getByText("Schedule")).toBeVisible();
    await expect(page.getByText("Nutrition")).toBeVisible();
    await expect(page.getByText("Food & Budget")).toBeVisible();
    await expect(page.getByText("Lifestyle")).toBeVisible();
    await expect(page.getByText("Health & Safety")).toBeVisible();
    await expect(page.getByText("Target Physique & Scan")).toBeVisible();

    // Verify prefilled values
    await expect(page.getByText("Alex Hunter, 26 yrs, India")).toBeVisible();
    await expect(page.getByText(/178cm, 76.5kg/i)).toBeVisible();
    await expect(page.getByText(/Build Muscle \(Target: 80kg\)/i)).toBeVisible();

    // Jump to edit Body Details (Step 3)
    const bodyCard = page.locator("div").filter({ hasText: /^Body Details/ }).first();
    await bodyCard.getByRole("button", { name: "Edit" }).click();

    // We are on Step 3
    await expect(page.getByRole("heading", { name: /BODY/i })).toBeVisible();
    const weightInput = page.getByPlaceholder("73", { exact: true });
    await expect(weightInput).toHaveValue("76.5");

    // Modify weight
    await weightInput.fill("77");

    // Click Continue - returns immediately to Step 15 Review
    await page.getByRole("button", { name: /Continue/i }).click();
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
    await expect(page.getByText(/77kg/i)).toBeVisible();
  });

  // ── 8. EDIT MODE LAUNCHES DIRECTLY INTO STEP 15 REVIEW ([CRIT-04]) ──
  test("Edit mode: /onboarding?mode=edit launches directly into Step 15 Review", async ({ page }) => {
    await page.goto("/test-onboarding?mode=edit&filled=1");

    // Must start on Step 15 Review, NOT on Step 1 Welcome
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /PUSH/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Generate Transformation Plan" })).toBeVisible();
  });

  // ── 9. STEP 16 ANALYSIS SCREEN ERROR HANDLING & RECOVERY ([CRIT-03]) ──
  test("Step 16: Displays error card and retry/edit actions when /api/fitness/analyze fails", async ({ page }) => {
    // Intercept /api/fitness/analyze and mock an error response
    await page.route("**/api/fitness/analyze", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Your height measurement is inconsistent with chosen weight category.",
        }),
      });
    });

    await page.goto("/test-onboarding?filled=1");

    // Submit Step 15
    const generateBtn = page.getByRole("button", { name: "Generate Transformation Plan" });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Enters Step 16 Analysis Screen
    await expect(page.getByText(/Action Needed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Your height measurement is inconsistent/i)).toBeVisible();

    // Verify recovery options
    const retryBtn = page.getByRole("button", { name: /Retry Generation/i });
    const editProfileBtn = page.getByRole("button", { name: /Review & Edit Profile/i });
    await expect(retryBtn).toBeVisible();
    await expect(editProfileBtn).toBeVisible();

    // Clicking "Review & Edit Profile" returns to Step 15
    await editProfileBtn.click();
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();
  });

  // ── 10. STEP 16 SUCCESSFUL GENERATION FLOW ──
  test("Step 16: Displays phase progression and success checkmark on successful analysis", async ({ page }) => {
    // Mock successful analyze API response
    await page.route("**/api/fitness/analyze", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          ai_strategy: {
            strategy_summary: "Lean muscle building program engineered.",
            target_calories: 2600,
            target_protein: 160,
          },
        }),
      });
    });

    await page.goto("/test-onboarding?filled=1");

    // Click Generate Transformation Plan
    await page.getByRole("button", { name: "Generate Transformation Plan" }).click();

    // Analysis screen animation
    await expect(page.getByText(/Understanding your profile/i)).toBeVisible();

    // Eventually reaches "Transformation Ready" and "View My Transformation Plan"
    await expect(page.getByText(/Transformation Ready/i)).toBeVisible({ timeout: 12000 });
    const viewPlanBtn = page.getByRole("button", { name: /View My Transformation Plan/i });
    await expect(viewPlanBtn).toBeVisible();

    // Click "View My Transformation Plan" and verify full transition into Report
    await viewPlanBtn.click();
    await expect(page).toHaveURL(/(\/report|\/test-report)/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Your Starting Point" })).toBeVisible({ timeout: 15000 });

    // Verify user is NOT bounced back to /onboarding
    expect(page.url()).not.toContain("/onboarding");
  });

  // ── 11. MOBILE APK VIEWPORT (390x844) RESPONSIVENESS & ZERO OVERFLOW ──
  test("Mobile APK Viewport: Zero horizontal scrolling and perfectly anchored action buttons", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/test-onboarding?filled=1");

    // Verify Step 15 on mobile
    await expect(page.getByRole("heading", { name: /Review Your Profile/i })).toBeVisible();

    // Check zero horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify Bottom Action Button is visible and fully clickable
    const actionBtn = page.getByRole("button", { name: "Generate Transformation Plan" });
    await expect(actionBtn).toBeVisible();
    const box = await actionBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
  });

  // ── 12. COMPLETION PERSISTENCE & NO RESET TO STEP 1 ──
  test("Completion Persistence: Completed onboarding redirects directly to report without restarting at Step 1", async ({ page }) => {
    // Pre-seed localStorage with completed onboarding state
    await page.addInitScript(() => {
      localStorage.setItem("grindlog_onboarding_completed", "true");
    });

    await page.goto("/test-onboarding");
    // Should immediately navigate to report and NOT show Step 1
    await expect(page).toHaveURL(/(\/report|\/test-report)/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: /PUSH/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /GET STARTED/i })).not.toBeVisible();
  });
});
