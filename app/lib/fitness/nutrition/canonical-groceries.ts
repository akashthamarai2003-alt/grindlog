// ─────────────────────────────────────────────────────────────
// GrindLog Nutrition Engine - Canonical Grocery Mappings & Real-World Kirana Units
// File: lib/fitness/nutrition/canonical-groceries.ts
//
// Converts cooked dish names (e.g. "Chana Dal Curry", "Soya Chunks Bhurji")
// into genuine store-bought grocery staples (e.g. "Chana Dal", "Soya Chunks")
// with realistic retail packaging, Blinkit/kirana unit pricing, and diet-aware categories.
// ─────────────────────────────────────────────────────────────

export interface CanonicalGroceryDefinition {
  canonicalName: string;
  category: "Protein" | "Grains & Staples" | "Fresh Produce" | "Pantry & Healthy Fats" | "Snack";
  retailUnit: "g" | "kg" | "pack" | "pieces" | "liters" | "eggs" | "jar" | "bunch";
  packGrams: number;
  costPerPack: number;
  minPurchasePacks: number;
}

/**
 * Maps any catalog dish or food ingredient name to a canonical retail grocery staple.
 */
export function toCanonicalGroceryStaple(
  dishName: string,
  rawCategory?: string | null,
  servingUnit?: string | null,
  dietType?: string | null
): CanonicalGroceryDefinition {
  const name = (dishName || "").toLowerCase().trim();
  const cat = (rawCategory || "").toLowerCase().trim();

  // 1. Soya Chunks & Plant Protein
  if (name.includes("soya") || name.includes("soy chunk")) {
    return {
      canonicalName: "Soya Chunks (Raw / Dry)",
      category: "Protein",
      retailUnit: "pack",
      packGrams: 200,
      costPerPack: 35,
      minPurchasePacks: 1,
    };
  }

  // 2. Tofu
  if (name.includes("tofu")) {
    return {
      canonicalName: "Fresh Tofu (Soy Paneer)",
      category: "Protein",
      retailUnit: "pack",
      packGrams: 200,
      costPerPack: 50,
      minPurchasePacks: 1,
    };
  }

  // 3. Paneer
  if (name.includes("paneer")) {
    return {
      canonicalName: "Fresh Malai Paneer",
      category: "Protein",
      retailUnit: "g",
      packGrams: 200,
      costPerPack: 80,
      minPurchasePacks: 1,
    };
  }

  // 4. Eggs
  if (name.includes("egg") && !name.includes("eggplant")) {
    return {
      canonicalName: "Fresh Farm Eggs",
      category: "Protein",
      retailUnit: "eggs",
      packGrams: 50,
      costPerPack: 7, // ₹7 per egg, sold in 6/12/30 packs
      minPurchasePacks: 6,
    };
  }

  // 5. Poultry / Meat / Fish
  if (name.includes("chicken")) {
    return {
      canonicalName: "Fresh Chicken Breast",
      category: "Protein",
      retailUnit: "kg",
      packGrams: 1000,
      costPerPack: 280,
      minPurchasePacks: 0.5,
    };
  }
  if (name.includes("fish")) {
    return {
      canonicalName: "Fresh Fish Fillet",
      category: "Protein",
      retailUnit: "kg",
      packGrams: 1000,
      costPerPack: 320,
      minPurchasePacks: 0.5,
    };
  }
  if (name.includes("whey") || name.includes("protein powder")) {
    return {
      canonicalName: "Whey Protein Powder",
      category: "Protein",
      retailUnit: "pack",
      packGrams: 1000,
      costPerPack: 1800,
      minPurchasePacks: 1,
    };
  }

  // 6. Dals & Legumes (Retail Raw Staples)
  if (name.includes("kala chana")) {
    return {
      canonicalName: "Kala Chana (Black Chickpeas)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 55,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("chana dal")) {
    return {
      canonicalName: "Chana Dal",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 60,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("yellow moong") || (name.includes("moong") && !name.includes("sprout"))) {
    return {
      canonicalName: "Yellow Moong Dal",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 65,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("masoor")) {
    return {
      canonicalName: "Masoor Dal (Red Lentil)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 65,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("toor") || name.includes("arhar")) {
    return {
      canonicalName: "Toor Dal (Arhar Dal)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 75,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("rajma")) {
    return {
      canonicalName: "Rajma (Kidney Beans)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 70,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("lobia")) {
    return {
      canonicalName: "Lobia (Black Eyed Peas)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 60,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("roasted chana")) {
    return {
      canonicalName: "Roasted Chana (Dry Chickpeas)",
      category: "Snack",
      retailUnit: "g",
      packGrams: 250,
      costPerPack: 40,
      minPurchasePacks: 1,
    };
  }

  // 7. Grains, Flours & Carbs
  if (name.includes("roti") || name.includes("phulka") || name.includes("chapati")) {
    return {
      canonicalName: "Whole Wheat Atta / Flour",
      category: "Grains & Staples",
      retailUnit: "kg",
      packGrams: 1000,
      costPerPack: 45,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("brown rice")) {
    return {
      canonicalName: "Brown Rice",
      category: "Grains & Staples",
      retailUnit: "kg",
      packGrams: 1000,
      costPerPack: 80,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("rice") || name.includes("chawal") || name.includes("pulao") || name.includes("biryani")) {
    return {
      canonicalName: "Raw White Rice",
      category: "Grains & Staples",
      retailUnit: "kg",
      packGrams: 1000,
      costPerPack: 55,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("oat")) {
    return {
      canonicalName: "Rolled Oats",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 75,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("sweet potato")) {
    return {
      canonicalName: "Sweet Potatoes",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 40,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("bread") || name.includes("toast")) {
    return {
      canonicalName: "Whole Wheat Brown Bread",
      category: "Grains & Staples",
      retailUnit: "pack",
      packGrams: 400,
      costPerPack: 45,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("poha")) {
    return {
      canonicalName: "Poha (Flattened Rice)",
      category: "Grains & Staples",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 40,
      minPurchasePacks: 1,
    };
  }

  // 8. Nuts, Seeds & Healthy Fats
  if (name.includes("peanut butter")) {
    return {
      canonicalName: "Peanut Butter (Unsweetened)",
      category: "Pantry & Healthy Fats",
      retailUnit: "jar",
      packGrams: 350,
      costPerPack: 140,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("peanut")) {
    return {
      canonicalName: "Roasted Peanuts",
      category: "Pantry & Healthy Fats",
      retailUnit: "g",
      packGrams: 200,
      costPerPack: 45,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("almond")) {
    return {
      canonicalName: "Almonds (Badam)",
      category: "Pantry & Healthy Fats",
      retailUnit: "g",
      packGrams: 200,
      costPerPack: 180,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("walnut")) {
    return {
      canonicalName: "Walnuts (Akhrot)",
      category: "Pantry & Healthy Fats",
      retailUnit: "g",
      packGrams: 150,
      costPerPack: 200,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("chia") || name.includes("flax")) {
    return {
      canonicalName: name.includes("chia") ? "Chia Seeds" : "Flax Seeds",
      category: "Pantry & Healthy Fats",
      retailUnit: "pack",
      packGrams: 150,
      costPerPack: 90,
      minPurchasePacks: 1,
    };
  }

  // 9. Dairy & Alternatives
  if (name.includes("soy milk")) {
    return {
      canonicalName: "Soy Milk (Unsweetened)",
      category: "Protein",
      retailUnit: "liters",
      packGrams: 1000,
      costPerPack: 85,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("curd") || name.includes("dahi") || name.includes("yogurt")) {
    return {
      canonicalName: "Fresh Curd / Dahi",
      category: "Protein",
      retailUnit: "g",
      packGrams: 400,
      costPerPack: 35,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("milk")) {
    return {
      canonicalName: "Cow Milk",
      category: "Protein",
      retailUnit: "liters",
      packGrams: 1000,
      costPerPack: 65,
      minPurchasePacks: 1,
    };
  }

  // 10. Fresh Produce (Vegetables, Salads & Fruits)
  if (name.includes("sprout")) {
    return {
      canonicalName: "Moong Sprouts",
      category: "Fresh Produce",
      retailUnit: "g",
      packGrams: 250,
      costPerPack: 35,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("banana")) {
    return {
      canonicalName: "Fresh Bananas",
      category: "Fresh Produce",
      retailUnit: "pieces",
      packGrams: 120,
      costPerPack: 5, // ₹5 each / ₹60 dozen
      minPurchasePacks: 6,
    };
  }
  if (name.includes("apple")) {
    return {
      canonicalName: "Fresh Apples",
      category: "Fresh Produce",
      retailUnit: "pieces",
      packGrams: 180,
      costPerPack: 25,
      minPurchasePacks: 4,
    };
  }
  if (name.includes("palak") || name.includes("spinach")) {
    return {
      canonicalName: "Fresh Spinach (Palak)",
      category: "Fresh Produce",
      retailUnit: "bunch",
      packGrams: 250,
      costPerPack: 20,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("salad") || name.includes("cucumber") || name.includes("tomato")) {
    return {
      canonicalName: "Fresh Salad (Cucumbers & Tomatoes)",
      category: "Fresh Produce",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 35,
      minPurchasePacks: 1,
    };
  }
  if (name.includes("sabzi") || name.includes("vegetable")) {
    return {
      canonicalName: "Mixed Seasonal Vegetables",
      category: "Fresh Produce",
      retailUnit: "g",
      packGrams: 500,
      costPerPack: 45,
      minPurchasePacks: 1,
    };
  }

  // Default fallback: Clean dish name of "(Cooked)", "(Raw)", etc.
  const cleanedName = dishName
    .replace(/\s*\((?:cooked|raw|dry|plain|whole|boiled)\)/gi, "")
    .replace(/\s+(?:curry|bhurji|chaat|tadka)$/gi, "")
    .trim();

  let fallbackCategory: "Protein" | "Grains & Staples" | "Fresh Produce" | "Pantry & Healthy Fats" | "Snack" = "Grains & Staples";
  if (cat.includes("protein") || cat.includes("dairy")) fallbackCategory = "Protein";
  else if (cat.includes("veg") || cat.includes("fruit")) fallbackCategory = "Fresh Produce";
  else if (cat.includes("snack") || cat.includes("nut")) fallbackCategory = "Snack";

  return {
    canonicalName: cleanedName || dishName,
    category: fallbackCategory,
    retailUnit: "pack",
    packGrams: 250,
    costPerPack: 30,
    minPurchasePacks: 1,
  };
}

/**
 * Returns diet-adaptive grocery category pills.
 * E.g., for a Vegan user, avoids "Dairy & High-Protein" and renders "Plant Protein & Tofu".
 */
export function getGroceryCategories(dietType?: string | null): string[] {
  const dt = (dietType || "").toLowerCase().trim();

  let proteinLabel = "Protein Essentials";
  if (dt.includes("vegan")) {
    proteinLabel = "Plant Protein & Tofu";
  } else if (dt.includes("vegetarian") || dt.includes("veg")) {
    proteinLabel = "Dairy & Plant Protein";
  } else if (dt.includes("egg")) {
    proteinLabel = "Eggs & Plant Protein";
  } else if (dt.includes("non")) {
    proteinLabel = "Meat, Eggs & Dairy";
  }

  return [
    "All",
    proteinLabel,
    "Grains & Staples",
    "Fresh Produce",
    "Pantry & Healthy Fats",
  ];
}

/**
 * Normalizes grocery category to align with active category filter tab.
 */
export function normalizeCategoryForDiet(
  category?: string | null,
  itemName?: string | null,
  dietType?: string | null
): string {
  const cat = (category || "").toLowerCase();
  const name = (itemName || "").toLowerCase();
  const dt = (dietType || "").toLowerCase();

  let proteinCategoryName = "Protein Essentials";
  if (dt.includes("vegan")) {
    proteinCategoryName = "Plant Protein & Tofu";
  } else if (dt.includes("vegetarian") || (dt.includes("veg") && !dt.includes("non"))) {
    proteinCategoryName = "Dairy & Plant Protein";
  } else if (dt.includes("egg")) {
    proteinCategoryName = "Eggs & Plant Protein";
  } else if (dt.includes("non")) {
    proteinCategoryName = "Meat, Eggs & Dairy";
  }

  // Protein-rich items
  if (
    cat.includes("protein") ||
    cat.includes("dairy") ||
    name.includes("soya") ||
    name.includes("tofu") ||
    name.includes("paneer") ||
    name.includes("egg") ||
    name.includes("curd") ||
    name.includes("dahi") ||
    name.includes("milk") ||
    name.includes("chicken") ||
    name.includes("fish") ||
    name.includes("whey")
  ) {
    return proteinCategoryName;
  }

  // Grains & Staples
  if (
    cat.includes("grain") ||
    cat.includes("carb") ||
    cat.includes("pulse") ||
    cat.includes("staple") ||
    name.includes("dal") ||
    name.includes("chana") ||
    name.includes("rajma") ||
    name.includes("lobia") ||
    name.includes("atta") ||
    name.includes("flour") ||
    name.includes("roti") ||
    name.includes("rice") ||
    name.includes("oat") ||
    name.includes("bread") ||
    name.includes("potato")
  ) {
    return "Grains & Staples";
  }

  // Fresh Produce
  if (
    cat.includes("veg") ||
    cat.includes("fruit") ||
    cat.includes("produce") ||
    name.includes("banana") ||
    name.includes("apple") ||
    name.includes("spinach") ||
    name.includes("palak") ||
    name.includes("sprout") ||
    name.includes("salad") ||
    name.includes("cucumber") ||
    name.includes("tomato")
  ) {
    return "Fresh Produce";
  }

  // Pantry, Nuts & Healthy Fats
  return "Pantry & Healthy Fats";
}

/**
 * Provides user-facing context labels for their living and food environment.
 */
export function getFoodEnvironmentInfo(foodEnvironment?: string) {
  const env = (foodEnvironment || "").toLowerCase().trim();

  if (env.includes("hostel")) {
    return {
      badge: "⚡ Hostel Mess (Room Add-ons & Boosters)",
      title: "Hostel Mess Living",
      isMess: true,
      description: "Base meals (Rotis, Rice, Mess Dal & Sabzi) are provided by your hostel mess (₹0). Only room add-ons and extra protein boosters are in this shopping cart.",
    };
  }

  if (env.includes("pg")) {
    return {
      badge: "🏠 PG Mess (Room Add-ons & Boosters)",
      title: "PG Mess Living",
      isMess: true,
      description: "Base meals (Rotis, Rice, Daily Dal & Sabzi) are provided by your PG mess (₹0). Only room snacks and extra protein boosters are in this shopping cart.",
    };
  }

  if (env.includes("home")) {
    return {
      badge: "🏡 Home Living (Personal Fitness Groceries)",
      title: "Family Home Kitchen",
      isMess: true,
      description: "Family kitchen provides base meals (Rotis, Rice, Dal & Sabzi at ₹0). Your shopping list includes personal fitness boosters and protein items.",
    };
  }

  if (env.includes("cook")) {
    return {
      badge: "🍳 Self-Cooked (Full Kitchen Grocery Run)",
      title: "Self-Cooked Kitchen",
      isMess: false,
      description: "Raw cooking staples, flours, dals, and fresh produce for your personally prepped 7-day fitness meals.",
    };
  }

  return {
    badge: "🛒 Smart Grocery Run",
    title: "Personalized Grocery List",
    isMess: false,
    description: "Calculated from your active nutrition plan and calibrated for your weekly shopping runs.",
  };
}
