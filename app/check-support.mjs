import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('support_messages').select('*');
  console.log("All messages:", data?.length);

  // let's try to query as a specific user using an anon client and JWT
  // actually just query the db directly
  const { data: q2, error: err2 } = await supabase.rpc('get_policies'); // this failed before
  
  // Try to get definition of support_messages using rest if possible? No.
}
run();
