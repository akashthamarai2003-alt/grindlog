import { GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import { OnboardingData } from "@/types/fitness/onboarding";

type ProfileLike = Partial<OnboardingData> & {
  baseline_calories?: number | null;
  initial_protein_target?: number | null;
  diet_preference?: string | null;
};

export type PlanProfileValidation = {
  valid: boolean;
  issues: string[];
  plan: GeneratedPlanData;
};

const PROVIDED_CORE_ENVIRONMENTS = new Set([
  "PG",
  "Hostel",
  "Home",
  "Office/Canteen",
]);

const AVAILABLE_FOOD_ALIASES: Record<string, RegExp> = {
  Eggs: /\begg(?:s)?\b/i,
  Milk: /\bmilk\b/i,
  Curd: /\bcurd\b|\byog(?:h)?urt\b/i,
  Paneer: /\bpaneer\b|\bcottage cheese\b/i,
  Soya: /\bsoya?\b|\bsoy chunks?\b/i,
  Chana: /\bchana\b|\bchickpeas?\b/i,
  Peanuts: /\bpeanuts?\b/i,
  Oats: /\boats?\b/i,
  Chicken: /\bchicken\b/i,
  Fish: /\bfish\b|\bseafood\b/i,
};

const MEAT_OR_FISH = /\b(chicken|fish|seafood|meat|beef|pork|mutton|prawn(?:s)?|shrimp)\b/i;
const EGG = /\begg(?:s)?\b/i;
const DAIRY = /\b(milk|curd|yog(?:h)?urt|paneer|cheese|ghee|butter|whey)\b/i;
const HONEY = /\bhoney\b/i;
const RESTRICTION_ALIASES: Record<string, RegExp> = {
  egg: EGG,
  eggs: EGG,
  dairy: DAIRY,
  lactose: DAIRY,
  milk: DAIRY,
  soy: AVAILABLE_FOOD_ALIASES.Soya,
  soya: AVAILABLE_FOOD_ALIASES.Soya,
  peanut: AVAILABLE_FOOD_ALIASES.Peanuts,
  peanuts: AVAILABLE_FOOD_ALIASES.Peanuts,
};
const FILLER_WORDS = new Set([
  "allergy",
  "allergies",
  "allergic",
  "avoid",
  "avoiding",
  "dislike",
  "dislikes",
  "dont",
  "don't",
  "eat",
  "food",
  "foods",
  "free",
  "intolerance",
  "intolerant",
  "no",
  "not",
  "the",
  "to",
  "with",
  "and",
  "or",
]);

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function parseBudgetMaximum(value: unknown): number | null {
  const text = cleanText(value).replace(/,/g, "");
  if (!text || text.includes("+")) return null;

  const values = text.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  return values.length ? Math.max(...values) : null;
}

function expectedMealCount(value: unknown): number | null {
  const text = cleanText(value);
  if (text === "5+ meals") return 5;
  const match = text.match(/^(\d+) meals$/);
  return match ? Number(match[1]) : null;
}

function isExactClockTime(value: string): boolean {
  return /\b(?:[01]?\d|2[0-3]):[0-5]\d\b|\b(?:1[0-2]|0?[1-9])\s?(?:a\.?m\.?|p\.?m\.?)\b/i.test(value);
}

function relativeMealTime(mealName: string): string {
  const name = mealName.toLowerCase();
  if (name.includes("breakfast")) return "After waking";
  if (name.includes("lunch")) return "Midday";
  if (name.includes("dinner")) return "Evening";
  if (name.includes("pre")) return "Before activity";
  if (name.includes("post")) return "After activity";
  return "Any time";
}

function storedTimes(profile: ProfileLike): string[] {
  return [
    profile.wake_time,
    profile.work_time,
    profile.workout_time,
    profile.preferred_training_time,
    profile.sleep_time,
  ]
    .map(cleanText)
    .filter(Boolean)
    .map((time) => time.toLowerCase());
}

function hasForbiddenFood(text: string, profile: ProfileLike): string | null {
  const diet = cleanText(profile.food_type || profile.diet_preference).toLowerCase();

  if (diet === "vegan" && (EGG.test(text) || DAIRY.test(text) || MEAT_OR_FISH.test(text) || HONEY.test(text))) {
    return "a vegan-incompatible food";
  }
  if (diet === "vegetarian" && (EGG.test(text) || MEAT_OR_FISH.test(text))) {
    return "an egg or meat/fish item for a vegetarian profile";
  }
  if (diet === "eggetarian" && MEAT_OR_FISH.test(text)) {
    return "a meat or fish item for an eggetarian profile";
  }

  return null;
}

function restrictionTerms(profile: ProfileLike): string[] {
  const raw = [
    profile.food_allergies,
    profile.foods_disliked,
    profile.foods_avoided,
  ]
    .map(cleanText)
    .filter(Boolean)
    .join(",")
    .toLowerCase();

  if (!raw || /^(none|nil|n\/a)$/i.test(raw.trim())) return [];

  const fromKnownFoods = Object.entries(AVAILABLE_FOOD_ALIASES)
    .filter(([, pattern]) => pattern.test(raw))
    .map(([food]) => food.toLowerCase());

  const customTerms = raw
    .split(/[,;/\n]+/)
    .flatMap((segment) => segment.match(/[a-z][a-z -]{1,40}/g) ?? [])
    .flatMap((segment) => segment.split(/\s+(?:and|or)\s+|\s+/))
    .map((term) => term.trim())
    .filter((term) => term.length >= 3 && !FILLER_WORDS.has(term));

  return uniqueStrings([...fromKnownFoods, ...customTerms]);
}

function hasRestrictionConflict(text: string, profile: ProfileLike): string | null {
  const terms = restrictionTerms(profile);
  for (const term of terms) {
    const pattern = RESTRICTION_ALIASES[term]
      ?? AVAILABLE_FOOD_ALIASES[term[0].toUpperCase() + term.slice(1)]
      ?? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(text)) return term;
  }
  return null;
}

function recommendedNutritionText(plan: GeneratedPlanData): string {
  const nutrition = plan.nutrition;
  if (!nutrition) return "";

  return [
    ...nutrition.meals.flatMap((meal) => [
      meal.meal_name,
      ...meal.items,
      meal.prep_instructions,
    ]),
    ...nutrition.grocery_list.flatMap((item) => [item.name, item.reason]),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function hasUnselectedAvailableFood(plan: GeneratedPlanData, profile: ProfileLike): string | null {
  const selectedFoods = Array.isArray(profile.available_foods)
    ? profile.available_foods.map((food) => cleanText(food)).filter(Boolean)
    : [];

  // An empty selection means the user gave no usable inventory. In that case,
  // diet/allergy validation still protects them, but we do not pretend to know
  // every food they have access to.
  if (!selectedFoods.length || !plan.nutrition) return null;

  const selected = new Set(selectedFoods.map((food) => food.toLowerCase()));
  const explicitItems = [
    ...plan.nutrition.meals.flatMap((meal) =>
      meal.items.filter((item) => !/\b(provided|hostel|pg|canteen|home)\b/i.test(item)),
    ),
    ...plan.nutrition.grocery_list.map((item) => item.name),
  ].join(" ");

  for (const [food, pattern] of Object.entries(AVAILABLE_FOOD_ALIASES)) {
    if (pattern.test(explicitItems) && !selected.has(food.toLowerCase())) {
      return food;
    }
  }

  return null;
}

function buildGoalCalorieTarget(profile: ProfileLike): number | null {
  if (typeof profile.baseline_calories !== "number" || profile.baseline_calories <= 0) {
    return null;
  }

  // The saved baseline is maintenance. These deliberately modest adjustments
  // make the visible plan target deterministic without turning this layer into
  // a medical calculator. Minors retain their saved maintenance estimate.
  if (typeof profile.age === "number" && profile.age < 18) {
    return profile.baseline_calories;
  }

  const adjustmentByGoal: Record<string, number> = {
    "Lose Fat": -350,
    "Lose Fat + Build Muscle": -250,
    "Build Muscle": 250,
    "Gain Weight": 300,
  };
  const adjustment = adjustmentByGoal[cleanText(profile.goal)] ?? 0;
  return Math.round(profile.baseline_calories + adjustment);
}

export function getPlanNutritionTargets(profile: ProfileLike): {
  calories: number | null;
  protein: number | null;
  mealsPerDay: number | null;
} {
  return {
    calories: buildGoalCalorieTarget(profile),
    protein:
      typeof profile.initial_protein_target === "number" && profile.initial_protein_target > 0
        ? Math.round(profile.initial_protein_target)
        : null,
    mealsPerDay: expectedMealCount(profile.meals_per_day),
  };
}

/**
 * Normalise harmless presentation-only details that the user did not supply.
 * This prevents an AI-invented clock time from looking like saved schedule data.
 */
export function normalisePlanProfileDetails(
  plan: GeneratedPlanData,
  profile: ProfileLike,
): GeneratedPlanData {
  if (!plan.nutrition) return plan;

  const targets = getPlanNutritionTargets(profile);
  const savedTimes = storedTimes(profile);
  const nutrition = {
    ...plan.nutrition,
    ...(targets.calories !== null ? { daily_calories: targets.calories } : {}),
    ...(targets.protein !== null ? { protein_grams: targets.protein } : {}),
    ...(targets.mealsPerDay !== null ? { meals_per_day: targets.mealsPerDay } : {}),
    meals: plan.nutrition.meals.map((meal) => {
      const time = cleanText(meal.time_of_day);
      const isStoredTime = time && savedTimes.includes(time.toLowerCase());
      return {
        ...meal,
        time_of_day:
          isExactClockTime(time) && !isStoredTime
            ? relativeMealTime(meal.meal_name)
            : time || relativeMealTime(meal.meal_name),
      };
    }),
  };

  return { ...plan, nutrition };
}

export function validatePlanAgainstProfile(
  rawPlan: GeneratedPlanData,
  profile: ProfileLike,
): PlanProfileValidation {
  const plan = normalisePlanProfileDetails(rawPlan, profile);
  const issues: string[] = [];
  const nutrition = plan.nutrition;

  if (!nutrition) {
    issues.push("The generated plan is missing its nutrition section.");
  } else {
    const mealCount = expectedMealCount(profile.meals_per_day);
    if (mealCount !== null && nutrition.meals.length !== mealCount) {
      issues.push(`The plan must include exactly ${mealCount} meals from the saved profile.`);
    }

    const forbiddenFood = hasForbiddenFood(recommendedNutritionText(plan), profile);
    if (forbiddenFood) {
      issues.push(`The plan contains ${forbiddenFood}.`);
    }

    const restrictedFood = hasRestrictionConflict(recommendedNutritionText(plan), profile);
    if (restrictedFood) {
      issues.push(`The plan includes a food the user restricted: ${restrictedFood}.`);
    }

    const unselectedFood = hasUnselectedAvailableFood(plan, profile);
    if (unselectedFood) {
      issues.push(`${unselectedFood} was not selected in the user's available foods.`);
    }

    const budgetMaximum = parseBudgetMaximum(profile.nutrition_budget);
    const groceryCost = nutrition.grocery_list.reduce(
      (total, item) => total + (Number.isFinite(item.estimated_price) ? item.estimated_price : 0),
      0,
    );
    if (budgetMaximum !== null && groceryCost > budgetMaximum) {
      issues.push(`The grocery list costs ₹${Math.round(groceryCost)}, above the saved ₹${budgetMaximum} monthly budget.`);
    }

    if (PROVIDED_CORE_ENVIRONMENTS.has(cleanText(profile.food_environment))) {
      const coreMeals = nutrition.meals.filter((meal) => /breakfast|lunch|dinner/i.test(meal.meal_name));
      if (coreMeals.length && coreMeals.some((meal) => !/\b(provided|hostel|pg|canteen|home)\b/i.test(meal.items.join(" ")))) {
        issues.push("Provided meals must be labelled as provided rather than priced as extra groceries.");
      }
    }
  }

  const shouldBlockWorkouts = typeof profile.current_pain_severity === "number" && profile.current_pain_severity >= 7;
  if (shouldBlockWorkouts && plan.workouts.length > 0) {
    issues.push("Training must remain paused for the saved severe-pain safety restriction.");
  }

  if (!shouldBlockWorkouts && typeof profile.training_days_per_week === "number" && plan.workouts.length !== profile.training_days_per_week) {
    issues.push(`The plan must include exactly ${profile.training_days_per_week} training sessions.`);
  }

  return { valid: issues.length === 0, issues, plan };
}

/** Validate a separately regenerated grocery list without requiring a new plan. */
export function validateGroceryListAgainstProfile(
  groceryList: NonNullable<GeneratedPlanData["nutrition"]>["grocery_list"],
  profile: ProfileLike,
): { valid: boolean; issues: string[] } {
  const text = groceryList
    .flatMap((item) => [item.name, item.reason])
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  const issues: string[] = [];
  const forbiddenFood = hasForbiddenFood(text, profile);
  if (forbiddenFood) issues.push(`The grocery list contains ${forbiddenFood}.`);

  const restrictedFood = hasRestrictionConflict(text, profile);
  if (restrictedFood) {
    issues.push(`The grocery list includes a food the user restricted: ${restrictedFood}.`);
  }

  const selectedFoods = Array.isArray(profile.available_foods)
    ? profile.available_foods.map((food) => cleanText(food)).filter(Boolean)
    : [];
  if (selectedFoods.length) {
    const selected = new Set(selectedFoods.map((food) => food.toLowerCase()));
    for (const [food, pattern] of Object.entries(AVAILABLE_FOOD_ALIASES)) {
      if (pattern.test(text) && !selected.has(food.toLowerCase())) {
        issues.push(`${food} was not selected in the user's available foods.`);
      }
    }
  }

  const budgetMaximum = parseBudgetMaximum(profile.nutrition_budget);
  const groceryCost = groceryList.reduce(
    (total, item) => total + (Number.isFinite(item.estimated_price) ? item.estimated_price : 0),
    0,
  );
  if (budgetMaximum !== null && groceryCost > budgetMaximum) {
    issues.push(`The grocery list costs ₹${Math.round(groceryCost)}, above the saved ₹${budgetMaximum} monthly budget.`);
  }

  return { valid: issues.length === 0, issues };
}
