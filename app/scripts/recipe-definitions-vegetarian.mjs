import { VEGETARIAN_RECIPES_PART2 } from "./recipe-definitions-vegetarian-part2.mjs";

const VEGETARIAN_RECIPES_PART1 = [
  // 1. Fresh Paneer Bhurji with 2 Phulkas
  {
    slug: "paneer-bhurji-phulka",
    name: "Fresh Paneer Bhurji with Hot Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle", "quick-prep"],
    cuisine: "North Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Paneer Bhurji", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Paneer Bhurji", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Paneer Bhurji", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 2. Low Fat Paneer Bhurji with Multigrain Roti
  {
    slug: "low-fat-paneer-bhurji-roti",
    name: "Low Fat Paneer Bhurji with Multigrain Roti",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "low-fat", "athlete"],
    cuisine: "North Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 3. Homestyle Paneer Paratha with Low Fat Curd
  {
    slug: "paneer-paratha-curd",
    name: "Homestyle Paneer Paratha with Low Fat Curd",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Paneer Paratha",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Paneer Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Paneer Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Paneer Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Paneer Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 4. Punjabi Aloo Paratha with Plain Dahi
  {
    slug: "aloo-paratha-dahi",
    name: "Punjabi Aloo Paratha with Plain Dahi",
    diet_category: "vegetarian",
    dietary_tags: ["comfort-food", "homestyle"],
    cuisine: "Punjabi",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Aloo Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Aloo Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Aloo Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Aloo Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 5. Gobi Paratha with Salted Chaas (Buttermilk)
  {
    slug: "gobi-paratha-chaas",
    name: "Gobi Paratha with Salted Chaas (Buttermilk)",
    diet_category: "vegetarian",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Gobi Paratha",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Gobi Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Gobi Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Gobi Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Gobi Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 6. South Indian Ven Pongal with Sambar
  {
    slug: "ven-pongal-sambar",
    name: "South Indian Ven Pongal with Sambar",
    diet_category: "vegetarian",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Ven Pongal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Ven Pongal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Ven Pongal", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Ven Pongal", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Cashews (Kaju)", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Ven Pongal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 7. Oats Cooked in Toned Milk with Raw Almonds
  {
    slug: "oats-milk-almonds",
    name: "Oats Cooked in Toned Milk with Raw Almonds",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "quick-prep", "kettle-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle", "microwave", "stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Oats with Milk",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Oats with Milk", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Oats with Milk", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Oats with Milk", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Oats with Milk", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Greek Yogurt (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 8. Overnight Oats in Milk with Chia & Banana
  {
    slug: "overnight-oats-milk-chia",
    name: "Overnight Oats in Milk with Chia & Banana",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "no-cook", "hostel-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Overnight Oats with Chia",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Overnight Oats with Chia", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Overnight Oats with Chia", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Overnight Oats with Chia", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Overnight Oats with Chia", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Greek Yogurt (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 9. Besan Cheela with Grated Low Fat Paneer
  {
    slug: "besan-cheela-paneer-stuffing",
    name: "Besan Cheela with Grated Low Fat Paneer",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Besan Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Besan Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Besan Cheela", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Besan Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 10. Moong Dal Cheela with Fresh Paneer
  {
    slug: "moong-dal-cheela-paneer",
    name: "Moong Dal Cheela with Fresh Paneer",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Paneer (Raw)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Paneer (Raw)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Moong Dal Cheela", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 11. Greek Yogurt Bowl with Banana & Walnuts
  {
    slug: "greek-yogurt-banana-walnuts",
    name: "Greek Yogurt Bowl with Banana & Walnuts",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "no-cook", "hostel-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 3,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Greek Yogurt (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Walnuts (Akrot)", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Walnuts (Akrot)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 12. Homestyle Palak Paneer with Hot Phulkas
  {
    slug: "palak-paneer-phulka",
    name: "Homestyle Palak Paneer with Hot Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "iron-rich", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Palak Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Palak Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Palak Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Palak Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Palak Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 13. Palak Paneer with Fragrant Jeera Rice
  {
    slug: "palak-paneer-jeera-rice",
    name: "Palak Paneer with Fragrant Jeera Rice",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Palak Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Palak Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Palak Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Palak Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Palak Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 14. Matar Paneer with Multigrain Roti
  {
    slug: "matar-paneer-phulka",
    name: "Matar Paneer with Multigrain Roti",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Matar Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Matar Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Matar Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Matar Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Matar Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 15. Kadai Paneer with Fresh Phulkas
  {
    slug: "kadai-paneer-phulka",
    name: "Kadai Paneer with Fresh Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "north-indian"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Kadai Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kadai Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kadai Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kadai Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kadai Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 16. Grilled Paneer Tikka with Green Mint Salad
  {
    slug: "grilled-paneer-tikka-salad",
    name: "Grilled Paneer Tikka with Green Mint Salad",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "low-carb", "appetizer"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Grilled Paneer / Paneer Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Salad with Lemon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Salad with Lemon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 17. Dal Tadka with Paneer Bhurji & Phulkas (Ultimate Veg High-Protein Combo)
  {
    slug: "dal-tadka-paneer-bhurji-phulka",
    name: "Dal Tadka with Paneer Bhurji & Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Tadka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 18. Dal Fry with Ghee Phulka & Plain Curd
  {
    slug: "dal-fry-ghee-phulka-dahi",
    name: "Dal Fry with Ghee Phulka & Plain Curd",
    diet_category: "vegetarian",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Dal Fry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Fry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Fry", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Fry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 19. Punjabi Rajma with Steamed Rice & Low Fat Paneer
  {
    slug: "punjabi-rajma-paneer-rice",
    name: "Punjabi Rajma with Steamed Rice & Low Fat Paneer",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 20. Moong Dal Khichdi with Desi Ghee & Fresh Curd
  {
    slug: "moong-dal-khichdi-ghee-dahi",
    name: "Moong Dal Khichdi with Desi Ghee & Fresh Curd",
    diet_category: "vegetarian",
    dietary_tags: ["gluten-free", "comfort-food", "digestive"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Moong Dal Khichdi",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 21. South Indian Curd Rice with Tadka & Cucumber Salad
  {
    slug: "curd-rice-tadka-cucumber",
    name: "South Indian Curd Rice with Tadka & Cucumber Salad",
    diet_category: "vegetarian",
    dietary_tags: ["gluten-free", "comfort-food", "cooling"],
    cuisine: "South Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Curd Rice",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Curd Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Curd Rice", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Curd Rice", amount: 320, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Pomegranate (Anar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Curd Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 22. South Indian Curd Rice with Grilled Paneer Tikka
  {
    slug: "curd-rice-paneer-tikka",
    name: "South Indian Curd Rice with Grilled Paneer Tikka",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Grilled Paneer / Paneer Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Curd Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Curd Rice", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Curd Rice", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Pomegranate (Anar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Curd Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 23. Low Fat Paneer with Steamed Quinoa & Broccoli (Athlete Bowl)
  {
    slug: "low-fat-paneer-quinoa-broccoli",
    name: "Low Fat Paneer with Steamed Quinoa & Broccoli",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "clean-eating"],
    cuisine: "Fitness Continental",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Olive Oil (Extra Virgin)", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Quinoa (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 24. Grilled Paneer Tikka with Boiled Sweet Potato
  {
    slug: "grilled-paneer-sweet-potato",
    name: "Grilled Paneer Tikka with Boiled Sweet Potato",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "complex-carbs"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Grilled Paneer / Paneer Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Paneer / Paneer Tikka", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 25. High-Protein Veg Thali (Dal Tadka, Paneer Bhurji, Phulkas & Curd)
  {
    slug: "high-protein-veg-thali",
    name: "High-Protein Veg Thali (Dal, Paneer Bhurji, Phulkas & Dahi)",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle", "complete-meal"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 70, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Tadka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 26. Salted Chaas (Buttermilk) with Roasted Chana
  {
    slug: "chaas-roasted-chana",
    name: "Salted Chaas (Buttermilk) with Roasted Chana",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "no-cook", "cooling", "snack"],
    cuisine: "Fitness Snack",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Chana (Dry Chickpeas)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chaas / Buttermilk (Salted)", amount: 350, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chaas / Buttermilk (Salted)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 27. Sweet Lassi with Roasted Almonds
  {
    slug: "sweet-lassi-almonds",
    name: "Sweet Lassi with Roasted Almonds",
    diet_category: "vegetarian",
    dietary_tags: ["energy", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["blender", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Sweet Lassi",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Sweet Lassi", amount: 180, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Sweet Lassi", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Sweet Lassi", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Sweet Lassi", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Greek Yogurt (Plain)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 28. Low Fat Curd with Fresh Pomegranate Seeds
  {
    slug: "low-fat-curd-pomegranate",
    name: "Low Fat Curd with Fresh Pomegranate Seeds",
    diet_category: "vegetarian",
    dietary_tags: ["antioxidant", "no-cook", "cooling"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 3,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Low Fat Curd / Dahi",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Pomegranate (Anar)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Low Fat Curd / Dahi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Pomegranate (Anar)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Low Fat Curd / Dahi", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Pomegranate (Anar)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Curd / Dahi", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Greek Yogurt (Plain)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Pomegranate (Anar)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 29. Warm Toned Milk with Raw Almonds & Dates
  {
    slug: "toned-milk-raw-almonds",
    name: "Warm Toned Milk with Raw Almonds & Dates",
    diet_category: "vegetarian",
    dietary_tags: ["quick-prep", "comfort-food", "night-routine"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["stove", "microwave", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Toned Milk (3% Fat)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toned Milk (3% Fat)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toned Milk (3% Fat)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Medjool Dates (Khajoor)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toned Milk (3% Fat)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Medjool Dates (Khajoor)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toned Milk (3% Fat)", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 30. Fresh Raw Paneer Cubes with Chaat Masala & Lemon
  {
    slug: "raw-paneer-chaat",
    name: "Fresh Raw Paneer Cubes with Chaat Masala & Lemon",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "keto-friendly", "no-cook", "quick-prep"],
    cuisine: "Fitness Snack",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  }
];

export const VEGETARIAN_RECIPES = [
  ...VEGETARIAN_RECIPES_PART1,
  ...VEGETARIAN_RECIPES_PART2
];
