import fs from "node:fs";
import path from "node:path";

const seedDir = path.resolve(process.cwd(), "supabase/seed/nutrition_v2");
const recipes = JSON.parse(fs.readFileSync(path.join(seedDir, "recipes.json"), "utf8"));
const versions = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_versions.json"), "utf8"));
const variants = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variants.json"), "utf8"));
const ings = JSON.parse(fs.readFileSync(path.join(seedDir, "recipe_variant_ingredients.json"), "utf8"));

const sweetPotatoRecipes = versions.filter(v => (v.name || "").toLowerCase().includes("sweet potato") || JSON.stringify(v.instructions || "").toLowerCase().includes("sweet potato"));
console.log("Matching recipes:", sweetPotatoRecipes.map(r => ({ id: r.id, name: r.name, slug: r.slug })));

for (const rv of sweetPotatoRecipes) {
  const vts = variants.filter(v => v.recipe_version_id === rv.id);
  console.log(`\nRecipe: ${rv.name} (${rv.id})`);
  for (const vt of vts) {
    console.log(`  Variant: ${vt.name} (${vt.id})`);
    const varIngs = ings.filter(i => i.recipe_variant_id === vt.id);
    for (const vi of varIngs) {
      console.log(`    - ${vi.food_name}: ${vi.amount}${vi.unit}, role=${vi.role}, portionType=${vi.portion_type}`);
    }
  }
}
