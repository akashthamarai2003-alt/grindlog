// Eggetarian Recipes Part 2 (Recipes 26 to 50: Dals + Boiled Eggs, Curries, Hostel Combos, Gym Cutting Bowls)

export const EGGETARIAN_RECIPES_PART2 = [
  // 26. 3 Boiled Eggs with Toor Dal & Steamed Rice
  {
    slug: "boiled-eggs-toor-dal-rice",
    name: "Boiled Eggs with Toor Dal & Steamed Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 27. 3 Boiled Eggs with Toor Dal & 2 Phulkas
  {
    slug: "boiled-eggs-toor-dal-phulka",
    name: "Boiled Eggs with Toor Dal & Hot Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Toor Dal (Arhar Dal)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 28. 3 Boiled Eggs with Masoor Dal Tadka & Multigrain Roti
  {
    slug: "boiled-eggs-masoor-dal-phulka",
    name: "Boiled Eggs with Masoor Dal & Multigrain Roti",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Masoor Dal (Red Lentil)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Multigrain Roti", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 29. 3 Boiled Eggs with Chana Dal Curry & Phulkas
  {
    slug: "boiled-eggs-chana-dal-phulka",
    name: "Boiled Eggs with Chana Dal Curry & Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chana Dal Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 30. 3 Boiled Eggs with Punjabi Rajma & Hot Phulkas
  {
    slug: "boiled-eggs-punjabi-rajma-phulka",
    name: "Boiled Eggs with Punjabi Rajma & Hot Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Punjabi",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rajma (Kidney Beans Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 31. 3 Boiled Eggs with Chole Masala & Steamed Rice
  {
    slug: "boiled-eggs-chole-masala-rice",
    name: "Boiled Eggs with Chole Masala & Steamed Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chole / Chana Masala", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 32. 3 Boiled Eggs with Kala Chana Curry & Phulkas
  {
    slug: "boiled-eggs-kala-chana-phulka",
    name: "Boiled Eggs with Kala Chana Curry & Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "iron-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 33. 3 Boiled Eggs with Kala Chana Curry & Brown Rice
  {
    slug: "boiled-eggs-kala-chana-rice",
    name: "Boiled Eggs with Kala Chana Curry & Brown Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "iron-rich"],
    cuisine: "North Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Kala Chana Curry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 34. 3 Boiled Eggs with Lobia Masala & Steamed Rice
  {
    slug: "boiled-eggs-lobia-masala-rice",
    name: "Boiled Eggs with Lobia Masala & Steamed Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Lobia (Black Eyed Peas Curry)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 35. 3 Boiled Eggs with South Indian Rasam Rice & Potato
  {
    slug: "boiled-eggs-rasam-rice",
    name: "Boiled Eggs with South Indian Rasam Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "light"],
    cuisine: "South Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Rasam", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Rasam", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Rasam", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Rasam", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" }
        ]
      }
    }
  },

  // 36. Egg Bhurji with Mixed Vegetable Sabzi & Phulkas
  {
    slug: "egg-bhurji-mixed-veg-phulka",
    name: "Egg Bhurji with Mixed Veg Sabzi & Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mixed Vegetable Sabzi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 37. Egg Bhurji with Homestyle Bhindi Masala & Phulkas
  {
    slug: "egg-bhurji-bhindi-masala-phulka",
    name: "Egg Bhurji with Homestyle Bhindi Masala & Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Bhindi Masala (Okra)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 38. Egg Bhurji with Aloo Gobi & Hot Phulkas
  {
    slug: "egg-bhurji-aloo-gobi-phulka",
    name: "Egg Bhurji with Aloo Gobi & Hot Phulkas",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "homestyle"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Aloo Gobi", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Aloo Gobi", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Aloo Gobi", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 39. 5 Boiled Egg Whites with Sweet Potato & Cucumber Salad (Cutting Meal)
  {
    slug: "boiled-egg-whites-sweet-potato-salad",
    name: "Boiled Egg Whites with Sweet Potato & Cucumber Salad",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "fat-loss", "gluten-free", "athlete"],
    cuisine: "Fitness Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg White",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg White", amount: 6, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg White", amount: 6, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg White", amount: 8, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 40. Gluten-Free Homestyle Egg Curry with Steamed Rice
  {
    slug: "gluten-free-egg-curry-rice",
    name: "Gluten-Free Egg Curry with Steamed Rice",
    diet_category: "eggetarian",
    dietary_tags: ["gluten-free", "high-protein", "homestyle"],
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
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
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

  // 41. Hostel Kettle 4 Boiled Eggs with Masala Oats
  {
    slug: "hostel-kettle-boiled-eggs-oats",
    name: "Hostel Kettle Boiled Eggs with Masala Oats",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "kettle-friendly", "hostel-friendly", "quick-prep"],
    cuisine: "Hostel Quick Meal",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Banana", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Masala Oats", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 42. Hostel 3 Boiled Eggs with Brown Bread & Chai
  {
    slug: "hostel-kettle-boiled-eggs-bread",
    name: "Hostel Boiled Eggs with Brown Bread & Chai",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "hostel-friendly", "quick-prep"],
    cuisine: "Hostel Quick Meal",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle", "none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Indian Chai with Milk", amount: 150, portion_type: "CONTINUOUS", unit: "ml", role: "OPTIONAL_SIDE" }
        ]
      }
    }
  },

  // 43. 4 Boiled Egg Whites Chopped with Cucumber & Lemon
  {
    slug: "egg-white-cucumber-chaat",
    name: "Boiled Egg White Chaat with Cucumber & Lemon",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "fat-loss", "no-cook", "quick-prep"],
    cuisine: "Fitness Snack",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["none"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel", "Office/Canteen"],
    primary_protein: "Boiled Egg White",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Boiled Egg White", amount: 5, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Roasted Peanuts", amount: 20, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Boiled Egg White", amount: 8, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 44. Egg Curry with Fragrant Jeera Rice
  {
    slug: "egg-curry-jeera-rice",
    name: "Egg Curry with Fragrant Jeera Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Egg Curry (2 Eggs)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 45. Egg Curry with Steamed Brown Rice
  {
    slug: "egg-curry-brown-rice",
    name: "Egg Curry with Steamed Brown Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "fiber-rich"],
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
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Curry (2 Eggs)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 46. Egg Bhurji with Dal Fry & Steamed Basmati Rice
  {
    slug: "egg-bhurji-dal-fry-rice",
    name: "Egg Bhurji with Dal Fry & Steamed Basmati Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Fry", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Fry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 47. 3 Boiled Eggs with Dal Fry & Steamed White Rice
  {
    slug: "boiled-eggs-dal-fry-rice",
    name: "Boiled Eggs with Dal Fry & Steamed White Rice",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "easy",
    required_equipment: ["stove", "kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Boiled Egg (Whole)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Dal Fry", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Dal Fry", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Dal Fry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg (Whole)", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 48. 4 Egg White Omelette with Steamed Broccoli & Toast
  {
    slug: "egg-white-omelette-broccoli",
    name: "Egg White Omelette with Steamed Broccoli & Toast",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "fat-loss", "athlete"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Egg Omelette",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Boiled Sweet Potato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Omelette", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 49. Scrambled Eggs with Steamed Sweet Corn & Cucumber
  {
    slug: "scrambled-eggs-sweet-corn",
    name: "Scrambled Eggs with Steamed Sweet Corn & Cucumber",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "gluten-free", "quick-prep"],
    cuisine: "Fitness Continental",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Scrambled Eggs",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Scrambled Eggs", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Corn", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 50. Spicy Egg Bhurji with Vegetable Upma
  {
    slug: "egg-bhurji-upma",
    name: "Spicy Egg Bhurji with Vegetable Upma",
    diet_category: "eggetarian",
    dietary_tags: ["high-protein", "comfort-food"],
    cuisine: "South Indian Fusion",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Egg Bhurji (Indian Scramble)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Upma", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Upma", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Upma", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Roasted Peanuts", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Egg Bhurji (Indian Scramble)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Upma", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  }
];
