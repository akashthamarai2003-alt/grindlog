import fs from "node:fs";

const recipes = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipes.json", "utf8"));
const versions = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_versions.json", "utf8"));
const ings = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_variant_ingredients.json", "utf8"));

const avoided = ["onion", "garlic", "eggplant", "mushroom"];

const jainCompatible = [];

for (const v of versions) {
  if (!["vegan", "vegetarian"].includes(v.diet_category)) continue;
  // check ingredients
  const vIngs = ings.filter(i => {
    // find variant id
    return (i.food_name || "").toLowerCase().includes("onion") ||
      (i.food_name || "").toLowerCase().includes("garlic") ||
      (i.food_name || "").toLowerCase().includes("eggplant") ||
      (i.food_name || "").toLowerCase().includes("mushroom");
  });
  // let's see which recipes have any of these
  const recipeVariants = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_variants.json", "utf8")).filter(vt => vt.recipe_version_id === v.id);
  const variantIds = new Set(recipeVariants.map(vt => vt.id));
  const hasAvoided = ings.some(i => variantIds.has(i.recipe_variant_id) && avoided.some(a => (i.food_name || "").toLowerCase().includes(a)));
  if (!hasAvoided) {
    jainCompatible.push(v);
  }
}

console.log("Total Jain-compatible recipe versions:", jainCompatible.length);
for (const j of jainCompatible.slice(0, 20)) {
  console.log(" -", j.name, "| protein:", j.primary_protein, "| tags:", j.dietary_tags);
}
