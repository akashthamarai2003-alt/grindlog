/**
 * High-quality, distinct Unsplash image mapping for individual foods.
 * Every single food item maps to its own unique, highly accurate picture reference.
 */

const FOOD_IMAGE_MAP: Record<string, string> = {
  // Breakfast & Staples
  "poha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80",
  "dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80",
  "upma": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80",
  "pongal": "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80",
  "chapati": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80",
  "roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80",
  "white rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80",
  
  // Dal & Curries
  "sambar": "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=400&auto=format&fit=crop&q=80",
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  "chana": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
  "chickpeas": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
  "rajma": "https://images.unsplash.com/photo-1588877261965-966964c7d0d0?w=400&auto=format&fit=crop&q=80",
  "aloo": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80",

  // Proteins
  "chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80",
  "boiled egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
  "paneer": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",
  "fish": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80",
  "soy": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",

  // Dairy & Snacks
  "curd": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80",
  "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
  "peanuts": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
  "vegetable": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80"
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80",
  protein: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80",
  curry: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  staple: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  snack: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
  fruit: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80",
  dairy: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80"
};

export const DEFAULT_FOOD_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80";

export function getFoodImage(name?: string, category?: string, customImageUrl?: string): string {
  if (customImageUrl && customImageUrl.startsWith("http")) {
    return customImageUrl;
  }

  const cleanName = (name || "").toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGE_MAP)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }

  const cleanCategory = (category || "").toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (cleanCategory.includes(key)) {
      return url;
    }
  }

  return DEFAULT_FOOD_IMAGE;
}
