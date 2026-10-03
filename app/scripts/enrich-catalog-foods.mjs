import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const catalogFoodsPath = path.resolve(process.cwd(), "supabase/seed/catalog-foods.json");
const catalogFoods = JSON.parse(fs.readFileSync(catalogFoodsPath, "utf8"));

// Read seed-comprehensive-foods.mjs text to extract allergens
const seedContent = fs.readFileSync(path.resolve(process.cwd(), "scripts/seed-comprehensive-foods.mjs"), "utf8");
const allergenRegex = /name:\s*"([^"]+)"[^}]+allergens:\s*(\[[^\]]*\])/g;
const allergensMap = new Map();
let match;
while ((match = allergenRegex.exec(seedContent)) !== null) {
  try {
    const name = match[1].toLowerCase().trim();
    const parsedAllergens = JSON.parse(match[2].replace(/'/g, '"'));
    allergensMap.set(name, parsedAllergens);
  } catch (e) {
    // fallback
  }
}

// Discrete food identification
const DISCRETE_NAMES = [
  "boiled egg white",
  "boiled egg (whole)",
  "egg omelette",
  "chapati / phulka",
  "chapati with ghee",
  "multigrain roti",
  "plain paratha",
  "aloo paratha",
  "paneer paratha",
  "gobi paratha",
  "idli",
  "plain dosa",
  "masala dosa",
  "rava dosa",
  "set dosa",
  "banana",
  "apple",
  "orange / mosambi",
  "guava (amrood)",
  "kiwi",
  "whole wheat bread",
  "brown bread",
  "cheese slice (amul / britannia)",
  "medjool dates (khajoor)",
  "tender coconut water",
  "poori",
  "medu vada",
  "chicken tikka",
  "grilled fish / fish fry",
  "tandoori chicken",
  "fresh cucumber",
  "fresh tomato",
  "raw carrots"
];

function determinePortionRule(food) {
  const nameLower = food.name.toLowerCase().trim();
  const isDiscrete = DISCRETE_NAMES.some(d => nameLower.includes(d) || d.includes(nameLower));

  if (isDiscrete) {
    if (nameLower.includes("egg white")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 3, max_sensible_portion: 8, increment_step: 1 };
    }
    if (nameLower.includes("egg") && !nameLower.includes("curry") && !nameLower.includes("bhurji") && !nameLower.includes("biryani")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 2, max_sensible_portion: 6, increment_step: 1 };
    }
    if (nameLower.includes("chapati") || nameLower.includes("roti") || nameLower.includes("paratha")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 2, max_sensible_portion: 6, increment_step: 1 };
    }
    if (nameLower.includes("bread") || nameLower.includes("toast")) {
      return { portion_type: "DISCRETE", unit: "slice", min_portion: 1, default_portion: 2, max_sensible_portion: 6, increment_step: 1 };
    }
    if (nameLower.includes("idli")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 2, default_portion: 3, max_sensible_portion: 6, increment_step: 1 };
    }
    if (nameLower.includes("dosa")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 1, max_sensible_portion: 3, increment_step: 1 };
    }
    if (nameLower.includes("banana") || nameLower.includes("apple") || nameLower.includes("orange") || nameLower.includes("guava") || nameLower.includes("kiwi")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 1, max_sensible_portion: 3, increment_step: 1 };
    }
    if (nameLower.includes("cheese slice")) {
      return { portion_type: "DISCRETE", unit: "slice", min_portion: 1, default_portion: 1, max_sensible_portion: 3, increment_step: 1 };
    }
    if (nameLower.includes("dates")) {
      return { portion_type: "DISCRETE", unit: "piece", min_portion: 2, default_portion: 2, max_sensible_portion: 5, increment_step: 1 };
    }
    return { portion_type: "DISCRETE", unit: "piece", min_portion: 1, default_portion: 1, max_sensible_portion: 4, increment_step: 1 };
  }

  // Continuous food (g, ml, bowl)
  if (food.category === "Dairy" && (nameLower.includes("milk") || nameLower.includes("chaas") || nameLower.includes("lassi"))) {
    return { portion_type: "CONTINUOUS", unit: "ml", min_portion: 100, default_portion: 250, max_sensible_portion: 500, increment_step: 50 };
  }
  if (nameLower.includes("oat")) {
    return { portion_type: "CONTINUOUS", unit: "g", min_portion: 30, default_portion: 50, max_sensible_portion: 120, increment_step: 10 };
  }
  if (nameLower.includes("poha") || nameLower.includes("upma") || nameLower.includes("khichdi")) {
    return { portion_type: "CONTINUOUS", unit: "g", min_portion: 75, default_portion: 150, max_sensible_portion: 350, increment_step: 25 };
  }
  if (food.category === "Curry" || (food.category === "Staple" && nameLower.includes("rice"))) {
    return { portion_type: "CONTINUOUS", unit: "g", min_portion: 75, default_portion: 150, max_sensible_portion: 450, increment_step: 25 };
  }
  if (nameLower.includes("chicken") || nameLower.includes("paneer") || nameLower.includes("tofu") || nameLower.includes("fish")) {
    return { portion_type: "CONTINUOUS", unit: "g", min_portion: 50, default_portion: 100, max_sensible_portion: 300, increment_step: 25 };
  }
  if (food.category === "Nuts & Snacks") {
    return { portion_type: "CONTINUOUS", unit: "g", min_portion: 15, default_portion: 25, max_sensible_portion: 60, increment_step: 5 };
  }
  return { portion_type: "CONTINUOUS", unit: "g", min_portion: 50, default_portion: 100, max_sensible_portion: 300, increment_step: 25 };
}

function parseServingWeightG(servingSize) {
  // Must match g or ml at word boundary so "glass" is not matched as "g"
  const match = servingSize.match(/(\d+(?:\.\d+)?)\s*(ml|g)\b/i);
  if (match) return parseFloat(match[1]);
  return 100;
}

const enrichedFoods = catalogFoods.map((f) => {
  const nameLower = f.name.toLowerCase().trim();
  const allergens = allergensMap.get(nameLower) || [];
  const portion = determinePortionRule(f);
  const serving_weight_g = parseServingWeightG(f.serving_size);

  let dietType = f.diet_type;
  if (dietType === "veg") dietType = "vegetarian";

  return {
    ...f,
    diet_type: dietType,
    allergens,
    serving_weight_g,
    serving_unit: portion.unit,
    preparation_state: "cooked",
    portion_rule: portion
  };
});

fs.writeFileSync(catalogFoodsPath, JSON.stringify(enrichedFoods, null, 2), "utf8");
console.log(`Enriched ${enrichedFoods.length} foods with structured allergens, weights, and portion rules.`);
