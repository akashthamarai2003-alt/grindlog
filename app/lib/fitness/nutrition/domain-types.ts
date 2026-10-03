// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine v2.0 - Core Domain Models & Types
// File: lib/fitness/nutrition/domain-types.ts
// ─────────────────────────────────────────────────────────────

export type PortionType = "DISCRETE" | "CONTINUOUS";
export type VariantTier = "LIGHT" | "REGULAR" | "HIGH_ENERGY" | "HIGH_PROTEIN";
export type ImageStatus = "DRAFT" | "APPROVED" | "REJECTED";
export type IngredientRole = "PRIMARY_PROTEIN" | "STAPLE_CARB" | "VEGGIE" | "FAT_SEASONING" | "OPTIONAL_SIDE";
export type MealSlotType = "breakfast" | "lunch" | "dinner" | "pre_workout" | "post_workout" | "snack";
export type DietCategory = "vegan" | "vegetarian" | "eggetarian" | "non-veg";
export type PlanStatus = "GENERATING" | "READY" | "NEEDS_REVIEW" | "COMPLETED" | "FAILED" | "SUPERSEDED";
export type PlannedMealStatus = "PLANNED" | "LOGGED" | "SKIPPED" | "CANCELLED";
export type PlannedMealSource = "RECIPE" | "TEMPLATE";
export type BudgetPolicy = "STRICT" | "FLEXIBLE";

/** Specific cooking equipment flags */
export type CookingEquipment =
  | "stove"
  | "kettle"
  | "microwave"
  | "blender"
  | "toaster"
  | "oven"
  | "air_fryer"
  | "none";

/** Data-driven portion rule per food item */
export interface PortionRule {
  id: string;
  foodId: string;
  portionType: PortionType;
  unit: string;
  minPortion: number;
  defaultPortion: number;
  maxSensiblePortion: number;
  incrementStep: number;
}

/** Regional and unit-aware food pricing */
export interface FoodPrice {
  id: string;
  foodId: string;
  priceInr: number;
  quantity: number;
  quantityUnit: string;
  regionCode: string;
  source: string;
  effectiveFrom: string;
}

/** Canonical recipe entity */
export interface Recipe {
  id: string;
  slug: string;
  currentVersionId: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

/** Immutable recipe content version */
export interface RecipeVersion {
  id: string;
  recipeId: string;
  version: number;
  name: string;
  description: string | null;
  dietCategory: DietCategory;
  compatibleDiets: DietCategory[];
  dietaryTags: string[];
  cuisine: string;
  prepInstructions: string;
  cookingTimeMin: number;
  difficulty: "easy" | "medium" | "advanced";
  requiredEquipment: CookingEquipment[];
  supportedEnvironments: string[];
  primaryProtein: string;
  isLocked: boolean;
  createdAt: string;
}

/** Pre-validated recipe macro tier */
export interface RecipeVariant {
  id: string;
  recipeVersionId: string;
  variantTier: VariantTier;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  createdAt: string;
}

/** Normalized recipe ingredient attached to a variant */
export interface RecipeVariantIngredient {
  id: string;
  recipeVariantId: string;
  foodId: string;
  foodName?: string;
  portionType: PortionType;
  amount: number;
  unit: string;
  minPortion?: number;
  maxPortion?: number;
  incrementStep?: number;
  role: IngredientRole;
  isRemovable: boolean;
  caloriesPerUnit?: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  costPerUnit?: number;
}

/** Approved image asset with durable storage path */
export interface RecipeImage {
  id: string;
  recipeVersionId: string;
  storagePath: string;
  url: string;
  status: ImageStatus;
  altText: string;
  dominantFoods: string[];
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Environment meal template archetype */
export interface MealTemplate {
  id: string;
  name: string;
  code: string;
  environment: string;
  mealSlot: MealSlotType;
  description: string | null;
  createdAt: string;
}

/** Slot within a meal template */
export interface MealTemplateSlot {
  id: string;
  templateId: string;
  slotName: string;
  role: IngredientRole;
  isProvided: boolean;
  isMandatory: boolean;
  createdAt: string;
}

/** Database-driven option for a template slot */
export interface MealTemplateSlotOption {
  id: string;
  templateSlotId: string;
  foodId: string | null;
  recipeVersionId: string | null;
  defaultPortion: number;
  unit: string;
  priority: number;
  dietCategory: DietCategory;
  compatibleDiets: DietCategory[];
  requiredEquipment: CookingEquipment[];
  isActive: boolean;
  createdAt: string;
}

/** Scheduled timeline meal */
export interface PlannedMeal {
  id: string;
  mealPlanId: string;
  localDate: string;
  mealSlot: MealSlotType;
  mealSequence: number;
  scheduledTime: string | null; // e.g. "08:00:00"
  sourceType: PlannedMealSource;
  recipeVersionId: string | null;
  recipeVariantId: string | null;
  mealTemplateId: string | null;
  imageAssetId: string | null;
  imageStoragePathSnapshot: string | null;
  imageUrlSnapshot: string | null;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbsSnapshot: number;
  fatSnapshot: number;
  costSnapshot: number;
  status: PlannedMealStatus;
  createdAt: string;
  items?: PlannedMealItem[];
}

/** Component portion of a planned meal */
export interface PlannedMealItem {
  id: string;
  plannedMealId: string;
  foodId: string;
  foodName?: string;
  quantity: number;
  portionType: PortionType;
  unit: string;
  ingredientRole: IngredientRole;
  isProvided: boolean;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbsSnapshot: number;
  fatSnapshot: number;
  costSnapshot: number;
}

/** Structured available pantry item */
export interface AvailablePantryFood {
  name: string;
  quantity?: number;
  unit?: string;
}

/** Complete user planning profile input */
export interface UserPlanningProfile {
  userId: string;
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number | null;
  goal: string;
  fitnessLevel: string;
  activityLevel: string;
  dietPreference: DietCategory;
  foodEnvironment: "I Cook" | "Home" | "PG" | "Hostel" | "Office/Canteen";
  mealsPerDay: number;
  monthlyBudgetInr: number;
  weeklyBudgetTargetInr: number;
  budgetPolicy: BudgetPolicy;
  allergies: string[];
  dislikedFoods: string[];
  avoidedFoods: string[];
  availableEquipment: CookingEquipment[] | null;
  messAvailable: boolean;
  messMeals: MealSlotType[];
  messIncludedInBudget: boolean;
  availableFoods: AvailablePantryFood[];
  workoutTime: string | null;
  wakeTime: string | null;
  sleepTime: string | null;
  timezone: string;
}

/** Quality metrics evaluated across a candidate week */
export interface PlanQualityMetrics {
  hardConstraintPass: boolean;
  calorieFit: number;        // 0 to 1
  proteinFit: number;        // 0 to 1
  budgetFit: number;         // 0 to 1
  varietyFit: number;        // 0 to 1
  preferenceFit: number;     // 0 to 1
  environmentFit: number;    // 0 to 1
  availableFoodFit: number;  // 0 to 1
  compositeScore: number;    // 0 to 100
  failureReasons?: string[];
}

/**
 * Normalizes an allergen term into synonymous medical/culinary terms.
 */
export function normalizeAllergen(allergen: string): string[] {
  const norm = allergen.toLowerCase().trim();
  if (norm.includes("milk") || norm.includes("dairy") || norm.includes("lactose")) {
    return ["milk", "dairy", "lactose"];
  }
  if (norm.includes("wheat") || norm.includes("gluten")) {
    return ["wheat", "gluten"];
  }
  if (norm.includes("egg")) {
    return ["egg", "eggs"];
  }
  if (norm.includes("soy")) {
    return ["soy", "soya"];
  }
  if (norm.includes("peanut")) {
    return ["peanut", "peanuts"];
  }
  if (norm.includes("tree nut") || norm.includes("nut") || norm.includes("almond") || norm.includes("walnut") || norm.includes("cashew")) {
    return ["tree_nuts", "tree_nut", "nuts", "nut", "almond", "walnut", "cashew"];
  }
  if (norm.includes("fish")) {
    return ["fish", "seafood"];
  }
  if (norm.includes("shellfish") || norm.includes("prawn") || norm.includes("shrimp") || norm.includes("crab")) {
    return ["shellfish", "seafood", "prawns", "prawn", "shrimp", "crab"];
  }
  if (norm.includes("sesame")) {
    return ["sesame", "til"];
  }
  if (norm.includes("mustard")) {
    return ["mustard", "sarson"];
  }
  return [norm];
}

/**
 * Checks if a food allergen matches any user declared allergy using normalized synonym sets.
 */
export function matchesAllergen(userAllergy: string, foodAllergen: string): boolean {
  const userForms = normalizeAllergen(userAllergy);
  const foodForms = normalizeAllergen(foodAllergen);
  return userForms.some(u => foodForms.some(f => u === f || u.includes(f) || f.includes(u)));
}
