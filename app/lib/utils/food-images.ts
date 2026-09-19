/**
 * Unified Glassmorphic Food Icon Badge System (Option 1).
 * 
 * Provides 100% visual consistency, zero broken external links, 
 * instant 0ms load time, and full offline PWA resilience across GrindLog.
 */

interface BadgeConfig {
  emoji: string;
  colors: [string, string];
}

const FOOD_BADGE_MAP: Record<string, BadgeConfig> = {
  // --- Poultry & Chicken (Warm Flame & Tandoor Gradients) ---
  "chicken breast": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "grilled chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "chicken tikka": { emoji: "🍢", colors: ["#DC2626", "#7F1D1D"] },
  "tandoori chicken": { emoji: "🍗", colors: ["#DC2626", "#7C2D12"] },
  "chicken curry": { emoji: "🍛", colors: ["#EA580C", "#7C2D12"] },
  "chicken keema": { emoji: "🥘", colors: ["#EA580C", "#7C2D12"] },
  "chicken biryani": { emoji: "🍗", colors: ["#D97706", "#7C2D12"] },
  "chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "mutton curry": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },
  "mutton": { emoji: "🥩", colors: ["#B91C1C", "#450A0A"] },

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

  // --- Fish & Seafood (Ocean Cyan & Deep Blue Gradients) ---
  "fish curry": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "grilled fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "fish fry": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "salmon": { emoji: "🍣", colors: ["#EA580C", "#9A3412"] },
  "canned tuna": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "tuna": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "prawn": { emoji: "🦐", colors: ["#EA580C", "#7C2D12"] },
  "fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },

  // --- Soy & Plant Protein (Rich Emerald Protein Gradients - NO garden sprout!) ---
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
  "poori": { emoji: "🫓", colors: ["#B45309", "#78350F"] },
  "whole wheat bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "brown bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "bread": { emoji: "🍞", colors: ["#B45309", "#78350F"] },
  "toast": { emoji: "🍞", colors: ["#B45309", "#78350F"] },

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
  "masala dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "plain dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "dosa": { emoji: "🥞", colors: ["#D97706", "#78350F"] },
  "overnight oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "oats with milk": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "masala oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "oats": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "quinoa": { emoji: "🥣", colors: ["#CA8A04", "#713F12"] },
  "daliya": { emoji: "🥣", colors: ["#D97706", "#92400E"] },

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
  "salad": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "vegetable": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "aloo sabzi": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "aloo gobi": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "boiled potato": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "sweet potato": { emoji: "🍠", colors: ["#991B1B", "#450A0A"] },
  "potato": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "aloo": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "bhindi masala": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "baingan bharta": { emoji: "🍆", colors: ["#7C3AED", "#4C1D95"] },
  "mushroom masala": { emoji: "🍄", colors: ["#78350F", "#451A03"] },
  "mushroom": { emoji: "🍄", colors: ["#78350F", "#451A03"] },
  "tomatoes": { emoji: "🍅", colors: ["#DC2626", "#7F1D1D"] },
  "tomato": { emoji: "🍅", colors: ["#DC2626", "#7F1D1D"] },
  "carrots": { emoji: "🥕", colors: ["#EA580C", "#9A3412"] },
  "carrot": { emoji: "🥕", colors: ["#EA580C", "#9A3412"] },

  // --- Fruits & Berries ---
  "banana": { emoji: "🍌", colors: ["#EAB308", "#854D0E"] },
  "apple": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },
  "mango": { emoji: "🥭", colors: ["#EAB308", "#854D0E"] },
  "papaya": { emoji: "🍈", colors: ["#EA580C", "#9A3412"] },
  "watermelon": { emoji: "🍉", colors: ["#DC2626", "#14532D"] },
  "pomegranate": { emoji: "🍎", colors: ["#991B1B", "#450A0A"] },
  "orange": { emoji: "🍊", colors: ["#EA580C", "#9A3412"] },
  "grapes": { emoji: "🍇", colors: ["#7C3AED", "#4C1D95"] },
  "kiwi": { emoji: "🥝", colors: ["#16A34A", "#14532D"] },
  "guava": { emoji: "🍈", colors: ["#16A34A", "#14532D"] },
  "pineapple": { emoji: "🍍", colors: ["#EAB308", "#854D0E"] },
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
  "walnuts": { emoji: "🌰", colors: ["#78350F", "#451A03"] },
  "walnut": { emoji: "🌰", colors: ["#78350F", "#451A03"] },
  "chia seeds": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "flax seeds": { emoji: "🌱", colors: ["#D97706", "#78350F"] },
  "pumpkin seeds": { emoji: "🌱", colors: ["#16A34A", "#14532D"] },
  "sunflower seeds": { emoji: "🌱", colors: ["#EAB308", "#854D0E"] },

  // --- Supplements & Fitness Fuel ---
  "whey protein": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "casein protein": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "plant protein": { emoji: "🥤", colors: ["#059669", "#064E3B"] },
  "protein powder": { emoji: "🥤", colors: ["#6366F1", "#312E81"] },
  "protein": { emoji: "💪", colors: ["#84CC16", "#3F6212"] },
  "creatine": { emoji: "⚡", colors: ["#ADFF00", "#14532D"] },

  // --- Beverages & Tea/Coffee ---
  "indian chai": { emoji: "☕", colors: ["#B45309", "#78350F"] },
  "chai": { emoji: "☕", colors: ["#B45309", "#78350F"] },
  "tea": { emoji: "🍵", colors: ["#16A34A", "#14532D"] },
  "black coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "filter coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "coffee": { emoji: "☕", colors: ["#78350F", "#451A03"] },
  "green tea": { emoji: "🍵", colors: ["#16A34A", "#14532D"] },
  "coconut water": { emoji: "🥥", colors: ["#0284C7", "#075985"] },
  "ghee": { emoji: "🧈", colors: ["#EAB308", "#854D0E"] },
  "dark chocolate": { emoji: "🍫", colors: ["#78350F", "#451A03"] },
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
    if (catLower.includes("protein") || catLower.includes("meat") || catLower.includes("chicken")) {
      config = { emoji: "🍗", colors: ["#EA580C", "#9A3412"] };
    } else if (catLower.includes("curry") || catLower.includes("dal")) {
      config = { emoji: "🍲", colors: ["#EAB308", "#854D0E"] };
    } else if (catLower.includes("bread") || catLower.includes("roti") || catLower.includes("grain")) {
      config = { emoji: "🫓", colors: ["#B45309", "#78350F"] };
    } else if (catLower.includes("dairy") || catLower.includes("curd")) {
      config = { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] };
    } else if (catLower.includes("breakfast")) {
      config = { emoji: "🥞", colors: ["#D97706", "#78350F"] };
    } else if (catLower.includes("fruit")) {
      config = { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] };
    } else if (catLower.includes("vegetable") || catLower.includes("sabzi")) {
      config = { emoji: "🥗", colors: ["#16A34A", "#14532D"] };
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

export const DEFAULT_FOOD_IMAGE = getFoodSvgAvatar("food");

export function getFoodImage(name?: string, category?: string, customImageUrl?: string): string {
  // If a valid custom image URL is provided that is not an unreliable external third-party CDN
  if (customImageUrl && customImageUrl.startsWith("http") && !customImageUrl.includes("unsplash.com") && !customImageUrl.includes("wikimedia.org")) {
    return customImageUrl;
  }

  // Unified Glassmorphic Icon Badge System (Option 1)
  return getFoodSvgAvatar(name, category);
}
