// ─────────────────────────────────────────────────────────
// Deterministic Nutrition Engine — Type Definitions
// ─────────────────────────────────────────────────────────

/** Profile fields relevant to nutrition planning (subset of fitness_os_profiles). */
export type NutritionProfile = {
  // Identity
  gender: string | null;
  age: number | null;
  country: string | null;

  // Biometrics
  height: number | null;   // cm
  weight: number | null;   // kg
  target_weight: number | null;

  // Goals
  goal: FitnessGoal | string | null;

  // Training
  fitness_level: string | null;
  training_days_per_week: number | null;
  activity_level: string | null;

  // Nutrition preferences
  food_type: DietType | string | null;
  diet_preference?: string | null;
  food_environment: FoodEnvironment | string | null;
  meals_per_day: string | null;
  nutrition_budget: string | null;
  available_foods: string[] | null;
  food_allergies: string | null;
  foods_disliked: string | null;
  foods_avoided: string | null;

  // Schedule
  wake_time: string | null;
  workout_time: string | null;
  preferred_training_time: string | null;
  work_time: string | null;
  sleep_time: string | null;

  // Computed (from onboarding)
  baseline_calories: number | null;
  initial_protein_target: number | null;
};

export type FitnessGoal =
  | "Lose Fat"
  | "Cut"
  | "Build Muscle"
  | "Gain Weight"
  | "Lose Fat + Build Muscle"
  | "Build Strength"
  | "Improve Fitness"
  | "Maintain";

export type DietType = "Vegetarian" | "Eggetarian" | "Non-Vegetarian" | "Vegan";

export type FoodEnvironment = "Home" | "PG" | "Hostel" | "Office/Canteen" | "I Cook" | "Mixed";

export type BudgetTier = "low" | "mid" | "high" | "premium";

/** A food item from the `foods` database table. */
export type FoodItem = {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  diet_type: string;
  is_pg_friendly: boolean;
  allergens: string[] | null;
};

/** Computed daily macro targets. */
export type NutritionTargets = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
};

/** A single meal slot in the daily plan. */
export type MealSlot = {
  name: string;                    // "Breakfast", "Lunch", "Pre-Workout", etc.
  type: MealType;
  timeLabel: string;               // "7:00 AM" or "After waking"
  calorieTarget: number;
  proteinTarget: number;
  caloriePercent: number;          // % of daily calories
};

export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "pre_workout"
  | "post_workout"
  | "snack";

/** A food selection within a meal. */
export type MealFoodItem = {
  food: FoodItem;
  servings: number;                // multiplier of serving_size
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
  isProvidedMeal: boolean;         // true = PG/Hostel/Home provided (free)
  isAddOn: boolean;                // true = user-purchased add-on
};

/** A fully assembled meal. */
export type AssembledMeal = {
  slot: MealSlot;
  items: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;               // daily cost for this meal
  prepInstructions: string;
  sourceLabel: string;             // "PG-provided meal", "You cook", etc.
};

/** A single grocery item in the 30-day list. */
export type GroceryListItem = {
  name: string;
  food: FoodItem;
  dailyServings: number;
  dailyGrams: number;
  monthlyQuantity: number;         // in retail units
  unit: string;                    // "kg", "pieces", "liters", "packs", etc.
  estimatedPrice: number;          // monthly cost in ₹
  category: string;
  isOptional: boolean;
  reason: string;
  usedInMeals: string[];           // which meals reference this food
  proteinPerServing: number;
  caloriesPerServing: number;
};

/** Complete deterministic nutrition plan output. */
export type DeterministicNutritionPlan = {
  targets: NutritionTargets;
  meals: AssembledMeal[];
  grocery: GroceryListItem[];
  dailyCost: number;
  monthlyCost: number;
  budgetUtilization: number;       // 0-1 percentage
  budgetTier: BudgetTier;
  guidance: string;                // Luna's deterministic guidance
  environmentLabel: string;        // "PG-provided", "Self-cooked", etc.
  naturalFoodsOnly: true;          // always true — brand marker
};

/** Configuration for a specific fitness goal. */
export type GoalConfig = {
  calorieAdjustment: number;       // calories added/subtracted from TDEE
  proteinMultiplier: number;       // g per kg body weight
  carbPercent: number;             // % of remaining calories after protein
  fatPercent: number;              // % of remaining calories after protein
  description: string;
};

/** Meal structure template based on meals_per_day. */
export type MealStructure = {
  slots: Array<{
    name: string;
    type: MealType;
    caloriePercent: number;
  }>;
};

/** Budget range parsed from profile string. */
export type ParsedBudget = {
  min: number;
  max: number;
  tier: BudgetTier;
  isOpenEnded: boolean;
  dailyBudget: number;
};

/** Serving size parsed from food string. */
export type ParsedServing = {
  quantity: number;
  unit: string;
  grams: number;
};
