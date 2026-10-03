// Non-Vegetarian Recipe Catalog Part 1 (28 authentic Indian chicken recipes with high protein)
import { NONVEG_RECIPES_PART2 } from "./recipe-definitions-nonveg-part2.mjs";

const NONVEG_RECIPES_PART1 = [
  // 1. Grilled Chicken Breast with Hot Phulkas & Green Salad
  {
    slug: "grilled-chicken-phulka-salad",
    name: "Grilled Chicken Breast with Hot Phulkas & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "athlete", "clean-eating"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 2. Grilled Chicken Breast with Steamed Basmati Rice & Cucumber
  {
    slug: "grilled-chicken-steamed-rice",
    name: "Grilled Chicken Breast with Steamed Basmati Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 3. Grilled Chicken Breast with Steamed Brown Rice & Broccoli
  {
    slug: "grilled-chicken-brown-rice",
    name: "Grilled Chicken Breast with Brown Rice & Broccoli",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "fiber-rich", "athlete"],
    cuisine: "Fitness Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 4. Boiled Chicken Breast with Sweet Potato & Green Tea (Athlete Clean Cutting)
  {
    slug: "boiled-chicken-sweet-potato",
    name: "Boiled Chicken Breast with Sweet Potato",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "fat-loss", "gluten-free", "athlete"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Chicken Breast",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 5. Boiled Chicken Breast with Brown Bread Toast
  {
    slug: "boiled-chicken-brown-toast",
    name: "Boiled Chicken Breast with Brown Bread Toast",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "quick-prep"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Chicken Breast",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 6. Homestyle Chicken Curry with Steamed White Rice (Dairy-Free)
  {
    slug: "homestyle-chicken-curry-rice",
    name: "Homestyle Chicken Curry with Steamed White Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "gluten-free", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Curry (Home Style)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 7. Homestyle Chicken Curry with Hot Phulkas & Salad
  {
    slug: "homestyle-chicken-curry-phulka",
    name: "Homestyle Chicken Curry with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Curry (Home Style)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 8. Chicken Curry with Fragrant Jeera Rice
  {
    slug: "chicken-curry-jeera-rice",
    name: "Chicken Curry with Fragrant Jeera Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Curry (Home Style)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 9. Chicken Curry with Multigrain Roti & Cucumber Salad
  {
    slug: "chicken-curry-multigrain-roti",
    name: "Chicken Curry with Multigrain Roti",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Curry (Home Style)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Curry (Home Style)", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 10. Tandoori Chicken Breast with Hot Phulkas & Mint Salad
  {
    slug: "tandoori-chicken-phulka",
    name: "Tandoori Chicken Breast with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "north-indian", "tandoori"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tandoori Chicken",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 11. Chicken Tikka Platter with 2 Phulkas & Lemon Salad
  {
    slug: "chicken-tikka-platter-phulka",
    name: "Chicken Tikka Platter with Phulkas & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "north-indian"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Tikka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Tikka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Tikka", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 12. Indian Chicken Keema with Hot Phulkas & Fresh Cucumber
  {
    slug: "chicken-keema-phulka",
    name: "Indian Chicken Keema with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Keema",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Keema", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Keema", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Keema", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Keema", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 13. Chicken Keema on Brown Bread Toast
  {
    slug: "chicken-keema-brown-toast",
    name: "Chicken Keema on Brown Bread Toast",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "breakfast"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Keema",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Keema", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Keema", amount: 140, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Keema", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Keema", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 14. Chicken Keema with Fragrant Jeera Rice
  {
    slug: "chicken-keema-jeera-rice",
    name: "Chicken Keema with Fragrant Jeera Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chicken Keema",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Keema", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Keema", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Keema", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Keema", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 15. Homestyle Chicken Biryani with Fresh Cucumber Salad
  {
    slug: "chicken-biryani-homestyle",
    name: "Homestyle Chicken Biryani with Cucumber Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 35,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "Office/Canteen"],
    primary_protein: "Chicken Biryani",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Biryani", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Biryani", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Biryani", amount: 380, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Biryani", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Chicken Breast", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 16. Grilled Chicken Breast with Dal Tadka & Steamed Rice (Double Protein Power Meal)
  {
    slug: "chicken-breast-dal-tadka-rice",
    name: "Grilled Chicken Breast with Dal Tadka & Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "power-meal"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 17. Grilled Chicken Breast with Dal Tadka & Phulkas
  {
    slug: "chicken-breast-dal-tadka-phulka",
    name: "Grilled Chicken Breast with Dal Tadka & Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "athlete", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 18. Grilled Chicken Breast with Punjabi Rajma & Rice (Athlete Bulking Powerhouse)
  {
    slug: "chicken-breast-rajma-rice",
    name: "Grilled Chicken Breast with Punjabi Rajma & Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "bulking"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Rajma (Kidney Beans Curry)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Rajma (Kidney Beans Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 19. Grilled Chicken Breast with Chole Masala & Multigrain Roti
  {
    slug: "chicken-breast-chole-phulka",
    name: "Grilled Chicken Breast with Chole & Multigrain Roti",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "athlete", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 20. Boiled Chicken Breast with Moong Dal Khichdi (Recovery Comfort Meal)
  {
    slug: "chicken-breast-moong-khichdi",
    name: "Boiled Chicken Breast with Moong Dal Khichdi",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food", "recovery"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Chicken Breast",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Dal Khichdi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Dal Khichdi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Dal Khichdi", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Dal Khichdi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 21. Grilled Chicken Breast with Steamed Quinoa & Broccoli (Clean Athlete Bowl)
  {
    slug: "chicken-breast-quinoa-broccoli",
    name: "Grilled Chicken Breast with Steamed Quinoa & Broccoli",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "clean-eating"],
    cuisine: "Fitness Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 22. Tandoori Chicken Breast with Boiled Sweet Potato & Salad
  {
    slug: "tandoori-chicken-sweet-potato",
    name: "Tandoori Chicken Breast with Boiled Sweet Potato",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tandoori Chicken",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 23. Chicken Tikka Skewers (100g) with Lemon & Green Tea (Gym Snack)
  {
    slug: "chicken-tikka-green-tea-snack",
    name: "Chicken Tikka Skewers with Lemon & Green Tea",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "low-carb", "quick-prep"],
    cuisine: "Fitness Snack",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Tikka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Tikka", amount: 140, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Tikka", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Tikka", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 24. Boiled Chicken Breast Slices with Crisp Apple (Clean Athlete Snack)
  {
    slug: "boiled-chicken-apple-snack",
    name: "Boiled Chicken Breast Slices with Crisp Apple",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "fat-loss", "athlete", "clean-eating"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Chicken Breast",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 25. Grilled Chicken Breast with Boiled Sweet Corn & Cucumber
  {
    slug: "grilled-chicken-sweet-corn-salad",
    name: "Grilled Chicken Breast with Sweet Corn & Cucumber",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 26. Grilled Chicken Breast + 3 Boiled Egg Whites + Rice (180g+ Protein Bulker)
  {
    slug: "chicken-breast-egg-whites-power-bowl",
    name: "Chicken Breast & Egg White Power Bowl with Rice",
    diet_category: "non-veg",
    dietary_tags: ["ultra-high-protein", "athlete", "bulking", "gluten-free"],
    cuisine: "Fitness Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 6, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 27. Boiled Chicken Breast + 4 Boiled Egg Whites + Sweet Potato (Competition Prep)
  {
    slug: "chicken-breast-egg-whites-sweet-potato",
    name: "Chicken & Egg White Comp Prep Bowl with Sweet Potato",
    diet_category: "non-veg",
    dietary_tags: ["ultra-high-protein", "fat-loss", "gluten-free", "athlete"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Chicken Breast",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Chicken Breast", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 6, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 28. Tandoori Chicken Breast with Black Coffee (Low-Carb Pre-Workout)
  {
    slug: "tandoori-chicken-black-coffee",
    name: "Tandoori Chicken Breast with Black Coffee",
    diet_category: "non-veg",
    dietary_tags: ["pre-workout", "low-carb", "keto-friendly"],
    cuisine: "Fitness Snack",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tandoori Chicken",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  }
];

export const NONVEG_RECIPES = [
  ...NONVEG_RECIPES_PART1,
  ...NONVEG_RECIPES_PART2
];
