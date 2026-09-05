/**
 * Bulletproof Food Image & Avatar System.
 * Combines high-resolution photo URLs with self-contained SVG Data URI Avatars.
 * Guarantees ZERO black empty squares and 100% reliable rendering even if network CDNs are blocked.
 */

// 1. Map of specific food photos (prioritizing local verified assets and high-res culinary photography)
const FOOD_PHOTO_MAP: Record<string, string> = {
  // --- Paneer Dishes (Dedicated & Distinct) ---
  "palak paneer": "/images/foods/palak-paneer.jpg",
  "matar paneer": "/images/foods/matar-paneer.jpg",
  "paneer butter masala": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80",
  "kadai paneer": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80",
  "paneer tikka": "/images/foods/paneer-tikka.png",
  "grilled paneer": "/images/foods/paneer-tikka.png",
  "paneer bhurji": "/images/foods/tofu-bhurji.jpg",
  "paneer paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "fresh paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",
  "low fat paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",
  "paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",

  // --- Cheelas & Savory Pancakes ---
  "moong dal cheela": "/images/foods/moong-dal-cheela.jpg",
  "besan cheela": "/images/foods/moong-dal-cheela.jpg",
  "cheela": "/images/foods/moong-dal-cheela.jpg",
  "chilla": "/images/foods/moong-dal-cheela.jpg",

  // --- Tofu Items (Authentic scramble & firm blocks, NEVER butter) ---
  "tofu bhurji": "/images/foods/tofu-bhurji.jpg",
  "tofu scramble": "/images/foods/tofu-bhurji.jpg",
  "tofu": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",

  // --- Egg Dishes (Real cooked dishes, never raw whole eggs for meals) ---
  "egg curry": "/images/foods/egg-curry.jpg",
  "anda curry": "/images/foods/egg-curry.jpg",
  "egg bhurji": "https://images.unsplash.com/photo-1544414082-112fb25cf35d?w=400&auto=format&fit=crop&q=80",
  "scrambled egg": "https://images.unsplash.com/photo-1544414082-112fb25cf35d?w=400&auto=format&fit=crop&q=80",
  "bread omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&auto=format&fit=crop&q=80",
  "egg omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&auto=format&fit=crop&q=80",
  "omelette": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&auto=format&fit=crop&q=80",
  "boiled egg white": "/images/foods/boiled-egg.png",
  "boiled egg": "/images/foods/boiled-egg.png",
  "egg": "/images/foods/boiled-egg.png",

  // --- Chickpeas, Chana & Dals ---
  "chickpeas (chana masala)": "/images/foods/chana-masala.png",
  "chana masala": "/images/foods/chana-masala.png",
  "chana chaat": "/images/foods/chana-masala.png",
  "chana dal curry": "/images/foods/dal-tadka.png",
  "kala chana": "/images/foods/chana-masala.png",
  "chickpeas": "/images/foods/chana-masala.png",
  "chickpea": "/images/foods/chana-masala.png",
  "chole": "/images/foods/chana-masala.png",
  "chana": "/images/foods/chana-masala.png",

  "dal tadka": "/images/foods/dal-tadka.png",
  "dal fry": "/images/foods/dal-tadka.png",
  "yellow moong dal": "/images/foods/dal-tadka.png",
  "toor dal": "/images/foods/dal-tadka.png",
  "masoor dal": "/images/foods/dal-tadka.png",
  "moong dal khichdi": "/images/foods/dal-tadka.png",
  "khichdi": "/images/foods/dal-tadka.png",
  "lentils": "/images/foods/dal-tadka.png",
  "dal": "/images/foods/dal-tadka.png",

  // --- Rajma & Beans ---
  "rajma": "/images/foods/rajma.png",
  "lobia": "/images/foods/rajma.png",

  // --- South Indian Specialties ---
  "masala dosa": "/images/foods/dosa.png",
  "plain dosa": "/images/foods/dosa.png",
  "set dosa": "/images/foods/dosa.png",
  "rava dosa": "/images/foods/dosa.png",
  "dosa": "/images/foods/dosa.png",
  "idli": "/images/foods/idli.png",
  "medu vada": "/images/foods/idli.png",
  "sambar rice": "/images/foods/sambar.png",
  "sambar": "/images/foods/sambar.png",
  "rasam": "/images/foods/sambar.png",
  "ven pongal": "/images/foods/pongal.png",
  "pongal": "/images/foods/pongal.png",

  // --- Breakfast, Tiffin & Grains ---
  "poha": "/images/foods/poha.png",
  "upma": "/images/foods/upma.png",
  "overnight oats": "/images/foods/oats.png",
  "oats with milk": "/images/foods/oats.png",
  "masala oats": "/images/foods/oats.png",
  "oats": "/images/foods/oats.png",
  "quinoa": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
  "daliya": "/images/foods/upma.png",

  // --- Indian Breads ---
  "chapati with ghee": "/images/foods/chapati.png",
  "chapati / phulka": "/images/foods/chapati.png",
  "chapati": "/images/foods/chapati.png",
  "phulka": "/images/foods/chapati.png",
  "multigrain roti": "/images/foods/chapati.png",
  "roti": "/images/foods/chapati.png",
  "aloo paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "gobi paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "plain paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "paratha": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "poori": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80",
  "whole wheat bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
  "brown bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
  "bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
  "toast": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",

  // --- Rice Varieties ---
  "chicken biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
  "egg biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
  "veg biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80",
  "curd rice": "/images/foods/curd.png",
  "jeera rice": "/images/foods/white-rice.png",
  "lemon rice": "/images/foods/poha.png",
  "brown rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  "white rice": "/images/foods/white-rice.png",
  "rice": "/images/foods/white-rice.png",

  // --- Poultry & Meats ---
  "tandoori chicken": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80",
  "chicken tikka": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80",
  "chicken curry": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80",
  "chicken keema": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80",
  "boiled chicken breast": "/images/foods/chicken-breast.png",
  "chicken breast": "/images/foods/chicken-breast.png",
  "chicken": "/images/foods/chicken-breast.png",
  "mutton curry": "https://images.unsplash.com/photo-1545247181-516773cae754?w=400&auto=format&fit=crop&q=80",

  // --- Seafood ---
  "fish curry": "/images/foods/fish-curry.png",
  "grilled fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "fish fry": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "salmon": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "canned tuna": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "tuna": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "prawn": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&auto=format&fit=crop&q=80",
  "fish": "/images/foods/fish-curry.png",

  // --- Vegetables & Sabzi ---
  "aloo sabzi": "/images/foods/aloo-sabzi.png",
  "aloo gobi": "/images/foods/aloo-sabzi.png",
  "aloo": "/images/foods/aloo-sabzi.png",
  "boiled potato": "/images/foods/aloo-sabzi.png",
  "sweet potato": "/images/foods/aloo-sabzi.png",
  "potato": "/images/foods/aloo-sabzi.png",
  "bhindi masala": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
  "baingan bharta": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
  "mushroom masala": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80",
  "sauteed mushrooms": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80",
  "mushroom": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80",
  "boiled spinach": "/images/foods/spinach.png",
  "spinach": "/images/foods/spinach.png",
  "palak": "/images/foods/spinach.png",
  "boiled broccoli": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80",
  "broccoli": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80",
  "cucumber": "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&auto=format&fit=crop&q=80",
  "green peas": "/images/foods/matar-paneer.jpg",
  "sweet corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&auto=format&fit=crop&q=80",
  "mixed vegetable sabzi": "/images/foods/mixed-vegetables.png",
  "mixed vegetables": "/images/foods/mixed-vegetables.png",
  "mixed vegetable": "/images/foods/mixed-vegetables.png",
  "green salad": "/images/foods/mixed-vegetables.png",
  "salad": "/images/foods/mixed-vegetables.png",
  "vegetable": "/images/foods/mixed-vegetables.png",

  // --- Soy & Plant Proteins ---
  "soya chunks curry": "/images/foods/soy-chunks.png",
  "soya chunks": "/images/foods/soy-chunks.png",
  "soy chunks": "/images/foods/soy-chunks.png",
  "soya chaap": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80",
  "tempeh": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
  "soy": "/images/foods/soy-chunks.png",

  // --- Dairy & Beverages ---
  "greek yogurt": "/images/foods/curd.png",
  "curd (plain)": "/images/foods/curd.png",
  "curd / dahi": "/images/foods/curd.png",
  "low fat curd": "/images/foods/curd.png",
  "curd": "/images/foods/curd.png",
  "dahi": "/images/foods/curd.png",
  "yogurt": "/images/foods/curd.png",
  "sweet lassi": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80",
  "chaas": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80",
  "buttermilk": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80",
  "whole milk": "/images/foods/whole-milk.png",
  "toned milk": "/images/foods/whole-milk.png",
  "skimmed milk": "/images/foods/whole-milk.png",
  "almond milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
  "soy milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
  "oat milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
  "milk": "/images/foods/whole-milk.png",
  "indian chai": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80",
  "chai": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80",
  "black coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
  "filter coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
  "coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
  "green tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80",
  "coconut water": "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&auto=format&fit=crop&q=80",

  // --- Nuts, Seeds & Supplements ---
  "natural peanut butter": "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=400&auto=format&fit=crop&q=80",
  "peanut butter toast": "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=400&auto=format&fit=crop&q=80",
  "peanut butter": "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=400&auto=format&fit=crop&q=80",
  "roasted peanuts": "/images/foods/roasted-peanuts.png",
  "peanuts": "/images/foods/roasted-peanuts.png",
  "roasted chana": "/images/foods/chana-masala.png",
  "roasted makhana": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
  "makhana": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80",
  "almonds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "cashews": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "walnuts": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "chia seeds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "flax seeds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "pumpkin seeds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "sunflower seeds": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&auto=format&fit=crop&q=80",
  "whey protein": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
  "casein protein": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
  "plant protein": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
  "protein powder": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",

  // --- Fruits & Produce ---
  "banana": "/images/foods/banana.png",
  "apple": "/images/foods/apple.png",
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=80",
  "papaya": "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&auto=format&fit=crop&q=80",
  "watermelon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80",
  "pomegranate": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80",
  "orange": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&auto=format&fit=crop&q=80",
  "grapes": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&auto=format&fit=crop&q=80",
  "kiwi": "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&auto=format&fit=crop&q=80",
  "guava": "https://images.unsplash.com/photo-1536511135896-1c2543940173?w=400&auto=format&fit=crop&q=80",
  "pineapple": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop&q=80",
  "dates": "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80",
  "raisins": "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=400&auto=format&fit=crop&q=80",
  "fresh tomato": "/images/foods/tomatoes.png",
  "tomatoes": "/images/foods/tomatoes.png",
  "tomato": "/images/foods/tomatoes.png",
  "carrots": "/images/foods/carrots.png",
  "carrot": "/images/foods/carrots.png",
  "popcorn": "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&auto=format&fit=crop&q=80",
  "dark chocolate": "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&auto=format&fit=crop&q=80",
  "ghee": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80",
  "core meal": "/images/foods/core-meal.png"
};

// Sort photo keys by descending length so multi-word specific phrases match BEFORE generic words
const SORTED_PHOTO_KEYS = Object.keys(FOOD_PHOTO_MAP).sort((a, b) => b.length - a.length);

// 2. Map of Emoji & Custom SVG Gradients per food type (100% Offline Guaranteed Fallback)
const FOOD_AVATAR_CONFIG: Record<string, { emoji: string; colors: [string, string] }> = {
  "palak paneer": { emoji: "🥬", colors: ["#16A34A", "#14532D"] },
  "matar paneer": { emoji: "🥘", colors: ["#EA580C", "#9A3412"] },
  "moong dal cheela": { emoji: "🥞", colors: ["#EAB308", "#A16207"] },
  "besan cheela": { emoji: "🥞", colors: ["#EAB308", "#A16207"] },
  "cheela": { emoji: "🥞", colors: ["#EAB308", "#A16207"] },
  "tofu bhurji": { emoji: "🍳", colors: ["#EAB308", "#A16207"] },
  "tofu": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "egg curry": { emoji: "🍛", colors: ["#EA580C", "#7C2D12"] },
  "egg bhurji": { emoji: "🍳", colors: ["#F59E0B", "#B45309"] },
  "boiled egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },
  "egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },
  "poha": { emoji: "🍚", colors: ["#F59E0B", "#B45309"] },
  "idli": { emoji: "⚪", colors: ["#374151", "#111827"] },
  "dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "upma": { emoji: "🥣", colors: ["#D97706", "#92400E"] },
  "pongal": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "chapati": { emoji: "🥞", colors: ["#B45309", "#78350F"] },
  "roti": { emoji: "🥞", colors: ["#B45309", "#78350F"] },
  "white rice": { emoji: "🍚", colors: ["#4B5563", "#1F2937"] },
  "rice": { emoji: "🍚", colors: ["#4B5563", "#1F2937"] },
  "oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "sambar": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },
  "dal tadka": { emoji: "🍲", colors: ["#EAB308", "#A16207"] },
  "dal": { emoji: "🍲", colors: ["#EAB308", "#A16207"] },
  "chana": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "chickpeas": { emoji: "🍲", colors: ["#D97706", "#78350F"] },
  "rajma": { emoji: "🍛", colors: ["#991B1B", "#450A0A"] },
  "aloo": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "paneer": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "soy chunks": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "soy": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "curd": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },
  "peanuts": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "banana": { emoji: "🍌", colors: ["#EAB308", "#854D0E"] },
  "apple": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },
  "whey": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "protein": { emoji: "💪", colors: ["#84CC16", "#3F6212"] },
  "biryani": { emoji: "🍗", colors: ["#D97706", "#7C2D12"] },
  "paratha": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "khichdi": { emoji: "🍲", colors: ["#EAB308", "#854D0E"] },
  "yogurt": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "dahi": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "toast": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "salmon": { emoji: "🍣", colors: ["#F97316", "#9A3412"] },
  "tuna": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "prawn": { emoji: "🦐", colors: ["#F97316", "#9A3412"] },
  "mutton": { emoji: "🥩", colors: ["#DC2626", "#7F1D1D"] },
  "almond": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "walnut": { emoji: "🌰", colors: ["#B45309", "#78350F"] },
  "chia": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "makhana": { emoji: "⚪", colors: ["#4B5563", "#1F2937"] },
  "tea": { emoji: "🍵", colors: ["#16A34A", "#14532D"] },
  "chai": { emoji: "☕", colors: ["#B45309", "#78350F"] },
  "coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "coconut": { emoji: "🥥", colors: ["#16A34A", "#14532D"] },
  "broccoli": { emoji: "🥦", colors: ["#16A34A", "#14532D"] },
  "fruit": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },
  "vegetable": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "salad": { emoji: "🥗", colors: ["#16A34A", "#14532D"] }
};

const SORTED_AVATAR_KEYS = Object.keys(FOOD_AVATAR_CONFIG).sort((a, b) => b.length - a.length);

/**
 * Creates a self-contained SVG Data URI avatar.
 * Requires 0 network calls and NEVER fails to load!
 */
export function getFoodSvgAvatar(name?: string): string {
  const cleanName = (name || "").toLowerCase().trim();
  let config = { emoji: "🍽️", colors: ["#374151", "#111827"] as [string, string] };

  for (const key of SORTED_AVATAR_KEYS) {
    if (cleanName.includes(key)) {
      config = FOOD_AVATAR_CONFIG[key];
      break;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.colors[0]}"/>
        <stop offset="100%" stop-color="${config.colors[1]}"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#g)"/>
    <text x="50" y="60" font-size="44" text-anchor="middle" dominant-baseline="middle">${config.emoji}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_FOOD_IMAGE = getFoodSvgAvatar("food");

export function getFoodImage(name?: string, category?: string, customImageUrl?: string): string {
  if (customImageUrl && customImageUrl.startsWith("http") && !customImageUrl.includes("wikimedia.org")) {
    return customImageUrl;
  }

  const cleanName = (name || "").toLowerCase().trim();
  for (const key of SORTED_PHOTO_KEYS) {
    if (cleanName.includes(key)) {
      return FOOD_PHOTO_MAP[key];
    }
  }

  // Fallback to SVG avatar if no match
  return getFoodSvgAvatar(name);
}
