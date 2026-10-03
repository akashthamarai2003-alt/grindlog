import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function auditFoods() {
  console.log("Auditing existing food catalog in Supabase...");
  const { data: foods, error } = await supabase
    .from("foods")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching foods:", error);
    process.exit(1);
  }

  console.log(`Total food catalog items in database: ${foods.length}`);

  // Inspect allergen coverage
  const withAllergens = foods.filter(f => Array.isArray(f.allergens) && f.allergens.length > 0);
  console.log(`Foods with explicit allergen tags: ${withAllergens.length}/${foods.length}`);

  // Inspect diet distribution
  const dietCounts = {};
  for (const f of foods) {
    const d = f.diet_type || 'unspecified';
    dietCounts[d] = (dietCounts[d] || 0) + 1;
  }
  console.log("Diet distribution:", dietCounts);

  // Inspect composite vs raw foods
  const compositeCandidates = foods.filter(f => 
    f.name.toLowerCase().includes("bhurji") || 
    f.name.toLowerCase().includes("cheela") || 
    f.name.toLowerCase().includes("omelette") ||
    f.serving_size?.includes("+")
  );
  console.log(`Identified composite dishes in foods table: ${compositeCandidates.length}`);
  compositeCandidates.forEach(f => {
    console.log(`  - [${f.id}] ${f.name} (serving: "${f.serving_size}", diet: ${f.diet_type})`);
  });

  return foods;
}

auditFoods().catch(console.error);
