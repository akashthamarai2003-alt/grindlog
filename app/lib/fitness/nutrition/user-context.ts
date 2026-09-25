import crypto from "crypto";
import type { FitnessGoal } from "./types";

export type NormalizedDiet = "vegetarian" | "vegan" | "eggetarian" | "non_vegetarian";
export type NormalizedEnvironment = "pg" | "hostel" | "home" | "office/canteen" | "i_cook" | "mixed";
export type NormalizedMealSlot = "breakfast" | "lunch" | "dinner" | "pre_workout" | "post_workout" | "snack";

export interface NutritionUserContext {
  userId: string;
  diet: NormalizedDiet;
  dietLabel: string;
  environment: NormalizedEnvironment;
  isCoreProvided: boolean; // PG, Hostel, Home, Office/Canteen provide base meals (₹0)

  // Biometrics & Goals
  age: number;
  gender: string;
  height: number;
  weight: number;
  targetWeight: number;
  goal: string;
  activityLevel: string;

  // Daily Targets
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTarget: number;

  // Budget (Genuine out-of-pocket budget, NO fake floors)
  budgetTier: "low" | "mid" | "high" | "premium";
  budgetStr: string;
  monthlyBudget: number;
  dailyBudget: number;

  // Meals & Schedule
  mealsPerDay: "2 meals" | "3 meals" | "4 meals" | "5+ meals";
  mealSlots: NormalizedMealSlot[];
  slotRatios: Record<string, number>;

  // Preferences & Restrictions
  availableFoods: string[];
  dislikedFoods: string[];
  avoidedFoods: string[];
  allergies: string[];
  medicalDietConditions: string[];

  // Schedule & Timezone
  wakeTime: string | null;
  workoutTime: string | null;
  sleepTime: string | null;
  timezone: string;

  // Deterministic Fingerprint
  contextFingerprint: string;
}

export function normalizeDietType(rawDiet?: string | null, rawFoodType?: string | null): NormalizedDiet {
  const combined = `${rawDiet || ""} ${rawFoodType || ""}`.toLowerCase().trim();
  if (combined.includes("vegan")) return "vegan";
  if (
    combined.includes("non") ||
    combined.includes("meat") ||
    combined.includes("chicken") ||
    combined.includes("fish") ||
    combined.includes("non-veg")
  ) {
    return "non_vegetarian";
  }
  if (combined.includes("egg") || combined.includes("eggetarian")) {
    return "eggetarian";
  }
  return "vegetarian";
}

export function normalizeFoodEnvironment(rawEnv?: string | null): NormalizedEnvironment {
  const env = (rawEnv || "").toLowerCase().trim();
  if (env.includes("pg")) return "pg";
  if (env.includes("hostel")) return "hostel";
  if (env.includes("i cook") || env.includes("cook") || env.includes("self")) return "i_cook";
  if (env.includes("canteen") || env.includes("office")) return "office/canteen";
  if (env.includes("mixed")) return "mixed";
  return "home";
}

export function parseStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item || "").trim())
      .filter((s) => s.length > 0 && !["none", "nil", "n/a", "na", "no"].includes(s.toLowerCase()));
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,;\n|]+/)
      .map((item) => item.trim())
      .filter((s) => s.length > 0 && !["none", "nil", "n/a", "na", "no"].includes(s.toLowerCase()));
  }
  return [];
}

export function calculateDailyBudget(
  budgetStr?: string | number | null,
  profile?: any
): {
  tier: "low" | "mid" | "high" | "premium";
  monthlyBudget: number;
  dailyBudget: number;
} {
  // 1. Check if an explicit monthly budget number is available in profile or input
  let explicitMonthly: number | null = null;
  if (typeof budgetStr === "number" && !isNaN(budgetStr) && budgetStr > 0) {
    explicitMonthly = budgetStr;
  } else if (profile?.actualMonthlyBudget && typeof profile.actualMonthlyBudget === "number") {
    explicitMonthly = profile.actualMonthlyBudget;
  } else if (profile?.monthly_budget && typeof profile.monthly_budget === "number") {
    explicitMonthly = profile.monthly_budget;
  } else if (profile?.monthly_food_budget && typeof profile.monthly_food_budget === "number") {
    explicitMonthly = profile.monthly_food_budget;
  }

  const s = String(budgetStr || profile?.nutrition_budget || "").trim();

  if (explicitMonthly !== null && explicitMonthly > 0) {
    const daily = Number((explicitMonthly / 30).toFixed(2));
    let tier: "low" | "mid" | "high" | "premium" = "low";
    if (explicitMonthly <= 1000) tier = "low";
    else if (explicitMonthly <= 2000) tier = "mid";
    else if (explicitMonthly <= 5000) tier = "high";
    else tier = "premium";
    return { tier, monthlyBudget: explicitMonthly, dailyBudget: daily };
  }

  // 2. Parse numbers from string (e.g. "500", "₹500", "750", "₹0–1,000")
  const cleaned = s.replace(/[₹,]/g, "").trim();
  const nums = cleaned.match(/\d+/g)?.map(Number).filter((n) => Number.isFinite(n) && n > 0) ?? [];

  // If a single specific number was provided (e.g. "500", "750", "1500")
  if (nums.length === 1) {
    const monthly = nums[0];
    const daily = Number((monthly / 30).toFixed(2));
    let tier: "low" | "mid" | "high" | "premium" = "low";
    if (monthly <= 1000) tier = "low";
    else if (monthly <= 2000) tier = "mid";
    else if (monthly <= 5000) tier = "high";
    else tier = "premium";
    return { tier, monthlyBudget: monthly, dailyBudget: daily };
  }

  // 3. Handle standard tier ranges
  if (s.includes("0–1,000") || s.includes("0-1,000") || s.includes("0 - 1000") || s.includes("0–1000")) {
    return { tier: "low", monthlyBudget: 1000, dailyBudget: 33.33 };
  }
  if (s.includes("1,000–2,000") || s.includes("1,000-2,000") || s.includes("1000-2000")) {
    return { tier: "mid", monthlyBudget: 2000, dailyBudget: 66.67 };
  }
  if (s.includes("2,000–5,000") || s.includes("2,000-5,000") || s.includes("2000-5000")) {
    return { tier: "high", monthlyBudget: 4500, dailyBudget: 150 };
  }
  if (s.includes("5,000+") || s.includes("5000+")) {
    return { tier: "premium", monthlyBudget: 7500, dailyBudget: 250 };
  }

  if (nums.length > 0) {
    const maxVal = Math.max(...nums);
    const daily = Number((maxVal / 30).toFixed(2));
    let tier: "low" | "mid" | "high" | "premium" = "low";
    if (maxVal <= 1000) tier = "low";
    else if (maxVal <= 2000) tier = "mid";
    else if (maxVal <= 5000) tier = "high";
    else tier = "premium";
    return { tier, monthlyBudget: maxVal, dailyBudget: daily };
  }

  // Default to low tier 1000 / 30 = 33.33
  return { tier: "low", monthlyBudget: 1000, dailyBudget: 33.33 };
}

export function resolveMealSlots(mealsPerDayStr?: string | null): {
  mealsPerDay: "2 meals" | "3 meals" | "4 meals" | "5+ meals";
  mealSlots: NormalizedMealSlot[];
  slotRatios: Record<string, number>;
} {
  const s = (mealsPerDayStr || "").toLowerCase().trim();
  if (s.includes("2")) {
    return {
      mealsPerDay: "2 meals",
      mealSlots: ["lunch", "dinner"],
      slotRatios: { lunch: 0.50, dinner: 0.50 },
    };
  }
  if (s.includes("3")) {
    return {
      mealsPerDay: "3 meals",
      mealSlots: ["breakfast", "lunch", "dinner"],
      slotRatios: { breakfast: 0.30, lunch: 0.40, dinner: 0.30 },
    };
  }
  if (s.includes("5")) {
    return {
      mealsPerDay: "5+ meals",
      mealSlots: ["breakfast", "pre_workout", "lunch", "post_workout", "dinner"],
      slotRatios: {
        breakfast: 0.20,
        pre_workout: 0.15,
        lunch: 0.30,
        post_workout: 0.15,
        dinner: 0.20,
      },
    };
  }
  // Default: 4 meals
  return {
    mealsPerDay: "4 meals",
    mealSlots: ["breakfast", "lunch", "pre_workout", "dinner"],
    slotRatios: {
      breakfast: 0.25,
      lunch: 0.35,
      pre_workout: 0.15,
      dinner: 0.25,
    },
  };
}

export function generateContextFingerprint(context: {
  userId: string;
  diet: string;
  environment: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  monthlyBudget: number;
  mealsPerDay: string;
  allergies: string[];
  medicalDietConditions: string[];
  dislikedFoods: string[];
  avoidedFoods: string[];
  availableFoods: string[];
}): string {
  const payload = [
    context.userId,
    context.diet,
    context.environment,
    context.caloriesTarget,
    context.proteinTarget,
    context.carbsTarget,
    context.fatTarget,
    context.monthlyBudget,
    context.mealsPerDay,
    context.allergies.sort().join(","),
    context.medicalDietConditions.sort().join(","),
    context.dislikedFoods.sort().join(","),
    context.avoidedFoods.sort().join(","),
    context.availableFoods.sort().join(","),
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function buildNutritionUserContext(
  profile: any,
  targets: any,
  userId: string,
  explicitTimezone?: string
): NutritionUserContext {
  const diet = normalizeDietType(profile?.diet_preference, profile?.food_type);
  const environment = normalizeFoodEnvironment(profile?.food_environment);
  const isCoreProvided = ["pg", "hostel", "home", "office/canteen"].includes(environment);

  const dietLabels: Record<NormalizedDiet, string> = {
    vegan: "Vegan (100% Plant-Based: Zero dairy, Zero eggs, Zero meat/fish)",
    vegetarian: "Vegetarian (Lacto-Vegetarian: Plant foods + Paneer/Curd/Milk. Zero eggs, Zero meat/fish)",
    eggetarian: "Eggetarian (Plant foods + Eggs + Paneer/Curd. Strictly Zero chicken, fish, or meat)",
    non_vegetarian: "Non-Vegetarian (Whole foods + Chicken, Fish, Eggs, Paneer, Curd, Grains, Legumes)",
  };

  const budgetInfo = calculateDailyBudget(profile?.nutrition_budget, profile);
  const slotInfo = resolveMealSlots(profile?.meals_per_day);

  const caloriesTarget = Math.round(Number(targets?.calories || 2000));
  const proteinTarget = Math.round(Number(targets?.protein_g ?? targets?.protein ?? 130));
  const carbsTarget = Math.round(Number(targets?.carbs_g ?? targets?.carbs ?? 220));
  const fatTarget = Math.round(Number(targets?.fat_g ?? targets?.fat ?? 55));
  const waterTarget = Math.round(Number(targets?.water_ml || 3000));

  const availableFoods = parseStringList(profile?.available_foods);
  const dislikedFoods = parseStringList(profile?.foods_disliked);
  const avoidedFoods = parseStringList(profile?.foods_avoided);
  const allergies = parseStringList(profile?.food_allergies);
  // "None" is an explicit answer here, unlike the free-text food restriction
  // lists where it means an empty list. Keep it so the safety gate can tell an
  // answered question from an unanswered one.
  const medicalDietConditions = Array.isArray(profile?.nutrition_medical_conditions)
    ? profile.nutrition_medical_conditions.map((value: unknown) => String(value || '').trim()).filter(Boolean)
    : [];

  const timezone = explicitTimezone || profile?.timezone || "Asia/Kolkata";

  const fingerprint = generateContextFingerprint({
    userId,
    diet,
    environment,
    caloriesTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    monthlyBudget: budgetInfo.monthlyBudget,
    mealsPerDay: slotInfo.mealsPerDay,
    allergies,
    medicalDietConditions,
    dislikedFoods,
    avoidedFoods,
    availableFoods,
  });

  return {
    userId,
    diet,
    dietLabel: dietLabels[diet],
    environment,
    isCoreProvided,
    age: Number(profile?.age) || 25,
    gender: profile?.gender || "male",
    height: Number(profile?.height) || 175,
    weight: Number(profile?.weight) || 70,
    targetWeight: Number(profile?.target_weight) || 70,
    goal: profile?.goal || "Improve Fitness",
    activityLevel: profile?.activity_level || "moderate",
    caloriesTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    waterTarget,
    budgetTier: budgetInfo.tier,
    budgetStr: profile?.nutrition_budget || "₹1,000–2,000",
    monthlyBudget: budgetInfo.monthlyBudget,
    dailyBudget: budgetInfo.dailyBudget,
    mealsPerDay: slotInfo.mealsPerDay,
    mealSlots: slotInfo.mealSlots,
    slotRatios: slotInfo.slotRatios,
    availableFoods,
    dislikedFoods,
    avoidedFoods,
    allergies,
    medicalDietConditions,
    wakeTime: profile?.wake_time || null,
    workoutTime: profile?.workout_time || null,
    sleepTime: profile?.sleep_time || null,
    timezone,
    contextFingerprint: fingerprint,
  };
}
