import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FOOD_PHOTOS = [
  { name: "poha", url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80" },
  { name: "upma", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80" },
  { name: "pongal", url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80" },
  { name: "idli", url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80" },
  { name: "dosa", url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80" },
  { name: "chapati", url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80" },
  { name: "roti", url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80" },
  { name: "rice", url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80" },
  { name: "oats", url: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&auto=format&fit=crop&q=80" },
  { name: "sambar", url: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=400&auto=format&fit=crop&q=80" },
  { name: "dal tadka", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80" },
  { name: "dal", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80" },
  { name: "chana", url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80" },
  { name: "rajma", url: "https://images.unsplash.com/photo-1588877261965-966964c7d0d0?w=400&auto=format&fit=crop&q=80" },
  { name: "aloo", url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80" },
  { name: "chicken", url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80" },
  { name: "boiled egg", url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80" },
  { name: "egg", url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=80" },
  { name: "paneer", url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80" },
  { name: "fish", url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80" },
  { name: "soy chunks", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80" },
  { name: "curd", url: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&auto=format&fit=crop&q=80" },
  { name: "milk", url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
  { name: "peanuts", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80" },
  { name: "banana", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80" },
  { name: "apple", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80" },
  { name: "mixed vegetables", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80" }
];

async function syncPhotos() {
  console.log("Ensuring 'food-photos' storage bucket exists in Supabase...");
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some(b => b.name === 'food-photos');
  
  if (!exists) {
    const { error: bucketError } = await supabase.storage.createBucket('food-photos', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    if (bucketError) {
      console.warn("Bucket create notice (may already exist):", bucketError.message);
    } else {
      console.log("Created 'food-photos' public storage bucket.");
    }
  } else {
    console.log("Bucket 'food-photos' already exists.");
  }

  console.log(`Syncing ${FOOD_PHOTOS.length} curated food photos to Supabase Storage...`);

  for (const item of FOOD_PHOTOS) {
    try {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${slug}.jpg`;

      console.log(`Downloading photo for: ${item.name}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.warn(`Failed to download ${item.name}: ${res.statusText}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      console.log(`Uploading ${filename} to Supabase Storage 'food-photos'...`);
      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`Upload error for ${item.name}:`, uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('food-photos')
        .getPublicUrl(filename);

      console.log(`✓ Stored in Supabase: ${publicUrl}`);

      // Optionally update foods table image_url
      await supabase
        .from('foods')
        .update({ image_url: publicUrl })
        .ilike('name', `%${item.name}%`);
    } catch (err) {
      console.error(`Error processing ${item.name}:`, err.message);
    }
  }

  console.log("All food photos synced successfully to Supabase Storage!");
}

syncPhotos();
