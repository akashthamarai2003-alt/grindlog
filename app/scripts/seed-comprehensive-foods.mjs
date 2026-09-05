import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "app/.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const VERIFIED_FOODS = [
  // ==========================================
  // 1. HIGH PROTEIN & SUPPLEMENTS
  // ==========================================
  { name: "Whey Protein Isolate", category: "Protein", serving_size: "1 scoop (33g)", calories: 120, protein: 27.0, carbs: 1.0, fat: 0.5, estimated_cost: 70.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Whey Protein Concentrate", category: "Protein", serving_size: "1 scoop (33g)", calories: 130, protein: 24.0, carbs: 3.0, fat: 2.0, estimated_cost: 55.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Plant Protein (Pea & Brown Rice)", category: "Protein", serving_size: "1 scoop (33g)", calories: 125, protein: 25.0, carbs: 2.0, fat: 1.5, estimated_cost: 60.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Casein Protein Powder", category: "Protein", serving_size: "1 scoop (33g)", calories: 120, protein: 24.0, carbs: 2.0, fat: 1.0, estimated_cost: 75.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Boiled Egg White", category: "Protein", serving_size: "1 large (33g)", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, estimated_cost: 6.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Boiled Egg (Whole)", category: "Protein", serving_size: "1 large (50g)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, estimated_cost: 10.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Scrambled Eggs", category: "Protein", serving_size: "2 eggs (100g)", calories: 160, protein: 13.0, carbs: 1.5, fat: 11.0, estimated_cost: 25.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Egg Omelette", category: "Protein", serving_size: "2 eggs (110g)", calories: 175, protein: 13.0, carbs: 2.0, fat: 12.0, estimated_cost: 25.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Egg Bhurji (Indian Scramble)", category: "Protein", serving_size: "2 eggs (120g)", calories: 185, protein: 13.5, carbs: 4.0, fat: 12.5, estimated_cost: 30.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Chicken Breast (Raw)", category: "Protein", serving_size: "100g raw", calories: 120, protein: 26.0, carbs: 0.0, fat: 1.5, estimated_cost: 30.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Chicken Breast (Grilled / Cooked)", category: "Protein", serving_size: "100g cooked", calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, estimated_cost: 40.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Boiled Chicken Breast", category: "Protein", serving_size: "100g cooked", calories: 150, protein: 29.0, carbs: 0.0, fat: 3.0, estimated_cost: 35.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Tandoori Chicken", category: "Protein", serving_size: "1 breast/leg (150g)", calories: 220, protein: 30.0, carbs: 3.0, fat: 9.0, estimated_cost: 110.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Chicken Tikka", category: "Protein", serving_size: "6 pieces (150g)", calories: 210, protein: 32.0, carbs: 4.0, fat: 7.0, estimated_cost: 120.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Chicken Curry (Home Style)", category: "Protein", serving_size: "1 bowl (180g)", calories: 240, protein: 24.0, carbs: 6.0, fat: 13.0, estimated_cost: 70.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Chicken Keema", category: "Protein", serving_size: "1 bowl (150g)", calories: 220, protein: 25.0, carbs: 5.0, fat: 11.0, estimated_cost: 80.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Fish Curry (Rohu / Indian Carp)", category: "Protein", serving_size: "1 bowl (150g)", calories: 210, protein: 20.0, carbs: 6.0, fat: 11.0, estimated_cost: 80.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Grilled Fish / Fish Fry", category: "Protein", serving_size: "1 piece (100g)", calories: 190, protein: 22.0, carbs: 4.0, fat: 9.0, estimated_cost: 90.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Grilled Salmon", category: "Protein", serving_size: "100g", calories: 206, protein: 22.0, carbs: 0.0, fat: 12.3, estimated_cost: 180.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Canned Tuna (in Water)", category: "Protein", serving_size: "100g drained", calories: 116, protein: 26.0, carbs: 0.0, fat: 1.0, estimated_cost: 110.0, diet_type: "non-veg", is_pg_friendly: true },
  { name: "Prawns Masala", category: "Protein", serving_size: "1 bowl (150g)", calories: 180, protein: 23.0, carbs: 5.0, fat: 7.0, estimated_cost: 130.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Mutton Curry", category: "Protein", serving_size: "1 bowl (180g)", calories: 310, protein: 22.0, carbs: 5.0, fat: 22.0, estimated_cost: 140.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Fresh Paneer (Raw)", category: "Protein", serving_size: "100g", calories: 265, protein: 18.3, carbs: 3.5, fat: 20.0, estimated_cost: 45.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Low Fat Paneer", category: "Protein", serving_size: "100g", calories: 180, protein: 25.0, carbs: 4.0, fat: 7.0, estimated_cost: 55.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Grilled Paneer / Paneer Tikka", category: "Protein", serving_size: "100g", calories: 250, protein: 17.0, carbs: 7.0, fat: 17.0, estimated_cost: 70.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Paneer Bhurji", category: "Protein", serving_size: "1 bowl (150g)", calories: 270, protein: 16.0, carbs: 6.0, fat: 20.0, estimated_cost: 65.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Soya Chunks (Raw / Dry)", category: "Protein", serving_size: "50g dry", calories: 172, protein: 26.0, carbs: 16.5, fat: 0.2, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Soya Chunks Curry (Cooked)", category: "Protein", serving_size: "1 bowl (150g)", calories: 210, protein: 22.0, carbs: 14.0, fat: 6.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Tofu (Firm)", category: "Protein", serving_size: "100g", calories: 120, protein: 13.0, carbs: 3.0, fat: 6.5, estimated_cost: 35.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Tofu Bhurji / Scramble", category: "Protein", serving_size: "1 bowl (150g)", calories: 165, protein: 14.0, carbs: 6.0, fat: 9.0, estimated_cost: 50.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Soya Chaap (Grilled / Masala)", category: "Protein", serving_size: "100g", calories: 190, protein: 16.0, carbs: 12.0, fat: 8.0, estimated_cost: 60.0, diet_type: "vegan", is_pg_friendly: false },
  { name: "Tempeh", category: "Protein", serving_size: "100g", calories: 192, protein: 20.0, carbs: 7.6, fat: 10.8, estimated_cost: 80.0, diet_type: "vegan", is_pg_friendly: true },

  // ==========================================
  // 2. INDIAN BREAKFAST & TIFFIN
  // ==========================================
  { name: "Idli", category: "Breakfast", serving_size: "2 pieces (150g)", calories: 118, protein: 4.0, carbs: 24.0, fat: 0.4, estimated_cost: 20.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Plain Dosa", category: "Breakfast", serving_size: "1 medium (100g)", calories: 168, protein: 3.9, carbs: 29.0, fat: 3.7, estimated_cost: 30.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Masala Dosa", category: "Breakfast", serving_size: "1 medium (180g)", calories: 280, protein: 5.5, carbs: 42.0, fat: 9.5, estimated_cost: 50.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Rava Dosa", category: "Breakfast", serving_size: "1 medium (120g)", calories: 210, protein: 4.5, carbs: 34.0, fat: 6.5, estimated_cost: 40.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Set Dosa", category: "Breakfast", serving_size: "2 small (140g)", calories: 190, protein: 4.2, carbs: 36.0, fat: 3.0, estimated_cost: 35.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Poha", category: "Breakfast", serving_size: "1 bowl (150g)", calories: 220, protein: 4.5, carbs: 38.0, fat: 5.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Upma", category: "Breakfast", serving_size: "1 bowl (150g)", calories: 210, protein: 4.5, carbs: 30.0, fat: 7.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Ven Pongal", category: "Breakfast", serving_size: "1 bowl (180g)", calories: 240, protein: 6.0, carbs: 36.0, fat: 8.0, estimated_cost: 35.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Moong Dal Cheela", category: "Breakfast", serving_size: "2 cheelas (140g)", calories: 220, protein: 14.0, carbs: 28.0, fat: 5.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Besan Cheela", category: "Breakfast", serving_size: "2 cheelas (140g)", calories: 210, protein: 12.0, carbs: 26.0, fat: 6.0, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Oats with Milk", category: "Breakfast", serving_size: "1 bowl (250g)", calories: 220, protein: 10.0, carbs: 34.0, fat: 5.0, estimated_cost: 30.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Masala Oats", category: "Breakfast", serving_size: "1 bowl (180g)", calories: 170, protein: 5.5, carbs: 28.0, fat: 3.8, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Overnight Oats with Chia", category: "Breakfast", serving_size: "1 jar (250g)", calories: 280, protein: 12.0, carbs: 40.0, fat: 8.0, estimated_cost: 40.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Vegetable Daliya", category: "Breakfast", serving_size: "1 bowl (180g)", calories: 185, protein: 6.0, carbs: 34.0, fat: 3.0, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Whole Wheat Bread", category: "Breakfast", serving_size: "2 slices (60g)", calories: 140, protein: 6.0, carbs: 26.0, fat: 1.8, estimated_cost: 12.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Brown Bread", category: "Breakfast", serving_size: "2 slices (60g)", calories: 135, protein: 5.5, carbs: 25.0, fat: 1.5, estimated_cost: 12.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Peanut Butter Toast", category: "Breakfast", serving_size: "1 slice + 20g PB", calories: 185, protein: 7.5, carbs: 17.0, fat: 10.0, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Bread Omelette", category: "Breakfast", serving_size: "2 slices + 1 egg", calories: 240, protein: 12.0, carbs: 28.0, fat: 8.0, estimated_cost: 35.0, diet_type: "eggetarian", is_pg_friendly: true },
  { name: "Poori", category: "Breakfast", serving_size: "2 pieces (80g)", calories: 240, protein: 4.0, carbs: 30.0, fat: 12.0, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Medu Vada", category: "Breakfast", serving_size: "1 piece (60g)", calories: 145, protein: 4.5, carbs: 14.0, fat: 8.0, estimated_cost: 20.0, diet_type: "veg", is_pg_friendly: false },

  // ==========================================
  // 3. INDIAN STAPLES & GRAINS
  // ==========================================
  { name: "Chapati / Phulka", category: "Staple", serving_size: "1 medium (40g)", calories: 105, protein: 3.2, carbs: 20.0, fat: 1.2, estimated_cost: 5.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Chapati with Ghee", category: "Staple", serving_size: "1 medium (45g)", calories: 135, protein: 3.2, carbs: 20.0, fat: 4.8, estimated_cost: 8.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Multigrain Roti", category: "Staple", serving_size: "1 medium (45g)", calories: 115, protein: 4.0, carbs: 21.0, fat: 1.5, estimated_cost: 8.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Plain Paratha", category: "Staple", serving_size: "1 paratha (70g)", calories: 210, protein: 4.5, carbs: 30.0, fat: 8.0, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Aloo Paratha", category: "Staple", serving_size: "1 paratha (120g)", calories: 260, protein: 5.5, carbs: 40.0, fat: 8.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Paneer Paratha", category: "Staple", serving_size: "1 paratha (130g)", calories: 310, protein: 13.0, carbs: 36.0, fat: 12.0, estimated_cost: 40.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Gobi Paratha", category: "Staple", serving_size: "1 paratha (120g)", calories: 230, protein: 5.0, carbs: 36.0, fat: 7.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "White Rice (Steamed)", category: "Staple", serving_size: "1 bowl cooked (150g)", calories: 195, protein: 4.0, carbs: 43.0, fat: 0.4, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Brown Rice (Cooked)", category: "Staple", serving_size: "1 bowl cooked (150g)", calories: 170, protein: 4.2, carbs: 35.0, fat: 1.4, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Jeera Rice", category: "Staple", serving_size: "1 bowl (150g)", calories: 210, protein: 4.0, carbs: 42.0, fat: 3.5, estimated_cost: 20.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Curd Rice", category: "Staple", serving_size: "1 bowl (200g)", calories: 220, protein: 6.5, carbs: 36.0, fat: 5.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Sambar Rice", category: "Staple", serving_size: "1 bowl (220g)", calories: 240, protein: 7.0, carbs: 44.0, fat: 4.0, estimated_cost: 30.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Lemon Rice", category: "Staple", serving_size: "1 bowl (180g)", calories: 230, protein: 4.5, carbs: 42.0, fat: 5.5, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Chicken Biryani", category: "Staple", serving_size: "1 plate (300g)", calories: 450, protein: 28.0, carbs: 52.0, fat: 14.0, estimated_cost: 120.0, diet_type: "non-veg", is_pg_friendly: false },
  { name: "Egg Biryani", category: "Staple", serving_size: "1 plate (300g)", calories: 380, protein: 15.0, carbs: 54.0, fat: 11.0, estimated_cost: 90.0, diet_type: "eggetarian", is_pg_friendly: false },
  { name: "Veg Biryani / Pulao", category: "Staple", serving_size: "1 plate (250g)", calories: 310, protein: 7.0, carbs: 52.0, fat: 8.5, estimated_cost: 70.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Moong Dal Khichdi", category: "Staple", serving_size: "1 bowl (200g)", calories: 230, protein: 9.0, carbs: 40.0, fat: 3.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Quinoa (Cooked)", category: "Staple", serving_size: "1 bowl (150g)", calories: 175, protein: 6.5, carbs: 31.0, fat: 2.7, estimated_cost: 45.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Boiled Sweet Potato", category: "Staple", serving_size: "1 medium (130g)", calories: 115, protein: 2.0, carbs: 27.0, fat: 0.2, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Boiled Potato", category: "Staple", serving_size: "1 medium (130g)", calories: 110, protein: 2.5, carbs: 25.0, fat: 0.2, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },

  // ==========================================
  // 4. CURRIES, DALS & GRAVIES
  // ==========================================
  { name: "Dal Tadka", category: "Curry", serving_size: "1 bowl (150g)", calories: 165, protein: 8.5, carbs: 22.0, fat: 5.0, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Dal Fry", category: "Curry", serving_size: "1 bowl (150g)", calories: 175, protein: 8.5, carbs: 21.0, fat: 6.5, estimated_cost: 30.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Yellow Moong Dal", category: "Curry", serving_size: "1 bowl (150g)", calories: 145, protein: 9.5, carbs: 22.0, fat: 2.0, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Masoor Dal (Red Lentil)", category: "Curry", serving_size: "1 bowl (150g)", calories: 155, protein: 10.0, carbs: 23.0, fat: 2.5, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Toor Dal (Arhar Dal)", category: "Curry", serving_size: "1 bowl (150g)", calories: 160, protein: 8.5, carbs: 24.0, fat: 3.0, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Chana Dal Curry", category: "Curry", serving_size: "1 bowl (150g)", calories: 180, protein: 10.5, carbs: 26.0, fat: 3.5, estimated_cost: 25.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Rajma (Kidney Beans Curry)", category: "Curry", serving_size: "1 bowl (180g)", calories: 230, protein: 13.0, carbs: 36.0, fat: 4.0, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Chole / Chana Masala", category: "Curry", serving_size: "1 bowl (180g)", calories: 250, protein: 13.5, carbs: 38.0, fat: 5.5, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Kala Chana Curry", category: "Curry", serving_size: "1 bowl (180g)", calories: 220, protein: 13.0, carbs: 34.0, fat: 4.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Lobia (Black Eyed Peas Curry)", category: "Curry", serving_size: "1 bowl (180g)", calories: 210, protein: 12.5, carbs: 34.0, fat: 3.5, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Sambar", category: "Curry", serving_size: "1 bowl (150g)", calories: 110, protein: 4.5, carbs: 18.0, fat: 2.5, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Rasam", category: "Curry", serving_size: "1 bowl (150g)", calories: 65, protein: 1.8, carbs: 11.0, fat: 1.5, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Palak Paneer", category: "Curry", serving_size: "1 bowl (180g)", calories: 240, protein: 14.0, carbs: 8.0, fat: 17.0, estimated_cost: 65.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Matar Paneer", category: "Curry", serving_size: "1 bowl (180g)", calories: 255, protein: 14.0, carbs: 14.0, fat: 16.0, estimated_cost: 60.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Kadai Paneer", category: "Curry", serving_size: "1 bowl (180g)", calories: 270, protein: 15.0, carbs: 11.0, fat: 18.0, estimated_cost: 70.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Paneer Butter Masala", category: "Curry", serving_size: "1 bowl (180g)", calories: 320, protein: 13.0, carbs: 14.0, fat: 24.0, estimated_cost: 75.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Mixed Vegetable Sabzi", category: "Curry", serving_size: "1 bowl (150g)", calories: 120, protein: 3.5, carbs: 16.0, fat: 5.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Bhindi Masala (Okra)", category: "Curry", serving_size: "1 bowl (130g)", calories: 115, protein: 2.8, carbs: 13.0, fat: 6.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Aloo Gobi", category: "Curry", serving_size: "1 bowl (150g)", calories: 145, protein: 3.5, carbs: 20.0, fat: 6.0, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Baingan Bharta (Roasted Eggplant)", category: "Curry", serving_size: "1 bowl (150g)", calories: 125, protein: 2.5, carbs: 14.0, fat: 6.5, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Mushroom Masala", category: "Curry", serving_size: "1 bowl (150g)", calories: 130, protein: 5.5, carbs: 10.0, fat: 7.5, estimated_cost: 50.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Egg Curry (2 Eggs)", category: "Curry", serving_size: "1 bowl (200g)", calories: 230, protein: 14.0, carbs: 8.0, fat: 15.0, estimated_cost: 45.0, diet_type: "eggetarian", is_pg_friendly: true },

  // ==========================================
  // 5. DAIRY & PLANT MILKS
  // ==========================================
  { name: "Whole Milk", category: "Dairy", serving_size: "1 glass (250ml)", calories: 155, protein: 8.0, carbs: 12.0, fat: 8.5, estimated_cost: 18.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Toned Milk (3% Fat)", category: "Dairy", serving_size: "1 glass (250ml)", calories: 140, protein: 8.0, carbs: 12.5, fat: 6.0, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Double Toned / Skimmed Milk", category: "Dairy", serving_size: "1 glass (250ml)", calories: 100, protein: 8.5, carbs: 13.0, fat: 1.2, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Soy Milk (Unsweetened)", category: "Dairy", serving_size: "1 glass (250ml)", calories: 95, protein: 8.5, carbs: 4.0, fat: 4.5, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Almond Milk (Unsweetened)", category: "Dairy", serving_size: "1 glass (250ml)", calories: 40, protein: 1.5, carbs: 1.5, fat: 3.0, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Oat Milk", category: "Dairy", serving_size: "1 glass (250ml)", calories: 130, protein: 3.0, carbs: 20.0, fat: 4.5, estimated_cost: 45.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Curd / Dahi (Plain)", category: "Dairy", serving_size: "1 bowl (150g)", calories: 110, protein: 5.5, carbs: 6.5, fat: 6.0, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Low Fat Curd / Dahi", category: "Dairy", serving_size: "1 bowl (150g)", calories: 85, protein: 6.5, carbs: 7.0, fat: 2.5, estimated_cost: 20.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Greek Yogurt (Plain)", category: "Dairy", serving_size: "100g", calories: 95, protein: 10.0, carbs: 4.0, fat: 4.5, estimated_cost: 45.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Chaas / Buttermilk (Salted)", category: "Dairy", serving_size: "1 glass (250ml)", calories: 55, protein: 3.2, carbs: 5.0, fat: 2.0, estimated_cost: 12.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Sweet Lassi", category: "Dairy", serving_size: "1 glass (250ml)", calories: 210, protein: 6.0, carbs: 32.0, fat: 6.5, estimated_cost: 30.0, diet_type: "veg", is_pg_friendly: false },
  { name: "Cheese Slice (Amul / Britannia)", category: "Dairy", serving_size: "1 slice (20g)", calories: 62, protein: 4.0, carbs: 0.4, fat: 5.0, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },

  // ==========================================
  // 6. NUTS, SEEDS & HEALTHY FATS
  // ==========================================
  { name: "Roasted Peanuts", category: "Nuts & Snacks", serving_size: "1 handful (30g)", calories: 175, protein: 8.0, carbs: 5.0, fat: 15.0, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Natural Peanut Butter", category: "Nuts & Snacks", serving_size: "2 tbsp (32g)", calories: 190, protein: 8.0, carbs: 6.0, fat: 16.0, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Raw Almonds", category: "Nuts & Snacks", serving_size: "1 handful (25g)", calories: 145, protein: 5.3, carbs: 5.0, fat: 12.5, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Roasted Almonds", category: "Nuts & Snacks", serving_size: "1 handful (25g)", calories: 150, protein: 5.3, carbs: 5.0, fat: 13.0, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Walnuts (Akrot)", category: "Nuts & Snacks", serving_size: "1 handful (25g)", calories: 165, protein: 3.8, carbs: 3.5, fat: 16.5, estimated_cost: 35.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Cashews (Kaju)", category: "Nuts & Snacks", serving_size: "1 handful (25g)", calories: 140, protein: 4.5, carbs: 8.0, fat: 11.0, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Pistachios (Pista)", category: "Nuts & Snacks", serving_size: "1 handful (25g)", calories: 145, protein: 5.2, carbs: 7.0, fat: 11.5, estimated_cost: 35.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Chia Seeds", category: "Nuts & Snacks", serving_size: "1 tbsp (15g)", calories: 70, protein: 2.5, carbs: 6.0, fat: 4.5, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Flax Seeds (Alsi)", category: "Nuts & Snacks", serving_size: "1 tbsp (15g)", calories: 80, protein: 2.8, carbs: 4.5, fat: 6.0, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Pumpkin Seeds", category: "Nuts & Snacks", serving_size: "1 tbsp (15g)", calories: 85, protein: 4.5, carbs: 2.5, fat: 7.0, estimated_cost: 18.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Sunflower Seeds", category: "Nuts & Snacks", serving_size: "1 tbsp (15g)", calories: 88, protein: 3.2, carbs: 3.0, fat: 7.8, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Desi Ghee", category: "Nuts & Snacks", serving_size: "1 tsp (5g)", calories: 45, protein: 0.0, carbs: 0.0, fat: 5.0, estimated_cost: 5.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Olive Oil (Extra Virgin)", category: "Nuts & Snacks", serving_size: "1 tbsp (14g)", calories: 120, protein: 0.0, carbs: 0.0, fat: 14.0, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Coconut Oil", category: "Nuts & Snacks", serving_size: "1 tbsp (14g)", calories: 120, protein: 0.0, carbs: 0.0, fat: 14.0, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Dark Chocolate (70%+)", category: "Nuts & Snacks", serving_size: "2 squares (20g)", calories: 115, protein: 1.8, carbs: 9.0, fat: 8.5, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },

  // ==========================================
  // 7. FRUITS & BERRIES
  // ==========================================
  { name: "Banana", category: "Fruit", serving_size: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, estimated_cost: 7.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Apple", category: "Fruit", serving_size: "1 medium (180g)", calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Orange / Mosambi", category: "Fruit", serving_size: "1 medium (140g)", calories: 65, protein: 1.3, carbs: 15.0, fat: 0.2, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Papaya", category: "Fruit", serving_size: "1 cup diced (150g)", calories: 60, protein: 0.8, carbs: 15.0, fat: 0.3, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Watermelon", category: "Fruit", serving_size: "1 bowl diced (200g)", calories: 60, protein: 1.2, carbs: 15.0, fat: 0.3, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Pomegranate (Anar)", category: "Fruit", serving_size: "1 bowl seeds (150g)", calories: 125, protein: 2.5, carbs: 28.0, fat: 1.8, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Guava (Amrood)", category: "Fruit", serving_size: "1 medium (100g)", calories: 68, protein: 2.5, carbs: 14.0, fat: 0.9, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Mango (Sliced)", category: "Fruit", serving_size: "1 cup sliced (165g)", calories: 100, protein: 1.4, carbs: 25.0, fat: 0.6, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Green Grapes", category: "Fruit", serving_size: "1 cup (150g)", calories: 105, protein: 1.0, carbs: 27.0, fat: 0.2, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Pineapple", category: "Fruit", serving_size: "1 cup chunks (165g)", calories: 82, protein: 0.9, carbs: 22.0, fat: 0.2, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Kiwi", category: "Fruit", serving_size: "1 medium (75g)", calories: 45, protein: 0.9, carbs: 11.0, fat: 0.4, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Medjool Dates (Khajoor)", category: "Fruit", serving_size: "2 dates (48g)", calories: 130, protein: 1.0, carbs: 36.0, fat: 0.2, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Raisins (Kishmish)", category: "Fruit", serving_size: "2 tbsp (30g)", calories: 90, protein: 1.0, carbs: 24.0, fat: 0.1, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },

  // ==========================================
  // 8. VEGETABLES & SALADS
  // ==========================================
  { name: "Boiled Broccoli", category: "Vegetables", serving_size: "1 cup (100g)", calories: 35, protein: 2.8, carbs: 7.0, fat: 0.4, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Boiled Spinach / Palak", category: "Vegetables", serving_size: "1 cup cooked (180g)", calories: 41, protein: 5.3, carbs: 6.7, fat: 0.8, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Fresh Cucumber", category: "Vegetables", serving_size: "1 whole (150g)", calories: 22, protein: 1.0, carbs: 5.0, fat: 0.2, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Fresh Tomato", category: "Vegetables", serving_size: "1 medium (100g)", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, estimated_cost: 5.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Raw Carrots", category: "Vegetables", serving_size: "1 medium (70g)", calories: 28, protein: 0.7, carbs: 6.7, fat: 0.2, estimated_cost: 8.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Green Salad with Lemon", category: "Vegetables", serving_size: "1 bowl (150g)", calories: 45, protein: 1.8, carbs: 9.0, fat: 0.4, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Moong Sprouts Salad", category: "Vegetables", serving_size: "1 bowl (150g)", calories: 140, protein: 11.0, carbs: 22.0, fat: 1.2, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Boiled Sweet Corn", category: "Vegetables", serving_size: "1 cup (150g)", calories: 135, protein: 4.5, carbs: 30.0, fat: 1.8, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Green Peas (Matar)", category: "Vegetables", serving_size: "1 cup boiled (150g)", calories: 125, protein: 8.2, carbs: 22.0, fat: 0.6, estimated_cost: 20.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Sauteed Mushrooms", category: "Vegetables", serving_size: "1 bowl (150g)", calories: 55, protein: 4.5, carbs: 6.0, fat: 2.0, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },

  // ==========================================
  // 9. SNACKS & FITNESS BEVERAGES
  // ==========================================
  { name: "Roasted Makhana (Fox Nuts)", category: "Snack", serving_size: "1 bowl (30g)", calories: 110, protein: 3.0, carbs: 22.0, fat: 0.5, estimated_cost: 25.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Roasted Chana (Dry Chickpeas)", category: "Snack", serving_size: "1 handful (30g)", calories: 110, protein: 6.5, carbs: 18.0, fat: 1.5, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Chana Chaat", category: "Snack", serving_size: "1 bowl (150g)", calories: 185, protein: 9.0, carbs: 30.0, fat: 3.5, estimated_cost: 30.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Air Popped Popcorn", category: "Snack", serving_size: "1 bowl (30g)", calories: 115, protein: 3.5, carbs: 23.0, fat: 1.2, estimated_cost: 15.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Green Tea (Unsweetened)", category: "Snack", serving_size: "1 cup (200ml)", calories: 2, protein: 0.2, carbs: 0.0, fat: 0.0, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Black Coffee", category: "Snack", serving_size: "1 cup (200ml)", calories: 2, protein: 0.3, carbs: 0.0, fat: 0.0, estimated_cost: 10.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Indian Chai with Milk", category: "Snack", serving_size: "1 cup (150ml)", calories: 75, protein: 3.0, carbs: 9.0, fat: 3.0, estimated_cost: 10.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Filter Coffee with Milk", category: "Snack", serving_size: "1 cup (150ml)", calories: 90, protein: 3.5, carbs: 11.0, fat: 3.5, estimated_cost: 15.0, diet_type: "veg", is_pg_friendly: true },
  { name: "Tender Coconut Water", category: "Snack", serving_size: "1 coconut (250ml)", calories: 48, protein: 1.5, carbs: 9.0, fat: 0.5, estimated_cost: 40.0, diet_type: "vegan", is_pg_friendly: true },
  { name: "Whey Protein Shake (with Water)", category: "Protein", serving_size: "300ml shake", calories: 125, protein: 25.0, carbs: 2.0, fat: 1.0, estimated_cost: 60.0, diet_type: "veg", is_pg_friendly: true }
];

async function seed() {
  console.log(`Starting insertion of ${VERIFIED_FOODS.length} verified foods into public.foods...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of VERIFIED_FOODS) {
    const payload = {
      name: item.name,
      category: item.category,
      serving_size: item.serving_size,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      estimated_cost: item.estimated_cost,
      diet_type: item.diet_type,
      is_pg_friendly: item.is_pg_friendly,
      is_active: true,
      source_name: "ICMR-NIN IFCT / USDA FoodData Central",
      verification_status: "approved_for_plans",
      nutrition_verified: true,
      dietary_classification_verified: true,
      cost_verification_status: "curated_estimate",
      plan_eligible: true
    };

    // Check if food already exists by name
    const { data: existing } = await supabase
      .from('foods')
      .select('id, name')
      .ilike('name', item.name)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from('foods')
        .update(payload)
        .eq('id', existing.id);

      if (updateErr) {
        console.warn(`Update failed for ${item.name}:`, updateErr.message);
      } else {
        updatedCount++;
      }
    } else {
      const { error: insertErr } = await supabase
        .from('foods')
        .insert(payload);

      if (insertErr) {
        console.warn(`Insert failed for ${item.name}:`, insertErr.message);
      } else {
        insertedCount++;
      }
    }
  }

  console.log(`✓ Seeding complete! Inserted: ${insertedCount}, Updated: ${updatedCount}, Total: ${VERIFIED_FOODS.length}`);
}

seed().catch(err => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
