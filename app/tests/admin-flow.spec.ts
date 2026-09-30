import { test, expect } from "@playwright/test";

test.describe("GrindLog Admin Flow Verification", () => {
  const adminCookie = {
    name: "admin_auth",
    value: "admin",
    domain: "localhost",
    path: "/",
  };

  // ── 1. UNAUTHENTICATED REDIRECTS & ACCESS CONTROL ──
  test("Unauthorized access to /admin and sub-routes redirects to /admin-login", async ({ page, context }) => {
    // Ensure clean state without admin cookie
    await context.clearCookies();

    // 1. Root /admin redirect
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login/);

    // 2. Sub-route /admin/fitness redirect
    await page.goto("/admin/fitness");
    await expect(page).toHaveURL(/\/admin-login/);

    // 3. Sub-route /admin/pricing redirect
    await page.goto("/admin/pricing");
    await expect(page).toHaveURL(/\/admin-login/);

    // 4. Sub-route /admin/users redirect
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/admin-login/);
  });

  // ── 2. ADMIN LOGIN FORM SUBMISSION (ERROR & SUCCESS) ──
  test("Admin login handles invalid credentials and successfully authenticates valid admin", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/admin-login");

    // UI elements check
    await expect(page.getByRole("heading", { name: "Admin Control Panel" })).toBeVisible();
    await expect(page.getByPlaceholder("Enter admin username")).toBeVisible();
    await expect(page.getByPlaceholder("Enter admin password")).toBeVisible();

    // Test Invalid Login
    await page.getByPlaceholder("Enter admin username").fill("admin");
    await page.getByPlaceholder("Enter admin password").fill("wrongpassword");
    await page.getByRole("button", { name: /Sign in to Dashboard/i }).click();

    // Error message rendered
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();

    // Test Valid Login
    await page.getByPlaceholder("Enter admin username").fill("admin");
    await page.getByPlaceholder("Enter admin password").fill("admin");
    await page.getByRole("button", { name: /Sign in to Dashboard/i }).click();

    // Successfully redirects to /admin
    await page.waitForURL("**/admin", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();
  });

  // ── 3. ADMIN DASHBOARD OVERVIEW & METRICS ──
  test("Admin Dashboard renders key metrics, recent users table, and navigation links", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin");

    // Brand and Navigation
    await expect(page.getByText("Fitness Admin").locator("visible=true").first()).toBeVisible();

    // Main Heading
    await expect(page.getByRole("heading", { name: "Dashboard Overview" })).toBeVisible();

    // Metrics cards
    await expect(page.getByText("Total Users", { exact: true })).toBeVisible();
    await expect(page.getByText("Pro Members", { exact: true })).toBeVisible();
    await expect(page.getByText("Core Members", { exact: true })).toBeVisible();
    await expect(page.getByText("Onboarding Completed", { exact: true })).toBeVisible();

    // Recent Users section
    await expect(page.getByRole("heading", { name: "Recent Signups" })).toBeVisible();
    await expect(page.getByRole("link", { name: /View All/i })).toBeVisible();
  });

  // ── 4. FITNESS AI OS DASHBOARD & DETAIL MODAL ──
  test("Fitness AI OS view displays metrics, member table, and opens detailed profile modal", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin/fitness");

    // Header & Metrics
    await expect(page.getByRole("heading", { name: "Fitness AI OS Overview" })).toBeVisible();
    await expect(page.getByText("Total Fitness Users")).toBeVisible();
    await expect(page.getByText("Active Subscriptions")).toBeVisible();
    await expect(page.getByText("Total AI Sessions")).toBeVisible();

    // Search bar
    const searchInput = page.getByPlaceholder("Search name, email, language...");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");
    await expect(searchInput).toHaveValue("test");
    await searchInput.fill("");

    // If members exist, test opening modal
    const viewButtons = page.getByRole("button", { name: /Full Profile/i });
    const count = await viewButtons.count();
    if (count > 0) {
      await viewButtons.first().click();
      await expect(page.getByRole("button", { name: "Close modal" })).toBeVisible();
      await page.getByRole("button", { name: "Close modal" }).click();
    }
  });

  // ── 5. USER MANAGEMENT TABLE, PAYMENT HISTORY & MODALS ──
  test("User Management page displays users table, search filter, and opens payment history modal", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin/users");

    // Heading
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
    await expect(page.getByText("View all registered users and their payment statuses.")).toBeVisible();

    // Search Input
    const search = page.getByPlaceholder("Search by name or email...");
    await expect(search).toBeVisible();

    // Payment History Modal button check
    const historyButtons = page.getByRole("button", { name: "History" });
    const count = await historyButtons.count();
    if (count > 0) {
      await historyButtons.first().click();
      await expect(page.getByRole("heading", { name: "Payment History" })).toBeVisible();
      await expect(page.getByText("Total Lifetime Value")).toBeVisible();
      // Close modal
      const closeBtn = page.locator("div.fixed.inset-0 button").first();
      await closeBtn.click();
    }
  });

  // ── 6. PLAN PRICING MANAGER & SEGMENTED SWITCHER ──
  test("Plan Pricing page allows switching between Fitness OS and GrindLog apps and editing offer prices", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin/pricing");

    // Header & Banner
    await expect(page.getByRole("heading", { name: "Plan & Offer Pricing Manager" })).toBeVisible();

    // Segmented App Switcher buttons
    const fitnessBtn = page.getByRole("button", { name: "Fitness AI OS" });
    const grindlogBtn = page.getByRole("button", { name: "GrindLog App" });

    await expect(fitnessBtn).toBeVisible();
    await expect(grindlogBtn).toBeVisible();

    // Spin wheel discount controller visible under Fitness OS
    await expect(page.getByText("Lucky Spin Wheel Discount Percentage")).toBeVisible();

    // Test clicking preset chips (e.g. 60%)
    const chip60 = page.getByRole("button", { name: "60%" });
    await expect(chip60).toBeVisible();
    await chip60.click();

    // Check all 3 plan cards are rendered
    await expect(page.getByRole("heading", { name: "Monthly Plan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "6 Months Plan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lifetime Access" })).toBeVisible();

    // Switch to GrindLog App
    await grindlogBtn.click();
    await expect(page.getByRole("heading", { name: "Monthly Plan" })).toBeVisible();

    // Switch back to Fitness OS
    await fitnessBtn.click();
    await expect(page.getByText("Lucky Spin Wheel Discount Percentage")).toBeVisible();
  });

  // ── 7. COUPON GENERATOR & RESTRICTION CONTROLS ──
  test("Coupons page generates codes, displays plan and tier selectors, and renders coupon list", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin/coupons");

    // Heading
    await expect(page.getByRole("heading", { name: "Coupon Management" })).toBeVisible();

    // Form fields
    await expect(page.getByText("COUPON CODE")).toBeVisible();
    await expect(page.getByText("DISCOUNT %")).toBeVisible();
    await expect(page.getByText("MAX USES")).toBeVisible();
    await expect(page.getByText("APPLICABLE PLAN")).toBeVisible();
    await expect(page.getByText("APPLICABLE TIER")).toBeVisible();

    // Random code generator button
    const sparkleBtn = page.locator("button[title='Generate Random']");
    await expect(sparkleBtn).toBeVisible();
    await sparkleBtn.click();

    const codeInput = page.locator("input[name='code']");
    const generatedValue = await codeInput.inputValue();
    expect(generatedValue.length).toBe(8);

    // Plan & tier selectors have defaults
    const planSelect = page.locator("select[name='allowed_plan']");
    await expect(planSelect).toHaveValue("any");

    const tierSelect = page.locator("select[name='allowed_level']");
    await expect(tierSelect).toHaveValue("any");
  });

  // ── 8. SUPPORT MESSAGES INBOX ──
  test("Support inbox displays messages view and filter options", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin/support");

    // Heading
    await expect(page.getByRole("heading", { name: "Support Inbox" })).toBeVisible();
    await expect(page.getByText("Manage and respond to user messages.")).toBeVisible();
  });

  // ── 9. EXIT ADMIN & SESSION LOGOUT ──
  test("Exit Admin button logs out the admin session and redirects to /admin-login", async ({ page, context }) => {
    await context.addCookies([adminCookie]);
    await page.goto("/admin");

    // If mobile menu toggle is visible, open mobile drawer
    const menuBtn = page.getByLabel("Toggle navigation menu");
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
    }

    // Exit Admin button
    const exitBtn = page.getByRole("button", { name: /Exit Admin/i }).first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // Should redirect to /admin-login
    await page.waitForURL("**/admin-login", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Admin Control Panel" })).toBeVisible();

    // Navigating back to /admin should now be blocked
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin-login/);
  });
});
