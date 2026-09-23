import fs from "node:fs";
import path from "node:path";

// Exact Allergen and Diet Classification Rules for all 149 verified foods
const ALLERGEN_MAP = {
  // Eggs
  "Boiled Egg White": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Boiled Egg (Whole)": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Scrambled Eggs": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Egg Omelette": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Egg Bhurji (Indian Scramble)": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Bread Omelette": { allergens: ["eggs", "gluten"], diet_type: "eggetarian" },
  "Egg Biryani": { allergens: ["eggs"], diet_type: "eggetarian" },
  "Egg Curry (2 Eggs)": { allergens: ["eggs"], diet_type: "eggetarian" },

  // Fish & Seafood
  "Fish Curry (Rohu / Indian Carp)": { allergens: ["fish"], diet_type: "non-veg" },
  "Grilled Fish / Fish Fry": { allergens: ["fish"], diet_type: "non-veg" },
  "Grilled Salmon": { allergens: ["fish"], diet_type: "non-veg" },
  "Canned Tuna (in Water)": { allergens: ["fish"], diet_type: "non-veg" },
  "Prawns Masala": { allergens: ["shellfish"], diet_type: "non-veg" },

  // Dairy
  "Fresh Paneer (Raw)": { allergens: ["dairy"], diet_type: "veg" },
  "Low Fat Paneer": { allergens: ["dairy"], diet_type: "veg" },
  "Grilled Paneer / Paneer Tikka": { allergens: ["dairy"], diet_type: "veg" },
  "Paneer Bhurji": { allergens: ["dairy"], diet_type: "veg" },
  "Paneer Paratha": { allergens: ["dairy", "gluten"], diet_type: "veg" },
  "Palak Paneer": { allergens: ["dairy"], diet_type: "veg" },
  "Matar Paneer": { allergens: ["dairy"], diet_type: "veg" },
  "Kadai Paneer": { allergens: ["dairy"], diet_type: "veg" },
  "Paneer Butter Masala": { allergens: ["dairy"], diet_type: "veg" },
  "Whole Milk": { allergens: ["dairy"], diet_type: "veg" },
  "Toned Milk (3% Fat)": { allergens: ["dairy"], diet_type: "veg" },
  "Double Toned / Skimmed Milk": { allergens: ["dairy"], diet_type: "veg" },
  "Curd / Dahi (Plain)": { allergens: ["dairy"], diet_type: "veg" },
  "Low Fat Curd / Dahi": { allergens: ["dairy"], diet_type: "veg" },
  "Greek Yogurt (Plain)": { allergens: ["dairy"], diet_type: "veg" },
  "Chaas / Buttermilk (Salted)": { allergens: ["dairy"], diet_type: "veg" },
  "Sweet Lassi": { allergens: ["dairy"], diet_type: "veg" },
  "Cheese Slice (Amul / Britannia)": { allergens: ["dairy"], diet_type: "veg" },
  "Desi Ghee": { allergens: ["dairy"], diet_type: "veg" },
  "Chapati with Ghee": { allergens: ["dairy", "gluten"], diet_type: "veg" },
  "Indian Chai with Milk": { allergens: ["dairy"], diet_type: "veg" },
  "Filter Coffee with Milk": { allergens: ["dairy"], diet_type: "veg" },
  "Oats with Milk": { allergens: ["dairy", "gluten"], diet_type: "veg" },
  "Overnight Oats with Chia": { allergens: ["dairy", "gluten"], diet_type: "veg" },
  "Curd Rice": { allergens: ["dairy"], diet_type: "veg" },
  "Moong Dal Khichdi": { allergens: ["dairy"], diet_type: "veg" },
  "Ven Pongal": { allergens: ["dairy", "tree_nuts"], diet_type: "veg" },
  "Dal Tadka": { allergens: ["dairy"], diet_type: "veg" },
  "Dal Fry": { allergens: ["dairy"], diet_type: "veg" },
  "Plain Paratha": { allergens: ["gluten"], diet_type: "veg" },
  "Aloo Paratha": { allergens: ["gluten"], diet_type: "veg" },
  "Gobi Paratha": { allergens: ["gluten"], diet_type: "veg" },

  // Soy
  "Soya Chunks (Raw / Dry)": { allergens: ["soy"], diet_type: "vegan" },
  "Soya Chunks Curry (Cooked)": { allergens: ["soy"], diet_type: "vegan" },
  "Tofu (Firm)": { allergens: ["soy"], diet_type: "vegan" },
  "Tofu Bhurji / Scramble": { allergens: ["soy"], diet_type: "vegan" },
  "Soya Chaap (Grilled / Masala)": { allergens: ["soy", "gluten"], diet_type: "vegan" },
  "Tempeh": { allergens: ["soy"], diet_type: "vegan" },
  "Soy Milk (Unsweetened)": { allergens: ["soy"], diet_type: "vegan" },

  // Gluten
  "Chapati / Phulka": { allergens: ["gluten"], diet_type: "vegan" },
  "Multigrain Roti": { allergens: ["gluten"], diet_type: "vegan" },
  "Whole Wheat Bread": { allergens: ["gluten"], diet_type: "vegan" },
  "Brown Bread": { allergens: ["gluten"], diet_type: "vegan" },
  "Peanut Butter Toast": { allergens: ["gluten", "peanuts"], diet_type: "vegan" },
  "Poori": { allergens: ["gluten"], diet_type: "vegan" },
  "Upma": { allergens: ["gluten"], diet_type: "vegan" },
  "Rava Dosa": { allergens: ["gluten"], diet_type: "vegan" },
  "Vegetable Daliya": { allergens: ["gluten"], diet_type: "vegan" },
  "Masala Oats": { allergens: ["gluten"], diet_type: "vegan" },
  "Oat Milk": { allergens: ["gluten"], diet_type: "vegan" },

  // Peanuts
  "Roasted Peanuts": { allergens: ["peanuts"], diet_type: "vegan" },
  "Natural Peanut Butter": { allergens: ["peanuts"], diet_type: "vegan" },
  "Poha": { allergens: ["peanuts"], diet_type: "vegan" },
  "Lemon Rice": { allergens: ["peanuts"], diet_type: "vegan" },

  // Tree Nuts
  "Raw Almonds": { allergens: ["tree_nuts"], diet_type: "vegan" },
  "Roasted Almonds": { allergens: ["tree_nuts"], diet_type: "vegan" },
  "Walnuts (Akrot)": { allergens: ["tree_nuts"], diet_type: "vegan" },
  "Cashews (Kaju)": { allergens: ["tree_nuts"], diet_type: "vegan" },
  "Pistachios (Pista)": { allergens: ["tree_nuts"], diet_type: "vegan" },
  "Almond Milk (Unsweetened)": { allergens: ["tree_nuts"], diet_type: "vegan" },

  // Corrected Authentic Indian Vegan Staples
  "Idli": { allergens: [], diet_type: "vegan" },
  "Plain Dosa": { allergens: [], diet_type: "vegan" },
  "Masala Dosa": { allergens: [], diet_type: "vegan" },
  "Set Dosa": { allergens: [], diet_type: "vegan" },
  "Moong Dal Cheela": { allergens: [], diet_type: "vegan" },
  "Besan Cheela": { allergens: [], diet_type: "vegan" },
  "Medu Vada": { allergens: [], diet_type: "vegan" },
  "Yellow Moong Dal": { allergens: [], diet_type: "vegan" },
  "Masoor Dal (Red Lentil)": { allergens: [], diet_type: "vegan" },
  "Toor Dal (Arhar Dal)": { allergens: [], diet_type: "vegan" },
  "Chana Dal Curry": { allergens: [], diet_type: "vegan" },
  "Rajma (Kidney Beans Curry)": { allergens: [], diet_type: "vegan" },
  "Chole / Chana Masala": { allergens: [], diet_type: "vegan" },
  "Kala Chana Curry": { allergens: [], diet_type: "vegan" },
  "Lobia (Black Eyed Peas Curry)": { allergens: [], diet_type: "vegan" },
  "Sambar": { allergens: [], diet_type: "vegan" },
  "Rasam": { allergens: [], diet_type: "vegan" },
  "White Rice (Steamed)": { allergens: [], diet_type: "vegan" },
  "Brown Rice (Cooked)": { allergens: [], diet_type: "vegan" },
  "Jeera Rice": { allergens: [], diet_type: "vegan" },
  "Sambar Rice": { allergens: [], diet_type: "vegan" },
  "Veg Biryani / Pulao": { allergens: [], diet_type: "vegan" },
  "Quinoa (Cooked)": { allergens: [], diet_type: "vegan" },
  "Boiled Sweet Potato": { allergens: [], diet_type: "vegan" },
  "Boiled Potato": { allergens: [], diet_type: "vegan" }
};

const filePath = path.resolve(process.cwd(), "scripts/seed-comprehensive-foods.mjs");
let content = fs.readFileSync(filePath, "utf-8");

// Parse VERIFIED_FOODS lines
const lines = content.split("\n");
const newLines = [];
let insideArray = false;
let updatedFoodsCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes("export const VERIFIED_FOODS = [")) {
    insideArray = true;
    newLines.push(line);
    continue;
  }

  if (insideArray && line.trim() === "];") {
    insideArray = false;
    newLines.push(line);
    continue;
  }

  if (insideArray && line.trim().startsWith("{ name:")) {
    // Extract name
    const match = line.match(/name:\s*"([^"]+)"/);
    if (match) {
      const name = match[1];
      const override = ALLERGEN_MAP[name];
      const allergens = override?.allergens ?? [];
      const dietType = override?.diet_type;

      let updatedLine = line;

      // Update diet_type if specified in override
      if (dietType) {
        updatedLine = updatedLine.replace(/diet_type:\s*"[^"]+"/, `diet_type: "${dietType}"`);
      }

      // Add allergens array before is_pg_friendly or at the end of object
      if (!updatedLine.includes("allergens:")) {
        const allergensJson = JSON.stringify(allergens);
        updatedLine = updatedLine.replace(/is_pg_friendly:\s*(true|false)/, `allergens: ${allergensJson}, is_pg_friendly: $1`);
      }

      newLines.push(updatedLine);
      updatedFoodsCount++;
      continue;
    }
  }

  // Ensure payload in seed() includes allergens
  if (line.includes("diet_type: item.diet_type,") && !lines[i + 1]?.includes("allergens:")) {
    newLines.push(line);
    newLines.push("      allergens: item.allergens || [],");
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join("\n"), "utf-8");
console.log(`Successfully enriched ${updatedFoodsCount} foods with allergen and diet metadata!`);
