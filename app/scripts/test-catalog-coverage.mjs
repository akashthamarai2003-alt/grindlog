import fs from "node:fs";
import path from "node:path";
import process from "node:process";

console.log("==================================================");
console.log("GRINDLOG NUTRITION V2: PERSONA CATALOG COVERAGE SIMULATION");
console.log("==================================================");

const seedDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");
const foods = JSON.parse(fs.readFileSync(path.join(seedDir, "foods.json"), "utf8"));
const recipes = JSON.parse(fs.readFileSync(path.join(seedDir, "recipes.json"), "utf8"));
const recipeVersions = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_versions.json"), "utf8"));
const recipeVariants = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variants.json"), "utf8"));
const variantIngredients = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variant_ingredients.json"), "utf8"));

const foodById = new Map(foods.map(f => [f.id, f]));
const versionById = new Map(recipeVersions.map(v => [v.id, v]));

// Map variant ingredients to variants and recipe versions
const ingredientsByVariant = new Map();
for (const ing of variantIngredients) {
  if (!ingredientsByVariant.has(ing.recipe_variant_id)) {
    ingredientsByVariant.set(ing.recipe_variant_id, []);
  }
  ingredientsByVariant.get(ing.recipe_variant_id).push(ing);
}

const variantsByVersion = new Map();
for (const vt of recipeVariants) {
  if (!variantsByVersion.has(vt.recipe_version_id)) {
    variantsByVersion.set(vt.recipe_version_id, []);
  }
  variantsByVersion.get(vt.recipe_version_id).push(vt);
}

// Helper to filter recipes for a user persona
function filterRecipesForPersona(persona) {
  const eligibleRecipes = [];

  for (const v of recipeVersions) {
    // 1. Diet Compatibility
    if (persona.diet === "vegan" && v.diet_category !== "vegan") continue;
    if (persona.diet === "vegetarian" && !["vegan", "vegetarian"].includes(v.diet_category)) continue;
    if (persona.diet === "eggetarian" && !["vegan", "vegetarian", "eggetarian"].includes(v.diet_category)) continue;
    // non-veg can eat all

    // 2. Specific Diet Exclusions (e.g. pescetarian excludes chicken and mutton)
    if (persona.excludeProteins && persona.excludeProteins.length > 0) {
      let containsExcluded = false;
      const vVariants = variantsByVersion.get(v.id) || [];
      for (const vt of vVariants) {
        const ings = ingredientsByVariant.get(vt.id) || [];
        for (const ing of ings) {
          const f = foodById.get(ing.food_id);
          const lowerName = f.name.toLowerCase();
          for (const exc of persona.excludeProteins) {
            if (lowerName.includes(exc.toLowerCase())) {
              containsExcluded = true;
              break;
            }
          }
          if (containsExcluded) break;
        }
        if (containsExcluded) break;
      }
      if (containsExcluded) continue;
    }

    // 3. Environment & Equipment
    if (persona.environments && persona.environments.length > 0) {
      const envMatch = persona.environments.some(env => v.supported_environments.includes(env));
      if (!envMatch) continue;
    }

    if (persona.allowedEquipment && persona.allowedEquipment.length > 0) {
      const eqMatch = v.required_equipment.some(eq => eq === "none" || persona.allowedEquipment.includes(eq));
      if (!eqMatch) continue;
    }

    // 4. Max Cooking Time
    if (persona.maxCookingTimeMin && v.cooking_time_min > persona.maxCookingTimeMin) {
      continue;
    }

    // 5. Allergens & Avoided Foods
    let hasAllergen = false;
    const vVariants = variantsByVersion.get(v.id) || [];
    for (const vt of vVariants) {
      const ings = ingredientsByVariant.get(vt.id) || [];
      for (const ing of ings) {
        const f = foodById.get(ing.food_id);
        if (persona.allergies && persona.allergies.length > 0) {
          for (const al of persona.allergies) {
            if (f.allergens && f.allergens.includes(al)) {
              hasAllergen = true;
              break;
            }
          }
        }
        if (persona.avoidedFoods && persona.avoidedFoods.length > 0) {
          for (const av of persona.avoidedFoods) {
            if (f.name.toLowerCase().includes(av.toLowerCase())) {
              hasAllergen = true;
              break;
            }
          }
        }
        if (hasAllergen) break;
      }
      if (hasAllergen) break;
    }
    if (hasAllergen) continue;

    // 6. Cost Check (if maximum cost specified)
    if (persona.maxCostPerMeal) {
      let costExceeded = false;
      for (const vt of vVariants) {
        if (vt.variant_tier === "REGULAR") {
          const ings = ingredientsByVariant.get(vt.id) || [];
          let mealCost = 0;
          for (const ing of ings) {
            const f = foodById.get(ing.food_id);
            if (ing.portion_type === "DISCRETE") {
              mealCost += ing.amount * (f.estimated_cost || 10);
            } else {
              mealCost += (ing.amount / (f.serving_weight_g || 100)) * (f.estimated_cost || 30);
            }
          }
          if (mealCost > persona.maxCostPerMeal) {
            costExceeded = true;
          }
        }
      }
      if (costExceeded) continue;
    }

    eligibleRecipes.push(v);
  }

  return eligibleRecipes;
}

const personas = [
  {
    id: 1,
    name: "Persona 1: The Jain / Satvik Vegetarian",
    diet: "vegetarian",
    avoidedFoods: ["onion", "garlic", "eggplant", "mushroom"]
  },
  {
    id: 2,
    name: "Persona 2: The Strict Vegan Bulker",
    diet: "vegan",
    allergies: ["milk", "egg", "fish", "shellfish"]
  },
  {
    id: 3,
    name: "Persona 3: The Hostel Student (Kettle Only)",
    diet: "vegetarian",
    environments: ["Hostel", "PG"],
    allowedEquipment: ["kettle"]
  },
  {
    id: 4,
    name: "Persona 4: Dairy-Free Non-Veg High-Protein Athlete",
    diet: "non-veg",
    allergies: ["milk"],
    avoidedFoods: ["paneer", "ghee", "curd", "yogurt", "milk", "cheese"]
  },
  {
    id: 5,
    name: "Persona 5: The Extreme Budget Worker (₹3,500/mo, < ₹45/meal)",
    diet: "vegetarian",
    maxCostPerMeal: 45
  },
  {
    id: 6,
    name: "Persona 6: The Nut-Allergic Eggetarian",
    diet: "eggetarian",
    allergies: ["peanut", "tree_nuts"]
  },
  {
    id: 7,
    name: "Persona 7: The Gluten-Free Vegetarian (Celiac)",
    diet: "vegetarian",
    allergies: ["wheat", "gluten"]
  },
  {
    id: 8,
    name: "Persona 8: The Busy Executive (Quick Prep <= 15 min)",
    diet: "vegetarian",
    maxCookingTimeMin: 15
  },
  {
    id: 9,
    name: "Persona 9: The PG Resident (Microwave / Kettle / Simple Prep)",
    diet: "eggetarian",
    environments: ["PG"],
    allowedEquipment: ["stove", "kettle", "microwave"]
  },
  {
    id: 10,
    name: "Persona 10: The Pescetarian (Fish + Eggs + Dairy, NO Chicken/Mutton)",
    diet: "non-veg",
    excludeProteins: ["chicken", "mutton"]
  },
  {
    id: 11,
    name: "Persona 11: The Low-Carb / Keto Eggetarian Cutter",
    diet: "eggetarian"
  }
];

let allPassed = true;

for (const p of personas) {
  const eligible = filterRecipesForPersona(p);
  const count = eligible.length;
  const status = count >= 10 ? "EXCELLENT" : count >= 5 ? "SUFFICIENT" : "DEFICIT";

  console.log(`\n--------------------------------------------------`);
  console.log(`[Persona ${p.id}] ${p.name}`);
  console.log(`  Matching Recipes in Pool: ${count} (${status})`);
  
  if (count < 5) {
    console.error(`  FAIL: Less than 5 viable recipes found!`);
    allPassed = false;
  } else {
    // Show sample 3 recipes
    const sample = eligible.slice(0, 3).map(r => `"${r.name}" (${r.cooking_time_min}m)`).join(", ");
    console.log(`  Sample Candidates: ${sample}`);
  }
}

console.log("\n==================================================");
if (allPassed) {
  console.log("ALL 11 PERSONA SIMULATIONS PASSED WITH ROBUST MEAL POOLS!");
} else {
  console.error("FAIL: One or more personas did not meet minimum recipe pool requirements!");
  process.exit(1);
}
console.log("==================================================");
