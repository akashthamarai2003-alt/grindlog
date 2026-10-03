import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20260905_comprehensive_nutrition_database.sql");
const content = fs.readFileSync(migrationPath, "utf8");

const regex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+),\s*([0-9.]+),\s*'([^']+)',\s*(true|false),\s*(true|false)/g;

const foods = [];
let match;
while ((match = regex.exec(content)) !== null) {
  foods.push({
    name: match[1],
    category: match[2],
    serving_size: match[3],
    calories: parseFloat(match[4]),
    protein: parseFloat(match[5]),
    carbs: parseFloat(match[6]),
    fat: parseFloat(match[7]),
    estimated_cost: parseFloat(match[8]),
    diet_type: match[9],
    is_pg_friendly: match[10] === 'true'
  });
}

console.log(`Parsed ${foods.length} foods from 20260905 migration.`);
const outPath = path.resolve(process.cwd(), "supabase/seed/catalog-foods.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(foods, null, 2), "utf8");
console.log(`Written to ${outPath}`);
