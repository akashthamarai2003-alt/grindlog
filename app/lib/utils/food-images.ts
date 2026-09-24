/**
 * Unified Glassmorphic Food Icon Badge System (Option 1).
 * 
 * Provides 100% visual consistency across ALL foods in GrindLog,
 * zero broken external links, instant 0ms load time, and full offline PWA resilience.
 */

interface BadgeConfig {
  emoji: string;
  colors: [string, string];
}

const FOOD_BADGE_MAP: Record<string, BadgeConfig> = {
  // --- Poultry & Meats (Warm Flame, Tandoor & Crimson Gradients) ---
  "chicken breast": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "grilled chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "chicken tikka": { emoji: "🍢", colors: ["#DC2626", "#7F1D1D"] },
  "tandoori chicken": { emoji: "🍗", colors: ["#DC2626", "#7C2D12"] },
  "chicken curry": { emoji: "🍛", colors: ["#EA580C", "#7C2D12"] },
  "chicken keema": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },
  "chicken biryani": { emoji: "🍗", colors: ["#D97706", "#7C2D12"] },
  "chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "turkey": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "duck": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "mutton curry": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "mutton": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "beef": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "steak": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "pork": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "lamb": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "bacon": { emoji: "🥓", colors: ["#B91C1C", "#450A0A"] },
  "sausage": { emoji: "🌭", colors: ["#EA580C", "#9A3412"] },
  "meat": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },

  // --- Eggs & Egg Whites (Golden Yolk Gradients) ---
  "boiled egg white": { emoji: "🥚", colors: ["#D97706", "#78350F"] },
  "egg white": { emoji: "🥚", colors: ["#D97706", "#78350F"] },
  "boiled egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },
  "egg curry": { emoji: "🍛", colors: ["#EA580C", "#7C2D12"] },
  "anda curry": { emoji: "🍛", colors: ["#EA580C", "#7C2D12"] },
  "egg bhurji": { emoji: "🍳", colors: ["#F59E0B", "#B45309"] },
  "bread omelette": { emoji: "🍳", colors: ["#F59E0B", "#B45309"] },
  "egg omelette": { emoji: "🍳", colors: ["#F59E0B", "#B45309"] },
  "omelette": { emoji: "🍳", colors: ["#F59E0B", "#B45309"] },
  "egg biryani": { emoji: "🥚", colors: ["#D97706", "#7C2D12"] },
  "egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },

  // --- Fish & Seafood (Ocean Cyan & Deep Marine Gradients) ---
  "fish curry": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "grilled fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "fish fry": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "salmon": { emoji: "🍣", colors: ["#EA580C", "#9A3412"] },
  "canned tuna": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "tuna": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "prawn": { emoji: "🦐", colors: ["#EA580C", "#7C2D12"] },
  "shrimp": { emoji: "🦐", colors: ["#EA580C", "#7C2D12"] },
  "crab": { emoji: "🦀", colors: ["#EA580C", "#7C2D12"] },
  "lobster": { emoji: "🦞", colors: ["#EA580C", "#7C2D12"] },
  "fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "seafood": { emoji: "🐟", colors: ["#0284C7", "#075985"] },

  // --- Soy & Plant Protein (Rich Emerald Protein Gradients - NO sprout in dirt!) ---
  "soya chunks curry": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soya chunks": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soya chunk": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soy chunks": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soy chunk": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soya chaap": { emoji: "🍢", colors: ["#059669", "#064E3B"] },
  "tofu bhurji": { emoji: "🍳", colors: ["#EAB308", "#854D0E"] },
  "tofu scramble": { emoji: "🍳", colors: ["#EAB308", "#854D0E"] },
  "tofu": { emoji: "🥗", colors: ["#059669", "#064E3B"] },
  "tempeh": { emoji: "🥗", colors: ["#059669", "#064E3B"] },
  "edamame": { emoji: "🫘", colors: ["#059669", "#064E3B"] },
  "soy": { emoji: "🫘", colors: ["#059669", "#064E3B"] },

  // --- Paneer & Dairy (Golden Dairy & Ice Cyan Gradients) ---
  "paneer tikka": { emoji: "🧀", colors: ["#D97706", "#78350F"] },
  "grilled paneer": { emoji: "🧀", colors: ["#D97706", "#78350F"] },
  "palak paneer": { emoji: "🥬", colors: ["#16A34A", "#14532D"] },
  "matar paneer": { emoji: "🥘", colors: ["#EA580C", "#9A3412"] },
  "paneer butter masala": { emoji: "🥘", colors: ["#EA580C", "#9A3412"] },
  "kadai paneer": { emoji: "🥘", colors: ["#EA580C", "#9A3412"] },
  "paneer bhurji": { emoji: "🍳", colors: ["#EAB308", "#854D0E"] },
  "paneer paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "fresh paneer": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "low fat paneer": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "paneer": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "cheese": { emoji: "🧀", colors: ["#D97706", "#78350F"] },
  "cottage cheese": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "cheddar": { emoji: "🧀", colors: ["#D97706", "#78350F"] },
  "mozzarella": { emoji: "🧀", colors: ["#D97706", "#78350F"] },

  "greek yogurt": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "curd (plain)": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "curd / dahi": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "low fat curd": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "curd": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "dahi": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "yogurt": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "sweet lassi": { emoji: "🥛", colors: ["#0284C7", "#0C4A6E"] },
  "chaas": { emoji: "🥛", colors: ["#0284C7", "#0C4A6E"] },
  "buttermilk": { emoji: "🥛", colors: ["#0284C7", "#0C4A6E"] },
  "whole milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },
  "toned milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },
  "skimmed milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },
  "almond milk": { emoji: "🥛", colors: ["#D97706", "#78350F"] },
  "soy milk": { emoji: "🥛", colors: ["#059669", "#064E3B"] },
  "oat milk": { emoji: "🥛", colors: ["#CA8A04", "#713F12"] },
  "milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },

  // --- Dals & Legumes (Warm Turmeric & Earthy Spice Gradients) ---
  "yellow moong dal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "dal tadka": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "dal fry": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "toor dal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "masoor dal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "moong dal khichdi": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "moong dal cheela": { emoji: "🥞", colors: ["#EAB308", "#854D0E"] },
  "besan cheela": { emoji: "🥞", colors: ["#EAB308", "#854D0E"] },
  "cheela": { emoji: "🥞", colors: ["#EAB308", "#854D0E"] },
  "chilla": { emoji: "🥞", colors: ["#EAB308", "#854D0E"] },
  "khichdi": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "lentils": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "lentil": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "dal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },

  "chickpeas (chana masala)": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chana masala": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chana chaat": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chole": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "kala chana": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chickpeas": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chana": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "rajma": { emoji: "🍛", colors: ["#991B1B", "#450A0A"] },
  "lobia": { emoji: "🍛", colors: ["#991B1B", "#450A0A"] },
  "black beans": { emoji: "🫘", colors: ["#4B5563", "#111827"] },
  "kidney beans": { emoji: "🫘", colors: ["#991B1B", "#450A0A"] },
  "beans": { emoji: "🫘", colors: ["#991B1B", "#450A0A"] },
  "sambar": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },
  "rasam": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },

  // --- Indian Breads (Golden Wheat & Flatbread Gradients) ---
  "chapati with ghee": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "chapati / phulka": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "chapati": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "phulka": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "multigrain roti": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "roti": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "aloo paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "gobi paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "plain paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "naan": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "kulcha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "poori": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "whole wheat bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "brown bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "toast": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "sandwich": { emoji: "🥪", colors: ["#B45309", "#78350F"] },
  "burger": { emoji: "🍔", colors: ["#B45309", "#78350F"] },
  "wrap": { emoji: "🌯", colors: ["#B45309", "#78350F"] },
  "roll": { emoji: "🌯", colors: ["#B45309", "#78350F"] },
  "pizza": { emoji: "🍕", colors: ["#EA580C", "#7C2D12"] },

  // --- Rice & Grains (Aromatic Rice & Breakfast Grains) ---
  "white rice": { emoji: "🍚", colors: ["#4B5563", "#1F2937"] },
  "brown rice": { emoji: "🍚", colors: ["#78350F", "#451A03"] },
  "jeera rice": { emoji: "🍚", colors: ["#4B5563", "#1F2937"] },
  "lemon rice": { emoji: "🍚", colors: ["#F59E0B", "#B45309"] },
  "curd rice": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "rice": { emoji: "🍚", colors: ["#4B5563", "#1F2937"] },
  "veg biryani": { emoji: "🍚", colors: ["#D97706", "#7C2D12"] },
  "biryani": { emoji: "🍗", colors: ["#D97706", "#7C2D12"] },
  "poha": { emoji: "🍚", colors: ["#F59E0B", "#B45309"] },
  "upma": { emoji: "🥣", colors: ["#D97706", "#92400E"] },
  "ven pongal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "pongal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "idli": { emoji: "⚪", colors: ["#4B5563", "#111827"] },
  "medu vada": { emoji: "🥯", colors: ["#D97706", "#78350F"] },
  "vada": { emoji: "🥯", colors: ["#D97706", "#78350F"] },
  "masala dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "plain dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "pasta": { emoji: "🍝", colors: ["#D97706", "#78350F"] },
  "noodles": { emoji: "🍜", colors: ["#D97706", "#78350F"] },
  "noodle": { emoji: "🍜", colors: ["#D97706", "#78350F"] },
  "maggi": { emoji: "🍜", colors: ["#D97706", "#78350F"] },
  "overnight oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "oats with milk": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "masala oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "quinoa": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "daliya": { emoji: "🥣", colors: ["#D97706", "#92400E"] },
  "cereal": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "cornflakes": { emoji: "🥣", colors: ["#EAB308", "#854D0E"] },

  // --- Vegetables & Sabzi (Lush Garden Greens) ---
  "boiled spinach": { emoji: "🥬", colors: ["#16A34A", "#14532D"] },
  "spinach": { emoji: "🥬", colors: ["#16A34A", "#14532D"] },
  "palak": { emoji: "🥬", colors: ["#16A34A", "#14532D"] },
  "boiled broccoli": { emoji: "🥦", colors: ["#16A34A", "#14532D"] },
  "broccoli": { emoji: "🥦", colors: ["#16A34A", "#14532D"] },
  "cucumber": { emoji: "🥒", colors: ["#16A34A", "#14532D"] },
  "green peas": { emoji: "🫛", colors: ["#16A34A", "#14532D"] },
  "sweet corn": { emoji: "🌽", colors: ["#EAB308", "#854D0E"] },
  "mixed vegetable sabzi": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "mixed vegetables": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "mixed vegetable": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "green salad": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "sprouts": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "salad": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "vegetable": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "sabzi": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "avocado": { emoji: "🥑", colors: ["#16A34A", "#14532D"] },
  "aloo sabzi": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "aloo gobi": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "boiled potato": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "sweet potato": { emoji: "🍠", colors: ["#991B1B", "#450A0A"] },
  "potato": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "aloo": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "bhindi masala": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "bhindi": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "baingan bharta": { emoji: "🍆", colors: ["#7C3AED", "#4C1D95"] },
  "baingan": { emoji: "🍆", colors: ["#7C3AED", "#4C1D95"] },
  "eggplant": { emoji: "🍆", colors: ["#7C3AED", "#4C1D95"] },
  "mushroom masala": { emoji: "🍄", colors: ["#78350F", "#451A03"] },
  "mushroom": { emoji: "🍄", colors: ["#78350F", "#451A03"] },
  "tomatoes": { emoji: "🍅", colors: ["#DC2626", "#7F1D1D"] },
  "tomato": { emoji: "🍅", colors: ["#DC2626", "#7F1D1D"] },
  "carrots": { emoji: "🥕", colors: ["#EA580C", "#9A3412"] },
  "carrot": { emoji: "🥕", colors: ["#EA580C", "#9A3412"] },
  "capsicum": { emoji: "🫑", colors: ["#16A34A", "#14532D"] },
  "onion": { emoji: "🧅", colors: ["#78350F", "#451A03"] },
  "garlic": { emoji: "🧄", colors: ["#4B5563", "#1F2937"] },
  "ginger": { emoji: "🧄", colors: ["#78350F", "#451A03"] },

  // --- Fruits & Berries ---
  "banana": { emoji: "🍌", colors: ["#EAB308", "#854D0E"] },
  "apple": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },
  "mango": { emoji: "🥭", colors: ["#EAB308", "#854D0E"] },
  "papaya": { emoji: "🍈", colors: ["#EA580C", "#9A3412"] },
  "watermelon": { emoji: "🍉", colors: ["#DC2626", "#14532D"] },
  "pomegranate": { emoji: "🍎", colors: ["#991B1B", "#450A0A"] },
  "orange": { emoji: "🍊", colors: ["#EA580C", "#9A3412"] },
  "grapes": { emoji: "🍇", colors: ["#7C3AED", "#4C1D95"] },
  "strawberry": { emoji: "🍓", colors: ["#DC2626", "#7F1D1D"] },
  "blueberry": { emoji: "🫐", colors: ["#7C3AED", "#4C1D95"] },
  "berry": { emoji: "🫐", colors: ["#7C3AED", "#4C1D95"] },
  "kiwi": { emoji: "🥝", colors: ["#16A34A", "#14532D"] },
  "guava": { emoji: "🍈", colors: ["#16A34A", "#14532D"] },
  "pineapple": { emoji: "🍍", colors: ["#EAB308", "#854D0E"] },
  "lemon": { emoji: "🍋", colors: ["#EAB308", "#854D0E"] },
  "lime": { emoji: "🍋", colors: ["#16A34A", "#14532D"] },
  "dates": { emoji: "🌰", colors: ["#78350F", "#451A03"] },
  "raisins": { emoji: "🍇", colors: ["#78350F", "#451A03"] },
  "fruit": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },

  // --- Nuts, Seeds & Dry Fruits ---
  "natural peanut butter": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "peanut butter": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "roasted peanuts": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "peanuts": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "peanut": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "roasted chana": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "roasted makhana": { emoji: "⚪", colors: ["#4B5563", "#1F2937"] },
  "makhana": { emoji: "⚪", colors: ["#4B5563", "#1F2937"] },
  "almonds": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "almond": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "cashews": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "cashew": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "walnuts": { emoji: "🌰", colors: ["#78350F", "#451A03"] },
  "walnut": { emoji: "🌰", colors: ["#78350F", "#451A03"] },
  "pistachio": { emoji: "🥜", colors: ["#16A34A", "#14532D"] },
  "chia seeds": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "flax seeds": { emoji: "🌱", colors: ["#D97706", "#78350F"] },
  "pumpkin seeds": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "sunflower seeds": { emoji: "🌱", colors: ["#EAB308", "#854D0E"] },
  "nuts": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "seeds": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },

  // --- Supplements & Fitness Fuel ---
  "whey protein": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "casein protein": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "plant protein": { emoji: "🥤", colors: ["#059669", "#064E3B"] },
  "protein powder": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "protein bar": { emoji: "🍫", colors: ["#78350F", "#451A03"] },
  "protein": { emoji: "💪", colors: ["#84CC16", "#3F6212"] },
  "creatine": { emoji: "⚡", colors: ["#ADFF00", "#14532D"] },
  "pre workout": { emoji: "⚡", colors: ["#ADFF00", "#14532D"] },
  "bcaa": { emoji: "⚡", colors: ["#ADFF00", "#14532D"] },

  // --- Beverages & Tea/Coffee ---
  "indian chai": { emoji: "☕", colors: ["#B45309", "#78350F"] },
  "chai": { emoji: "☕", colors: ["#B45309", "#78350F"] },
  "tea": { emoji: "🍵", colors: ["#16A34A", "#14532D"] },
  "black coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "filter coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "green tea": { emoji: "🍵", colors: ["#16A34A", "#14532D"] },
  "coconut water": { emoji: "🥥", colors: ["#0284C7", "#075985"] },
  "water": { emoji: "💧", colors: ["#0284C7", "#075985"] },
  "juice": { emoji: "🧃", colors: ["#EA580C", "#9A3412"] },
  "shake": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "smoothie": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },

  // --- Fats, Oils & Sweets ---
  "olive oil": { emoji: "🫒", colors: ["#16A34A", "#14532D"] },
  "mustard oil": { emoji: "🫒", colors: ["#CA8A04", "#713F12"] },
  "oil": { emoji: "🫒", colors: ["#CA8A04", "#713F12"] },
  "ghee": { emoji: "🧈", colors: ["#EAB308", "#854D0E"] },
  "butter": { emoji: "🧈", colors: ["#EAB308", "#854D0E"] },
  "honey": { emoji: "🍯", colors: ["#D97706", "#78350F"] },
  "dark chocolate": { emoji: "🍫", colors: ["#78350F", "#451A03"] },
  "chocolate": { emoji: "🍫", colors: ["#78350F", "#451A03"] },
  "ice cream": { emoji: "🍨", colors: ["#0284C7", "#0C4A6E"] },
  "cookie": { emoji: "🍪", colors: ["#B45309", "#78350F"] },
  "biscuit": { emoji: "🍪", colors: ["#B45309", "#78350F"] },
  "core meal": { emoji: "🍱", colors: ["#16A34A", "#14532D"] },
};

// Sort badge keys by descending length so multi-word keys match first
const SORTED_BADGE_KEYS = Object.keys(FOOD_BADGE_MAP).sort((a, b) => b.length - a.length);

/**
 * Creates a self-contained, high-resolution SVG Data URI glassmorphic badge.
 * 100% offline, zero network latency, zero broken image risk!
 */
export function getFoodSvgAvatar(name?: string, category?: string): string {
  const cleanName = (name || "").toLowerCase().trim();
  let config: BadgeConfig = { emoji: "🍽️", colors: ["#1E293B", "#0F172A"] };

  // 1. Specific dish or ingredient name match
  for (const key of SORTED_BADGE_KEYS) {
    if (cleanName.includes(key)) {
      config = FOOD_BADGE_MAP[key];
      break;
    }
  }

  // 2. Category-based fallback if no specific food matched
  if (config.emoji === "🍽️" && category) {
    const catLower = category.toLowerCase().trim();
    if (catLower.includes("protein") || catLower.includes("meat") || catLower.includes("chicken") || catLower.includes("poultry")) {
      config = { emoji: "🍗", colors: ["#EA580C", "#9A3412"] };
    } else if (catLower.includes("fish") || catLower.includes("seafood")) {
      config = { emoji: "🐟", colors: ["#0284C7", "#075985"] };
    } else if (catLower.includes("curry") || catLower.includes("dal") || catLower.includes("soup") || catLower.includes("gravy")) {
      config = { emoji: "🍲", colors: ["#EAB308", "#854D0E"] };
    } else if (catLower.includes("bread") || catLower.includes("roti") || catLower.includes("grain") || catLower.includes("cereal") || catLower.includes("bakery")) {
      config = { emoji: "🫓", colors: ["#B45309", "#78350F"] };
    } else if (catLower.includes("dairy") || catLower.includes("curd") || catLower.includes("milk") || catLower.includes("cheese")) {
      config = { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] };
    } else if (catLower.includes("breakfast") || catLower.includes("tiffin")) {
      config = { emoji: "🥞", colors: ["#D97706", "#78350F"] };
    } else if (catLower.includes("fruit") || catLower.includes("berry")) {
      config = { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] };
    } else if (catLower.includes("vegetable") || catLower.includes("sabzi") || catLower.includes("produce") || catLower.includes("salad")) {
      config = { emoji: "🥗", colors: ["#16A34A", "#14532D"] };
    } else if (catLower.includes("snack") || catLower.includes("nut") || catLower.includes("seed")) {
      config = { emoji: "🥜", colors: ["#D97706", "#78350F"] };
    } else if (catLower.includes("supplement") || catLower.includes("drink") || catLower.includes("beverage")) {
      config = { emoji: "🥤", colors: ["#6366F1", "#312E81"] };
    }
  }

  // Generate crisp, dark glassmorphic SVG with subtle specular reflection & border
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.colors[0]}"/>
        <stop offset="100%" stop-color="${config.colors[1]}"/>
      </linearGradient>
      <radialGradient id="spec" cx="50%" cy="25%" r="60%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <!-- Dark Glass Container -->
    <rect width="96" height="96" x="2" y="2" rx="26" fill="url(#bg)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
    <!-- Specular Highlight -->
    <rect width="96" height="48" x="2" y="2" rx="26" fill="url(#spec)"/>
    <!-- Centered High-Res Emoji Glyph -->
    <text x="50" y="56" font-size="44" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));">${config.emoji}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// --- Curated High-Definition Food & Dish Photography (WebP / CDN) ---
export const FOOD_PHOTO_MAP: Record<string, string> = {
  // Breakfasts & Tiffins
  "poha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
  "upma": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
  "masala dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
  "pongal": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80",
  "besan chilla": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "cheela": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "chilla": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&auto=format&fit=crop&q=80",
  "oatmeal": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&auto=format&fit=crop&q=80",
  "sprouts": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "moong sprouts": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",

  // Eggs & Egg Dishes
  "egg bhurji": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "bread omelette": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "omelette": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "scrambled eggs": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "boiled egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "boiled eggs": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg white": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg whites": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "anda curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",

  // Paneer & Dairy
  "paneer bhurji": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
  "paneer tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
  "palak paneer": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
  "matar paneer": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "paneer curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
  "curd": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80",
  "dahi": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80",
  "yogurt": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80",
  "greek yogurt": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&auto=format&fit=crop&q=80",
  "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
  "chaas": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
  "buttermilk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",

  // Dals, Legumes & Curries
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "yellow dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "moong dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "rajma": "https://images.unsplash.com/photo-1588877261965-966964c7d0d0?w=600&auto=format&fit=crop&q=80",
  "chana masala": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "chole": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "chana": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "chickpeas": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "sambar": "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=600&auto=format&fit=crop&q=80",
  "curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",

  // Poultry & Fish
  "chicken breast": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80",
  "grilled chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80",
  "chicken curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "chicken tikka": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
  "chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80",
  "fish curry": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
  "grilled fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
  "fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",

  // Plant Proteins & Soya
  "soya chunks": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "soy chunks": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "tofu": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",

  // Grains & Breads
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "phulka": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  "white rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop&q=80",
  "steamed rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&auto=format&fit=crop&q=80",
  "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
  "toast": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",

  // Vegetables & Salads
  "mixed vegetables": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "sabzi": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
  "cucumber": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80",

  // Nuts, Seeds & Dry Snacks
  "roasted peanuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  "peanuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
  "roasted chana": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  "roasted makhana": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "makhana": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
  "almonds": "https://images.unsplash.com/photo-1508061252445-564bb2bc2265?w=600&auto=format&fit=crop&q=80",
  "almond": "https://images.unsplash.com/photo-1508061252445-564bb2bc2265?w=600&auto=format&fit=crop&q=80",
  "walnuts": "https://images.unsplash.com/photo-1508061252445-564bb2bc2265?w=600&auto=format&fit=crop&q=80",

  // Fruits
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
  "orange": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80"
};

const SORTED_PHOTO_KEYS = Object.keys(FOOD_PHOTO_MAP).sort((a, b) => b.length - a.length);

/**
 * Returns a high-definition, appetizing hero banner photograph for any prepared meal or dish.
 * Matches dish name first, then meal category and dietary preference.
 */
export function getMealHeroPhoto(mealType: string, mealName?: string, diet?: string): string {
  const cleanName = (mealName || "").toLowerCase().trim();
  const cleanType = (mealType || "").toLowerCase().trim();
  const isVeg = (diet || "").toLowerCase().includes("veg") && !(diet || "").toLowerCase().includes("non");
  const isEgg = (diet || "").toLowerCase().includes("egg");

  // 1. Check if the dish title specifically matches any curated photo
  for (const key of SORTED_PHOTO_KEYS) {
    if (cleanName.includes(key)) {
      return FOOD_PHOTO_MAP[key];
    }
  }

  // 2. Default hero banners suited to meal slot & dietary style
  if (cleanType.includes("breakfast")) {
    if (isEgg) return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80"; // Egg Bhurji / Omelette
    if (isVeg) return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80"; // Desi Poha
    return "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80";
  }

  if (cleanType.includes("lunch")) {
    if (isVeg) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"; // Dal Tadka & Rice Thali
    return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80"; // Warm Phulkas with Curry
  }

  if (cleanType.includes("dinner")) {
    if (isVeg) return "https://images.unsplash.com/photo-1588877261965-966964c7d0d0?w=800&auto=format&fit=crop&q=80"; // Rajma Chawal
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"; // Homestyle Curry
  }

  // Pre-workout / Snack
  return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"; // Roasted Peanuts & Banana
}

export const DEFAULT_FOOD_IMAGE = FOOD_PHOTO_MAP["dal tadka"];

/**
 * Returns a high-definition food photograph if available, or falls back to
 * the clean glassmorphic SVG badge for 100% reliability and zero broken links.
 */
export function getFoodImage(name?: string, category?: string, customImageUrl?: string): string {
  // 1. If an explicit valid user or catalog image URL is provided, use it
  if (customImageUrl && (customImageUrl.startsWith("http://") || customImageUrl.startsWith("https://") || customImageUrl.startsWith("data:") || customImageUrl.startsWith("blob:"))) {
    return customImageUrl;
  }

  // 2. Match against curated high-definition food photo dictionary
  const cleanName = (name || "").toLowerCase().trim();
  for (const key of SORTED_PHOTO_KEYS) {
    if (cleanName.includes(key)) {
      return FOOD_PHOTO_MAP[key];
    }
  }

  // 3. Fallback to resilient glassmorphic SVG badge (0ms load, offline safe)
  return getFoodSvgAvatar(name, category);
}

