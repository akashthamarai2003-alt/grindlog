import fs from "node:fs";

const versions = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_versions.json", "utf8"));
const oats = versions.filter(v => v.name.toLowerCase().includes("oats"));
for (const o of oats) {
  console.log(`- ${o.name} | eq: [${o.required_equipment.join(",")}] | env: [${o.supported_environments.join(",")}] | diet: ${o.diet_category}`);
}
