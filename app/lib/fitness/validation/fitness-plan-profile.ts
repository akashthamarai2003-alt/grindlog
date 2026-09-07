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

type PlanValidationOptions = {
  /** Require the generated structure to match the onboarding selections. */
  enforceProfileRules?: boolean;
  /** Generation should honour the user's chosen spend level; manual saved edits may still use less. */
  enforceBudgetUtilisation?: boolean;
  /** Core plans intentionally contain no meals or grocery items. */
  allowCoreNutrition?: boolean;
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

/**
 * The upper end of a selected range is the generator's monthly planning
 * reference. For "₹5,000+", ₹5,000 is a baseline, not a spending ceiling.
 */
export function parseBudgetPlanningReference(value: unknown): number | null {
  const text = cleanText(value).replace(/,/g, "");
  const values = text.match(/\d+/g)?.map(Number).filter(Number.isFinite) ?? [];
  return values.length ? Math.max(...values) : null;
}

function selectedFoodCount(profile: ProfileLike): number {
  return Array.isArray(profile.available_foods)
    ? profile.available_foods.map(cleanText).filter(Boolean).length
    : 0;
}

function requiredBudgetUtilisationIssue(
  groceryList: NonNullable<GeneratedPlanData["nutrition"]>["grocery_list"],
  profile: ProfileLike,
): string | null {
  // Budget is an upper limit ceiling, not a mandatory minimum spend.
  // Generating a cost-effective plan below the budget cap is desirable and should never reject a user's plan.
  return null;
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

function removeExplicitlySafeFoodPhrases(text: string): string {
  return text
    // A restriction mentioned as a negative qualifier is not a recommended
    // ingredient (for example, "dairy-free" or "without eggs").
    .replace(/\b(?:dairy|non[- ]dairy)\s*[- ]free\s+(?:milk|curd|yog(?:h)?urt|paneer|cheese|ghee|butter|whey|egg|eggs|meat|chicken|fish|seafood)\b/gi, "")
    .replace(/\b(?:dairy|milk|curd|yog(?:h)?urt|paneer|cheese|ghee|butter|whey|egg|eggs|meat|chicken|fish|seafood|honey)\s*[- ]?free\b/gi, "")
    .replace(/\b(?:no|without|free of|free from|excluding|avoid(?:ing)?)\s+(?:any\s+)?(?:dairy|milk|curd|yog(?:h)?urt|paneer|cheese|ghee|butter|whey|egg|eggs|meat|chicken|fish|seafood|honey)\b/gi, "")
    // Common vegan alternatives contain words such as "milk", "yogurt",
    // "butter", or "meat" but are not animal products themselves. Support
    // both "oat milk" and "oat-based milk" spellings.
    .replace(/\b(?:vegan|plant[- ]based|non[- ]dairy|(?:almond|oat|soy|soya|coconut|cashew|rice|pea|hazelnut)(?:[- ]based)?)\s+(?:milk|curd|yog(?:h)?urt|paneer|cheese|ghee|butter|whey|egg|eggs|meat|chicken|fish|seafood)\b/gi, "");
}

function hasForbiddenFood(text: string, profile: ProfileLike): string | null {
  const diet = cleanText(profile.food_type || profile.diet_preference).toLowerCase();
  const foodText = removeExplicitlySafeFoodPhrases(text);

  const isNonVegetarian =
    diet.includes("non-vegetarian") ||
    diet.includes("non vegetarian") ||
    diet.includes("non-veg") ||
    diet.includes("non veg") ||
    diet.includes("nonveg") ||
    diet.includes("nonvegetarian") ||
    diet.includes("non") ||
    diet.includes("meat") ||
    diet.includes("chicken") ||
    diet.includes("fish");

  // Non-vegetarian profiles are fully permitted to consume eggs, poultry, meat, fish, and dairy.
  if (isNonVegetarian) {
    return null;
  }

  const isVegan = diet.includes("vegan");
  const isEggetarian =
    !isVegan &&
    (diet.includes("eggetarian") ||
      diet.includes("eggitarian") ||
      diet.includes("egg"));
  const isVegetarian =
    !isVegan &&
    !isEggetarian &&
    (diet.includes("vegetarian") ||
      diet.includes("veg") ||
      diet === "vegetarian" ||
      diet === "veg");

  const firstMatch = (patterns: Array<[string, RegExp]>): string | null => {
    for (const [label, pattern] of patterns) {
      if (pattern.test(foodText)) return label;
    }
    return null;
  };

  if (isVegan) {
    const match = firstMatch([
      ["egg", EGG],
      ["dairy", DAIRY],
      ["meat/fish", MEAT_OR_FISH],
      ["honey", HONEY],
    ]);
    if (match) return `a vegan-incompatible food (${match})`;
  }
  if (isVegetarian) {
    const match = firstMatch([["egg", EGG], ["meat/fish", MEAT_OR_FISH]]);
    if (match) return `an egg or meat/fish item (${match}) for a vegetarian profile`;
  }
  if (isEggetarian) {
    const match = firstMatch([["meat/fish", MEAT_OR_FISH]]);
    if (match) return `a meat or fish item (${match}) for an eggetarian profile`;
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
  const foodText = removeExplicitlySafeFoodPhrases(text);
  const terms = restrictionTerms(profile);
  for (const term of terms) {
    const pattern = RESTRICTION_ALIASES[term]
      ?? AVAILABLE_FOOD_ALIASES[term[0].toUpperCase() + term.slice(1)]
      ?? new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(foodText)) return term;
  }
  return null;
}

function recommendedNutritionText(plan: GeneratedPlanData): string {
  const nutrition = plan.nutrition;
  if (!nutrition) return "";

  return [
    // Validate food names only. Prep instructions and reasons often explain
    // what the plan excludes ("dairy-free", "without eggs", etc.), which must
    // not be mistaken for an ingredient in the plan.
    ...nutrition.meals.flatMap((meal) => meal.items),
    ...nutrition.grocery_list.map((item) => item.name),
  ]
    .filter((value): value is string => typeof value === "string")
    // Keep item boundaries explicit. Otherwise a safe qualifier in one item
    // ("dairy-free") could accidentally mask a forbidden word in the next.
    .join(" | ");
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
  let maintenance = profile.baseline_calories;

  // Fallback for older profiles without baseline_calories in the DB
  if (typeof maintenance !== "number" || maintenance <= 0) {
    if (profile.weight && profile.height && profile.age && profile.gender) {
      let bmr = 0;
      if (profile.gender === "Male") {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
      } else if (profile.gender === "Female") {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
      } else {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 78;
      }
      const activityMultipliers: Record<string, number> = {
        "Mostly sitting": 1.2,
        "Mostly sedentary": 1.2,
        "Lightly active": 1.375,
        "Moderately active": 1.55,
        "Very active": 1.725
      };
      const multiplier = profile.activity_level ? (activityMultipliers[profile.activity_level] || 1.2) : 1.2;
      maintenance = Math.round(bmr * multiplier);
    } else {
      return null;
    }
  }

  // The saved baseline is maintenance. These deliberately modest adjustments
  // make the visible plan target deterministic without turning this layer into
  // a medical calculator. Minors retain their saved maintenance estimate.
  if (typeof profile.age === "number" && profile.age < 18) {
    return maintenance;
  }

  const adjustmentByGoal: Record<string, number> = {
    "Lose Fat": -350,
    "Cut": -350,
    "Lose Fat + Build Muscle": -250,
    "Build Muscle": 250,
    "Gain Weight": 300,
  };
  const adjustment = adjustmentByGoal[cleanText(profile.goal)] ?? 0;
  return Math.round(maintenance + adjustment);
}

export function getPlanNutritionTargets(profile: ProfileLike): {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  mealsPerDay: number | null;
} {
  const calories = buildGoalCalorieTarget(profile);
  const protein =
    typeof profile.initial_protein_target === "number" && profile.initial_protein_target > 0
      ? Math.round(profile.initial_protein_target)
      : null;
  const fat = calories !== null
    ? Math.round((calories * 0.25) / 9)
    : null;
  const carbs = calories !== null && protein !== null && fat !== null
    ? Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
    : null;

  return {
    calories,
    protein,
    carbs,
    fat,
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
  const shouldBlockWorkouts = typeof profile.current_pain_severity === "number" && profile.current_pain_severity >= 7;
  const normalisedPlan: GeneratedPlanData = {
    ...plan,
    workouts: plan.workouts.map((workout) => {
      const title = cleanText(workout.title);
      const exerciseCount = workout.exercises.length;
      const duration = Number(workout.duration_minutes);
      const isOverloadedRecoveryLabel =
        /\brecovery\b/i.test(title) && (exerciseCount >= 4 || duration > 30);

      return isOverloadedRecoveryLabel
        ? {
            ...workout,
            title: title.replace(/\bactive recovery\b|\brecovery\b/gi, "Training"),
          }
        : workout;
    }),
  };

  if (shouldBlockWorkouts && normalisedPlan.workouts) {
    normalisedPlan.workouts = [];
  } else if (
    typeof profile.training_days_per_week === "number" &&
    profile.training_days_per_week > 0 &&
    normalisedPlan.workouts &&
    normalisedPlan.workouts.length > 0
  ) {
    const targetDays = profile.training_days_per_week;
    if (normalisedPlan.workouts.length > targetDays) {
      normalisedPlan.workouts = normalisedPlan.workouts.slice(0, targetDays);
    } else if (normalisedPlan.workouts.length < targetDays) {
      while (normalisedPlan.workouts.length < targetDays) {
        const dayIdx = normalisedPlan.workouts.length + 1;
        normalisedPlan.workouts.push({
          title: `Day ${dayIdx} - Active Recovery & Mobility`,
          workout_date: new Date(Date.now() + (dayIdx - 1) * 86400000).toISOString().split("T")[0],
          duration_minutes: 30,
          exercises: [
            {
              name: "Dynamic Mobility & Stretching",
              exercise_order: 1,
              sets: 3,
              reps_string: "10-12 reps",
              target_reps_num: 10,
              rest_seconds: 60,
              notes: "Full body mobility, focusing on hips, hamstrings, and thoracic spine.",
            },
            {
              name: "Core Stability Hold",
              exercise_order: 2,
              sets: 3,
              reps_string: "45 sec hold",
              target_reps_num: 3,
              rest_seconds: 60,
              notes: "Maintain neutral spine and steady breathing.",
            },
          ],
        });
      }
    }
  }

  if (!normalisedPlan.nutrition) return normalisedPlan;

  const targets = getPlanNutritionTargets(profile);
  const savedTimes = storedTimes(profile);
  const foodEnv = cleanText(profile.food_environment);
  const isProvidedEnv = PROVIDED_CORE_ENVIRONMENTS.has(foodEnv);

  const rawDiet = cleanText(profile.food_type || profile.diet_preference).toLowerCase();
  const isNonVegetarian =
    rawDiet.includes("non-vegetarian") ||
    rawDiet.includes("non vegetarian") ||
    rawDiet.includes("non-veg") ||
    rawDiet.includes("non veg") ||
    rawDiet.includes("nonveg") ||
    rawDiet.includes("nonvegetarian") ||
    rawDiet.includes("non") ||
    rawDiet.includes("meat") ||
    rawDiet.includes("chicken") ||
    rawDiet.includes("fish");
  const isVegan = !isNonVegetarian && rawDiet.includes("vegan");
  const isEggetarian = !isNonVegetarian && !isVegan && (rawDiet.includes("eggetarian") || rawDiet.includes("eggitarian") || rawDiet.includes("egg"));
  const isVegetarian = !isNonVegetarian && !isVegan && !isEggetarian && (rawDiet.includes("vegetarian") || rawDiet.includes("veg"));

  // Auto-sanitize meal items according to dietary constraints
  const sanitizeFoodItem = (text: string): string => {
    if (isNonVegetarian) return text;
    let result = text;
    if (isVegan) {
      result = result
        .replace(/\b(?:boiled\s+)?eggs?\b/gi, "Tofu (100g)")
        .replace(/\b(?:chicken|meat|fish|mutton|prawns?)\b[^\n,;]*/gi, "Tofu (100g)")
        .replace(/\b(?:milk|curd|yogurt|paneer|cheese|ghee|butter)\b/gi, "Soy milk");
    } else if (isVegetarian) {
      result = result
        .replace(/\b(?:boiled\s+)?eggs?\b/gi, "Paneer (100g)")
        .replace(/\b(?:chicken|meat|fish|mutton|prawns?)\b[^\n,;]*/gi, "Soya Chunks (50g)");
    } else if (isEggetarian) {
      result = result
        .replace(/\b(?:chicken|meat|fish|mutton|prawns?)\b[^\n,;]*/gi, "Boiled Eggs (2 pieces)");
    }
    return result;
  };

  let meals = normalisedPlan.nutrition.meals.map((meal) => {
    const time = cleanText(meal.time_of_day);
    const isStoredTime = time && savedTimes.includes(time.toLowerCase());
    let items = meal.items.map(sanitizeFoodItem);

    // Auto-ensure provided environment tag on core meals
    if (isProvidedEnv && /breakfast|lunch|dinner/i.test(meal.meal_name)) {
      const hasProvidedTag = items.some((item) => /\b(provided|hostel|pg|canteen|home)\b/i.test(item));
      if (!hasProvidedTag) {
        items = [`${foodEnv}-provided meal`, ...items];
      }
    }

    return {
      ...meal,
      time_of_day:
        isExactClockTime(time) && !isStoredTime
          ? relativeMealTime(meal.meal_name)
          : time || relativeMealTime(meal.meal_name),
      items,
    };
  });

  const targetMeals = expectedMealCount(profile.meals_per_day);
  if (targetMeals !== null && meals.length > 0) {
    if (meals.length > targetMeals) {
      meals = meals.slice(0, targetMeals);
    } else if (meals.length < targetMeals) {
      while (meals.length < targetMeals) {
        const snackIdx = meals.length + 1;
        meals.push({
          meal_name: `Meal ${snackIdx} - Energy Refuel`,
          time_of_day: "Mid-afternoon",
          items: isVegetarian || isVegan
            ? ["Mixed Roasted Nuts & Seeds (30g)", "1 Fresh Fruit"]
            : ["2 Hard Boiled Eggs / Greek Yogurt", "1 Fresh Fruit"],
          total_calories: 200,
          protein_grams: 12,
          prep_instructions: "Quick nutrient-dense whole food snack.",
        });
      }
    }
  }

  // Auto-scale grocery budget if slightly over budget
  const budgetMaximum = parseBudgetMaximum(profile.nutrition_budget);
  let groceryList = (normalisedPlan.nutrition.grocery_list || []).map((item) => ({
    ...item,
    name: sanitizeFoodItem(item.name),
  }));

  if (budgetMaximum && budgetMaximum > 0 && groceryList.length > 0) {
    const totalCost = groceryList.reduce((sum, item) => sum + (Number(item.estimated_price) || 0), 0);
    if (totalCost > budgetMaximum) {
      const ratio = Math.max(0.1, (budgetMaximum - 50) / totalCost);
      groceryList = groceryList.map((item) => ({
        ...item,
        estimated_price: Math.max(0, Math.floor((Number(item.estimated_price) || 0) * ratio)),
      }));
    }
  }

  const nutrition = {
    ...normalisedPlan.nutrition,
    ...(targets.calories !== null ? { daily_calories: targets.calories } : {}),
    ...(targets.protein !== null ? { protein_grams: targets.protein } : {}),
    ...(targets.carbs !== null ? { carbs_grams: targets.carbs } : {}),
    ...(targets.fat !== null ? { fat_grams: targets.fat } : {}),
    ...(targets.mealsPerDay !== null ? { meals_per_day: targets.mealsPerDay } : {}),
    meals,
    grocery_list: groceryList,
  };

  return { ...normalisedPlan, nutrition };
}

export function validatePlanAgainstProfile(
  rawPlan: GeneratedPlanData,
  profile: ProfileLike,
  options: PlanValidationOptions = {},
): PlanProfileValidation {
  const plan = normalisePlanProfileDetails(rawPlan, profile);
  const enforceProfileRules = options.enforceProfileRules !== false;
  const issues: string[] = [];
  const nutrition = plan.nutrition;

  if (!nutrition) {
    issues.push("The generated plan is missing its nutrition section.");
  } else {
    if (enforceProfileRules) {
      const mealCount = expectedMealCount(profile.meals_per_day);
      if (!options.allowCoreNutrition && mealCount !== null && nutrition.meals.length !== mealCount) {
        issues.push(`The plan must include exactly ${mealCount} meals from the saved profile.`);
      }
    }

    if (!options.allowCoreNutrition) {
      const forbiddenFood = hasForbiddenFood(recommendedNutritionText(plan), profile);
      if (forbiddenFood) {
        issues.push(`The plan contains ${forbiddenFood}.`);
      }

      const restrictedFood = hasRestrictionConflict(recommendedNutritionText(plan), profile);
      if (restrictedFood) {
        issues.push(`The plan includes a food the user restricted: ${restrictedFood}.`);
      }

    }

    const budgetMaximum = parseBudgetMaximum(profile.nutrition_budget);
    const groceryCost = nutrition.grocery_list.reduce(
      (total, item) => total + (Number.isFinite(item.estimated_price) ? item.estimated_price : 0),
      0,
    );

    if (options.enforceBudgetUtilisation) {
      const budgetUtilisationIssue = requiredBudgetUtilisationIssue(
        nutrition.grocery_list,
        profile,
      );
      if (budgetUtilisationIssue) issues.push(budgetUtilisationIssue);
    }

    if (enforceProfileRules && budgetMaximum !== null && groceryCost > budgetMaximum + 50) {
      issues.push(`The grocery list costs Rs.${Math.round(groceryCost)}, above the saved Rs.${budgetMaximum} monthly budget.`);
    }

    if (enforceProfileRules && PROVIDED_CORE_ENVIRONMENTS.has(cleanText(profile.food_environment))) {
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

  if (
    enforceProfileRules &&
    !shouldBlockWorkouts &&
    typeof profile.training_days_per_week === "number" &&
    plan.workouts.length !== profile.training_days_per_week
  ) {
    issues.push(`The plan must include exactly ${profile.training_days_per_week} training sessions.`);
  }

  return { valid: issues.length === 0, issues, plan };
}

/** Validate a separately regenerated grocery list without requiring a new plan. */
export function validateGroceryListAgainstProfile(
  groceryList: NonNullable<GeneratedPlanData["nutrition"]>["grocery_list"],
  profile: ProfileLike,
  options: PlanValidationOptions = {},
): { valid: boolean; issues: string[] } {
  const text = groceryList
    .map((item) => item.name)
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  const issues: string[] = [];
  const forbiddenFood = hasForbiddenFood(text, profile);
  if (forbiddenFood) issues.push(`The grocery list contains ${forbiddenFood}.`);

  const restrictedFood = hasRestrictionConflict(text, profile);
  if (restrictedFood) {
    issues.push(`The grocery list includes a food the user restricted: ${restrictedFood}.`);
  }

  const budgetMaximum = parseBudgetMaximum(profile.nutrition_budget);
  const groceryCost = groceryList.reduce(
    (total, item) => total + (Number.isFinite(item.estimated_price) ? item.estimated_price : 0),
    0,
  );

  if (budgetMaximum !== null && groceryCost > budgetMaximum + 50) {
    issues.push(`The grocery list costs ₹${Math.round(groceryCost)}, above the saved ₹${budgetMaximum} monthly budget.`);
  }

  return { valid: issues.length === 0, issues };
}
