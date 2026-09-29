export const mockLiveUserNutritionData = {
  date: "2026-09-29",
  user_id: "test-user-live-123",
  timezone: "Asia/Kolkata",
  targets: {
    calories: 1800,
    protein: 110,
    carbs: 220,
    fat: 50,
    water_ml: 3000
  },
  consumed: {
    calories: 460,
    protein: 24,
    carbs: 55,
    fat: 15,
    water_ml: 750,
    spent: 35
  },
  remaining: {
    calories: 1340,
    protein: 86,
    carbs: 165,
    fat: 35,
    water_ml: 2250
  },
  progress: {
    calories_percent: 25.5,
    protein_percent: 21.8,
    water_percent: 25.0
  },
  nutrition_score: 85,
  has_ai_plan: true,
  weekly_plan_status: {
    has_active_plan: true,
    total_days: 7,
    generated_at: "2026-09-29T00:00:00Z"
  },
  is_natural_whole_food: true,
  food_environment: "Home",
  food_type: "Vegetarian",
  budget: {
    daily_limit: 250,
    spent: 35,
    remaining: 215,
    monthly_limit: 7500,
    monthly_spent: 850
  },
  meals: [
    {
      id: "live-plan-breakfast",
      meal_type: "breakfast",
      name: "Besan Cheela with Curd",
      calories: 460,
      protein: 24,
      carbs: 55,
      fat: 15,
      estimated_cost: 35,
      is_ai_generated: true,
      meal_plan_items: [
        {
          id: "item-breakfast-1",
          quantity: 1,
          calories: 350,
          protein: 18.5,
          carbs: 48.5,
          fat: 9,
          estimated_cost: 25,
          foods: {
            id: "food-besan-cheela",
            name: "Besan / Gram Flour Cheela",
            serving_size: "2 medium cheelas",
            calories: 350,
            protein: 18.5,
            carbs: 48.5,
            fat: 9,
            estimated_cost: 25
          }
        },
        {
          id: "item-breakfast-2",
          quantity: 1,
          calories: 110,
          protein: 5.5,
          carbs: 6.5,
          fat: 6,
          estimated_cost: 10,
          foods: {
            id: "food-curd",
            name: "Curd / Dahi (Plain)",
            serving_size: "1 bowl (150g)",
            calories: 110,
            protein: 5.5,
            carbs: 6.5,
            fat: 6,
            estimated_cost: 10
          }
        }
      ]
    },
    {
      id: "live-plan-lunch",
      meal_type: "lunch",
      name: "Dal Tadka with Multigrain Roti",
      calories: 520,
      protein: 22,
      carbs: 78,
      fat: 12,
      estimated_cost: 45,
      is_ai_generated: true,
      meal_plan_items: [
        {
          id: "item-lunch-1",
          quantity: 1,
          calories: 220,
          protein: 12,
          carbs: 34,
          fat: 4,
          estimated_cost: 20,
          foods: {
            id: "food-dal-tadka",
            name: "Yellow Dal Tadka",
            serving_size: "1 bowl (150g)",
            calories: 220,
            protein: 12,
            carbs: 34,
            fat: 4,
            estimated_cost: 20
          }
        },
        {
          id: "item-lunch-2",
          quantity: 2,
          calories: 240,
          protein: 8,
          carbs: 40,
          fat: 4,
          estimated_cost: 15,
          foods: {
            id: "food-roti",
            name: "Multigrain Roti / Chapati",
            serving_size: "1 chapati",
            calories: 120,
            protein: 4,
            carbs: 20,
            fat: 2,
            estimated_cost: 7.5
          }
        },
        {
          id: "item-lunch-3",
          quantity: 1,
          calories: 60,
          protein: 2,
          carbs: 4,
          fat: 4,
          estimated_cost: 10,
          foods: {
            id: "food-salad",
            name: "Cucumber & Tomato Salad",
            serving_size: "1 plate (100g)",
            calories: 60,
            protein: 2,
            carbs: 4,
            fat: 4,
            estimated_cost: 10
          }
        }
      ]
    },
    {
      id: "live-plan-dinner",
      meal_type: "dinner",
      name: "Homestyle Dal with Phulkas & Paneer Bhurji",
      calories: 580,
      protein: 28,
      carbs: 65,
      fat: 22,
      estimated_cost: 65,
      is_ai_generated: true,
      meal_plan_items: [
        {
          id: "item-dinner-1",
          quantity: 1,
          calories: 200,
          protein: 10,
          carbs: 30,
          fat: 3,
          estimated_cost: 20,
          foods: {
            id: "food-homestyle-dal",
            name: "Homestyle Toor Dal",
            serving_size: "1 bowl (150g)",
            calories: 200,
            protein: 10,
            carbs: 30,
            fat: 3,
            estimated_cost: 20
          }
        },
        {
          id: "item-dinner-2",
          quantity: 2,
          calories: 160,
          protein: 6,
          carbs: 32,
          fat: 1,
          estimated_cost: 10,
          foods: {
            id: "food-phulka",
            name: "Phulka / Roti",
            serving_size: "1 phulka",
            calories: 80,
            protein: 3,
            carbs: 16,
            fat: 0.5,
            estimated_cost: 5
          }
        },
        {
          id: "item-dinner-3",
          quantity: 1,
          calories: 220,
          protein: 12,
          carbs: 3,
          fat: 18,
          estimated_cost: 35,
          foods: {
            id: "food-paneer-bhurji",
            name: "Paneer Bhurji",
            serving_size: "1 bowl (100g)",
            calories: 220,
            protein: 12,
            carbs: 3,
            fat: 18,
            estimated_cost: 35
          }
        }
      ]
    }
  ],
  logged_foods: []
};

// ─────────────────────────────────────────────────────────
// ALL-USER PERSONA MOCK DATA FOR ONBOARDING TESTING
// ─────────────────────────────────────────────────────────

export const userPersonasData: Record<string, any> = {
  // Persona 1: Pure Vegetarian in PG (Budget ₹1k-2k, 3 Meals)
  persona_veg_pg: {
    ...mockLiveUserNutritionData,
    user_id: "user-veg-pg",
    food_environment: "PG",
    food_type: "Vegetarian",
    targets: { calories: 1750, protein: 110, carbs: 215, fat: 48, water_ml: 3000 },
    budget: { daily_limit: 66.67, spent: 30, remaining: 36.67, monthly_limit: 2000, monthly_spent: 450 },
  },

  // Persona 2: Non-Vegetarian Heavy Lifter (Home / High Budget / Bulk / 4 Meals)
  persona_nonveg_bulk: {
    date: "2026-09-29",
    user_id: "user-nonveg-bulk",
    timezone: "Asia/Kolkata",
    food_environment: "Home",
    food_type: "Non-Vegetarian",
    targets: { calories: 2500, protein: 165, carbs: 290, fat: 70, water_ml: 3800 },
    consumed: { calories: 650, protein: 45, carbs: 70, fat: 18, water_ml: 1200, spent: 65 },
    remaining: { calories: 1850, protein: 120, carbs: 220, fat: 52, water_ml: 2600 },
    progress: { calories_percent: 26, protein_percent: 27.2, water_percent: 31.5 },
    nutrition_score: 92,
    has_ai_plan: true,
    weekly_plan_status: { has_active_plan: true, total_days: 7 },
    is_natural_whole_food: true,
    budget: { daily_limit: 250, spent: 65, remaining: 185, monthly_limit: 7500, monthly_spent: 1200 },
    meals: [
      {
        id: "bulk-breakfast",
        meal_type: "breakfast",
        name: "Oatmeal with Boiled Eggs & Banana",
        calories: 650,
        protein: 38,
        carbs: 85,
        fat: 16,
        estimated_cost: 55,
        meal_plan_items: [
          { quantity: 1, calories: 300, protein: 10, carbs: 54, fat: 5, estimated_cost: 25, foods: { name: "Rolled Oats with Milk", serving_size: "1 bowl (60g)", calories: 300, protein: 10, carbs: 54, fat: 5 } },
          { quantity: 2, calories: 150, protein: 12, carbs: 1, fat: 10, estimated_cost: 15, foods: { name: "Whole Boiled Eggs", serving_size: "2 eggs", calories: 150, protein: 12, carbs: 1, fat: 10 } },
          { quantity: 3, calories: 51, protein: 11, carbs: 0.5, fat: 0.5, estimated_cost: 15, foods: { name: "Egg Whites", serving_size: "3 whites", calories: 51, protein: 11, carbs: 0.5, fat: 0.5 } }
        ]
      },
      {
        id: "bulk-lunch",
        meal_type: "lunch",
        name: "Grilled Chicken Breast with Brown Rice & Dal",
        calories: 780,
        protein: 58,
        carbs: 92,
        fat: 18,
        estimated_cost: 95,
        meal_plan_items: [
          { quantity: 1.5, calories: 247, protein: 46, carbs: 0, fat: 5, estimated_cost: 60, foods: { name: "Chicken Breast Grilled", serving_size: "150g", calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
          { quantity: 2, calories: 320, protein: 6, carbs: 68, fat: 2, estimated_cost: 20, foods: { name: "Steamed Brown Rice", serving_size: "1 bowl", calories: 160, protein: 3, carbs: 34, fat: 1 } },
          { quantity: 1, calories: 213, protein: 6, carbs: 24, fat: 11, estimated_cost: 15, foods: { name: "Yellow Moong Dal", serving_size: "1 bowl", calories: 213, protein: 6, carbs: 24, fat: 11 } }
        ]
      },
      {
        id: "bulk-snack",
        meal_type: "snack",
        name: "Peanut Butter Toast with Whey / Soya Milk",
        calories: 380,
        protein: 24,
        carbs: 42,
        fat: 12,
        estimated_cost: 40,
        meal_plan_items: [
          { quantity: 2, calories: 220, protein: 8, carbs: 30, fat: 8, estimated_cost: 20, foods: { name: "Whole Wheat Bread with Peanut Butter", serving_size: "2 slices", calories: 220, protein: 8, carbs: 30, fat: 8 } },
          { quantity: 1, calories: 160, protein: 16, carbs: 12, fat: 4, estimated_cost: 20, foods: { name: "High Protein Milk", serving_size: "1 glass (250ml)", calories: 160, protein: 16, carbs: 12, fat: 4 } }
        ]
      },
      {
        id: "bulk-dinner",
        meal_type: "dinner",
        name: "Egg Curry with Roti & Salad",
        calories: 690,
        protein: 45,
        carbs: 71,
        fat: 24,
        estimated_cost: 60,
        meal_plan_items: [
          { quantity: 2, calories: 260, protein: 18, carbs: 6, fat: 18, estimated_cost: 25, foods: { name: "Egg Curry (2 Eggs)", serving_size: "1 bowl", calories: 260, protein: 18, carbs: 6, fat: 18 } },
          { quantity: 3, calories: 330, protein: 9, carbs: 60, fat: 3, estimated_cost: 25, foods: { name: "Whole Wheat Roti", serving_size: "3 chapatis", calories: 330, protein: 9, carbs: 60, fat: 3 } },
          { quantity: 1, calories: 100, protein: 18, carbs: 5, fat: 3, estimated_cost: 10, foods: { name: "Boiled Soya Chunks Salad", serving_size: "1 bowl", calories: 100, protein: 18, carbs: 5, fat: 3 } }
        ]
      }
    ],
    logged_foods: []
  },

  // Persona 3: Eggetarian with Dairy Allergy (0 dairy, Curd/Paneer/Milk excluded!)
  persona_eggetarian_dairyfree: {
    date: "2026-09-29",
    user_id: "user-eggetarian-dairyfree",
    timezone: "Asia/Kolkata",
    food_environment: "Office/Canteen",
    food_type: "Eggetarian",
    food_allergies: "dairy",
    targets: { calories: 1600, protein: 105, carbs: 195, fat: 42, water_ml: 2800 },
    consumed: { calories: 380, protein: 25, carbs: 45, fat: 9, water_ml: 600, spent: 30 },
    remaining: { calories: 1220, protein: 80, carbs: 150, fat: 33, water_ml: 2200 },
    progress: { calories_percent: 23.7, protein_percent: 23.8, water_percent: 21.4 },
    nutrition_score: 88,
    has_ai_plan: true,
    weekly_plan_status: { has_active_plan: true, total_days: 7 },
    is_natural_whole_food: true,
    budget: { daily_limit: 150, spent: 30, remaining: 120, monthly_limit: 4500, monthly_spent: 600 },
    meals: [
      {
        id: "dairyfree-breakfast",
        meal_type: "breakfast",
        name: "Egg Bhurji with Whole Wheat Toast",
        calories: 420,
        protein: 26,
        carbs: 45,
        fat: 14,
        estimated_cost: 35,
        meal_plan_items: [
          { quantity: 2, calories: 200, protein: 14, carbs: 4, fat: 12, estimated_cost: 15, foods: { name: "Egg Bhurji (2 Eggs, No Dairy)", serving_size: "1 plate", calories: 200, protein: 14, carbs: 4, fat: 12 } },
          { quantity: 2, calories: 160, protein: 6, carbs: 32, fat: 1.5, estimated_cost: 10, foods: { name: "Brown Bread Toast", serving_size: "2 slices", calories: 160, protein: 6, carbs: 32, fat: 1.5 } },
          { quantity: 2, calories: 60, protein: 6, carbs: 9, fat: 0.5, estimated_cost: 10, foods: { name: "Egg Whites Boiled", serving_size: "2 whites", calories: 60, protein: 6, carbs: 9, fat: 0.5 } }
        ]
      },
      {
        id: "dairyfree-lunch",
        meal_type: "lunch",
        name: "Rajma Masala with Steamed Rice & Onion Salad",
        calories: 580,
        protein: 24,
        carbs: 95,
        fat: 8,
        estimated_cost: 45,
        meal_plan_items: [
          { quantity: 1, calories: 280, protein: 16, carbs: 45, fat: 5, estimated_cost: 25, foods: { name: "Rajma (Red Kidney Beans)", serving_size: "1 bowl", calories: 280, protein: 16, carbs: 45, fat: 5 } },
          { quantity: 1.5, calories: 250, protein: 5, carbs: 46, fat: 1, estimated_cost: 15, foods: { name: "Steamed White Rice", serving_size: "1.5 bowls", calories: 250, protein: 5, carbs: 46, fat: 1 } },
          { quantity: 1, calories: 50, protein: 3, carbs: 4, fat: 2, estimated_cost: 5, foods: { name: "Cucumber Onion Salad", serving_size: "1 bowl", calories: 50, protein: 3, carbs: 4, fat: 2 } }
        ]
      },
      {
        id: "dairyfree-dinner",
        meal_type: "dinner",
        name: "Boiled Egg Curry with Phulkas & Green Salad",
        calories: 600,
        protein: 35,
        carbs: 55,
        fat: 20,
        estimated_cost: 40,
        meal_plan_items: [
          { quantity: 2, calories: 220, protein: 16, carbs: 6, fat: 14, estimated_cost: 20, foods: { name: "Egg Curry without Cream/Butter", serving_size: "2 eggs", calories: 220, protein: 16, carbs: 6, fat: 14 } },
          { quantity: 2, calories: 180, protein: 6, carbs: 36, fat: 1, estimated_cost: 10, foods: { name: "Phulkas / Rotis", serving_size: "2 phulkas", calories: 180, protein: 6, carbs: 36, fat: 1 } },
          { quantity: 1, calories: 200, protein: 13, carbs: 13, fat: 5, estimated_cost: 10, foods: { name: "Sprouts & Vegetable Chaat", serving_size: "1 bowl", calories: 200, protein: 13, carbs: 13, fat: 5 } }
        ]
      }
    ],
    logged_foods: []
  },

  // Persona 4: Vegan Fitness Enthusiast (100% plant-based, Tofu, Soya)
  persona_vegan: {
    date: "2026-09-29",
    user_id: "user-vegan",
    timezone: "Asia/Kolkata",
    food_environment: "I Cook",
    food_type: "Vegan",
    targets: { calories: 1950, protein: 120, carbs: 240, fat: 52, water_ml: 3200 },
    consumed: { calories: 450, protein: 28, carbs: 55, fat: 12, water_ml: 800, spent: 40 },
    remaining: { calories: 1500, protein: 92, carbs: 185, fat: 40, water_ml: 2400 },
    progress: { calories_percent: 23, protein_percent: 23.3, water_percent: 25 },
    nutrition_score: 90,
    has_ai_plan: true,
    weekly_plan_status: { has_active_plan: true, total_days: 7 },
    is_natural_whole_food: true,
    budget: { daily_limit: 150, spent: 40, remaining: 110, monthly_limit: 4500, monthly_spent: 700 },
    meals: [
      {
        id: "vegan-breakfast",
        meal_type: "breakfast",
        name: "Tofu Scramble with Multigrain Toast",
        calories: 450,
        protein: 28,
        carbs: 55,
        fat: 12,
        estimated_cost: 40,
        meal_plan_items: [
          { quantity: 1, calories: 240, protein: 20, carbs: 6, fat: 14, estimated_cost: 25, foods: { name: "Tofu Scramble (Turmeric & Veggies)", serving_size: "150g tofu", calories: 240, protein: 20, carbs: 6, fat: 14 } },
          { quantity: 2, calories: 210, protein: 8, carbs: 49, fat: 2, estimated_cost: 15, foods: { name: "Multigrain Bread Slices", serving_size: "2 slices", calories: 210, protein: 8, carbs: 49, fat: 2 } }
        ]
      },
      {
        id: "vegan-lunch",
        meal_type: "lunch",
        name: "High Protein Soya Chunks Curry with Rice",
        calories: 620,
        protein: 42,
        carbs: 88,
        fat: 11,
        estimated_cost: 35,
        meal_plan_items: [
          { quantity: 1, calories: 240, protein: 32, carbs: 18, fat: 2, estimated_cost: 15, foods: { name: "Soya Chunks Curry", serving_size: "1 bowl (50g raw)", calories: 240, protein: 32, carbs: 18, fat: 2 } },
          { quantity: 2, calories: 300, protein: 6, carbs: 64, fat: 1.5, estimated_cost: 15, foods: { name: "Steamed White Rice", serving_size: "2 bowls", calories: 300, protein: 6, carbs: 64, fat: 1.5 } },
          { quantity: 1, calories: 80, protein: 4, carbs: 6, fat: 7.5, estimated_cost: 5, foods: { name: "Cucumber Tomato Salad", serving_size: "1 bowl", calories: 80, protein: 4, carbs: 6, fat: 7.5 } }
        ]
      },
      {
        id: "vegan-snack",
        meal_type: "snack",
        name: "Roasted Chana & Green Tea",
        calories: 220,
        protein: 12,
        carbs: 35,
        fat: 4,
        estimated_cost: 15,
        meal_plan_items: [
          { quantity: 1, calories: 220, protein: 12, carbs: 35, fat: 4, estimated_cost: 15, foods: { name: "Roasted Bengal Gram (Chana)", serving_size: "1 cup (50g)", calories: 220, protein: 12, carbs: 35, fat: 4 } }
        ]
      },
      {
        id: "vegan-dinner",
        meal_type: "dinner",
        name: "Chana Dal Tadka with Phulkas",
        calories: 660,
        protein: 38,
        carbs: 98,
        fat: 14,
        estimated_cost: 40,
        meal_plan_items: [
          { quantity: 1.5, calories: 360, protein: 22, carbs: 54, fat: 6, estimated_cost: 20, foods: { name: "Chana Dal", serving_size: "1.5 bowls", calories: 360, protein: 22, carbs: 54, fat: 6 } },
          { quantity: 3, calories: 240, protein: 9, carbs: 48, fat: 1.5, estimated_cost: 15, foods: { name: "Whole Wheat Phulkas", serving_size: "3 phulkas", calories: 240, protein: 9, carbs: 48, fat: 1.5 } },
          { quantity: 1, calories: 60, protein: 7, carbs: 2, fat: 6.5, estimated_cost: 5, foods: { name: "Sprouts Salad", serving_size: "1 bowl", calories: 60, protein: 7, carbs: 2, fat: 6.5 } }
        ]
      }
    ],
    logged_foods: []
  },

  // Persona 5: Female Diabetic User (Maintain / 4 Frequent Meals / Complex Carbs)
  persona_diabetic: {
    date: "2026-09-29",
    user_id: "user-diabetic",
    timezone: "Asia/Kolkata",
    food_environment: "Home",
    food_type: "Vegetarian",
    nutrition_medical_conditions: ["Diabetes"],
    targets: { calories: 1550, protein: 85, carbs: 175, fat: 45, water_ml: 2600 },
    consumed: { calories: 360, protein: 20, carbs: 42, fat: 11, water_ml: 650, spent: 30 },
    remaining: { calories: 1190, protein: 65, carbs: 133, fat: 34, water_ml: 1950 },
    progress: { calories_percent: 23.2, protein_percent: 23.5, water_percent: 25 },
    nutrition_score: 87,
    has_ai_plan: true,
    weekly_plan_status: { has_active_plan: true, total_days: 7 },
    is_natural_whole_food: true,
    budget: { daily_limit: 150, spent: 30, remaining: 120, monthly_limit: 4500, monthly_spent: 620 },
    meals: [
      {
        id: "diabetic-breakfast",
        meal_type: "breakfast",
        name: "Methi Moong Dal Chilla with Mint Chutney",
        calories: 360,
        protein: 20,
        carbs: 42,
        fat: 11,
        estimated_cost: 30,
        meal_plan_items: [
          { quantity: 1, calories: 310, protein: 18, carbs: 38, fat: 9, estimated_cost: 25, foods: { name: "Methi Moong Dal Chilla (High Fiber)", serving_size: "2 chillas", calories: 310, protein: 18, carbs: 38, fat: 9 } },
          { quantity: 1, calories: 50, protein: 2, carbs: 4, fat: 2, estimated_cost: 5, foods: { name: "Mint & Coriander Chutney", serving_size: "2 tbsp", calories: 50, protein: 2, carbs: 4, fat: 2 } }
        ]
      },
      {
        id: "diabetic-lunch",
        meal_type: "lunch",
        name: "Lauki Chana Dal with Multigrain Roti",
        calories: 480,
        protein: 25,
        carbs: 62,
        fat: 14,
        estimated_cost: 40,
        meal_plan_items: [
          { quantity: 1, calories: 240, protein: 14, carbs: 34, fat: 5, estimated_cost: 20, foods: { name: "Lauki Chana Dal", serving_size: "1 bowl", calories: 240, protein: 14, carbs: 34, fat: 5 } },
          { quantity: 2, calories: 200, protein: 7, carbs: 36, fat: 2, estimated_cost: 15, foods: { name: "Multigrain Rotis (Barley & Wheat)", serving_size: "2 rotis", calories: 200, protein: 7, carbs: 36, fat: 2 } },
          { quantity: 1, calories: 40, protein: 4, carbs: 2, fat: 7, estimated_cost: 5, foods: { name: "Cucumber Salad with Flaxseed", serving_size: "1 bowl", calories: 40, protein: 4, carbs: 2, fat: 7 } }
        ]
      },
      {
        id: "diabetic-snack",
        meal_type: "snack",
        name: "Roasted Makhana & Almonds",
        calories: 190,
        protein: 8,
        carbs: 22,
        fat: 7,
        estimated_cost: 20,
        meal_plan_items: [
          { quantity: 1, calories: 120, protein: 4, carbs: 20, fat: 2, estimated_cost: 12, foods: { name: "Dry Roasted Makhana", serving_size: "1 bowl", calories: 120, protein: 4, carbs: 20, fat: 2 } },
          { quantity: 1, calories: 70, protein: 4, carbs: 2, fat: 5, estimated_cost: 8, foods: { name: "Raw Soaked Almonds", serving_size: "8 almonds", calories: 70, protein: 4, carbs: 2, fat: 5 } }
        ]
      },
      {
        id: "diabetic-dinner",
        meal_type: "dinner",
        name: "Palak Paneer with Jowar Roti",
        calories: 520,
        protein: 32,
        carbs: 49,
        fat: 19,
        estimated_cost: 50,
        meal_plan_items: [
          { quantity: 1, calories: 270, protein: 18, carbs: 9, fat: 18, estimated_cost: 30, foods: { name: "Palak Paneer (Low Fat Paneer)", serving_size: "1 bowl (100g paneer)", calories: 270, protein: 18, carbs: 9, fat: 18 } },
          { quantity: 2, calories: 210, protein: 6, carbs: 42, fat: 2, estimated_cost: 15, foods: { name: "Jowar / Sorghum Roti", serving_size: "2 rotis", calories: 210, protein: 6, carbs: 42, fat: 2 } },
          { quantity: 1, calories: 40, protein: 8, carbs: 2, fat: 1, estimated_cost: 5, foods: { name: "Kachumber Salad with Lemon", serving_size: "1 bowl", calories: 40, protein: 8, carbs: 2, fat: 1 } }
        ]
      }
    ],
    logged_foods: []
  },

  // Persona 6: Intermittent Fasting (2 Meals Only: Lunch & Dinner)
  persona_fasting: {
    date: "2026-09-29",
    user_id: "user-fasting",
    timezone: "Asia/Kolkata",
    food_environment: "Mixed",
    food_type: "Non-Vegetarian",
    meals_per_day: "2 meals",
    targets: { calories: 1700, protein: 125, carbs: 185, fat: 48, water_ml: 3200 },
    consumed: { calories: 840, protein: 62, carbs: 92, fat: 24, water_ml: 1500, spent: 70 },
    remaining: { calories: 860, protein: 63, carbs: 93, fat: 24, water_ml: 1700 },
    progress: { calories_percent: 49.4, protein_percent: 49.6, water_percent: 46.8 },
    nutrition_score: 94,
    has_ai_plan: true,
    weekly_plan_status: { has_active_plan: true, total_days: 7 },
    is_natural_whole_food: true,
    budget: { daily_limit: 150, spent: 70, remaining: 80, monthly_limit: 4500, monthly_spent: 1100 },
    meals: [
      {
        id: "fasting-lunch",
        meal_type: "lunch",
        name: "Grilled Chicken & Dal Tadka with Brown Rice",
        calories: 840,
        protein: 62,
        carbs: 92,
        fat: 24,
        estimated_cost: 80,
        meal_plan_items: [
          { quantity: 1.5, calories: 280, protein: 42, carbs: 0, fat: 6, estimated_cost: 50, foods: { name: "Chicken Breast Grilled", serving_size: "180g", calories: 280, protein: 42, carbs: 0, fat: 6 } },
          { quantity: 2, calories: 340, protein: 6, carbs: 72, fat: 2, estimated_cost: 15, foods: { name: "Steamed Brown Rice", serving_size: "2 bowls", calories: 340, protein: 6, carbs: 72, fat: 2 } },
          { quantity: 1, calories: 220, protein: 14, carbs: 32, fat: 5, estimated_cost: 15, foods: { name: "Yellow Dal Tadka", serving_size: "1 bowl", calories: 220, protein: 14, carbs: 32, fat: 5 } }
        ]
      },
      {
        id: "fasting-dinner",
        meal_type: "dinner",
        name: "Egg Bhurji & Paneer with Phulkas",
        calories: 860,
        protein: 63,
        carbs: 93,
        fat: 24,
        estimated_cost: 75,
        meal_plan_items: [
          { quantity: 2, calories: 240, protein: 18, carbs: 4, fat: 16, estimated_cost: 20, foods: { name: "Egg Bhurji (2 Whole Eggs)", serving_size: "1 plate", calories: 240, protein: 18, carbs: 4, fat: 16 } },
          { quantity: 4, calories: 68, protein: 15, carbs: 0.8, fat: 0.8, estimated_cost: 20, foods: { name: "Egg Whites", serving_size: "4 whites", calories: 68, protein: 15, carbs: 0.8, fat: 0.8 } },
          { quantity: 1, calories: 260, protein: 18, carbs: 8, fat: 18, estimated_cost: 30, foods: { name: "Paneer Bhurji / Tikka", serving_size: "100g paneer", calories: 260, protein: 18, carbs: 8, fat: 18 } },
          { quantity: 3, calories: 240, protein: 9, carbs: 48, fat: 1.5, estimated_cost: 15, foods: { name: "Whole Wheat Phulkas", serving_size: "3 phulkas", calories: 240, protein: 9, carbs: 48, fat: 1.5 } }
        ]
      }
    ],
    logged_foods: []
  }
};

export const mockSwapAlternatives: Record<string, any> = {
  breakfast: [
    {
      id: "swap-moong-cheela",
      name: "Moong Dal Chilla with Mint Chutney",
      calories: 420,
      protein: 26,
      carbs: 52,
      fat: 12,
      estimated_cost: 30,
      items: [
        {
          foods: {
            name: "Moong Dal Chilla",
            serving_size: "2 chillas",
            calories: 360,
            protein: 24,
            carbs: 48,
            fat: 10,
            estimated_cost: 25
          },
          quantity: 1
        },
        {
          foods: {
            name: "Mint Coriander Chutney",
            serving_size: "2 tbsp",
            calories: 60,
            protein: 2,
            carbs: 4,
            fat: 2,
            estimated_cost: 5
          },
          quantity: 1
        }
      ]
    },
    {
      id: "swap-paneer-paratha",
      name: "Paneer Stuffed Paratha with Curd",
      calories: 490,
      protein: 25,
      carbs: 56,
      fat: 18,
      estimated_cost: 45,
      items: [
        {
          foods: {
            name: "Paneer Paratha",
            serving_size: "1 paratha",
            calories: 380,
            protein: 19.5,
            carbs: 49.5,
            fat: 12,
            estimated_cost: 35
          },
          quantity: 1
        },
        {
          foods: {
            name: "Curd / Dahi (Plain)",
            serving_size: "1 bowl (150g)",
            calories: 110,
            protein: 5.5,
            carbs: 6.5,
            fat: 6,
            estimated_cost: 10
          },
          quantity: 1
        }
      ]
    }
  ]
};
