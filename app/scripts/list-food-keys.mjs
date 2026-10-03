import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const foods = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "supabase/seed/catalog-foods.json"), "utf8"));
console.log(`Loaded ${foods.length} foods.`);

const byCategory = {};
for (const f of foods) {
  if (!byCategory[f.category]) byCategory[f.category] = [];
  byCategory[f.category].push({ name: f.name, serving: f.serving_size, cal: f.calories, p: f.protein, diet: f.diet_type });
}

console.log("Categories:", Object.keys(byCategory));
for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`\n--- Category: ${cat} (${items.length} items) ---`);
  items.slice(0, 8).forEach(i => console.log(`  * ${i.name} [${i.serving}] (${i.cal} kcal, ${i.p}g P, ${i.diet})`));
}
