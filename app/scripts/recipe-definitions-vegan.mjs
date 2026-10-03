// Vegan Recipe Catalog (~50 authentic, high-protein, homestyle Indian recipes)

export const VEGAN_RECIPES = [
  // 1. Moong Dal Cheela with Fresh Tomato & Salad
  {
    slug: "moong-dal-cheela-tomato",
    name: "Moong Dal Cheela with Fresh Tomato & Salad",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Moong Dal Cheela",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 2. Besan Cheela with Fresh Cucumber
  {
    slug: "besan-cheela-cucumber",
    name: "Besan Cheela with Fresh Cucumber",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Besan Cheela",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Besan Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Besan Cheela", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Besan Cheela", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Besan Cheela", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 3. Homestyle Poha with Roasted Peanuts
  {
    slug: "poha-roasted-peanuts",
    name: "Homestyle Poha with Roasted Peanuts",
    diet_category: "vegan",
    dietary_tags: ["quick-prep", "gluten-free"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Peanuts",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Poha", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Poha", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Poha", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Poha", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 4. Vegetable Upma with Steamed Peas
  {
    slug: "vegetable-upma",
    name: "Vegetable Upma with Steamed Peas",
    diet_category: "vegan",
    dietary_tags: ["quick-prep"],
    cuisine: "South Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Green Peas (Matar)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Upma", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Peas (Matar)", amount: 75, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Upma", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Peas (Matar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Upma", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Peas (Matar)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Cashews (Kaju)", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Upma", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Peas (Matar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 5. Steamed Idlis with Sambar
  {
    slug: "steamed-idli-sambar",
    name: "Steamed Idlis with Sambar",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "fermented", "light"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Sambar",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Idli", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Idli", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Idli", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Idli", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 6. Crisp Plain Dosa with Sambar
  {
    slug: "plain-dosa-sambar",
    name: "Crisp Plain Dosa with Sambar",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "fermented"],
    cuisine: "South Indian",
    cooking_time_min: 15,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Sambar",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Plain Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Plain Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Plain Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Plain Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 7. Savory Masala Oats with Steamed Broccoli
  {
    slug: "masala-oats-veggies",
    name: "Savory Masala Oats with Steamed Broccoli",
    diet_category: "vegan",
    dietary_tags: ["quick-prep", "fiber-rich", "kettle-friendly"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle", "microwave", "stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Masala Oats",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masala Oats", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masala Oats", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masala Oats", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masala Oats", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 8. Homestyle Vegetable Daliya Bowl
  {
    slug: "vegetable-daliya-bowl",
    name: "Homestyle Vegetable Daliya Bowl",
    diet_category: "vegan",
    dietary_tags: ["fiber-rich", "wholesome"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Vegetable Daliya",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 9. Peanut Butter Toast with Banana
  {
    slug: "pb-toast-banana",
    name: "Peanut Butter Toast with Banana",
    diet_category: "vegan",
    dietary_tags: ["quick-prep", "energy-dense", "hostel-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Natural Peanut Butter",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 32, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 45, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 32, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Soy Milk (Unsweetened)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 10. Spiced Tofu Scramble with Brown Bread Toast
  {
    slug: "tofu-scramble-brown-bread",
    name: "Spiced Tofu Scramble with Brown Bread Toast",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "quick-prep"],
    cuisine: "Fusion Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Tofu Bhurji / Scramble",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 11. Indian Tofu Bhurji with Hot Phulkas
  {
    slug: "tofu-scramble-phulka",
    name: "Indian Tofu Bhurji with Hot Phulkas",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Tofu Bhurji / Scramble",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tofu Bhurji / Scramble", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 12. Soya Chunks Bhurji with Multigrain Roti
  {
    slug: "soya-chunks-bhurji-roti",
    name: "Soya Chunks Bhurji with Multigrain Roti",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "budget-friendly"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Soya Chunks (Raw / Dry)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Soya Chunks (Raw / Dry)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Soya Chunks (Raw / Dry)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Soya Chunks (Raw / Dry)", amount: 65, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Soya Chunks (Raw / Dry)", amount: 75, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 13. Overnight Oats with Soy Milk & Chia
  {
    slug: "overnight-oats-soy-milk",
    name: "Overnight Oats with Soy Milk & Chia",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "no-cook", "hostel-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Soy Milk (Unsweetened)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masala Oats", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masala Oats", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masala Oats", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masala Oats", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 14. Fresh Moong Sprouts Salad with Lemon & Tomato
  {
    slug: "moong-sprouts-chaat",
    name: "Fresh Moong Sprouts Salad with Lemon & Tomato",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "raw", "gluten-free", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Moong Sprouts Salad",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Moong Sprouts Salad", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Moong Sprouts Salad", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Moong Sprouts Salad", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Moong Sprouts Salad", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 15. Tangy Chana Chaat with Fresh Cucumber & Lemon
  {
    slug: "chana-chaat-lemon",
    name: "Tangy Chana Chaat with Fresh Cucumber & Lemon",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Chana Chaat",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chana Chaat", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chana Chaat", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chana Chaat", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chana Chaat", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 16. Yellow Moong Dal with Phulkas & Cucumber Salad
  {
    slug: "yellow-moong-dal-phulka",
    name: "Yellow Moong Dal with Phulkas & Cucumber Salad",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Yellow Moong Dal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 17. Yellow Moong Dal with Steamed White Rice
  {
    slug: "yellow-moong-dal-rice",
    name: "Yellow Moong Dal with Steamed White Rice",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Yellow Moong Dal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 18. Masoor Dal Tadka with Multigrain Roti
  {
    slug: "masoor-dal-phulka",
    name: "Masoor Dal Tadka with Multigrain Roti",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Masoor Dal (Red Lentil)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 19. Masoor Dal with Steamed Brown Rice
  {
    slug: "masoor-dal-rice",
    name: "Masoor Dal with Steamed Brown Rice",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "fiber-rich"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Masoor Dal (Red Lentil)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 20. Toor Dal with Hot Phulkas & Green Salad
  {
    slug: "toor-dal-phulka",
    name: "Toor Dal with Hot Phulkas & Green Salad",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Toor Dal (Arhar Dal)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 21. Toor Dal with Fragrant Jeera Rice
  {
    slug: "toor-dal-jeera-rice",
    name: "Toor Dal with Fragrant Jeera Rice",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Toor Dal (Arhar Dal)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 22. Chana Dal Curry with Multigrain Roti
  {
    slug: "chana-dal-phulka",
    name: "Chana Dal Curry with Multigrain Roti",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "fiber-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Chana Dal Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 225, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 23. Punjabi Rajma with Steamed White Rice
  {
    slug: "punjabi-rajma-chawal",
    name: "Punjabi Rajma with Steamed White Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Rajma (Kidney Beans Curry)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 24. Punjabi Rajma Masala with Hot Phulkas
  {
    slug: "punjabi-rajma-phulka",
    name: "Punjabi Rajma Masala with Hot Phulkas",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Rajma (Kidney Beans Curry)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 25. Chole Masala with Steamed Basmati Rice
  {
    slug: "chole-masala-rice",
    name: "Chole Masala with Steamed Basmati Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chole / Chana Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 26. Chole Masala with Multigrain Roti
  {
    slug: "chole-masala-phulka",
    name: "Chole Masala with Multigrain Roti",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chole / Chana Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 27. Kala Chana Curry with Phulkas & Salad
  {
    slug: "kala-chana-curry-phulka",
    name: "Kala Chana Curry with Phulkas & Salad",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "iron-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Kala Chana Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 28. Kala Chana Curry with Steamed Brown Rice
  {
    slug: "kala-chana-curry-rice",
    name: "Kala Chana Curry with Steamed Brown Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "iron-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Kala Chana Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 29. Lobia (Black Eyed Peas) with Steamed Rice
  {
    slug: "lobia-masala-rice",
    name: "Lobia (Black Eyed Peas) with Steamed Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Lobia (Black Eyed Peas Curry)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 30. Lobia Masala with Hot Phulkas
  {
    slug: "lobia-masala-phulka",
    name: "Lobia Masala with Hot Phulkas",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Lobia (Black Eyed Peas Curry)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 31. Soya Chunks Curry with Multigrain Roti
  {
    slug: "soya-chunks-curry-roti",
    name: "Soya Chunks Curry with Multigrain Roti",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "budget-friendly"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Soya Chunks Curry (Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 32. Soya Chunks Curry with Steamed Rice
  {
    slug: "soya-chunks-curry-rice",
    name: "Soya Chunks Curry with Steamed Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "budget-friendly"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Soya Chunks Curry (Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Soya Chunks Curry (Cooked)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 33. Tofu & Green Peas Curry with Steamed Rice
  {
    slug: "tofu-matar-curry-rice",
    name: "Tofu & Green Peas Curry with Steamed Rice",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Tofu (Firm)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Peas (Matar)", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Peas (Matar)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Peas (Matar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Peas (Matar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 34. Tofu Stir Fry with Steamed Quinoa & Broccoli
  {
    slug: "tofu-quinoa-broccoli-bowl",
    name: "Tofu Stir Fry with Steamed Quinoa & Broccoli",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "Fusion Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tofu (Firm)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tofu (Firm)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 35. Soya Chaap Masala with Hot Phulkas
  {
    slug: "soya-chaap-curry-phulka",
    name: "Soya Chaap Masala with Hot Phulkas",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "north-indian"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Soya Chaap (Grilled / Masala)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Soya Chaap (Grilled / Masala)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Soya Chaap (Grilled / Masala)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Soya Chaap (Grilled / Masala)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Soya Chaap (Grilled / Masala)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 36. Tempeh Stir Fry with Steamed Brown Rice & Spinach
  {
    slug: "tempeh-tikka-brown-rice",
    name: "Tempeh Stir Fry with Steamed Brown Rice & Spinach",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "Fusion Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tempeh",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tempeh", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Spinach / Palak", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tempeh", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Spinach / Palak", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tempeh", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tempeh", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Spinach / Palak", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 37. Mixed Vegetable Sabzi with Phulkas & Moong Sprouts
  {
    slug: "mixed-veg-sabzi-phulka",
    name: "Mixed Vegetable Sabzi with Phulkas & Moong Sprouts",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "fiber-rich"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Moong Sprouts Salad",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Moong Sprouts Salad", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Moong Sprouts Salad", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Moong Sprouts Salad", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 38. Baingan Bharta with Multigrain Roti & Chana
  {
    slug: "baingan-bharta-phulka",
    name: "Baingan Bharta with Multigrain Roti & Chana",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "traditional"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Roasted Chana (Dry Chickpeas)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 39. Homestyle Bhindi Masala with Phulkas & Dal
  {
    slug: "bhindi-masala-phulka",
    name: "Homestyle Bhindi Masala with Phulkas & Dal",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Yellow Moong Dal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 40. Aloo Gobi Homestyle with Phulkas & Yellow Dal
  {
    slug: "aloo-gobi-phulka",
    name: "Aloo Gobi Homestyle with Phulkas & Yellow Dal",
    diet_category: "vegan",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Yellow Moong Dal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Aloo Gobi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Aloo Gobi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 41. Mushroom Masala with Steamed White Rice
  {
    slug: "mushroom-masala-rice",
    name: "Mushroom Masala with Steamed White Rice",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Mushroom Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mushroom Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mushroom Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mushroom Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mushroom Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 42. South Indian Sambar Rice with Roasted Chana
  {
    slug: "sambar-rice-bowl",
    name: "South Indian Sambar Rice with Roasted Chana",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Chana (Dry Chickpeas)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Sambar Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Sambar Rice", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Sambar Rice", amount: 320, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Sambar Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 43. South Indian Rasam Rice with Boiled Potato
  {
    slug: "rasam-rice-potato",
    name: "South Indian Rasam Rice with Boiled Potato",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "light", "digestive"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Rasam",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rasam", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rasam", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rasam", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rasam", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Moong Sprouts Salad", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 44. Boiled Sweet Potato Chaat with Roasted Peanuts
  {
    slug: "sweet-potato-chaat",
    name: "Boiled Sweet Potato Chaat with Roasted Peanuts",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "complex-carbs", "energy"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Roasted Peanuts",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 45, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 45. Tangy Lemon Peanut Rice with Steamed Carrots
  {
    slug: "lemon-peanut-rice",
    name: "Tangy Lemon Peanut Rice with Steamed Carrots",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Roasted Peanuts",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Lemon Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Raw Carrots", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Lemon Rice", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Carrots", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Lemon Rice", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Carrots", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Lemon Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Carrots", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 46. Roasted Chana & Green Tea Fitness Snack
  {
    slug: "roasted-chana-green-tea",
    name: "Roasted Chana & Green Tea Fitness Snack",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "no-cook", "hostel-friendly", "quick-prep"],
    cuisine: "Fitness Snack",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Chana (Dry Chickpeas)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Roasted Chana (Dry Chickpeas)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Roasted Chana (Dry Chickpeas)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Roasted Chana (Dry Chickpeas)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Roasted Chana (Dry Chickpeas)", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Tea (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 47. Roasted Makhana with Black Coffee
  {
    slug: "roasted-makhana-black-coffee",
    name: "Roasted Makhana with Black Coffee",
    diet_category: "vegan",
    dietary_tags: ["low-calorie", "gluten-free", "pre-workout"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["kettle", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Makhana (Fox Nuts)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Roasted Makhana (Fox Nuts)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Roasted Makhana (Fox Nuts)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Roasted Makhana (Fox Nuts)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Roasted Makhana (Fox Nuts)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Black Coffee", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 48. Fresh Indian Fruit Platter with Chia Seeds
  {
    slug: "fresh-fruit-platter-chia",
    name: "Fresh Indian Fruit Platter with Chia Seeds",
    diet_category: "vegan",
    dietary_tags: ["raw", "vitamin-rich", "no-cook"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Chia Seeds",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Papaya", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" },
          { name: "Chia Seeds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Papaya", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Banana", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Soy Milk (Unsweetened)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 49. Steamed Sweet Corn with Lemon & Chaat Masala
  {
    slug: "steamed-sweet-corn-chaat",
    name: "Steamed Sweet Corn with Lemon & Chaat Masala",
    diet_category: "vegan",
    dietary_tags: ["gluten-free", "quick-prep", "energy"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove", "microwave", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Sweet Corn",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Sweet Corn", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Sweet Corn", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Sweet Corn", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Sweet Corn", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Moong Sprouts Salad", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 50. Soy Milk & Chia Power Smoothie
  {
    slug: "soy-milk-chia-smoothie",
    name: "Soy Milk & Chia Power Smoothie",
    diet_category: "vegan",
    dietary_tags: ["high-protein", "dairy-free", "quick-prep"],
    cuisine: "Fitness Beverage",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["blender"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Soy Milk (Unsweetened)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Soy Milk (Unsweetened)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Soy Milk (Unsweetened)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Soy Milk (Unsweetened)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Natural Peanut Butter", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Soy Milk (Unsweetened)", amount: 350, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  }
];
