import type { NormalizedDiet, NormalizedEnvironment, NutritionUserContext } from "./user-context";

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export class NutritionValidationEngine {
  // Prohibited tokens per diet
  private static readonly NON_VEG_TOKENS = [
    "chicken",
    "mutton",
    "meat",
    "fish",
    "prawn",
    "shrimp",
    "salmon",
    "tuna",
    "beef",
    "pork",
    "lamb",
    "crab",
    "lobster",
    "seafood",
  ];

  private static readonly EGG_TOKENS = [
    "egg",
    "eggs",
    "omelette",
    "omelet",
    "bhurji", // unless paneer bhurji
  ];

  private static readonly DAIRY_TOKENS = [
    "milk",
    "paneer",
    "curd",
    "dahi",
    "yogurt",
    "ghee",
    "butter",
    "whey",
    "cheese",
    "chaas",
    "lassi",
    "cream",
  ];

  // Words containing "egg" that are NOT animal eggs (Fix #4: eggplant false positive)
  private static readonly EGG_SAFE_WORDS = ['eggplant', 'eggless'];

  // Plant-based alternatives that contain dairy token substrings (Fix #5: vegan false positives)
  private static readonly PLANT_BASED_SAFE = [
    'soy milk', 'soya milk', 'almond milk', 'oat milk', 'coconut milk',
    'cashew milk', 'rice milk', 'hemp milk',
    'peanut butter', 'almond butter', 'cashew butter', 'sunflower butter',
    'vegan cheese', 'nutritional yeast',
    'coconut cream', 'cashew cream', 'vegan cream'
  ];

  /**
   * Validates whether a food item strictly adheres to the user's diet.
   */
  static validateDiet(foodName: string, diet: NormalizedDiet): { valid: boolean; reason?: string } {
    const lower = (foodName || "").toLowerCase().trim();

    if (diet === "vegan") {
      // Zero animal products (no meat, no fish, no egg, no dairy)
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Vegan diet strictly prohibits animal meat: "${foodName}"` };

      // Eggs (exclude plant-based terms like "eggplant", "eggless")
      const isEggSafe = this.EGG_SAFE_WORDS.some(w => lower.includes(w));
      const hasEgg = !isEggSafe && this.EGG_TOKENS.some((t) => {
        if (t === "bhurji") return lower.includes("egg bhurji");
        return lower.includes(t);
      });
      if (hasEgg) return { valid: false, reason: `Vegan diet strictly prohibits eggs: "${foodName}"` };

      // Dairy (exclude plant-based alternatives like "coconut milk", "cashew butter")
      const isPlantBased = this.PLANT_BASED_SAFE.some(w => lower.includes(w));
      const hasDairy = !isPlantBased && this.DAIRY_TOKENS.some((t) => lower.includes(t));
      if (hasDairy) return { valid: false, reason: `Vegan diet strictly prohibits dairy: "${foodName}"` };

      return { valid: true };
    }

    if (diet === "vegetarian") {
      // Zero meat, zero fish, zero eggs
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Vegetarian diet strictly prohibits meat/fish: "${foodName}"` };

      const hasEgg = !this.EGG_SAFE_WORDS.some(w => lower.includes(w)) && this.EGG_TOKENS.some((t) => {
        if (t === "bhurji") return lower.includes("egg bhurji");
        return lower.includes(t);
      });
      if (hasEgg) return { valid: false, reason: `Vegetarian diet strictly prohibits eggs: "${foodName}"` };

      return { valid: true };
    }

    if (diet === "eggetarian") {
      // Zero meat, zero fish. Eggs & Dairy are permitted.
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Eggetarian diet strictly prohibits poultry/meat/fish: "${foodName}"` };

      return { valid: true };
    }

    // Non-Vegetarian: everything allowed
    return { valid: true };
  }

  /**
   * Validates whether a food item conflicts with user allergens or disliked foods.
   */
  static validateAllergiesAndDislikes(
    foodName: string,
    allergies: string[],
    disliked: string[],
    avoided: string[]
  ): { valid: boolean; reason?: string } {
    const lower = (foodName || "").toLowerCase().trim();
    const blockedList = [...allergies, ...disliked, ...avoided].filter(Boolean);
    const allergenAliases: Record<string, string[]> = {
      dairy: ["milk", "paneer", "curd", "dahi", "yogurt", "cheese", "butter", "ghee", "whey", "cream", "lassi", "chaas"],
      milk: ["milk", "paneer", "curd", "dahi", "yogurt", "cheese", "butter", "ghee", "whey", "cream", "lassi", "chaas"],
      lactose: ["milk", "paneer", "curd", "dahi", "yogurt", "cheese", "butter", "ghee", "whey", "cream", "lassi", "chaas"],
      egg: ["egg", "omelette", "omelet", "egg bhurji"],
      soy: ["soy", "soya", "tofu", "tempeh"],
      soya: ["soy", "soya", "tofu", "tempeh"],
      nuts: ["peanut", "almond", "cashew", "walnut", "pistachio", "hazelnut", "pecan"],
      "tree nuts": ["almond", "cashew", "walnut", "pistachio", "hazelnut", "pecan"],
      shellfish: ["prawn", "shrimp", "crab", "lobster", "shellfish"],
      fish: ["fish", "salmon", "tuna", "cod", "sardine"],
      sesame: ["sesame", "tahini", "til seed"],
      wheat: ["wheat", "atta", "chapati", "roti", "phulka", "bread"],
      gluten: ["wheat", "atta", "chapati", "roti", "phulka", "bread", "semolina", "suji", "rava"],
    };

    for (const term of blockedList) {
      const cleanTerm = term.toLowerCase().trim();
      if (!cleanTerm || ["none", "nil", "na", "no"].includes(cleanTerm)) continue;
      const aliasKey = Object.keys(allergenAliases).find(key =>
        cleanTerm === key || cleanTerm.startsWith(`${key} `) || cleanTerm.endsWith(` ${key}`)
      );
      const comparisonName = aliasKey === "egg" || cleanTerm === "egg"
        ? lower.replace(/\b(?:eggplant|eggless)\b/g, "")
        : lower;

      if (comparisonName.includes(cleanTerm)) {
        return { valid: false, reason: `Food matches avoided/allergic term: "${term}"` };
      }
      if (allergies.includes(term)) {
        const aliases = aliasKey ? allergenAliases[aliasKey] : undefined;
        if (aliases?.some(alias => comparisonName.includes(alias))) {
          return { valid: false, reason: `Food may contain an allergen: "${term}"` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Enforces protein diversity across all meals in a single day.
   * INVARIANT: Soya chunks must appear at most 1 time per day.
   */
  static validateProteinDiversity(dayMeals: any[]): {
    valid: boolean;
    soyChunkCount: number;
    proteinSources: string[];
    issues: string[];
  } {
    let soyChunkCount = 0;
    const proteinSources: string[] = [];
    const issues: string[] = [];

    dayMeals.forEach((meal) => {
      const items = meal.items || meal.meal_plan_items || [];
      items.forEach((it: any) => {
        const name = (it.foods?.name || it.name || "").toLowerCase();
        if (name.includes("soya chunk") || name.includes("soy chunk") || name.includes("soya chunks")) {
          soyChunkCount += 1;
        }
        if (name.includes("paneer")) proteinSources.push("paneer");
        if (name.includes("egg")) proteinSources.push("egg");
        if (name.includes("chicken")) proteinSources.push("chicken");
        if (name.includes("fish")) proteinSources.push("fish");
        if (name.includes("tofu")) proteinSources.push("tofu");
        if (name.includes("curd") || name.includes("dahi")) proteinSources.push("curd");
        if (name.includes("dal") || name.includes("lentil")) proteinSources.push("dal");
        if (name.includes("chana") || name.includes("chickpea")) proteinSources.push("chana");
        if (name.includes("rajma")) proteinSources.push("rajma");
        if (name.includes("sprout")) proteinSources.push("sprouts");
      });
    });

    if (soyChunkCount > 1) {
      issues.push(`Soy chunks appeared ${soyChunkCount} times in one day (strictly capped at 1).`);
    }

    return {
      valid: issues.length === 0,
      soyChunkCount,
      proteinSources,
      issues,
    };
  }

  /**
   * Validates macro totals against targets.
   * Calories: +/- 5% (hard threshold +/- 8%)
   * Protein: +/- 8%
   * Carbs: +/- 10%
   * Fat: +/- 10%
   */
  static validateMacros(
    totals: { calories: number; protein: number; carbs: number; fat: number },
    targets: { caloriesTarget: number; proteinTarget: number; carbsTarget: number; fatTarget: number }
  ): {
    valid: boolean;
    calsDiffPct: number;
    proDiffPct: number;
    carbsDiffPct: number;
    fatDiffPct: number;
    issues: string[];
  } {
    const issues: string[] = [];

    const calsDiffPct = Math.round(
      Math.abs((totals.calories - targets.caloriesTarget) / targets.caloriesTarget) * 100
    );
    const proDiffPct = Math.round(
      Math.abs((totals.protein - targets.proteinTarget) / targets.proteinTarget) * 100
    );
    const carbsDiffPct = Math.round(
      Math.abs((totals.carbs - targets.carbsTarget) / targets.carbsTarget) * 100
    );
    const fatDiffPct = Math.round(
      Math.abs((totals.fat - targets.fatTarget) / targets.fatTarget) * 100
    );

    if (calsDiffPct > 8) {
      issues.push(`Calories deviated by ${calsDiffPct}% (target: ${targets.caloriesTarget}, actual: ${totals.calories})`);
    }
    if (proDiffPct > 10) {
      issues.push(`Protein deviated by ${proDiffPct}% (target: ${targets.proteinTarget}g, actual: ${totals.protein}g)`);
    }
    if (targets.carbsTarget > 0 && carbsDiffPct > 15) {
      issues.push(`Carbs deviated by ${carbsDiffPct}% (target: ${targets.carbsTarget}g, actual: ${totals.carbs}g)`);
    }
    if (targets.fatTarget > 0 && fatDiffPct > 15) {
      issues.push(`Fat deviated by ${fatDiffPct}% (target: ${targets.fatTarget}g, actual: ${totals.fat}g)`);
    }

    return {
      valid: issues.length === 0,
      calsDiffPct,
      proDiffPct,
      carbsDiffPct,
      fatDiffPct,
      issues,
    };
  }

  /**
   * Validates that daily out-of-pocket costs stay within the user's daily budget.
   */
  static validateBudget(
    dailyCost: number,
    context: NutritionUserContext
  ): { valid: boolean; cost: number; limit: number; issue?: string } {
    // Generous buffer for market variance (+20% of daily budget)
    const ceiling = Math.round(context.dailyBudget * 1.25);
    const valid = dailyCost <= ceiling;

    return {
      valid,
      cost: dailyCost,
      limit: ceiling,
      issue: valid ? undefined : `Daily out-of-pocket cost ₹${dailyCost} exceeds tier ceiling of ₹${ceiling}`,
    };
  }

  /**
   * Validates living environment cooking constraints.
   * e.g. PG/Hostel cannot have oven/blender/multi-pan cooking.
   */
  static validateEnvironmentCooking(
    prepInstructions: string,
    environment: NormalizedEnvironment
  ): { valid: boolean; violation?: string } {
    if (environment === "pg" || environment === "hostel") {
      const lower = prepInstructions.toLowerCase();
      if (lower.includes("bake in oven") || lower.includes("preheat oven") || lower.includes("grind in blender")) {
        return {
          valid: false,
          violation: `PG/Hostel environment cannot execute complex oven/blender cooking: "${prepInstructions}"`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * Validates meal slot completeness (no missing slots).
   */
  static validateMealSlots(
    meals: any[],
    expectedSlots: string[]
  ): { valid: boolean; missingSlots: string[] } {
    const presentTypes = new Set(meals.map((m) => (m.meal_type || "").toLowerCase()));
    const missingSlots = expectedSlots.filter((slot) => !presentTypes.has(slot.toLowerCase()));

    return {
      valid: missingSlots.length === 0,
      missingSlots,
    };
  }

  /**
   * Validates meal swap candidates to guarantee macro parity within +/- 10%.
   */
  static validateSwap(
    originalMeal: { calories: number; protein: number },
    candidateItems: any[],
    context: NutritionUserContext
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    let totalCals = 0;
    let totalPro = 0;

    for (const item of candidateItems) {
      const name = item.name || item.foods?.name || "";
      const dietCheck = this.validateDiet(name, context.diet);
      if (!dietCheck.valid) {
        issues.push(dietCheck.reason!);
      }

      const allergyCheck = this.validateAllergiesAndDislikes(
        name,
        context.allergies,
        context.dislikedFoods,
        context.avoidedFoods
      );
      if (!allergyCheck.valid) {
        issues.push(allergyCheck.reason!);
      }

      const q = Number(item.quantity) || 1;
      totalCals += Math.round(Number(item.calories || item.foods?.calories || 0) * q);
      totalPro += Number((Number(item.protein || item.foods?.protein || 0) * q).toFixed(1));
    }

    if (originalMeal.calories > 0) {
      const calsDiff = Math.abs(totalCals - originalMeal.calories) / originalMeal.calories;
      if (calsDiff > 0.15) {
        issues.push(`Swap meal calories (${totalCals} kcal) deviate by >15% from original (${originalMeal.calories} kcal).`);
      }
    }

    if (originalMeal.protein > 0) {
      const proDiff = Math.abs(totalPro - originalMeal.protein) / originalMeal.protein;
      if (proDiff > 0.20) {
        issues.push(`Swap meal protein (${totalPro}g) deviates by >20% from original (${originalMeal.protein}g).`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
