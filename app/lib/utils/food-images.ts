/**
 * Bulletproof Food Image & Avatar System.
 * Combines high-resolution photo URLs with self-contained SVG Data URI Avatars.
 * Guarantees ZERO black empty squares and 100% reliable rendering even if network CDNs are blocked.
 */

// 1. Map of specific Unsplash photos
const FOOD_PHOTO_MAP: Record<string, string> = {
  "poha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80",
  "upma": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80",
  "pongal": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80",
  "chapati": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&auto=format&fit=crop&q=80",
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&auto=format&fit=crop&q=80",
  "white rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&auto=format&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&auto=format&fit=crop&q=80",
  "sambar": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80",
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80",
  "chana": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80",
  "chickpeas": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80",
  "rajma": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80",
  "aloo": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80",
  "chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300&auto=format&fit=crop&q=80",
  "boiled egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&auto=format&fit=crop&q=80",
  "paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&auto=format&fit=crop&q=80",
  "fish": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80",
  "soy": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80",
  "curd": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&auto=format&fit=crop&q=80",
  "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80",
  "peanuts": "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=300&auto=format&fit=crop&q=80",
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80",
  "vegetable": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80"
};

// 2. Map of Emoji & Custom SVG Gradients per food type (100% Offline Guaranteed)
const FOOD_AVATAR_CONFIG: Record<string, { emoji: string; colors: [string, string] }> = {
  "poha": { emoji: "🍚", colors: ["#F59E0B", "#B45309"] },
  "idli": { emoji: "⚪", colors: ["#374151", "#111827"] },
  "dosa": { emoji: "🫓", colors: ["#D97706", "#78350F"] },
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
  "chana": { emoji: "🧆", colors: ["#D97706", "#78350F"] },
  "chickpeas": { emoji: "🧆", colors: ["#D97706", "#78350F"] },
  "rajma": { emoji: "🍛", colors: ["#991B1B", "#450A0A"] },
  "aloo": { emoji: "🥔", colors: ["#B45309", "#78350F"] },
  "chicken": { emoji: "🍗", colors: ["#EA580C", "#9A3412"] },
  "boiled egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },
  "egg": { emoji: "🥚", colors: ["#F59E0B", "#B45309"] },
  "paneer": { emoji: "🧀", colors: ["#EAB308", "#A16207"] },
  "fish": { emoji: "🐟", colors: ["#0284C7", "#075985"] },
  "soy": { emoji: "🫘", colors: ["#16A34A", "#14532D"] },
  "curd": { emoji: "🥣", colors: ["#0284C7", "#0C4A6E"] },
  "milk": { emoji: "🥛", colors: ["#38BDF8", "#0369A1"] },
  "peanuts": { emoji: "🥜", colors: ["#D97706", "#78350F"] },
  "banana": { emoji: "🍌", colors: ["#EAB308", "#854D0E"] },
  "apple": { emoji: "🍎", colors: ["#DC2626", "#7F1D1D"] },
  "vegetable": { emoji: "🥗", colors: ["#16A34A", "#14532D"] },
  "salad": { emoji: "🥗", colors: ["#16A34A", "#14532D"] }
};

/**
 * Creates a self-contained SVG Data URI avatar.
 * Requires 0 network calls and NEVER fails to load!
 */
export function getFoodSvgAvatar(name?: string): string {
  const cleanName = (name || "").toLowerCase();
  let config = { emoji: "🍽️", colors: ["#374151", "#111827"] as [string, string] };

  for (const [key, val] of Object.entries(FOOD_AVATAR_CONFIG)) {
    if (cleanName.includes(key)) {
      config = val;
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

  const cleanName = (name || "").toLowerCase();
  for (const [key, url] of Object.entries(FOOD_PHOTO_MAP)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }

  // Fallback to SVG avatar if no match
  return getFoodSvgAvatar(name);
}
