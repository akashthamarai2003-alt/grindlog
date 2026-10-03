import { EGGETARIAN_RECIPES_PART2 } from "./recipe-definitions-eggetarian-part2.mjs";

const EGGETARIAN_RECIPES_PART1 = [
  // 1. 4 Boiled Egg Whites + 1 Whole Egg with Hot Phulkas
  {
    slug: "boiled-egg-whites-phulka",
    name: "Boiled Eggs with Hot Phulkas & Salad",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 2. Indian Egg Bhurji with 2 Hot Phulkas
  {
    slug: "egg-bhurji-chapati",
    name: "Indian Egg Bhurji with Hot Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle", "quick-prep"],
    cuisine: "North Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 3. Indian Egg Bhurji with Multigrain Roti & Cucumber
  {
    slug: "egg-bhurji-multigrain-roti",
    name: "Indian Egg Bhurji with Multigrain Roti",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 4. Fluffy Scrambled Eggs with Brown Bread Toasts
  {
    slug: "scrambled-eggs-brown-toast",
    name: "Fluffy Scrambled Eggs with Brown Bread Toast",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "quick-prep"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Scrambled Eggs",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 5. Masala Egg Omelette with Brown Bread Toast
  {
    slug: "egg-omelette-brown-toast",
    name: "Masala Egg Omelette with Brown Bread Toast",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Omelette",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Cheese Slice (Amul / Britannia)", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 6. Indian Street-Style Bread Omelette
  {
    slug: "bread-omelette-homestyle",
    name: "Indian Street-Style Bread Omelette",
    diet_category: "eggetarian",
    dietary_tags: ["quick-prep", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Bread Omelette",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Bread Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Bread Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Bread Omelette", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Bread Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 7. 3 Boiled Eggs with Savory Masala Oats
  {
    slug: "boiled-eggs-masala-oats",
    name: "Boiled Eggs with Savory Masala Oats",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "fiber-rich", "kettle-friendly"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["kettle", "microwave", "stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 8. 4 Boiled Egg Whites with Homestyle Poha
  {
    slug: "boiled-egg-whites-poha",
    name: "Boiled Egg Whites with Homestyle Poha",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg White",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 9. 3 Hard Boiled Eggs with Banana & Peanut Butter (Hostel Pre-Workout)
  {
    slug: "boiled-eggs-banana-pb",
    name: "Boiled Eggs with Banana & Peanut Butter",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "no-cook", "hostel-friendly", "athlete"],
    cuisine: "Fitness Snack",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 10. 3 Boiled Eggs with Boiled Sweet Potato (Clean Carb Fuel)
  {
    slug: "boiled-eggs-sweet-potato",
    name: "Boiled Eggs with Boiled Sweet Potato",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "clean-eating"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "microwave", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 11. Homestyle Egg Curry (2 Eggs) with Steamed White Rice
  {
    slug: "homestyle-egg-curry-rice",
    name: "Homestyle Egg Curry with Steamed White Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Curry (2 Eggs)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 12. Homestyle Egg Curry with Hot Phulkas & Salad
  {
    slug: "homestyle-egg-curry-phulka",
    name: "Homestyle Egg Curry with Hot Phulkas & Salad",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Curry (2 Eggs)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 13. Dhaba-Style Egg Curry (3 Eggs) with Multigrain Roti
  {
    slug: "spicy-egg-curry-multigrain-roti",
    name: "Dhaba-Style Egg Curry with Multigrain Roti",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "north-indian"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Egg Curry (2 Eggs)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 14. Homestyle Egg Biryani with Cucumber Salad
  {
    slug: "egg-biryani-homestyle",
    name: "Homestyle Egg Biryani with Cucumber Salad",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "Office/Canteen"],
    primary_protein: "Egg Biryani",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Biryani", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Biryani", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Biryani", amount: 380, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Biryani", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 15. Egg Bhurji with Yellow Dal Tadka & Phulkas (Power Combo)
  {
    slug: "egg-bhurji-dal-tadka-phulka",
    name: "Egg Bhurji with Yellow Dal Tadka & Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Tadka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 16. 3 Boiled Eggs with Dal Tadka & Hot Phulkas
  {
    slug: "boiled-eggs-dal-tadka-phulka",
    name: "Boiled Eggs with Dal Tadka & Hot Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Tadka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 17. 3 Boiled Eggs with Punjabi Rajma & Steamed Rice
  {
    slug: "boiled-eggs-punjabi-rajma-rice",
    name: "Boiled Eggs with Punjabi Rajma & Steamed Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 18. 3 Boiled Eggs with Chole Masala & Multigrain Roti
  {
    slug: "boiled-eggs-chole-masala-phulka",
    name: "Boiled Eggs with Chole Masala & Multigrain Roti",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 19. 3 Boiled Eggs with South Indian Sambar Rice
  {
    slug: "boiled-eggs-sambar-rice",
    name: "Boiled Eggs with South Indian Sambar Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Sambar Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Sambar Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Sambar Rice", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Sambar Rice", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 20. 5 Egg White Scramble with Steamed Quinoa & Broccoli (Athlete Bowl)
  {
    slug: "egg-white-scramble-quinoa-broccoli",
    name: "Egg White Scramble with Steamed Quinoa & Broccoli",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "clean-eating"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Boiled Egg White",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg White", amount: 7, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 21. 2 Hard Boiled Eggs with Black Coffee (Pre-Workout)
  {
    slug: "boiled-eggs-black-coffee",
    name: "Hard Boiled Eggs with Black Coffee",
    diet_category: "eggetarian",
    dietary_tags: ["pre-workout", "quick-prep", "no-cook", "keto-friendly"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["kettle", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 22. 4 Boiled Egg Whites with Chaat Masala & Green Tea
  {
    slug: "boiled-egg-whites-green-tea",
    name: "Boiled Egg Whites with Chaat Masala & Green Tea",
    diet_category: "eggetarian",
    dietary_tags: ["low-calorie", "high-protein", "hostel-friendly"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["kettle", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg White",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg White", amount: 6, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 23. Boiled Eggs with Roasted Peanuts (Hostel High-Protein Snack)
  {
    slug: "boiled-egg-roasted-peanuts",
    name: "Boiled Eggs with Roasted Peanuts",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "hostel-friendly", "quick-prep"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 24. Hard Boiled Eggs with Crisp Apple (Balanced Snack)
  {
    slug: "boiled-eggs-apple-snack",
    name: "Hard Boiled Eggs with Crisp Apple",
    diet_category: "eggetarian",
    dietary_tags: ["quick-prep", "clean-eating"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 25. Egg Bhurji with Poha
  {
    slug: "egg-bhurji-poha",
    name: "Spiced Egg Bhurji with Homestyle Poha",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Poha", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  }
];

export const EGGETARIAN_RECIPES = [
  ...EGGETARIAN_RECIPES_PART1,
  ...EGGETARIAN_RECIPES_PART2
];
