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
    },
    {
      id: "live-plan-snack",
      meal_type: "snack",
      name: "Roasted Makhana & Almonds",
      calories: 180,
      protein: 6,
      carbs: 22,
      fat: 8,
      estimated_cost: 25,
      is_ai_generated: true,
      meal_plan_items: [
        {
          id: "item-snack-1",
          quantity: 1,
          calories: 110,
          protein: 3,
          carbs: 20,
          fat: 2,
          estimated_cost: 15,
          foods: {
            id: "food-makhana",
            name: "Roasted Makhana (Foxnuts)",
            serving_size: "1 bowl (30g)",
            calories: 110,
            protein: 3,
            carbs: 20,
            fat: 2,
            estimated_cost: 15
          }
        },
        {
          id: "item-snack-2",
          quantity: 1,
          calories: 70,
          protein: 3,
          carbs: 2,
          fat: 6,
          estimated_cost: 10,
          foods: {
            id: "food-almonds",
            name: "Almonds",
            serving_size: "10 almonds",
            calories: 70,
            protein: 3,
            carbs: 2,
            fat: 6,
            estimated_cost: 10
          }
        }
      ]
    }
  ],
  logged_foods: []
};

export const mockSwapAlternatives = {
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
