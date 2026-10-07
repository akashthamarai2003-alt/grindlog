import fs from "node:fs";
import path from "node:path";

const manifestPath = path.resolve("artifacts/phase5b/recipe-image-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const personaPlansPath = path.resolve("artifacts/phase5b/persona-plans.json");
const personaPlans = JSON.parse(fs.readFileSync(personaPlansPath, "utf8"));
const missingCsvPath = path.resolve("artifacts/phase5b/missing-recipe-images.csv");
const missingLines = fs.readFileSync(missingCsvPath, "utf8").trim().split("\n").slice(1);

const missingSlugs = new Set();
for (const line of missingLines) {
  // recipe_id,recipe_slug,...
  const parts = line.split(",");
  missingSlugs.add(parts[1]);
}

const nameToRecipe = new Map(manifest.recipes.map(r => [r.recipe_name, r]));

// Count frequencies in persona plans
const freqMap = new Map();
for (const p of personaPlans) {
  for (const day of (p.days || [])) {
    for (const meal of (day.meals || [])) {
      const r = nameToRecipe.get(meal.name);
      if (r) {
        freqMap.set(r.slug, (freqMap.get(r.slug) || 0) + 1);
      }
    }
  }
}

const missingRecipes = manifest.recipes.filter(r => missingSlugs.has(r.slug)).map(r => {
  const text = (r.recipe_name + " " + r.slug + " " + r.primary_protein).toLowerCase();
  let prodCat = "Vegetarian";
  if (r.diet_category === "vegan") prodCat = "Vegan";
  else if (r.diet_category === "eggetarian") prodCat = "Eggetarian";
  else if (r.diet_category === "non-veg") {
    if (/fish|tuna|prawn|salmon|tilapia|rohu|seafood/.test(text)) {
      prodCat = "Fish";
    } else if (/chicken/.test(text)) {
      prodCat = "Chicken";
    } else {
      prodCat = "Other Non-Veg";
    }
  }
  
  const nameLower = r.recipe_name.toLowerCase();
  let mealType = "Main Course";
  if (/oats|poha|upma|chilla|cheela|toast|omelette|paratha|idli|dosa|boiled egg/.test(nameLower)) {
    mealType = "Breakfast";
  } else if (/sprouts|chaat|roasted chana|peanut|salad/.test(nameLower)) {
    mealType = "Snacks";
  } else if (/chai|coffee|lassi|chaas|milk|smoothie|shake/.test(nameLower)) {
    mealType = "Drinks / Sides";
  }

  return {
    slug: r.slug,
    name: r.recipe_name,
    diet: r.diet_category,
    prodCat,
    mealType,
    primary_protein: r.primary_protein,
    visible: r.key_visible_ingredients,
    planFreq: freqMap.get(r.slug) || 0
  };
});

console.log("Total missing recipes:", missingRecipes.length);

const byProdCat = {};
for (const r of missingRecipes) {
  if (!byProdCat[r.prodCat]) byProdCat[r.prodCat] = [];
  byProdCat[r.prodCat].push(r);
}

for (const [cat, list] of Object.entries(byProdCat)) {
  console.log(`\n--- Category: ${cat} (Count: ${list.length}) ---`);
  const sorted = list.sort((a,b) => b.planFreq - a.planFreq || a.name.localeCompare(b.name));
  for (const item of sorted.slice(0, 8)) {
    console.log(`  [freq=${item.planFreq}] [${item.mealType}] ${item.slug} -> ${item.name} (${item.visible.join(", ")})`);
  }
}
