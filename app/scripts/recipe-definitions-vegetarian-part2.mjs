// Vegetarian Recipes Part 2 (Recipes 31 to 65: Jain, South Indian combos, Dals + Paneer, and Snacks)

export const VEGETARIAN_RECIPES_PART2 = [
  // 31. Homestyle Paneer Butter Masala with Hot Phulkas
  {
    slug: "paneer-butter-masala-phulka",
    name: "Homestyle Paneer Butter Masala with Hot Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Paneer Butter Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Paneer Butter Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Paneer Butter Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Paneer Butter Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Paneer Butter Masala", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 32. Kadai Paneer with Jeera Rice
  {
    slug: "kadai-paneer-rice",
    name: "Kadai Paneer with Jeera Rice",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Kadai Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kadai Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kadai Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kadai Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kadai Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 33. Matar Paneer with Steamed Basmati Rice
  {
    slug: "matar-paneer-steamed-rice",
    name: "Matar Paneer with Steamed Basmati Rice",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "homestyle"],
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
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Matar Paneer", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Matar Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Matar Paneer", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 34. Dal Tadka with Steamed Rice & Low Fat Paneer
  {
    slug: "dal-tadka-paneer-rice",
    name: "Dal Tadka with Steamed Rice & Low Fat Paneer",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Tadka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 35. Dal Fry with Steamed Rice & Fresh Paneer
  {
    slug: "dal-fry-paneer-rice",
    name: "Dal Fry with Steamed Rice & Fresh Paneer",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Fry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Fry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 36. Yellow Moong Dal with Paneer Bhurji & Multigrain Roti
  {
    slug: "yellow-dal-paneer-bhurji-roti",
    name: "Yellow Moong Dal with Paneer Bhurji & Multigrain Roti",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 70, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Bhurji", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 37. Toor Dal with Steamed Rice & Paneer Tikka
  {
    slug: "toor-dal-paneer-tikka-rice",
    name: "Toor Dal with Steamed Rice & Paneer Tikka",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Grilled Paneer / Paneer Tikka",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 70, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Grilled Paneer / Paneer Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 38. Chana Dal Curry with Fresh Paneer & Phulkas
  {
    slug: "chana-dal-paneer-phulka",
    name: "Chana Dal Curry with Fresh Paneer & Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 140, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 39. Punjabi Rajma with Phulkas & Low Fat Curd
  {
    slug: "punjabi-rajma-curd-phulka",
    name: "Punjabi Rajma with Phulkas & Low Fat Curd",
    diet_category: "vegetarian",
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
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 40. Chole Masala with Paneer Paratha & Curd
  {
    slug: "chole-paneer-paratha",
    name: "Chole Masala with Paneer Paratha & Curd",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "comfort-food"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Paneer Paratha",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Paratha", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Paneer Paratha", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 41. Chole Masala with Steamed Rice & Salted Chaas
  {
    slug: "chole-masala-curd-rice",
    name: "Chole Masala with Steamed Rice & Salted Chaas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Chole / Chana Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chaas / Buttermilk (Salted)", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 42. Kala Chana Curry with Fresh Paneer & Multigrain Roti
  {
    slug: "kala-chana-paneer-phulka",
    name: "Kala Chana Curry with Fresh Paneer & Multigrain Roti",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "iron-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Paneer (Raw)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 140, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 43. Sambar Rice with Plain Curd & Green Salad
  {
    slug: "sambar-rice-curd-salad",
    name: "Sambar Rice with Plain Curd & Green Salad",
    diet_category: "vegetarian",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Sambar Rice", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Sambar Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Sambar Rice", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Sambar Rice", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 90, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 44. South Indian Rasam Rice with Paneer Bhurji
  {
    slug: "rasam-rice-paneer-bhurji",
    name: "South Indian Rasam Rice with Paneer Bhurji",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rasam", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Paneer Bhurji", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rasam", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rasam", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Paneer Bhurji", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rasam", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Paneer Bhurji", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 45. Mixed Vegetable Sabzi with Paneer Bhurji & Phulka
  {
    slug: "mixed-veg-paneer-bhurji-phulka",
    name: "Mixed Vegetable Sabzi with Paneer Bhurji & Phulka",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Paneer Bhurji",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Paneer Bhurji", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Paneer Bhurji", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Paneer Bhurji", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Paneer Bhurji", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 46. Baingan Bharta with Curd & Chapati with Ghee
  {
    slug: "baingan-bharta-dahi-phulka",
    name: "Baingan Bharta with Curd & Chapati with Ghee",
    diet_category: "vegetarian",
    dietary_tags: ["homestyle", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Chapati with Ghee", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Chapati with Ghee", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Baingan Bharta (Roasted Eggplant)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 47. Bhindi Masala with Yellow Dal & Chapati with Ghee
  {
    slug: "bhindi-masala-yellow-dal-phulka",
    name: "Bhindi Masala with Yellow Dal & Chapati with Ghee",
    diet_category: "vegetarian",
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
          { name: "Chapati with Ghee", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati with Ghee", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 48. Aloo Gobi with Low Fat Paneer & Phulkas
  {
    slug: "aloo-gobi-paneer-phulka",
    name: "Aloo Gobi with Low Fat Paneer & Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Aloo Gobi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Aloo Gobi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 49. Mushroom Masala with Low Fat Paneer & Multigrain Roti
  {
    slug: "mushroom-masala-paneer-roti",
    name: "Mushroom Masala with Low Fat Paneer & Multigrain Roti",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mushroom Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mushroom Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mushroom Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mushroom Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Low Fat Paneer", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 50. Mushroom Masala with Steamed Rice & Plain Curd
  {
    slug: "mushroom-masala-curd-rice",
    name: "Mushroom Masala with Steamed Rice & Plain Curd",
    diet_category: "vegetarian",
    dietary_tags: ["gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mushroom Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mushroom Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mushroom Masala", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mushroom Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 90, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 51. Minced Low Fat Paneer Curry with Hot Phulkas
  {
    slug: "paneer-keema-style-phulka",
    name: "Minced Low Fat Paneer Curry with Hot Phulkas",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "athlete", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Low Fat Paneer",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 52. Jain Homestyle Yellow Moong Dal with Jeera Rice (No Onion/Garlic/Roots)
  {
    slug: "jain-yellow-dal-jeera-rice",
    name: "Jain Yellow Moong Dal with Jeera Rice",
    diet_category: "vegetarian",
    dietary_tags: ["jain", "gluten-free", "comfort-food"],
    cuisine: "Jain Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Yellow Moong Dal",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Yellow Moong Dal", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 53. Jain Fresh Paneer Curry with Phulkas & Curd (No Onion/Garlic)
  {
    slug: "jain-paneer-curry-phulka",
    name: "Jain Fresh Paneer Curry with Phulkas & Curd",
    diet_category: "vegetarian",
    dietary_tags: ["jain", "high-protein", "homestyle"],
    cuisine: "Jain Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Fresh Paneer (Raw)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fresh Paneer (Raw)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Paneer", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 54. Jain Moong Dal Khichdi with Ghee & Low Fat Curd
  {
    slug: "jain-khichdi-ghee-curd",
    name: "Jain Moong Dal Khichdi with Ghee & Low Fat Curd",
    diet_category: "vegetarian",
    dietary_tags: ["jain", "gluten-free", "comfort-food"],
    cuisine: "Jain Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Moong Dal Khichdi",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Moong Dal Khichdi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 55. Jain Steamed Idlis with Fresh Low Fat Curd
  {
    slug: "jain-steamed-idli-curd",
    name: "Jain Steamed Idlis with Fresh Low Fat Curd",
    diet_category: "vegetarian",
    dietary_tags: ["jain", "gluten-free", "light"],
    cuisine: "South Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Low Fat Curd / Dahi",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Idli", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Idli", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Idli", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Curd / Dahi", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Idli", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Greek Yogurt (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Curd / Dahi", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 56. Whole Wheat Cheese Toast with Indian Masala Chai
  {
    slug: "cheese-toast-chai",
    name: "Whole Wheat Cheese Toast with Indian Masala Chai",
    diet_category: "vegetarian",
    dietary_tags: ["quick-prep", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["stove", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Cheese Slice (Amul / Britannia)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Cheese Slice (Amul / Britannia)", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "PRIMARY_PROTEIN" },
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Cheese Slice (Amul / Britannia)", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "PRIMARY_PROTEIN" },
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Cheese Slice (Amul / Britannia)", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "PRIMARY_PROTEIN" },
          { name: "Indian Chai with Milk", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Cheese Slice (Amul / Britannia)", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 60, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 57. Vegetable Daliya with Desi Ghee & Curd
  {
    slug: "vegetable-daliya-ghee",
    name: "Vegetable Daliya with Desi Ghee & Curd",
    diet_category: "vegetarian",
    dietary_tags: ["fiber-rich", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 5, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Desi Ghee", amount: 8, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Vegetable Daliya", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 58. Set Dosa with Plain Curd & Sambar
  {
    slug: "set-dosa-dahi-sambar",
    name: "Set Dosa with Plain Curd & Sambar",
    diet_category: "vegetarian",
    dietary_tags: ["fermented", "gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Set Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Set Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Set Dosa", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Set Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 59. Masala Dosa with Fresh Curd
  {
    slug: "masala-dosa-curd",
    name: "Masala Dosa with Fresh Curd",
    diet_category: "vegetarian",
    dietary_tags: ["fermented", "gluten-free", "comfort-food"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masala Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masala Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masala Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masala Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 60. Crisp Rava Dosa with Dahi & Sambar
  {
    slug: "rava-dosa-curd",
    name: "Crisp Rava Dosa with Dahi & Sambar",
    diet_category: "vegetarian",
    dietary_tags: ["crisp", "south-indian"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rava Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Curd / Dahi (Plain)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rava Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rava Dosa", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Sambar", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rava Dosa", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Low Fat Paneer", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 61. Greek Yogurt with Apple Slices & Chia Seeds
  {
    slug: "greek-yogurt-apple-chia",
    name: "Greek Yogurt with Apple Slices & Chia Seeds",
    diet_category: "vegetarian",
    dietary_tags: ["high-protein", "no-cook", "quick-prep", "hostel-friendly"],
    cuisine: "Fitness Continental",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Greek Yogurt (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chia Seeds", amount: 10, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Raw Almonds", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Greek Yogurt (Plain)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Apple", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Chia Seeds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      }
    }
  },

  // 62. Filter Coffee with Milk & Roasted Makhana
  {
    slug: "filter-coffee-milk-makhana",
    name: "Filter Coffee with Milk & Roasted Makhana",
    diet_category: "vegetarian",
    dietary_tags: ["quick-prep", "pre-workout", "comfort-drink"],
    cuisine: "South Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Roasted Makhana (Fox Nuts)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Filter Coffee with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Roasted Makhana (Fox Nuts)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Filter Coffee with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Roasted Makhana (Fox Nuts)", amount: 40, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Filter Coffee with Milk", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Roasted Makhana (Fox Nuts)", amount: 50, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Raw Almonds", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Filter Coffee with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" },
          { name: "Roasted Makhana (Fox Nuts)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 63. Indian Chai with Milk & Whole Wheat Bread
  {
    slug: "masala-chai-wheat-toast",
    name: "Indian Chai with Milk & Whole Wheat Bread",
    diet_category: "vegetarian",
    dietary_tags: ["homestyle", "comfort-food", "tea-time"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Indian Chai with Milk",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Whole Wheat Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Roasted Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Indian Chai with Milk", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Whole Wheat Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 35, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 64. Plain Curd Bowl with Sliced Banana & Walnuts
  {
    slug: "curd-banana-walnuts",
    name: "Plain Curd Bowl with Sliced Banana & Walnuts",
    diet_category: "vegetarian",
    dietary_tags: ["no-cook", "quick-prep", "cooling"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Curd / Dahi (Plain)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Curd / Dahi (Plain)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Curd / Dahi (Plain)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Walnuts (Akrot)", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Curd / Dahi (Plain)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Walnuts (Akrot)", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Low Fat Curd / Dahi", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Greek Yogurt (Plain)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 65. Double Toned Skimmed Milk with Medjool Dates
  {
    slug: "double-toned-milk-dates",
    name: "Double Toned Skimmed Milk with Medjool Dates",
    diet_category: "vegetarian",
    dietary_tags: ["low-fat", "no-cook", "energy"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 2,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Double Toned / Skimmed Milk",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Double Toned / Skimmed Milk", amount: 200, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Medjool Dates (Khajoor)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Double Toned / Skimmed Milk", amount: 250, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Medjool Dates (Khajoor)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" },
          { name: "Raw Almonds", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Double Toned / Skimmed Milk", amount: 300, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Medjool Dates (Khajoor)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" },
          { name: "Raw Almonds", amount: 25, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Double Toned / Skimmed Milk", amount: 350, portion_type: "CONTINUOUS", unit: "ml", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Chana (Dry Chickpeas)", amount: 30, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Medjool Dates (Khajoor)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  }
];
