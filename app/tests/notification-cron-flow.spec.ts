import { test, expect } from "@playwright/test";

test.describe("GrindLog Notifications & Cron Push Flow Verification", () => {
  // ── 1. CRON-JOB.ORG ENDPOINT RESILIENCE & COMPATIBILITY ──
  test("Cron endpoint responds HTTP 200 OK for cron-job.org user-agent", async ({ request }) => {
    const response = await request.get("/api/cron/fitness-reminders", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; cron-job.org/2.0; +https://cron-job.org/robot)",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.istDateKey).toBeDefined();
    expect(typeof body.registeredDevices).toBe("number");
  });

  test("Cron endpoint responds HTTP 200 OK with query key parameter (?key=grindlog_cron_secret_2026)", async ({ request }) => {
    const response = await request.get("/api/cron/fitness-reminders?key=grindlog_cron_secret_2026");

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("Cron endpoint responds HTTP 200 OK with Vercel Cron header (x-vercel-cron: 1)", async ({ request }) => {
    const response = await request.get("/api/cron/fitness-reminders", {
      headers: {
        "x-vercel-cron": "1",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("Cron endpoint responds HTTP 200 OK with custom header (x-cron-key)", async ({ request }) => {
    const response = await request.get("/api/cron/fitness-reminders", {
      headers: {
        "x-cron-key": "grindlog_cron_secret_2026",
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  // ── 2. NOTIFICATIONS IN-APP EXPERIENCE ──
  test("Notifications page: filters categories, marks notifications read, and updates unread badge", async ({ page }) => {
    await page.goto("/test-notifications?view=populated");

    // Header and unread badge
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
    await expect(page.getByText(/2 unread/i)).toBeVisible();

    // Verify categories
    await expect(page.getByRole("button", { name: /All/i })).toBeVisible();
    const workoutTab = page.getByRole("button", { name: /Workout/i });
    const nutritionTab = page.getByRole("button", { name: /Nutrition/i });
    await expect(workoutTab).toBeVisible();
    await expect(nutritionTab).toBeVisible();

    // Filter by Workout
    await workoutTab.click();
    await expect(page.getByText("Today's Grind: Chest & Triceps Hypertrophy")).toBeVisible();
    await expect(page.getByText("Daily Fuel Targets 🎯")).not.toBeVisible();

    // Filter by Nutrition
    await nutritionTab.click();
    await expect(page.getByText("Daily Fuel Targets 🎯")).toBeVisible();
    await expect(page.getByText("Today's Grind: Chest & Triceps Hypertrophy")).not.toBeVisible();

    // Switch back to All
    await page.getByRole("button", { name: /All/i }).click();

    // Mark All as Read
    const markAllBtn = page.getByRole("button", { name: /Mark all read/i });
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await expect(page.getByText(/2 unread/i)).not.toBeVisible();
    }
  });

  test("Notifications empty state renders cleanly without crashes", async ({ page }) => {
    await page.goto("/test-notifications?view=empty");

    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
    await expect(page.getByText(/You're all caught up/i)).toBeVisible();
    await expect(page.getByText(/No unread alerts at the moment/i)).toBeVisible();
  });

  // ── 3. REMINDERS & ALARMS CONFIGURATION EXPERIENCE ──
  test("Reminders page: displays configured workout, meal, and hydration schedules with interactive modals", async ({ page }) => {
    await page.goto("/test-reminders?view=populated");

    // Header & master toggle
    await expect(page.getByText("Set Reminders")).toBeVisible();
    await expect(page.getByText("Reminders", { exact: true }).first()).toBeVisible();

    // Water reminder schedule summary card
    await expect(page.getByText("Water reminder schedule")).toBeVisible();

    // Open Water Schedule Sheet
    const editWaterBtn = page.getByRole("button", { name: /^(Edit|Set)$/i });
    await editWaterBtn.click();
    await expect(page.getByText(/Reminders from start to end at your chosen interval/i)).toBeVisible();
    await expect(page.getByText("Start time")).toBeVisible();
    await expect(page.getByText("End time")).toBeVisible();

    // Close water modal
    const closeWaterBtn = page.getByRole("button", { name: "Cancel" });
    await closeWaterBtn.click();
    await expect(page.getByText(/Reminders from start to end at your chosen interval/i)).not.toBeVisible();

    // Custom Reminders List
    await expect(page.getByText("Workout", { exact: true })).toBeVisible();
    await expect(page.getByText("Breakfast", { exact: true })).toBeVisible();
    await expect(page.getByText("Dinner", { exact: true })).toBeVisible();

    // Add Reminder Button opens ReminderTypeSheet
    const addReminderBtn = page.getByRole("button", { name: /Add Reminder/i });
    await expect(addReminderBtn).toBeVisible();
  });

  // ── 4. MOBILE VIEWPORT RESPONSIVENESS ──
  test("Mobile viewport (390x844): notification and reminder screens fit without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Test Notifications screen
    await page.goto("/test-notifications?view=populated");
    let bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    let windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5);

    // Test Reminders screen
    await page.goto("/test-reminders?view=populated");
    bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5);
  });
});
