import fs from "node:fs";
import path from "node:path";

const candidatesPath = path.resolve("artifacts/phase5b/image-candidates.json");
const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

const reviewsMap = {
  "dal-fry-paneer-rice": {
    notes: "Yellow dal fry with roasted cumin tempering in ceramic bowl, steamed white basmati rice, and fresh raw paneer cubes clearly visible. Pure lacto-vegetarian, no roti, meat, or eggs."
  },
  "chole-paneer-paratha": {
    notes: "Authentic North Indian meal: dark spiced chole chickpea curry, golden griddled paneer paratha cut in half displaying paneer filling, and fresh plain curd. No rice or meat."
  },
  "chana-dal-paneer-phulka": {
    notes: "Golden split Bengal gram chana dal curry, two thin puffed soft whole wheat phulkas with light char marks, and fresh paneer cubes. No meat, rice, or fried sides."
  },
  "punjabi-rajma-curd-phulka": {
    notes: "Tender whole kidney beans in thick spiced Punjabi rajma curry, two thin phulkas, and fresh plain curd. No rice or non-veg ingredients."
  },
  "high-protein-veg-thali": {
    notes: "Clean fitness thali: turmeric-scrambled paneer bhurji, yellow dal tadka, two folded phulkas, and plain white curd. Plated on dark platter, no meat or sweets."
  },
  "moong-dal-cheela-tomato": {
    notes: "Two folded golden-yellow savory moong dal crepes, fresh sliced tomatoes and cucumbers. 100% plant-based vegan breakfast, no dairy, paneer, or eggs."
  },
  "soya-chunks-curry-rice": {
    notes: "Plump textured plant-based soya nuggets in rich tomato-onion curry with cilantro, steamed basmati rice. 100% vegan, no meat or dairy."
  },
  "soya-chunks-bhurji-roti": {
    notes: "Spiced scrambled plant soya granules with onions, tomatoes, and cilantro, served with two warm whole wheat rotis. Distinct plant texture, no eggs or meat."
  },
  "moong-sprouts-chaat": {
    notes: "Raw fitness salad: fresh sprouted green moong beans with visible tails, diced tomatoes, cilantro, roasted peanuts, and lemon wedge. 100% vegan."
  },
  "besan-cheela-cucumber": {
    notes: "Two folded golden-orange savory besan (gram flour) pancakes with herbs, served with crisp cucumber slices. 100% vegan, no paneer or eggs."
  },
  "bread-omelette-homestyle": {
    notes: "Authentic Indian street-style folded egg omelette with whole wheat toast inside, cut diagonally, onions, green chillies, and herbs visible. Eggetarian, no bacon or meat."
  },
  "boiled-eggs-toor-dal-rice": {
    notes: "Two halved hard-boiled eggs with bright cooked yellow yolks, yellow toor dal with cumin seasoning, and steamed basmati rice. Eggetarian gym lunch."
  },
  "boiled-eggs-chole-masala-phulka": {
    notes: "Two halved hard-boiled eggs showing clean yolks, rich dark Punjabi chole curry, and two multigrain rotis. Eggetarian high-protein meal."
  }
};

const now = new Date().toISOString();

for (const c of candidates) {
  if (reviewsMap[c.slug]) {
    c.visual_review = {
      status: "REVIEWED",
      reviewer: "Codex visual inspection of generated image",
      reviewed_at: now,
      ingredients_match: true,
      no_unrelated_ingredients: true,
      no_text_or_watermark: true,
      notes: reviewsMap[c.slug].notes
    };
  }
}

fs.writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2) + "\n");
console.log("Updated visual reviews for 13 generated candidates.");
