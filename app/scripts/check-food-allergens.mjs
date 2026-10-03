import fs from "node:fs";

const foods = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/foods.json", "utf8"));
const dairy = foods.filter(f => f.name.toLowerCase().includes("paneer") || f.name.toLowerCase().includes("curd") || f.name.toLowerCase().includes("ghee") || f.name.toLowerCase().includes("milk") || f.name.toLowerCase().includes("yogurt"));

for (const d of dairy) {
  console.log(d.name, "allergens:", d.allergens);
}
