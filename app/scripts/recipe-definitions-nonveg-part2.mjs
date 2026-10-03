// Non-Vegetarian Recipe Catalog Part 2 (27 authentic Indian fish, seafood, tuna, mutton & poultry recipes)

export const NONVEG_RECIPES_PART2 = [
  // 29. Homestyle Fish Curry with Steamed Rice (Dairy-Free, Gluten-Free)
  {
    slug: "fish-curry-steamed-rice",
    name: "Homestyle Fish Curry with Steamed Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "gluten-free", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 30. Homestyle Fish Curry with Hot Phulkas & Cucumber
  {
    slug: "fish-curry-phulka",
    name: "Homestyle Fish Curry with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "homestyle"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 31. Fish Curry with Steamed Brown Rice & Broccoli
  {
    slug: "fish-curry-brown-rice",
    name: "Fish Curry with Steamed Brown Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "dairy-free", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 32. Fish Curry with Fragrant Jeera Rice
  {
    slug: "fish-curry-jeera-rice",
    name: "Fish Curry with Fragrant Jeera Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "comfort-food"],
    cuisine: "North Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG", "Office/Canteen"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 300, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 33. Fish Curry with Dal Tadka & Steamed Rice (Double Protein Pescetarian)
  {
    slug: "fish-curry-dal-tadka-rice",
    name: "Fish Curry with Dal Tadka & Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "power-meal"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 34. Grilled Fish Fry with Hot Phulkas & Salad
  {
    slug: "grilled-fish-phulka-salad",
    name: "Grilled Fish Fry with Hot Phulkas & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Fish / Fish Fry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 35. Grilled Fish Fry with Steamed Basmati Rice & Salad
  {
    slug: "grilled-fish-steamed-rice",
    name: "Grilled Fish Fry with Steamed Basmati Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "dairy-free"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Fish / Fish Fry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 36. Grilled Fish with Brown Rice & Steamed Broccoli
  {
    slug: "grilled-fish-brown-rice-broccoli",
    name: "Grilled Fish with Brown Rice & Broccoli",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "athlete", "clean-eating"],
    cuisine: "Fitness Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Fish / Fish Fry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Fish / Fish Fry", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 37. Grilled Salmon with Steamed Rice & Green Salad
  {
    slug: "grilled-salmon-steamed-rice",
    name: "Grilled Salmon with Steamed Rice & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "omega-3", "gluten-free", "athlete"],
    cuisine: "Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Salmon",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Salmon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Salmon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Salmon", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Salmon", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 38. Grilled Salmon with Brown Rice & Boiled Broccoli
  {
    slug: "grilled-salmon-brown-rice-veggies",
    name: "Grilled Salmon with Brown Rice & Broccoli",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "omega-3", "gluten-free", "athlete"],
    cuisine: "Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Salmon",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Salmon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Salmon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Salmon", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Salmon", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 39. Grilled Salmon with Sweet Potato & Salad
  {
    slug: "grilled-salmon-sweet-potato",
    name: "Grilled Salmon with Sweet Potato & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "omega-3", "gluten-free", "athlete"],
    cuisine: "Continental",
    cooking_time_min: 20,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Grilled Salmon",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Grilled Salmon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Grilled Salmon", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 130, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Grilled Salmon", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Grilled Salmon", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Sweet Potato", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 40. High-Protein Tuna on Brown Bread Toast (PG Friendly, Quick Prep)
  {
    slug: "canned-tuna-brown-toast",
    name: "High-Protein Tuna on Brown Bread Toast",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "quick-prep", "pg-friendly"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 5,
    difficulty: "easy",
    required_equipment: ["kettle"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Canned Tuna (in Water)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Tomato", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 41. Quick Tuna & Basmati Rice Bowl (Dairy-Free, Gluten-Free)
  {
    slug: "canned-tuna-rice-bowl",
    name: "Quick Tuna & Basmati Rice Bowl",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "gluten-free", "pg-friendly"],
    cuisine: "Continental",
    cooking_time_min: 10,
    difficulty: "easy",
    required_equipment: ["kettle", "stove"],
    supported_environments: ["I Cook", "Home", "PG", "Hostel"],
    primary_protein: "Canned Tuna (in Water)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      }
    }
  },

  // 42. Tuna & Brown Rice Fitness Bowl (Athlete Clean Meal)
  {
    slug: "canned-tuna-brown-rice-salad",
    name: "Tuna & Brown Rice Fitness Bowl",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "gluten-free", "athlete"],
    cuisine: "Continental",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Canned Tuna (in Water)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 43. Tuna & Boiled Egg Whites on Toast (Pescetarian Ultra Protein)
  {
    slug: "canned-tuna-boiled-eggs-toast",
    name: "Tuna & Boiled Egg Whites on Toast",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "athlete", "breakfast"],
    cuisine: "Continental Breakfast",
    cooking_time_min: 15,
    difficulty: "easy",
    required_equipment: ["kettle", "stove"],
    supported_environments: ["I Cook", "Home", "PG"],
    primary_protein: "Canned Tuna (in Water)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 1, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 3, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" },
          { name: "Natural Peanut Butter", amount: 15, portion_type: "CONTINUOUS", unit: "g", role: "FAT_SEASONING" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Canned Tuna (in Water)", amount: 140, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Boiled Egg White", amount: 4, portion_type: "DISCRETE", unit: "piece", role: "PRIMARY_PROTEIN" },
          { name: "Brown Bread", amount: 2, portion_type: "DISCRETE", unit: "slice", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 44. Spicy Prawns Masala with Steamed Rice (Dairy-Free, Gluten-Free)
  {
    slug: "prawns-masala-steamed-rice",
    name: "Spicy Prawns Masala with Steamed Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "gluten-free", "homestyle"],
    cuisine: "Coastal Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Prawns Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Prawns Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Prawns Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Prawns Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Prawns Masala", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 45. Homestyle Prawns Masala with Hot Phulkas
  {
    slug: "prawns-masala-phulka",
    name: "Homestyle Prawns Masala with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "homestyle"],
    cuisine: "Coastal Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Prawns Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Prawns Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Prawns Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Prawns Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Prawns Masala", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 46. Prawns Masala with Steamed Brown Rice
  {
    slug: "prawns-masala-brown-rice",
    name: "Prawns Masala with Steamed Brown Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "dairy-free", "gluten-free", "athlete"],
    cuisine: "Coastal Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Prawns Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Prawns Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Prawns Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Prawns Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Prawns Masala", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 47. Prawns Masala with Jeera Rice & Salad
  {
    slug: "prawns-masala-jeera-rice",
    name: "Prawns Masala with Jeera Rice & Salad",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "comfort-food"],
    cuisine: "Coastal Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Prawns Masala",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Prawns Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Prawns Masala", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Prawns Masala", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Prawns Masala", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 48. Homestyle Mutton Curry with Steamed Rice (Rich Bulking Meal)
  {
    slug: "homestyle-mutton-curry-rice",
    name: "Homestyle Mutton Curry with Steamed Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "gluten-free", "homestyle", "bulking"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 40,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Mutton Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mutton Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mutton Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mutton Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mutton Curry", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 49. Homestyle Mutton Curry with Hot Phulkas
  {
    slug: "homestyle-mutton-curry-phulka",
    name: "Homestyle Mutton Curry with Hot Phulkas",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "homestyle", "bulking"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 40,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Mutton Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mutton Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mutton Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mutton Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 3, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mutton Curry", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chapati / Phulka", amount: 2, portion_type: "DISCRETE", unit: "piece", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 50. Homestyle Mutton Curry with Fragrant Jeera Rice
  {
    slug: "homestyle-mutton-curry-jeera-rice",
    name: "Homestyle Mutton Curry with Jeera Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "comfort-food", "bulking"],
    cuisine: "North Indian",
    cooking_time_min: 40,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Mutton Curry",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Mutton Curry", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Mutton Curry", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Mutton Curry", amount: 250, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Mutton Curry", amount: 280, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 51. Chicken Tikka with Steamed Basmati Rice & Salad
  {
    slug: "chicken-tikka-steamed-rice",
    name: "Chicken Tikka with Steamed Basmati Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete"],
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
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Tikka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Tikka", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 52. Chicken Tikka with Steamed Brown Rice
  {
    slug: "chicken-tikka-brown-rice",
    name: "Chicken Tikka with Steamed Brown Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "gluten-free", "athlete", "clean-eating"],
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
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 80, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Tikka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Tikka", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Tikka", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Boiled Broccoli", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 53. Grilled Chicken Breast with Brown Rice & Dal Tadka (Athlete Clean Bulker)
  {
    slug: "grilled-chicken-brown-rice-dal",
    name: "Grilled Chicken Breast with Brown Rice & Dal",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "dairy-free", "gluten-free", "athlete"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 25,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Chicken Breast (Grilled / Cooked)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Chicken Breast (Grilled / Cooked)", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Dal Tadka", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Brown Rice (Cooked)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  },

  // 54. Fish Curry with Chole / Chana Masala & Rice
  {
    slug: "fish-curry-chole-rice",
    name: "Fish Curry with Chole Masala & Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "pescetarian", "gluten-free", "power-meal"],
    cuisine: "Homestyle Indian",
    cooking_time_min: 30,
    difficulty: "medium",
    required_equipment: ["stove"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Fish Curry (Rohu / Indian Carp)",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 180, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Fish Curry (Rohu / Indian Carp)", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Chole / Chana Masala", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "White Rice (Steamed)", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" }
        ]
      }
    }
  },

  // 55. Tandoori Chicken with Fragrant Jeera Rice & Salad
  {
    slug: "tandoori-chicken-jeera-rice",
    name: "Tandoori Chicken with Fragrant Jeera Rice",
    diet_category: "non-veg",
    dietary_tags: ["high-protein", "north-indian", "tandoori"],
    cuisine: "North Indian",
    cooking_time_min: 20,
    difficulty: "medium",
    required_equipment: ["stove", "microwave"],
    supported_environments: ["I Cook", "Home"],
    primary_protein: "Tandoori Chicken",
    variants: {
      LIGHT: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Fresh Cucumber", amount: 1, portion_type: "DISCRETE", unit: "piece", role: "VEGGIE" }
        ]
      },
      REGULAR: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 160, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 150, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_ENERGY: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 200, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 220, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      },
      HIGH_PROTEIN: {
        ingredients: [
          { name: "Tandoori Chicken", amount: 240, portion_type: "CONTINUOUS", unit: "g", role: "PRIMARY_PROTEIN" },
          { name: "Jeera Rice", amount: 120, portion_type: "CONTINUOUS", unit: "g", role: "STAPLE_CARB" },
          { name: "Green Salad with Lemon", amount: 100, portion_type: "CONTINUOUS", unit: "g", role: "VEGGIE" }
        ]
      }
    }
  }
];
