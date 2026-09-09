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
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.30 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.40 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.30 },
    ],
  },
  "4 meals": {
    slots: [
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.25 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.35 },
      { name: "Pre-Workout", type: "pre_workout", caloriePercent: 0.15 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.25 },
    ],
  },
  "5+ meals": {
    slots: [
      { name: "Breakfast", type: "breakfast", caloriePercent: 0.20 },
      { name: "Pre-Workout", type: "pre_workout", caloriePercent: 0.12 },
      { name: "Lunch", type: "lunch", caloriePercent: 0.30 },
      { name: "Post-Workout", type: "post_workout", caloriePercent: 0.13 },
      { name: "Dinner", type: "dinner", caloriePercent: 0.25 },
    ],
  },
};

export const DEFAULT_MEAL_STRUCTURE = MEAL_STRUCTURES["4 meals"];

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

export function getCoreMealLabel(env: string, mealType?: string): string {
  const type = (mealType || "").toLowerCase();
  const isBreakfast = type.includes("breakfast");
  const isLunch = type.includes("lunch");
  const isDinner = type.includes("dinner");

  switch (env) {
    case "PG":
    case "Hostel":
      if (isBreakfast) return "Mess Breakfast (Poha / Upma / Idli & Sambar)";
      if (isLunch) return "Mess Lunch (Rice, Dal Tadka & Sabzi)";
      if (isDinner) return "Mess Dinner (Phulkas, Dal & Sabzi)";
      return "Mess Core Meal (Rice, Dal & Sabzi)";
    case "Home":
      if (isBreakfast) return "Homestyle Breakfast (Poha / Idli / Upma)";
      if (isLunch) return "Homestyle Lunch (Rice, Dal & Sabzi)";
      if (isDinner) return "Homestyle Dinner (Phulkas, Dal & Sabzi)";
      return "Homestyle Core Meal (Rice, Dal & Sabzi)";
    case "Office/Canteen":
      if (isBreakfast) return "Canteen Breakfast (Poha / Idli & Sambar)";
      if (isLunch) return "Canteen Lunch Thali (Rice, Dal & Sabzi)";
      if (isDinner) return "Canteen Dinner Thali";
      return "Canteen Core Meal (Rice, Dal & Sabzi)";
    default:
      if (isBreakfast) return "Breakfast Plate";
      if (isLunch) return "Lunch Thali (Rice, Dal & Sabzi)";
      if (isDinner) return "Dinner Thali (Phulkas, Dal & Sabzi)";
      return "Balanced Meal (Rice, Dal & Sabzi)";
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
// Daily Safe Intake & Practical Serving Limits
// Prevents overconsumption (e.g. Soya Chunks cap at 50g dry/day)
// ─────────────────────────────────────────────────────────

export interface FoodServingLimit {
  maxDailyServings: number;
  minMealServings: number;
  maxMealServings: number;
  preferredSlots?: string[];
}

export const DAILY_FOOD_CAPS: Record<string, FoodServingLimit> = {
  "soya chunk": { maxDailyServings: 1.0, minMealServings: 0.5, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "soya": { maxDailyServings: 1.0, minMealServings: 0.5, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "boiled egg white": { maxDailyServings: 6.0, minMealServings: 2.0, maxMealServings: 4.0, preferredSlots: ["Breakfast", "Dinner", "Snack"] },
  "boiled egg": { maxDailyServings: 4.0, minMealServings: 2.0, maxMealServings: 3.0, preferredSlots: ["Breakfast", "Dinner"] },
  "egg omelette": { maxDailyServings: 1.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast"] },
  "scrambled egg": { maxDailyServings: 1.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast"] },
  "egg bhurji": { maxDailyServings: 1.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast", "Dinner"] },
  "curd": { maxDailyServings: 2.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "dahi": { maxDailyServings: 2.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "toned milk": { maxDailyServings: 2.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast", "Snack", "Dinner"] },
  "whole milk": { maxDailyServings: 1.5, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast", "Snack"] },
  "milk": { maxDailyServings: 2.0, minMealServings: 1.0, maxMealServings: 1.0, preferredSlots: ["Breakfast", "Snack", "Dinner"] },
  "paneer": { maxDailyServings: 1.0, minMealServings: 0.5, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "tofu": { maxDailyServings: 1.0, minMealServings: 0.5, maxMealServings: 1.0, preferredSlots: ["Lunch", "Dinner"] },
  "roasted chana": { maxDailyServings: 1.5, minMealServings: 1.0, maxMealServings: 1.5, preferredSlots: ["Snack", "Dinner"] },
  "peanut butter": { maxDailyServings: 1.0, minMealServings: 0.5, maxMealServings: 1.0, preferredSlots: ["Breakfast", "Snack"] },
  "chicken breast": { maxDailyServings: 1.5, minMealServings: 1.0, maxMealServings: 1.5, preferredSlots: ["Lunch", "Dinner"] },
  "fish": { maxDailyServings: 1.5, minMealServings: 1.0, maxMealServings: 1.5, preferredSlots: ["Lunch", "Dinner"] },
};

export function getFoodServingLimit(foodName: string): FoodServingLimit {
  const lower = foodName.toLowerCase();
  for (const [key, limit] of Object.entries(DAILY_FOOD_CAPS)) {
    if (lower.includes(key)) return limit;
  }
  return { maxDailyServings: 2.0, minMealServings: 0.5, maxMealServings: 2.0 };
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
  egg: { unit: "pieces", gramsPerUnit: 50, minPurchase: 6 },
  eggs: { unit: "pieces", gramsPerUnit: 50, minPurchase: 6 },
  milk: { unit: "liters", gramsPerUnit: 1000, minPurchase: 1 },
  "soy milk": { unit: "cartons", gramsPerUnit: 1000, minPurchase: 1 },
  curd: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  dahi: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  yogurt: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  paneer: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.2 },
  chicken: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  fish: { unit: "kg", gramsPerUnit: 1000, minPurchase: 0.5 },
  "peanut butter": { unit: "jars", gramsPerUnit: 1000, minPurchase: 1 },
  oats: { unit: "packs", gramsPerUnit: 1000, minPurchase: 1 },
  "soya chunks": { unit: "packs", gramsPerUnit: 200, minPurchase: 1 },
  soya: { unit: "packs", gramsPerUnit: 200, minPurchase: 1 },
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

// ─────────────────────────────────────────────────────────
// Authentic Indian Meal Recipes & Templates
// ─────────────────────────────────────────────────────────

export interface RecipeItemDef {
  name: string;
  defaultServing: number;
  servingLabel: string;
  isStaple?: boolean;
  isProtein?: boolean;
}

export interface AuthenticMealRecipe {
  id: string;
  name: string;
  type: MealType;
  dietTypes: string[]; // 'veg', 'vegan', 'eggetarian', 'non-veg'
  items: RecipeItemDef[];
  prepInstructions: string;
}

export const AUTHENTIC_INDIAN_RECIPES: AuthenticMealRecipe[] = [
  // ─── BREAKFAST ──────────────────────────────────────────
  {
    id: "bf_besan_cheela",
    name: "Besan Cheela with Fresh Curd",
    type: "breakfast",
    dietTypes: ["veg", "eggetarian", "non-veg"],
    items: [
      { name: "Besan Cheela", defaultServing: 1, servingLabel: "2 cheelas (140g)", isProtein: true },
      { name: "Curd / Dahi (Plain)", defaultServing: 0.67, servingLabel: "100g" },
    ],
    prepInstructions: "Mix besan with chopped onions, green chilies, and ajwain. Pan-cook on medium flame with minimal oil until golden crisp. Serve with fresh chilled curd.",
  },
  {
    id: "bf_moong_cheela",
    name: "Moong Dal Cheela with Mint & Cucumber",
    type: "breakfast",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Moong Dal Cheela", defaultServing: 1, servingLabel: "2 cheelas (140g)", isProtein: true },
      { name: "Fresh Cucumber", defaultServing: 1, servingLabel: "1 whole (150g)" },
    ],
    prepInstructions: "Grind soaked yellow moong dal into smooth batter with ginger and cumin. Cook crispy cheelas on a non-stick tawa. Pair with sliced crunchy cucumber seasoned with chaat masala.",
  },
  {
    id: "bf_paneer_bhurji_roti",
    name: "Paneer Bhurji with Warm Phulkas",
    type: "breakfast",
    dietTypes: ["veg", "non-veg"],
    items: [
      { name: "Paneer Bhurji", defaultServing: 0.7, servingLabel: "100g", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 1.5, servingLabel: "1.5 medium", isStaple: true },
    ],
    prepInstructions: "Sauté onions, tomatoes, and green chilies with turmeric and pav bhaji masala. Toss in freshly crumbled paneer and fresh coriander. Enjoy wrapped in warm phulkas.",
  },
  {
    id: "bf_egg_bhurji_roti",
    name: "Desi Egg Bhurji with Phulkas",
    type: "breakfast",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Egg Bhurji (Indian Scramble)", defaultServing: 1, servingLabel: "2 eggs (120g)", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 1.5, servingLabel: "1.5 medium", isStaple: true },
    ],
    prepInstructions: "Scramble eggs in a hot pan with tempered cumin, diced onions, tomatoes, and garam masala. Serve steaming hot with soft whole-wheat phulkas.",
  },
  {
    id: "bf_boiled_eggs_toast",
    name: "Farm Boiled Eggs with Whole Wheat Toast",
    type: "breakfast",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Boiled Egg (Whole)", defaultServing: 2, servingLabel: "2 large", isProtein: true },
      { name: "Whole Wheat Bread", defaultServing: 1, servingLabel: "2 slices", isStaple: true },
    ],
    prepInstructions: "Boil eggs for 8-9 minutes for firm yolks. Slice in half, sprinkle freshly cracked black pepper and rock salt. Pair with toasted whole wheat bread slices.",
  },
  {
    id: "bf_poha_sprouts",
    name: "Homestyle Veggie Poha with Moong Sprouts",
    type: "breakfast",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Poha", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Moong Sprouts Salad", defaultServing: 0.7, servingLabel: "100g", isProtein: true },
    ],
    prepInstructions: "Rinse flattened rice. Temper mustard seeds, curry leaves, and green chilies, toss with turmeric and steamed veggies. Serve topped with fresh moong sprouts and a squeeze of fresh lemon.",
  },
  {
    id: "bf_oats_milk_banana",
    name: "Warm Rolled Oats with Milk & Banana",
    type: "breakfast",
    dietTypes: ["veg", "eggetarian", "non-veg"],
    items: [
      { name: "Oats with Milk", defaultServing: 1, servingLabel: "1 bowl (250g)", isStaple: true },
      { name: "Banana", defaultServing: 0.8, servingLabel: "1 medium" },
    ],
    prepInstructions: "Simmer rolled oats in low-fat milk with a pinch of cinnamon until creamy. Slice fresh banana on top for natural sweetness.",
  },
  {
    id: "bf_idli_sambar",
    name: "Steamed Idlis with Dal Sambar & Curd",
    type: "breakfast",
    dietTypes: ["veg", "eggetarian", "non-veg"],
    items: [
      { name: "Idli", defaultServing: 1.5, servingLabel: "3 pieces", isStaple: true },
      { name: "Sambar", defaultServing: 1, servingLabel: "1 bowl (150g)" },
      { name: "Curd / Dahi (Plain)", defaultServing: 0.5, servingLabel: "75g", isProtein: true },
    ],
    prepInstructions: "Steam fluffy fermented rice-lentil idlis. Serve submerged in hot piping vegetable dal sambar accompanied by a side of fresh dahi.",
  },

  // ─── LUNCH ──────────────────────────────────────────────
  {
    id: "ln_rajma_chawal",
    name: "Comfort Rajma Chawal & Kachumber",
    type: "lunch",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Rajma (Kidney Beans Curry)", defaultServing: 1, servingLabel: "1 bowl (180g)", isProtein: true },
      { name: "White Rice (Steamed)", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Pressure-cook red kidney beans until tender; simmer in an aromatic onion, ginger, garlic, and tomato curry. Ladle generously over fluffy steamed rice with fresh cucumber kachumber.",
  },
  {
    id: "ln_dal_phulka_paneer",
    name: "Yellow Dal Tadka, Phulkas & Paneer",
    type: "lunch",
    dietTypes: ["veg", "non-veg"],
    items: [
      { name: "Dal Tadka", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Chapati / Phulka", defaultServing: 2, servingLabel: "2 medium", isStaple: true },
      { name: "Fresh Paneer (Raw)", defaultServing: 0.5, servingLabel: "50g", isProtein: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Cook yellow toor/moong dal and temper with cumin, garlic, and hing. Pair with hot puffed phulkas, fresh paneer cubes seasoned with chaat masala, and a crisp lemon salad.",
  },
  {
    id: "ln_chole_jeera_rice",
    name: "Punjabi Chana Masala with Jeera Rice & Dahi",
    type: "lunch",
    dietTypes: ["veg", "eggetarian", "non-veg"],
    items: [
      { name: "Chole / Chana Masala", defaultServing: 1, servingLabel: "1 bowl (180g)", isProtein: true },
      { name: "Jeera Rice", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Curd / Dahi (Plain)", defaultServing: 0.5, servingLabel: "75g" },
    ],
    prepInstructions: "Slow-cooked chickpeas in spiced gravy infused with amchur and garam masala. Serve alongside fragrant cumin jeera rice and a cooling bowl of dahi.",
  },
  {
    id: "ln_soya_matar_roti",
    name: "High-Protein Soya Matar Curry with Phulkas",
    type: "lunch",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Soya Chunks Curry (Cooked)", defaultServing: 1, servingLabel: "1 bowl (150g)", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 2, servingLabel: "2 medium", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Boil and squeeze soya chunks; cook with green peas in a rich onion-tomato gravy. Pair with soft whole wheat rotis and freshly sliced salad.",
  },
  {
    id: "ln_chicken_curry_rice",
    name: "Homestyle Chicken Curry with Steamed Rice",
    type: "lunch",
    dietTypes: ["non-veg"],
    items: [
      { name: "Chicken Curry (Home Style)", defaultServing: 1, servingLabel: "1 bowl (180g)", isProtein: true },
      { name: "White Rice (Steamed)", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Tender lean chicken cooked homestyle with whole spices, onion, garlic, and fresh tomatoes. Serve over hot steamed white rice with crunchy salad.",
  },
  {
    id: "ln_fish_curry_rice",
    name: "Rohu Fish Curry with Steamed Rice",
    type: "lunch",
    dietTypes: ["non-veg"],
    items: [
      { name: "Fish Curry (Rohu / Indian Carp)", defaultServing: 1, servingLabel: "1 bowl (150g)", isProtein: true },
      { name: "White Rice (Steamed)", defaultServing: 1, servingLabel: "1 bowl (150g)", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Fresh fish fillets simmered in a light mustard or tomato-tamarind gravy. Serve with warm steamed rice and fresh cucumber slices.",
  },
  {
    id: "ln_egg_curry_phulka",
    name: "Dhaba Egg Curry with Hot Phulkas",
    type: "lunch",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Egg Curry (2 Eggs)", defaultServing: 1, servingLabel: "1 bowl (200g)", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 2, servingLabel: "2 medium", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Hard-boiled eggs lightly pan-fried in turmeric, then simmered in a flavorful onion-tomato gravy. Enjoy with hot phulkas.",
  },

  // ─── PRE-WORKOUT (Fast Carbs + Light Protein, Low Fat < 3g) ─────
  {
    id: "pre_banana_chana",
    name: "Energy Banana & Roasted Chana",
    type: "pre_workout",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Banana", defaultServing: 1, servingLabel: "1 medium (118g)", isStaple: true },
      { name: "Roasted Chana (Dry Chickpeas)", defaultServing: 0.8, servingLabel: "25g", isProtein: true },
    ],
    prepInstructions: "Eat 30-45 minutes before training. Quick natural glycogen from ripe banana paired with sustained amino acids from roasted chana. Ultra-clean, low-fat fuel that won't sit heavy in your stomach.",
  },
  {
    id: "pre_apple_chana",
    name: "Crisp Apple with Roasted Chana",
    type: "pre_workout",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Apple", defaultServing: 1, servingLabel: "1 medium (180g)", isStaple: true },
      { name: "Roasted Chana (Dry Chickpeas)", defaultServing: 0.8, servingLabel: "25g", isProtein: true },
    ],
    prepInstructions: "Eat 30-45 minutes before training. Crisp hydrating apple provides immediate workout energy while dry roasted chana delivers sustained focus without any sluggishness.",
  },
  {
    id: "pre_toast_egg_white",
    name: "Whole Wheat Toast & Boiled Egg White",
    type: "pre_workout",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Whole Wheat Bread", defaultServing: 0.5, servingLabel: "1 slice (30g)", isStaple: true },
      { name: "Boiled Egg White", defaultServing: 2, servingLabel: "2 whites (66g)", isProtein: true },
      { name: "Banana", defaultServing: 0.5, servingLabel: "1/2 medium" },
    ],
    prepInstructions: "Light pre-workout meal 45 minutes prior to lifting. Pure lean protein with zero digestive strain and easy carbohydrates for high muscular power.",
  },

  // ─── POST-WORKOUT (Rapid Recovery Support) ───────────────
  {
    id: "post_egg_white_banana",
    name: "Egg Whites & Ripe Banana Recovery",
    type: "post_workout",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Boiled Egg White", defaultServing: 3, servingLabel: "3 whites (100g)", isProtein: true },
      { name: "Banana", defaultServing: 1, servingLabel: "1 medium (118g)", isStaple: true },
    ],
    prepInstructions: "Consume within 30-45 minutes after workout to rapidly replenish glycogen stores and initiate muscle protein synthesis.",
  },
  {
    id: "post_paneer_fruit",
    name: "Low-Fat Paneer & Banana Recovery",
    type: "post_workout",
    dietTypes: ["veg", "non-veg"],
    items: [
      { name: "Low Fat Paneer", defaultServing: 0.5, servingLabel: "50g", isProtein: true },
      { name: "Banana", defaultServing: 0.8, servingLabel: "1 medium" },
    ],
    prepInstructions: "Light snack to support immediate post-workout muscle repair.",
  },
  {
    id: "post_tofu_apple",
    name: "Firm Tofu & Crisp Apple",
    type: "post_workout",
    dietTypes: ["vegan"],
    items: [
      { name: "Tofu (Firm)", defaultServing: 0.8, servingLabel: "80g", isProtein: true },
      { name: "Apple", defaultServing: 0.8, servingLabel: "1 medium" },
    ],
    prepInstructions: "Plant-based recovery snack providing clean amino acids and simple carbohydrates.",
  },

  // ─── DINNER ─────────────────────────────────────────────
  {
    id: "dn_dal_phulka_sabzi",
    name: "Light Dal Tadka, Phulkas & Mixed Veg",
    type: "dinner",
    dietTypes: ["vegan", "veg", "eggetarian", "non-veg"],
    items: [
      { name: "Dal Tadka", defaultServing: 1, servingLabel: "1 bowl (150g)", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 2, servingLabel: "2 medium", isStaple: true },
      { name: "Mixed Vegetable Sabzi", defaultServing: 0.7, servingLabel: "100g" },
    ],
    prepInstructions: "Warm homestyle yellow dal seasoned with cumin and coriander. Pair with hot puffed chapatis and seasonal mixed vegetables for easy night digestion.",
  },
  {
    id: "dn_khichdi_curd",
    name: "Moong Dal Khichdi with Cooling Dahi",
    type: "dinner",
    dietTypes: ["veg", "eggetarian", "non-veg"],
    items: [
      { name: "Moong Dal Khichdi", defaultServing: 1, servingLabel: "1 bowl (200g)", isStaple: true },
      { name: "Curd / Dahi (Plain)", defaultServing: 0.7, servingLabel: "100g", isProtein: true },
      { name: "Fresh Cucumber", defaultServing: 1, servingLabel: "1 whole (150g)" },
    ],
    prepInstructions: "Comforting, restorative moong dal and rice khichdi prepared with mild spices. Serve with chilled fresh curd and sliced cucumbers.",
  },
  {
    id: "dn_paneer_tikka_roti",
    name: "Tawa Paneer Tikka with Phulkas & Salad",
    type: "dinner",
    dietTypes: ["veg", "non-veg"],
    items: [
      { name: "Grilled Paneer / Paneer Tikka", defaultServing: 0.7, servingLabel: "70g", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 1.5, servingLabel: "1.5 medium", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Marinate paneer cubes in curd, ginger-garlic paste, and tandoori spices. Pan-sear on a dry tawa until lightly charred. Serve with warm phulkas.",
  },
  {
    id: "dn_chicken_breast_roti",
    name: "Pan-Grilled Chicken Breast with Phulkas",
    type: "dinner",
    dietTypes: ["non-veg"],
    items: [
      { name: "Chicken Breast (Grilled / Cooked)", defaultServing: 1, servingLabel: "100g", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 1.5, servingLabel: "1.5 medium", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Rub chicken breast with lime juice, cumin, garlic, and paprika. Pan-sear for 5-6 mins per side until juicy. Serve with phulkas and fresh salad greens.",
  },
  {
    id: "dn_egg_omelette_roti",
    name: "Fluffy Egg Omelette with Phulkas & Salad",
    type: "dinner",
    dietTypes: ["eggetarian", "non-veg"],
    items: [
      { name: "Egg Omelette", defaultServing: 1, servingLabel: "2 eggs (110g)", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 1.5, servingLabel: "1.5 medium", isStaple: true },
      { name: "Green Salad with Lemon", defaultServing: 0.5, servingLabel: "1/2 bowl (75g)" },
    ],
    prepInstructions: "Whisk eggs with onions, tomatoes, coriander, and black pepper. Cook in a non-stick skillet. Pair with warm phulkas and crunchy cucumber salad.",
  },
  {
    id: "dn_tofu_stirfry_roti",
    name: "Spiced Tofu & Mixed Sabzi with Phulkas",
    type: "dinner",
    dietTypes: ["vegan"],
    items: [
      { name: "Tofu (Firm)", defaultServing: 1, servingLabel: "100g", isProtein: true },
      { name: "Chapati / Phulka", defaultServing: 2, servingLabel: "2 medium", isStaple: true },
      { name: "Mixed Vegetable Sabzi", defaultServing: 0.7, servingLabel: "100g" },
    ],
    prepInstructions: "Cubed firm tofu stir-fried with turmeric, garam masala, and mixed vegetables. Serve hot with whole wheat phulkas.",
  },
];
