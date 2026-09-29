import { test, expect } from "@playwright/test";
import { calculateTargets } from "../lib/fitness/nutrition/nutrition-engine";
import {
  buildNutritionUserContext,
  normalizeDietType,
  normalizeFoodEnvironment,
  resolveMealSlots,
} from "../lib/fitness/nutrition/user-context";
import { calibrateMealsToTargets } from "../lib/services/nutrition/nutrition-service";

test.describe("7-Day Diet Plan & Monthly Quota (4 Plans/Month) Long-Term Architecture", () => {
  // ─────────────────────────────────────────────────────────
  // 1. MONTHLY 4-PLAN QUOTA & WEEKLY CADENCE SIMULATION
  // ─────────────────────────────────────────────────────────

  test("Weekly cadence & 4-plan monthly quota logic: enforces 1 plan/week, max 4 plans/month", () => {
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const simulateEligibility = (logs: Array<{ created_at: string }>, currentTime: number) => {
      if (!logs || logs.length === 0) {
        return {
          can_generate: true,
          has_active_plan: false,
          plans_used_this_month: 0,
          max_plans_per_month: 4,
          reason: null,
        };
      }

      const lastLog = logs[0];
      const lastGenTime = new Date(lastLog.created_at).getTime();
      const nextWeeklyAvailTime = lastGenTime + WEEK_MS;
      const isWeeklyCooldown = currentTime < nextWeeklyAvailTime;

      const thirtyDaysAgoTime = currentTime - THIRTY_DAYS_MS;
      const logsInLast30Days = logs.filter((l) => new Date(l.created_at).getTime() >= thirtyDaysAgoTime);
      const plansUsedThisMonth = logsInLast30Days.length;
      const isMonthlyLimitReached = plansUsedThisMonth >= 4;

      if (isMonthlyLimitReached) {
        return {
          can_generate: false,
          has_active_plan: true,
          plans_used_this_month: plansUsedThisMonth,
          max_plans_per_month: 4,
          reason: "monthly_limit_reached",
        };
      }

      if (isWeeklyCooldown) {
        const daysRemaining = Math.max(1, Math.ceil((nextWeeklyAvailTime - currentTime) / (24 * 60 * 60 * 1000)));
        return {
          can_generate: false,
          has_active_plan: true,
          plans_used_this_month: plansUsedThisMonth,
          max_plans_per_month: 4,
          days_remaining: daysRemaining,
          reason: "weekly_cooldown",
        };
      }

      return {
        can_generate: true,
        has_active_plan: true,
        plans_used_this_month: plansUsedThisMonth,
        max_plans_per_month: 4,
        reason: null,
      };
    };

    const baseTime = new Date("2026-09-01T08:00:00Z").getTime();

    // Day 1: New user generates Plan 1 (Week 1)
    const log1 = { created_at: new Date(baseTime).toISOString() };
    const stateDay1 = simulateEligibility([log1], baseTime + 1000);
    expect(stateDay1.can_generate).toBe(false);
    expect(stateDay1.reason).toBe("weekly_cooldown");
    expect(stateDay1.plans_used_this_month).toBe(1);
    expect(stateDay1.days_remaining).toBe(7);

    // Day 4 (mid-week): still locked under weekly cooldown
    const stateDay4 = simulateEligibility([log1], baseTime + 3 * 24 * 60 * 60 * 1000);
    expect(stateDay4.can_generate).toBe(false);
    expect(stateDay4.reason).toBe("weekly_cooldown");
    expect(stateDay4.days_remaining).toBe(4);

    // Day 8: Week 1 completes! Plan 2 unlocks
    const day8Time = baseTime + 7 * 24 * 60 * 60 * 1000 + 1000;
    const stateDay8 = simulateEligibility([log1], day8Time);
    expect(stateDay8.can_generate).toBe(true);
    expect(stateDay8.reason).toBeNull();

    // User generates Plan 2 (Week 2)
    const log2 = { created_at: new Date(day8Time).toISOString() };
    const logsAfterPlan2 = [log2, log1];
    const stateAfterPlan2 = simulateEligibility(logsAfterPlan2, day8Time + 1000);
    expect(stateAfterPlan2.plans_used_this_month).toBe(2);
    expect(stateAfterPlan2.can_generate).toBe(false);

    // Day 15: Week 2 completes! User generates Plan 3 (Week 3)
    const day15Time = baseTime + 14 * 24 * 60 * 60 * 1000 + 1000;
    const log3 = { created_at: new Date(day15Time).toISOString() };
    const logsAfterPlan3 = [log3, log2, log1];
    expect(simulateEligibility(logsAfterPlan3, day15Time + 1000).plans_used_this_month).toBe(3);

    // Day 22: Week 3 completes! User generates Plan 4 (Week 4 - final week of month)
    const day22Time = baseTime + 21 * 24 * 60 * 60 * 1000 + 1000;
    const log4 = { created_at: new Date(day22Time).toISOString() };
    const logsAfterPlan4 = [log4, log3, log2, log1];
    const stateAfterPlan4 = simulateEligibility(logsAfterPlan4, day22Time + 1000);
    expect(stateAfterPlan4.plans_used_this_month).toBe(4);

    // Day 29: User tries to generate a 5th plan within 30 days -> Monthly limit hit (4/4 used)!
    const day29Time = baseTime + 28 * 24 * 60 * 60 * 1000 + 1000;
    const stateDay29 = simulateEligibility(logsAfterPlan4, day29Time);
    expect(stateDay29.can_generate).toBe(false);
    expect(stateDay29.reason).toBe("monthly_limit_reached");
    expect(stateDay29.plans_used_this_month).toBe(4);

    // Day 32: Rolling 30-day window clears Plan 1 -> Next monthly cycle begins!
    const day32Time = baseTime + 31 * 24 * 60 * 60 * 1000;
    const stateDay32 = simulateEligibility(logsAfterPlan4, day32Time);
    expect(stateDay32.can_generate).toBe(true);
    expect(stateDay32.plans_used_this_month).toBe(3); // oldest log fell outside 30 days
  });

  // ─────────────────────────────────────────────────────────
  // 2. LONG-TERM GOAL PROGRESSION (12-WEEK WEIGHT MILESTONES)
  // ─────────────────────────────────────────────────────────

  test("Long-term progression: Calorie & macro targets adapt dynamically as weight changes over 12 weeks", () => {
    // Starting profile (Month 1): 80kg male, goal: Lose Fat
    const userMonth1 = {
      gender: "Male" as const,
      age: 28,
      height: 175,
      weight: 80,
      goal: "Lose Fat" as const,
      activity_level: "Moderately active" as const,
    };
    const targetsMonth1 = calculateTargets(userMonth1 as any);

    // After 1 month of following 4 weekly plans, user drops to 77kg (Month 2)
    const userMonth2 = {
      ...userMonth1,
      weight: 77,
    };
    const targetsMonth2 = calculateTargets(userMonth2 as any);

    // After 2 months, user drops to 74kg (Month 3)
    const userMonth3 = {
      ...userMonth1,
      weight: 74,
    };
    const targetsMonth3 = calculateTargets(userMonth3 as any);

    // Verified adaptation:
    // As weight reduces, BMR and TDEE adapt so the calorie deficit remains effective without stalling
    expect(targetsMonth1.calories).toBeGreaterThan(targetsMonth2.calories);
    expect(targetsMonth2.calories).toBeGreaterThan(targetsMonth3.calories);

    // Protein requirements adjust proportionally to preserve lean muscle mass
    expect(targetsMonth1.protein_g).toBeGreaterThan(targetsMonth2.protein_g);
    expect(targetsMonth2.protein_g).toBeGreaterThan(targetsMonth3.protein_g);

    // Fiber target remains healthy (~1g per 100 kcal)
    expect(targetsMonth3.fiber_g).toBeGreaterThanOrEqual(14);
  });

  // ─────────────────────────────────────────────────────────
  // 3. 7-DAY BREADTH: ALL 7 DAYS OF A PLAN PRESERVE SANITY CAPS
  // ─────────────────────────────────────────────────────────

  test("7-Day Plan Integrity: Generates 7 distinct daily plans without any single day violating health caps", () => {
    const userProfile = {
      gender: "Male" as const,
      age: 24,
      height: 172,
      weight: 70,
      goal: "Lose Fat + Build Muscle" as const,
      food_type: "Vegetarian" as const,
      food_environment: "Home" as const,
      meals_per_day: "3 meals" as const,
    };

    const targets = calculateTargets(userProfile as any);

    // Simulate 7 different daily meal menus across a full 7-day plan cycle
    const weeklyMenuStaples = [
      // Day 1
      [{ name: "Besan Cheela with Curd", items: [{ foods: { name: "Curd / Dahi" }, quantity: 1 }, { foods: { name: "Besan Cheela" }, quantity: 1 }] }],
      // Day 2
      [{ name: "Moong Dal Cheela with Paneer", items: [{ foods: { name: "Paneer Bhurji" }, quantity: 1 }, { foods: { name: "Moong Dal Cheela" }, quantity: 1 }] }],
      // Day 3
      [{ name: "Soya Chunks Curry with Rice", items: [{ foods: { name: "Soya Chunks" }, quantity: 1 }, { foods: { name: "Steamed Rice" }, quantity: 2 }] }],
      // Day 4
      [{ name: "Dal Tadka with Multigrain Roti", items: [{ foods: { name: "Yellow Dal" }, quantity: 1 }, { foods: { name: "Multigrain Roti" }, quantity: 2 }] }],
      // Day 5
      [{ name: "Rajma Masala with Rice", items: [{ foods: { name: "Rajma" }, quantity: 1 }, { foods: { name: "Steamed Rice" }, quantity: 1.5 }] }],
      // Day 6
      [{ name: "Chole with Phulkas", items: [{ foods: { name: "Chole" }, quantity: 1 }, { foods: { name: "Phulkas" }, quantity: 3 }] }],
      // Day 7
      [{ name: "Paneer Tikka with Salad & Roti", items: [{ foods: { name: "Paneer Tikka" }, quantity: 1 }, { foods: { name: "Whole Wheat Roti" }, quantity: 2 }] }],
    ];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayMeals = weeklyMenuStaples[dayIndex].map((m, idx) => ({
        meal_type: "lunch",
        name: m.name,
        meal_plan_items: m.items.map((it, i) => ({
          id: `d${dayIndex}-item${i}`,
          quantity: it.quantity,
          calories: 200,
          protein: 15,
          carbs: 25,
          fat: 5,
          foods: { ...it.foods, calories: 200, protein: 15, carbs: 25, fat: 5 },
        })),
      }));

      const calibrated = calibrateMealsToTargets(dayMeals, targets, userProfile as any);

      // Verify every day adheres to portion sanity
      calibrated.forEach((m: any) => {
        (m.meal_plan_items || []).forEach((it: any) => {
          const name = String(it.foods?.name || it.name || "").toLowerCase();
          if (name.includes("curd")) expect(it.quantity).toBeLessThanOrEqual(1.0);
          if (name.includes("soya")) expect(it.quantity).toBeLessThanOrEqual(1.0);
          if (name.includes("paneer")) expect(it.quantity).toBeLessThanOrEqual(1.0);
          if (name.includes("rice")) expect(it.quantity).toBeLessThanOrEqual(2.0);
          if (name.includes("roti") || name.includes("phulka")) expect(it.quantity).toBeLessThanOrEqual(3.0);
        });
      });
    }
  });
});
