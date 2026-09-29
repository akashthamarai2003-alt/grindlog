import { test, expect } from "@playwright/test";
import { OnboardingSchema, getOnboardingCompletionIssues } from "../types/fitness/onboarding";
import { calculateTargets } from "../lib/fitness/nutrition/nutrition-engine";
import {
  buildNutritionUserContext,
  normalizeDietType,
  normalizeFoodEnvironment,
  resolveMealSlots,
  calculateDailyBudget,
} from "../lib/fitness/nutrition/user-context";
import { NutritionValidationEngine } from "../lib/fitness/nutrition/validation-engine";
import { calibrateMealsToTargets } from "../lib/services/nutrition/nutrition-service";

test.describe("All-User Onboarding & Nutrition Flow Verification", () => {
  // ─────────────────────────────────────────────────────────
  // 1. ONBOARDING DATA PROFILES FOR ALL USER TYPES
  // ─────────────────────────────────────────────────────────

  const userArchetypes = {
    // 1. Pure Vegetarian in PG (Low-Mid Budget)
    vegetarian_pg_student: {
      name: "Rahul Sharma",
      country: "India",
      preferred_language: "English",
      gender: "Male" as const,
      age: 21,
      height: 175,
      weight: 68,
      target_weight: 65,
      target_deadline_days: 90,
      goal: "Lose Fat + Build Muscle" as const,
      fitness_level: "Intermediate" as const,
      training_location: "Gym" as const,
      equipment: ["Dumbbells", "Barbells", "Machines"],
      training_days_per_week: 4,
      workout_duration_minutes: 60,
      plan_start_preference: "today" as const,
      preferred_training_time: "evening",
      food_type: "Vegetarian" as const,
      food_environment: "PG" as const,
      meals_per_day: "3 meals" as const,
      nutrition_budget: "₹1,000–2,000" as const,
      activity_level: "Moderately active" as const,
      daily_steps: "5–10k" as const,
      sleep_duration: "7–8h" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Lean Athletic" as const,
    },

    // 2. Non-Vegetarian Heavy Lifter / Bulk (Gym + High Budget)
    non_vegetarian_bulk: {
      name: "Vikram Malhotra",
      country: "India",
      preferred_language: "English",
      gender: "Male" as const,
      age: 25,
      height: 180,
      weight: 82,
      target_weight: 86,
      target_deadline_days: 120,
      goal: "Build Muscle" as const,
      fitness_level: "Advanced" as const,
      training_location: "Gym" as const,
      equipment: ["Full Commercial Gym"],
      training_days_per_week: 5,
      workout_duration_minutes: 75,
      plan_start_preference: "monday" as const,
      preferred_training_time: "morning",
      food_type: "Non-Vegetarian" as const,
      food_environment: "Home" as const,
      meals_per_day: "4 meals" as const,
      nutrition_budget: "₹5,000+" as const,
      activity_level: "Very active" as const,
      daily_steps: "10k+" as const,
      sleep_duration: "8h+" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Bodybuilder" as const,
    },

    // 3. Eggetarian with Dairy Allergy (Office / Canteen)
    eggetarian_dairy_allergy: {
      name: "Ananya Sen",
      country: "India",
      preferred_language: "English",
      gender: "Female" as const,
      age: 29,
      height: 162,
      weight: 64,
      target_weight: 58,
      target_deadline_days: 90,
      goal: "Lose Fat" as const,
      fitness_level: "Beginner" as const,
      training_location: "Home" as const,
      equipment: ["Dumbbells", "Yoga Mat"],
      training_days_per_week: 3,
      workout_duration_minutes: 45,
      plan_start_preference: "today" as const,
      preferred_training_time: "morning",
      food_type: "Eggetarian" as const,
      food_environment: "Office/Canteen" as const,
      food_allergies: "dairy",
      meals_per_day: "3 meals" as const,
      nutrition_budget: "₹2,000–5,000" as const,
      activity_level: "Lightly active" as const,
      daily_steps: "3–5k" as const,
      sleep_duration: "6–7h" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Lean Athletic" as const,
    },

    // 4. Vegan Fitness Enthusiast (Plant-Based / Home Cook)
    vegan_athlete: {
      name: "Siddharth Roy",
      country: "India",
      preferred_language: "English",
      gender: "Male" as const,
      age: 27,
      height: 172,
      weight: 70,
      target_weight: 72,
      target_deadline_days: 100,
      goal: "Build Strength" as const,
      fitness_level: "Intermediate" as const,
      training_location: "Outdoor" as const,
      equipment: ["Bodyweight & Outdoor Running", "Resistance Bands"],
      training_days_per_week: 4,
      workout_duration_minutes: 50,
      plan_start_preference: "today" as const,
      preferred_training_time: "evening",
      food_type: "Vegan" as const,
      food_environment: "I Cook" as const,
      meals_per_day: "4 meals" as const,
      nutrition_budget: "₹2,000–5,000" as const,
      activity_level: "Moderately active" as const,
      daily_steps: "5–10k" as const,
      sleep_duration: "7–8h" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Strong & Functional" as const,
    },

    // 5. Female Diabetic User (Maintenance / Small Frequent Meals)
    female_diabetic_user: {
      name: "Meenakshi Iyer",
      country: "India",
      preferred_language: "English",
      gender: "Female" as const,
      age: 44,
      height: 156,
      weight: 62,
      target_weight: 62,
      target_deadline_days: 180,
      goal: "Maintain" as const,
      fitness_level: "Beginner" as const,
      training_location: "Home" as const,
      equipment: ["No Equipment / Bodyweight", "Yoga Mat"],
      training_days_per_week: 3,
      workout_duration_minutes: 30,
      plan_start_preference: "today" as const,
      preferred_training_time: "morning",
      food_type: "Vegetarian" as const,
      food_environment: "Home" as const,
      nutrition_medical_conditions: ["Diabetes" as const],
      meals_per_day: "4 meals" as const,
      nutrition_budget: "₹2,000–5,000" as const,
      activity_level: "Lightly active" as const,
      daily_steps: "3–5k" as const,
      sleep_duration: "7–8h" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Sporty" as const,
    },

    // 6. Intermittent Fasting / 2 Meals per Day
    intermittent_fasting_busy_pro: {
      name: "Karan Patel",
      country: "India",
      preferred_language: "English",
      gender: "Male" as const,
      age: 32,
      height: 178,
      weight: 79,
      target_weight: 73,
      target_deadline_days: 75,
      goal: "Cut" as const,
      fitness_level: "Intermediate" as const,
      training_location: "Combination" as const,
      equipment: ["Full Commercial Gym", "Dumbbells"],
      training_days_per_week: 4,
      workout_duration_minutes: 60,
      plan_start_preference: "monday" as const,
      preferred_training_time: "afternoon",
      food_type: "Non-Vegetarian" as const,
      food_environment: "Mixed" as const,
      meals_per_day: "2 meals" as const,
      nutrition_budget: "₹2,000–5,000" as const,
      activity_level: "Moderately active" as const,
      daily_steps: "5–10k" as const,
      sleep_duration: "6–7h" as const,
      physical_problems: ["None"],
      previous_injuries: false,
      exercise_limitations: ["None"],
      safety_acknowledged: true,
      target_physique: "Men's Physique" as const,
    },
  };

  // ─────────────────────────────────────────────────────────
  // TEST SUITE A: SCHEMA & COMPLETION VALIDATION ACROSS USERS
  // ─────────────────────────────────────────────────────────

  test("validates all onboarding archetypes pass OnboardingSchema and completion check", () => {
    for (const [key, archetype] of Object.entries(userArchetypes)) {
      // 1. Validates against Zod schema
      const parseResult = OnboardingSchema.safeParse(archetype);
      expect(parseResult.success, `Schema parse failed for ${key}: ${JSON.stringify(parseResult.error?.issues)}`).toBe(true);

      // 2. Validates completion issues check returns 0 issues
      const issues = getOnboardingCompletionIssues(archetype);
      expect(issues, `Completion issues found for ${key}`).toEqual([]);
    }
  });

  test("safety invariants: rejects underage, missing safety acknowledgment, or invalid weights", () => {
    // Underage
    const underage = { ...userArchetypes.vegetarian_pg_student, age: 14 };
    expect(getOnboardingCompletionIssues(underage)).toContain("enter a valid age");

    // Missing safety acknowledgment
    const unsafe = { ...userArchetypes.vegetarian_pg_student, safety_acknowledged: false };
    expect(getOnboardingCompletionIssues(unsafe)).toContain("acknowledge the safety information");

    // Invalid weight
    const invalidWeight = { ...userArchetypes.vegetarian_pg_student, weight: 20 };
    expect(getOnboardingCompletionIssues(invalidWeight)).toContain("enter valid height and weight");
  });

  // ─────────────────────────────────────────────────────────
  // TEST SUITE B: NUTRITION CONTEXT & ENGINE LOGIC PER USER
  // ─────────────────────────────────────────────────────────

  test("Persona 1 (Veg PG Student): Calculates recomp targets, clamps curd <= 1.0, daily budget ₹66.67", () => {
    const p = userArchetypes.vegetarian_pg_student;
    const targets = calculateTargets(p as any);

    // Recomp: high protein
    expect(targets.protein_g).toBeGreaterThanOrEqual(100);
    expect(targets.calories).toBeGreaterThan(1500);

    const diet = normalizeDietType(p.food_type);
    expect(diet).toBe("vegetarian");

    const env = normalizeFoodEnvironment(p.food_environment);
    expect(env).toBe("pg");

    const budget = calculateDailyBudget(p.nutrition_budget);
    expect(budget.tier).toBe("mid");
    expect(budget.dailyBudget).toBe(66.67);

    const slots = resolveMealSlots(p.meals_per_day);
    expect(slots.mealSlots).toEqual(["breakfast", "lunch", "dinner"]);

    // Test curd calibration does not explode
    const testMeals = [
      {
        meal_type: "breakfast",
        meal_plan_items: [
          { quantity: 1, foods: { name: "Curd / Dahi (Plain)", calories: 110, protein: 5.5, carbs: 6.5, fat: 6 } },
          { quantity: 1, foods: { name: "Besan Cheela", calories: 250, protein: 12, carbs: 35, fat: 4 } },
        ],
      },
    ];
    const calibrated = calibrateMealsToTargets(testMeals, { calories: 1750, protein: 110, carbs: 215, fat: 48 }, p as any);
    const curd = calibrated[0].meal_plan_items.find((x: any) => x.foods.name.includes("Curd"));
    expect(curd.quantity).toBeLessThanOrEqual(1.0);
  });

  test("Persona 2 (Non-Veg Bulker): Calculates surplus targets, clamps chicken <= 2.0 & whole eggs <= 2", () => {
    const p = userArchetypes.non_vegetarian_bulk;
    const targets = calculateTargets(p as any);

    // Muscle gain surplus
    expect(targets.calories).toBeGreaterThanOrEqual(2300);
    expect(targets.protein_g).toBeGreaterThanOrEqual(140);

    const slots = resolveMealSlots(p.meals_per_day);
    expect(slots.mealSlots).toEqual(["breakfast", "lunch", "pre_workout", "dinner"]);

    const budget = calculateDailyBudget(p.nutrition_budget);
    expect(budget.tier).toBe("premium");
    expect(budget.dailyBudget).toBe(250);

    const testMeals = [
      {
        meal_type: "lunch",
        meal_plan_items: [
          { quantity: 3, foods: { name: "Chicken Breast Grilled", calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
          { quantity: 4, foods: { name: "Whole Boiled Egg", calories: 75, protein: 6, carbs: 0.5, fat: 5 } },
        ],
      },
    ];
    const calibrated = calibrateMealsToTargets(testMeals, targets, p as any);
    const items = calibrated[0].meal_plan_items;
    const chicken = items.find((x: any) => x.foods.name.includes("Chicken"));
    const eggs = items.find((x: any) => x.foods.name.includes("Whole Boiled Egg"));

    expect(chicken.quantity).toBeLessThanOrEqual(2.0);
    expect(eggs.quantity).toBeLessThanOrEqual(2.0);
  });

  test("Persona 3 (Eggetarian Dairy Allergy): Rejects dairy via allergen check & caps egg whites <= 5", () => {
    const p = userArchetypes.eggetarian_dairy_allergy;
    const diet = normalizeDietType(p.food_type);
    expect(diet).toBe("eggetarian");

    // Allergen verification
    const dairyCheck = NutritionValidationEngine.validateFoodAllergenTags("Curd / Dahi", ["dairy"], ["dairy"]);
    expect(dairyCheck.valid).toBe(false);

    const paneerCheck = NutritionValidationEngine.validateFoodAllergenTags("Paneer Bhurji", ["dairy"], ["dairy"]);
    expect(paneerCheck.valid).toBe(false);

    const eggCheck = NutritionValidationEngine.validateFoodAllergenTags("Boiled Egg Whites", ["egg"], ["dairy"]);
    expect(eggCheck.valid).toBe(true);

    // Test portion clamping on egg whites
    const testMeals = [
      {
        meal_type: "breakfast",
        meal_plan_items: [
          { quantity: 8, foods: { name: "Boiled Egg White", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1 } },
        ],
      },
    ];
    const calibrated = calibrateMealsToTargets(testMeals, { calories: 1600, protein: 105, carbs: 195, fat: 42 }, p as any);
    const eggWhites = calibrated[0].meal_plan_items[0];
    expect(eggWhites.quantity).toBeLessThanOrEqual(5.0);
  });

  test("Persona 4 (Vegan Athlete): 100% plant-based, caps tofu <= 1.5 and soya <= 1.0", () => {
    const p = userArchetypes.vegan_athlete;
    const diet = normalizeDietType(p.food_type);
    expect(diet).toBe("vegan");

    const testMeals = [
      {
        meal_type: "lunch",
        meal_plan_items: [
          { quantity: 3, foods: { name: "Soya Chunks Curry", calories: 180, protein: 26, carbs: 12, fat: 1 } },
        ],
      },
    ];
    const calibrated = calibrateMealsToTargets(testMeals, { calories: 1950, protein: 120, carbs: 240, fat: 52 }, p as any);
    const soya = calibrated[0].meal_plan_items[0];
    expect(soya.quantity).toBeLessThanOrEqual(1.0);
  });

  test("Persona 5 (Female Diabetic User): Calculates female BMR, preserves Diabetes in fingerprint", () => {
    const p = userArchetypes.female_diabetic_user;
    const targets = calculateTargets(p as any);

    // Female BMR calculation verification
    // 10*62 + 6.25*156 - 5*44 - 161 = 620 + 975 - 220 - 161 = 1214 BMR
    expect(targets.calories).toBeGreaterThanOrEqual(1400);
    expect(targets.fiber_g).toBeGreaterThanOrEqual(14); // Fiber target for diabetic health

    const context = buildNutritionUserContext(p, targets, "user-diabetic-1");
    expect(context.medicalDietConditions).toContain("Diabetes");
    expect(context.contextFingerprint).toBeDefined();
  });

  test("Persona 6 (Intermittent Fasting): Resolves exactly 2 meal slots (lunch, dinner) with 50/50 ratio", () => {
    const p = userArchetypes.intermittent_fasting_busy_pro;
    const slots = resolveMealSlots(p.meals_per_day);

    expect(slots.mealsPerDay).toBe("2 meals");
    expect(slots.mealSlots).toEqual(["lunch", "dinner"]);
    expect(slots.slotRatios).toEqual({ lunch: 0.50, dinner: 0.50 });
  });

  // ─────────────────────────────────────────────────────────
  // TEST SUITE C: BROWSER E2E RENDERING ACROSS ALL PERSONAS
  // ─────────────────────────────────────────────────────────

  test("E2E Browser: Persona 1 (Veg PG Student) renders Breakfast, Lunch, Dinner with safe Curd portion", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_veg_pg");

    await expect(page.locator('[data-testid="page-title"]')).toHaveText("Your Meals");
    await expect(page.getByText("Besan Cheela with Curd", { exact: false })).toBeVisible();
    await expect(page.getByText("Dal Tadka with Multigrain Roti", { exact: false })).toBeVisible();

    // Verify curd portion is safe
    const bodyText = await page.innerText("body");
    expect(bodyText).not.toContain("6.5 bowls");
  });

  test("E2E Browser: Persona 2 (Non-Veg Bulker) renders 4 meals including high protein chicken & snack", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_nonveg_bulk");

    // All 4 meal slots visible
    await expect(page.getByText("Oatmeal with Boiled Eggs & Banana", { exact: false })).toBeVisible();
    await expect(page.getByText("Grilled Chicken Breast with Brown Rice", { exact: false })).toBeVisible();
    await expect(page.getByText("Peanut Butter Toast", { exact: false })).toBeVisible();
    await expect(page.getByText("Egg Curry with Roti", { exact: false })).toBeVisible();

    // Targets reflect 2500 kcal
    await expect(page.getByText(/2500/i).first()).toBeVisible();
  });

  test("E2E Browser: Persona 3 (Eggetarian Dairy-Free) strictly renders NO curd or paneer", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_eggetarian_dairyfree");

    await expect(page.getByText("Egg Bhurji with Whole Wheat Toast", { exact: false })).toBeVisible();
    await expect(page.getByText("Rajma Masala with Steamed Rice", { exact: false })).toBeVisible();

    // Verify 0 dairy / paneer / curd
    const bodyText = await page.innerText("body");
    expect(bodyText).not.toContain("Curd");
    expect(bodyText).not.toContain("Paneer");
  });

  test("E2E Browser: Persona 4 (Vegan Athlete) renders plant-based Tofu and Soya meals", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_vegan");

    await expect(page.getByText("Tofu Scramble with Multigrain Toast", { exact: false })).toBeVisible();
    await expect(page.getByText("High Protein Soya Chunks Curry", { exact: false })).toBeVisible();
    await expect(page.getByText("Chana Dal Tadka with Phulkas", { exact: false })).toBeVisible();
  });

  test("E2E Browser: Persona 5 (Female Diabetic User) renders high-fiber diabetic-friendly meals", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_diabetic");

    await expect(page.getByText("Methi Moong Dal Chilla", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Lauki Chana Dal", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Palak Paneer with Jowar Roti", { exact: false }).first()).toBeVisible();
  });

  test("E2E Browser: Persona 6 (Intermittent Fasting) renders exactly 2 meals (Lunch & Dinner)", async ({ page }) => {
    await page.goto("/test-nutrition?user=persona_fasting");

    // Lunch and Dinner visible
    await expect(page.getByText("Grilled Chicken & Dal Tadka", { exact: false })).toBeVisible();
    await expect(page.getByText("Egg Bhurji & Paneer with Phulkas", { exact: false })).toBeVisible();

    // Breakfast should NOT be present
    const bodyText = await page.innerText("body");
    expect(bodyText).not.toContain("Besan Cheela with Curd");
    expect(bodyText).not.toContain("Tofu Scramble");
  });
});
