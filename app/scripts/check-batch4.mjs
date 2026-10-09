import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('recipe_versions')
    .select('id, slug, name, recipe_images(id)')
    .eq('status', 'PUBLISHED')
    .order('slug', { ascending: true });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const missing = data.filter(r => !r.recipe_images || r.recipe_images.length === 0);
  console.log('Total recipes:', data.length);
  console.log('Missing images:', missing.length);
  console.log('Next 20:');
  console.log(JSON.stringify(missing.slice(0, 20).map(r => ({ slug: r.slug, id: r.id, name: r.name })), null, 2));
}

run();
