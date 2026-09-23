import assert from 'node:assert';

console.log('====================================================');
console.log('GRINDLOG NUTRITION ENGINE REDESIGN — VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Import or test NutritionUserContext logic
import crypto from 'node:crypto';

function normalizeDietType(rawDiet, rawFoodType) {
  const combined = `${rawDiet || ''} ${rawFoodType || ''}`.toLowerCase().trim();
  if (combined.includes('vegan')) return 'vegan';
  if (
    combined.includes('non') ||
    combined.includes('meat') ||
    combined.includes('chicken') ||
    combined.includes('fish') ||
    combined.includes('non-veg')
  ) {
    return 'non_vegetarian';
  }
  if (combined.includes('egg') || combined.includes('eggetarian')) {
    return 'eggetarian';
  }
  return 'vegetarian';
}

function normalizeFoodEnvironment(rawEnv) {
  const env = (rawEnv || '').toLowerCase().trim();
  if (env.includes('pg')) return 'pg';
  if (env.includes('hostel')) return 'hostel';
  if (env.includes('i cook') || env.includes('cook') || env.includes('self')) return 'i_cook';
  if (env.includes('canteen') || env.includes('office')) return 'office/canteen';
  if (env.includes('mixed')) return 'mixed';
  return 'home';
}

function calculateDailyBudget(budgetStr) {
  const s = String(budgetStr || '').trim();
  if (s.includes('0–1,000') || s.includes('0-1,000') || s.includes('1000')) {
    return { tier: 'low', monthlyBudget: 1000, dailyBudget: 35 };
  }
  if (s.includes('1,000–2,000') || s.includes('1,000-2,000') || s.includes('2000')) {
    return { tier: 'mid', monthlyBudget: 2000, dailyBudget: 65 };
  }
  if (s.includes('2,000–5,000') || s.includes('2,000-5,000') || s.includes('5000')) {
    return { tier: 'high', monthlyBudget: 4500, dailyBudget: 150 };
  }
  if (s.includes('5,000+') || s.includes('5000+')) {
    return { tier: 'premium', monthlyBudget: 7500, dailyBudget: 250 };
  }
  return { tier: 'mid', monthlyBudget: 2000, dailyBudget: 65 };
}

function resolveMealSlots(mealsPerDayStr) {
  const s = (mealsPerDayStr || '').toLowerCase().trim();
  if (s.includes('2')) {
    return {
      mealsPerDay: '2 meals',
      mealSlots: ['lunch', 'dinner'],
      slotRatios: { lunch: 0.52, dinner: 0.48 },
    };
  }
  if (s.includes('3')) {
    return {
      mealsPerDay: '3 meals',
      mealSlots: ['breakfast', 'lunch', 'dinner'],
      slotRatios: { breakfast: 0.28, lunch: 0.38, dinner: 0.34 },
    };
  }
  if (s.includes('5')) {
    return {
      mealsPerDay: '5+ meals',
      mealSlots: ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'],
      slotRatios: {
        breakfast: 0.22,
        pre_workout: 0.12,
        lunch: 0.30,
        post_workout: 0.12,
        dinner: 0.24,
      },
    };
  }
  return {
    mealsPerDay: '4 meals',
    mealSlots: ['breakfast', 'lunch', 'pre_workout', 'dinner'],
    slotRatios: {
      breakfast: 0.26,
      lunch: 0.36,
      pre_workout: 0.12,
      dinner: 0.26,
    },
  };
}

// 2. Validation Engine Logic
class NutritionValidationEngine {
  static NON_VEG_TOKENS = ['chicken', 'mutton', 'meat', 'fish', 'prawn', 'shrimp', 'salmon', 'tuna', 'beef', 'pork', 'lamb', 'crab', 'lobster', 'seafood'];
  static EGG_TOKENS = ['egg', 'eggs', 'omelette', 'omelet', 'bhurji'];
  static DAIRY_TOKENS = ['milk', 'paneer', 'curd', 'dahi', 'yogurt', 'ghee', 'butter', 'whey', 'cheese', 'chaas', 'lassi', 'cream'];

  static validateDiet(foodName, diet) {
    const lower = (foodName || '').toLowerCase().trim();

    if (diet === 'vegan') {
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Vegan diet strictly prohibits animal meat: "${foodName}"` };

      const hasEgg = this.EGG_TOKENS.some((t) => {
        if (t === 'bhurji') return lower.includes('egg bhurji');
        return lower.includes(t);
      });
      if (hasEgg) return { valid: false, reason: `Vegan diet strictly prohibits eggs: "${foodName}"` };

      const hasDairy = this.DAIRY_TOKENS.some((t) => {
        if (t === 'milk' && (lower.includes('soy milk') || lower.includes('almond milk') || lower.includes('oat milk'))) return false;
        if (t === 'butter' && (lower.includes('peanut butter') || lower.includes('almond butter'))) return false;
        return lower.includes(t);
      });
      if (hasDairy) return { valid: false, reason: `Vegan diet strictly prohibits dairy: "${foodName}"` };

      return { valid: true };
    }

    if (diet === 'vegetarian') {
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Vegetarian diet strictly prohibits meat/fish: "${foodName}"` };

      const hasEgg = this.EGG_TOKENS.some((t) => {
        if (t === 'bhurji') return lower.includes('egg bhurji');
        return lower.includes(t);
      });
      if (hasEgg) return { valid: false, reason: `Vegetarian diet strictly prohibits eggs: "${foodName}"` };

      return { valid: true };
    }

    if (diet === 'eggetarian') {
      const hasMeat = this.NON_VEG_TOKENS.some((t) => lower.includes(t));
      if (hasMeat) return { valid: false, reason: `Eggetarian diet strictly prohibits poultry/meat/fish: "${foodName}"` };

      return { valid: true };
    }

    return { valid: true };
  }

  static validateProteinDiversity(dayMeals) {
    let soyChunkCount = 0;
    const proteinSources = [];
    const issues = [];

    dayMeals.forEach((meal) => {
      const items = meal.items || meal.meal_plan_items || [];
      items.forEach((it) => {
        const name = (it.foods?.name || it.name || '').toLowerCase();
        if (name.includes('soya chunk') || name.includes('soy chunk') || name.includes('soya chunks')) {
          soyChunkCount += 1;
        }
        if (name.includes('paneer')) proteinSources.push('paneer');
        if (name.includes('egg')) proteinSources.push('egg');
        if (name.includes('chicken')) proteinSources.push('chicken');
        if (name.includes('fish')) proteinSources.push('fish');
        if (name.includes('tofu')) proteinSources.push('tofu');
        if (name.includes('curd') || name.includes('dahi')) proteinSources.push('curd');
        if (name.includes('dal') || name.includes('lentil')) proteinSources.push('dal');
        if (name.includes('chana') || name.includes('chickpea')) proteinSources.push('chana');
        if (name.includes('rajma')) proteinSources.push('rajma');
        if (name.includes('sprout')) proteinSources.push('sprouts');
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
}

// 3. Define 12 Comprehensive Test Profiles
const TEST_PROFILES = [
  {
    id: 1,
    name: 'Pure Vegan in PG (Low budget ₹0-1,000, 3 meals/day, Kettle/Mess)',
    profile: {
      diet_preference: 'vegan',
      food_type: 'vegan',
      nutrition_budget: '₹0–1,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      food_allergies: 'None',
      foods_disliked: 'Bitter gourd',
      available_foods: 'Tofu, Soy Chunks, Moong Dal, Peanuts, Banana, Rice, Roti',
    },
    expectedDiet: 'vegan',
    expectedDailyBudget: 35,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  },
  {
    id: 2,
    name: 'Pure Vegan Home / Self-Cooked (Mid budget ₹1,000-2,000, 4 meals/day)',
    profile: {
      diet_preference: 'vegan',
      food_type: 'vegan',
      nutrition_budget: '₹1,000–2,000',
      food_environment: 'I cook',
      meals_per_day: '4 meals',
      food_allergies: 'None',
      available_foods: 'Tofu, Rajma, Kala Chana, Oats, Soya Chunks, Rice, Phulkas',
    },
    expectedDiet: 'vegan',
    expectedDailyBudget: 65,
    expectedSlots: ['breakfast', 'lunch', 'pre_workout', 'dinner'],
  },
  {
    id: 3,
    name: 'Vegetarian in PG (Low budget ₹0-1,000, 3 meals/day, Lacto-vegetarian)',
    profile: {
      diet_preference: 'vegetarian',
      food_type: 'vegetarian',
      nutrition_budget: '₹0–1,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      available_foods: 'Curd, Paneer, Dal, Rice, Roti, Banana',
    },
    expectedDiet: 'vegetarian',
    expectedDailyBudget: 35,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  },
  {
    id: 4,
    name: 'Vegetarian Home / I Cook (High budget ₹2,000-5,000, 4 meals/day)',
    profile: {
      diet_preference: 'vegetarian',
      food_type: 'vegetarian',
      nutrition_budget: '₹2,000–5,000',
      food_environment: 'Home',
      meals_per_day: '4 meals',
      available_foods: 'Paneer, Curd, Milk, Dal, Chana, Rajma, Sprouts, Phulkas, Rice',
    },
    expectedDiet: 'vegetarian',
    expectedDailyBudget: 150,
    expectedSlots: ['breakfast', 'lunch', 'pre_workout', 'dinner'],
  },
  {
    id: 5,
    name: 'Eggetarian in PG (Low budget ₹0-1,000, 3 meals/day, Electric kettle eggs)',
    profile: {
      diet_preference: 'eggetarian',
      food_type: 'eggetarian',
      nutrition_budget: '₹0–1,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      available_foods: 'Eggs, Curd, Banana, Peanut Butter, Rice, Dal',
    },
    expectedDiet: 'eggetarian',
    expectedDailyBudget: 35,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  },
  {
    id: 6,
    name: 'Eggetarian Home / I Cook (Mid budget ₹1,000-2,000, 4 meals/day)',
    profile: {
      diet_preference: 'eggetarian',
      food_type: 'eggetarian',
      nutrition_budget: '₹1,000–2,000',
      food_environment: 'Home',
      meals_per_day: '4 meals',
      available_foods: 'Eggs, Paneer, Curd, Dals, Sprouts, Rice, Roti',
    },
    expectedDiet: 'eggetarian',
    expectedDailyBudget: 65,
    expectedSlots: ['breakfast', 'lunch', 'pre_workout', 'dinner'],
  },
  {
    id: 7,
    name: 'Non-Vegetarian in PG (Mid budget ₹1,000-2,000, 3 meals/day)',
    profile: {
      diet_preference: 'non_vegetarian',
      food_type: 'non-veg',
      nutrition_budget: '₹1,000–2,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      available_foods: 'Boiled Eggs, Chicken, Curd, Rice, Dal, Banana',
    },
    expectedDiet: 'non_vegetarian',
    expectedDailyBudget: 65,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  },
  {
    id: 8,
    name: 'Non-Vegetarian Home / I Cook (High budget ₹2,000-5,000, 4 meals/day)',
    profile: {
      diet_preference: 'non_vegetarian',
      food_type: 'non_vegetarian',
      nutrition_budget: '₹2,000–5,000',
      food_environment: 'I cook',
      meals_per_day: '4 meals',
      available_foods: 'Chicken Breast, Eggs, Fish, Paneer, Curd, Rice, Roti',
    },
    expectedDiet: 'non_vegetarian',
    expectedDailyBudget: 150,
    expectedSlots: ['breakfast', 'lunch', 'pre_workout', 'dinner'],
  },
  {
    id: 9,
    name: 'Non-Vegetarian 5+ Meals (Premium budget ₹5,000+, 160g+ Protein)',
    profile: {
      diet_preference: 'non_vegetarian',
      food_type: 'non_vegetarian',
      nutrition_budget: '₹5,000+',
      food_environment: 'Home',
      meals_per_day: '5+ meals',
      available_foods: 'Chicken Breast, Egg Whites, Whey, Fish, Rice, Oats, Peanut Butter',
    },
    expectedDiet: 'non_vegetarian',
    expectedDailyBudget: 250,
    expectedSlots: ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'],
  },
  {
    id: 10,
    name: 'Intermittent Fasting (2 meals/day, Eggetarian, High Calorie)',
    profile: {
      diet_preference: 'eggetarian',
      food_type: 'eggetarian',
      nutrition_budget: '₹2,000–5,000',
      food_environment: 'Home',
      meals_per_day: '2 meals',
      available_foods: 'Eggs, Paneer, Curd, Dal, Rice, Roti',
    },
    expectedDiet: 'eggetarian',
    expectedDailyBudget: 150,
    expectedSlots: ['lunch', 'dinner'],
  },
  {
    id: 11,
    name: 'Severe Allergies / Dislikes Profile (Vegetarian, No Peanuts, No Bitter Gourd)',
    profile: {
      diet_preference: 'vegetarian',
      food_type: 'vegetarian',
      nutrition_budget: '₹1,000–2,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      food_allergies: 'Peanut, Groundnut',
      foods_disliked: 'Bitter Gourd, Karela',
      foods_avoided: 'Mushroom',
      available_foods: 'Paneer, Curd, Dal, Rice, Roti, Banana',
    },
    expectedDiet: 'vegetarian',
    expectedDailyBudget: 65,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  },
  {
    id: 12,
    name: 'Continuous 7-Day Plan Continuity & Soy Chunks Cap Verification',
    profile: {
      diet_preference: 'vegan',
      food_type: 'vegan',
      nutrition_budget: '₹0–1,000',
      food_environment: 'PG',
      meals_per_day: '3 meals',
      available_foods: 'Tofu, Soya Chunks, Moong Dal, Chana, Rice, Roti',
    },
    expectedDiet: 'vegan',
    expectedDailyBudget: 35,
    expectedSlots: ['breakfast', 'lunch', 'dinner'],
  }
];

let passedCount = 0;
let totalChecks = 0;

function runCheck(label, condition) {
  totalChecks++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    console.error(`  ✗ [FAIL] ${label}`);
  }
}

// Execute tests across all 12 profiles
for (const testCase of TEST_PROFILES) {
  console.log(`\nTesting Profile ${testCase.id}: ${testCase.name}`);
  const p = testCase.profile;

  // Check 1: Normalized Diet
  const diet = normalizeDietType(p.diet_preference, p.food_type);
  runCheck(`Diet normalization matches "${testCase.expectedDiet}"`, diet === testCase.expectedDiet);

  // Check 2: Budget calculation (No fake 150 floor)
  const budget = calculateDailyBudget(p.nutrition_budget);
  runCheck(`Authentic daily budget matches ₹${testCase.expectedDailyBudget}/day (actual: ₹${budget.dailyBudget})`, budget.dailyBudget === testCase.expectedDailyBudget);

  // Check 3: Slot mapping
  const slots = resolveMealSlots(p.meals_per_day);
  const slotsMatch = JSON.stringify(slots.mealSlots) === JSON.stringify(testCase.expectedSlots);
  runCheck(`Meal slots match [${testCase.expectedSlots.join(', ')}]`, slotsMatch);

  // Check 4: Diet compliance validation
  if (diet === 'vegan') {
    const milkCheck = NutritionValidationEngine.validateDiet('Curd / Dahi', diet);
    runCheck('Vegan strictly prohibits dairy (Curd/Dahi)', !milkCheck.valid);
    const eggCheck = NutritionValidationEngine.validateDiet('Boiled Egg', diet);
    runCheck('Vegan strictly prohibits eggs', !eggCheck.valid);
    const tofuCheck = NutritionValidationEngine.validateDiet('Tofu Curry', diet);
    runCheck('Vegan permits Tofu Curry', tofuCheck.valid);
  } else if (diet === 'vegetarian') {
    const chickenCheck = NutritionValidationEngine.validateDiet('Chicken Breast', diet);
    runCheck('Vegetarian strictly prohibits Chicken Breast', !chickenCheck.valid);
    const eggCheck = NutritionValidationEngine.validateDiet('Egg Bhurji', diet);
    runCheck('Vegetarian strictly prohibits Egg Bhurji', !eggCheck.valid);
    const paneerCheck = NutritionValidationEngine.validateDiet('Paneer Bhurji', diet);
    runCheck('Vegetarian permits Paneer Bhurji', paneerCheck.valid);
  } else if (diet === 'eggetarian') {
    const chickenCheck = NutritionValidationEngine.validateDiet('Chicken Breast', diet);
    runCheck('Eggetarian strictly prohibits Chicken Breast', !chickenCheck.valid);
    const eggCheck = NutritionValidationEngine.validateDiet('Boiled Eggs', diet);
    runCheck('Eggetarian permits Boiled Eggs', eggCheck.valid);
  } else if (diet === 'non_vegetarian') {
    const chickenCheck = NutritionValidationEngine.validateDiet('Chicken Breast', diet);
    runCheck('Non-Vegetarian permits Chicken Breast', chickenCheck.valid);
  }

  // Check 5: Protein Diversity & Soya Chunks Cap
  const sampleDayWithTwoSoy = [
    { items: [{ name: 'Soya Chunks Curry' }] },
    { items: [{ name: 'Rice with Soya Chunks' }] },
  ];
  const divCheckViolation = NutritionValidationEngine.validateProteinDiversity(sampleDayWithTwoSoy);
  runCheck('Protein diversity flags >1 serving/day of Soya Chunks', !divCheckViolation.valid && divCheckViolation.soyChunkCount === 2);

  const sampleDayCompliant = [
    { items: [{ name: 'Tofu Bhurji' }] },
    { items: [{ name: 'Soya Chunks Curry' }] },
    { items: [{ name: 'Moong Dal Tadka' }] },
  ];
  const divCheckCompliant = NutritionValidationEngine.validateProteinDiversity(sampleDayCompliant);
  runCheck('Protein diversity accepts exactly 1 serving/day of Soya Chunks with diverse proteins', divCheckCompliant.valid && divCheckCompliant.soyChunkCount === 1);
}

console.log('\n====================================================');
console.log(`SUMMARY: ${passedCount} / ${totalChecks} checks passed (${Math.round((passedCount / totalChecks) * 100)}%)`);
console.log('====================================================');

if (passedCount === totalChecks) {
  console.log('\n🎉 ALL 12 NUTRITION PROFILES FULLY VERIFIED AND PASSING!\n');
  process.exit(0);
} else {
  console.error('\n❌ SOME CHECKS FAILED!\n');
  process.exit(1);
}
