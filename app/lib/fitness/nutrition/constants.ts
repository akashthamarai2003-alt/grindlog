import type {
  GoalConfig,
  MealStructure,
  MealType,
  BudgetTier,
  ParsedBudget,
  FitnessGoal,
} from "./types";

// ─────────────────────────────────────────────────────────
// Goal → Calorie & Macro Configuration
// ─────────────────────────────────────────────────────────

export const GOAL_CONFIGS: Record<string, GoalConfig> = {
  "Lose Fat": {
    calorieAdjustment: -500,
    proteinMultiplier: 2.0,
    carbPercent: 0.35,
    fatPercent: 0.25,
    description: "Moderate calorie deficit to reduce body fat while preserving lean muscle.",
  },
  Cut: {
    calorieAdjustment: -400,
    proteinMultiplier: 2.2,
    carbPercent: 0.40,
    fatPercent: 0.20,
    description: "Controlled deficit preserving muscle mass with higher protein intake.",
  },
  "Build Muscle": {
    calorieAdjustment: 300,
    proteinMultiplier: 2.0,
    carbPercent: 0.45,
    fatPercent: 0.25,
    description: "Lean caloric surplus with high protein to maximize muscle growth.",
  },
  "Gain Weight": {
    calorieAdjustment: 500,
    proteinMultiplier: 1.8,
    carbPercent: 0.50,
    fatPercent: 0.25,
    description: "Aggressive caloric surplus for healthy weight gain.",
  },
  "Lose Fat + Build Muscle": {
    calorieAdjustment: -200,
    proteinMultiplier: 2.2,
    carbPercent: 0.35,
    fatPercent: 0.25,
    description: "Body recomposition — slight deficit with maximum protein for simultaneous fat loss and muscle growth.",
  },
  "Build Strength": {
    calorieAdjustment: 200,
    proteinMultiplier: 2.0,
    carbPercent: 0.45,
    fatPercent: 0.25,
    description: "Moderate surplus fueling strength and power gains.",
  },
  "Improve Fitness": {
    calorieAdjustment: 0,
    proteinMultiplier: 1.6,
    carbPercent: 0.50,
    fatPercent: 0.25,
    description: "Maintenance calories with balanced macros for endurance and overall fitness.",
  },
  Maintain: {
    calorieAdjustment: 0,
    proteinMultiplier: 1.6,
    carbPercent: 0.45,
    fatPercent: 0.30,
    description: "Maintenance calories to sustain current physique and performance.",
  },
};

export const DEFAULT_GOAL_CONFIG: GoalConfig = GOAL_CONFIGS["Maintain"];

// ─────────────────────────────────────────────────────────
// Activity Level → TDEE Multiplier
// ─────────────────────────────────────────────────────────

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  "Mostly sitting": 1.2,
  "Lightly active": 1.375,
  "Moderately active": 1.55,
  "Very active": 1.725,
};

export const DEFAULT_ACTIVITY_MULTIPLIER = 1.375;

// ─────────────────────────────────────────────────────────
// Calorie Safety Clamps
// ─────────────────────────────────────────────────────────

export const MIN_CALORIES_FEMALE = 1200;
export const MIN_CALORIES_MALE = 1500;
export const MAX_CALORIES = 5000;

// ─────────────────────────────────────────────────────────
// Meal Structure by meals_per_day
// ─────────────────────────────────────────────────────────

export const MEAL_STRUCTURES: Record<string, MealStructure> = {
  "2 meals": {
    slots: [
      { name: "Lunch", type: "lunch", caloriePercent: 0.55 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.45 },
    ],
  },
  "3 meals": {
    slots: [
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.25 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.40 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.35 },
    ],
  },
  "4 meals": {
    slots: [
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.20 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.35 },
      { name: "Snack", type: "snack", caloriePercent: 0.15 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.30 },
    ],
  },
  "5+ meals": {
    slots: [
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.18 },
      { name: "Pre-Workout", type: "pre_workout", caloriePercent: 0.12 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.30 },
      { name: "Post-Workout", type: "post_workout", caloriePercent: 0.12 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.28 },
    ],
  },
};

export const DEFAULT_MEAL_STRUCTURE = MEAL_STRUCTURES["3 meals"];

// ─────────────────────────────────────────────────────────
// Core Meal Types (provided by PG/Hostel/Home/Canteen)
// ─────────────────────────────────────────────────────────

export const CORE_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const PROVIDED_ENVIRONMENTS = new Set([
  "PG",
  "Hostel",
  "Home",
  "Office/Canteen",
]);

export const SELF_COOK_ENVIRONMENTS = new Set(["I Cook", "Mixed"]);

export function getEnvironmentLabel(env: string): string {
  switch (env) {
    case "PG": return "PG-provided";
    case "Hostel": return "Hostel-provided";
    case "Home": return "Home-provided";
    case "Office/Canteen": return "Canteen-provided";
    case "I Cook": return "Self-cooked";
    case "Mixed": return "Mixed (some provided, some self-cooked)";
    default: return env || "Planned";
  }
}

export function getCoreMealLabel(env: string): string {
  switch (env) {
    case "PG": return "PG-provided core meal (free)";
    case "Hostel": return "Hostel-provided core meal (free)";
    case "Home": return "Home-provided core meal (free)";
    case "Office/Canteen": return "Canteen-provided core meal (free)";
    default: return "";
  }
}

/** Estimated protein from a typical Indian provided core meal. */
export const PROVIDED_MEAL_PROTEIN_ESTIMATE = 10; // ~10g from dal/rice/roti/sabzi
export const PROVIDED_MEAL_CALORIE_ESTIMATE = 350; // typical PG/hostel portion

// ─────────────────────────────────────────────────────────
// Budget Parsing & Tiers
// ─────────────────────────────────────────────────────────

export function parseBudget(budgetStr: string | null): ParsedBudget {
  if (!budgetStr) {
    return { min: 0, max: 1000, tier: "low", isOpenEnded: false, dailyBudget: 33 };
  }

  const cleaned = budgetStr.replace(/[₹,]/g, "").trim();
  const numbers = cleaned.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  const isOpenEnded = cleaned.includes("+");

  if (numbers.length === 0) {
    return { min: 0, max: 1000, tier: "low", isOpenEnded: false, dailyBudget: 33 };
  }

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  let tier: BudgetTier;
  if (max <= 1000) tier = "low";
  else if (max <= 2000) tier = "mid";
  else if (max <= 5000) tier = "high";
  else tier = "premium";

  return {
    min,
    max,
    tier,
    isOpenEnded,
    dailyBudget: Math.round(max / 30),
  };
}

// ─────────────────────────────────────────────────────────
// Diet Type Compatibility
// ─────────────────────────────────────────────────────────

/** Maps user diet type to compatible food `diet_type` values in the database. */
export function getCompatibleDietTypes(userDiet: string): string[] {
  const diet = userDiet.toLowerCase().trim();

  if (diet.includes("non-veg") || diet.includes("non veg") || diet === "non-vegetarian") {
    return ["veg", "vegan", "eggetarian", "non-veg"];
  }
  if (diet.includes("eggetarian") || diet.includes("eggitarian")) {
    return ["veg", "vegan", "eggetarian"];
  }
  if (diet.includes("vegan")) {
    return ["vegan"];
  }
  // Default: vegetarian
  return ["veg", "vegan"];
}

// ─────────────────────────────────────────────────────────
// Allergy / Dislike Parsing
// ─────────────────────────────────────────────────────────

/** Parse comma-separated restriction strings into normalized keywords. */
export function parseRestrictions(text: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s !== "none" && s !== "nil" && s !== "na" && s !== "n/a");
}

// ─────────────────────────────────────────────────────────
// Protein Prioritization by Diet Type
// Sorted by protein-per-rupee (cost-effectiveness)
// ─────────────────────────────────────────────────────────

export const PRIORITY_PROTEINS: Record<string, string[]> = {
  "Non-Vegetarian": [
    "Boiled Egg (Whole)",
    "Boiled Egg White",
    "Chicken Breast (Grilled / Cooked)",
    "Chicken Breast (Raw)",
    "Soya Chunks (Raw / Dry)",
    "Curd / Dahi",
    "Toned Milk",
    "Fresh Paneer (Raw)",
    "Fish Curry (Rohu / Indian Carp)",
    "Natural Peanut Butter",
    "Roasted Chana (Dry Chickpeas)",
  ],
  Eggetarian: [
    "Boiled Egg (Whole)",
    "Boiled Egg White",
    "Soya Chunks (Raw / Dry)",
    "Curd / Dahi",
    "Toned Milk",
    "Fresh Paneer (Raw)",
    "Low Fat Paneer",
    "Natural Peanut Butter",
    "Roasted Chana (Dry Chickpeas)",
    "Tofu (Firm)",
  ],
  Vegetarian: [
    "Soya Chunks (Raw / Dry)",
    "Curd / Dahi",
    "Toned Milk",
    "Fresh Paneer (Raw)",
    "Low Fat Paneer",
    "Natural Peanut Butter",
    "Roasted Chana (Dry Chickpeas)",
    "Tofu (Firm)",
    "Moong Dal (Cooked)",
    "Greek Yogurt",
  ],
  Vegan: [
    "Soya Chunks (Raw / Dry)",
    "Tofu (Firm)",
    "Natural Peanut Butter",
    "Roasted Chana (Dry Chickpeas)",
    "Soy Milk",
    "Moong Sprouts",
    "Lentils / Dal (Cooked)",
    "Chickpea Curry",
    "Pumpkin Seeds",
    "Almonds",
  ],
};

// ─────────────────────────────────────────────────────────
// Serving Size → Grams Conversion Helpers
// ─────────────────────────────────────────────────────────

const SERVING_GRAMS_PATTERNS: Array<[RegExp, (match: RegExpMatchArray) => number]> = [
  [/(\d+)\s*g\b/i, (m) => Number(m[1])],
  [/(\d+)\s*ml\b/i, (m) => Number(m[1])],
  [/(\d+)\s*pieces?\s*\((\d+)g\)/i, (m) => Number(m[2])],
  [/1\s*(?:bowl|cup)\s*(?:cooked\s*)?\((\d+)g\)/i, (m) => Number(m[1])],
  [/1\s*(?:scoop|slice|piece|jar|pack)\s*\((\d+)g\)/i, (m) => Number(m[1])],
  [/(\d+)\s*(?:slices?|pieces?)\s*\+?\s*\d*g?\s*(?:PB)?\s*$/i, () => 60],
  [/1\s*(?:medium|large|small)\s*\((\d+)g\)/i, (m) => Number(m[1])],
  [/(\d+)g\s*(?:raw|cooked|dry|drained)?$/i, (m) => Number(m[1])],
];

export function parseServingGrams(servingSize: string): number {
  for (const [pattern, extractor] of SERVING_GRAMS_PATTERNS) {
    const match = servingSize.match(pattern);
    if (match) {
      const grams = extractor(match);
      if (Number.isFinite(grams) && grams > 0) return grams;
    }
  }
  return 100; // default fallback
}

// ─────────────────────────────────────────────────────────
// Retail Packaging → Grocery Unit Conversion
// ─────────────────────────────────────────────────────────

export type RetailUnit = {
  unit: string;
  gramsPerUnit: number;
  minPurchase: number;
};

export const CATEGORY_RETAIL_UNITS: Record<string, RetailUnit> = {
  eggs: { unit: "pieces", gramsPerUnit: 50, minPurchase: 6 },
  milk: { unit: "liters", gramsPerUnit: 1000, minPurchase: 1 },
  "soy milk": { unit: "cartons", gramsPerUnit: 1000, minPurchase: 1 },
  curd: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  yogurt: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  paneer: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.2 },
  chicken: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  fish: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  "peanut butter": { unit: "jars", gramsPerUnit: 1000, minPurchase: 1 },
  oats: { unit: "packs", gramsPerUnit: 1000, minPurchase: 1 },
  "soya chunks": { unit: "packs", gramsPerUnit: 200, minPurchase: 1 },
  chana: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  rice: { unit: "kg", gramsPerUnit: 1000, minPurchase: 1 },
  bread: { unit: "packs", gramsPerUnit: 400, minPurchase: 1 },
  banana: { unit: "pieces", gramsPerUnit: 120, minPurchase: 6 },
  apple: { unit: "pieces", gramsPerUnit: 180, minPurchase: 4 },
  nuts: { unit: "packs", gramsPerUnit: 250, minPurchase: 1 },
  seeds: { unit: "packs", gramsPerUnit: 200, minPurchase: 1 },
  tofu: { unit: "packs", gramsPerUnit: 200, minPurchase: 1 },
  default: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
};

export function getRetailUnit(foodName: string, category: string): RetailUnit {
  const name = foodName.toLowerCase();
  for (const [key, unit] of Object.entries(CATEGORY_RETAIL_UNITS)) {
    if (key !== "default" && name.includes(key)) return unit;
  }
  const cat = category.toLowerCase();
  if (cat.includes("fruit")) return { unit: "pieces", gramsPerUnit: 150, minPurchase: 6 };
  if (cat.includes("dairy")) return { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 };
  return CATEGORY_RETAIL_UNITS.default;
}

// ─────────────────────────────────────────────────────────
// Prep Instruction Templates
// ─────────────────────────────────────────────────────────

export const PREP_TEMPLATES: Record<string, Record<string, string>> = {
  PG: {
    breakfast: "Have with your PG breakfast. Keep add-ons in your room for quick protein boost.",
    lunch: "Eat alongside your PG lunch dal-rice. Add the protein item separately.",
    dinner: "Pair with your PG dinner roti-sabzi. Keep curd/eggs ready in your room.",
    snack: "Keep in your room. No cooking needed — ready to eat between meals.",
    pre_workout: "Eat 30-45 min before workout. No cooking required.",
    post_workout: "Have within 30 min after workout for recovery.",
  },
  Hostel: {
    breakfast: "Have with hostel breakfast. Store add-ons in your hostel room — no kitchen needed.",
    lunch: "Eat with your hostel mess lunch. Soak soya chunks in hot water from kettle if needed.",
    dinner: "Pair with hostel dinner. Keep peanut butter, chana, or eggs handy in your room.",
    snack: "Room-friendly snack — no cooking. Keep sealed containers for freshness.",
    pre_workout: "Quick energy before training. Grab from your room stash.",
    post_workout: "Mix oats with milk/soy milk in a shaker for quick recovery.",
  },
  "I Cook": {
    breakfast: "Prep time ~10 min. Cook eggs in 1 tsp oil or make oats with warm milk.",
    lunch: "Prep time ~25 min. Grill or pan-fry protein, steam rice, heat dal separately.",
    dinner: "Prep time ~20 min. Use minimal oil. Season with salt, pepper, turmeric.",
    snack: "No cooking. Pre-portion nuts, chana, or fruit for the week.",
    pre_workout: "Quick grab — banana + peanut butter, no cooking needed.",
    post_workout: "Blend or mix oats with milk/curd for fast absorption.",
  },
  Home: {
    breakfast: "Have with your home breakfast. Add protein item to the regular meal.",
    lunch: "Pair with home-cooked lunch. Request extra dal/curd for protein.",
    dinner: "Add to your regular home dinner. Ask for paneer/egg dish if possible.",
    snack: "Keep in your room or kitchen shelf. Ready to eat.",
    pre_workout: "Quick pre-workout bite — 30-45 min before training.",
    post_workout: "Have soon after workout for recovery support.",
  },
  "Office/Canteen": {
    breakfast: "Have before leaving for office, or carry add-on to eat at desk.",
    lunch: "Eat with your canteen lunch. Carry protein add-on from home if needed.",
    dinner: "Make at home after work. Keep ingredients prepped on weekends.",
    snack: "Office-desk friendly — keep peanuts, chana, or fruit at your workstation.",
    pre_workout: "Have before evening workout. Carry in your gym bag.",
    post_workout: "Quick recovery after workout — mix at home or carry in shaker.",
  },
  Mixed: {
    breakfast: "Cook at home or eat provided breakfast + protein add-on.",
    lunch: "If eating out, choose dal-rice-sabzi + protein. If cooking, follow the plan.",
    dinner: "Cook a simple protein-rich dinner. Use minimal oil and fresh ingredients.",
    snack: "Keep portable snacks ready — works for office, gym, or home.",
    pre_workout: "Quick fuel before training. Easy grab-and-go options.",
    post_workout: "Recovery food within 30 min. Mix or eat as-is.",
  },
};

export function getPrepInstruction(env: string, mealType: string): string {
  const envTemplates = PREP_TEMPLATES[env] || PREP_TEMPLATES["Mixed"];
  return envTemplates[mealType] || envTemplates["snack"] || "Follow the planned portions.";
}

// ─────────────────────────────────────────────────────────
// Water Target Calculation
// ─────────────────────────────────────────────────────────

export function calculateWaterTarget(
  weightKg: number,
  activityLevel: string,
  goal: string,
): number {
  let base = Math.round(weightKg * 35); // 35ml per kg
  if (activityLevel === "Very active") base += 500;
  else if (activityLevel === "Moderately active") base += 250;
  if (goal === "Lose Fat" || goal === "Cut") base += 250;
  return Math.min(Math.max(base, 2000), 4500); // clamp 2L - 4.5L
}

// ─────────────────────────────────────────────────────────
// Meal Timing from Schedule
// ─────────────────────────────────────────────────────────

export function getMealTime(
  mealType: MealType,
  schedule: { wake?: string | null; workout?: string | null; work?: string | null; sleep?: string | null },
): string {
  const wake = schedule.wake || "7:00";
  const workout = schedule.workout;
  const work = schedule.work;

  switch (mealType) {
    case "breakfast": return formatTimeOffset(wake, 30);
    case "lunch": return work ? formatTimeOffset(work, 240) : "1:00 PM";
    case "dinner": return schedule.sleep ? formatTimeOffset(schedule.sleep, -120) : "8:30 PM";
    case "pre_workout": return workout ? formatTimeOffset(workout, -45) : "5:00 PM";
    case "post_workout": return workout ? formatTimeOffset(workout, 75) : "6:30 PM";
    case "snack": return "4:00 PM";
    default: return "Any time";
  }
}

function formatTimeOffset(timeStr: string, offsetMinutes: number): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  let totalMinutes = hours * 60 + minutes + offsetMinutes;
  if (totalMinutes < 0) totalMinutes += 1440;
  totalMinutes = totalMinutes % 1440;

  let h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const amPm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  return `${h}:${m.toString().padStart(2, "0")} ${amPm}`;
}

// ─────────────────────────────────────────────────────────
// Guidance Generator (Deterministic — no AI)
// ─────────────────────────────────────────────────────────

export function generateGuidance(
  goal: string,
  dietType: string,
  env: string,
  proteinTarget: number,
  calories: number,
  budgetTier: BudgetTier,
): string {
  const parts: string[] = [];

  parts.push(
    `This plan is built exclusively with 100% natural whole foods — zero artificial protein powders or supplements.`,
  );

  if (PROVIDED_ENVIRONMENTS.has(env)) {
    parts.push(
      `Since your core meals are ${env}-provided, the add-ons focus on bridging your daily protein gap of ~${Math.max(0, proteinTarget - 30)}g that typical provided meals miss.`,
    );
  } else {
    parts.push(
      `All meals are designed for you to cook or prepare yourself with simple, affordable ingredients.`,
    );
  }

  if (goal === "Lose Fat" || goal === "Cut") {
    parts.push(
      `Limit added sugar, sugary drinks, deep-fried foods, and frequent fast food. Use measured cooking oil, prioritise protein and vegetables, and keep occasional treats within your ${calories} kcal target.`,
    );
  } else if (goal === "Build Muscle" || goal === "Gain Weight") {
    parts.push(
      `Focus on hitting your ${proteinTarget}g daily protein target consistently. Don't skip meals — every gram counts for muscle recovery and growth.`,
    );
  }

  if (budgetTier === "low") {
    parts.push(
      `This plan prioritises the most cost-effective protein sources to maximize nutrition within your budget.`,
    );
  }

  return parts.join(" ");
}

// ─────────────────────────────────────────────────────────
// Banned / Excluded Foods (never appear in plans)
// ─────────────────────────────────────────────────────────

export const BANNED_FOOD_PATTERNS = [
  /whey/i,
  /casein/i,
  /protein powder/i,
  /mass gainer/i,
  /plant protein.*powder/i,
  /supplement/i,
  /bcaa/i,
  /creatine/i,
  /pre.?workout.*supplement/i,
];

export function isBannedFood(name: string): boolean {
  return BANNED_FOOD_PATTERNS.some((p) => p.test(name));
}
