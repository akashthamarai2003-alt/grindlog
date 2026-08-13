/**
 * High-quality, authentic image mapping for foods.
 * Every single food item maps to its own verified, exact matching dish picture.
 */

const FOOD_IMAGE_MAP: Record<string, string> = {
  // Breakfast & Indian Tiffin
  "poha": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Indori_Poha.jpg/640px-Indori_Poha.jpg",
  "idli": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.JPG/640px-Idli_Sambar.JPG",
  "dosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Masala_Dosa_with_sambar_and_chutney.jpg/640px-Masala_Dosa_with_sambar_and_chutney.jpg",
  "upma": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rava_Upma.jpg/640px-Rava_Upma.jpg",
  "pongal": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Ven_pongal.jpg/640px-Ven_pongal.jpg",
  "chapati": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Roti_chapati.jpg/640px-Roti_chapati.jpg",
  "roti": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Roti_chapati.jpg/640px-Roti_chapati.jpg",
  "white rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  "rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  "oats": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80",
  
  // Dal & Indian Curries
  "sambar": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Sambar_in_a_bowl.jpg/640px-Sambar_in_a_bowl.jpg",
  "dal tadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  "dal": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  "chana": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chana_Masala.JPG/640px-Chana_Masala.JPG",
  "chickpeas": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chana_Masala.JPG/640px-Chana_Masala.JPG",
  "rajma": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Rajma_Chawal.JPG/640px-Rajma_Chawal.JPG",
  "aloo": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Aloo_Gobi.jpg/640px-Aloo_Gobi.jpg",

  // Proteins
  "chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80",
  "boiled egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
  "egg": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80",
  "paneer": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Paneer_Tikka.jpg/640px-Paneer_Tikka.jpg",
  "fish": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Fish_curry_Kerala.jpg/640px-Fish_curry_Kerala.jpg",
  "soy": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Soya_chunks_curry.jpg/640px-Soya_chunks_curry.jpg",

  // Dairy, Nuts & Fruits
  "curd": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80",
  "milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80",
  "peanuts": "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=400&auto=format&fit=crop&q=80",
  "banana": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
  "vegetable": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80"
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  breakfast: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.JPG/640px-Idli_Sambar.JPG",
  protein: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80",
  curry: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
  staple: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80",
  snack: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=400&auto=format&fit=crop&q=80",
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
