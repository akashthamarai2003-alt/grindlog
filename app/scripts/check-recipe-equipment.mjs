import fs from "node:fs";

const versions = JSON.parse(fs.readFileSync("supabase/seed/nutrition_v2/recipe_versions.json", "utf8"));
console.log("Total recipe versions:", versions.length);

const emptyEq = versions.filter(v => !v.required_equipment || v.required_equipment.length === 0 || v.required_equipment.includes("none"));
console.log("Empty or 'none' equipment versions count:", emptyEq.length);
for (const v of emptyEq.slice(0, 15)) {
  console.log(`- ${v.name} (env: ${v.supported_environments.join(", ")}) (diet: ${v.diet_category})`);
}

const kettleEq = versions.filter(v => v.required_equipment && v.required_equipment.includes("kettle"));
console.log("\nKettle equipment count:", kettleEq.length);
for (const v of kettleEq) {
  console.log(`- ${v.name}`);
}
