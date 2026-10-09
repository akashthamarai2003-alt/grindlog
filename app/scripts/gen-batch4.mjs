import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('recipes').select('id, slug, status, current_version_id, recipe_versions!fk_recipes_current_version_ownership(id, name, recipe_images(id, url))').eq('status', 'PUBLISHED').order('slug', { ascending: true });
  if (error) { console.error(error); return; }
  
  const pending = data.filter(r => {
    const images = r.recipe_versions?.recipe_images || [];
    if (images.length === 0) return true;
    return !images.some(img => img.url.includes('saoesvkicojsvuytcfid.supabase.co/storage/v1/object/public/food-photos/recipe-images'));
  });
  
  console.log('Total pending recipes for AI generation:', pending.length);
  const next20 = pending.slice(0, 20);
  
  let configStr = `export const BATCH_4_RECIPES = [\n`;
  next20.forEach((r, i) => {
    configStr += `  {\n`;
    configStr += `    index: ${i + 1},\n`;
    configStr += `    slug: "${r.slug}",\n`;
    configStr += `    name: "${r.recipe_versions.name.replace(/"/g, '\\"')}",\n`;
    configStr += `    recipe_version_id: "${r.recipe_versions.id}",\n`;
    configStr += `    prompt: ""\n`;
    configStr += `  }${i < 19 ? ',' : ''}\n`;
  });
  configStr += `];\n`;
  
  fs.writeFileSync('scripts/batch4-config.mjs', configStr);
  console.log('Generated scripts/batch4-config.mjs with corrected query!');
}

run();
