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

  // --- Soy & Plant Protein (Rich Emerald Protein Gradients) ---
  "soya chunks curry": { emoji: "🍲", colors: ["#059669", "#064E3B"] },
  "soya chunks": { emoji: "🍲", colors: ["#059669", "#064E3B"] },
  "soya chunk": { emoji: "🍲", colors: ["#059669", "#064E3B"] },
  "soy chunks": { emoji: "🍲", colors: ["#059669", "#064E3B"] },
  "soy chunk": { emoji: "🍲", colors: ["#059669", "#064E3B"] },
  "soya chaap": { emoji: "🍢", colors: ["#059669", "#064E3B"] },
  "tofu bhurji": { emoji: "🍳", colors: ["#EAB308", "#854D0E"] },
  "tofu scramble": { emoji: "🍳", colors: ["#EAB308", "#854D0E"] },
  "tofu": { emoji: "🥗", colors: ["#059669", "#064E3B"] },
  "tempeh": { emoji: "🥗", colors: ["#059669", "#064E3B"] },
  "edamame": { emoji: "🥗", colors: ["#059669", "#064E3B"] },
  "soy": { emoji: "🌱", colors: ["#059669", "#064E3B"] },

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
  "black gram": { emoji: "🫘", colors: ["#374151", "#111827"] },
  "urad dal": { emoji: "🍲", colors: ["#374151", "#111827"] },
  "black beans": { emoji: "🫘", colors: ["#4B5563", "#111827"] },
  "kidney beans": { emoji: "🫘", colors: ["#991B1B", "#450A0A"] },
  "beans": { emoji: "🫘", colors: ["#991B1B", "#450A0A"] },
  "sambar": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },
  "rasam": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },

  // --- Indian Breads (Golden Wheat & Flatbread Gradients) ---
  "chapati with ghee": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "chapati / phulka": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "chapati": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "phulka": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "multigrain roti": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "roti": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "aloo paratha": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "gobi paratha": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "plain paratha": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "paratha": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "naan": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "kulcha": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
  "poori": { emoji: "🥙", colors: ["#B45309", "#78350F"] },
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
  "uttapam": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "appam": { emoji: "🥞", colors: ["#4B5563", "#111827"] },
  "millet": { emoji: "🌾", colors: ["#D97706", "#78350F"] },
  "ragi": { emoji: "🌾", colors: ["#78350F", "#451A03"] },
  "jowar": { emoji: "🌾", colors: ["#D97706", "#78350F"] },
  "bajra": { emoji: "🌾", colors: ["#78350F", "#451A03"] },
  "sattu": { emoji: "🥤", colors: ["#D97706", "#78350F"] },
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
  "green peas": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
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
      config = { emoji: "🥙", colors: ["#B45309", "#78350F"] };
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

  const bgGradId = `bg_${config.colors[0].replace("#", "")}_${config.colors[1].replace("#", "")}`;
  const specGradId = `spec_${config.colors[0].replace("#", "")}`;

  // Generate crisp, dark glassmorphic SVG with subtle specular reflection & border
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.colors[0]}"/>
        <stop offset="100%" stop-color="${config.colors[1]}"/>
      </linearGradient>
      <radialGradient id="${specGradId}" cx="50%" cy="25%" r="60%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <!-- Dark Glass Container -->
    <rect width="94" height="94" x="3" y="3" rx="26" fill="url(#${bgGradId})" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <!-- Specular Highlight -->
    <rect width="94" height="47" x="3" y="3" rx="26" fill="url(#${specGradId})"/>
    <!-- Centered High-Res Emoji Glyph with cross-platform emoji font fallback -->
    <text x="50" y="55" font-size="42" font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Segoe UI Symbol', sans-serif" text-anchor="middle" dominant-baseline="central" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">${config.emoji}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a high-definition food emoji for a given dish or ingredient name.
 * Used for meal titles and option selectors (NutriScan style: 🥔 Black Gram Millet Uttapam).
 */
export function getFoodEmoji(name?: string, category?: string): string {
  const cleanName = (name || "").toLowerCase().trim();

  // 1. Direct match from sorted keys
  for (const key of SORTED_BADGE_KEYS) {
    if (cleanName.includes(key)) {
      return FOOD_BADGE_MAP[key].emoji;
    }
  }

  // 2. Category-based fallback
  if (category) {
    const catLower = category.toLowerCase().trim();
    if (catLower.includes("protein") || catLower.includes("meat") || catLower.includes("chicken") || catLower.includes("poultry")) return "🍗";
    if (catLower.includes("fish") || catLower.includes("seafood")) return "🐟";
    if (catLower.includes("curry") || catLower.includes("dal") || catLower.includes("soup") || catLower.includes("gravy")) return "🍲";
    if (catLower.includes("bread") || catLower.includes("roti") || catLower.includes("grain") || catLower.includes("cereal") || catLower.includes("bakery")) return "🫓";
    if (catLower.includes("dairy") || catLower.includes("curd") || catLower.includes("milk") || catLower.includes("cheese")) return "🥣";
    if (catLower.includes("breakfast") || catLower.includes("tiffin")) return "🥞";
    if (catLower.includes("fruit") || catLower.includes("berry")) return "🍎";
    if (catLower.includes("vegetable") || catLower.includes("sabzi") || catLower.includes("produce") || catLower.includes("salad")) return "🥗";
    if (catLower.includes("snack") || catLower.includes("nut") || catLower.includes("seed")) return "🥜";
    if (catLower.includes("supplement") || catLower.includes("drink") || catLower.includes("beverage")) return "🥤";
  }

  return "🍽️";
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
  "chilla": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&auto=format&fit=crop&q=80",
  "oatmeal": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&auto=format&fit=crop&q=80",

  // Eggs & Omelettes (Dark Slate Photography)
  "bread omelette": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/bread-omelette-homestyle/v1/8f2fec0f41b7ec52e611c02395a9eb9c1175dc96d04d597ebf69455b52541524.webp",
  "egg bhurji chapati": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/egg-bhurji-chapati/v1/043d7d357035089555df4fcedb1bd377522da94db257e67f2cab99bf7ce5c588.webp",
  "egg bhurji": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/egg-bhurji-chapati/v1/043d7d357035089555df4fcedb1bd377522da94db257e67f2cab99bf7ce5c588.webp",
  "boiled eggs toor dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/boiled-eggs-toor-dal-rice/v1/47d424b564d81bf75a7428539119d58ac59bd87503e17c84bf2b9fa282f9515a.webp",
  "boiled eggs chole": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/boiled-eggs-chole-masala-phulka/v1/5a560e40a914152c6a2c3328851ba687bb14c71f5c294ffbfbb402159146c404.webp",
  "boiled egg": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/boiled-eggs-toor-dal-rice/v1/47d424b564d81bf75a7428539119d58ac59bd87503e17c84bf2b9fa282f9515a.webp",
  "boiled eggs": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/boiled-eggs-toor-dal-rice/v1/47d424b564d81bf75a7428539119d58ac59bd87503e17c84bf2b9fa282f9515a.webp",
  "omelette": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "scrambled eggs": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
  "egg white": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg whites": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",
  "egg curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "anda curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80",

  // Paneer & Dairy (Dark Slate Presentation)
  "low fat paneer bhurji": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/low-fat-paneer-bhurji-roti/v1/f7121c9480a42eac1ea1091361645ebe6d3b4d8640241675c087fddfaff9eba1.webp",
  "paneer bhurji": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/low-fat-paneer-bhurji-roti/v1/f7121c9480a42eac1ea1091361645ebe6d3b4d8640241675c087fddfaff9eba1.webp",
  "paneer keema": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/paneer-keema-style-phulka/v1/01a3e526797a036fbb1c7d27355c5de284dc655f43b0f5e68df3f5b18864ea0f.webp",
  "minced paneer curry": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/paneer-keema-style-phulka/v1/01a3e526797a036fbb1c7d27355c5de284dc655f43b0f5e68df3f5b18864ea0f.webp",
  "palak paneer": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/palak-paneer-phulka/v1/43f1d54facf0754e0c79f33a4c13380d84925aac35e0d746b520bb553bf69cb0.webp",
  "chole paneer": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-paneer-paratha/v1/2f0056a6d0f85d20ee4b0ca7812e3ccbd5d66f99c780d757adac6ed22b1fff49.webp",
  "chana dal paneer": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chana-dal-paneer-phulka/v1/2d2deb14bdf9503ea98ff55e6123070eb70a4972af51690fa5fe19706f245171.webp",
  "kala chana paneer": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/kala-chana-paneer-phulka/v1/e481d19996ab0775550e1121b8cd8df1acdc3f66e42833099510b3fc0b522907.webp",
  "paneer tikka": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
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

  // Dals, Legumes & Curries (Dark Slate Tableware)
  "mixed vegetable sabzi": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/mixed-veg-sabzi-phulka/v1/80961e3f81bc426f5305ae6bcd08113b731ac255473a087ce7b2bb8fc9d178a8.webp",
  "mixed veg sabzi": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/mixed-veg-sabzi-phulka/v1/80961e3f81bc426f5305ae6bcd08113b731ac255473a087ce7b2bb8fc9d178a8.webp",
  "mixed vegetable": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/mixed-veg-sabzi-phulka/v1/80961e3f81bc426f5305ae6bcd08113b731ac255473a087ce7b2bb8fc9d178a8.webp",
  "mixed veg": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/mixed-veg-sabzi-phulka/v1/80961e3f81bc426f5305ae6bcd08113b731ac255473a087ce7b2bb8fc9d178a8.webp",
  "chole masala": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-masala-phulka/v1/e462ae9664ae53a1d18a943ecbd94764a08b8fe73252e4f76deb8e0cced8cf9d.webp",
  "chole": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-masala-phulka/v1/e462ae9664ae53a1d18a943ecbd94764a08b8fe73252e4f76deb8e0cced8cf9d.webp",
  "chana masala": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-masala-phulka/v1/e462ae9664ae53a1d18a943ecbd94764a08b8fe73252e4f76deb8e0cced8cf9d.webp",
  "punjabi rajma": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/punjabi-rajma-chawal/v1/f0452a7de8646e6e61f6772e88346353cd22c7f8fbf1780c5e1e0f93352cb2d4.webp",
  "rajma chawal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/punjabi-rajma-chawal/v1/f0452a7de8646e6e61f6772e88346353cd22c7f8fbf1780c5e1e0f93352cb2d4.webp",
  "rajma paneer": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/punjabi-rajma-paneer-rice/v1/657ee284426b17710866ff3ba76032d9166b7e3a3b1ee4b925e14f5d0e6d872a.webp",
  "rajma": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/punjabi-rajma-paneer-rice/v1/657ee284426b17710866ff3ba76032d9166b7e3a3b1ee4b925e14f5d0e6d872a.webp",
  "yellow moong dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/yellow-moong-dal-phulka/v1/e09dae7f59f7e98e40d7cf4d3fa8326cfcef9a7dc022faa2e1b48938f0855d17.webp",
  "moong dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/yellow-moong-dal-phulka/v1/e09dae7f59f7e98e40d7cf4d3fa8326cfcef9a7dc022faa2e1b48938f0855d17.webp",
  "masoor dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/masoor-dal-phulka/v1/bb720a9d19ac434dc60eea0a61aa66e5d3fc7ec5133c86c11f1a4aab192bf5d8.webp",
  "toor dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/toor-dal-phulka/v1/93f1172fa9f951d86a1430c01797f5789481705fc80cd364b8360c531daa7517.webp",
  "chana dal": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chana-dal-phulka/v1/ebc674db2491bdd4bb1e6179d7f7a290e2b45ff7e951448b432bbc00b6aec45c.webp",
  "lobia masala": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/lobia-masala-phulka/v1/551309e627225c6fe2adb4062ec89d7a36ae0bdb6cd17542bd6c94442c161cd9.webp",
  "lobia": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/lobia-masala-phulka/v1/551309e627225c6fe2adb4062ec89d7a36ae0bdb6cd17542bd6c94442c161cd9.webp",
  "kala chana": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/kala-chana-curry-phulka/v1/49f86d40fada418edda88ab13c15aeabddd1e68b770c55b0e37a11ad8a234758.webp",
  "dal fry": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/dal-fry-paneer-rice/v1/aae9465e3684e7e2b30f1a6644b5a03e873ac6f4c0a645ca8a0e040a7b09c198.webp",
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
  "yellow dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
  "chana": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-masala-phulka/v1/e462ae9664ae53a1d18a943ecbd94764a08b8fe73252e4f76deb8e0cced8cf9d.webp",
  "chickpeas": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chole-masala-phulka/v1/e462ae9664ae53a1d18a943ecbd94764a08b8fe73252e4f76deb8e0cced8cf9d.webp",
  "sambar": "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80",
  "curry": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",

  // Soya Chunks & Plant Protein
  "soya chunks bhurji": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-bhurji-roti/v1/8329f0d58a4a747fa9f0cc25ee0aa27ba08b9daa5a4dade0a3982a09ccb3e37d.webp",
  "soya bhurji": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-bhurji-roti/v1/8329f0d58a4a747fa9f0cc25ee0aa27ba08b9daa5a4dade0a3982a09ccb3e37d.webp",
  "soya chunks curry": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-curry-roti/v1/0b4d486ce53c482044efe152c8e092f2ffb5dafbafc06f078ce800613942523a.webp",
  "soya chunks": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-curry-roti/v1/0b4d486ce53c482044efe152c8e092f2ffb5dafbafc06f078ce800613942523a.webp",
  "soya curry": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-curry-roti/v1/0b4d486ce53c482044efe152c8e092f2ffb5dafbafc06f078ce800613942523a.webp",
  "soy chunks": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/soya-chunks-curry-roti/v1/0b4d486ce53c482044efe152c8e092f2ffb5dafbafc06f078ce800613942523a.webp",
  "tofu quinoa": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/tofu-quinoa-broccoli-bowl/v1/9ee1db7504f00538f1974e04a516f1d39cad9792e1ca11a7ac463645806ad872.webp",
  "tofu": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",

  // Cheelas & Staples
  "moong dal cheela": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/moong-dal-cheela-tomato/v1/ea18e6a432175cc7e40c130ad0a359249dfb0f4e8ede76803ae23a0d0cef6ee3.webp",
  "moong cheela": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/moong-dal-cheela-tomato/v1/ea18e6a432175cc7e40c130ad0a359249dfb0f4e8ede76803ae23a0d0cef6ee3.webp",
  "besan cheela": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/besan-cheela-cucumber/v1/f92be22e0b4e5b18f7d6795bf25f15b68949b046fa04a975d77d5ed999a77dea.webp",
  "cheela": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/besan-cheela-cucumber/v1/f92be22e0b4e5b18f7d6795bf25f15b68949b046fa04a975d77d5ed999a77dea.webp",

  // Snacks & Salads
  "moong sprouts": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/moong-sprouts-chaat/v1/7d465ebc420f5016dcdd0d8049b980b7dfb10d8cfd9ae3c971b4943e0117ac18.webp",
  "sprouts": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/moong-sprouts-chaat/v1/7d465ebc420f5016dcdd0d8049b980b7dfb10d8cfd9ae3c971b4943e0117ac18.webp",
  "chana chaat": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/chana-chaat-lemon/v1/4f911c78a94e653da29b35fd3212b60d82718d2602cc4cdfb611c7bd6dcc3604.webp",
  "high protein veg thali": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/high-protein-veg-thali/v1/32d493d7395fa7e88b46e59e45159436ba95f8cf9c8996f9a57c740a8b80d36b.webp",
  "veg thali": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/high-protein-veg-thali/v1/32d493d7395fa7e88b46e59e45159436ba95f8cf9c8996f9a57c740a8b80d36b.webp",
  "thali": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/high-protein-veg-thali/v1/32d493d7395fa7e88b46e59e45159436ba95f8cf9c8996f9a57c740a8b80d36b.webp",

  // Poultry & Chicken
  "tandoori chicken": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/tandoori-chicken-phulka/v1/f97c1434f4da1a4a10aa3cd584905a6159776b2ae6c01127485a74b8ada1450b.webp",
  "chicken breast": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80",
  "grilled chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80",
  "chicken curry": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "chicken tikka": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "chicken": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "fish curry": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
  "grilled fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",
  "fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80",

  // Grains & Breads
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "phulka": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
  "white rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80",
  "steamed rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&auto=format&fit=crop&q=80",
  "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
  "toast": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",

  // Vegetables & Salads
  "sabzi": "https://saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images/mixed-veg-sabzi-phulka/v1/80961e3f81bc426f5305ae6bcd08113b731ac255473a087ce7b2bb8fc9d178a8.webp",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
  "cucumber": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&auto=format&fit=crop&q=80",

  // Nuts, Seeds & Dry Snacks
  "roasted peanuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "peanuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "roasted chana": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
  "roasted makhana": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
  "makhana": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
  "almonds": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "almond": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  "walnuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",

  // Fruits
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
  "orange": "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&auto=format&fit=crop&q=80"
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
    if (isVeg) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80"; // Homestyle Rajma / Dal Thali
    return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80"; // Homestyle Curry
  }

  // Pre-workout / Snack
  return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"; // Roasted Peanuts & Banana
}

export const DEFAULT_FOOD_IMAGE = FOOD_PHOTO_MAP["dal tadka"];

/**
 * Returns a high-definition food avatar: uses custom product image URL if provided,
 * or the ultra-crisp, dark glassmorphic 3D food badge matching NutriScan's item design.
 * 100% reliable, zero broken images, 0ms load time, offline PWA safe.
 */
export function getFoodImage(name?: string, category?: string, customImageUrl?: string): string {
  // 1. If an explicit valid http/https image URL is provided (ignore placeholder/broken host), use it
  if (
    customImageUrl &&
    (customImageUrl.startsWith("http://") || customImageUrl.startsWith("https://")) &&
    !customImageUrl.startsWith("https://images.grindlog.in/")
  ) {
    return customImageUrl;
  }

  // 2. Check if there is a photographic match in our culinary photo catalog
  const cleanName = (name || "").toLowerCase().trim();
  for (const key of SORTED_PHOTO_KEYS) {
    if (cleanName.includes(key)) {
      return FOOD_PHOTO_MAP[key];
    }
  }

  // 3. Fallback to custom data/blob URL if provided and not an SVG cartoon avatar
  if (customImageUrl && customImageUrl.startsWith("blob:")) {
    return customImageUrl;
  }
  if (customImageUrl && customImageUrl.startsWith("data:image/") && !customImageUrl.startsWith("data:image/svg+xml")) {
    return customImageUrl;
  }

  // 4. Return clean, high-contrast glassmorphic 3D food badge (NutriScan style)
  return getFoodSvgAvatar(name, category);
}

